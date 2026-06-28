/**
 * api/create-payment.js
 * Cria um pagamento real no Mercado Pago (PIX ou Cartão) e salva o pedido no Supabase.
 *
 * Vercel Function — runtime Node (precisamos do SDK oficial do Mercado Pago).
 *
 * NOTA SOBRE A VERSÃO DO SDK: este código usa a classe `Payment` do pacote
 * `mercadopago` (npm), que funciona nas versões 2.x. Há uma versão mais nova
 * do SDK que usa a classe `Order` em vez de `Payment` para fluxos mais
 * complexos — se ao instalar você receber avisos de depreciação sobre
 * `Payment`, consulte https://github.com/mercadopago/sdk-nodejs para o
 * exemplo atualizado e me avise para eu adaptar este arquivo.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS (configure na Vercel > Settings > Environment Variables):
 *   MERCADO_PAGO_ACCESS_TOKEN  → Access Token de produção (Mercado Pago > Credenciais)
 *   SUPABASE_URL               → URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY  → Service Role Key do Supabase
 *
 * ENQUANTO essas variáveis não existirem, o endpoint responde em "modo local"
 * (sem cobrar nada de verdade) para você poder testar o resto do fluxo.
 */

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({ error: 'Corpo da requisição inválido.' });
        }
    }

    const { method, order, cardToken, paymentMethodId, installments } = body || {};

    if (!order?.items?.length) {
        return res.status(400).json({ error: 'Pedido vazio.' });
    }
    if (!['pix', 'card'].includes(method)) {
        return res.status(400).json({ error: 'Método de pagamento inválido.' });
    }

    const hasMpToken = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);

    // ─── MODO LOCAL (enquanto as chaves reais não foram configuradas) ────────
    if (!hasMpToken) {
        await saveOrderToSupabase({
            order,
            method,
            status: 'pending',
            mpPaymentId: null,
            mpStatus: 'local_mode',
        }).catch((e) => console.error('Supabase (modo local) falhou:', e.message));

        return res.status(200).json({
            mode: 'local',
            message:
                'MERCADO_PAGO_ACCESS_TOKEN não configurado. Pedido salvo como pendente. Configure a chave para cobrar de verdade.',
            orderId: order.id,
        });
    }

    // ─── MODO REAL — MERCADO PAGO ─────────────────────────────────────────────
    try {
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
        });
        const payment = new Payment(client);

        const [firstName, ...rest] = (order.customer?.name || 'Cliente').split(' ');
        const lastName = rest.join(' ') || 'Bruna Mandz';

        let mpResult;

        if (method === 'pix') {
            mpResult = await payment.create({
                body: {
                    transaction_amount: Number(order.total),
                    description: `Pedido ${order.id} — Loja Bruna Mandz`,
                    payment_method_id: 'pix',
                    payer: {
                        email: order.customer?.email,
                        first_name: firstName,
                        last_name: lastName,
                    },
                    external_reference: order.id,
                    notification_url: process.env.MP_WEBHOOK_URL || undefined,
                },
                requestOptions: {
                    idempotencyKey: `${order.id}-pix`,
                },
            });

            await saveOrderToSupabase({
                order,
                method,
                status: 'pending',
                mpPaymentId: String(mpResult.id),
                mpStatus: mpResult.status,
            });

            return res.status(200).json({
                mode: 'live',
                orderId: order.id,
                paymentId: mpResult.id,
                status: mpResult.status,
                qr_code: mpResult.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: mpResult.point_of_interaction?.transaction_data?.qr_code_base64,
            });
        }

        if (method === 'card') {
            if (!cardToken) {
                return res
                    .status(400)
                    .json({
                        error: 'Token do cartão ausente. O Brick do Mercado Pago deve gerá-lo no navegador.',
                    });
            }

            mpResult = await payment.create({
                body: {
                    transaction_amount: Number(order.total),
                    token: cardToken,
                    description: `Pedido ${order.id} — Loja Bruna Mandz`,
                    installments: installments || 1,
                    payment_method_id: paymentMethodId,
                    payer: { email: order.customer?.email },
                    external_reference: order.id,
                    notification_url: process.env.MP_WEBHOOK_URL || undefined,
                },
                requestOptions: {
                    idempotencyKey: `${order.id}-card`,
                },
            });

            const normalizedStatus =
                mpResult.status === 'approved'
                    ? 'approved'
                    : mpResult.status === 'rejected'
                      ? 'rejected'
                      : 'pending';

            await saveOrderToSupabase({
                order,
                method,
                status: normalizedStatus,
                mpPaymentId: String(mpResult.id),
                mpStatus: mpResult.status,
                mpStatusDetail: mpResult.status_detail,
            });

            return res.status(200).json({
                mode: 'live',
                orderId: order.id,
                paymentId: mpResult.id,
                status: mpResult.status,
                statusDetail: mpResult.status_detail,
            });
        }
    } catch (err) {
        console.error('Erro Mercado Pago:', err);
        return res
            .status(502)
            .json({ error: 'Falha ao criar pagamento no Mercado Pago.', details: err.message });
    }
}

// ─── Helper: salva/atualiza o pedido no Supabase ──────────────────────────────
async function saveOrderToSupabase({
    order,
    method,
    status,
    mpPaymentId,
    mpStatus,
    mpStatusDetail,
}) {
    const supabase = getSupabase();
    const { error } = await supabase.from('orders').upsert({
        id: order.id,
        status,
        method,
        customer_name: order.customer?.name || null,
        customer_email: order.customer?.email || null,
        customer_phone: order.customer?.phone || null,
        items: order.items,
        total: order.total,
        mp_payment_id: mpPaymentId,
        mp_status: mpStatus,
        mp_status_detail: mpStatusDetail || null,
        earned_xp: order.earnedXp || 0,
    });
    if (error) throw new Error(error.message);
}
