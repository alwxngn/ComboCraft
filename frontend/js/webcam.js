import { detectGesture, sendGestureToBackend } from './gesture-detection.js';

export let lastHandPosition = null;

export function setLastHandPosition(position) {
    lastHandPosition = position;
}

// Function to start webcam with hand tracking and background removal
export function startWebcam() {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('output-canvas');
    const canvasCtx = canvasElement.getContext('2d');

    let segmentationMask = null;

    // Initialize MediaPipe Selfie Segmentation
    const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
    });

    selfieSegmentation.setOptions({
        modelSelection: 1, // 0 for general, 1 for landscape (better quality)
    });

    selfieSegmentation.onResults((results) => {
        segmentationMask = results.segmentationMask;
    });

    // Initialize MediaPipe Hands
    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
        // Set canvas size to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Apply background removal if mask is available
        if (segmentationMask) {
            canvasCtx.globalCompositeOperation = 'copy';
            canvasCtx.filter = 'none';
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasElement.width;
            tempCanvas.height = canvasElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
            
            canvasCtx.drawImage(tempCanvas, 0, 0);
        } else {
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        }

        canvasCtx.globalCompositeOperation = 'source-over';

        // Draw hand landmarks and track hand position
        if (results.multiHandLandmarks) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, 
                    {color: '#00FF00', lineWidth: 3});
                drawLandmarks(canvasCtx, landmarks, 
                    {color: '#FF0000', lineWidth: 1, radius: 3});
                
                const wrist = landmarks[0];
                lastHandPosition = {
                    x: wrist.x * canvasElement.width,
                    y: wrist.y * canvasElement.height
                };
                
                const gesture = detectGesture(landmarks);
                sendGestureToBackend(gesture);
            }
        } else {
            sendGestureToBackend('NONE');
        }
        canvasCtx.restore();
    });

    // Start camera
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await selfieSegmentation.send({image: videoElement});
            await hands.send({image: videoElement});
        },
        width: 600,
        height: 700
    });
    
    camera.start().then(() => {
        console.log('📹 Webcam with hand tracking and background removal started!');
    }).catch((error) => {
        console.error('Error accessing webcam:', error);
        alert('Could not access webcam. Please allow camera permissions.');
    });
}
