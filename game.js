// Piano Memory Game - Ode à Alegria de Beethoven

// Note frequencies mapping for piano keys
const NOTE_FREQUENCIES = {
    'key-c': 261.63,   // C4
    'key-d': 293.66,   // D4
    'key-e': 329.63,   // E4
    'key-f': 349.23,   // F4
    'key-g': 392.00,   // G4
    'key-a': 440.00,   // A4
    'key-b': 493.88,   // B4
    'key-c5': 523.25   // C5
};

// Ode à Alegria note sequence (using piano key IDs)
const ODE_TO_JOY_SEQUENCE = [
    'key-e', 'key-e', 'key-f', 'key-g', 'key-g', 'key-f', 'key-e', 'key-d',
    'key-c', 'key-c', 'key-d', 'key-e', 'key-e', 'key-d', 'key-d'
];

// Game state
let gameState = {
    currentLevel: 1,
    currentNoteIndex: 0,
    userNoteIndex: 0,
    isPlaying: false,
    isDemonstrating: false,
    completed: false
};

// Get current level sequence
function getCurrentLevelSequence() {
    const notesPerLevel = 4;
    const endNote = gameState.currentLevel * notesPerLevel;
    return ODE_TO_JOY_SEQUENCE.slice(0, endNote);
}

// Start the game
function startGame() {
    gameState = {
        currentLevel: 1,
        currentNoteIndex: 0,
        userNoteIndex: 0,
        isPlaying: true,
        isDemonstrating: true,
        completed: false
    };
    
    updateUI();
    demonstrateSequence();
}

// Demonstrate the current sequence
function demonstrateSequence() {
    const sequence = getCurrentLevelSequence();
    gameState.isDemonstrating = true;
    
    let delay = 0;
    sequence.forEach((noteId, index) => {
        setTimeout(() => {
            highlightKey(noteId, 'demonstration');
            playNote(noteId);
        }, delay);
        delay += 400; // Faster: 400ms between notes
    });
    
    setTimeout(() => {
        gameState.isDemonstrating = false;
        gameState.userNoteIndex = 0;
        updateUI();
    }, delay);
}

// Handle user key click
function handleKeyClick(noteId) {
    if (!gameState.isPlaying || gameState.isDemonstrating || gameState.completed) {
        return;
    }
    
    const sequence = getCurrentLevelSequence();
    const expectedNote = sequence[gameState.userNoteIndex];
    
    if (noteId === expectedNote) {
        highlightKey(noteId, 'correct');
        playNote(noteId);
        gameState.userNoteIndex++;
        
        if (gameState.userNoteIndex >= sequence.length) {
            if (gameState.currentLevel < 3) {
                gameState.currentLevel++;
                gameState.userNoteIndex = 0;
                setTimeout(() => {
                    demonstrateSequence();
                }, 1000);
            } else {
                gameState.completed = true;
                setTimeout(() => {
                    playFinalSequence();
                }, 1000);
            }
        }
    } else {
        highlightKey(noteId, 'wrong');
        highlightKey(expectedNote, 'correct');
        gameState.userNoteIndex = 0;
        setTimeout(() => {
            demonstrateSequence();
        }, 1500);
    }
    
    updateUI();
}

// Highlight key with visual feedback
function highlightKey(noteId, type) {
    const key = document.getElementById(noteId);
    if (!key) return;
    
    key.classList.remove('bg-green-500', 'bg-red-500', 'bg-zinc-600', 'bg-green-200', 'bg-red-200', 'bg-zinc-300');
    
    switch(type) {
        case 'correct':
            key.classList.add('bg-green-200');
            setTimeout(() => {
                key.classList.remove('bg-green-200');
                key.classList.add('bg-white');
            }, 300);
            break;
        case 'wrong':
            key.classList.add('bg-red-200');
            setTimeout(() => {
                key.classList.remove('bg-red-200');
                key.classList.add('bg-white');
            }, 500);
            break;
        case 'demonstration':
            key.classList.add('bg-zinc-300');
            setTimeout(() => {
                key.classList.remove('bg-zinc-300');
                key.classList.add('bg-white');
            }, 400);
            break;
    }
}

// Play note using Tone.js audio system
function playNote(noteId) {
    if (typeof window.playNoteTone === 'function') {
        window.playNoteTone(noteId);
    }
}

// Play final sequence automatically (2 times)
function playFinalSequence() {
    const fullSequence = ODE_TO_JOY_SEQUENCE;
    let delay = 0;
    
    for (let repeat = 0; repeat < 2; repeat++) {
        fullSequence.forEach((noteId, index) => {
            setTimeout(() => {
                highlightKey(noteId, 'demonstration');
                playNote(noteId);
            }, delay);
            delay += 400; // Faster: 400ms between notes
        });
        delay += 600; // Shorter pause between repetitions
    }
    
    setTimeout(() => {
        gameState.isPlaying = false;
        updateUI();
        alert('Parabéns! Você completou Ode à Alegria!');
    }, delay);
}

// Update UI elements
function updateUI() {
    const levelIndicator = document.getElementById('game-level');
    const keyCounter = document.getElementById('game-counter');
    const startButton = document.getElementById('start-game-btn');
    const timbreSelect = document.getElementById('synth-wave');
    
    if (levelIndicator) {
        levelIndicator.textContent = `Nível ${gameState.currentLevel}/3`;
        levelIndicator.classList.toggle('hidden', !gameState.isPlaying);
    }
    
    if (keyCounter) {
        const sequence = getCurrentLevelSequence();
        keyCounter.textContent = `${gameState.userNoteIndex}/${sequence.length}`;
        keyCounter.classList.toggle('hidden', !gameState.isPlaying);
    }
    
    if (startButton) {
        startButton.style.display = gameState.isPlaying ? 'none' : 'inline-block';
    }
    
    if (timbreSelect) {
        timbreSelect.disabled = gameState.isPlaying;
        if (gameState.isPlaying) {
            timbreSelect.value = 'square'; // Force classic chiptune
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const pianoKeys = document.querySelectorAll('.piano-key');
    pianoKeys.forEach(key => {
        key.addEventListener('click', () => {
            handleKeyClick(key.id);
        });
    });
});