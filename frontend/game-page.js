// Initialize health values
let playerHealth = 100;
let bossHealth = 100;
let gameRunning = false;
let comboCount = 0; // <-- FIX 2.1: Declared comboCount here

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Game loaded!");
    resetHealth();
    gameRunning = true; // <-- START THE GAME!
    gameLoop();         // <-- START THE LOOP!
});

// Function to update player health
function updatePlayerHealth(newHealth) {
    playerHealth = Math.max(0, Math.min(100, newHealth));
    const playerHealthBar = document.getElementById('player-hp-fill');
    
    if (playerHealthBar) {
        playerHealthBar.style.width = playerHealth + '%';
    }
    
    console.log('Player health:', playerHealth + '%');
    checkGameEnd();
}

// Function to update boss health
function updateBossHealth(newHealth) {
    bossHealth = Math.max(0, Math.min(100, newHealth));
    const bossHealthBar = document.getElementById('boss-hp-fill');
    
    if (bossHealthBar) {
        bossHealthBar.style.width = bossHealth + '%';
    }
    
    console.log('Boss health:', bossHealth + '%');
    checkGameEnd();
}

function resetHealth() {
    updatePlayerHealth(100);
    updateBossHealth(100);
    console.log('Health reset!');
    
}

function checkGameEnd() {
    if (playerHealth <= 0) {
        console.log('💀 Player defeated! Boss wins!');
        gameRunning = false;
    } else if (bossHealth <= 0) {
        console.log('🏆 Boss defeated! Player wins!');
        gameRunning = false;
    }
}

// ALEXES CONNECTOR TO SORCERER

async function gameLoop(){
    if (!gameRunning) return;
        
    let command = "NONE";
    let event = "NONE";


    try {
        // my 5001 port // getting all the commands from the flask
        const response = await fetch('http://localhost:5001/get_command');
        const data = await response.json();

        command = data.command
        event = data.event || "NONE"; // (FOR the qte)
        
        // --- FIX 2.2: Moved this line INSIDE the 'try' block ---
        comboCount = data.combo; 
        
    } catch (error) {
        console.error("Backend server is down!");
        requestAnimationFrame(gameLoop);
        return;
    }

    // --- This is the "Hand-off" ---
    // It calls Ally's functions based on your commands.
    // This logic is 100% correct!
    if (command === "FIREBALL") {
        let damage = 10
        updateBossHealth(bossHealth - damage);
    }

    else if (command === "ICE_SHARD") {
        let damage = 8
        updateBossHealth(bossHealth - damage);
    }

    else if (command === "HEAL") {
        let hp = 12
        updatePlayerHealth(playerHealth + hp);
        
    }

    else if (command === "EXPLOSION_COMBO") {
        let damage = 20
        updateBossHealth(bossHealth - damage);
    }

    else if (command === "HEALING_LIGHT_COMBO") {
        let damage = 12
        let hp = 5
        updateBossHealth(bossHealth - damage);
        updatePlayerHealth(playerHealth + hp);
    }

    if (Math.random() < 0.01) { 
        let bossDamage = 15; // The boss hits for 15 damage
        console.log('Boss attacks for', bossDamage, 'damage!');
        
        // --- HERE IT IS! ---
        // We call Ally's function to hurt the player!
        updatePlayerHealth(playerHealth - bossDamage);
    }
    
    // --- FIX 1: Changed 'data.event' to 'event' ---
    if (event !== "NONE") {
        console.log(`EVENT: Server wants us to do ${event}!`);
        // TODO: Show this on the UI
        
        // --- FIX 1.2: Also fixed it here ---
        if (event === "WEAKFIRE" && command === "FIREBALL") {
            console.log("WEAK POINT HIT! +10 DAMAGE!");
            updateBossHealth(bossHealth - 10);
        }
    }
    
    // (The line `comboCount = data.combo;` was here, but we moved it up)
    
    requestAnimationFrame(gameLoop);
}

// (We can delete the old DOMContentLoaded listener, as we have a new one)