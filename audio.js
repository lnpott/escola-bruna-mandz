// audio.js - Piano audio engine (Tone.js Salamander samples)

const KEY_TO_NOTE = {
    'key-c': 'C4',
    'key-d': 'D4',
    'key-e': 'E4',
    'key-f': 'F4',
    'key-g': 'G4',
    'key-a': 'A4',
    'key-b': 'B4',
    'key-c5': 'C5',
    'key-cs': 'C#4',
    'key-ds': 'D#4',
    'key-fs': 'F#4',
    'key-gs': 'G#4',
    'key-as': 'A#4',
};

const DYNAMICS = {
    soft: 0.45,
    medium: 0.7,
    loud: 0.95,
};

let sampler = null;
let fallbackSynth = null;
let usingFallback = false;
let ready = false;
let initPromise = null;
const activeNotes = new Set();

function getVelocity() {
    const select = document.getElementById('piano-dynamics');
    const value = select ? select.value : 'medium';
    return DYNAMICS[value] ?? DYNAMICS.medium;
}

function getInstrument() {
    return usingFallback ? fallbackSynth : sampler;
}

function createSamplerChain() {
    const gain = new Tone.Gain(0.85).toDestination();
    const compressor = new Tone.Compressor({
        threshold: -24,
        ratio: 3,
        attack: 0.005,
        release: 0.1,
    });
    sampler.connect(compressor);
    compressor.connect(gain);
}

function createSampler() {
    sampler = new Tone.Sampler({
        urls: {
            C4: 'C4.mp3',
            'D#4': 'Ds4.mp3',
            'F#4': 'Fs4.mp3',
            A4: 'A4.mp3',
            C5: 'C5.mp3',
        },
        release: 1.2,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        onload: () => {
            ready = true;
            updateAudioStatus('ready');
        },
        onerror: () => {
            enableFallback();
        },
    });
    createSamplerChain();
}

function enableFallback() {
    if (usingFallback) return;
    usingFallback = true;
    fallbackSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
    }).toDestination();
    fallbackSynth.volume.value = -6;
    ready = true;
    updateAudioStatus('fallback');
}

function updateAudioStatus(state) {
    const indicator = document.getElementById('piano-status-dot');
    const label = document.getElementById('piano-audio-status');
    const hint = document.getElementById('piano-hint');

    if (indicator) {
        indicator.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500', 'live-indicator');
        if (state === 'loading') {
            indicator.classList.add('bg-yellow-500', 'live-indicator');
        } else if (state === 'ready') {
            indicator.classList.add('bg-green-500');
        } else if (state === 'fallback') {
            indicator.classList.add('bg-yellow-500');
        } else {
            indicator.classList.add('bg-red-500', 'live-indicator');
        }
    }

    if (label) {
        const messages = {
            idle: 'Toque uma tecla para ativar',
            loading: 'Carregando samples...',
            ready: 'Piano pronto',
            fallback: 'Modo simplificado (sem samples)',
        };
        label.textContent = messages[state] || messages.idle;
    }

    if (hint && (state === 'ready' || state === 'fallback')) {
        hint.classList.add('hidden');
    }
}

async function ensureInit() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        if (typeof Tone === 'undefined') {
            enableFallback();
            return;
        }

        updateAudioStatus('loading');
        await Tone.start();

        if (!sampler) {
            createSampler();
        }

        try {
            await Tone.loaded();
            if (!usingFallback) {
                ready = true;
                updateAudioStatus('ready');
            }
        } catch {
            enableFallback();
        }
    })();

    return initPromise;
}

function noteFromKeyId(keyId) {
    return KEY_TO_NOTE[keyId] || null;
}

function playOnInstrument(note, velocity, duration) {
    const instrument = getInstrument();
    if (!instrument || !note) return;

    if (duration !== undefined) {
        instrument.triggerAttackRelease(note, duration, undefined, velocity);
        return;
    }

    instrument.triggerAttack(note, undefined, velocity);
    activeNotes.add(note);
}

function stopOnInstrument(note) {
    const instrument = getInstrument();
    if (!instrument || !note) return;

    if (activeNotes.has(note)) {
        instrument.triggerRelease(note);
        activeNotes.delete(note);
    }
}

window.PianoAudio = {
    async init() {
        await ensureInit();
    },

    isReady() {
        return ready;
    },

    playKey(keyId, options = {}) {
        const note = noteFromKeyId(keyId);
        if (!note) return;

        const velocity = options.velocity ?? getVelocity();
        const duration = options.duration;

        playOnInstrument(note, velocity, duration);
        updateNoteDisplay(note);
    },

    playNote(noteName, options = {}) {
        if (!noteName) return;

        const velocity = options.velocity ?? getVelocity();
        const duration = options.duration;

        playOnInstrument(noteName, velocity, duration);
        updateNoteDisplay(noteName);
    },

    stopKey(noteName) {
        if (noteName) {
            stopOnInstrument(noteName);
        }
    },

    stopKeyById(keyId) {
        const note = noteFromKeyId(keyId);
        if (note) stopOnInstrument(note);
    },

    stopAll() {
        activeNotes.forEach((note) => stopOnInstrument(note));
        activeNotes.clear();
    },
};

window.playNoteTone = function (keyId, options = {}) {
    const defaults = { duration: 0.55, velocity: DYNAMICS.medium };
    window.PianoAudio.playKey(keyId, { ...defaults, ...options });
};

function updateNoteDisplay(noteName) {
    const display = document.getElementById('played-note-display');
    if (display) {
        display.textContent = noteName;
    }
}

function getKeyFromEvent(event) {
    const key = event.target.closest('.piano-key');
    return key || null;
}

function setKeyPressed(keyEl, pressed) {
    if (!keyEl) return;
    keyEl.classList.toggle('key-pressed', pressed);
}

async function handlePointerDown(event) {
    const keyEl = getKeyFromEvent(event);
    if (!keyEl) return;

    event.preventDefault();

    const keyId = keyEl.dataset.keyId;
    const noteName = keyEl.dataset.note;
    if (!keyId || !noteName) return;

    await ensureInit();

    const gameState = window.getPianoGameState?.();
    const inUserTurn =
        gameState?.isPlaying &&
        !gameState?.isDemonstrating &&
        !gameState?.completed;

    if (inUserTurn) {
        if (typeof window.handleKeyClick === 'function') {
            window.handleKeyClick(keyId);
        }
    } else if (!gameState?.isPlaying || gameState?.completed) {
        window.PianoAudio.playKey(keyId);
    } else {
        return;
    }

    setKeyPressed(keyEl, true);
    keyEl.setPointerCapture(event.pointerId);
}

function handlePointerUp(event) {
    const keyEl = getKeyFromEvent(event);
    if (!keyEl) return;

    const keyId = keyEl.dataset.keyId;
    setKeyPressed(keyEl, false);

    const gameState = window.getPianoGameState?.();
    const inFreePlay = !gameState?.isPlaying || gameState?.completed;

    if (inFreePlay && keyId) {
        window.PianoAudio.stopKeyById(keyId);
    }

    try {
        keyEl.releasePointerCapture(event.pointerId);
    } catch {
        // pointer may already be released
    }
}

function initPianoKeyboard() {
    const container = document.getElementById('piano-keys');
    if (!container) return;

    updateAudioStatus('idle');

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);
}

document.addEventListener('DOMContentLoaded', initPianoKeyboard);
