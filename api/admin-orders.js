/**
 * api/admin-orders.js
 * Lista os pedidos salvos no Supabase. Usado pelo painel admin.
 *
 * Delega para handleListOrders em api/_lib/store/handlers.js.
 *
 * Protegido por senha simples via header 'x-admin-password'.
 */

import { getSupabase } from './_lib/supabase.js';
import { handleListOrders } from './_lib/store/handlers.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
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

    try {
        const supabase = getSupabase();
        await handleListOrders(req, res, supabase);
    } catch (err) {
        console.error('Erro ao buscar pedidos:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
}
