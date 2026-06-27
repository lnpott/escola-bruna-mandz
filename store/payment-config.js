export const PAYMENT_CONFIG = {
    provider: 'mercado_pago', // Provedor ativo: 'mercado_pago' | 'stripe'
    methods: {
        pix: true,
        card: true,
    },
    endpoint: '/api/create-payment',

    // ─── PIX ──────────────────────────────────────────────────────────────────
    // Chave Pix exibida no modal de pagamento.
    // Substitua pelo valor real quando for ao ar.
    pixKey: '21997600704', // Placeholder: número WhatsApp da escola
    pixName: 'Escola de Música Bruna Mandz',
    pixCity: 'Maricá',

    // ─── MERCADO PAGO ─────────────────────────────────────────────────────────
    // Para ativar o Mercado Pago:
    // 1. Crie uma conta em https://www.mercadopago.com.br/developers
    // 2. Acesse Credenciais > Produção
    // 3. Copie a Public Key e insira abaixo
    // 4. Copie o Access Token e insira em api/create-payment.js (variável de ambiente)
    mercadoPagoPublicKey: null, // Ex: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

    // ─── STRIPE ───────────────────────────────────────────────────────────────
    // Alternativa ao Mercado Pago para pagamento com cartão.
    // Para ativar o Stripe:
    // 1. Crie uma conta em https://dashboard.stripe.com
    // 2. Acesse Developers > API Keys
    // 3. Copie a Publishable Key e insira abaixo
    // 4. Copie a Secret Key e insira em api/create-payment.js (variável de ambiente)
    stripePublicKey: null, // Ex: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx'
};
