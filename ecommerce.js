// ecommerce.js
// Módulo inicial do Merchandising Oficial
// Integração preparada para gateway real (Mercado Pago/Stripe/etc)

const PRODUCTS = [
  {
    id: 1,
    name: 'Camiseta Oficial Bruna Mandz',
    price: 59.90,
    image: 'LOGOPRETO.png'
  },
  {
    id: 2,
    name: 'Caneca Oficial',
    price: 34.90,
    image: 'LOGOPRETO.png'
  }
];

let cart = [];

window.merchandising = {
  products: PRODUCTS,
  cart,

  add(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    cart.push(product);
    this.cart = cart;
    this.renderCart();
  },

  total() {
    return cart.reduce((sum, item) => sum + item.price, 0);
  },

  checkout(method) {
    const amount = this.total();

    if (!amount) {
      alert('Seu carrinho está vazio');
      return;
    }

    if (method === 'pix') {
      this.pixPayment(amount);
      return;
    }

    if (method === 'card') {
      this.cardPayment(amount);
    }
  },

  pixPayment(amount) {
    // Substituir pela API do gateway
    alert(`PIX iniciado. Valor: R$ ${amount.toFixed(2)}`);
  },

  cardPayment(amount) {
    // Substituir pela API do gateway
    alert(`Pagamento cartão iniciado. Valor: R$ ${amount.toFixed(2)}`);
  },

  renderCart() {
    const el = document.querySelector('#cart-total');
    if (el) el.innerHTML = `R$ ${this.total().toFixed(2)}`;
  }
};
