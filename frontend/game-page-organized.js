/**
 * GAME PAGE - ORGANIZED MODULAR STRUCTURE
 * 
 * This file is organized into clear sections:
 * 1. State & Constants
 * 2. Audio System
 * 3. Gesture Detection
 * 4. Webcam & MediaPipe
 * 5. UI Updates
 * 6. Boss Animations  
 * 7. Player Spell Animations
 * 8. Game Loop & Event Handling
 * 9. Initialization
 */

// ============================================================================
// SECTION 1: STATE & CONSTANTS
// ============================================================================

// Player & Boss State
let playerHealth = 250;
const MAX_PLAYER_HEALTH = 250;
let bossHealth = 200;
const MAX_BOSS_HEALTH = 200;
let gameRunning = false;
let gameStartTime = Date.now();

// Combat State
let comboCount = 0;
let highestCombo = 0;
let currentBossPhase = 1; // 1=Normal, 2=Enraged, 3=Final Form
let lastPhaseCheck = 0;

// Mana System
let currentMana = 100;
let maxMana = 100;
let manaBalls = [];
let lastManaBallSpawn = 0;
const MANA_BALL_SPAWN_INTERVAL = 4000;

// Heal Orb System
let healOrbs = [];
let lastHealOrbSpawn = 0;
const HEAL_ORB_SPAWN_INTERVAL = 6000;
const HEAL_ORB_HEAL_AMOUNT = 25;

// Boss Animation State
let demonAnimationState = 'idle';
let demonIdleInterval = null;
let demonHitInterval = null;
let demonCleaveInterval = null;
let lastBossAttackCheck = 0;
const BOSS_ATTACK_CHECK_INTERVAL = 1500; // 1.5 seconds

// Player State
let activeAnimations = [];
let lastHandPosition = null;

// ============================================================================
// SECTION 2: AUDIO SYSTEM
// ============================================================================

const sounds = {
    fireball: new Audio('../assets/sounds/fireball.mp3'),
    iceShard: new Audio('../assets/sounds/ice_shard.wav'),
    thunder: new Audio('../assets/sounds/thunder.wav'),
    backgroundMusic: new Audio('../assets/sounds/background_music.wav')
};

// Initialize sounds
Object.values(sounds).forEach(sound => sound.volume = 0.5);
sounds.backgroundMusic.loop = true;

function startBackgroundMusic() {
    sounds.backgroundMusic.play().catch(err => {
        console.log("Background music autoplay blocked:", err);
    });
}

// ============================================================================
// SECTION 3: GESTURE DETECTION
// ============================================================================

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
    
    if (extendedCount === 0) return 'FIST';
    if (index && !middle && !ring && !pinky) return 'POINT';
    if (extendedCount >= 4) return 'OPEN_PALM';
    
    return 'NONE';
}

let lastSentGesture = 'NONE';
async function sendGestureToBackend(gesture) {
    if (gesture !== lastSentGesture) {
        lastSentGesture = gesture;
        if (gesture !== 'NONE') {
            showGestureFeedback(gesture);
        }
        try {
            await fetch('http://localhost:5001/set_gesture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gesture: gesture })
            });
        } catch (error) {
            console.error('Error sending gesture:', error);
        }
    }
}

function showGestureFeedback(gesture) {
    console.log('Gesture detected:', gesture);
}

// ============================================================================
// REST OF THE FILE WOULD CONTINUE WITH OTHER SECTIONS...
// ============================================================================

// This demonstrates the organizational structure
// The actual implementation would continue with all the remaining functions
// organized into their respective sections

console.log("📦 Game initialized - modular organization");
