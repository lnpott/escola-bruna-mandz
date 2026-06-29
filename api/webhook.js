/**
 * api/webhook.js
 * Recebe notificações do Mercado Pago sobre mudanças de status de pagamento.
 * Atualiza o pedido no Supabase e envia e-mail de notificação quando aprovado.
 *
 * IMPORTANTE: o Mercado Pago pode reenviar a mesma notificação várias vezes
 * (comportamento documentado, não é falha). Por isso, só notificamos por
 * e-mail na TRANSIÇÃO de status para "approved" — nunca se o pedido já
 * estava aprovado antes desta chamada.
 */

import { getSupabase } from './_lib/supabase.js';
import { notifyNewOrder } from './notify-new-order.js';
import mercadopago from 'mercadopago';

const mp = new mercadopago.MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const paymentClient = new mercadopago.Payment(mp);

export default async function handler(req, res) {
    try {
        // Notificações do Mercado Pago podem ser de outros tipos além de
        // "payment" (ex: merchant_order). Ignoramos qualquer coisa que não
        // seja sobre pagamento, sem erro, para evitar retries inúteis do MP.
        const topic = req.body?.type || req.query?.topic;
        if (topic && topic !== 'payment') {
            return res.status(200).json({ ok: true, skipped: true });
        }

        const paymentId = req.body?.data?.id || req.query?.id;
        if (!paymentId) {
            return res.status(400).json({ error: 'missing payment id' });
        }

        const payment = await paymentClient.get({ id: paymentId });
        const status = payment.status;

        const supabase = getSupabase();

        // Busca o status ATUAL antes de atualizar, para detectar a transição
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('mp_payment_id', paymentId)
            .maybeSingle();

        const wasAlreadyApproved = existingOrder?.status === 'approved';

        // Atualiza o pedido no Supabase
        const { data: updatedOrders, error: updateError } = await supabase
            .from('orders')
            .update({ status, mp_payment_id: paymentId })
            .eq('mp_payment_id', paymentId)
            .select('*');

        if (updateError) {
            console.error('webhook: falha ao atualizar pedido no Supabase:', updateError.message);
        }

        // Notifica por e-mail SÓ na transição para aprovado (evita duplicados
        // quando o MP reenvia o mesmo webhook, ou quando o cartão já tinha
        // sido marcado como aprovado direto no create-payment.js)
        const shouldNotify =
            status === 'approved' &&
            !wasAlreadyApproved &&
            Array.isArray(updatedOrders) &&
            updatedOrders.length > 0;

        if (shouldNotify) {
            await notifyNewOrder(updatedOrders[0]);
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('webhook error:', err);
        return res.status(500).json({ error: 'webhook_failed' });
    }
}