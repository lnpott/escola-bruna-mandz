/**
 * api/_lib/financial/expenses.js
 * Custos fixos e eventuais da escola (aluguel, água, luz, material, etc.).
 */
import { genId, safeFloat, resolvePaidTimestamp, parsePagination, monthRange } from './helpers.js';

export async function handleExpenses(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { paid, month, year, expense_type } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase.from('expenses').select('*').order('due_date', { ascending: false }).range(offset, offset + limit - 1);

        if (expense_type) q = q.eq('expense_type', expense_type);
        if (paid !== undefined && paid !== '') q = q.eq('paid', paid === 'true');

        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('due_date', dateStart).lte('due_date', dateEnd);
        }

        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ expenses: data });
    }

    if (method === 'POST') {
        const { description, amount, category, due_date, paid, paid_at, expense_type } = req.body;

        if (!description || !amount || !due_date)
            return res.status(400).json({ error: 'descrição, valor e data de vencimento são obrigatórios.' });

        const payload = {
            id: genId('EX'),
            description,
            amount: safeFloat(amount, 0, 0),
            category: category || 'outro',
            due_date,
            expense_type: expense_type || 'fixed',
            paid: paid || false,
            paid_at: paid ? (paid_at || new Date().toISOString()) : null,
        };

        const { data, error } = await supabase
            .from('expenses')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json({ expense: data });
    }

    if (method === 'PATCH') {
        const { id, description, amount, category, due_date, paid, paid_at, expense_type } = req.body;
        if (!id) return res.status(400).json({ error: 'ID da despesa é obrigatório.' });

        const upd = {};
        if (description !== undefined) upd.description = description;
        if (amount      !== undefined) upd.amount      = safeFloat(amount, 0, 0);
        if (category    !== undefined) upd.category    = category;
        if (due_date    !== undefined) upd.due_date    = due_date;
        if (expense_type !== undefined) upd.expense_type = expense_type;
        if (paid        !== undefined) upd.paid        = paid;
        if (paid_at     !== undefined) upd.paid_at     = paid_at;

        resolvePaidTimestamp(upd, paid);

        const { data, error } = await supabase
            .from('expenses')
            .update(upd)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ expense: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID da despesa é obrigatório na query string.' });
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
