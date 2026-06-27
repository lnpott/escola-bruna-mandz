// Camada isolada do gateway. Substitua os mocks pelos SDKs oficiais em produção.

const PROVIDER = process.env.PAYMENT_PROVIDER || 'mercado_pago';

export async function createPayment(payment) {
    if (PROVIDER === 'mercado_pago') return createMercadoPago(payment);
    if (PROVIDER === 'stripe') return createStripe(payment);
    throw new Error('Gateway não configurado');
}

async function createMercadoPago(data) {
    return {
        provider: 'mercado_pago',
        status: 'pending',
        type: data.method,
        amount: data.amount,
        message: 'Pagamento criado',
    };
}

async function createStripe(data) {
    return {
        provider: 'stripe',
        status: 'pending',
        type: data.method,
        amount: data.amount,
        message: 'Pagamento criado',
    };
}
