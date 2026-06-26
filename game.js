// Piano Memory Game - Ode à Alegria de Beethoven

const ODE_TO_JOY_SEQUENCE = [
    'key-e',
    'key-e',
    'key-f',
    'key-g',
    'key-g',
    'key-f',
    'key-e',
    'key-d',
    'key-c',
    'key-c',
    'key-d',
    'key-e',
    'key-e',
    'key-d',
    'key-d',
];

let gameState = {
    currentLevel: 1,
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
    return ODE_TO_JOY_SEQUENCE.slice(0, gameState.currentLevel * notesPerLevel);
}

// --- MELHORIAS DE DINÂMICA ---

function showTip(noteId) {
    const tooltip = document.getElementById('note-tooltip');
    if (!tooltip) return;
    const noteInfo = getNoteFriendlyName(noteId);
    tooltip.querySelector('span').textContent = `${noteInfo.letter} (${noteInfo.syllable})`;
    tooltip.classList.remove('hidden');
    setTimeout(() => tooltip.classList.add('hidden'), 1500);
}

function showCongratModal() {
    const modal = document.createElement('div');
    modal.id = 'congrat-modal';
    modal.className =
        'bg-zinc-900 border border-red-500 p-8 rounded-3xl text-white text-center fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl';
    modal.innerHTML = ` 
        <h2 class="text-3xl font-black mb-4 text-red-500">Parabéns! 🎉</h2> 
        <p class="mb-6">Você completou a Ode à Alegria com maestria!</p> 
        <button class="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold transition-all" onclick="stopGame(); document.getElementById('congrat-modal').remove()">Concluir</button> 
    `;
    document.body.appendChild(modal);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') document.getElementById('congrat-modal')?.remove();
});

// --- LÓGICA DO JOGO ---

async function startGame() {
    if (window.PianoAudio) await window.PianoAudio.init();
    gameState = {
        currentLevel: 1,
        userNoteIndex: 0,
        isPlaying: true,
        isDemonstrating: true,
        completed: false,
    };

    // UI Updates
    document.getElementById('start-game-btn').classList.add('hidden');
    document.getElementById('replay-demo-btn').classList.remove('hidden');
    document.getElementById('stop-game-btn').classList.remove('hidden');

    updateUI();
    window.demonstrateSequence();
}

window.startGame = startGame;

window.stopGame = function () {
    gameState = {
        currentLevel: 1,
        userNoteIndex: 0,
        isPlaying: false,
        isDemonstrating: false,
        completed: false,
    };
    document.getElementById('start-game-btn').classList.remove('hidden');
    document.getElementById('replay-demo-btn').classList.add('hidden');
    document.getElementById('stop-game-btn').classList.add('hidden');
    document.getElementById('game-message').classList.add('hidden');
    document.getElementById('game-level').classList.add('hidden');
    document.getElementById('game-counter').classList.add('hidden');

    document
        .querySelectorAll('.piano-key')
        .forEach((k) =>
            k.classList.remove(
                'key-expected-highlight',
                'key-pressed',
                'bg-green-200',
                'bg-red-200',
                'bg-zinc-300'
            )
        );
};

function showGameMessage(msg, type) {
    const el = document.getElementById('game-message');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden', 'text-red-400', 'text-green-400', 'text-zinc-400');
    if (type === 'demo') el.classList.add('text-zinc-400');
    else if (type === 'play') el.classList.add('text-green-400');
    else if (type === 'wrong') el.classList.add('text-red-400');
}

window.demonstrateSequence = async function () {
    if (!gameState.isPlaying) return;

    // Ensure audio engine is ready before scheduling
    if (window.PianoAudio) await window.PianoAudio.init();

    const sequence = getCurrentLevelSequence();
    gameState.isDemonstrating = true;
    gameState.userNoteIndex = 0;

    showGameMessage('Ouça o exemplo...', 'demo');
    updateUI();

    // Nível 1: 1000ms, Nível 2: 800ms, Nível 3: 600ms
    const baseDelay = 1200 - gameState.currentLevel * 200;
    const baseDelaySec = baseDelay / 1000;

    // Stop any previously running Transport events
    if (typeof Tone !== 'undefined') {
        Tone.Transport.cancel();
        Tone.Transport.stop();
        Tone.Transport.start();
    }

    sequence.forEach((noteId, index) => {
        const offsetSec = index * baseDelaySec;
        const offsetMs = index * baseDelay;

        // Schedule audio on the audio clock (Tone Transport)
        if (typeof Tone !== 'undefined') {
            Tone.Transport.scheduleOnce(() => {
                if (!gameState.isPlaying) return;
                if (window.PianoAudio) window.PianoAudio.stopKeyById(noteId);
                playNote(noteId);
            }, offsetSec);
        }

        // Schedule visual feedback on JS timer (aligned to same offsets)
        setTimeout(() => {
            if (!gameState.isPlaying) return;
            highlightKey(noteId, 'demonstration');
            showTip(noteId);
        }, offsetMs);
    });

    // After all notes, hand control back to the player
    const totalMs = sequence.length * baseDelay;
    setTimeout(() => {
        if (!gameState.isPlaying) return;
        if (typeof Tone !== 'undefined') Tone.Transport.stop();
        gameState.isDemonstrating = false;
        gameState.userNoteIndex = 0;
        showGameMessage('Sua vez!', 'play');
        updateUI();
    }, totalMs);
};

