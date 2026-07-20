const CART_KEY = 'bruna_cart';

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
 * Monta o objeto de pedido a partir do carrinho atual.
 * NÃO limpa o carrinho — quem chama essa função decide quando chamar clearCart().
 *
 * @param {object} options
 * @param {string} options.method - 'pix' | 'card'
 * @param {object} options.customer - { name, email, phone }
 */
export function buildOrder({ method = 'pix', customer = {} } = {}) {
    const cart = getCart();
    if (!cart.length) throw new Error('Carrinho vazio');

    const order = {
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        method,
        customer,
        items: cart,
        total: Number(cartTotal(cart).toFixed(2)),
    };

    return { order };
}

