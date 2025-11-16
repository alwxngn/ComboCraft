import { playerHealth, MAX_PLAYER_HEALTH, bossHealth, MAX_BOSS_HEALTH, comboCount, setComboCount, currentBossPhase, setCurrentBossPhase } from './game-state.js';

// Function to update player health
export function updatePlayerHealth(newHealth) {
    const oldHealth = playerHealth;
    const updatedHealth = Math.max(0, Math.min(MAX_PLAYER_HEALTH, newHealth));
    
    // Update via setter (imported module would need this)
    window.gameState.playerHealth = updatedHealth;
    
    const playerHealthBar = document.getElementById('player-hp-fill');
    if (playerHealthBar) {
        const healthPercentage = (updatedHealth / MAX_PLAYER_HEALTH) * 100;
        playerHealthBar.style.width = healthPercentage + '%';
    }
    
    // Reset combo if player took damage
    if (newHealth < oldHealth && comboCount > 0) {
        setComboCount(0);
        updateComboDisplay();
    }
    
    console.log('Player health:', updatedHealth + '/' + MAX_PLAYER_HEALTH);
    checkGameEnd();
}

// Function to update boss health
export function updateBossHealth(newHealth) {
    const updatedHealth = Math.max(0, Math.min(MAX_BOSS_HEALTH, newHealth));
    window.gameState.bossHealth = updatedHealth;
    
    const bossHealthBar = document.getElementById('boss-hp-fill');
    if (bossHealthBar) {
        const healthPercentage = (updatedHealth / MAX_BOSS_HEALTH) * 100;
        bossHealthBar.style.width = healthPercentage + '%';
    }
    
    // Check for phase transitions
    checkBossPhase();
    
    console.log('Boss health:', updatedHealth + '/' + MAX_BOSS_HEALTH);
    checkGameEnd();
}

// Check and update boss phase based on health
export function checkBossPhase() {
    const healthPercent = (bossHealth / MAX_BOSS_HEALTH) * 100;
    let newPhase = currentBossPhase;
    
    if (healthPercent > 66) {
        newPhase = 1; // Phase 1: Normal
    } else if (healthPercent > 33) {
        newPhase = 2; // Phase 2: Enraged
    } else {
        newPhase = 3; // Phase 3: Final Form
    }
    
    // Phase transition detected
    if (newPhase !== currentBossPhase) {
        setCurrentBossPhase(newPhase);
        console.log(`Boss entered Phase ${newPhase}!`);
        
        // Visual/audio feedback for phase change would go here
        const eventDisplay = document.getElementById('event-display');
        if (eventDisplay && newPhase === 2) {
            eventDisplay.textContent = "⚠️ BOSS ENRAGED! ⚠️";
            setTimeout(() => {
                eventDisplay.textContent = "Event: ---";
            }, 3000);
        } else if (eventDisplay && newPhase === 3) {
            eventDisplay.textContent = "💀 FINAL FORM ACTIVATED! 💀";
            setTimeout(() => {
                eventDisplay.textContent = "Event: ---";
            }, 3000);
        }
    }
}

// Reset health
export function resetHealth() {
    window.gameState.playerHealth = MAX_PLAYER_HEALTH;
    window.gameState.bossHealth = MAX_BOSS_HEALTH;
    
    const playerHealthBar = document.getElementById('player-hp-fill');
    const bossHealthBar = document.getElementById('boss-hp-fill');
    
    if (playerHealthBar) playerHealthBar.style.width = '100%';
    if (bossHealthBar) bossHealthBar.style.width = '100%';
}

// Update combo display
export function updateComboDisplay() {
    const comboDisplay = document.getElementById('combo-display');
    if (comboDisplay) {
        if (comboCount > 0) {
            comboDisplay.textContent = `COMBO: ${comboCount}x`;
            comboDisplay.style.opacity = '1';
        } else {
            comboDisplay.style.opacity = '0';
        }
    }
}

// Update event display
export function updateEventDisplay(event, progress = 0, target = 0) {
    const eventDisplay = document.getElementById('event-display');
    if (!eventDisplay) return;

    if (event === "EXPLOSION_CHALLENGE") {
        eventDisplay.textContent = "Event: Perform the EXPLOSION COMBO!";
    } else if (event === "HEAL_LIGHT_CHALLENGE") {
        eventDisplay.textContent = "Event: Perform the HEALING LIGHT COMBO!";
    } else if (event === "WEAKFIRE") {
        eventDisplay.textContent = "Event: Boss is weak to FIRE!";
    } else if (event === "WEAKICE") {
        eventDisplay.textContent = "Event: Boss is weak to ICE!";
    } else if (event === "NONE") {
        eventDisplay.textContent = "Event: ---";
    } else {
        eventDisplay.textContent = `Event: ${event}`;
    }
}

// Check game end
export function checkGameEnd() {
    // This would need to be implemented
}
