// Gesture Detection
export function detectGesture(landmarks) {
    // Calculate finger states (extended or curled)
    function isFingerExtended(landmarks, fingerTip, fingerPip) {
        const tip = landmarks[fingerTip];
        const pip = landmarks[fingerPip];
        const wrist = landmarks[0];
        
        // Finger is extended if tip is farther from wrist than pip
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
    
    // FIST: No fingers extended
    if (extendedCount === 0) {
        return 'FIST';
    }
    
    // POINT: Only index finger extended
    if (index && !middle && !ring && !pinky) {
        return 'POINT';
    }
    
    // OPEN_PALM: All fingers extended (4 or more)
    if (extendedCount >= 4) {
        return 'OPEN_PALM';
    }
    
    return 'NONE';
}

// Send gesture to backend
let lastSentGesture = 'NONE';
export async function sendGestureToBackend(gesture) {
    // Only send if gesture changed to reduce network traffic
    if (gesture !== lastSentGesture) {
        lastSentGesture = gesture;
        // Show visual feedback for gesture detection
        if (gesture !== 'NONE') {
            showGestureFeedback(gesture);
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

function showGestureFeedback(gesture) {
    // This function would need to be implemented or imported
    console.log('Gesture detected:', gesture);
}
