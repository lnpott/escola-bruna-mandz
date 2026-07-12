/**
 * api/_lib/financial/investments.js
 * Compras de investimento (instrumentos, móveis, equipamentos).
 *
 * ── Correção (jul/2026) ──────────────────────────────────────────────────
 * Antes só existia GET/POST (pendência registrada em TODO_PROGRESS.md:
 * "Edição de investimentos — Atualmente só create"). Adicionado PATCH e
 * DELETE para fechar o CRUD, como os demais recursos financeiros.
 */
import { genId, normalizeOptionalFields, safeFloat, parsePagination, monthRange } from './helpers.js';

export async function handleInvestments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase.from('investments').select('*').order('purchased_at', { ascending: false }).range(offset, offset + limit - 1);
        if (category) q = q.eq('category', category);
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('purchased_at', dateStart).lte('purchased_at', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ investments: data });
    }

    if (method === 'POST') {
        const { description, amount, category, purchased_at, notes } = req.body;
        if (!description || !amount || !purchased_at)
            return res.status(400).json({ error: 'descrição, valor e data de compra são obrigatórios.' });
        const investmentPayload = {
            id: genId('IN'),
            description,
            amount: safeFloat(amount, 0, 0),
            category: category || 'outro',
            purchased_at,
            notes,
        };
        normalizeOptionalFields(investmentPayload, ['notes']);

        const { data, error } = await supabase
            .from('investments')
            .insert([investmentPayload])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ investment: data });
    }

    if (method === 'PATCH') {
        const { id, description, amount, category, purchased_at, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do investimento é obrigatório.' });

        const upd = {};
        if (description   !== undefined) upd.description   = description;
        if (amount        !== undefined) upd.amount        = safeFloat(amount, 0, 0);
        if (category       !== undefined) upd.category      = category;
        if (purchased_at  !== undefined) upd.purchased_at  = purchased_at;
        if (notes         !== undefined) upd.notes         = notes;

        const { data, error } = await supabase
            .from('investments')
            .update(normalizeOptionalFields(upd, ['notes']))
            .eq('id', id)
            .select().single();
        if (error) throw error;
        return res.status(200).json({ investment: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do investimento é obrigatório na query string.' });
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
