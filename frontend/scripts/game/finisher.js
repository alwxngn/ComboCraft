// Finisher Module - Finisher system when boss is defeated

function showFinisherMessage() {
    if (!window.GameState) return;
    
    const bossBox = document.querySelector('.boss-box');
    if (bossBox) {
        bossBox.style.animation = '';
        bossBox.style.transform = '';
    }
    
    const existingMessage = document.getElementById('finisher-message-overlay');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'finisher-message-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in;
    `;
    
    const message = document.createElement('div');
    message.textContent = 'UNLEASH 2 OPEN PALMS!';
    message.style.cssText = `
        font-size: 72px;
        font-weight: 900;
        color: #00BFFF;
        text-shadow: 
            0 0 20px rgba(0, 191, 255, 0.8),
            0 0 40px rgba(0, 191, 255, 0.6),
            0 0 60px rgba(0, 191, 255, 0.4),
            0 0 80px rgba(0, 191, 255, 0.2),
            2px 2px 4px rgba(0, 0, 0, 0.8);
        font-family: "Press Start 2P", cursive;
        letter-spacing: 8px;
        text-transform: uppercase;
        text-align: center;
        animation: pulse 1.5s ease-in-out infinite, slideDown 0.5s ease-out;
        line-height: 1.2;
        margin-bottom: 40px;
    `;
    
    const counter = document.createElement('div');
    counter.id = 'finisher-counter';
    counter.textContent = '0/2';
    counter.style.cssText = `
        font-size: 48px;
        font-weight: 700;
        color: #FFFFFF;
        text-shadow: 
            0 0 15px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(0, 191, 255, 0.6),
            2px 2px 4px rgba(0, 0, 0, 0.8);
        font-family: "Press Start 2P", cursive;
        text-align: center;
        animation: slideDown 0.5s ease-out 0.2s both;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
                opacity: 0.9;
            }
        }
        @keyframes slideDown {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        @keyframes counterPulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(message);
    overlay.appendChild(counter);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 500);
        }
    }, 3000);
}

function updateFinisherCounter() {
    if (!window.GameState) return;
    
    const counter = document.getElementById('finisher-counter');
    const finisherIceShardCount = window.GameState.getFinisherIceShardCount();
    
    if (counter) {
        counter.textContent = `${finisherIceShardCount}/2`;
        
        counter.style.animation = 'none';
        setTimeout(() => {
            counter.style.animation = 'counterPulse 0.3s ease-out';
        }, 10);
    }
}

