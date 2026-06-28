/**
 * api/order-status.js
 * Consulta pública (sem senha) do status de UM pedido específico, pelo ID.
 * Usado pelo front-end para saber quando o PIX foi aprovado (polling).
 *
 * Importante: este endpoint só retorna status + total — nunca dados pessoais
 * do cliente (nome, e-mail, telefone) — porque qualquer pessoa que souber o
 * ID do pedido (ex: BM-123456) poderia consultá-lo.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { getSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const id = req.query?.id;
    if (!id) {
        return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('orders')
            .select('id, status, total')
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return res.status(404).json({ error: 'Pedido não encontrado.' });

        return res.status(200).json(data);
    } catch (err) {
        console.error('Erro ao consultar status do pedido:', err.message);
        return res.status(500).json({ error: 'Erro ao consultar status.' });
    }
}
