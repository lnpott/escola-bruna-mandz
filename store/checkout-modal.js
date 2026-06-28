/**
 * checkout-modal.js
 * Módulo de fluxo de checkout da Loja Oficial Bruna Mandz — integrado ao
 * Mercado Pago de verdade (PIX via Payment API, Cartão via Card Payment Brick).
 *
 * Fluxo:
 *   openCheckoutFlow(method)
 *     → Modal #1: Dados do Cliente  (#modal-checkout-customer)
 *     → Modal #2a PIX:  chama /api/create-payment → QR Code real do MP (#modal-checkout-pix)
 *     → Modal #2b Cartão: Brick do Mercado Pago tokeniza e envia (#modal-checkout-card)
 *     → Modal #3: Sucesso / Confirmação  (#modal-checkout-success)
 *
 * Enquanto MERCADO_PAGO_ACCESS_TOKEN não estiver configurado na Vercel, o
 * backend responde em "modo local" e o fluxo segue normalmente para fins de
 * teste, só sem cobrar nada de verdade.
 */

import { PAYMENT_CONFIG, getMercadoPagoPublicKey } from './payment-config.js';
import { buildOrder, clearCart, applyStudentXp, getCart } from './cart.js';

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
    [
        'modal-checkout-customer',
        'modal-checkout-pix',
        'modal-checkout-card',
        'modal-checkout-success',
    ].forEach(closeModal);
    stopPixPolling();
    destroyCardBrick();
}

// ─── Fluxo principal ──────────────────────────────────────────────────────────

let _checkoutMethod = 'pix';

/**
 * Ponto de entrada: abre o modal de dados do cliente.
 * @param {'pix'|'card'} method
 */
export function openCheckoutFlow(method) {
    if (!getCart().length) {
        window.showToast?.('Adicione produtos ao carrinho primeiro!');
        return;
    }
    _checkoutMethod = method;
    openModal('modal-checkout-customer');
}

// ─── Modal 1: Dados do Cliente ────────────────────────────────────────────────

export async function submitCustomerForm() {
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

    let order, earnedXp;
    try {
        ({ order, earnedXp } = buildOrder({
            method: _checkoutMethod,
            customer: { name, email, phone },
        }));
    } catch (err) {
        window.showToast?.(`Erro: ${err.message}`);
        return;
    }

    closeModal('modal-checkout-customer');

    if (_checkoutMethod === 'pix') {
        openPixModal(order, earnedXp);
    } else {
        openCardModal(order, earnedXp);
    }
}

// ─── Modal 2a: PIX ────────────────────────────────────────────────────────────

let _pixPollInterval = null;

function stopPixPolling() {
    if (_pixPollInterval) {
        clearInterval(_pixPollInterval);
        _pixPollInterval = null;
    }
}

async function openPixModal(order, earnedXp) {
    const totalEl = document.getElementById('pix-total');
    const keyEl = document.getElementById('pix-key');
    const orderEl = document.getElementById('pix-order-id');
    const qrImg = document.getElementById('pix-qrcode');
    const statusLine = document.getElementById('pix-status-line');
    const confirmBtn = document.getElementById('pix-confirm-btn');

    if (totalEl) totalEl.textContent = money.format(order.total);
    if (orderEl) orderEl.textContent = order.id;
    if (keyEl) keyEl.textContent = 'Gerando código…';
    if (statusLine) statusLine.textContent = 'Gerando cobrança…';

    openModal('modal-checkout-pix');

    try {
        const res = await fetch(PAYMENT_CONFIG.createPaymentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'pix', order }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Falha ao gerar cobrança PIX.');
        }

        if (data.mode === 'local') {
            // Modo local: ainda não há chave do Mercado Pago configurada.
            if (keyEl)
                keyEl.textContent =
                    '(modo de teste — configure o Mercado Pago para gerar um código real)';
            if (statusLine) statusLine.textContent = data.message;
            if (qrImg) qrImg.alt = 'QR Code indisponível em modo local';
        } else {
            if (qrImg && data.qr_code_base64) {
                qrImg.src = `data:image/png;base64,${data.qr_code_base64}`;
                qrImg.alt = `QR Code PIX - Pedido ${order.id}`;
            }
            if (keyEl) keyEl.textContent = data.qr_code || '—';
            if (statusLine) statusLine.textContent = 'Aguardando confirmação do pagamento…';

            // Consulta o status do pedido periodicamente até ser aprovado/rejeitado.
            startPixPolling(order, earnedXp, data.paymentId);
        }

        const copyBtn = document.getElementById('pix-copy-btn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(keyEl?.textContent || '').then(() => {
                    window.showToast?.('Código PIX copiado!');
                    copyBtn.textContent = '✓ Copiado!';
                    setTimeout(() => (copyBtn.textContent = 'Copiar Código'), 2000);
                });
            };
        }

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                stopPixPolling();
                closeModal('modal-checkout-pix');
            };
        }
    } catch (err) {
        if (statusLine) statusLine.textContent = `Erro: ${err.message}`;
        window.showToast?.(`Erro ao gerar PIX: ${err.message}`);
    }
}

