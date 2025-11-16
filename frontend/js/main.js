// Main Game Entry Point - Simplified and Modular

// Import all modules
import { resetGameState, gameRunning } from './js/game-state.js';
import { startBackgroundMusic } from './js/audio.js';
import { startWebcam } from './js/webcam.js';
import { resetHealth } from './js/ui-updates.js';

// Global game state accessible to all modules
window.gameState = {
    playerHealth: 250,
    bossHealth: 200,
    currentMana: 100,
    comboCount: 0,
    highestCombo: 0,
    gameRunning: false,
    currentBossPhase: 1,
    manaBalls: [],
    healOrbs: []
};

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log("🎮 Game loaded!");
    
    resetHealth();
    resetGameState();
    startWebcam();
    startDemonIdleAnimation();
    window.gameState.gameRunning = true;
    
    startBackgroundMusic();
    gameLoop();
    
    console.log("✅ All systems initialized!");
});

// Temporary placeholder functions - these would be moved to separate modules
function startDemonIdleAnimation() {
    // Boss animation logic
    console.log("Boss idle animation started");
}

function gameLoop() {
    if (!window.gameState.gameRunning) {
        return;
    }
    
    // Main game loop logic would go here
    // This would coordinate all game systems
    
    requestAnimationFrame(gameLoop);
}

console.log("📦 Main game module loaded");
