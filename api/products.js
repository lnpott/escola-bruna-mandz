/**
 * api/products.js
 * Serve os produtos ativos do Supabase para o front-end da loja.
 *
 * GET /api/products → retorna todos os produtos com active = true, ordenados por created_at
 */

import { getSupabase } from './_lib/supabase.js';
import { normalizeProduct } from './_lib/normalize-product.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        const products = (data || []).map(normalizeProduct);

        return res.status(200).json({ products });
    } catch (err) {
        console.error('api/products erro:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}
