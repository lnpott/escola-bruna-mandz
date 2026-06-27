import { createPayment } from './payment-provider.js';

export async function POST(request) {
    const body = await request.json();
    if (!body.items || body.items.length === 0) {
        return { status: 400, message: 'Pedido vazio' };
    }
    const payment = {
        amount: body.total,
        method: body.method,
        customer: body.customer,
        items: body.items,
    };
    const result = await createPayment(payment);
    return { status: 200, data: result };
}
