// src/global-bridge.js
import { startGame, stopGame, demonstrateSequence, handleKeyClick } from './game.js';

// Expondo funções globais para o index.html
window.startGame = startGame;
window.stopGame = stopGame;
window.demonstrateSequence = demonstrateSequence;
window.handleKeyClick = handleKeyClick;

// Placeholder para outras funções que seu index.html chama
// Se você tiver mais funções, adicione-as aqui seguindo este padrão
window.filterCanvas = (cat) => {
    // A função original estava dentro do script do index.html
    // Vamos tentar buscar a lógica original se ela estiver disponível
    if (typeof filterCanvas === 'function') {
        filterCanvas(cat);
    } else {
    console.log("filterCanvas chamada:", cat);
    }
};

window.scrollToId = (id) => {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth' });
};

window.openModal = (id) => {
    const el = document.getElementById(id);
    if(el) {
        el.classList.remove('hidden');
        setTimeout(() => el.children[0].classList.remove('scale-95', 'opacity-0'), 50);
    }
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.children[0].classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 150);
    }
};

window.closeCheckoutModals = () => {
    const modals = document.querySelectorAll('.checkout-modal-overlay');
    modals.forEach(m => m.classList.add('hidden'));
};

window.toggleVideo = (id) => {
    if (window.toggleVideo) window.toggleVideo(id);
};

window.stopVideo = (id) => {
    if (window.stopVideo) window.stopVideo(id);
};

window.pauseDrumsModalVideo = () => {
    if (window.pauseDrumsModalVideo) window.pauseDrumsModalVideo();
};

window.checkAnswer = (answer) => {
    if (window.checkAnswer) window.checkAnswer(answer);
};

window.resetQuiz = () => {
    if (window.resetQuiz) window.resetQuiz();
};

window.openSpaceModal = () => {
    window.openModal('modal-space');
};

window.nextSpaceModalSlide = () => {
    if (window.nextSpaceModalSlide) window.nextSpaceModalSlide();
};

window.prevSpaceModalSlide = () => {
    if (window.prevSpaceModalSlide) window.prevSpaceModalSlide();
};

