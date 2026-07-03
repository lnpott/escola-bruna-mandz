/**
 * checkout-modal.js
 * Checkout da Loja Oficial Bruna Mandz — overlay único de tela cheia.
 *
 * MODO ATUAL: "Fazer Pedido" — sem pagamento online.
 * O pedido é salvo no Supabase com status "pending" e a Bruna recebe
 * notificação por e-mail. O pagamento é combinado diretamente com a escola.
 *
 * Quando as credenciais do Mercado Pago estiverem disponíveis, basta:
 * 1. Descomentar o SDK do MP no index.html
 * 2. Restaurar os fluxos de PIX e Cartão neste arquivo
 * 3. O api/create-payment.js já detecta as credenciais automaticamente
 */

import { PAYMENT_CONFIG } from './payment-config.js';
import { buildOrder, clearCart, applyStudentXp, getCart } from './cart.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Estado interno ────────────────────────────────────────────────────────────

let _currentOrder = null;

// ─── Etapas do overlay ────────────────────────────────────────────────────────

const STEPS = {
    customer: 'checkout-step-customer',
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

export function closeCheckoutOverlay(force = false) {
    _currentOrder = null;
    document.getElementById('checkout-overlay')?.classList.add('hidden');
    document.body.style.overflow = '';
    showStep('customer');
    // Limpa os campos do formulário ao fechar
    ['checkout-name', 'checkout-email', 'checkout-phone'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    clearError('customer');
}

// Compatibilidade com onclicks antigos
export function closeCheckoutModals() {
    closeCheckoutOverlay(true);
}

// ─── Ponto de entrada ─────────────────────────────────────────────────────────

export function openCheckoutFlow() {
    if (!getCart().length) {
        window.showToast?.('Adicione produtos ao carrinho primeiro!');
        return;
    }
    showStep('customer');
    openOverlay();
}

// ─── Etapa 1: Dados do Cliente → Confirmar Pedido ────────────────────────────

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
            method: 'manual',
            customer: { name, email, phone },
        }));
    } catch (err) {
        window.showToast?.(`Erro: ${err.message}`);
        return;
    }

    _currentOrder = order;

    // Desabilita o botão para evitar duplo clique
    const btn = document.querySelector('#checkout-step-customer .checkout-btn-primary');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Registrando…';
    }

    try {
        const res = await fetch(PAYMENT_CONFIG.createPaymentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'manual', order }),
        });

        const data = await res.json();

        if (!res.ok) {
            showError('customer', data.error || 'Erro ao registrar pedido. Tente novamente.');
            return;
        }

        // Pedido registrado com sucesso — vai para tela de sucesso
        finalizePurchase(earnedXp);

    } catch (err) {
        showError('customer', 'Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
        // Reabilita o botão em caso de erro
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Pedido <i class="fas fa-arrow-right ml-1"></i>';
        }
    }
}

// ─── Tela de sucesso ──────────────────────────────────────────────────────────

function finalizePurchase(earnedXp) {
    clearCart();
    applyStudentXp(earnedXp);

    const order = _currentOrder;

    const orderIdEl  = document.getElementById('success-order-id');
    const totalEl    = document.getElementById('success-total');
    const xpEl       = document.getElementById('success-xp');
    const footerNote = document.getElementById('success-footer-note');

    if (orderIdEl) orderIdEl.textContent = order?.id || '—';
    if (totalEl)   totalEl.textContent   = money.format(order?.total || 0);
    if (xpEl)      xpEl.textContent      = `+${earnedXp} XP`;
    if (footerNote) {
        footerNote.textContent =
            'Entraremos em contato pelo WhatsApp ou e-mail para combinar o pagamento.';
    }

    // Oculta a linha "Método" na tela de sucesso (não faz sentido no modo manual)
    const methodRow = document.getElementById('success-method-row');
    if (methodRow) methodRow.classList.add('hidden');

    showStep('success');
    window.showToast?.(`✅ Pedido ${order?.id} recebido! +${earnedXp} XP`);
}

// ─── Utilitários de erro ──────────────────────────────────────────────────────

function showError(context, msg) {
    const el = document.getElementById(`checkout-${context}-error`);
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
    }
}

function clearError(context) {
    const el = document.getElementById(`checkout-${context}-error`);
    if (el) el.classList.add('hidden');
}

// ─── Listeners ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('checkout-close-btn')?.addEventListener('click', () => {
        closeCheckoutOverlay();
    });
});

// Expor para onclicks inline no HTML
window.closeCheckoutOverlay = closeCheckoutOverlay;
window.closeCheckoutModals  = closeCheckoutModals;
window.submitCustomerForm   = submitCustomerForm;
window.openCheckoutFlow     = openCheckoutFlow;
