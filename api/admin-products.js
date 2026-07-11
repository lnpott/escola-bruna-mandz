/**
 * api/admin-products.js
 * Gerenciamento de produtos pelo painel admin.
 * Protegido pela mesma senha do painel via header 'x-admin-password'.
 *
 * GET   /api/admin-products          → lista todos os produtos (inclusive inativos)
 * POST  /api/admin-products          → cria novo produto
 * PATCH /api/admin-products          → atualiza campos de um produto
 *
 * Campos para POST:
 *   { name, description, price, stock, category, active, badge?, badge_color?, image? }
 *
 * Campos atualizáveis via PATCH:
 *   { id, price?, stock?, active?, badge?, badge_color?, name?, description? }
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { getSupabase } from './_lib/supabase.js';
import { normalizeProductImage, normalizeVariants } from './_lib/normalize-product.js';

function generateProductId() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BM-${randomPart}`;
}

function normalizeProduct(product) {
    return {
        ...product,
        image: normalizeProductImage(product?.image),
        variants: normalizeVariants(product?.variants),
    };
}

const ALLOWED_UPDATE_FIELDS = [
    'name', 'description', 'price', 'stock', 'active', 'category',
    'badge', 'badge_color', 'image', 'variants',
];

function auth(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) { res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' }); return false; }
    if (req.headers['x-admin-password'] !== adminPassword) { res.status(401).json({ error: 'Senha incorreta.' }); return false; }
    return true;
}

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        console.error('Supabase não configurado:', err.message);
        return res.status(500).json({ error: 'Supabase não configurado.' });
    }

    // ── GET: listar todos os produtos ─────────────────────────────────────────
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw new Error(error.message);
            return res.status(200).json({ products: (data || []).map(normalizeProduct) });
        } catch (err) {
            console.error('Erro ao buscar produtos:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar produtos.' });
        }
    }

    // ── POST: criar novo produto ──────────────────────────────────────────────
    if (req.method === 'POST') {
        const { name, description, price, stock, category, active, badge, badge_color, image } = req.body || {};

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Nome do produto é obrigatório.' });
        }
        if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
            return res.status(400).json({ error: 'Preço válido é obrigatório.' });
        }
        if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({ error: 'Estoque válido é obrigatório.' });
        }
        if (!category || !['roupas', 'acessorios', 'kits'].includes(category)) {
            return res.status(400).json({ error: 'Categoria válida é obrigatória (roupas, acessorios, kits).' });
        }

        try {
            const newProduct = {
                id: generateProductId(),
                name: name.trim(),
                description: description ? String(description).trim() : '',
                price: Number(price),
                stock: Number(stock),
                category: category.trim(),
                active: active === true || active === 'true',
                badge: badge ? String(badge).trim() : null,
                badge_color: badge_color ? String(badge_color).trim() : null,
                image: normalizeProductImage(image) || '/brand/LOGOPRETO.png',
                variants: req.body.variants
                    ? req.body.variants
                    : (category.trim() === 'roupas' ? { sizes: ['P', 'M', 'G', 'GG'] } : null),
            };

            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select('*')
                .maybeSingle();

            if (error) throw new Error(error.message);
            if (!data) return res.status(500).json({ error: 'Falha ao criar produto.' });

            return res.status(201).json({ product: normalizeProduct(data) });
        } catch (err) {
            console.error('Erro ao criar produto:', err.message);
            return res.status(500).json({ error: 'Erro ao criar produto.' });
        }
    }

    // ── PATCH: atualizar produto ──────────────────────────────────────────────
    if (req.method === 'PATCH') {
        const { id, ...fields } = req.body || {};

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'id do produto é obrigatório.' });
        }

        const updates = {};
        for (const key of ALLOWED_UPDATE_FIELDS) {
            if (key in fields) updates[key] = fields[key];
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
        }

        if ('category' in updates) {
            if (updates.category === 'roupas') {
                if (!('variants' in updates)) {
                    updates.variants = { sizes: ['P', 'M', 'G', 'GG'] };
                }
            } else {
                if (!('variants' in updates)) {
                    updates.variants = null;
                }
            }
        }

        if ('price' in updates && (isNaN(Number(updates.price)) || Number(updates.price) < 0)) {
            return res.status(400).json({ error: 'Preço inválido.' });
        }
        if ('image' in updates) {
            updates.image = normalizeProductImage(updates.image);
        }
        if ('stock' in updates && (isNaN(Number(updates.stock)) || Number(updates.stock) < 0)) {
            return res.status(400).json({ error: 'Estoque inválido.' });
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select('*')
                .maybeSingle();

            if (error) throw new Error(error.message);
            if (!data) return res.status(404).json({ error: 'Produto não encontrado.' });

            return res.status(200).json({ product: normalizeProduct(data) });
        } catch (err) {
            console.error('Erro ao atualizar produto:', err.message);
            return res.status(500).json({ error: 'Erro ao atualizar produto.' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
