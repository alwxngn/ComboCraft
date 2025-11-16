// Boss Animation State
export let demonAnimationState = 'idle'; // 'idle', 'hit', 'cleave', 'walk', 'enraged'
export let demonIdleInterval = null;
export let demonHitInterval = null;
export let demonCleaveInterval = null;
export let lastBossAttackCheck = 0;
export const BOSS_ATTACK_CHECK_INTERVAL = 1500; // Check every 1500ms (1.5 seconds)

export function setDemonAnimationState(state) {
    demonAnimationState = state;
}

export function setDemonIdleInterval(interval) {
    demonIdleInterval = interval;
}

export function setDemonHitInterval(interval) {
    demonHitInterval = interval;
}

export function setDemonCleaveInterval(interval) {
    demonCleaveInterval = interval;
}

export function setLastBossAttackCheck(time) {
    lastBossAttackCheck = time;
}
