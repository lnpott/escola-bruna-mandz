// Piano Memory Game - Ode à Alegria de Beethoven

const ODE_TO_JOY_SEQUENCE = [
    'key-e', 'key-e', 'key-f', 'key-g', 'key-g', 'key-f', 'key-e', 'key-d',
    'key-c', 'key-c', 'key-d', 'key-e', 'key-e', 'key-d', 'key-d',
];

let gameState = {
    currentLevel: 1,
    currentNoteIndex: 0,
    userNoteIndex: 0,
    isPlaying: false,
    isDemonstrating: false,
    completed: false,
};

window.getPianoGameState = function () {
    return { ...gameState };
};

function getCurrentLevelSequence() {
    const notesPerLevel = 4;
    const endNote = gameState.currentLevel * notesPerLevel;
    return ODE_TO_JOY_SEQUENCE.slice(0, endNote);
}

async function startGame() {
    if (window.PianoAudio) {
        await window.PianoAudio.init();
    }

    gameState = {
        currentLevel: 1,
        currentNoteIndex: 0,
        userNoteIndex: 0,
        isPlaying: true,
        isDemonstrating: true,
        completed: false,
    };

    updateUI();
    demonstrateSequence();
}

function demonstrateSequence() {
    const sequence = getCurrentLevelSequence();
    gameState.isDemonstrating = true;

    let delay = 0;
    sequence.forEach((noteId) => {
        setTimeout(() => {
            highlightKey(noteId, 'demonstration');
            playNote(noteId);
        }, delay);
        delay += 400;
    });

    setTimeout(() => {
        gameState.isDemonstrating = false;
        gameState.userNoteIndex = 0;
        updateUI();
    }, delay);
}

window.handleKeyClick = function (noteId) {
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
        playNote(noteId);
        gameState.userNoteIndex = 0;
        setTimeout(() => {
            demonstrateSequence();
        }, 1500);
    }

    updateUI();
};

function resetKeyAppearance(key) {
    key.classList.remove('bg-green-200', 'bg-red-200', 'bg-zinc-300');
    if (key.classList.contains('piano-black-key')) {
        key.classList.add('bg-zinc-900');
    } else {
        key.classList.add('bg-white');
    }
}

function highlightKey(noteId, type) {
    const key = document.getElementById(noteId);
    if (!key) return;

    key.classList.remove('bg-green-200', 'bg-red-200', 'bg-zinc-300');

    switch (type) {
        case 'correct':
            key.classList.add('bg-green-200');
            setTimeout(() => resetKeyAppearance(key), 300);
            break;
        case 'wrong':
            key.classList.add('bg-red-200');
            setTimeout(() => resetKeyAppearance(key), 500);
            break;
        case 'demonstration':
            key.classList.add('bg-zinc-300');
            setTimeout(() => resetKeyAppearance(key), 400);
            break;
    }
}

function playNote(noteId) {
    if (typeof window.playNoteTone === 'function') {
        window.playNoteTone(noteId, { duration: 0.55, velocity: 0.7 });
    }
}

function playFinalSequence() {
    const fullSequence = ODE_TO_JOY_SEQUENCE;
    let delay = 0;

    for (let repeat = 0; repeat < 2; repeat++) {
        fullSequence.forEach((noteId) => {
            setTimeout(() => {
                highlightKey(noteId, 'demonstration');
                playNote(noteId);
            }, delay);
            delay += 400;
        });
        delay += 600;
    }

    setTimeout(() => {
        gameState.isPlaying = false;
        updateUI();
        alert('Parabéns! Você completou Ode à Alegria!');
    }, delay);
}

function updateUI() {
    const levelIndicator = document.getElementById('game-level');
    const keyCounter = document.getElementById('game-counter');
    const startButton = document.getElementById('start-game-btn');
    const dynamicsSelect = document.getElementById('piano-dynamics');

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

    if (dynamicsSelect) {
        dynamicsSelect.disabled = gameState.isPlaying;
    }
}

window.startGame = startGame;
