function spawnManaBall() {
    if (!window.GameState) return;
    
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const containerRect = boxContainer.getBoundingClientRect();
    const x = containerRect.width * 0.6 + Math.random() * containerRect.width * 0.3;
    const y = 100 + Math.random() * (containerRect.height - 200);
    
    const manaBall = document.createElement('div');
    manaBall.className = 'mana-ball';
    manaBall.style.left = x + 'px';
    manaBall.style.top = y + 'px';
    manaBall.id = 'mana-ball-' + Date.now();
    
    boxContainer.appendChild(manaBall);
    
    const ballData = {
        element: manaBall,
        x: x,
        y: y,
        width: 40,
        height: 40,
        id: manaBall.id
    };
    
    const manaBalls = window.GameState.getManaBalls();
    manaBalls.push(ballData);
    
    setTimeout(() => {
        const index = manaBalls.findIndex(b => b.id === ballData.id);
        if (index !== -1) {
            manaBalls.splice(index, 1);
            manaBall.remove();
        }
    }, 10000);
}

function spawnHealOrb() {
    if (!window.GameState) return;
    
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const containerRect = boxContainer.getBoundingClientRect();
    const x = containerRect.width * 0.3 + Math.random() * containerRect.width * 0.4;
    const y = 100 + Math.random() * (containerRect.height - 200);
    
    const healOrb = document.createElement('div');
    healOrb.className = 'heal-orb';
    healOrb.style.left = x + 'px';
    healOrb.style.top = y + 'px';
    healOrb.id = 'heal-orb-' + Date.now();
    
    boxContainer.appendChild(healOrb);
    
    const orbData = {
        element: healOrb,
        x: x,
        y: y,
        width: 45,
        height: 45,
        id: healOrb.id
    };
    
    const healOrbs = window.GameState.getHealOrbs();
    healOrbs.push(orbData);
    
    setTimeout(() => {
        const index = healOrbs.findIndex(o => o.id === orbData.id);
        if (index !== -1) {
            healOrbs.splice(index, 1);
            healOrb.remove();
        }
    }, 12000);
}

function checkHealOrbCollision(projectileX, projectileY, projectileSize) {
    if (!window.GameState) return false;
    
    const healOrbs = window.GameState.getHealOrbs();
    
    for (let i = healOrbs.length - 1; i >= 0; i--) {
        const orb = healOrbs[i];
        const orbCenterX = orb.x + 22.5;
        const orbCenterY = orb.y + 22.5;
        
        const distance = Math.sqrt(
            Math.pow(projectileX - orbCenterX, 2) + 
            Math.pow(projectileY - orbCenterY, 2)
        );
        
        if (distance < (projectileSize / 2 + 22.5)) {
            orb.element.remove();
            healOrbs.splice(i, 1);
            
            const boxContainer = document.querySelector('.box-container');
            if (boxContainer && window.VisualEffects && window.VisualEffects.showHealFeedback) {
                const orbRect = orb.element.getBoundingClientRect();
                const containerRect = boxContainer.getBoundingClientRect();
                const x = orbRect.left - containerRect.left + 22.5;
                const y = orbRect.top - containerRect.top + 22.5;
                window.VisualEffects.showHealFeedback(window.GameState.HEAL_ORB_HEAL_AMOUNT, x, y);
            }
            
            if (window.UIFeedback && window.UIFeedback.updatePlayerHealth) {
                window.UIFeedback.updatePlayerHealth(
                    window.GameState.getPlayerHealth() + window.GameState.HEAL_ORB_HEAL_AMOUNT
                );
            }
            
            return true;
        }
    }
    return false;
}

function checkManaBallCollision(projectileX, projectileY, projectileSize) {
    if (!window.GameState) return false;
    
    const manaBalls = window.GameState.getManaBalls();
    
    for (let i = manaBalls.length - 1; i >= 0; i--) {
        const ball = manaBalls[i];
        const ballCenterX = ball.x + 20;
        const ballCenterY = ball.y + 20;
        
        const distance = Math.sqrt(
            Math.pow(projectileX - ballCenterX, 2) + 
            Math.pow(projectileY - ballCenterY, 2)
        );
        
        if (distance < (projectileSize / 2 + 20)) {
            const manaAmount = 20;
            ball.element.remove();
            manaBalls.splice(i, 1);
            
            const boxContainer = document.querySelector('.box-container');
            if (boxContainer && window.VisualEffects && window.VisualEffects.showManaGainFeedback) {
                const ballRect = ball.element.getBoundingClientRect();
                const containerRect = boxContainer.getBoundingClientRect();
                const x = ballRect.left - containerRect.left + 20;
                const y = ballRect.top - containerRect.top + 20;
                window.VisualEffects.showManaGainFeedback(manaAmount, x, y);
            }
            
            fetch('http://localhost:5001/add_mana', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({amount: manaAmount})
            }).catch(() => {});
            
            return true;
        }
    }
    return false;
}

window.Collectibles = {
    spawnManaBall,
    spawnHealOrb,
    checkHealOrbCollision,
    checkManaBallCollision
};
