/**
 * checkout-modal.js
 * Checkout da Loja Oficial Bruna Mandz — overlay único de tela cheia.
 *
 * FLUXO:
 *   1. Usuário clica "Finalizar Compra" no carrinho
 *   2. Overlay abre na etapa "customer" (dados do cliente)
 *   3. Ao confirmar dados, abre etapa "payment" com o Payment Brick do
 *      Mercado Pago — PIX e Cartão aparecem juntos em abas, sem precisar
 *      escolher antes. O usuário troca entre eles livremente dentro do Brick.
 *   4. Ao confirmar pagamento, vai para etapa "success".
 *
 * FECHAMENTO: só pelo botão X. Se houver pagamento em andamento (PIX
 * aguardando confirmação ou Brick montado), pede confirmação antes de fechar.
 */

import { PAYMENT_CONFIG, getMercadoPagoPublicKey } from './payment-config.js';
import { buildOrder, clearCart, applyStudentXp, getCart } from './cart.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Estado interno ────────────────────────────────────────────────────────────

let _paymentInProgress = false;
let _pixPollInterval = null;
let _paymentBrickController = null;
let _currentOrder = null;
let _currentEarnedXp = 0;
let _selectedMethod = null; // 'pix' | 'credit_card' | 'debit_card' etc.

function setPaymentInProgress(v) {
    _paymentInProgress = v;
}

// ─── Etapas do overlay ────────────────────────────────────────────────────────

const STEPS = {
    customer: 'checkout-step-customer',
    payment:  'checkout-step-payment',
    success:  'checkout-step-success',
};

function showStep(key) {
    Object.values(STEPS).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== STEPS[key]);
    });
}

// ─── Abrir / fechar overlay ───────────────────────────────────────────────────

