function playFireballAnimation(damage = 10) {
    if (window.Sounds && window.Sounds.fireball) {
        const sound = window.Sounds.fireball.cloneNode();
        sound.volume = 0.6;
        sound.play().catch(() => {});
    }
    
    const playerBox = document.querySelector('.player-box');
    const bossBox = document.querySelector('.boss-box');
    const boxContainer = document.querySelector('.box-container');
    const fireballFrames = ['FB001.png', 'FB002.png', 'FB003.png', 'FB004.png', 'FB005.png'];
    
    let startX = 300; 
    let startY = 350;
    
    const lastHandPosition = window.GameState ? window.GameState.getLastHandPosition() : null;
    if (lastHandPosition) {
        startX = 600 - lastHandPosition.x;
        startY = lastHandPosition.y;
    }
    
    const playerRect = playerBox.getBoundingClientRect();
    const containerRect = boxContainer.getBoundingClientRect();
    const offsetX = playerRect.left - containerRect.left;
    
    const fireball = document.createElement('img');
    fireball.className = 'fireball-sprite';
    fireball.src = `../../assets/fireball/${fireballFrames[0]}`;
    fireball.style.position = 'absolute';
    fireball.style.left = (offsetX + startX) + 'px';
    fireball.style.top = startY + 'px';
    fireball.style.width = '100px';
    fireball.style.height = '100px';
    fireball.style.transform = 'translate(-50%, -50%)';
    fireball.style.zIndex = '10';
    
    boxContainer.appendChild(fireball);
    
    let currentFrame = 0;
    let currentX = offsetX + startX;
    let currentSize = 100;
    const targetX = offsetX + 600 + 300;
    const frameInterval = 30;
    const speed = 30;
    const growthRate = 3;
    
    const animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % fireballFrames.length;
        fireball.src = `../../assets/fireball/${fireballFrames[currentFrame]}`;
        currentX += speed;
        currentSize += growthRate;
        fireball.style.left = currentX + 'px';
        fireball.style.width = currentSize + 'px';
        fireball.style.height = currentSize + 'px';
        
        const fireballCenterY = startY;
        if (window.Collectibles && window.Collectibles.checkManaBallCollision) {
            window.Collectibles.checkManaBallCollision(currentX, fireballCenterY, currentSize);
        }
        
        if (window.Collectibles && window.Collectibles.checkHealOrbCollision) {
            window.Collectibles.checkHealOrbCollision(currentX, fireballCenterY, currentSize);
        }

        if (currentX > targetX) {
            clearInterval(animationInterval);
            fireball.remove();
            
            if (window.BossSystem && window.BossSystem.playDemonHitAnimation) {
                window.BossSystem.playDemonHitAnimation(damage);
            }
        }
    }, frameInterval);
}

function playIceShardAnimation() {
    if (window.Sounds && window.Sounds.iceShard) {
        const sound = window.Sounds.iceShard.cloneNode();
        sound.volume = 0.9;
        sound.play().catch(() => {});
    }
    
    const boxContainer = document.querySelector('.box-container');
    
    const iceShardFrames = [
        'VFX 1 Repeatable1.png',
        'VFX 1 Repeatable2.png',
        'VFX 1 Repeatable3.png',
        'VFX 1 Repeatable4.png',
        'VFX 1 Repeatable5.png',
        'VFX 1 Repeatable6.png',
        'VFX 1 Repeatable7.png',
        'VFX 1 Repeatable8.png',
        'VFX 1 Repeatable9.png',
        'VFX 1 Repeatable10.png'
    ];
    
    let startX = 200;
    let startY = 350;
    
    const lastHandPosition = window.GameState ? window.GameState.getLastHandPosition() : null;
    if (lastHandPosition) {
        startX = lastHandPosition.x;
        startY = lastHandPosition.y;
    }
    
    const iceShard = document.createElement('img');
    iceShard.className = 'ice-shard-sprite';
    iceShard.src = `../../assets/ice shards/${iceShardFrames[0]}`;
    iceShard.style.position = 'absolute';
    iceShard.style.left = startX + 'px';
    iceShard.style.top = startY + 'px';
    iceShard.style.width = '120px';
    iceShard.style.height = '120px';
    iceShard.style.transform = 'translate(-50%, -50%)';
    iceShard.style.zIndex = '10';
    
    boxContainer.appendChild(iceShard);
    
    let currentFrame = 0;
    let currentX = startX;
    let currentSize = 120;
    const containerRect = boxContainer.getBoundingClientRect();
    const targetX = containerRect.width - 300;
    const frameInterval = 30;
    const speed = 32;
    const growthRate = 2.5;
    
    const animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % iceShardFrames.length;
        iceShard.src = `../../assets/ice shards/${iceShardFrames[currentFrame]}`;
        
        currentX += speed;
        currentSize += growthRate;
        iceShard.style.left = currentX + 'px';
        iceShard.style.width = currentSize + 'px';
        iceShard.style.height = currentSize + 'px';
        
        if (window.Collectibles && window.Collectibles.checkManaBallCollision) {
            window.Collectibles.checkManaBallCollision(currentX, startY, currentSize);
        }
        
        if (window.Collectibles && window.Collectibles.checkHealOrbCollision) {
            window.Collectibles.checkHealOrbCollision(currentX, startY, currentSize);
        }
        
        if (currentX > targetX) {
            clearInterval(animationInterval);
            iceShard.remove();
            if (window.BossSystem && window.BossSystem.playDemonHitAnimation) {
                window.BossSystem.playDemonHitAnimation(8);
            }
        }
    }, frameInterval);
}

function playLightningAnimation() {
    if (window.Sounds && window.Sounds.thunder) {
        const sound = window.Sounds.thunder.cloneNode();
        sound.volume = 0.7;
        sound.play().catch(() => {});
    }
    
    const bossBox = document.querySelector('.boss-box');
    const demonSprite = document.getElementById('demon-sprite');
    
    const lightningFrames = [
        'lightning_line1b8.png',
        'lightning_line1b9.png',
        'lightning_line1b11.png',
        'lightning_line1b12.png'
    ];
    
    const lightning = document.createElement('img');
    lightning.className = 'lightning-sprite';
    lightning.src = `../../assets/lighting/${lightningFrames[0]}`;
    lightning.style.position = 'absolute';
    lightning.style.left = '50%';
    lightning.style.top = '0';
    lightning.style.width = '300px';
    lightning.style.height = '700px';
    lightning.style.transform = 'translateX(-50%)';
    lightning.style.zIndex = '15';
    lightning.style.opacity = '0.9';
    
    bossBox.appendChild(lightning);
    
    let currentFrame = 0;
    let flashCount = 0;
    const maxFlashes = 3;
    const frameInterval = 40;
    
    const animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % lightningFrames.length;
        lightning.src = `../../assets/lighting/${lightningFrames[currentFrame]}`;
        
        if (currentFrame === 0) {
            flashCount++;
        }
        
        if (flashCount >= maxFlashes) {
            clearInterval(animationInterval);
            lightning.remove();
            if (window.BossSystem && window.BossSystem.playDemonHitAnimation) {
                window.BossSystem.playDemonHitAnimation(12);
            }
        }
    }, frameInterval);
}

window.SpellAnimations = {
    playFireballAnimation,
    playIceShardAnimation,
    playLightningAnimation
};
