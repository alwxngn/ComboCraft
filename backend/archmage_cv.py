import cv2
import mediapipe as mp
import time

# --- 1. CV SETUP (Now at the top) ---
# This code now runs only ONCE when the server imports it.
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)
cap = cv2.VideoCapture(1) # Using camera 1


def _get_gesture_from_landmarks(hand_landmarks):
    """
    Helper function: Takes MediaPipe landmarks and returns a gesture string.
    (This is Alan's original logic, just moved into a helper function)
    """
    landmarks = hand_landmarks.landmark
    
    # --- Finger Curl Status ---
    index_curled = landmarks[mp_hands.HandLandmark.INDEX_FINGER_TIP].y > landmarks[mp_hands.HandLandmark.INDEX_FINGER_MCP].y
    middle_curled = landmarks[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y > landmarks[mp_hands.HandLandmark.MIDDLE_FINGER_MCP].y
    ring_curled = landmarks[mp_hands.HandLandmark.RING_FINGER_TIP].y > landmarks[mp_hands.HandLandmark.RING_FINGER_MCP].y
    pinky_curled = landmarks[mp_hands.HandLandmark.PINKY_TIP].y > landmarks[mp_hands.HandLandmark.PINKY_MCP].y
    
    # --- Gesture Logic ---
    if index_curled and middle_curled and ring_curled and pinky_curled:
        return "FIST"
    if not index_curled and not middle_curled and not ring_curled and not pinky_curled:
        return "OPEN_PALM"
    if middle_curled and ring_curled and pinky_curled:
        return "POINT"
    if middle_curled and ring_curled:
        return "BANDO"

    return "NONE"


# --- 2. THE SERVER'S FUNCTION (THE "API") ---
# This is the *only* function your server will call.
def get_current_gesture():
    """
    Grabs ONE frame, processes it, and returns a gesture string.
    This is the "library" function that the server can call.
    """
    ret, frame = cap.read()
    if not ret:
        # print("Error: Can't receive frame.")
        return "NONE"
        
    # --- Run the CV magic on one frame ---
    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    # --- Get the gesture ---
    if results.multi_hand_landmarks:
        # Just use the first hand it sees
        hand_landmarks = results.multi_hand_landmarks[0]
        current_gesture = _get_gesture_from_landmarks(hand_landmarks)
        return current_gesture

    # Default state
    return "NONE"


# --- 3. ALAN'S TEST BLOCK (FOR HIM TO RUN) ---
# This code will NOT run when your server imports the file.
# It will ONLY run if Alan runs `python backend/archmage_cv.py`
if __name__ == '__main__':
    print("--- Archmage Test View ---")
    print("Running this file directly shows the CV debug window.")
    print("Press 'q' to quit.")

    # This is Alan's original loop, now safe in a test block
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Can't receive frame. Exiting ...")
            break
            
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                current_gesture = _get_gesture_from_landmarks(hand_landmarks)
                
                wrist_coords = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
                text_x = int(wrist_coords.x * frame.shape[1] - 50)
                text_y = int(wrist_coords.y * frame.shape[0] + 50)
                
                cv2.putText(frame, current_gesture, (text_x, text_y), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

                mp_drawing.draw_landmarks(
                    frame, 
                    hand_landmarks, 
                    mp_hands.HAND_CONNECTIONS)

        cv2.imshow('Archmage View (Test Mode)', frame)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()