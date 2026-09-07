// LocalStorage keys to keep track of state across page reloads
const STATE_KEY = 'luckworth_audio_state';
const TIME_KEY = 'luckworth_audio_time';
const VOL_KEY = 'luckworth_audio_vol';
const MUTED_KEY = 'luckworth_audio_muted';

const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const muteBtn = document.getElementById('mute-btn');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const discIcon = document.getElementById('disc-icon');
const equalizer = document.getElementById('equalizer');
const statusText = document.getElementById('status-text');

// 1. Initialize Muted and Volume States
const savedVol = localStorage.getItem(VOL_KEY);
audio.volume = savedVol !== null ? parseFloat(savedVol) : 0.4;
volumeBar.value = audio.volume * 100;

const savedMuted = localStorage.getItem(MUTED_KEY);
audio.muted = savedMuted === 'true';
updateMuteIcon();

// 2. Initialize Playback Position
const savedTime = localStorage.getItem(TIME_KEY);
if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
}

// Format seconds into MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

// Update slider and store exact timestamp as it plays
audio.addEventListener('timeupdate', () => {
    if (!audio.paused) {
        localStorage.setItem(TIME_KEY, audio.currentTime);
    }
    const progress = (audio.currentTime / audio.duration) * 100;
    seekBar.value = progress || 0;
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

// Manual seeking
seekBar.addEventListener('input', () => {
    const seekTime = (seekBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
    localStorage.setItem(TIME_KEY, seekTime);
});

// Play execution with Autoplay Block Bypass
function playAudio() {
    audio.play().then(() => {
        localStorage.setItem(STATE_KEY, 'playing');
        updateUI(true);
    }).catch(err => {
        console.log("Autoplay was prevented. Waiting for user interaction...");
        localStorage.setItem(STATE_KEY, 'playing'); // Intent is still to play
        
        // Listen for first interaction anywhere on screen to execute autoplay bypass
        document.addEventListener('click', forcePlayOnInteraction, { once: true });
    });
}

function pauseAudio() {
    audio.pause();
    localStorage.setItem(STATE_KEY, 'paused');
    updateUI(false);
}

function forcePlayOnInteraction() {
    if (localStorage.getItem(STATE_KEY) === 'playing') {
        playAudio();
    }
}

function updateUI(isPlaying) {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.className = 'fa-solid fa-pause';
        discIcon.classList.add('spinning');
        equalizer.classList.add('playing');
        statusText.textContent = 'Now Playing';
    } else {
        icon.className = 'fa-solid fa-play';
        discIcon.classList.remove('spinning');
        equalizer.classList.remove('playing');
        statusText.textContent = 'Paused';
    }
}

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        playAudio();
    } else {
        pauseAudio();
    }
});

// Volume Slider Control
volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value / 100;
    localStorage.setItem(VOL_KEY, audio.volume);
    updateMuteIcon();
});

// Mute Button Toggle
muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    localStorage.setItem(MUTED_KEY, audio.muted);
    updateMuteIcon();
});

function updateMuteIcon() {
    const icon = muteBtn.querySelector('i');
    if (audio.muted || audio.volume === 0) {
        icon.className = 'fa-solid fa-volume-xmark';
    } else if (audio.volume < 0.5) {
        icon.className = 'fa-solid fa-volume-low';
    } else {
        icon.className = 'fa-solid fa-volume-high';
    }
}

// 3. Autoplay Triggering on load
const desiredState = localStorage.getItem(STATE_KEY);
if (desiredState === 'playing' || desiredState === null) {
    playAudio();
} else {
    updateUI(false);
}

// Backup check for instant tracking unload sync
window.addEventListener('beforeunload', () => {
    localStorage.setItem(TIME_KEY, audio.currentTime);
});