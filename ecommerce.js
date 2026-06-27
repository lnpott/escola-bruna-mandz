// Compatibilidade com integrações antigas. A loja 2.0 usa módulos em store/.
import { PRODUCTS } from './store/products.js';
import { addToCart, cartTotal, getCart } from './store/cart.js';

window.merchandising = {
    products: PRODUCTS,
    get cart() {
        return getCart();
    },
    add(productId) {
        const product = PRODUCTS.find((entry) => entry.id === String(productId) || entry.id === productId);
        if (product) addToCart(product);
    },
    total() {
        return cartTotal();
    },
};
