// Game Over Module - Game over screen, replay, reset, and game end checking

function resetHealth() {
    if (!window.GameState || !window.UIFeedback) return;
    
    const maxPlayerHealth = window.GameState.getMaxPlayerHealth();
    const maxBossHealth = window.GameState.getMaxBossHealth();
    
    window.UIFeedback.updatePlayerHealth(maxPlayerHealth);
    window.UIFeedback.updateBossHealth(maxBossHealth);
    window.UIFeedback.updateMana(100, 100);
    
    const manaBalls = window.GameState.getManaBalls();
    manaBalls.forEach(ball => ball.element.remove());
    manaBalls.length = 0;
    window.GameState.setLastManaBallSpawn(Date.now());
    
    const healOrbs = window.GameState.getHealOrbs();
    healOrbs.forEach(orb => orb.element.remove());
    healOrbs.length = 0;
    window.GameState.setLastHealOrbSpawn(Date.now());
    
    window.GameState.setCurrentBossPhase(1);
    const demonSprite = document.getElementById('demon-sprite');
    const bossBox = document.querySelector('.boss-box');
    
    if (demonSprite) {
        demonSprite.style.filter = '';
        demonSprite.style.boxShadow = '';
        demonSprite.style.transition = '';
        demonSprite.style.opacity = '1';
        demonSprite.style.transform = '';
    }
    
    if (bossBox) {
        bossBox.style.animation = '';
    }
    
    if (window.bossColorCycle) {
        clearInterval(window.bossColorCycle);
        window.bossColorCycle = null;
    }
    
    console.log('Health and mana reset!');
}

function checkGameEnd() {
    if (!window.GameState) return;
    
    const playerHealth = window.GameState.getPlayerHealth();
    const bossHealth = window.GameState.getBossHealth();
    const gameRunning = window.GameState.isGameRunning();
    const finisherMode = window.GameState.getFinisherMode();
    
    if (playerHealth <= 0 && gameRunning) {
        console.log('Player defeated! Boss wins!');
        window.GameState.setGameRunning(false);
        window.GameState.setFinisherMode(false);
        
        const finisherTimeout = window.GameState.getFinisherTimeout();
        if (finisherTimeout) {
            clearTimeout(finisherTimeout);
            window.GameState.setFinisherTimeout(null);
        }
        
        setTimeout(() => {
            if (window.GameOver && window.GameOver.showGameOverScreen) {
                window.GameOver.showGameOverScreen(false);
            }
        }, 100);
    } else if (bossHealth <= 0 && gameRunning && !finisherMode && !window.GameState.getFinisherMessageShown()) {
        console.log('Boss defeated! FINISHER MODE ACTIVATED!');
        window.GameState.setFinisherMode(true);
        window.GameState.setFinisherIceShardCount(0);
        window.GameState.setFinisherMessageShown(true);
        
        if (window.Finisher && window.Finisher.showFinisherMessage) {
            window.Finisher.showFinisherMessage();
        }
        
        const finisherTimeout = setTimeout(() => {
            console.log('Finisher timeout - auto-finishing');
            if (window.Finisher && window.Finisher.performFinisherAnimation) {
                window.Finisher.performFinisherAnimation();
            }
        }, window.GameState.FINISHER_TIME_LIMIT);
        
        window.GameState.setFinisherTimeout(finisherTimeout);
    }
}

