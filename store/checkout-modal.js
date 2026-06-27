/**
 * checkout-modal.js
 * Módulo de fluxo de checkout da Loja Oficial Bruna Mandz.
 *
 * Fluxo:
 *   openCheckoutFlow(method)
 *     → Modal #1: Dados do Cliente  (#modal-checkout-customer)
 *     → Modal #2a PIX:  QR Code + Chave Pix  (#modal-checkout-pix)
 *     → Modal #2b Cartão: Formulário de cartão  (#modal-checkout-card)
 *     → Modal #3: Sucesso / Confirmação  (#modal-checkout-success)
 */

import { PAYMENT_CONFIG } from './payment-config.js';
import { createLocalOrder, getCart, cartTotal } from './cart.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Utilitários de modal ─────────────────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(() => {
        el.querySelector('.checkout-modal-box')?.classList.remove('scale-95', 'opacity-0');
    });
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelector('.checkout-modal-box')?.classList.add('scale-95', 'opacity-0');
    setTimeout(() => el.classList.add('hidden'), 200);
}

export function closeCheckoutModals() {
    ['modal-checkout-customer', 'modal-checkout-pix', 'modal-checkout-card', 'modal-checkout-success']
        .forEach(closeModal);
}

// ─── Fluxo principal ──────────────────────────────────────────────────────────

let _checkoutMethod = 'pix';

/**
 * Ponto de entrada: abre o modal de dados do cliente.
 * @param {'pix'|'card'} method
 */
export function openCheckoutFlow(method) {
    const cart = getCart();
    if (!cart.length) {
        window.showToast?.('Adicione produtos ao carrinho primeiro!');
        return;
    }
    _checkoutMethod = method;
    openModal('modal-checkout-customer');
}

// ─── Modal 1: Dados do Cliente ────────────────────────────────────────────────

