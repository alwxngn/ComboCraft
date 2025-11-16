function updateEventDisplay(event) {
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

function updateComboDisplay() {
    if (!window.GameState) return;
    
    const comboDisplay = document.getElementById('combo-display');
    const comboCount = window.GameState.getComboCount();
    
    if (comboDisplay) {
        if (comboCount > 0) {
            comboDisplay.textContent = `COMBO: ${comboCount}x`;
            comboDisplay.style.opacity = '1';
        } else {
            comboDisplay.style.opacity = '0';
        }
    }
    
    if (comboCount > window.GameState.getHighestCombo()) {
        window.GameState.setHighestCombo(comboCount);
    }
}

function updatePlayerHealth(newHealth) {
    if (!window.GameState) return;
    
    const oldHealth = window.GameState.getPlayerHealth();
    const maxHealth = window.GameState.getMaxPlayerHealth();
    
    window.GameState.setPlayerHealth(Math.max(0, Math.min(maxHealth, newHealth)));
    
    const playerHealthBar = document.getElementById('player-hp-fill');
    if (playerHealthBar) {
        const healthPercentage = (window.GameState.getPlayerHealth() / maxHealth) * 100;
        playerHealthBar.style.width = healthPercentage + '%';
    }
    
    if (newHealth < oldHealth && window.GameState.getComboCount() > 0) {
        window.GameState.setComboCount(0);
        window.GameState.setComboJustReset(true);
        fetch('http://localhost:5001/reset_combo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }).catch(() => {});
        updateComboDisplay();
    }
    
    if (window.GameOver && window.GameOver.checkGameEnd) {
        window.GameOver.checkGameEnd();
    }
}

function updateBossHealth(newHealth) {
    if (!window.GameState) return;
    
    const maxHealth = window.GameState.getMaxBossHealth();
    window.GameState.setBossHealth(Math.max(0, Math.min(maxHealth, newHealth)));
    
    const bossHealthBar = document.getElementById('boss-hp-fill');
    if (bossHealthBar) {
        const healthPercentage = (window.GameState.getBossHealth() / maxHealth) * 100;
        bossHealthBar.style.width = healthPercentage + '%';
    }
    
    if (window.BossSystem && window.BossSystem.checkBossPhase) {
        window.BossSystem.checkBossPhase();
    }
    
    if (window.GameOver && window.GameOver.checkGameEnd) {
        window.GameOver.checkGameEnd();
    }
}

function updateMana(newMana, newMaxMana) {
    if (!window.GameState) return;
    
    window.GameState.setCurrentMana(Math.max(0, Math.min(newMaxMana, newMana)));
    window.GameState.setMaxMana(newMaxMana);
    
    const manaBar = document.getElementById('mana-fill');
    if (manaBar) {
        const manaPercentage = (window.GameState.getCurrentMana() / newMaxMana) * 100;
        manaBar.style.width = manaPercentage + '%';
    }
}

window.UIFeedback = {
    updateEventDisplay,
    updateComboDisplay,
    updatePlayerHealth,
    updateBossHealth,
    updateMana
};