function openOverlay() {
    document.getElementById('checkout-overlay')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideCloseConfirm() {
    document.getElementById('checkout-close-confirm')?.classList.add('hidden');
}

function showCloseConfirm() {
    document.getElementById('checkout-close-confirm')?.classList.remove('hidden');
}

export function closeCheckoutOverlay(force = false) {
    if (_paymentInProgress && !force) {
        showCloseConfirm();
        return;
    }
    hideCloseConfirm();
    stopPixPolling();
    destroyPaymentBrick();
    setPaymentInProgress(false);
    _currentOrder = null;
    document.getElementById('checkout-overlay')?.classList.add('hidden');
    document.body.style.overflow = '';
    showStep('customer');
}

// Compatibilidade com onclicks antigos
export function closeCheckoutModals() {
    closeCheckoutOverlay(true);
}

// ─── Ponto de entrada ─────────────────────────────────────────────────────────

/**
 * Abre o overlay. Chamado quando o usuário clica "Finalizar Compra".
 * Não recebe mais "method" — a escolha PIX/Cartão é feita dentro do Brick.
 */
export function openCheckoutFlow() {
    if (!getCart().length) {
        window.showToast?.('Adicione produtos ao carrinho primeiro!');
        return;
    }
    setPaymentInProgress(false);
    showStep('customer');
    openOverlay();
}

// ─── Etapa 1: Dados do Cliente ────────────────────────────────────────────────

export async function submitCustomerForm() {
    const name  = document.getElementById('checkout-name')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();

    if (!name || !email || !phone) {
        showError('customer', 'Por favor, preencha todos os campos.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('customer', 'E-mail inválido.');
        return;
    }
    clearError('customer');

    let order, earnedXp;
    try {
        ({ order, earnedXp } = buildOrder({
            method: 'pix', // placeholder, será sobrescrito ao pagar
            customer: { name, email, phone },
        }));
    } catch (err) {
        window.showToast?.(`Erro: ${err.message}`);
        return;
    }

    _currentOrder = order;
    _currentEarnedXp = earnedXp;

    showStep('payment');
    await openPaymentBrick(order, earnedXp);
}

// ─── Etapa 2: Payment Brick (PIX + Cartão unificados) ────────────────────────

async function destroyPaymentBrick() {
    if (_paymentBrickController) {
        try { await _paymentBrickController.unmount(); } catch { /* ignora */ }
        _paymentBrickController = null;
    }
    // Limpa o container para o próximo uso
    const container = document.getElementById('payment-brick-container');
    if (container) container.innerHTML = '';
}

async function openPaymentBrick(order, earnedXp) {
    const container = document.getElementById('payment-brick-container');
    const errorEl   = document.getElementById('checkout-payment-error');

    if (container) container.innerHTML = '';
    if (errorEl)   errorEl.classList.add('hidden');

    // Atualiza total visível
    const totalEl = document.getElementById('payment-order-total');
    if (totalEl) totalEl.textContent = money.format(order.total);

    const publicKey = await getMercadoPagoPublicKey();
    if (!publicKey) {
        showError('payment', 'Pagamento não configurado. Entre em contato com a escola.');
        return;
    }

    if (typeof window.MercadoPago === 'undefined') {
        showError('payment', 'SDK do Mercado Pago não carregou. Verifique sua conexão.');
        return;
    }

    await destroyPaymentBrick();

    const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
    const bricksBuilder = mp.bricks();

    try {
        _paymentBrickController = await bricksBuilder.create(
            'payment',
            'payment-brick-container',
            {
                initialization: {
                    amount: order.total,
                    payer: {
                        email:      document.getElementById('checkout-email')?.value.trim() || '',
                        entityType: 'individual',
                    },
                },
                customization: {
                    paymentMethods: {
                        creditCard:   'all',
                        debitCard:    'all',
                        ticket:       'none',
                        bankTransfer: ['pix'],
                        mercadoPago:  'none',
                    },
                    visual: {
                        style: {
                            theme: 'dark',
                            customVariables: {
                                baseColor:              '#ef4444',
                                baseColorFirstVariant:  '#dc2626',
                                baseColorSecondVariant: '#b91c1c',
                                errorColor:             '#f87171',
                                textPrimaryColor:       '#f4f4f5',
                                textSecondaryColor:     '#a1a1aa',
                                inputBackgroundColor:   '#18181b',
                                formBackgroundColor:    '#09090b',
                                borderRadiusFull:       '12px',
                                borderRadiusLarge:      '10px',
                                borderRadiusMedium:     '8px',
                            },
                        },
                    },
                },
                callbacks: {
                    onReady: () => {
                        setPaymentInProgress(true);
                    },
                    onSubmit: async ({ selectedPaymentMethod, formData }) => {
                        _selectedMethod = selectedPaymentMethod;
                        clearError('payment');

                        try {
                            // Determina method para o backend
                            const method = selectedPaymentMethod === 'bank_transfer'
                                ? 'pix'
                                : 'card';

                            // Monta payload correto para cada método
                            let payload;
                            if (method === 'pix') {
                                payload = {
                                    method: 'pix',
                                    order: { ..._currentOrder, method: 'pix' },
                                };
                            } else {
                                payload = {
                                    method: 'card',
                                    order: { ..._currentOrder, method: 'card' },
                                    cardToken:       formData.token,
                                    paymentMethodId: formData.payment_method_id,
                                    installments:    formData.installments,
                                    payerEmail:      formData.payer?.email,
                                };
                            }

                            const res  = await fetch(PAYMENT_CONFIG.createPaymentEndpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload),
                            });
                            const data = await res.json();

                            if (!res.ok) {
                                showError('payment', data.error || 'Falha ao processar pagamento.');
                                return;
                            }

                            if (data.mode === 'local') {
                                // Modo teste sem chave configurada
                                finalizePurchase(earnedXp);
                                return;
                            }

                            if (method === 'pix') {
                                // Para PIX: mostra QR code e inicia polling
                                showPixResult(data, _currentOrder, earnedXp);
                            } else {
                                // Para cartão: resposta síncrona
                                if (data.status === 'approved') {
                                    finalizePurchase(earnedXp);
                                } else if (data.status === 'rejected') {
                                    showError('payment', 'Pagamento recusado pela operadora. Tente outro cartão.');
                                } else {
                                    showError('payment', 'Pagamento em análise. Você será notificado em breve.');
                                }
                            }
                        } catch (err) {
                            showError('payment', `Erro ao processar: ${err.message}`);
                        }
                    },
                    onError: (error) => {
                        console.error('Payment Brick error:', error);
                        showError('payment', 'Erro ao carregar formulário de pagamento. Tente recarregar a página.');
                    },
                },
            }
        );
    } catch (err) {
        console.error('Erro ao criar Payment Brick:', err);
        showError('payment', 'Não foi possível carregar o formulário de pagamento. Tente novamente.');
    }
}

