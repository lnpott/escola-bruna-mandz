/**
 * api/products.js
 * Serve os produtos ativos do Supabase para o front-end da loja.
 *
 * Delega para handleListPublicProducts em api/_lib/store/handlers.js,
 * que centraliza a query e normalização de produtos.
 *
 * GET /api/products → retorna todos os produtos com active = true, ordenados por created_at
 */

import { getSupabase } from './_lib/supabase.js';
import { handleListPublicProducts } from './_lib/store/handlers.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const supabase = getSupabase();
        await handleListPublicProducts(req, res, supabase);
    } catch (err) {
        console.error('api/products erro:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
