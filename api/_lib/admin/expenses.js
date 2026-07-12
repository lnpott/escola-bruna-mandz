/**
 * api/_lib/admin/expenses.js
 * Resource: expenses (custos fixos e eventuais da escola).
 */

import { genId, monthRange } from './shared.js';

export async function handleExpenses(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { paid, month, year, expense_type } = req.query;
        let q = supabase.from('expenses').select('*').order('due_date', { ascending: false });

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
            amount: parseFloat(amount),
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
        if (amount      !== undefined) upd.amount      = parseFloat(amount);
        if (category    !== undefined) upd.category    = category;
        if (due_date    !== undefined) upd.due_date    = due_date;
        if (expense_type !== undefined) upd.expense_type = expense_type;
        if (paid        !== undefined) upd.paid        = paid;
        if (paid_at     !== undefined) upd.paid_at     = paid_at;

        if (paid === true  && !upd.paid_at) upd.paid_at = new Date().toISOString();
        if (paid === false) upd.paid_at = null;

        const { data, error } = await supabase
            .from('expenses')
            .update(upd)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ expense: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
