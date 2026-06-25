// audio.js - Manages the piano sound using Tone.js

// Create a new piano sampler with more notes
const piano = new Tone.Sampler({
    urls: {
        "C4": "https://tonejs.github.io/audio/salamander/C4.mp3",
        "D4": "https://tonejs.github.io/audio/salamander/D4.mp3",
        "D#4": "https://tonejs.github.io/audio/salamander/Ds4.mp3",
        "E4": "https://tonejs.github.io/audio/salamander/E4.mp3",
        "F4": "https://tonejs.github.io/audio/salamander/F4.mp3",
        "F#4": "https://tonejs.github.io/audio/salamander/Fs4.mp3",
        "G4": "https://tonejs.github.io/audio/salamander/G4.mp3",
        "G#4": "https://tonejs.github.io/audio/salamander/Gs4.mp3",
        "A4": "https://tonejs.github.io/audio/salamander/A4.mp3",
        "A#4": "https://tonejs.github.io/audio/salamander/As4.mp3",
        "B4": "https://tonejs.github.io/audio/salamander/B4.mp3",
        "C5": "https://tonejs.github.io/audio/salamander/C5.mp3",
        "D5": "https://tonejs.github.io/audio/salamander/D5.mp3",
        "D#5": "https://tonejs.github.io/audio/salamander/Ds5.mp3",
        "E5": "https://tonejs.github.io/audio/salamander/E5.mp3",
        "F5": "https://tonejs.github.io/audio/salamander/F5.mp3",
        "F#5": "https://tonejs.github.io/audio/salamander/Fs5.mp3",
        "G5": "https://tonejs.github.io/audio/salamander/G5.mp3",
        "G#5": "https://tonejs.github.io/audio/salamander/Gs5.mp3",
        "A5": "https://tonejs.github.io/audio/salamander/A5.mp3",
        "A#5": "https://tonejs.github.io/audio/salamander/As5.mp3",
        "B5": "https://tonejs.github.io/audio/salamander/B5.mp3"
    },
    release: 1,
    baseUrl: ""
}).toDestination();

// Function to play a note
function playNote(note, duration = '8n') {
    if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }
    piano.triggerAttackRelease(note, duration);
}

// Map note names to piano keys
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

// Expose playNote globally for game.js
window.playNoteTone = function(keyId) {
    const note = keyToNote[keyId];
    if (note) {
        playNote(note);
    }
};