function showGameOverScreen(isVictory) {
    if (window.Sounds && window.Sounds.backgroundMusic) {
        window.Sounds.backgroundMusic.pause();
    }
    
    const existingOverlay = document.getElementById('game-over-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const finisherMessage = document.getElementById('finisher-message-overlay');
    if (finisherMessage) {
        finisherMessage.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    
    if (isVictory) {
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(40, 20, 15, 0.95) 0%, rgba(10, 5, 5, 0.98) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.5s ease-in;
            overflow: hidden;
        `;
    } else {
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(20, 5, 5, 0.95) 0%, rgba(5, 0, 0, 0.98) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.5s ease-in;
            overflow: hidden;
        `;
    }
    
    const style = document.createElement('style');
    style.id = 'victory-screen-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes burn {
            0%, 100% {
                text-shadow: 
                    0 0 8px rgba(200, 100, 60, 0.6),
                    0 0 15px rgba(180, 80, 50, 0.4),
                    1px 1px 3px rgba(0, 0, 0, 0.8);
            }
            50% {
                text-shadow: 
                    0 0 12px rgba(200, 100, 60, 0.8),
                    0 0 20px rgba(180, 80, 50, 0.6),
                    1px 1px 3px rgba(0, 0, 0, 0.8);
            }
        }
        @keyframes defeatPulse {
            0%, 100% {
                text-shadow: 
                    0 0 8px rgba(120, 40, 40, 0.6),
                    0 0 15px rgba(100, 30, 30, 0.4),
                    1px 1px 3px rgba(0, 0, 0, 0.8);
            }
            50% {
                text-shadow: 
                    0 0 12px rgba(120, 40, 40, 0.8),
                    0 0 20px rgba(100, 30, 30, 0.6),
                    1px 1px 3px rgba(0, 0, 0, 0.8);
            }
        }
    `;
    document.head.appendChild(style);
    
    const title = document.createElement('h1');
    title.textContent = isVictory ? 'VICTORY' : 'DEFEAT';
    title.style.cssText = `
        color: ${isVictory ? '#d4a060' : '#b08080'};
        font-size: 80px;
        font-weight: 800;
        margin-bottom: 30px;
        letter-spacing: 6px;
        text-transform: uppercase;
        animation: ${isVictory ? 'burn 3s ease-in-out infinite, slideUp 0.8s ease-out' : 'defeatPulse 3s ease-in-out infinite, slideUp 0.8s ease-out'};
        font-family: "Press Start 2P", cursive;
        position: relative;
        z-index: 10;
        text-shadow: ${isVictory ? `
            0 0 8px rgba(200, 100, 60, 0.6),
            0 0 15px rgba(180, 80, 50, 0.4),
            1px 1px 3px rgba(0,0,0,0.8)
        ` : `
            0 0 8px rgba(120, 40, 40, 0.6),
            0 0 15px rgba(100, 30, 30, 0.4),
            1px 1px 3px rgba(0,0,0,0.8)
        `};
    `;
    
    const stats = document.createElement('div');
    stats.style.cssText = `
        color: ${isVictory ? '#d4b860' : '#c4c4c4'};
        font-size: 24px;
        margin-bottom: 40px;
        text-align: center;
        animation: slideUp 0.5s ease-out 0.3s both;
        font-family: "Press Start 2P", cursive;
        font-weight: 600;
        position: relative;
        z-index: 10;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    `;
    
    const gameStartTime = window.GameState ? window.GameState.getGameStartTime() : Date.now();
    const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const highestCombo = window.GameState ? window.GameState.getHighestCombo() : 0;
    const bossHealth = window.GameState ? window.GameState.getBossHealth() : 0;
    const maxBossHealth = window.GameState ? window.GameState.getMaxBossHealth() : 150;
    
    fetch('http://localhost:5001/get_spell_stats')
        .then(response => response.json())
        .then(data => {
            const favoriteSpell = data.favorite_spell_display || "None";
            const favoriteCount = data.favorite_spell_count || 0;
            stats.innerHTML = `
                <div style="margin-bottom: 15px;">Highest Combo: ${highestCombo}x</div>
                <div style="margin-bottom: 15px;">Time: ${gameTime}s</div>
                <div style="margin-bottom: 15px;">Favorite Spell: ${favoriteSpell} (${favoriteCount}x)</div>
                <div>Final Boss HP: ${Math.max(0, bossHealth)}/${maxBossHealth}</div>
            `;
        })
        .catch(err => {
            console.error('Error fetching spell stats:', err);
            stats.innerHTML = `
                <div style="margin-bottom: 15px;">Highest Combo: ${highestCombo}x</div>
                <div style="margin-bottom: 15px;">Time: ${gameTime}s</div>
                <div style="margin-bottom: 15px;">Favorite Spell: N/A</div>
                <div>Final Boss HP: ${Math.max(0, bossHealth)}/${maxBossHealth}</div>
            `;
        });
    
    const replayButton = document.createElement('button');
    replayButton.textContent = 'PLAY AGAIN';
    replayButton.style.cssText = `
        padding: 18px 45px;
        font-size: 22px;
        font-weight: 700;
        background: ${isVictory ? 'linear-gradient(135deg, #b46040, #c47858)' : 'linear-gradient(135deg, #804040, #603030)'};
        color: #e8e8e8;
        border: 2px solid ${isVictory ? 'rgba(200, 140, 100, 0.6)' : 'rgba(140, 100, 100, 0.6)'};
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s;
        animation: slideUp 0.5s ease-out 0.5s both;
        font-family: "Press Start 2P", cursive;
        letter-spacing: 1px;
        text-transform: uppercase;
        position: relative;
        z-index: 10;
    `;
    replayButton.onmouseover = function() {
        if (isVictory) {
            this.style.background = 'linear-gradient(135deg, #c47858, #b46040)';
        } else {
            this.style.background = 'linear-gradient(135deg, #603030, #804040)';
        }
        this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        this.style.transform = 'scale(1.05) translateY(-2px)';
    };
    replayButton.onmouseout = function() {
        if (isVictory) {
            this.style.background = 'linear-gradient(135deg, #b46040, #c47858)';
        } else {
            this.style.background = 'linear-gradient(135deg, #804040, #603030)';
        }
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        this.style.transform = 'scale(1) translateY(0)';
    };
    replayButton.onclick = function() {
        overlay.remove();
        if (window.GameOver && window.GameOver.replayGame) {
            window.GameOver.replayGame();
        }
    };
    
    const homeButton = document.createElement('a');
    homeButton.href = 'start-page.html';
    homeButton.textContent = 'RETURN HOME';
    homeButton.style.cssText = `
        padding: 18px 45px;
        font-size: 22px;
        font-weight: 700;
        background: linear-gradient(135deg, #505050, #303030);
        color: #e8e8e8;
        border: 2px solid rgba(120, 120, 120, 0.6);
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s;
        animation: slideUp 0.5s ease-out 0.7s both;
        font-family: "Press Start 2P", cursive;
        letter-spacing: 1px;
        text-transform: uppercase;
        position: relative;
        z-index: 10;
        text-decoration: none;
        display: inline-block;
    `;
    homeButton.onmouseover = function() {
        this.style.background = 'linear-gradient(135deg, #606060, #404040)';
        this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        this.style.transform = 'scale(1.05) translateY(-2px)';
    };
    homeButton.onmouseout = function() {
        this.style.background = 'linear-gradient(135deg, #505050, #303030)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        this.style.transform = 'scale(1) translateY(0)';
    };
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        width: 100%;
        animation: slideUp 0.5s ease-out 0.5s both;
    `;
    buttonContainer.appendChild(replayButton);
    buttonContainer.appendChild(homeButton);
    
    overlay.appendChild(title);
    overlay.appendChild(stats);
    overlay.appendChild(buttonContainer);
    document.body.appendChild(overlay);
}

function replayGame() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.remove();
    
    if (!window.GameState) return;
    
    window.GameState.setGameStartTime(Date.now());
    window.GameState.setHintShown(false);
    resetHealth();
    
    window.GameState.setComboCount(0);
    window.GameState.setHighestCombo(0);
    window.GameState.setComboJustReset(true);
    window.GameState.setFinisherMode(false);
    window.GameState.setFinisherIceShardCount(0);
    window.GameState.setFinisherMessageShown(false);
    
    const finisherTimeout = window.GameState.getFinisherTimeout();
    if (finisherTimeout) {
        clearTimeout(finisherTimeout);
        window.GameState.setFinisherTimeout(null);
    }
    
    window.GameState.setGameRunning(true);
    
    fetch('http://localhost:5001/reset_combo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }).catch(err => console.error('Error resetting combo:', err));
    
    fetch('http://localhost:5001/reset_spell_stats', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }).catch(err => console.error('Error resetting spell stats:', err));
    
    if (window.UIFeedback && window.UIFeedback.updateComboDisplay) {
        window.UIFeedback.updateComboDisplay();
    }
    
    if (window.Sounds && window.Sounds.backgroundMusic) {
        window.Sounds.backgroundMusic.currentTime = 0;
        window.Sounds.backgroundMusic.play().catch(err => {
            console.log("Background music autoplay blocked:", err);
        });
    }
    
    if (window.BossSystem && window.BossSystem.startDemonIdleAnimation) {
        window.BossSystem.startDemonIdleAnimation();
    }
    
    if (window.GameLoop && window.GameLoop.gameLoop) {
        window.GameLoop.gameLoop();
    }
}

window.GameOver = {
    showGameOverScreen,
    replayGame,
    resetHealth,
    checkGameEnd
};

