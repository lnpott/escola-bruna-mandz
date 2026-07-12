/**
 * api/create-payment.js
 * Cria um pedido (sem pagamento online) e salva no Supabase.
 *
 * Não há mais integração com Mercado Pago: o pagamento é sempre combinado
 * diretamente entre a Bruna e o cliente (WhatsApp/PIX manual). O nome do
 * arquivo e do endpoint (`/api/create-payment`) foi mantido para não
 * quebrar o front-end e o histórico de pedidos já salvos — é puramente
 * criação de pedido.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS (configure na Vercel > Settings > Environment Variables):
 *   SUPABASE_URL               → URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY  → Service Role Key do Supabase
 *   RESEND_API_KEY             → Chave do Resend para notificação por e-mail
 *   NOTIFY_EMAIL               → E-mail da Bruna para receber notificações
 */

import { getSupabase } from './_lib/supabase.js';
import { notifyNewOrder } from './notify-new-order.js';

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

    const { order } = body || {};

    if (!order?.items?.length) {
        return res.status(400).json({ error: 'Pedido vazio.' });
    }

    try {
        await saveOrderToSupabase({ order, status: 'pending' });

        // Notifica a Bruna por e-mail.
        // IMPORTANTE: notifyNewOrder espera campos no formato do Supabase
        // (customer_name, customer_email, earned_xp), não do objeto de carrinho
        // (customer.name, customer.email, earnedXp) — por isso o mapeamento abaixo.
        await notifyNewOrder({
            id:             order.id,
            status:         'pending',
            method:         'manual',
            total:          order.total,
            customer_name:  order.customer?.name  || null,
            customer_email: order.customer?.email || null,
            customer_phone: order.customer?.phone || null,
            customer_is_student: order.customer?.isStudent || false,
            items:          order.items,
            earned_xp:      order.earnedXp || 0,
        }).catch((e) => console.error('Notificação e-mail falhou:', e.message));

        return res.status(200).json({
            mode: 'manual',
            orderId: order.id,
            status: 'pending',
        });
    } catch (err) {
        console.error('Erro ao salvar pedido:', err.message);
        return res.status(500).json({ error: 'Erro ao registrar pedido. Tente novamente.' });
    }
}

// ─── Helper: salva o pedido no Supabase ───────────────────────────────────────
async function saveOrderToSupabase({ order, status }) {
    const supabase = getSupabase();
    const { error } = await supabase.from('orders').upsert({
        id: order.id,
        status,
        method: 'manual',
        customer_name:  order.customer?.name  || null,
        customer_email: order.customer?.email || null,
        customer_phone: order.customer?.phone || null,
        customer_is_student: order.customer?.isStudent || false,
        items:          order.items,
        total:          order.total,
        earned_xp:      order.earnedXp || 0,
    });
    if (error) throw new Error(error.message);
}
