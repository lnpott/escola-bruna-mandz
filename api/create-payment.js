/**
 * api/create-payment.js
 * Endpoint de criação de pagamento — Loja Oficial Bruna Mandz
 *
 * STATUS ATUAL: Modo local (sem integração real).
 * Para ativar pagamento real, siga as instruções em cada seção abaixo.
 *
 * Deploy sugerido: Netlify Functions, Vercel Serverless, Railway ou Render.
 */

// ─── VARIÁVEIS DE AMBIENTE (configure no painel do seu host) ──────────────────
//
//  MERCADO_PAGO_ACCESS_TOKEN  → Seu Access Token de produção do Mercado Pago
//  STRIPE_SECRET_KEY          → Sua Secret Key de produção do Stripe
//  PIX_KEY                    → Chave Pix da escola (telefone, CPF, e-mail ou aleatória)
//
// Exemplo de arquivo .env (nunca suba ao GitHub!):
//   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
//   STRIPE_SECRET_KEY=sk_live_xxxx
//   PIX_KEY=21997600704
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Corpo da requisição inválido.' });
    }

    const { method, order } = body;

    if (!order?.items?.length) {
        return jsonResponse(400, { error: 'Pedido vazio.' });
    }
    if (!['pix', 'card'].includes(method)) {
        return jsonResponse(400, { error: 'Método de pagamento inválido.' });
    }

    // ─── MODO LOCAL (padrão enquanto não há integração real) ─────────────────
    //
    // Retorna resposta simulada. O pedido já foi salvo no localStorage pelo
    // módulo store/cart.js (createLocalOrder). Este endpoint será chamado
    // quando a integração real for ativada.
    //
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN && !process.env.STRIPE_SECRET_KEY) {
        return jsonResponse(200, {
            mode: 'local',
            message: 'Pedido registrado localmente. Configure as variáveis de ambiente para pagamento real.',
            orderId: order.id,
        });
    }

    // ─── INTEGRAÇÃO MERCADO PAGO ──────────────────────────────────────────────
    //
    // Para ativar:
    // 1. npm install mercadopago
    // 2. Descomente o bloco abaixo
    // 3. Configure MERCADO_PAGO_ACCESS_TOKEN no painel do seu host
    //
    // if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    //     const { MercadoPagoConfig, Payment } = await import('mercadopago');
    //     const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    //     const payment = new Payment(client);
    //
    //     if (method === 'pix') {
    //         const result = await payment.create({
    //             body: {
    //                 transaction_amount: order.total,
    //                 description: `Pedido ${order.id} — Loja Bruna Mandz`,
    //                 payment_method_id: 'pix',
    //                 payer: {
    //                     email: order.customer.email,
    //                     first_name: order.customer.name.split(' ')[0],
    //                     last_name: order.customer.name.split(' ').slice(1).join(' '),
    //                 },
    //                 external_reference: order.id,
    //             },
    //         });
    //         return jsonResponse(200, {
    //             qr_code: result.point_of_interaction.transaction_data.qr_code,
    //             qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
    //             paymentId: result.id,
    //             orderId: order.id,
    //         });
    //     }
    //
    //     if (method === 'card') {
    //         // Para cartão, o frontend deve tokenizar os dados com o MP.js SDK
    //         // e enviar apenas o token aqui (body.cardToken)
    //         const result = await payment.create({
    //             body: {
    //                 transaction_amount: order.total,
    //                 token: body.cardToken,
    //                 description: `Pedido ${order.id} — Loja Bruna Mandz`,
    //                 installments: 1,
    //                 payment_method_id: body.paymentMethodId,
    //                 payer: { email: order.customer.email },
    //                 external_reference: order.id,
    //             },
    //         });
    //         return jsonResponse(200, { paymentId: result.id, status: result.status });
    //     }
    // }

    // ─── INTEGRAÇÃO STRIPE ────────────────────────────────────────────────────
    //
    // Para ativar:
    // 1. npm install stripe
    // 2. Descomente o bloco abaixo
    // 3. Configure STRIPE_SECRET_KEY no painel do seu host
    //
    // if (process.env.STRIPE_SECRET_KEY) {
    //     const Stripe = (await import('stripe')).default;
    //     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //
    //     if (method === 'card') {
    //         // O frontend cria um PaymentMethod com Stripe.js e envia body.paymentMethodId
    //         const paymentIntent = await stripe.paymentIntents.create({
    //             amount: Math.round(order.total * 100), // centavos
    //             currency: 'brl',
    //             payment_method: body.paymentMethodId,
    //             confirm: true,
    //             metadata: { orderId: order.id },
    //         });
    //         return jsonResponse(200, {
    //             clientSecret: paymentIntent.client_secret,
    //             status: paymentIntent.status,
    //         });
    //     }
    // }

    return jsonResponse(501, { error: 'Nenhum provedor de pagamento configurado.' });
}

// ─── Utilitário de resposta ────────────────────────────────────────────────────
function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
