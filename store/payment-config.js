export const PAYMENT_CONFIG = {
    provider: 'mercado_pago',
    methods: {
        pix: true,
        card: true,
    },
    endpoint: '/api/create-payment',
};