function startPixPolling(order, earnedXp) {
    stopPixPolling();
    let attempts = 0;
    _pixPollInterval = setInterval(async () => {
        attempts += 1;
        if (attempts > 60) {
            stopPixPolling(); // ~5 minutos de polling, depois para
            return;
        }
        try {
            const res = await fetch(`/api/order-status?id=${encodeURIComponent(order.id)}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.status === 'approved') {
                stopPixPolling();
                clearCart();
                applyStudentXp(earnedXp);
                closeModal('modal-checkout-pix');
                openSuccessModal(order, earnedXp);
            } else if (['rejected', 'cancelled'].includes(data.status)) {
                stopPixPolling();
                const statusLine = document.getElementById('pix-status-line');
                if (statusLine) statusLine.textContent = 'Pagamento não aprovado. Tente novamente.';
            }
        } catch {
            // silenciosamente ignora falhas de rede no polling
        }
    }, 5000);
}

// ─── Modal 2b: Cartão (Mercado Pago Card Payment Brick) ──────────────────────

let _cardBrickController = null;

async function destroyCardBrick() {
    if (_cardBrickController) {
        try {
            await _cardBrickController.unmount();
        } catch {
            // ignora
        }
        _cardBrickController = null;
    }
}

async function openCardModal(order, earnedXp) {
    const totalEl = document.getElementById('card-total');
    const orderEl = document.getElementById('card-order-id');
    if (totalEl) totalEl.textContent = money.format(order.total);
    if (orderEl) orderEl.textContent = order.id;

    openModal('modal-checkout-card');
    clearCheckoutError('card');

    const publicKey = await getMercadoPagoPublicKey();
    const brickContainer = document.getElementById('card-payment-brick');

    if (!publicKey) {
        if (brickContainer) {
            brickContainer.innerHTML = `
                <div class="checkout-error" style="display:block;">
                    Pagamento por cartão ainda não está configurado
                    (MERCADO_PAGO_PUBLIC_KEY ausente). Use o PIX por enquanto,
                    ou configure a chave nas variáveis de ambiente da Vercel.
                </div>`;
        }
        return;
    }

    if (typeof window.MercadoPago === 'undefined') {
        if (brickContainer) {
            brickContainer.innerHTML = `<div class="checkout-error" style="display:block;">SDK do Mercado Pago não carregou. Verifique sua conexão.</div>`;
        }
        return;
    }

    await destroyCardBrick();

    const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
    const bricksBuilder = mp.bricks();

    _cardBrickController = await bricksBuilder.create('cardPayment', 'card-payment-brick', {
        initialization: {
            amount: order.total,
        },
        callbacks: {
            onReady: () => {},
            onSubmit: async (cardFormData) => {
                try {
                    const res = await fetch(PAYMENT_CONFIG.createPaymentEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            method: 'card',
                            order,
                            cardToken: cardFormData.token,
                            paymentMethodId: cardFormData.payment_method_id,
                            installments: cardFormData.installments,
                        }),
                    });
                    const data = await res.json();

                    if (!res.ok) {
                        showCheckoutError('card', data.error || 'Pagamento recusado.');
                        return;
                    }

                    if (data.mode === 'local') {
                        clearCart();
                        applyStudentXp(earnedXp);
                        closeModal('modal-checkout-card');
                        openSuccessModal(order, earnedXp);
                        return;
                    }

                    if (data.status === 'approved') {
                        clearCart();
                        applyStudentXp(earnedXp);
                        closeModal('modal-checkout-card');
                        openSuccessModal(order, earnedXp);
                    } else if (data.status === 'rejected') {
                        showCheckoutError(
                            'card',
                            'Pagamento recusado pela operadora. Tente outro cartão.'
                        );
                    } else {
                        showCheckoutError(
                            'card',
                            'Pagamento em análise. Você será notificado quando for aprovado.'
                        );
                    }
                } catch (err) {
                    showCheckoutError('card', `Erro ao processar pagamento: ${err.message}`);
                }
            },
            onError: (error) => {
                console.error('Erro no Brick de cartão:', error);
                showCheckoutError('card', 'Erro ao carregar o formulário de cartão.');
            },
        },
    });
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

    window.showToast?.(`✅ Pedido ${order.id} confirmado! +${earnedXp} XP`);
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
