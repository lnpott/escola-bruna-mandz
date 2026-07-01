/**
 * api/products.js
 * Serve os produtos ativos do Supabase para o front-end da loja.
 * Substitui a importação estática de store/products.js.
 *
 * GET /api/products → retorna todos os produtos com active = true, ordenados por created_at
 */

import { getSupabase } from './_lib/supabase.js';

function normalizeProductImage(image) {
    if (!image || typeof image !== 'string') return '/brand/LOGOPRETO.png';

    const value = image.trim();
    if (!value) return '/brand/LOGOPRETO.png';

    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    if (value.startsWith('/')) {
        if (value.startsWith('/merch/') || value.startsWith('/brand/') || value.startsWith('/media/') || value.startsWith('/products/')) {
            return value;
        }
        return `/merch/${value.replace(/^\/+/, '')}`;
    }

    const fileName = value.replace(/^.*[\\/]/, '');
    const knownMerchImages = [
        'Pulseira.png',
        'Paleta.png',
        'Chaveiro.png',
        'Copo.png',
        'TSHIRT_PREMIUN.png',
        'TSHIRT_PRO.png',
        'TSHIRT_ROCK.png',
    ];

    return knownMerchImages.includes(fileName) ? `/merch/${fileName}` : '/brand/LOGOPRETO.png';
}

function normalizeProduct(product) {
    return {
        id: product?.id || `product-${Math.random().toString(36).slice(2, 8)}`,
        name: product?.name || 'Produto sem nome',
        description: product?.description || 'Descrição em breve.',
        price: Number(product?.price || 0),
        stock: Number(product?.stock || 0),
        active: Boolean(product?.active ?? true),
        category: product?.category || 'acessorios',
        badge: product?.badge || null,
        badgeColor: product?.badge_color || null,
        image: normalizeProductImage(product?.image),
        rewardXp: Number(product?.reward_xp || 0),
        variants: product?.variants || null,
    };
}

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
        const products = (data || []).map(normalizeProduct);

        return res.status(200).json({ products });
    } catch (err) {
        console.error('api/products erro:', err.message);
        return res.status(500).json({ error: 'Erro ao buscar produtos.', details: err.message });
    }
}
