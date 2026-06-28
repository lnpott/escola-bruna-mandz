/**
 * api/admin-orders.js
 * Lista os pedidos salvos no Supabase. Usado pelo painel admin escondido.
 *
 * Protegido por senha simples via header 'x-admin-password', comparado com
 * a variável de ambiente ADMIN_PASSWORD. Isso NÃO é um sistema de login
 * robusto (sem sessão, sem usuários) — é uma trava simples para impedir que
 * qualquer pessoa que adivinhe a URL veja dados de clientes.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD             → senha escolhida por você (defina algo forte)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { getSupabase } from './_lib/supabase.js';

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
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw new Error(error.message);

        return res.status(200).json({ orders: data });
    } catch (err) {
        console.error('Erro ao buscar pedidos:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar pedidos.', details: err.message });
    }
}