// ─── Resultado PIX (QR Code dentro da etapa payment) ─────────────────────────

function showPixResult(data, order, earnedXp) {
    const pixResult = document.getElementById('payment-pix-result');
    const qrImg     = document.getElementById('payment-pix-qr');
    const keyEl     = document.getElementById('payment-pix-key');
    const statusEl  = document.getElementById('payment-pix-status');
    const copyBtn   = document.getElementById('payment-pix-copy');

    if (pixResult) pixResult.classList.remove('hidden');

    if (qrImg && data.qr_code_base64) {
        qrImg.src = `data:image/png;base64,${data.qr_code_base64}`;
        qrImg.alt = `QR Code PIX — Pedido ${order.id}`;
    }
    if (keyEl) keyEl.textContent = data.qr_code || '—';
    if (statusEl) statusEl.textContent = 'Aguardando confirmação do pagamento…';

    if (copyBtn && keyEl) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(keyEl.textContent || '').then(() => {
                window.showToast?.('Código PIX copiado!');
                copyBtn.textContent = '✓ Copiado!';
                setTimeout(() => (copyBtn.textContent = 'Copiar código PIX'), 2000);
            });
        };
    }

    setPaymentInProgress(true);
    startPixPolling(order, earnedXp, statusEl);
}

// ─── Polling de status PIX ────────────────────────────────────────────────────

function stopPixPolling() {
    if (_pixPollInterval) {
        clearInterval(_pixPollInterval);
        _pixPollInterval = null;
    }
}

function startPixPolling(order, earnedXp, statusEl) {
    stopPixPolling();
    let attempts = 0;
    _pixPollInterval = setInterval(async () => {
        attempts += 1;
        if (attempts > 72) { // ~6 minutos
            stopPixPolling();
            if (statusEl) statusEl.textContent = 'Tempo esgotado. Tente novamente se já pagou.';
            return;
        }
        try {
            const res  = await fetch(`/api/order-status?id=${encodeURIComponent(order.id)}`);
            if (!res.ok) return;
            const data = await res.json();

            if (data.status === 'approved') {
                stopPixPolling();
                finalizePurchase(earnedXp);
            } else if (['rejected', 'cancelled'].includes(data.status)) {
                stopPixPolling();
                setPaymentInProgress(false);
                if (statusEl) statusEl.textContent = 'Pagamento não aprovado. Tente novamente.';
            }
        } catch { /* ignora falhas de rede no polling */ }
    }, 5000);
}

// ─── Finalizar compra (sucesso) ───────────────────────────────────────────────

function finalizePurchase(earnedXp) {
    stopPixPolling();
    setPaymentInProgress(false);
    clearCart();
    applyStudentXp(earnedXp);

    const order = _currentOrder;

    const orderIdEl = document.getElementById('success-order-id');
    const methodEl  = document.getElementById('success-method');
    const totalEl   = document.getElementById('success-total');
    const xpEl      = document.getElementById('success-xp');

    const methodLabel = _selectedMethod === 'bank_transfer'
        ? 'PIX'
        : _selectedMethod?.includes('debit')
            ? 'Cartão de Débito'
            : 'Cartão de Crédito';

    if (orderIdEl) orderIdEl.textContent = order?.id || '—';
    if (methodEl)  methodEl.textContent  = methodLabel;
    if (totalEl)   totalEl.textContent   = money.format(order?.total || 0);
    if (xpEl)      xpEl.textContent      = `+${earnedXp} XP`;

    showStep('success');
    window.showToast?.(`✅ Pedido ${order?.id} confirmado! +${earnedXp} XP`);
}

// ─── Utilitários de erro ──────────────────────────────────────────────────────

function showError(context, msg) {
    const el = document.getElementById(`checkout-${context}-error`);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
    window.showToast?.(`Erro: ${msg}`);
}

function clearError(context) {
    const el = document.getElementById(`checkout-${context}-error`);
    if (el) el.classList.add('hidden');
}

// ─── Listeners ────────────────────────────────────────────────────────────────

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

// Expor para onclicks inline no HTML
window.closeCheckoutOverlay = closeCheckoutOverlay;
window.closeCheckoutModals  = closeCheckoutModals;
window.submitCustomerForm   = submitCustomerForm;
window.openCheckoutFlow     = openCheckoutFlow;
