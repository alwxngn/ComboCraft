document.addEventListener('DOMContentLoaded', function() {
    if (!window.GameState || !window.GestureDetection) {
        setTimeout(() => initializeGame(), 100);
        return;
    }
    initializeGame();
});

function initializeGame() {
    if (window.GameOver && window.GameOver.resetHealth) {
        window.GameOver.resetHealth();
    }
    
    if (window.GameState) {
        window.GameState.setGameStartTime(Date.now());
        window.GameState.setHintShown(false);
    }
    
    if (window.GestureDetection && window.GestureDetection.startWebcam) {
        window.GestureDetection.startWebcam();
    }
    
    if (window.BossSystem && window.BossSystem.startDemonIdleAnimation) {
        window.BossSystem.startDemonIdleAnimation();
    }
    
    if (window.GameState) {
        window.GameState.setGameRunning(true);
    }
    
    if (window.Sounds && window.Sounds.backgroundMusic) {
        window.Sounds.backgroundMusic.play().catch(() => {});
    }
    
    if (window.GameLoop && window.GameLoop.gameLoop) {
        window.GameLoop.gameLoop();
    }
}
