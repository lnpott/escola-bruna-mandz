
class Store {
  constructor() {
    this.cart = this.loadCart();
    this.listeners = [];
  }

  // ========================
  // CART STATE
  // ========================
  loadCart() {
    try {
      return JSON.parse(localStorage.getItem("cart")) || {
        items: [],
        total: 0
      };
    } catch {
      return { items: [], total: 0 };
    }
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
    this.notify();
  }

  // ========================
  // CART ACTIONS
  // ========================
  addItem(product) {
    const existing = this.cart.items.find(i => i.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.items.push({
        ...product,
        qty: 1
      });
    }

    this.calculateTotal();
    this.saveCart();
  }

  removeItem(productId) {
    this.cart.items = this.cart.items.filter(i => i.id !== productId);
    this.calculateTotal();
    this.saveCart();
  }

  clearCart() {
    this.cart = { items: [], total: 0 };
    this.saveCart();
  }

  calculateTotal() {
    this.cart.total = this.cart.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }

  // ========================
  // CHECKOUT ENTRY POINT
  // ========================
  checkout(customer) {
    if (!this.cart.items.length) {
      alert("Carrinho vazio");
      return;
    }

    // chama modal de checkout (PIX + CARTÃO)
    import("./checkout-modal.js").then(modal => {
      modal.openCheckoutFlow(this.cart, customer);
    });
  }

  // ========================
  // OBSERVERS (UI)
  // ========================
  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.cart));
  }
}

export const store = new Store();