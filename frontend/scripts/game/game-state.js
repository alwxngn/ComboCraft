let playerHealth = 250;
const MAX_PLAYER_HEALTH = 250;
let bossHealth = 150;
const MAX_BOSS_HEALTH = 150;
let gameRunning = false;

let comboCount = 0;
let highestCombo = 0;
let comboJustReset = false;

let currentMana = 100;
let maxMana = 100;
let manaBalls = [];
let lastManaBallSpawn = 0;
const MANA_BALL_SPAWN_INTERVAL = 4000;

let healOrbs = [];
let lastHealOrbSpawn = 0;
const HEAL_ORB_SPAWN_INTERVAL = 6000;
const HEAL_ORB_HEAL_AMOUNT = 25;

let lastHandPosition = null;
let demonAnimationState = 'idle';
let demonIdleInterval = null;
let demonHitInterval = null;
let demonCleaveInterval = null;
let lastBossAttackCheck = 0;
const BOSS_ATTACK_CHECK_INTERVAL = 1500;

let currentBossPhase = 1;
let gameStartTime = Date.now();

let finisherMode = false;
let finisherIceShardCount = 0;
let finisherTimeout = null;
let finisherMessageShown = false;
const FINISHER_TIME_LIMIT = 10000;

let hintShown = false;
const HINT_DELAY = 5000;

window.GameState = {
    getPlayerHealth: () => playerHealth,
    setPlayerHealth: (value) => { playerHealth = value; },
    getMaxPlayerHealth: () => MAX_PLAYER_HEALTH,
    getBossHealth: () => bossHealth,
    setBossHealth: (value) => { bossHealth = value; },
    getMaxBossHealth: () => MAX_BOSS_HEALTH,
    
    isGameRunning: () => gameRunning,
    setGameRunning: (value) => { gameRunning = value; },
    
    getComboCount: () => comboCount,
    setComboCount: (value) => { comboCount = value; },
    getHighestCombo: () => highestCombo,
    setHighestCombo: (value) => { highestCombo = value; },
    getComboJustReset: () => comboJustReset,
    setComboJustReset: (value) => { comboJustReset = value; },
    
    getCurrentMana: () => currentMana,
    setCurrentMana: (value) => { currentMana = value; },
    getMaxMana: () => maxMana,
    setMaxMana: (value) => { maxMana = value; },
    getManaBalls: () => manaBalls,
    getLastManaBallSpawn: () => lastManaBallSpawn,
    setLastManaBallSpawn: (value) => { lastManaBallSpawn = value; },
    MANA_BALL_SPAWN_INTERVAL,
    
    getHealOrbs: () => healOrbs,
    getLastHealOrbSpawn: () => lastHealOrbSpawn,
    setLastHealOrbSpawn: (value) => { lastHealOrbSpawn = value; },
    HEAL_ORB_SPAWN_INTERVAL,
    HEAL_ORB_HEAL_AMOUNT,
    
    getLastHandPosition: () => lastHandPosition,
    setLastHandPosition: (value) => { lastHandPosition = value; },
    getDemonAnimationState: () => demonAnimationState,
    setDemonAnimationState: (value) => { demonAnimationState = value; },
    getDemonIdleInterval: () => demonIdleInterval,
    setDemonIdleInterval: (value) => { demonIdleInterval = value; },
    getDemonHitInterval: () => demonHitInterval,
    setDemonHitInterval: (value) => { demonHitInterval = value; },
    getDemonCleaveInterval: () => demonCleaveInterval,
    setDemonCleaveInterval: (value) => { demonCleaveInterval = value; },
    getLastBossAttackCheck: () => lastBossAttackCheck,
    setLastBossAttackCheck: (value) => { lastBossAttackCheck = value; },
    BOSS_ATTACK_CHECK_INTERVAL,
    
    getCurrentBossPhase: () => currentBossPhase,
    setCurrentBossPhase: (value) => { currentBossPhase = value; },
    
    getGameStartTime: () => gameStartTime,
    setGameStartTime: (value) => { gameStartTime = value; },
    
    getFinisherMode: () => finisherMode,
    setFinisherMode: (value) => { finisherMode = value; },
    getFinisherIceShardCount: () => finisherIceShardCount,
    setFinisherIceShardCount: (value) => { finisherIceShardCount = value; },
    getFinisherTimeout: () => finisherTimeout,
    setFinisherTimeout: (value) => { finisherTimeout = value; },
    getFinisherMessageShown: () => finisherMessageShown,
    setFinisherMessageShown: (value) => { finisherMessageShown = value; },
    FINISHER_TIME_LIMIT,
    
    getHintShown: () => hintShown,
    setHintShown: (value) => { hintShown = value; },
    HINT_DELAY,
    
    MAX_PLAYER_HEALTH,
    MAX_BOSS_HEALTH
};
