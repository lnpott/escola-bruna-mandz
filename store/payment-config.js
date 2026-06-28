// store/payment-config.js
//
// Configuração de pagamento do front-end. Nenhuma chave sensível fica aqui.
//
// A Public Key do Mercado Pago é buscada em runtime via /api/config (que lê
// a variável de ambiente MERCADO_PAGO_PUBLIC_KEY na Vercel). A chave PIX real
// e o Access Token ficam só no backend e nunca chegam ao navegador do cliente.

export const PAYMENT_CONFIG = {
    methods: {
        pix: true,
        card: true,
    },
    createPaymentEndpoint: '/api/create-payment',
    publicConfigEndpoint: '/api/config',
};

let _cachedPublicKey = null;

/**
 * Busca a Public Key do Mercado Pago do endpoint /api/config.
 * Resultado é cacheado em memória durante a sessão da página.
 */
export async function getMercadoPagoPublicKey() {
    if (_cachedPublicKey) return _cachedPublicKey;
    try {
        const res = await fetch(PAYMENT_CONFIG.publicConfigEndpoint);
        const data = await res.json();
        _cachedPublicKey = data.mercadoPagoPublicKey;
        return _cachedPublicKey;
    } catch (err) {
        console.error('Não foi possível carregar a configuração de pagamento:', err);
        return null;
    }
}
