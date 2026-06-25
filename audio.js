// audio.js - Piano audio engine

let piano = null;
let audioStarted = false;
let fallbackCtx = null;

const keyToNote = {
    'key-c': 'C4',
    'key-d': 'D4',
    'key-e': 'E4',
    'key-f': 'F4',
    'key-g': 'G4',
    'key-a': 'A4',
    'key-b': 'B4',
    'key-c5': 'C5'
};

const frequencies = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392,
    A4: 440,
    B4: 493.88,
    C5: 523.25
};

async function initPianoAudio() {
    if (audioStarted) return;

    try {
        await Tone.start();

        piano = new Tone.Sampler({
            urls: {
                C4: 'C4.mp3',
                D4: 'D4.mp3',
                E4: 'E4.mp3',
                F4: 'F4.mp3',
                G4: 'G4.mp3',
                A4: 'A4.mp3',
                B4: 'B4.mp3',
                C5: 'C5.mp3'
            },
            baseUrl: 'https://tonejs.github.io/audio/salamander/',
            release: 1
        }).toDestination();

        audioStarted = true;
    } catch (e) {
        console.warn('Tone.js indisponível, usando sintetizador:', e);
        fallbackCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioStarted = true;
    }
}

function playFallback(note) {
    if (!fallbackCtx) return;

    const osc = fallbackCtx.createOscillator();
    const gain = fallbackCtx.createGain();

    osc.frequency.value = frequencies[note];
    osc.type = 'triangle';

    gain.gain.setValueAtTime(0.3, fallbackCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, fallbackCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(fallbackCtx.destination);

    osc.start();
    osc.stop(fallbackCtx.currentTime + 0.8);
}

async function playNote(note) {
    await initPianoAudio();

    if (piano) {
        piano.triggerAttackRelease(note, '8n');
    } else {
        playFallback(note);
    }
}

window.playNoteTone = function(keyId) {
    const note = keyToNote[keyId];
    if (note) playNote(note);
};