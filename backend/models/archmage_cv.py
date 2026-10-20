import cv2
import mediapipe as mp
import time

# --- NEW PUNCH THRESHOLD ---
AREA_THRESHOLD_MULTIPLIER = 1.5

class _GestureRecognizer: # Changed to _ to show it's "private"
    def __init__(self, max_hands = 2, min_detect_conf=0.7):
        # --- MediaPipe Setup ---
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            max_num_hands=max_hands,
            min_detection_confidence=min_detect_conf
        )
        
        # --- State (Memory) Variables ---
        self.last_area = 0 
        self.last_gesture = "NONE"

    def _get_static_gesture(self, hand_landmarks):
        landmarks = hand_landmarks.landmark
        
        index_curled = landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_TIP].y > landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_MCP].y
        middle_curled = landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y > landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_MCP].y
        ring_curled = landmarks[self.mp_hands.HandLandmark.RING_FINGER_TIP].y > landmarks[self.mp_hands.HandLandmark.RING_FINGER_MCP].y
        pinky_curled = landmarks[self.mp_hands.HandLandmark.PINKY_TIP].y > landmarks[self.mp_hands.HandLandmark.PINKY_MCP].y
        
        # Check for thumbs up (thumb extended upward, other fingers curled)
        thumb_tip = landmarks[self.mp_hands.HandLandmark.THUMB_TIP]
        thumb_mcp = landmarks[self.mp_hands.HandLandmark.THUMB_MCP]
        # Thumb is extended upward if tip is above MCP (thumb is pointing up)
        thumb_extended_up = thumb_tip.y < thumb_mcp.y
        
        # Thumb is also extended outward (to the side)
        thumb_ip = landmarks[self.mp_hands.HandLandmark.THUMB_IP]
        thumb_extended_out = abs(thumb_tip.x - thumb_ip.x) > 0.05  # Thumb is extended to the side
        
        # Thumbs up: thumb extended (up or out) AND all other fingers curled
        if (thumb_extended_up or thumb_extended_out) and index_curled and middle_curled and ring_curled and pinky_curled:
            return "THUMBS_UP"
        
        if index_curled and middle_curled and ring_curled and pinky_curled:
            return "FIST"
        if not index_curled and not middle_curled and not ring_curled and not pinky_curled:
            return "OPEN_PALM"
        if not index_curled and middle_curled and ring_curled and pinky_curled:
            return "POINT"
        if ring_curled and middle_curled:
            return "BANDO"
        return "NONE"

    def _get_hand_area(self, hand_landmarks):
        landmarks = hand_landmarks.landmark
        min_x, max_x = 1.0, 0.0
        min_y, max_y = 1.0, 0.0
        
        for lm in landmarks:
            if lm.x < min_x: min_x = lm.x
            if lm.x > max_x: max_x = lm.x
            if lm.y < min_y: min_y = lm.y
            if lm.y > max_y: max_y = lm.y
            
        width = max_x - min_x
        height = max_y - min_y
        return width * height

    def process_frame(self, frame):
        # (This is Alan's "process" logic, slightly modified)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)

        final_gesture = "NONE"

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            
            static_gesture = self._get_static_gesture(hand_landmarks)
            current_area = self._get_hand_area(hand_landmarks)
            
            final_gesture = static_gesture # Default
            
            if (static_gesture == "FIST" and 
                self.last_area > 0 and
                current_area > (self.last_area * AREA_THRESHOLD_MULTIPLIER) and
                self.last_gesture != "PUNCH"):
                
                final_gesture = "PUNCH"
            
            if final_gesture != "PUNCH":
                self.last_area = current_area
            
            self.last_gesture = final_gesture
            
        else:
            self.last_area = 0
            self.last_gesture = "NONE"

        return final_gesture

# --- THIS IS THE NEW "LIBRARY" API FOR THE SERVER ---

# 1. We initialize the camera and recognizer ONCE when the file is imported
_cap = cv2.VideoCapture(0) # Using camera 0
_recognizer = _GestureRecognizer()

def get_gesture():
    """
    This is the *only* function the server needs to call.
    It grabs one frame, processes it, and returns the gesture string.
    """
    ret, frame = _cap.read()
    if not ret:
        return "NONE" # Camera failed
    
    # Flip the frame
    frame = cv2.flip(frame, 1)
    
    # Process the frame and get the gesture
    gesture = _recognizer.process_frame(frame)
    
    return gesture

# --- END OF "LIBRARY" API ---


# --- Standalone test: run this file directly ---
# This code only runs when this file is executed directly.
# It does not run when another module imports it.
if __name__ == '__main__':
    print("--- Archmage Test View (Area Punch) ---")
    print("Running this file directly shows the CV debug window.")
    print("Press 'q' to quit.")
    
    # We have to create a *separate* recognizer and cap for this test
    # so it doesn't interfere with the server's one.
    test_recognizer = _GestureRecognizer()
    test_cap = cv2.VideoCapture(0) 

    while True:
        ret, frame = test_cap.read()
        if not ret:
            break
        
        display_frame = cv2.flip(frame, 1)
        # We re-run the logic here for the visual debug
        # (This is just for Alan's test window)
        
        rgb_frame = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
        results = test_recognizer.hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                gesture = test_recognizer._get_static_gesture(hand_landmarks)
                
                wrist_coords = hand_landmarks.landmark[test_recognizer.mp_hands.HandLandmark.WRIST]
                text_x = int(wrist_coords.x * display_frame.shape[1] - 50)
                text_y = int(wrist_coords.y * display_frame.shape[0] + 50)
                
                cv2.putText(display_frame, gesture, (text_x, text_y), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                
                test_recognizer.mp_drawing.draw_landmarks(
                    display_frame, 
                    hand_landmarks, 
                    test_recognizer.mp_hands.HAND_CONNECTIONS)

        cv2.imshow('Archmage View (Test Mode)', display_frame)
        
        if cv2.waitKey(1) == ord('q'):
            break

    test_cap.release()
    cv2.destroyAllWindows()
