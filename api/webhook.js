// Recebe atualização do pagamento e, futuramente, atualiza pedido.status no banco.

export async function POST(request) {
    const event = await request.json();
    console.log('Gateway informou:', event);
    return { received: true };
}
