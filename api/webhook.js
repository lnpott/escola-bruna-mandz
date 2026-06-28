/**
 * api/webhook.js
 * Recebe notificações do Mercado Pago quando o status de um pagamento muda
 * (aprovado, rejeitado, devolvido, etc.) e atualiza o pedido no Supabase.
 *
 * Configure esta URL no Mercado Pago em:
 *   Suas integrações > [sua aplicação] > Webhooks > URL de notificação
 *   Ex: https://seu-dominio.vercel.app/api/webhook
 *
 * Importante: o Mercado Pago manda só o ID do pagamento — por segurança,
 * SEMPRE buscamos o pagamento de novo na API do MP (nunca confiamos só no
 * corpo da notificação, que pode ser falsificado por terceiros).
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   MERCADO_PAGO_ACCESS_TOKEN
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
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
            return res.status(400).json({ received: true }); // responde 200 mesmo assim p/ MP não reenviar em loop
        }
    }

    // O Mercado Pago manda formatos um pouco diferentes dependendo do evento.
    // Os dois formatos mais comuns:
    //   { type: 'payment', data: { id: '123' } }
    //   { topic: 'payment', resource: '.../payments/123' }
    const paymentId = body?.data?.id || body?.resource?.split('/').pop() || req.query?.id;

    if (!paymentId) {
        console.warn('Webhook recebido sem ID de pagamento identificável:', JSON.stringify(body));
        return res.status(200).json({ received: true });
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        console.warn('Webhook recebido, mas MERCADO_PAGO_ACCESS_TOKEN não configurado. Ignorando.');
        return res.status(200).json({ received: true });
    }

    try {
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
        });
        const payment = new Payment(client);
        const mpPayment = await payment.get({ id: paymentId });

        const orderId = mpPayment.external_reference;
        if (!orderId) {
            console.warn(
                'Pagamento sem external_reference, não é possível associar a um pedido:',
                paymentId
            );
            return res.status(200).json({ received: true });
        }

        const statusMap = {
            approved: 'approved',
            rejected: 'rejected',
            cancelled: 'cancelled',
            refunded: 'refunded',
            in_process: 'pending',
            pending: 'pending',
        };
        const status = statusMap[mpPayment.status] || 'pending';

        const supabase = getSupabase();
        const { error } = await supabase
            .from('orders')
            .update({
                status,
                mp_status: mpPayment.status,
                mp_status_detail: mpPayment.status_detail,
                mp_payment_id: String(mpPayment.id),
            })
            .eq('id', orderId);

        if (error) {
            console.error('Erro ao atualizar pedido no Supabase:', error.message);
        } else {
            console.log(
                `Pedido ${orderId} atualizado para status "${status}" (MP: ${mpPayment.status}).`
            );
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Erro ao processar webhook do Mercado Pago:', err.message);
        // Sempre responder 200 para o MP não ficar reenviando indefinidamente
        return res.status(200).json({ received: true, error: err.message });
    }
}
