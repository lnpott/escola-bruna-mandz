/**
 * api/_lib/admin/investments.js
 * Resource: investments (compras/investimentos pontuais da escola).
 */

import { genId, monthRange } from './shared.js';

export async function handleInvestments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        let q = supabase.from('investments').select('*').order('purchased_at', { ascending: false });
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
        const { data, error } = await supabase
            .from('investments')
            .insert([{ id: genId('IN'), description, amount: parseFloat(amount), category: category || 'outro', purchased_at, notes: notes || null }])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ investment: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
