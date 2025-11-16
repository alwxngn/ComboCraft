// Boss System Module - Boss animations, phases, and attacks

function checkBossPhase() {
    if (!window.GameState) return;
    
    const bossHealth = window.GameState.getBossHealth();
    const maxBossHealth = window.GameState.getMaxBossHealth();
    const healthPercent = (bossHealth / maxBossHealth) * 100;
    const currentBossPhase = window.GameState.getCurrentBossPhase();
    
    let newPhase = currentBossPhase;
    
    if (healthPercent > 66) {
        newPhase = 1;
    } else if (healthPercent > 33) {
        newPhase = 2;
    } else {
        newPhase = 3;
    }
    
    if (newPhase !== currentBossPhase) {
        window.GameState.setCurrentBossPhase(newPhase);
        onBossPhaseChange(newPhase);
    }
}

function onBossPhaseChange(phase) {
    const demonSprite = document.getElementById('demon-sprite');
    const bossBox = document.querySelector('.boss-box');
    const eventDisplay = document.getElementById('event-display');
    
    if (!demonSprite || !bossBox) return;
    
    demonSprite.style.filter = '';
    demonSprite.style.transition = 'all 0.5s ease-in-out';
    
    const demonIdleInterval = window.GameState ? window.GameState.getDemonIdleInterval() : null;
    if (demonIdleInterval) {
        clearInterval(demonIdleInterval);
    }
    
    switch(phase) {
        case 2:
            console.log('🔥 BOSS PHASE 2: ENRAGED!');
            demonSprite.style.filter = 'brightness(1.2) saturate(1.5) hue-rotate(350deg)';
            demonSprite.style.boxShadow = 'none';
            if (eventDisplay) {
                eventDisplay.textContent = 'BOSS ENRAGED!';
                eventDisplay.style.animation = 'none';
                setTimeout(() => {
                    eventDisplay.style.animation = 'eventPulse 1s ease-in-out infinite';
                }, 10);
            }
            showPhaseTransitionMessage('ENRAGED', '#FF4500');
            startDemonIdleAnimation();
            break;
            
        case 3:
            console.log('💀 BOSS PHASE 3: FINAL FORM!');
            demonSprite.style.filter = 'brightness(0.7) saturate(2.5) hue-rotate(0deg) contrast(1.5)';
            demonSprite.style.boxShadow = 'none';
            
            const randomSpeed = 1.5 + Math.random() * 1.5;
            bossBox.style.animation = `bossMoveBackAway ${randomSpeed}s ease-in-out infinite`;
            
            if (!document.getElementById('boss-final-form-color-cycle')) {
                const colorCycle = setInterval(() => {
                }, 50);
                window.bossColorCycle = colorCycle;
            }
            
            if (eventDisplay) {
                eventDisplay.textContent = 'FINAL FORM ACTIVATED!';
                eventDisplay.style.animation = 'none';
                setTimeout(() => {
                    eventDisplay.style.animation = 'eventPulse 0.5s ease-in-out infinite';
                }, 10);
            }
            showPhaseTransitionMessage('FINAL FORM', '#8B0000');
            startDemonIdleAnimation();
            
            if (!document.getElementById('boss-final-form-style')) {
                const style = document.createElement('style');
                style.id = 'boss-final-form-style';
                style.textContent = `
                    @keyframes bossFinalFormPulse {
                        0%, 100% {
                            filter: brightness(0.7);
                        }
                        50% {
                            filter: brightness(0.9);
                        }
                    }
                    @keyframes bossMoveBackAway {
                        0%, 100% {
                            transform: translateX(0) translateY(0);
                        }
                        50% {
                            transform: translateX(-400px) translateY(-20px);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            break;
    }
}

function showPhaseTransitionMessage(text, color) {
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '64px';
    message.style.fontWeight = '900';
    message.style.color = color;
    message.style.textShadow = `0 0 30px ${color}, 0 0 60px ${color}, 2px 2px 4px rgba(0,0,0,0.9)`;
    message.style.zIndex = '2000';
    message.style.pointerEvents = 'none';
    message.style.fontFamily = '"Press Start 2P", cursive';
    message.style.letterSpacing = '8px';
    message.style.textTransform = 'uppercase';
    message.style.opacity = '0';
    message.style.transition = 'all 0.5s ease-out';
    
    boxContainer.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '1';
        message.style.transform = 'translate(-50%, -50%) scale(1.2)';
    }, 10);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => message.remove(), 500);
    }, 2000);
}

function startDemonIdleAnimation() {
    if (!window.GameState) return;
    
    const demonSprite = document.getElementById('demon-sprite');
    if (!demonSprite) return;
    
    const idleFrames = [
        'demon_idle_1.png',
        'demon_idle_2.png',
        'demon_idle_3.png',
        'demon_idle_4.png',
        'demon_idle_5.png',
        'demon_idle_6.png'
    ];
    
    let currentFrame = 0;
    const currentBossPhase = window.GameState.getCurrentBossPhase();
    
    const existingInterval = window.GameState.getDemonIdleInterval();
    if (existingInterval) {
        clearInterval(existingInterval);
    }
    
    const demonIdleInterval = setInterval(() => {
        const demonAnimationState = window.GameState.getDemonAnimationState();
        if (demonAnimationState === 'idle') {
            currentFrame = (currentFrame + 1) % idleFrames.length;
            demonSprite.src = `../../assets/demon idle/${idleFrames[currentFrame]}`;
        }
    }, currentBossPhase >= 2 ? 120 : 150);
    
    window.GameState.setDemonIdleInterval(demonIdleInterval);
}

function playDemonHitAnimation(damage = 0) {
    if (!window.GameState) return;
    
    const demonAnimationState = window.GameState.getDemonAnimationState();
    
    if (demonAnimationState === 'cleave') {
        const reducedDamage = Math.floor(damage * 0.5);
        setTimeout(() => {
            if (reducedDamage > 0) {
                const bossBox = document.querySelector('.boss-box');
                if (bossBox && window.VisualEffects && window.VisualEffects.showDamageNumber) {
                    const boxRect = bossBox.getBoundingClientRect();
                    const containerRect = document.querySelector('.box-container').getBoundingClientRect();
                    const x = boxRect.left - containerRect.left + boxRect.width / 2;
                    const y = boxRect.top - containerRect.top + boxRect.height / 2;
                    window.VisualEffects.showDamageNumber(reducedDamage, x, y, '#FFAA00');
                }
                if (window.UIFeedback && window.UIFeedback.updateBossHealth) {
                    window.UIFeedback.updateBossHealth(
                        window.GameState.getBossHealth() - reducedDamage
                    );
                }
            }
        }, 1200);
        return;
    }
    
    const existingInterval = window.GameState.getDemonHitInterval();
    if (existingInterval) {
        clearInterval(existingInterval);
    }
    
    const demonSprite = document.getElementById('demon-sprite');
    if (!demonSprite) return;
    
    const hitFrames = [
        'demon_take_hit_1.png',
        'demon_take_hit_2.png',
        'demon_take_hit_3.png',
        'demon_take_hit_4.png',
        'demon_take_hit_5.png'
    ];
    
    window.GameState.setDemonAnimationState('hit');
    let currentFrame = 0;
    
    const demonHitInterval = setInterval(() => {
        if (currentFrame < hitFrames.length) {
            demonSprite.src = `../../assets/demon_take_hit/${hitFrames[currentFrame]}`;
            currentFrame++;
        } else {
            clearInterval(demonHitInterval);
            window.GameState.setDemonHitInterval(null);
            window.GameState.setDemonAnimationState('idle');
            
            if (damage > 0) {
                const bossBox = document.querySelector('.boss-box');
                if (bossBox && window.VisualEffects && window.VisualEffects.showDamageNumber) {
                    const boxRect = bossBox.getBoundingClientRect();
                    const containerRect = document.querySelector('.box-container').getBoundingClientRect();
                    const x = boxRect.left - containerRect.left + boxRect.width / 2;
                    const y = boxRect.top - containerRect.top + boxRect.height / 2;
                    window.VisualEffects.showDamageNumber(damage, x, y, '#FF4444');
                }
                if (window.UIFeedback && window.UIFeedback.updateBossHealth) {
                    window.UIFeedback.updateBossHealth(
                        window.GameState.getBossHealth() - damage
                    );
                }
            }
        }
    }, 100);
    
    window.GameState.setDemonHitInterval(demonHitInterval);
}

function playDemonCleaveAnimation(damage = 0) {
    if (!window.GameState) return;
    
    const demonAnimationState = window.GameState.getDemonAnimationState();
    
    if (demonAnimationState === 'cleave' || demonAnimationState === 'walk') {
        return;
    }
    
    const existingHitInterval = window.GameState.getDemonHitInterval();
    if (existingHitInterval) {
        clearInterval(existingHitInterval);
        window.GameState.setDemonHitInterval(null);
    }
    
    const demonSprite = document.getElementById('demon-sprite');
    if (!demonSprite) return;
    
    const cleaveFrames = [
        'demon_cleave_1.png', 'demon_cleave_2.png', 'demon_cleave_3.png', 'demon_cleave_4.png',
        'demon_cleave_5.png', 'demon_cleave_6.png', 'demon_cleave_7.png', 'demon_cleave_8.png',
        'demon_cleave_9.png', 'demon_cleave_10.png', 'demon_cleave_11.png', 'demon_cleave_12.png',
        'demon_cleave_13.png', 'demon_cleave_14.png', 'demon_cleave_15.png'
    ];
    
    window.GameState.setDemonAnimationState('cleave');
    let currentFrame = 0;
    
    const currentBossPhase = window.GameState.getCurrentBossPhase();
    const frameSpeed = currentBossPhase >= 2 ? 65 : 80;
    
    const demonCleaveInterval = setInterval(() => {
        if (currentFrame < cleaveFrames.length) {
            demonSprite.src = `../../assets/demon_cleave/${cleaveFrames[currentFrame]}`;
            currentFrame++;
        } else {
            clearInterval(demonCleaveInterval);
            window.GameState.setDemonCleaveInterval(null);
            window.GameState.setDemonAnimationState('idle');
            
            if (damage > 0 && window.UIFeedback && window.UIFeedback.updatePlayerHealth) {
                window.UIFeedback.updatePlayerHealth(
                    window.GameState.getPlayerHealth() - damage
                );
            }
        }
    }, frameSpeed);
    
    window.GameState.setDemonCleaveInterval(demonCleaveInterval);
}

function playDemonWalkAttack(damage = 0) {
    if (!window.GameState) return;
    
    const demonAnimationState = window.GameState.getDemonAnimationState();
    
    if (demonAnimationState === 'cleave' || demonAnimationState === 'walk') {
        return;
    }
    
    const existingHitInterval = window.GameState.getDemonHitInterval();
    if (existingHitInterval) {
        clearInterval(existingHitInterval);
        window.GameState.setDemonHitInterval(null);
    }
    
    const demonSprite = document.getElementById('demon-sprite');
    if (!demonSprite) return;
    
    const walkFrames = [
        'demon_walk_1.png', 'demon_walk_2.png', 'demon_walk_3.png', 'demon_walk_4.png',
        'demon_walk_5.png', 'demon_walk_6.png', 'demon_walk_7.png', 'demon_walk_8.png',
        'demon_walk_9.png', 'demon_walk_10.png', 'demon_walk_11.png', 'demon_walk_12.png'
    ];
    
    window.GameState.setDemonAnimationState('walk');
    let currentFrame = 0;
    const totalFrames = walkFrames.length * 2;
    
    const currentBossPhase = window.GameState.getCurrentBossPhase();
    const frameSpeed = currentBossPhase === 3 ? 50 : 70;
    
    const walkInterval = setInterval(() => {
        if (currentFrame < totalFrames) {
            const frameIndex = currentFrame % walkFrames.length;
            demonSprite.src = `../../assets/demon walk/${walkFrames[frameIndex]}`;
            currentFrame++;
        } else {
            clearInterval(walkInterval);
            window.GameState.setDemonAnimationState('idle');
            
            if (damage > 0 && window.UIFeedback && window.UIFeedback.updatePlayerHealth) {
                window.UIFeedback.updatePlayerHealth(
                    window.GameState.getPlayerHealth() - damage
                );
            }
        }
    }, frameSpeed);
}

function playDemonDeathAnimation(callback) {
    if (!window.GameState) return;
    
    const demonIdleInterval = window.GameState.getDemonIdleInterval();
    if (demonIdleInterval) {
        clearInterval(demonIdleInterval);
        window.GameState.setDemonIdleInterval(null);
    }
    
    const demonHitInterval = window.GameState.getDemonHitInterval();
    if (demonHitInterval) {
        clearInterval(demonHitInterval);
        window.GameState.setDemonHitInterval(null);
    }
    
    const demonCleaveInterval = window.GameState.getDemonCleaveInterval();
    if (demonCleaveInterval) {
        clearInterval(demonCleaveInterval);
        window.GameState.setDemonCleaveInterval(null);
    }
    
    if (window.bossColorCycle) {
        clearInterval(window.bossColorCycle);
        window.bossColorCycle = null;
    }
    
    const bossBox = document.querySelector('.boss-box');
    if (bossBox) {
        bossBox.style.animation = '';
    }
    
    const demonSprite = document.getElementById('demon-sprite');
    if (!demonSprite) {
        if (callback) callback();
        return;
    }
    
    const deathFrames = [
        'demon_death_1.png', 'demon_death_2.png', 'demon_death_3.png', 'demon_death_4.png',
        'demon_death_5.png', 'demon_death_6.png', 'demon_death_7.png', 'demon_death_8.png',
        'demon_death_9.png', 'demon_death_10.png', 'demon_death_11.png', 'demon_death_12.png',
        'demon_death_13.png', 'demon_death_14.png', 'demon_death_15.png', 'demon_death_16.png',
        'demon_death_17.png', 'demon_death_18.png', 'demon_death_19.png', 'demon_death_20.png',
        'demon_death_21.png', 'demon_death_22.png'
    ];
    
    window.GameState.setDemonAnimationState('death');
    let currentFrame = 0;
    
    demonSprite.style.transition = 'opacity 3s ease-out, transform 3s ease-out';
    
    const deathInterval = setInterval(() => {
        if (currentFrame < deathFrames.length) {
            demonSprite.src = `../../assets/demon_death/${deathFrames[currentFrame]}`;
            
            if (currentFrame > deathFrames.length * 0.7) {
                const fadeProgress = (currentFrame - deathFrames.length * 0.7) / (deathFrames.length * 0.3);
                demonSprite.style.opacity = (1 - fadeProgress).toString();
                demonSprite.style.transform = `scale(${1 - fadeProgress * 0.3})`;
            }
            
            currentFrame++;
        } else {
            clearInterval(deathInterval);
            
            setTimeout(() => {
                demonSprite.style.opacity = '0';
                demonSprite.style.transform = 'scale(0.5)';
                
                setTimeout(() => {
                    if (callback) callback();
                }, 500);
            }, 200);
        }
    }, 100);
}

window.BossSystem = {
    checkBossPhase,
    onBossPhaseChange,
    showPhaseTransitionMessage,
    startDemonIdleAnimation,
    playDemonHitAnimation,
    playDemonCleaveAnimation,
    playDemonWalkAttack,
    playDemonDeathAnimation
};

