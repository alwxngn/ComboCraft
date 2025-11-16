// Gesture Detection Module - Hand tracking and gesture recognition

function detectGesture(landmarks) {
    function isFingerExtended(landmarks, fingerTip, fingerPip) {
        const tip = landmarks[fingerTip];
        const pip = landmarks[fingerPip];
        const wrist = landmarks[0];
        const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const pipDist = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
        return tipDist > pipDist * 1.1;
    }
    
    const thumb = isFingerExtended(landmarks, 4, 3);
    const index = isFingerExtended(landmarks, 8, 6);
    const middle = isFingerExtended(landmarks, 12, 10);
    const ring = isFingerExtended(landmarks, 16, 14);
    const pinky = isFingerExtended(landmarks, 20, 18);
    
    const extendedCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;
    
    if (!index && !middle && !ring && !pinky) {
        const thumbTip = landmarks[4];
        const thumbMCP = landmarks[2];
        const thumbIP = landmarks[3];
        const thumbPointingUp = thumbTip.y < thumbMCP.y - 0.05;
        const thumbExtendedOut = Math.abs(thumbTip.x - thumbIP.x) > 0.03;
        if (thumbPointingUp && thumbExtendedOut) {
            return 'THUMBS_UP';
        }
    }
    
    if (extendedCount === 0) {
        return 'FIST';
    }
    
    if (index && !middle && !ring && !pinky) {
        return 'POINT';
    }
    
    if (extendedCount >= 4) {
        return 'OPEN_PALM';
    }
    
    return 'NONE';
}

let lastSentGesture = 'NONE';

async function sendGestureToBackend(gesture) {
    if (gesture !== lastSentGesture) {
        lastSentGesture = gesture;
        if (gesture !== 'NONE' && window.VisualEffects && window.VisualEffects.showGestureFeedback) {
            window.VisualEffects.showGestureFeedback(gesture);
        }
        try {
            await fetch('http://localhost:5001/set_gesture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gesture: gesture })
            });
        } catch (error) {
            console.error('Error sending gesture:', error);
        }
    }
}

function startWebcam() {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('output-canvas');
    const canvasCtx = canvasElement.getContext('2d');
    let segmentationMask = null;

    const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
    });

    selfieSegmentation.setOptions({
        modelSelection: 1,
    });

    selfieSegmentation.onResults((results) => {
        segmentationMask = results.segmentationMask;
    });

    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

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

        if (results.multiHandLandmarks) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const gesture = detectGesture(landmarks);
                
                if (window.VisualEffects && window.VisualEffects.drawSpellCircle) {
                    window.VisualEffects.drawSpellCircle(canvasCtx, landmarks, gesture, canvasElement.width, canvasElement.height);
                }
                
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, 
                    {color: '#00FF00', lineWidth: 3});
                drawLandmarks(canvasCtx, landmarks, 
                    {color: '#FF0000', lineWidth: 1, radius: 3});
                
                const wrist = landmarks[0];
                if (window.GameState) {
                    window.GameState.setLastHandPosition({
                        x: wrist.x * canvasElement.width,
                        y: wrist.y * canvasElement.height
                    });
                }
                
                sendGestureToBackend(gesture);
            }
        } else {
            sendGestureToBackend('NONE');
        }
        canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await selfieSegmentation.send({image: videoElement});
            await hands.send({image: videoElement});
        },
        width: 600,
        height: 700
    });
    
    camera.start().then(() => {
        console.log('📹 Webcam started!');
    }).catch((error) => {
        console.error('Error accessing webcam:', error);
        alert('Could not access webcam. Please allow camera permissions.');
    });
}

window.GestureDetection = {
    detectGesture,
    sendGestureToBackend,
    startWebcam,
    getLastSentGesture: () => lastSentGesture
};

