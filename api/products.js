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
            id:          p.id,
            name:        p.name,
            description: p.description,
            price:       Number(p.price),
            stock:       p.stock,
            active:      p.active,
            category:    p.category,
            badge:       p.badge,
            badgeColor:  p.badge_color,
            image:       p.image,
            rewardXp:    p.reward_xp,
            variants:    p.variants,
        }));

        return res.status(200).json({ products });
    } catch (err) {
        console.error('api/products erro:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar produtos.', details: err.message });
    }
}
