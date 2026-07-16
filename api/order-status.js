/**
 * api/order-status.js
 * Consulta pública (sem senha) do status de UM pedido específico, pelo ID.
 * Usado pelo front-end para saber quando o PIX foi aprovado (polling).
 *
 * Delega para handleOrderStatus em api/_lib/store/handlers.js.
 */

import { getSupabase } from './_lib/supabase.js';
import { handleOrderStatus } from './_lib/store/handlers.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const supabase = getSupabase();
        await handleOrderStatus(req, res, supabase);
    } catch (err) {
        console.error('Erro ao consultar status do pedido:', err.message);
        return res.status(500).json({ error: 'Erro ao consultar status.' });
    }
}
