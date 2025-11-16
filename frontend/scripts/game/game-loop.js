// Game Loop Module - Main game loop

async function gameLoop() {
    if (!window.GameState) return;
    
    const gameRunning = window.GameState.isGameRunning();
    if (!gameRunning) return;
    
    let command = "NONE";
    let event = "NONE";
    let cooldown = 0;
    
    const gameStartTime = window.GameState.getGameStartTime();
    const elapsedTime = Date.now();
    const hintShown = window.GameState.getHintShown();
    const HINT_DELAY = window.GameState.HINT_DELAY;
    
    if (!hintShown && elapsedTime - gameStartTime >= HINT_DELAY) {
        window.GameState.setHintShown(true);
        if (window.Hint && window.Hint.showOrbHintOverlay) {
            window.Hint.showOrbHintOverlay();
        }
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/get_command');
        const data = await response.json();

        command = data.command;
        event = data.event || "NONE";
        cooldown = data.cooldown || 0;
        
        const comboJustReset = window.GameState.getComboJustReset();
        if (!comboJustReset) {
            window.GameState.setComboCount(data.combo || 0);
        } else {
            window.GameState.setComboJustReset(false);
        }
        
        if (window.UIFeedback && window.UIFeedback.updateComboDisplay) {
            window.UIFeedback.updateComboDisplay();
        }
        
        if (data.mana !== undefined && data.max_mana !== undefined) {
            if (window.UIFeedback && window.UIFeedback.updateMana) {
                window.UIFeedback.updateMana(data.mana, data.max_mana);
            }
        }
        
        console.log("Server response - Command:", command, "Gesture:", data.gesture, "Event:", event);
        
    } catch (error) {
        console.error("Backend server is down!");
        requestAnimationFrame(gameLoop);
        return;
    }

    if (window.UIFeedback) {
        if (window.UIFeedback.updateCooldownDisplay) {
            window.UIFeedback.updateCooldownDisplay(cooldown);
        }
        if (window.UIFeedback.updateEventDisplay) {
            window.UIFeedback.updateEventDisplay(event);
        }
    }
    
    const now = Date.now();
    const lastManaBallSpawn = window.GameState.getLastManaBallSpawn();
    const MANA_BALL_SPAWN_INTERVAL = window.GameState.MANA_BALL_SPAWN_INTERVAL;
    
    if (now - lastManaBallSpawn >= MANA_BALL_SPAWN_INTERVAL) {
        if (window.Collectibles && window.Collectibles.spawnManaBall) {
            window.Collectibles.spawnManaBall();
        }
        window.GameState.setLastManaBallSpawn(now);
    }
    
    const lastHealOrbSpawn = window.GameState.getLastHealOrbSpawn();
    const HEAL_ORB_SPAWN_INTERVAL = window.GameState.HEAL_ORB_SPAWN_INTERVAL;
    
    if (now - lastHealOrbSpawn >= HEAL_ORB_SPAWN_INTERVAL) {
        if (window.Collectibles && window.Collectibles.spawnHealOrb) {
            window.Collectibles.spawnHealOrb();
        }
        window.GameState.setLastHealOrbSpawn(now);
    }

    if (command === "INSUFFICIENT_MANA") {
        console.log("Not enough mana!");
    }
    
    else if (command === "CHALLENGE_SUCCESS") {
        console.log("CHALLENGE COMPLETE! Massive damage!");
        
        if (window.VisualEffects && window.VisualEffects.showChallengeSuccessMessage) {
            window.VisualEffects.showChallengeSuccessMessage();
        }
        
        let rewardDamage = 30;
        if (window.BossSystem && window.BossSystem.playDemonHitAnimation) {
            window.BossSystem.playDemonHitAnimation(rewardDamage);
        }
    }
    
    const finisherMode = window.GameState.getFinisherMode();
    if (finisherMode) {
        if (command === "ICE_SHARD") {
            const finisherMessage = document.getElementById('finisher-message-overlay');
            if (finisherMessage) {
                const messageText = finisherMessage.querySelector('div:first-child');
                if (messageText && messageText.textContent === 'UNLEASH 2 OPEN PALMS!') {
                    messageText.style.animation = 'fadeOut 0.3s ease-out';
                    setTimeout(() => {
                        if (messageText.parentNode) {
                            messageText.remove();
                        }
                    }, 300);
                }
            }
            
            const finisherIceShardCount = window.GameState.getFinisherIceShardCount();
            window.GameState.setFinisherIceShardCount(finisherIceShardCount + 1);
            console.log(`Finisher progress: ${finisherIceShardCount + 1}/2 open palms`);
            
            if (window.Finisher && window.Finisher.updateFinisherCounter) {
                window.Finisher.updateFinisherCounter();
            }
            
            if (finisherIceShardCount + 1 >= 2) {
                console.log('FINISHER COMBO COMPLETE! Two open palms unleashed!');
                const finisherTimeout = window.GameState.getFinisherTimeout();
                if (finisherTimeout) {
                    clearTimeout(finisherTimeout);
                    window.GameState.setFinisherTimeout(null);
                }
                if (window.Finisher && window.Finisher.performFinisherAnimation) {
                    window.Finisher.performFinisherAnimation();
                }
                return;
            }
        }
    }
    
    else if (command === "FIREBALL") {
        let damage = 10;
        if (event === "WEAKFIRE") {
            console.log("WEAK POINT HIT! Fireball is stronger!");
            damage += 10;
        }
        if (window.SpellAnimations && window.SpellAnimations.playFireballAnimation) {
            window.SpellAnimations.playFireballAnimation(damage);
        }
    }

    else if (command === "ICE_SHARD") {
        if (window.SpellAnimations && window.SpellAnimations.playIceShardAnimation) {
            window.SpellAnimations.playIceShardAnimation();
        }
    }

    else if (command === "LIGHTNING") {
        if (window.SpellAnimations && window.SpellAnimations.playLightningAnimation) {
            window.SpellAnimations.playLightningAnimation();
        }
    }

    else if (command === "EXPLOSION_COMBO") {
        let damage = 25;
        if (event === "WEAKFIRE") {
            damage += 15;
        }
        if (window.VisualEffects && window.VisualEffects.showComboMessage) {
            window.VisualEffects.showComboMessage("EXPLOSION COMBO!", 0xFF4500);
        }
        if (window.SpellAnimations) {
            if (window.SpellAnimations.playFireballAnimation) {
                window.SpellAnimations.playFireballAnimation(damage);
            }
            setTimeout(() => {
                if (window.SpellAnimations.playIceShardAnimation) {
                    window.SpellAnimations.playIceShardAnimation();
                }
            }, 200);
        }
    }
    else if (command === "HEALING_LIGHT_COMBO") {
        let damage = 20;
        let hp = 15;
        if (window.VisualEffects && window.VisualEffects.showComboMessage) {
            window.VisualEffects.showComboMessage("HEALING LIGHT!", 0x00FF00);
        }
        if (window.SpellAnimations && window.SpellAnimations.playLightningAnimation) {
            window.SpellAnimations.playLightningAnimation();
        }
        
        const bossBox = document.querySelector('.boss-box');
        if (bossBox && window.VisualEffects && window.VisualEffects.showDamageNumber) {
            const boxRect = bossBox.getBoundingClientRect();
            const containerRect = document.querySelector('.box-container').getBoundingClientRect();
            const x = boxRect.left - containerRect.left + boxRect.width / 2;
            const y = boxRect.top - containerRect.top + boxRect.height / 2;
            window.VisualEffects.showDamageNumber(damage, x, y, '#FF4444');
        }
        
        const playerBox = document.querySelector('.player-box');
        if (playerBox && window.VisualEffects && window.VisualEffects.showDamageNumber) {
            const boxRect = playerBox.getBoundingClientRect();
            const containerRect = document.querySelector('.box-container').getBoundingClientRect();
            const x = boxRect.left - containerRect.left + boxRect.width / 2;
            const y = boxRect.top - containerRect.top + boxRect.height / 2;
            window.VisualEffects.showDamageNumber(hp, x, y, '#00FF00', true);
        }
        
        if (window.UIFeedback) {
            if (window.UIFeedback.updateBossHealth) {
                window.UIFeedback.updateBossHealth(window.GameState.getBossHealth() - damage);
            }
            if (window.UIFeedback.updatePlayerHealth) {
                const maxPlayerHealth = window.GameState.getMaxPlayerHealth();
                window.UIFeedback.updatePlayerHealth(
                    Math.min(maxPlayerHealth, window.GameState.getPlayerHealth() + hp)
                );
            }
        }
    }
    else if (command === "LIGHTNING_STRIKE_COMBO") {
        let damage = 35;
        if (window.VisualEffects && window.VisualEffects.showComboMessage) {
            window.VisualEffects.showComboMessage("LIGHTNING STRIKE!", 0xFFD700);
        }
        if (window.SpellAnimations && window.SpellAnimations.playLightningAnimation) {
            window.SpellAnimations.playLightningAnimation();
        }
        setTimeout(() => {
            if (window.BossSystem && window.BossSystem.playDemonHitAnimation) {
                window.BossSystem.playDemonHitAnimation(damage);
            }
        }, 500);
    }

    if (!finisherMode) {
        const currentTime = Date.now();
        const lastBossAttackCheck = window.GameState.getLastBossAttackCheck();
        const BOSS_ATTACK_CHECK_INTERVAL = window.GameState.BOSS_ATTACK_CHECK_INTERVAL;
        
        if (currentTime - lastBossAttackCheck >= BOSS_ATTACK_CHECK_INTERVAL) {
            window.GameState.setLastBossAttackCheck(currentTime);
            
            let attackChance = 0;
            let bossDamage = 0;
            let attackType = 'cleave';
            
            const currentBossPhase = window.GameState.getCurrentBossPhase();
            
            switch(currentBossPhase) {
                case 1:
                    attackChance = 0.5;
                    bossDamage = Math.floor(Math.random() * 11) + 15;
                    attackType = 'cleave';
                    break;
                    
                case 2:
                    attackChance = 0.65;
                    bossDamage = Math.floor(Math.random() * 11) + 15;
                    attackType = Math.random() < 0.7 ? 'cleave' : 'walk';
                    break;
                    
                case 3:
                    attackChance = 0.75;
                    bossDamage = Math.floor(Math.random() * 11) + 15;
                    const rand = Math.random();
                    if (rand < 0.6) {
                        attackType = 'cleave';
                    } else if (rand < 0.85) {
                        attackType = 'walk';
                    } else {
                        attackType = 'double';
                    }
                    break;
            }
            
            if (Math.random() < attackChance && window.BossSystem) {
                console.log(`Boss ${attackType} attack for ${bossDamage} damage! (Phase ${currentBossPhase})`);
                
                if (attackType === 'cleave') {
                    if (window.BossSystem.playDemonCleaveAnimation) {
                        window.BossSystem.playDemonCleaveAnimation(bossDamage);
                    }
                } else if (attackType === 'walk') {
                    if (window.BossSystem.playDemonWalkAttack) {
                        window.BossSystem.playDemonWalkAttack(bossDamage);
                    }
                } else if (attackType === 'double') {
                    if (window.BossSystem.playDemonCleaveAnimation) {
                        window.BossSystem.playDemonCleaveAnimation(Math.floor(bossDamage * 0.6));
                        setTimeout(() => {
                            if (window.BossSystem.playDemonCleaveAnimation) {
                                window.BossSystem.playDemonCleaveAnimation(Math.floor(bossDamage * 0.6));
                            }
                        }, 800);
                    }
                }
            }
        }
    }
    
    requestAnimationFrame(gameLoop);
}

window.GameLoop = {
    gameLoop
};

