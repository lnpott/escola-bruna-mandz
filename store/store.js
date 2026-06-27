import { PRODUCTS } from './products.js';
import { PAYMENT_CONFIG } from './payment-config.js';
import { addToCart, cartTotal, createLocalOrder, getCart } from './cart.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function renderProducts() {
    const area = document.querySelector('#store-products');
    if (!area) return;
    area.innerHTML = PRODUCTS.filter((product) => product.active).map((product) => `
        <article class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">${money.format(product.price)}</div>
            <p>Estoque: ${product.stock}</p>
            <button type="button" data-add-product="${product.id}">Adicionar ao carrinho</button>
        </article>
    `).join('');
}

function renderCart() {
    const cart = getCart();
    const area = document.querySelector('#store-cart-lines');
    const total = document.querySelector('#store-cart-total');
    const badge = document.querySelector('#store-cart-badge');
    if (area) {
        area.innerHTML = cart.length ? cart.map((item) => `
            <div class="cart-line"><span>${item.quantity}x ${item.name}</span><strong>${money.format(item.price * item.quantity)}</strong></div>
        `).join('') : '<p class="text-zinc-500 text-sm">Seu carrinho está vazio.</p>';
    }
    if (total) total.textContent = money.format(cartTotal(cart));
    if (badge) badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

async function checkout(method) {
    try {
        const { order, earnedXp } = createLocalOrder({ method });
        renderCart();
        window.showToast?.(`Pedido ${order.id} criado: ${method.toUpperCase()} • +${earnedXp} XP`);
        alert(`Pedido ${order.id} criado. Pagamento ${method.toUpperCase()} preparado via ${PAYMENT_CONFIG.provider}.`);
    } catch (error) {
        alert(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
});

document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-product]');
    if (addButton) {
        const product = PRODUCTS.find((entry) => entry.id === addButton.dataset.addProduct);
        if (product) {
            addToCart(product);
            renderCart();
            window.showToast?.(`${product.name} adicionado ao carrinho`);
        }
    }

    const checkoutButton = event.target.closest('[data-checkout-method]');
    if (checkoutButton) checkout(checkoutButton.dataset.checkoutMethod);
});

window.addEventListener('bruna:cart-updated', renderCart);
