/**
 * api/products.js
 * Serve os produtos ativos do Supabase para o front-end da loja.
 * Substitui a importação estática de store/products.js.
 *
 * GET /api/products → retorna todos os produtos com active = true, ordenados por created_at
 */

import { getSupabase } from './_lib/supabase.js';

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

        // Normaliza campos para manter compatibilidade com o front-end existente
        // (produtos.js usava camelCase; Supabase retorna snake_case)
        const products = (data || []).map((p) => ({
            id: p?.id || `product-${Math.random().toString(36).slice(2, 8)}`,
            name: p?.name || 'Produto sem nome',
            description: p?.description || 'Descrição em breve.',
            price: Number(p?.price || 0),
            stock: Number(p?.stock || 0),
            active: Boolean(p?.active ?? true),
            category: p?.category || 'acessorios',
            badge: p?.badge || null,
            badgeColor: p?.badge_color || null,
            image: p?.image || '/brand/LOGOPRETO.png',
            rewardXp: Number(p?.reward_xp || 0),
            variants: p?.variants || null,
        }));

        return res.status(200).json({ products });
    } catch (err) {
        console.error('api/products erro:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar produtos.', details: err.message });
    }
}
