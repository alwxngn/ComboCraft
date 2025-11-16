// Sound Effects System
export const sounds = {
    fireball: new Audio('../assets/sounds/fireball.mp3'),
    iceShard: new Audio('../assets/sounds/ice_shard.wav'),
    thunder: new Audio('../assets/sounds/thunder.wav'),
    backgroundMusic: new Audio('../assets/sounds/background_music.wav')
};

// Initialize sounds with volume
Object.values(sounds).forEach(sound => {
    sound.volume = 0.5;
});

sounds.backgroundMusic.volume = 0.5;
sounds.backgroundMusic.loop = true;

export function startBackgroundMusic() {
    if (sounds.backgroundMusic) {
        sounds.backgroundMusic.play().catch(err => {
            console.log("Background music autoplay blocked:", err);
        });
    }
}

export function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(err => {
            console.log(`Error playing ${soundName}:`, err);
        });
    }
}
