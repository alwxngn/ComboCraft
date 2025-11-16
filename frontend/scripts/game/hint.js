// Hint Module - Hint overlay system

function showOrbHintOverlay() {
    if (!window.GameState) return;
    
    window.GameState.setGameRunning(false);
    
    const existingOverlay = document.getElementById('hint-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'hint-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(20, 20, 40, 0.95) 0%, rgba(5, 5, 15, 0.98) 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9998;
        animation: fadeIn 0.5s ease-in;
        overflow: hidden;
    `;
    
    if (!document.getElementById('hint-overlay-styles')) {
        const style = document.createElement('style');
        style.id = 'hint-overlay-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const title = document.createElement('h1');
    title.textContent = 'TIP';
    title.style.cssText = `
        color: #d4a060;
        font-size: 64px;
        font-weight: 800;
        margin-bottom: 30px;
        letter-spacing: 6px;
        text-transform: uppercase;
        animation: slideUp 0.8s ease-out;
        font-family: "Press Start 2P", cursive;
        position: relative;
        z-index: 10;
        text-shadow: 0 0 8px rgba(200, 100, 60, 0.6), 0 0 15px rgba(180, 80, 50, 0.4), 1px 1px 3px rgba(0,0,0,0.8);
    `;
    
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 24px; color: #e8e8e8;">Aim for <span style="color: #00FF88; font-weight: bold;">GREEN life orbs</span> and</div>
        <div style="margin-bottom: 20px; font-size: 24px; color: #e8e8e8;"><span style="color: #4A9EFF; font-weight: bold;">BLUE mana orbs</span> with</div>
        <div style="margin-bottom: 30px; font-size: 24px; color: #e8e8e8;">your <span style="color: #64B5F6; font-weight: bold;">ICE SHARD</span> spell!</div>
    `;
    message.style.cssText = `
        color: #e8e8e8;
        font-size: 24px;
        text-align: center;
        margin-bottom: 40px;
        animation: slideUp 0.5s ease-out 0.3s both;
        font-family: "Press Start 2P", cursive;
        font-weight: 400;
        position: relative;
        z-index: 10;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        line-height: 1.8;
        max-width: 800px;
        padding: 0 20px;
    `;
    
    window.hintOverlay = overlay;
    window.hintGestureCheckInterval = null;
    
    window.hintGestureCheckInterval = setInterval(() => {
        const lastSentGesture = window.GestureDetection && window.GestureDetection.getLastSentGesture ? 
            window.GestureDetection.getLastSentGesture() : 'NONE';
        
        if (lastSentGesture === 'THUMBS_UP') {
            clearInterval(window.hintGestureCheckInterval);
            window.hintGestureCheckInterval = null;
            window.hintOverlay = null;
            overlay.remove();
            window.GameState.setGameRunning(true);
            if (window.GameLoop && window.GameLoop.gameLoop) {
                window.GameLoop.gameLoop();
            }
        }
    }, 100);
    
    const instructionText = document.createElement('div');
    instructionText.textContent = '👆 Give a THUMBS UP to continue!';
    instructionText.style.cssText = `
        color: #64B5F6;
        font-size: 18px;
        margin-top: 20px;
        animation: slideUp 0.5s ease-out 0.7s both;
        font-family: "Press Start 2P", cursive;
        font-weight: 400;
        position: relative;
        z-index: 10;
        text-shadow: 0 0 8px rgba(100, 181, 246, 0.6), 1px 1px 2px rgba(0,0,0,0.8);
    `;
    
    overlay.appendChild(title);
    overlay.appendChild(message);
    overlay.appendChild(instructionText);
    document.body.appendChild(overlay);
}

window.Hint = {
    showOrbHintOverlay
};

