import cv2
import mediapipe as mp

# --- MediaPipe Setup ---
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
# This is the main "Hands" object. You can tune parameters here.
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

# --- Gesture Definition Function ---
# (Moved this function *before* the loop)
def get_current_gesture(hand_landmarks):
    """
    Takes MediaPipe landmarks and returns a gesture string.
    """
    # Get all 21 landmarks
    landmarks = hand_landmarks.landmark
    
    # --- Finger Curl Status ---
    # We check if the tip of the finger is "below" (higher Y value) 
    # the knuckle. This means it's curled.
    
    # Check 4 fingers (index, middle, ring, pinky)
    index_curled = landmarks[mp_hands.HandLandmark.INDEX_FINGER_TIP].y > landmarks[mp_hands.HandLandmark.INDEX_FINGER_MCP].y
    middle_curled = landmarks[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y > landmarks[mp_hands.HandLandmark.MIDDLE_FINGER_MCP].y
    ring_curled = landmarks[mp_hands.HandLandmark.RING_FINGER_TIP].y > landmarks[mp_hands.HandLandmark.RING_FINGER_MCP].y
    pinky_curled = landmarks[mp_hands.HandLandmark.PINKY_TIP].y > landmarks[mp_hands.HandLandmark.PINKY_MCP].y
    
    
    # --- Gesture Logic ---
    # A "FIST" is when all four fingers are curled.
    if index_curled and middle_curled and ring_curled and pinky_curled:
        return "FIST"
        
    # An "OPEN_PALM" is when all four fingers are NOT curled.
    if not index_curled and not middle_curled and not ring_curled and not pinky_curled:
        return "OPEN_PALM"
    
    if middle_curled and ring_curled and pinky_curled:
        return "POINT"
    if middle_curled and ring_curled:
        return "BANDO"

    
    # Default state
    return "NONE"

# --- Main Webcam Loop ---

# Using camera 1, as you specified
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Can't receive frame. Exiting ...")
        break
        
    # --- Your Magic Starts Here ---
    
    # 1. Flip the frame horizontally (for a natural "mirror" view)
    frame = cv2.flip(frame, 1)
    
    # 2. Convert color from BGR (OpenCV) to RGB (MediaPipe)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # 3. Process the frame to find hands
    results = hands.process(rgb_frame)

    # 4. Draw the hand landmarks if a hand is detected
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            
            # --- THIS IS THE NEW PART ---
            # 1. Get the gesture string
            current_gesture = get_gesture(hand_landmarks)
            
            # 2. Draw the gesture text on the screen
            # Get the coordinates for the text (e.g., near the wrist)
            wrist_coords = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
            text_x = int(wrist_coords.x * frame.shape[1] - 50)
            text_y = int(wrist_coords.y * frame.shape[0] + 50)
            
            cv2.putText(frame, current_gesture, (text_x, text_y), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            # --- END OF NEW PART ---

            # 3. Draw the skeleton (your original code)
            mp_drawing.draw_landmarks(
                frame, 
                hand_landmarks, 
                mp_hands.HAND_CONNECTIONS)

    # --- End of Magic ---

    cv2.imshow('Archmage View', frame)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()