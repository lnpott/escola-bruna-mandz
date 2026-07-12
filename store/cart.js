const CART_KEY = 'bruna_cart';
const PROGRESS_KEY = 'bruna_student_progress';

export function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('bruna:cart-updated', { detail: cart }));
}

export function addToCart(product, variant = null) {
    const cart = getCart();
    // Chave única considera produto + variante (tamanho)
    const matchKey = (entry) => entry.id === product.id && (entry.variant ?? null) === variant;
    const item = cart.find(matchKey);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, variant });
    }
    saveCart(cart);
}

export function removeFromCart(productId, variant = null) {
    const cart = getCart().filter(
        (entry) => !(entry.id === productId && (entry.variant ?? null) === variant)
    );
    saveCart(cart);
}

export function updateQuantity(productId, qty, variant = null) {
    const cart = getCart();
    const item = cart.find(
        (entry) => entry.id === productId && (entry.variant ?? null) === variant
    );
    if (!item) return;
    if (qty <= 0) {
        removeFromCart(productId, variant);
        return;
    }
    item.quantity = qty;
    saveCart(cart);
}

export function clearCart() {
    saveCart([]);
}

export function cartTotal(cart = getCart()) {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function cartItemCount(cart = getCart()) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Gera um ID de pedido único.
 *
 * Antes, usava só os últimos 6 dígitos do timestamp em milissegundos
 * (`Date.now().toString().slice(-6)`), que se repetem a cada ~16,6 minutos —
 * risco real (ainda que baixo) de colisão entre dois pedidos diferentes,
 * o que faria o `upsert` por `id` no Supabase sobrescrever um pedido antigo.
 *
 * Agora combina timestamp + um sufixo aleatório, eliminando esse risco.
 */
function generateOrderId() {
    const timePart = Date.now().toString().slice(-8);
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `BM-${timePart}-${randomPart}`;
}

/**
 * Monta o objeto de pedido a partir do carrinho atual e calcula o XP que
 * será ganho. NÃO limpa o carrinho e NÃO persiste nada — quem chama essa
 * função decide quando confirmar (depois que o pagamento for criado com
 * sucesso na API), chamando clearCart() e applyStudentXp() manualmente.
 *
 * @param {object} options
 * @param {string} options.method - 'pix' | 'card'
 * @param {object} options.customer - { name, email, phone }
 */
export function buildOrder({ method = 'pix', customer = {} } = {}) {
    const cart = getCart();
    if (!cart.length) throw new Error('Carrinho vazio');

    const earnedXp = cart.reduce((sum, item) => sum + (item.rewardXp || 10) * item.quantity, 0);

    const order = {
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        method,
        customer,
        items: cart,
        total: Number(cartTotal(cart).toFixed(2)),
        earnedXp,
    };

    return { order, earnedXp };
}

/**
 * Aplica o XP do pedido ao progresso local do aluno (gamificação, só neste navegador).
 */
export function applyStudentXp(earnedXp) {
    const progress = JSON.parse(
        localStorage.getItem(PROGRESS_KEY) || '{"xp":0,"level":1,"badges":[]}'
    );
    progress.xp += earnedXp;
    progress.level = Math.max(1, Math.floor(progress.xp / 100) + 1);
    if (progress.xp >= 100 && !progress.badges.includes('Loja Oficial')) {
        progress.badges.push('Loja Oficial');
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return progress;
}