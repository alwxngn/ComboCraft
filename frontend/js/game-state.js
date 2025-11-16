// Game State Management
export let playerHealth = 250;
export const MAX_PLAYER_HEALTH = 250;
export let bossHealth = 200;
export const MAX_BOSS_HEALTH = 200;
export let gameRunning = false;
export let comboCount = 0;
export let highestCombo = 0;
export let currentMana = 100;
export let maxMana = 100;
export let manaBalls = [];
export let lastManaBallSpawn = 0;
export const MANA_BALL_SPAWN_INTERVAL = 4000;
export let healOrbs = [];
export let lastHealOrbSpawn = 0;
export const HEAL_ORB_SPAWN_INTERVAL = 6000;
export const HEAL_ORB_HEAL_AMOUNT = 25;
export let gameStartTime = Date.now();

// Boss phase system
export let currentBossPhase = 1;
export let lastPhaseCheck = 0;

// Setters for state that needs to be modified from other modules
export function setPlayerHealth(value) {
    playerHealth = value;
}

export function setBossHealth(value) {
    bossHealth = value;
}

export function setGameRunning(value) {
    gameRunning = value;
}

export function setComboCount(value) {
    comboCount = value;
}

export function setHighestCombo(value) {
    highestCombo = value;
}

export function setCurrentMana(value) {
    currentMana = value;
}

export function setCurrentBossPhase(value) {
    currentBossPhase = value;
}

export function resetGameState() {
    playerHealth = MAX_PLAYER_HEALTH;
    bossHealth = MAX_BOSS_HEALTH;
    gameRunning = true;
    comboCount = 0;
    currentMana = maxMana;
    manaBalls = [];
    healOrbs = [];
    gameStartTime = Date.now();
    currentBossPhase = 1;
}
