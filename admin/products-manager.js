import { PRODUCTS } from '../store/products.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function renderProductsAdmin() {
    const area = document.querySelector('#admin-products');
    if (!area) return;
    area.innerHTML = PRODUCTS.map((product) => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>Preço: <strong>${money.format(product.price)}</strong></p>
            <p>Estoque: ${product.stock}</p>
            <p>Status: ${product.active ? 'Ativo' : 'Inativo'}</p>
            <button type="button" onclick="editProduct('${product.id}')">Editar preço</button>
        </div>
    `).join('');
}

window.editProduct = function editProduct(id) {
    const product = PRODUCTS.find((entry) => entry.id === id);
    if (!product) return;
    const price = prompt('Novo preço:', product.price);
    if (price) {
        product.price = Number(price);
        alert('Produto atualizado localmente. A persistência em banco entra na próxima fase.');
        renderProductsAdmin();
    }
};
