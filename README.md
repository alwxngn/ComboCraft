<h1 align="center">ComboCraft</h1>

<p align="center"><b>Make a fist to throw a fireball, open your palm for ice, point to call lightning, and chain gestures into combos to bring down a three-phase demon boss, all with nothing but a webcam.</b></p>

<p align="center">
  <a href="https://devpost.com/software/combocraft-azuynr"><img src="https://img.shields.io/badge/Winner-1st%20Place%20Overall%20%C2%B7%20QuackHacks%202025-gold?style=for-the-badge" alt="1st Place Overall, QuackHacks 2025"></a>
</p>

<p align="center">
  <a href="https://devpost.com/software/combocraft-azuynr">Devpost</a> ·
  <a href="https://www.quackhacks.org/quackpost/quackhacks-two/projects/8ea0a309-b515-4329-9189-7f8c0b1ab435">QuackHacks project page</a> ·
  <a href="https://www.youtube.com/watch?v=xNuD9hViZFQ">Demo video</a> ·
  <a href="#run-locally">Run locally</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5_Canvas-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/MediaPipe_Hands-0097A7?logo=google&logoColor=white" alt="MediaPipe Hands">
  <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/scikit--learn_(experiment)-F7931E?logo=scikitlearn&logoColor=white" alt="scikit-learn (offline experiment)">
</p>

<p align="center"><img width="860" alt="ComboCraft title screen" src="https://github.com/user-attachments/assets/f0af6b36-a2aa-4c19-87fa-1727a9e2dff9" /></p>

