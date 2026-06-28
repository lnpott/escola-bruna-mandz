/**
 * checkout-modal.js
 * Checkout da Loja Oficial Bruna Mandz — overlay único de tela cheia,
 * isolado do resto do site, integrado ao Mercado Pago de verdade.
 *
 * Estrutura: um único overlay (#checkout-overlay) com 4 "etapas" internas
 * (<section> mostradas uma por vez): customer → pix|card → success.
 *
 * Fechamento: SÓ pelo botão X (#checkout-close-btn). Nunca fecha clicando
 * fora — isso elimina o bug de "cliquei em outra coisa durante o pagamento
 * e travou tudo". Se houver um pagamento em andamento (PIX aguardando
 * confirmação, ou Brick de cartão montado) e o usuário clicar no X, pede
 * confirmação antes de fechar.
 *
 * Integração de pagamento:
 *   PIX: chama /api/create-payment → QR Code real do Mercado Pago → faz
 *     polling em /api/order-status até aprovação
 *   Cartão: renderiza o Card Payment Brick oficial do Mercado Pago
 *     (tokenização no navegador, sem coletar número/CVV no nosso servidor)
 *
 * Enquanto MERCADO_PAGO_ACCESS_TOKEN não estiver configurado na Vercel, o
 * backend responde em "modo local" e o fluxo segue normalmente para fins de
 * teste, só sem cobrar nada de verdade.
 */

import { PAYMENT_CONFIG, getMercadoPagoPublicKey } from './payment-config.js';
import { buildOrder, clearCart, applyStudentXp, getCart } from './cart.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Estado do overlay ─────────────────────────────────────────────────────

let _checkoutMethod = 'pix';
let _paymentInProgress = false; // true enquanto há PIX pendente ou Brick montado

function setPaymentInProgress(value) {
    _paymentInProgress = value;
}

// ─── Controle de etapas (dentro do mesmo overlay) ─────────────────────────

const STEP_IDS = {
    customer: 'checkout-step-customer',
    pix: 'checkout-step-pix',
    card: 'checkout-step-card',
    success: 'checkout-step-success',
};

function showStep(stepKey) {
    Object.values(STEP_IDS).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== STEP_IDS[stepKey]);
    });
}

function openOverlay() {
    const overlay = document.getElementById('checkout-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideCloseConfirm() {
    document.getElementById('checkout-close-confirm')?.classList.add('hidden');
}

function showCloseConfirm() {
    document.getElementById('checkout-close-confirm')?.classList.remove('hidden');
}

/**
 * Fecha o overlay de fato (sem perguntar nada). force=true ignora qualquer
 * pagamento em andamento — usado depois de sucesso, ou após confirmação.
 */
export function closeCheckoutOverlay(force = false) {
    if (_paymentInProgress && !force) {
        showCloseConfirm();
        return;
    }
    hideCloseConfirm();
    stopPixPolling();
    destroyCardBrick();
    setPaymentInProgress(false);
    const overlay = document.getElementById('checkout-overlay');
    if (overlay) overlay.classList.add('hidden');
    showStep('customer'); // reseta para a primeira etapa na próxima abertura
}

// Mantido por compatibilidade com onclicks antigos que possam referenciar isso
export function closeCheckoutModals() {
    closeCheckoutOverlay(true);
}

// ─── Fluxo principal ──────────────────────────────────────────────────────────

/**
 * Ponto de entrada: abre o overlay na etapa de dados do cliente.
 * Só é chamado DEPOIS que o usuário já adicionou algo ao carrinho e decidiu
 * comprar — a vitrine de produtos continua normal na página, fora do overlay.
 * @param {'pix'|'card'} method
 */
export function openCheckoutFlow(method) {
    if (!getCart().length) {
        window.showToast?.('Adicione produtos ao carrinho primeiro!');
        return;
    }
    _checkoutMethod = method;
    setPaymentInProgress(false);
    showStep('customer');
    openOverlay();
}

// ─── Etapa: Dados do Cliente ──────────────────────────────────────────────────

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

    if (_checkoutMethod === 'pix') {
        showStep('pix');
        openPixModal(order, earnedXp);
    } else {
        showStep('card');
        openCardModal(order, earnedXp);
    }
}

// ─── Etapa: PIX ────────────────────────────────────────────────────────────────

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

    if (totalEl) totalEl.textContent = money.format(order.total);
    if (orderEl) orderEl.textContent = order.id;
    if (keyEl) keyEl.textContent = 'Gerando código…';
    if (statusLine) statusLine.textContent = 'Gerando cobrança…';

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
            setPaymentInProgress(false);
        } else {
            if (qrImg && data.qr_code_base64) {
                qrImg.src = `data:image/png;base64,${data.qr_code_base64}`;
                qrImg.alt = `QR Code PIX - Pedido ${order.id}`;
            }
            if (keyEl) keyEl.textContent = data.qr_code || '—';
            if (statusLine) statusLine.textContent = 'Aguardando confirmação do pagamento…';

            // A partir daqui há um pagamento real pendente — fechar o
            // overlay agora pede confirmação.
            setPaymentInProgress(true);
            startPixPolling(order, earnedXp);
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
    } catch (err) {
        if (statusLine) statusLine.textContent = `Erro: ${err.message}`;
        window.showToast?.(`Erro ao gerar PIX: ${err.message}`);
        setPaymentInProgress(false);
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
                setPaymentInProgress(false);
                clearCart();
                applyStudentXp(earnedXp);
                showStep('success');
                openSuccessModal(order, earnedXp);
            } else if (['rejected', 'cancelled'].includes(data.status)) {
                stopPixPolling();
                setPaymentInProgress(false);
                const statusLine = document.getElementById('pix-status-line');
                if (statusLine) statusLine.textContent = 'Pagamento não aprovado. Tente novamente.';
            }
        } catch {
            // silenciosamente ignora falhas de rede no polling
        }
    }, 5000);
}

// ─── Etapa: Cartão (Mercado Pago Card Payment Brick) ─────────────────────────

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

    setPaymentInProgress(true); // Brick montado = considerar "em andamento"

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
                        setPaymentInProgress(false);
                        clearCart();
                        applyStudentXp(earnedXp);
                        showStep('success');
                        openSuccessModal(order, earnedXp);
                        return;
                    }

                    if (data.status === 'approved') {
                        setPaymentInProgress(false);
                        clearCart();
                        applyStudentXp(earnedXp);
                        showStep('success');
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

// ─── Etapa: Sucesso ───────────────────────────────────────────────────────────

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

// ─── Listeners do overlay (botão X + confirmação) ────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('checkout-close-btn')?.addEventListener('click', () => {
        closeCheckoutOverlay(false);
    });
    document.getElementById('checkout-close-confirm-yes')?.addEventListener('click', () => {
        closeCheckoutOverlay(true);
    });
    document.getElementById('checkout-close-confirm-no')?.addEventListener('click', () => {
        hideCloseConfirm();
    });
});

// Expor para uso inline no HTML
window.closeCheckoutOverlay = closeCheckoutOverlay;
window.closeCheckoutModals = closeCheckoutModals;
window.submitCustomerForm = submitCustomerForm;
window.openCheckoutFlow = openCheckoutFlow;
