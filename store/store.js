import {
    addToCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartItemCount,
    getCart,
} from './cart.js';
import { openCheckoutFlow } from './checkout-modal.js';

// ── Fallback: produtos estáticos caso a API falhe ────────────────────────────
import { PRODUCTS as STATIC_PRODUCTS } from './products.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Escapa caracteres HTML para prevenir XSS em dados dinâmicos */
function esc(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

// ─── Cache de produtos (carregados via /api/products, fallback p/ estático) ──

let PRODUCTS = [];
let productLoadError = false;

async function loadProducts() {
    try {
        productLoadError = false;
        const res = await fetch('/api/products', { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`Falha ao buscar produtos: ${res.status}`);

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Resposta da API não é JSON.');
        }

        const { products } = await res.json();
        PRODUCTS = Array.isArray(products) ? products : [];

        // Se a API retornou array vazio (sem produtos no Supabase), usa fallback
        if (PRODUCTS.length === 0) {
            console.log('store.js: API retornou 0 produtos — usando fallback estático.');
            PRODUCTS = STATIC_PRODUCTS;
        }
    } catch (err) {
        console.warn('store.js: erro ao carregar produtos via API — usando fallback estático:', err.message);
        PRODUCTS = STATIC_PRODUCTS;
        productLoadError = false; // fallback ativo, não mostra erro
    }
}

// ─── Badge helper ─────────────────────────────────────────────────────────────

const BADGE_COLORS = {
    red:    'bg-red-600 text-white',
    green:  'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    yellow: 'bg-amber-500 text-zinc-900',
    orange: 'bg-orange-500 text-white',
};

function badgeHtml(product) {
    if (!product.badge) return '';
    const badgeText = product.badge.trim().toLowerCase();
    let cls = '';
    if (badgeText === 'novidade') {
        cls = BADGE_COLORS.purple;
    } else if (badgeText === 'limitado') {
        cls = BADGE_COLORS.orange;
    } else if (badgeText === 'promoção' || badgeText === 'promocao' || badgeText === 'promoçao') {
        cls = BADGE_COLORS.green;
    } else {
        cls = BADGE_COLORS[product.badgeColor] || 'bg-red-600 text-white';
    }
    return `<span class="store-badge ${cls}">${esc(product.badge)}</span>`;
}

// ─── Seletor de variante ──────────────────────────────────────────────────────

function variantHtml(product) {
    if (!product.variants?.sizes?.length) return '';
    const options = product.variants.sizes
        .map((s) => `<button type="button" class="size-btn" data-size="${esc(s)}" data-product-id="${product.id}">${esc(s)}</button>`)
        .join('');
    return `
        <div class="size-selector" data-product-id="${product.id}">
            <span class="size-label">Tamanho:</span>
            <div class="size-options">${options}</div>
        </div>`;
}

// ─── Renderizar produtos ──────────────────────────────────────────────────────

let activeCategory = 'todos';

export function renderProducts() {
    const area = document.querySelector('#store-products');
    if (!area) return;

    if (productLoadError) {
        area.innerHTML = `
            <div class="col-span-full text-center py-12 text-zinc-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-3 text-red-500 opacity-60"></i>
                <p class="text-sm text-zinc-400">Erro ao carregar os produtos. Por favor, recarregue a página.</p>
            </div>`;
        return;
    }

    if (!PRODUCTS.length) {
        area.innerHTML = `
            <div class="col-span-full text-center py-12 text-zinc-500">
                <i class="fas fa-spinner fa-spin text-4xl mb-3 opacity-30"></i>
                <p class="text-sm">Carregando produtos…</p>
            </div>`;
        return;
    }

    const filtered = PRODUCTS.filter(
        (p) => (p.active || p.comingSoon) && (activeCategory === 'todos' || p.category === activeCategory)
    );

    if (!filtered.length) {
        area.innerHTML = `
            <div class="col-span-full text-center py-12 text-zinc-500">
                <i class="fas fa-box-open text-4xl mb-3 opacity-30"></i>
                <p class="text-sm">Nenhum produto nesta categoria.</p>
            </div>`;
        return;
    }

    area.innerHTML = filtered.map((product) => {
        const isSoon = product.comingSoon;
        return `
        <article class="product-card${isSoon ? ' product-card--coming-soon' : ''}" data-product-id="${product.id}">
            <div class="product-img-wrap">
                <img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy" />
                ${isSoon ? '<span class="product-coming-soon-badge"><i class="fas fa-clock"></i> Em breve</span>' : badgeHtml(product)}
                ${isSoon ? '<div class="product-coming-soon-overlay"></div>' : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${esc(categoryLabel(product.category))}</span>
                <h3 class="product-name">${esc(product.name)}</h3>
                <p class="product-desc">${esc(product.description || '')}</p>
                ${isSoon ? '' : variantHtml(product)}
                <div class="product-footer">
                    <span class="product-price${isSoon ? ' product-price--soon' : ''}">${money.format(product.price)}</span>
                    ${isSoon
                        ? `<button type="button" class="btn-interest" data-interest-product="${product.id}" data-product-name="${esc(product.name)}">
                               <i class="fas fa-bell"></i> Tenho Interesse
                           </button>`
                        : `<button type="button" class="btn-add-cart" data-add-product="${product.id}">
                               <i class="fas fa-cart-plus"></i> Adicionar
                           </button>`
                    }
                </div>
                ${isSoon
                    ? `<p class="product-coming-soon-msg"><i class="fas fa-info-circle"></i> Disponível em breve. Sinalize interesse para ser notificado!</p>`
                    : `<p class="product-stock"><i class="fas fa-box text-[10px]"></i> ${product.stock} em estoque</p>`
                }
            </div>
        </article>`;
    }).join('');

    // Seleciona o primeiro tamanho por padrão
    area.querySelectorAll('.size-btn').forEach((btn) => {
        const wrap = btn.closest('.size-options');
        if (wrap && !wrap.querySelector('.active')) btn.classList.add('active');
    });
}

function categoryLabel(cat) {
    return { roupas: 'Roupas', acessorios: 'Acessórios', kits: 'Kits & Combos' }[cat] || cat;
}

// ─── Filtro por categoria ─────────────────────────────────────────────────────

export function filterStoreCategory(category) {
    activeCategory = category;
    renderProducts();
    document.querySelectorAll('.store-tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.storeCategory === category);
    });
}

