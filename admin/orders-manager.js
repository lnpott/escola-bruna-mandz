const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function renderOrders() {
    const area = document.querySelector('#admin-orders');
    if (!area) return;
    const orders = JSON.parse(localStorage.getItem('bruna_orders') || '[]');
    if (!orders.length) {
        area.innerHTML = '<p>Nenhum pedido</p>';
        return;
    }
    area.innerHTML = orders.map((order) => `
        <div class="product-card">
            <h3>Pedido: ${order.id}</h3>
            <p>Valor: ${money.format(order.total)}</p>
            <p>Status: ${order.status}</p>
            <p>Método: ${(order.method || 'pix').toUpperCase()}</p>
        </div>
    `).join('');
}
