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
        import cv2
        import mediapipe as mp
        import time

        # How much bigger the hand's bounding box must get to count as a "punch".
        # 1.5 means 50% larger than the previous (resting) area.
        AREA_THRESHOLD_MULTIPLIER = 1.5


        class GestureRecognizer:
            """
            Simple hand gesture recognizer using MediaPipe Hands.

            Recognized static gestures: FIST, OPEN_PALM, POINT, BANDO, NONE
            Recognized dynamic gesture: PUNCH (detected by a sudden increase
            in the hand bounding-box area while in a fist).

            The interface is small so other parts of the project can call
            `process(frame)` and get a tuple: (gesture_str, landmarks_for_draw, frame).
            """

            def __init__(self, max_hands=1, min_detect_conf=0.7):
                # MediaPipe setup. Keep these objects around for repeated frames.
                self.mp_hands = mp.solutions.hands
                self.mp_drawing = mp.solutions.drawing_utils
                self.hands = self.mp_hands.Hands(
                    max_num_hands=max_hands,
                    min_detection_confidence=min_detect_conf
                )

                # Memory for simple dynamic detection (punch detection uses area changes)
                self.last_area = 0.0
                self.last_gesture = "NONE"

            def _get_static_gesture(self, hand_landmarks):
                """Return a best-effort static pose label for a single hand.

                The method checks whether fingers appear curled or extended and
                maps that to a small set of labels used across the game.
                """
                lm = hand_landmarks.landmark
                H = self.mp_hands.HandLandmark

                # Simple heuristics: compare fingertip height to MCP joint height.
                index_curled = lm[H.INDEX_FINGER_TIP].y > lm[H.INDEX_FINGER_MCP].y
                middle_curled = lm[H.MIDDLE_FINGER_TIP].y > lm[H.MIDDLE_FINGER_MCP].y
                ring_curled = lm[H.RING_FINGER_TIP].y > lm[H.RING_FINGER_MCP].y
                pinky_curled = lm[H.PINKY_TIP].y > lm[H.PINKY_MCP].y

                # Interpret commonly used poses:
                if index_curled and middle_curled and ring_curled and pinky_curled:
                    return "FIST"
                if (not index_curled and not middle_curled and
                    not ring_curled and not pinky_curled):
                    return "OPEN_PALM"
                if (not index_curled and middle_curled and
                    ring_curled and pinky_curled):
                    return "POINT"
                if ring_curled and middle_curled:
                    # Two-finger combination we call 'BANDO' in this project
                    return "BANDO"
                return "NONE"

            def _get_hand_area(self, hand_landmarks):
                """Compute a simple bounding-box area for the hand (normalized coords).

                This is used for detecting quick forward motion (a punch) by
                watching for a sudden increase in area.
                """
                lm = hand_landmarks.landmark
                min_x, max_x = 1.0, 0.0
                min_y, max_y = 1.0, 0.0

                for p in lm:
                    if p.x < min_x: min_x = p.x
                    if p.x > max_x: max_x = p.x
                    if p.y < min_y: min_y = p.y
                    if p.y > max_y: max_y = p.y

                width = max_x - min_x
                height = max_y - min_y
                return max(width * height, 0.0)

            def process(self, frame):
                """Process one BGR frame and return (gesture, landmarks, frame).

                - `gesture` is a short string like 'FIST', 'PUNCH', 'OPEN_PALM', etc.
                - `landmarks` is the MediaPipe landmarks object (or None) for drawing.
                - `frame` is the possibly-flipped BGR frame (kept for convenience).
                """
                # Mirror the frame so it feels natural to the user.
                frame = cv2.flip(frame, 1)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.hands.process(rgb)

                final_gesture = "NONE"
                draw_landmarks = None

                if results.multi_hand_landmarks:
                    # Use the first detected hand for gameplay input.
                    hand_landmarks = results.multi_hand_landmarks[0]
                    draw_landmarks = hand_landmarks

                    static = self._get_static_gesture(hand_landmarks)
                    area = self._get_hand_area(hand_landmarks)

                    # Default to the static pose unless we detect a punch.
                    final_gesture = static

                    # Punch detection: while in a fist, a rapid area increase -> PUNCH
                    if (static == "FIST" and
                        self.last_area > 0 and
                        area > (self.last_area * AREA_THRESHOLD_MULTIPLIER) and
                        self.last_gesture != "PUNCH"):

                        final_gesture = "PUNCH"

                    # Only update the "resting" area when we're not in a punch so a
                    # single forward thrust doesn't trigger repeated punches.
                    if final_gesture != "PUNCH":
                        self.last_area = area

                    self.last_gesture = final_gesture
                else:
                    # No hand visible: reset short-term state so the next hand starts fresh.
                    self.last_area = 0.0
                    self.last_gesture = "NONE"

                return final_gesture, draw_landmarks, frame


        if __name__ == '__main__':
            # Small manual test runner. Run the file directly to open a camera
            # window showing the detected static gesture for debugging.
            print("Archmage CV test - press 'q' to quit")
            recognizer = GestureRecognizer()
            cap = cv2.VideoCapture(0)

            try:
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        print("Failed to read from camera, exiting")
                        break

                    gesture, landmarks, display = recognizer.process(frame)

                    # Draw landmarks and label to help debugging.
                    if landmarks is not None:
                        recognizer.mp_drawing.draw_landmarks(
                            display, landmarks, recognizer.mp_hands.HAND_CONNECTIONS)

                        # Put the gesture text near the top-left corner.
                        cv2.putText(display, gesture, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                                    1.0, (0, 200, 0), 2, cv2.LINE_AA)

                    cv2.imshow('Archmage CV Test', display)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break

            finally:
                cap.release()
                cv2.destroyAllWindows()