// ─── Renderizar carrinho ──────────────────────────────────────────────────────

export function renderCart() {
    const cart  = getCart();
    const area  = document.querySelector('#store-cart-lines');
    const total = document.querySelector('#store-cart-total');
    const badge = document.querySelector('#store-cart-badge');

    if (area) {
        area.innerHTML = cart.length
            ? cart.map((item) => {
                const variantLabel = item.variant ? `<span class="cart-variant">${esc(item.variant)}</span>` : '';
                return `
                    <div class="cart-line">
                        <div class="cart-line-info">                                <span class="cart-line-name">${esc(item.name)}${variantLabel}</span>
                            <span class="cart-line-unit">${money.format(item.price)} × ${item.quantity}</span>
                        </div>
                        <div class="cart-line-actions">
                            <div class="qty-ctrl">
                                <button type="button" class="qty-btn" data-qty-action="decrease"
                                    data-product-id="${item.id}" data-variant="${item.variant ?? ''}">−</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button type="button" class="qty-btn" data-qty-action="increase"
                                    data-product-id="${item.id}" data-variant="${item.variant ?? ''}">+</button>
                            </div>
                            <strong class="cart-line-total">${money.format(item.price * item.quantity)}</strong>
                            <button type="button" class="cart-remove-btn"
                                data-remove-product="${item.id}" data-variant="${esc(item.variant ?? '')}"
                                title="Remover item">×</button>
                        </div>
                    </div>`;
            }).join('')
            : `<div class="cart-empty">
                    <i class="fas fa-shopping-bag text-3xl text-zinc-700 mb-2"></i>
                    <p>Seu carrinho está vazio.</p>
               </div>`;
    }

    const totalValue = cartTotal(cart);
    if (total) total.textContent = money.format(totalValue);

    const count = cartItemCount(cart);
    if (badge) badge.textContent = count;
    const navBadge = document.querySelector('#nav-cart-badge');
    if (navBadge) navBadge.textContent = count;

    const disabled = !cart.length;
    const startBtn = document.getElementById('checkout-start-btn');
    if (startBtn) {
        startBtn.disabled = disabled;
        startBtn.classList.toggle('opacity-40', disabled);
        startBtn.classList.toggle('cursor-not-allowed', disabled);
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    renderProducts(); // mostra spinner imediatamente
    await loadProducts();
    renderProducts(); // renderiza com dados reais
    renderCart();
    window.filterStoreCategory = filterStoreCategory;
});