**1st Place Overall at QuackHacks 2025 ([QuackHacks 2.0](https://www.quackhacks.org/quackpost/quackhacks-two/projects/8ea0a309-b515-4329-9189-7f8c0b1ab435), University of Oregon).**

## Why it's cool

ComboCraft turns your hand into the controller. MediaPipe tracks 21 hand landmarks through the webcam, and a lightweight rule-based classifier in the browser reads which fingers are extended to recognize a fist, an open palm, or a pointed finger. Each gesture casts a spell. Switching from one gesture to another triggers a combo such as Explosion or Healing Light. A small Flask game server runs the mana economy, combos, cooldowns, and timed weakness events, while the browser handles a boss that changes phase at 66% and 33% health. It's a complete game loop built in a weekend, from tutorial to finisher and defeat stats.

## Highlights

- **1st Place Overall** at QuackHacks 2025.
- **3 gesture spells and 3 two-gesture combos**, recognized in the browser from MediaPipe's 21 hand landmarks.
- **Server-side game rules:** 100 max mana regenerating at 12/s, spell costs of 15–40, and fire/ice weakness events that last 7 s with a 10 s cooldown.
- **3-phase boss** (phase changes at 66% and 33% HP) with idle, walk, cleave, hit, and death sprite animations, plus a finisher sequence.
- **Full game flow:** start page with Easy/Medium/Hard, instructions, an interactive tutorial, battle, a victory/defeat screen with spell-usage stats, and replay.
- **Offline ML experiment:** a scikit-learn Random Forest gesture classifier with its own data-collection and training scripts.

## Features

- **Gesture spells.** Gestures are classified in the browser from the 21 MediaPipe hand landmarks:

  | Gesture | Spell |
  |---|---|
  | FIST | Fireball |
  | OPEN_PALM | Ice Shard |
  | POINT (index finger only) | Lightning |

- **Combos.** Two-gesture sequences trigger combo attacks:

  | Sequence | Combo |
  |---|---|
  | Open palm → fist | Explosion |
  | Open palm → point | Healing Light (damage + heal) |
  | Point → fist | Lightning Strike |

- **Mana economy.** Each spell costs mana: Fireball 20, Ice Shard 15, Lightning 25, combos 30–40. Mana regenerates over time, and the boss drops mana and healing orbs you can break for resources.
- **Weakness events.** The boss periodically becomes weak to fire or ice for 7 seconds.
- **Multi-phase boss.** The demon has idle, walk, cleave, hit, and death animations. A finisher sequence plays when it falls.
- **Difficulty.** Choose Easy, Medium, or Hard on the start page.
- **Full game flow.** Start page, instructions, interactive tutorial, battle, victory/defeat screens with spell-usage stats, and replay.
- **Audio.** Background music and spell sound effects.

<!-- Screenshots: gameplay / controls / bosses (existing attachments) -->
<img width="860" alt="Gameplay with gesture detection" src="https://github.com/user-attachments/assets/8b4894c1-a0b4-433d-9d93-00c18a406be9" />

## Engineering highlights

| Area | What we built | Where |
|---|---|---|
| **Browser gesture recognition** | Compares each fingertip's and PIP joint's distance from the wrist to decide whether the finger is extended, then maps the extended-finger pattern to FIST, OPEN_PALM, or POINT. Rule-based, with no model download and no server round-trip for classification. | `frontend/scripts/game/gesture-detection.js` |
| **Player cut-out** | MediaPipe Selfie Segmentation masks the webcam preview so only the player is drawn, without the room behind them. | `frontend/scripts/game/gesture-detection.js`, `frontend/scripts/tutorial/tutorial-page.js` |
| **Game server** | Flask detects combos from gesture transitions and handles mana regeneration and costs, cooldowns, a weakness-event scheduler, and per-spell usage stats. The browser posts gestures (`/set_gesture`) and polls for commands (`/get_command`). | `backend/server.py`, `frontend/scripts/game/game-loop.js` |
| **Boss AI & animation** | A health-based three-phase state machine drives sprite-sheet animations, spell effects, collectible mana and heal orbs, and a finisher. | `frontend/scripts/game/boss-system.js`, `spell-animations.js`, `collectibles.js`, `finisher.js` |
| **Modular frontend** | The game is split into 13 focused modules (state, loop, audio, UI feedback, hints, and more) with no framework. | `frontend/scripts/game/` |
| **Offline ML experiment** | Scripts collect labeled landmark data, train a scikit-learn Random Forest, and run an OpenCV desktop viewer. They aren't used by the shipped game. | `backend/models/`, `backend/data/` |

## How it works

```text
Webcam → MediaPipe Hands + Selfie Segmentation (browser)
       → rule-based gesture classifier  (frontend/scripts/game/gesture-detection.js)
       → POST /set_gesture ─────────────► Flask game server (backend/server.py, :5001)
                                           combo detection, mana, cooldowns, events, spell stats
       ◄─ GET /get_command (polled) ──────┘
       → canvas/DOM rendering: boss AI, spell animations, orbs, HUD (frontend/scripts/game/*)
```

The repository also contains an **offline gesture-ML experiment** in `backend/models/`: data collection, a scikit-learn Random Forest trainer, and an OpenCV/MediaPipe desktop viewer, with sample data in `backend/data/`. These scripts run on their own. The shipped game uses the browser classifier above.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, vanilla JavaScript, MediaPipe Hands, MediaPipe Selfie Segmentation (CDN) |
| Backend | Python, Flask, Flask-CORS |
| Offline CV/ML experiments | OpenCV, MediaPipe (Python), scikit-learn |

## Run locally

**Requirements:** Python 3, a webcam, and Chrome, Edge, or Firefox.

1. **Start the game server.** It listens on `http://localhost:5001`, which is hard-coded in the frontend.
   ```bash
   pip install flask flask-cors      # all the game server needs
   cd backend
   python server.py
   ```
   `backend/requirements.txt` also lists `mediapipe` and `opencv-python`. Those are only needed for the offline scripts in `backend/models/`, and MediaPipe wheels may not be available for the newest Python versions.

2. **Serve the frontend from the repository root.** Pages load assets via `../../assets/`.
   ```bash
   # in a second terminal, from the repo root
   python -m http.server 8000
   ```
   Open **http://localhost:8000/frontend/pages/index.html** and allow camera access.

No API keys or environment variables are required.

## Project structure

```text
ComboCraft/
├── backend/
│   ├── server.py              # Flask game server: combos, mana, events, stats
│   ├── requirements.txt
│   ├── models/                # offline gesture-ML + OpenCV experiments
│   ├── data/                  # training samples and trained model for the experiments
│   └── tests/test_camera.py   # webcam sanity check
├── frontend/
│   ├── pages/                 # index, start, instructions, tutorial, game, defeat screens
│   ├── scripts/game/          # game loop, gesture detection, boss AI, spells, orbs, audio, UI
│   ├── scripts/tutorial/
│   └── styles/
└── assets/                    # boss/spell sprite sheets, backgrounds, sounds
```

## Team

| Member | Focus (from repo history) |
|---|---|
| Ally Chen ([@allyytc](https://github.com/allyytc)) | Start page, health system, webcam integration, boss idle/hit and fireball animations, ice and lightning spells, instructions page with the fire-themed UI, split the frontend into modules, boss balance |
| Alex Nguyen ([@alwxngn](https://github.com/alwxngn)) | Flask game server, mana bar and cooldowns, combo events, tutorial, finisher, spell-usage stats |
| Alan Nguyen ([@ahlawnh](https://github.com/ahlawnh)) | Difficulty settings, boss phases, UI polish, file organization, README screenshots |
| Mehul Munankarmi ([@mehulmuna](https://github.com/mehulmuna)) | Sprite and background art, sounds, defeat-bosses menu |

<!-- TODO(Ally): confirm teammate roles and handles before publishing. -->

## Challenges

- Running two MediaPipe models (hand tracking plus background segmentation) every frame strained performance and made gesture timing sensitive.
- The first design polled the backend at 60 fps, which caused stutter. We had to rethink how often the client asks for commands.
- Visually similar gestures were misclassified, so we redesigned the gesture set to reduce ambiguity.
- Keeping gesture timing, animation states, and hit detection in sync for a multi-phase boss took several iterations.

## What's next

- Replace polling with WebSockets.
- Add longer combo chains, more bosses and minions, and spell progression.
- Use full-body tracking so players can dodge, duck, and kick.

## Acknowledgments

MediaPipe (Google), Flask, and OpenGameArt for game assets. Cursor was used for repetitive animation boilerplate and formatting. The core game logic and CV pipeline were written by the team.
