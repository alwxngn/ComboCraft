const sounds = {
    fireball: new Audio('../../../assets/sounds/fireball.mp3'),
    iceShard: new Audio('../../../assets/sounds/ice_shard.wav'),
    thunder: new Audio('../../../assets/sounds/thunder.wav'),
    backgroundMusic: new Audio('../../../assets/sounds/background_music.wav')
};

Object.values(sounds).forEach(sound => {
    sound.volume = 0.5;
});

sounds.backgroundMusic.volume = 0.5;
sounds.backgroundMusic.loop = true;

window.Sounds = sounds;
