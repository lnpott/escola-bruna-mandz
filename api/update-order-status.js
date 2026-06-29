/**
 * api/update-order-status.js
 * Permite ao admin alterar manualmente o status de um pedido pelo painel
 * (ex: marcar como "enviado", corrigir um status travado, cancelar).
 *
 * Protegido pela mesma senha do admin-orders.js (header x-admin-password).
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { getSupabase } from './_lib/supabase.js';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'cancelled', 'refunded'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado no servidor.' });
    }

    const providedPassword = req.headers['x-admin-password'];
    if (providedPassword !== adminPassword) {
        return res.status(401).json({ error: 'Senha incorreta.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({ error: 'Corpo da requisição inválido.' });
        }
    }

    const { orderId, status } = body || {};

    if (!orderId) {
        return res.status(400).json({ error: 'orderId é obrigatório.' });
    }
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error: `Status inválido. Use um de: ${VALID_STATUSES.join(', ')}.`,
        });
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return res.status(404).json({ error: 'Pedido não encontrado.' });

        return res.status(200).json({ order: data });
    } catch (err) {
        console.error('Erro ao atualizar status do pedido:', err.message);
        return res.status(500).json({ error: 'Erro ao atualizar status.', details: err.message });
    }
}