export function submitCustomerForm() {
    const name = document.getElementById('checkout-name')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();

    if (!name || !email || !phone) {
        showCheckoutError('customer', 'Por favor, preencha todos os campos.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showCheckoutError('customer', 'E-mail inválido.');
        return;
    }

    clearCheckoutError('customer');
    closeModal('modal-checkout-customer');

    try {
        const { order, earnedXp } = createLocalOrder({
            method: _checkoutMethod,
            customer: { name, email, phone },
        });

        if (_checkoutMethod === 'pix') {
            openPixModal(order, earnedXp);
        } else {
            openCardModal(order, earnedXp);
        }
    } catch (err) {
        window.showToast?.(`Erro: ${err.message}`);
    }
}

// ─── Modal 2a: PIX ────────────────────────────────────────────────────────────

function openPixModal(order, earnedXp) {
    const totalEl = document.getElementById('pix-total');
    const keyEl = document.getElementById('pix-key');
    const nameEl = document.getElementById('pix-name');
    const orderEl = document.getElementById('pix-order-id');
    const qrImg = document.getElementById('pix-qrcode');

    if (totalEl) totalEl.textContent = money.format(order.total);
    if (keyEl) keyEl.textContent = PAYMENT_CONFIG.pixKey;
    if (nameEl) nameEl.textContent = PAYMENT_CONFIG.pixName;
    if (orderEl) orderEl.textContent = order.id;

    // QR Code gerado via API pública (substitua por QR Code real do Mercado Pago)
    const qrText = encodeURIComponent(
        `PIX|${PAYMENT_CONFIG.pixKey}|${order.total.toFixed(2)}|${order.id}|${PAYMENT_CONFIG.pixName}`
    );
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrText}&bgcolor=09090b&color=ffffff&margin=10`;
        qrImg.alt = `QR Code PIX - Pedido ${order.id}`;
    }

    // Botão de confirmação
    const confirmBtn = document.getElementById('pix-confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            closeModal('modal-checkout-pix');
            openSuccessModal(order, earnedXp);
        };
    }

    // Botão de copiar chave
    const copyBtn = document.getElementById('pix-copy-btn');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(PAYMENT_CONFIG.pixKey).then(() => {
                window.showToast?.('Chave PIX copiada!');
                copyBtn.textContent = '✓ Copiado!';
                setTimeout(() => (copyBtn.textContent = 'Copiar Chave'), 2000);
            });
        };
    }

    openModal('modal-checkout-pix');

    // ─── HOOK MERCADO PAGO ─────────────────────────────────────────────────
    // Quando tiver a integração real, substitua o QR Code acima pelo retornado pela API:
    //
    // const mpResponse = await fetch('/api/create-payment', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ method: 'pix', order })
    // });
    // const { qr_code_base64, qr_code } = await mpResponse.json();
    // qrImg.src = `data:image/png;base64,${qr_code_base64}`;
    // keyEl.textContent = qr_code; // código copia-e-cola
    // ──────────────────────────────────────────────────────────────────────
}

// ─── Modal 2b: Cartão ─────────────────────────────────────────────────────────

function openCardModal(order, earnedXp) {
    const totalEl = document.getElementById('card-total');
    const orderEl = document.getElementById('card-order-id');
    if (totalEl) totalEl.textContent = money.format(order.total);
    if (orderEl) orderEl.textContent = order.id;

    // Formata número do cartão automaticamente
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', () => {
            let val = cardNumber.value.replace(/\D/g, '').slice(0, 16);
            cardNumber.value = val.replace(/(.{4})/g, '$1 ').trim();
        });
    }

    // Formata validade
    const cardExpiry = document.getElementById('card-expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', () => {
            let val = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
            cardExpiry.value = val;
        });
    }

    // Limita CVV a 3 ou 4 dígitos
    const cardCvv = document.getElementById('card-cvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', () => {
            cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    const submitBtn = document.getElementById('card-submit-btn');
    if (submitBtn) {
        submitBtn.onclick = () => submitCardForm(order, earnedXp);
    }

    openModal('modal-checkout-card');

    // ─── HOOK MERCADO PAGO / STRIPE ───────────────────────────────────────
    // Para usar Mercado Pago Checkout Bricks:
    //   const mp = new MercadoPago(PAYMENT_CONFIG.mercadoPagoPublicKey);
    //   const bricks = mp.bricks();
    //   await bricks.create('cardPayment', 'mp-card-form', { ... });
    //
    // Para usar Stripe Elements:
    //   const stripe = Stripe(PAYMENT_CONFIG.stripePublicKey);
    //   const elements = stripe.elements();
    //   const cardElement = elements.create('card');
    //   cardElement.mount('#stripe-card-element');
    // ──────────────────────────────────────────────────────────────────────
}

function submitCardForm(order, earnedXp) {
    const number = document.getElementById('card-number')?.value.replace(/\s/g, '');
    const holder = document.getElementById('card-holder')?.value.trim();
    const expiry = document.getElementById('card-expiry')?.value.trim();
    const cvv = document.getElementById('card-cvv')?.value.trim();

    if (!number || number.length < 16 || !holder || !expiry || cvv.length < 3) {
        showCheckoutError('card', 'Por favor, preencha todos os dados do cartão corretamente.');
        return;
    }

    clearCheckoutError('card');

    // ─── HOOK DE INTEGRAÇÃO ───────────────────────────────────────────────
    // Aqui você enviaria os dados tokenizados para a API de pagamento.
    // NUNCA envie dados brutos do cartão ao servidor — use o SDK do MP ou Stripe
    // para tokenizar antes de enviar.
    //
    // Exemplo Mercado Pago:
    //   const cardToken = await mp.createCardToken({ ... });
    //   await fetch('/api/create-payment', {
    //     method: 'POST',
    //     body: JSON.stringify({ method: 'card', token: cardToken.id, order })
    //   });
    // ──────────────────────────────────────────────────────────────────────

    closeModal('modal-checkout-card');
    openSuccessModal(order, earnedXp);
}

// ─── Modal 3: Sucesso ─────────────────────────────────────────────────────────

function openSuccessModal(order, earnedXp) {
    const orderIdEl = document.getElementById('success-order-id');
    const methodEl = document.getElementById('success-method');
    const xpEl = document.getElementById('success-xp');
    const totalEl = document.getElementById('success-total');

    if (orderIdEl) orderIdEl.textContent = order.id;
    if (methodEl) methodEl.textContent = order.method === 'pix' ? 'PIX' : 'Cartão de Crédito';
    if (xpEl) xpEl.textContent = `+${earnedXp} XP`;
    if (totalEl) totalEl.textContent = money.format(order.total);

    window.showToast?.(`✅ Pedido ${order.id} registrado! +${earnedXp} XP`);
    openModal('modal-checkout-success');
}

// ─── Utilitários de validação ─────────────────────────────────────────────────

function showCheckoutError(context, message) {
    const el = document.getElementById(`checkout-${context}-error`);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

function clearCheckoutError(context) {
    const el = document.getElementById(`checkout-${context}-error`);
    if (el) el.classList.add('hidden');
}

// ─── Fechar ao clicar fora ────────────────────────────────────────────────────

document.addEventListener('click', (e) => {
    const overlays = [
        'modal-checkout-customer',
        'modal-checkout-pix',
        'modal-checkout-card',
        'modal-checkout-success',
    ];
    overlays.forEach((id) => {
        const el = document.getElementById(id);
        if (e.target === el) closeModal(id);
    });
});

// Expor para uso inline no HTML
window.closeCheckoutModals = closeCheckoutModals;
window.submitCustomerForm = submitCustomerForm;
window.openCheckoutFlow = openCheckoutFlow;
