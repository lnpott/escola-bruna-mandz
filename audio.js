// audio.js - Manages the piano sound using Tone.js

let piano;
let pianoReady = false;

// Initialize audio only after user interaction (browser autoplay policy)
async function initPianoAudio() {
    if (pianoReady) return;

    await Tone.start();

    piano = new Tone.Sampler({
        urls: {
            "C4": "https://tonejs.github.io/audio/salamander/C4.mp3",
            "D4": "https://tonejs.github.io/audio/salamander/D4.mp3",
            "E4": "https://tonejs.github.io/audio/salamander/E4.mp3",
            "F4": "https://tonejs.github.io/audio/salamander/F4.mp3",
            "G4": "https://tonejs.github.io/audio/salamander/G4.mp3",
            "A4": "https://tonejs.github.io/audio/salamander/A4.mp3",
            "B4": "https://tonejs.github.io/audio/salamander/B4.mp3",
            "C5": "https://tonejs.github.io/audio/salamander/C5.mp3"
        },
        release: 1
    }).toDestination();

    await Tone.loaded();
    pianoReady = true;
}

async function playNote(note, duration = '8n') {
    await initPianoAudio();

    if (piano) {
        piano.triggerAttackRelease(note, duration);
    }
}

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

window.playNoteTone = async function(keyId) {
    const note = keyToNote[keyId];
    if (note) {
        await playNote(note);
    }
};