// ─── Zoom da imagem (Lightbox) ────────────────────────────────────────────────
function openImageZoom(src, alt) {
    let overlay = document.getElementById('store-lightbox-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'store-lightbox-overlay';
        overlay.innerHTML = `
            <div class="lightbox-close">&times;</div>
            <img class="lightbox-img" src="" alt="" />
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.classList.remove('active');
        });
    }

    const img = overlay.querySelector('.lightbox-img');
    img.src = src;
    img.alt = alt || 'Imagem do produto';
    overlay.classList.add('active');
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener('click', (event) => {
    // Zoom na imagem do produto
    const clickedImg = event.target.closest('.product-img-wrap img');
    if (clickedImg) {
        openImageZoom(clickedImg.src, clickedImg.alt);
        return;
    }

    // "Tenho Interesse" (produto Em breve)
    const interestBtn = event.target.closest('[data-interest-product]');
    if (interestBtn) {
        const productName = interestBtn.dataset.productName || 'este produto';
        interestBtn.innerHTML = '<i class="fas fa-check"></i> Interesse registrado!';
        interestBtn.classList.add('btn-interest--done');
        interestBtn.disabled = true;
        window.showToast?.(`🔔 Interesse em "${productName}" registrado! Avisaremos quando estiver disponível.`);
        // Restaura após 4s
        setTimeout(() => {
            interestBtn.innerHTML = '<i class="fas fa-bell"></i> Tenho Interesse';
            interestBtn.classList.remove('btn-interest--done');
            interestBtn.disabled = false;
        }, 4000);
        return;
    }

    // Adicionar ao carrinho
    const addBtn = event.target.closest('[data-add-product]');
    if (addBtn) {
        const productId = addBtn.dataset.addProduct;
        const product   = PRODUCTS.find((p) => p.id === productId);
        if (!product) return;

        const card       = addBtn.closest('.product-card');
        const activeSize = card?.querySelector('.size-btn.active');
        const variant    = activeSize?.dataset.size ?? null;

        if (product.variants?.sizes?.length && !variant) {
            window.showToast?.('Selecione um tamanho primeiro!');
            return;
        }

        addToCart(product, variant);
        renderCart();

        const label = variant ? `${product.name} (${variant})` : product.name;
        window.showToast?.(`🛍️ ${label} adicionado!`);

        addBtn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        addBtn.classList.add('btn-added');
        setTimeout(() => {
            addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Adicionar';
            addBtn.classList.remove('btn-added');
        }, 1500);
        return;
    }

    // Selecionar tamanho
    const sizeBtn = event.target.closest('.size-btn');
    if (sizeBtn) {
        const wrap = sizeBtn.closest('.size-options');
        wrap?.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
        sizeBtn.classList.add('active');
        return;
    }

    // Alterar quantidade no carrinho
    const qtyBtn = event.target.closest('[data-qty-action]');
    if (qtyBtn) {
        const productId = qtyBtn.dataset.productId;
        const variant   = qtyBtn.dataset.variant || null;
        const cart      = getCart();
        const item      = cart.find((e) => e.id === productId && (e.variant ?? '') === (variant ?? ''));
        if (!item) return;
        const newQty = qtyBtn.dataset.qtyAction === 'increase' ? item.quantity + 1 : item.quantity - 1;
        updateQuantity(productId, newQty, variant || null);
        renderCart();
        return;
    }

    // Remover do carrinho
    const removeBtn = event.target.closest('[data-remove-product]');
    if (removeBtn) {
        const productId = removeBtn.dataset.removeProduct;
        const variant   = removeBtn.dataset.variant || null;
        removeFromCart(productId, variant || null);
        renderCart();
        window.showToast?.('Item removido do carrinho.');
        return;
    }

    // Checkout
    if (event.target.closest('#checkout-start-btn')) {
        openCheckoutFlow();
    }
});

window.addEventListener('bruna:cart-updated', renderCart);
