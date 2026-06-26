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

function getNoteFriendlyName(noteId) {
    const mapping = {
        'key-c': { name: 'Dó', letter: 'C', syllable: 'Dó' },
        'key-cs': { name: 'Dó#', letter: 'C#', syllable: 'Dó#' },
        'key-d': { name: 'Ré', letter: 'D', syllable: 'Ré' },
        'key-ds': { name: 'Ré#', letter: 'D#', syllable: 'Ré#' },
        'key-e': { name: 'Mi', letter: 'E', syllable: 'Mi' },
        'key-f': { name: 'Fá', letter: 'F', syllable: 'Fá' },
        'key-fs': { name: 'Fá#', letter: 'F#', syllable: 'Fá#' },
        'key-g': { name: 'Sol', letter: 'G', syllable: 'Sol' },
        'key-gs': { name: 'Sol#', letter: 'G#', syllable: 'Sol#' },
        'key-a': { name: 'Lá', letter: 'A', syllable: 'Lá' },
        'key-as': { name: 'Lá#', letter: 'A#', syllable: 'Lá#' },
        'key-b': { name: 'Si', letter: 'B', syllable: 'Si' },
        'key-c5': { name: 'Dó 5', letter: 'C5', syllable: 'Dó' },
    };
    return mapping[noteId] || { name: '?', letter: '?', syllable: '?' };
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

    // 1. Reset Expected Highlight on all keys
    document.querySelectorAll('.piano-key').forEach((key) => {
        key.classList.remove('key-expected-highlight');
    });

    // 2. Add expected highlight during user's turn
    if (gameState.isPlaying && !gameState.isDemonstrating && !gameState.completed) {
        const sequence = getCurrentLevelSequence();
        const expectedNote = sequence[gameState.userNoteIndex];
        const expectedKey = document.getElementById(expectedNote);
        if (expectedKey) {
            expectedKey.classList.add('key-expected-highlight');
        }
    }

    // 3. Update Melody Tracker
    const trackerContainer = document.getElementById('melody-tracker-container');
    const notesContainer = document.getElementById('melody-notes');
    if (trackerContainer && notesContainer) {
        if (gameState.isPlaying) {
            trackerContainer.classList.remove('hidden');
            const sequence = getCurrentLevelSequence();
            notesContainer.innerHTML = '';
            
            sequence.forEach((noteId, index) => {
                const noteBadge = document.createElement('div');
                const noteInfo = getNoteFriendlyName(noteId);
                
                let statusClass = '';
                if (index < gameState.userNoteIndex) {
                    // Correctly played notes
                    statusClass = 'bg-green-600/20 border-green-500 text-green-400 font-bold scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
                } else if (index === gameState.userNoteIndex) {
                    // Current active note
                    if (gameState.isDemonstrating) {
                        statusClass = 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold animate-pulse scale-105 ring-2 ring-blue-500/30';
                    } else {
                        statusClass = 'bg-red-600/25 border-red-500 text-red-400 font-bold scale-110 ring-4 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
                    }
                } else {
                    // Future notes in sequence
                    statusClass = 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60';
                }
                
                noteBadge.className = `px-3 py-1.5 rounded-xl border flex items-center justify-center text-center transition-all duration-300 ${statusClass}`;
                noteBadge.style.minWidth = '54px';
                noteBadge.innerHTML = `
                    <div class="flex flex-col items-center leading-none">
                        <span class="text-xs font-black">${noteInfo.letter}</span>
                        <span class="text-[9px] font-medium opacity-80 mt-0.5">${noteInfo.syllable}</span>
                    </div>
                `;
                notesContainer.appendChild(noteBadge);
            });
        } else {
            trackerContainer.classList.add('hidden');
        }
    }
}

window.startGame = startGame;