window.handleKeyClick = function (noteId) {
    if (!gameState.isPlaying || gameState.isDemonstrating || gameState.completed) return;

    const sequence = getCurrentLevelSequence();
    if (noteId === sequence[gameState.userNoteIndex]) {
        highlightKey(noteId, 'correct');
        playNote(noteId);
        gameState.userNoteIndex++;

        if (gameState.userNoteIndex >= sequence.length) {
            if (gameState.currentLevel < 3) {
                gameState.currentLevel++;
                gameState.userNoteIndex = 0;
                showGameMessage('Muito bem! Próximo nível...', 'play');
                setTimeout(window.demonstrateSequence, 1500);
            } else {
                gameState.completed = true;
                setTimeout(showCongratModal, 1000);
            }
        }
    } else {
        highlightKey(noteId, 'wrong');
        showGameMessage('Ops! Tente novamente.', 'wrong');
        setTimeout(window.demonstrateSequence, 1500);
        gameState.userNoteIndex = 0;
    }
    updateUI();
};

function highlightKey(noteId, type) {
    const key = document.getElementById(noteId);
    if (!key) return;

    // Limpar o timeout anterior para evitar conflitos de animação
    if (key.dataset.timeoutId) {
        clearTimeout(parseInt(key.dataset.timeoutId));
    }

    // Remover as classes primeiro para garantir que a animação recomece, mesmo em teclas repetidas
    key.classList.remove('bg-green-200', 'bg-red-200', 'bg-zinc-300', 'key-pressed');

    // Forçar reflow para que o navegador processe a remoção antes de adicionar novamente
    void key.offsetWidth;

    key.classList.add(
        type === 'correct' ? 'bg-green-200' : type === 'wrong' ? 'bg-red-200' : 'bg-zinc-300'
    );
    key.classList.add('key-pressed');

    const timeoutId = setTimeout(() => {
        key.classList.remove('bg-green-200', 'bg-red-200', 'bg-zinc-300', 'key-pressed');
    }, 400); // 400ms é o tempo que a tecla fica afundada

    key.dataset.timeoutId = timeoutId;
}

function playNote(noteId) {
    if (window.playNoteTone) window.playNoteTone(noteId, { duration: 0.4, velocity: 0.7 });
}

function updateUI() {
    const levelEl = document.getElementById('game-level');
    const counterEl = document.getElementById('game-counter');

    if (levelEl && gameState.isPlaying) {
        levelEl.textContent = `Nível ${gameState.currentLevel}/3`;
        levelEl.classList.remove('hidden');
    }

    if (counterEl && gameState.isPlaying) {
        const sequence = getCurrentLevelSequence();
        counterEl.textContent = `${gameState.userNoteIndex}/${sequence.length}`;
        counterEl.classList.remove('hidden');
    }

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${(gameState.currentLevel / 3) * 100}%`;
        progressBar.classList.remove('hidden');
    }

    // Scroll Automático
    const sequence = getCurrentLevelSequence();
    const activeKey = document.getElementById(sequence[gameState.userNoteIndex]);
    if (activeKey)
        activeKey.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // Highlight esperado
    document
        .querySelectorAll('.piano-key')
        .forEach((k) => k.classList.remove('key-expected-highlight'));
    if (!gameState.isDemonstrating && gameState.isPlaying) {
        document
            .getElementById(sequence[gameState.userNoteIndex])
            ?.classList.add('key-expected-highlight');
    }
}

function getNoteFriendlyName(noteId) {
    const mapping = {
        'key-c': { letter: 'C', syllable: 'Dó' },
        'key-d': { letter: 'D', syllable: 'Ré' },
        'key-e': { letter: 'E', syllable: 'Mi' },
        'key-f': { letter: 'F', syllable: 'Fá' },
        'key-g': { letter: 'G', syllable: 'Sol' },
        'key-a': { letter: 'A', syllable: 'Lá' },
        'key-b': { letter: 'B', syllable: 'Si' },
    };
    return mapping[noteId] || { letter: '?', syllable: '?' };
}
