/**
 * api/admin-products.js
 * Gerenciamento de produtos pelo painel admin.
 * Protegido pela mesma senha do painel via header 'x-admin-password'.
 *
 * GET   /api/admin-products          → lista todos os produtos (inclusive inativos)
 * PATCH /api/admin-products          → atualiza campos de um produto
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

const ALLOWED_UPDATE_FIELDS = [
    'name', 'description', 'price', 'stock', 'active', 'badge', 'badge_color',
];

function auth(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) { res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' }); return false; }
    if (req.headers['x-admin-password'] !== adminPassword) { res.status(401).json({ error: 'Senha incorreta.' }); return false; }
    return true;
}

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    const supabase = getSupabase();

    // ── GET: listar todos os produtos ─────────────────────────────────────────
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw new Error(error.message);
            return res.status(200).json({ products: data || [] });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao buscar produtos.', details: err.message });
        }
    }

    // ── PATCH: atualizar produto ──────────────────────────────────────────────
    if (req.method === 'PATCH') {
        const { id, ...fields } = req.body || {};

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'id do produto é obrigatório.' });
        }

        // Filtra só os campos permitidos
        const updates = {};
        for (const key of ALLOWED_UPDATE_FIELDS) {
            if (key in fields) updates[key] = fields[key];
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
        }

        // Validações básicas
        if ('price' in updates && (isNaN(Number(updates.price)) || Number(updates.price) < 0)) {
            return res.status(400).json({ error: 'Preço inválido.' });
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

            return res.status(200).json({ product: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao atualizar produto.', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