function performFinisherAnimation() {
    if (!window.GameState || !window.BossSystem) return;
    
    const finisherMessage = document.getElementById('finisher-message-overlay');
    if (finisherMessage) {
        finisherMessage.remove();
    }
    
    console.log('EPIC FINISHER ANIMATION!');
    window.GameState.setFinisherMode(false);
    
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
    
    const boxContainer = document.querySelector('.box-container');
    const bossBox = document.querySelector('.boss-box');
    if (!boxContainer || !bossBox) return;
    
    const bossRect = bossBox.getBoundingClientRect();
    const containerRect = boxContainer.getBoundingClientRect();
    const centerX = bossRect.left - containerRect.left + bossRect.width / 2;
    const centerY = bossRect.top - containerRect.top + bossRect.height / 2;
    
    if (window.Sounds && window.Sounds.iceShard) {
        const iceSound1 = window.Sounds.iceShard.cloneNode();
        iceSound1.volume = 1.0;
        iceSound1.play().catch(err => console.log("Sound play failed:", err));
        
        setTimeout(() => {
            const iceSound2 = window.Sounds.iceShard.cloneNode();
            iceSound2.volume = 1.0;
            iceSound2.play().catch(err => console.log("Sound play failed:", err));
        }, 200);
    }
    
    if (window.VisualEffects && window.VisualEffects.showComboMessage) {
        window.VisualEffects.showComboMessage("EPIC FINISHER!", 0x00BFFF);
    }
    
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = centerX + 'px';
    explosion.style.top = centerY + 'px';
    explosion.style.width = '0px';
    explosion.style.height = '0px';
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.zIndex = '25';
    explosion.style.pointerEvents = 'none';
    boxContainer.appendChild(explosion);
    
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.left = '0px';
    flash.style.top = '0px';
    flash.style.width = '400px';
    flash.style.height = '400px';
    flash.style.transform = 'translate(-50%, -50%)';
    flash.style.borderRadius = '50%';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,255,1), rgba(173,216,230,0.9), rgba(135,206,250,0.7), rgba(70,130,180,0.5))';
    flash.style.opacity = '1';
    flash.style.zIndex = '26';
    explosion.appendChild(flash);
    
    const iceParticles = [];
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 40;
        const size = Math.random() * 10 + 5;
        
        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.borderRadius = '50%';
        particle.style.background = `radial-gradient(circle, rgba(255,255,255,1), rgba(173,216,230,0.9), rgba(135,206,250,0.7))`;
        particle.style.boxShadow = `0 0 ${size}px rgba(173,216,230,0.8), 0 0 ${size * 2}px rgba(135,206,250,0.6)`;
        particle.style.left = '0px';
        particle.style.top = '0px';
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.opacity = '1';
        explosion.appendChild(particle);
        
        iceParticles.push({
            element: particle,
            angle: angle,
            distance: 0,
            speed: Math.random() * 10 + 5
        });
    }
    
    const crystalParticles = [];
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 25;
        const size = Math.random() * 8 + 4;
        
        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size * 2.5 + 'px'; // Elongated like ice crystals
        particle.style.borderRadius = '2px';
        particle.style.background = `linear-gradient(to bottom, rgba(255,255,255,1), rgba(200,230,255,0.9), rgba(135,206,250,0.7))`;
        particle.style.boxShadow = `0 0 ${size}px rgba(255,255,255,0.8)`;
        particle.style.left = '0px';
        particle.style.top = '0px';
        particle.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
        particle.style.opacity = '1';
        explosion.appendChild(particle);
        
        crystalParticles.push({
            element: particle,
            angle: angle,
            distance: 0,
            speed: Math.random() * 8 + 4
        });
    }
    
    let shakeOffset = 0;
    const shakeInterval = setInterval(() => {
        shakeOffset = (Math.random() - 0.5) * 10;
        boxContainer.style.transform = `translate(${shakeOffset}px, ${shakeOffset}px)`;
    }, 50);
    
    const screenFlash = document.createElement('div');
    screenFlash.style.position = 'fixed';
    screenFlash.style.top = '0';
    screenFlash.style.left = '0';
    screenFlash.style.width = '100%';
    screenFlash.style.height = '100%';
    screenFlash.style.background = 'rgba(255,255,255,0.3)';
    screenFlash.style.zIndex = '9998';
    screenFlash.style.pointerEvents = 'none';
    screenFlash.style.opacity = '0';
    document.body.appendChild(screenFlash);
    
    let frame = 0;
    const maxFrames = 60;
    
    const animationInterval = setInterval(() => {
        frame++;
        
        if (frame < 10) {
            const size = 400 + frame * 30;
            flash.style.width = size + 'px';
            flash.style.height = size + 'px';
            screenFlash.style.opacity = Math.min(0.5, frame / 20);
        } else if (frame < 30) {
            flash.style.opacity = Math.max(0, 1 - ((frame - 10) / 20));
            screenFlash.style.opacity = Math.max(0, 0.5 - ((frame - 10) / 40));
        }
        
        iceParticles.forEach(particle => {
            particle.distance += particle.speed;
            const x = Math.cos(particle.angle) * particle.distance;
            const y = Math.sin(particle.angle) * particle.distance;
            particle.element.style.left = x + 'px';
            particle.element.style.top = y + 'px';
            particle.element.style.opacity = Math.max(0, 1 - (frame / maxFrames));
        });
        
        crystalParticles.forEach(particle => {
            particle.distance += particle.speed;
            const x = Math.cos(particle.angle) * particle.distance;
            const y = Math.sin(particle.angle) * particle.distance;
            particle.element.style.left = x + 'px';
            particle.element.style.top = y + 'px';
            particle.element.style.opacity = Math.max(0, 1 - (frame / maxFrames));
        });
        
        if (frame >= maxFrames) {
            clearInterval(animationInterval);
            clearInterval(shakeInterval);
            boxContainer.style.transform = '';
            explosion.remove();
            screenFlash.remove();
            
            if (window.BossSystem && window.BossSystem.playDemonDeathAnimation) {
                window.BossSystem.playDemonDeathAnimation(() => {
                    if (window.GameOver && window.GameOver.showGameOverScreen) {
                        window.GameOver.showGameOverScreen(true);
                    }
                });
            }
        }
    }, 16);
}

window.Finisher = {
    showFinisherMessage,
    updateFinisherCounter,
    performFinisherAnimation
};

