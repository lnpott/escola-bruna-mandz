// store/payment-config.js
//
// Configuração do fluxo de pedido do front-end.
// Não há pagamento online: o pedido é criado e o pagamento é combinado
// diretamente entre a Bruna e o cliente (WhatsApp/PIX manual).

export const PAYMENT_CONFIG = {
    createPaymentEndpoint: '/api/create-payment',
};
