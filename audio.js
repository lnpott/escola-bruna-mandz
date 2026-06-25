// audio.js - Piano audio engine (Web Audio)

let audioCtx = null;

const keyToNote = {
    'key-c': 261.63,
    'key-d': 293.66,
    'key-e': 329.63,
    'key-f': 349.23,
    'key-g': 392,
    'key-a': 440,
    'key-b': 493.88,
    'key-c5': 523.25
};

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playFrequency(freq) {
    initAudio();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    const now = audioCtx.currentTime;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
}

window.playNoteTone = function(keyId) {
    const frequency = keyToNote[keyId];

    if (frequency) {
        playFrequency(frequency);
    }
};
