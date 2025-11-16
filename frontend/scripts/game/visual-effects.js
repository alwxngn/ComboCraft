function showComboMessage(text, color = 0xFFD700) {
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'absolute';
    message.style.top = '20%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '48px';
    message.style.fontWeight = 'bold';
    message.style.color = `#${color.toString(16).padStart(6, '0')}`;
    message.style.textShadow = '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5)';
    message.style.zIndex = '1000';
    message.style.pointerEvents = 'none';
    message.style.animation = 'comboPulse 0.5s ease-out';
    message.style.fontFamily = '"Press Start 2P", cursive';
    
    if (!document.getElementById('combo-animation-style')) {
        const style = document.createElement('style');
        style.id = 'combo-animation-style';
        style.textContent = `
            @keyframes comboPulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }
    
    boxContainer.appendChild(message);
    
    setTimeout(() => {
        message.style.transition = 'all 0.5s ease-out';
        message.style.opacity = '0';
        message.style.transform = 'translate(-50%, -100%) scale(0.5)';
        setTimeout(() => message.remove(), 500);
    }, 2000);
}

function showDamageNumber(damage, x, y, color = '#FF4444', isHealing = false) {
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const damageText = document.createElement('div');
    damageText.textContent = isHealing ? `+${damage}` : `-${damage}`;
    damageText.style.position = 'absolute';
    damageText.style.left = x + 'px';
    damageText.style.top = y + 'px';
    damageText.style.fontSize = '36px';
    damageText.style.fontWeight = 'bold';
    damageText.style.color = color;
    damageText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    damageText.style.zIndex = '1001';
    damageText.style.pointerEvents = 'none';
    damageText.style.userSelect = 'none';
    damageText.style.fontFamily = '"Press Start 2P", cursive';
    
    boxContainer.appendChild(damageText);
    
    let startY = y;
    let opacity = 1;
    let scale = 1;
    const animate = () => {
        startY -= 2;
        opacity -= 0.02;
        scale += 0.02;
        damageText.style.top = startY + 'px';
        damageText.style.opacity = opacity;
        damageText.style.transform = `scale(${scale})`;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            damageText.remove();
        }
    };
    requestAnimationFrame(animate);
}

let lastDetectedGesture = 'NONE';
function showGestureFeedback(gesture) {
    if (gesture === 'NONE' || gesture === lastDetectedGesture) return;
    
    lastDetectedGesture = gesture;
    
    const canvas = document.getElementById('output-canvas');
    if (!canvas) return;
    
    canvas.style.transition = 'filter 0.1s';
    canvas.style.filter = 'brightness(1.3) saturate(1.5)';
    
    setTimeout(() => {
        canvas.style.filter = 'brightness(1) saturate(1)';
    }, 100);
}

function drawSpellCircle(ctx, landmarks, gesture, canvasWidth, canvasHeight) {
    if (gesture === 'NONE') return;
    
    const middleFingerKnuckle = landmarks[9];
    const centerX = middleFingerKnuckle.x * canvasWidth;
    const centerY = middleFingerKnuckle.y * canvasHeight;
    
    let circleConfig = {
        outerColor: '#FF4500',
        innerColor: '#FF6347',
        runeColor: '#FFD700',
        size: 80,
        rotation: 0
    };
    
    const time = Date.now() / 1000;
    const rotationSpeed = 0.5;
    
    switch(gesture) {
        case 'FIST':
            circleConfig = {
                outerColor: '#FF4500',
                innerColor: '#FF6347',
                runeColor: '#FFD700',
                size: 180,
                rotation: time * rotationSpeed
            };
            break;
        case 'OPEN_PALM':
            circleConfig = {
                outerColor: '#4169E1',
                innerColor: '#64B5F6',
                runeColor: '#B0E0E6',
                size: 200,
                rotation: -time * rotationSpeed
            };
            break;
        case 'POINT':
            circleConfig = {
                outerColor: '#9370DB',
                innerColor: '#BA55D3',
                runeColor: '#FFFFFF',
                size: 170,
                rotation: time * rotationSpeed * 1.5
            };
            break;
        default:
            return;
    }
    
    ctx.save();
    
    const gradient1 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, circleConfig.size);
    gradient1.addColorStop(0, circleConfig.innerColor + '40');
    gradient1.addColorStop(0.5, circleConfig.outerColor + '20');
    gradient1.addColorStop(1, circleConfig.outerColor + '00');
    
    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleConfig.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = circleConfig.outerColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = circleConfig.outerColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleConfig.size * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = circleConfig.innerColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = circleConfig.innerColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleConfig.size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.translate(centerX, centerY);
    ctx.rotate(circleConfig.rotation);
    
    ctx.strokeStyle = circleConfig.runeColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = circleConfig.runeColor;
    
    const runeCount = gesture === 'OPEN_PALM' ? 6 : 8;
    const runeRadius = circleConfig.size * 0.5;
    
    for (let i = 0; i < runeCount; i++) {
        const angle = (Math.PI * 2 * i) / runeCount;
        const x = Math.cos(angle) * runeRadius;
        const y = Math.sin(angle) * runeRadius;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        
        if (gesture === 'FIST') {
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(-12, 16);
            ctx.lineTo(12, 16);
            ctx.closePath();
            ctx.stroke();
        } else if (gesture === 'OPEN_PALM') {
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(0, 20);
            ctx.moveTo(-16, -16);
            ctx.lineTo(16, 16);
            ctx.moveTo(-16, 16);
            ctx.lineTo(16, -16);
            ctx.stroke();
        } else if (gesture === 'POINT') {
            ctx.beginPath();
            ctx.moveTo(-12, -20);
            ctx.lineTo(0, 0);
            ctx.lineTo(-8, 0);
            ctx.lineTo(12, 20);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    ctx.strokeStyle = circleConfig.runeColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (gesture === 'FIST') {
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = circleConfig.runeColor + '40';
        ctx.fill();
    } else if (gesture === 'OPEN_PALM') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const x = Math.cos(angle) * 16;
            const y = Math.sin(angle) * 16;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    } else if (gesture === 'POINT') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? 20 : 10;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
    
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + time * 1.5;
        const dist = circleConfig.size * 0.7 + Math.sin(time * 2 + i) * 8;
        const px = centerX + Math.cos(angle) * dist;
        const py = centerY + Math.sin(angle) * dist;
        
        ctx.fillStyle = circleConfig.runeColor + '50';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function showManaGainFeedback(amount, x, y) {
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const manaText = document.createElement('div');
    manaText.textContent = `+${amount} Mana`;
    manaText.style.position = 'absolute';
    manaText.style.left = x + 'px';
    manaText.style.top = y + 'px';
    manaText.style.fontSize = '28px';
    manaText.style.fontWeight = 'bold';
    manaText.style.color = '#4A9EFF';
    manaText.style.textShadow = '0 0 6px rgba(74, 158, 255, 0.6), 0 0 12px rgba(74, 158, 255, 0.4), 1px 1px 2px rgba(0,0,0,0.8)';
    manaText.style.zIndex = '1002';
    manaText.style.pointerEvents = 'none';
    manaText.style.userSelect = 'none';
    manaText.style.fontFamily = '"Press Start 2P", cursive';
    
    boxContainer.appendChild(manaText);
    
    let startY = y;
    let opacity = 1;
    let scale = 0.8;
    const animate = () => {
        startY -= 3;
        opacity -= 0.015;
        scale += 0.02;
        manaText.style.top = startY + 'px';
        manaText.style.opacity = opacity;
        manaText.style.transform = `scale(${scale})`;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            manaText.remove();
        }
    };
    requestAnimationFrame(animate);
}

function showHealFeedback(amount, x, y) {
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;
    
    const healText = document.createElement('div');
    healText.textContent = `+${amount} HP`;
    healText.style.position = 'absolute';
    healText.style.left = x + 'px';
    healText.style.top = y + 'px';
    healText.style.fontSize = '28px';
    healText.style.fontWeight = 'bold';
    healText.style.color = '#00FF88';
    healText.style.textShadow = '0 0 6px rgba(0, 255, 136, 0.6), 0 0 12px rgba(0, 255, 136, 0.4), 1px 1px 2px rgba(0,0,0,0.8)';
    healText.style.zIndex = '1002';
    healText.style.pointerEvents = 'none';
    healText.style.userSelect = 'none';
    healText.style.fontFamily = '"Press Start 2P", cursive';
    
    boxContainer.appendChild(healText);
    
    let startY = y;
    let opacity = 1;
    let scale = 0.8;
    const animate = () => {
        startY -= 3;
        opacity -= 0.015;
        scale += 0.02;
        healText.style.top = startY + 'px';
        healText.style.opacity = opacity;
        healText.style.transform = `scale(${scale})`;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            healText.remove();
        }
    };
    requestAnimationFrame(animate);
}

function showChallengeSuccessMessage() {
    const boxContainer = document.querySelector('.box-container');
    if (!boxContainer) return;

    const messageElement = document.createElement('div');
    messageElement.textContent = 'CHALLENGE COMPLETE!';
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.fontSize = '48px';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.color = '#FFD700';
    messageElement.style.textShadow = '2px 2px 4px #000000';
    messageElement.style.zIndex = '100';
    messageElement.style.pointerEvents = 'none';
    messageElement.style.fontFamily = '"Press Start 2P", cursive';

    boxContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 2500);
}

window.VisualEffects = {
    showComboMessage,
    showDamageNumber,
    showGestureFeedback,
    drawSpellCircle,
    showManaGainFeedback,
    showHealFeedback,
    showChallengeSuccessMessage
};
