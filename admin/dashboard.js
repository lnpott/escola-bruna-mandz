import { renderProductsAdmin } from './products-manager.js';
import { renderOrders } from './orders-manager.js';

function renderDashboard() {
    renderProductsAdmin();
    renderOrders();
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    document.querySelector('#refresh-admin')?.addEventListener('click', renderDashboard);
    document.querySelector('#seed-order')?.addEventListener('click', () => {
        const orders = JSON.parse(localStorage.getItem('bruna_orders') || '[]');
        orders.unshift({ id: `BM-${Date.now().toString().slice(-6)}`, total: 80, status: 'Aguardando pagamento', method: 'pix' });
        localStorage.setItem('bruna_orders', JSON.stringify(orders));
        renderOrders();
    });
});
