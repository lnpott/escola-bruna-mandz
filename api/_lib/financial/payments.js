/**
 * api/_lib/financial/payments.js
 * Receitas avulsas (matrícula, material, aula extra, etc.) — não geram
 * mensalidade recorrente, diferente de tuitions.
 */
import { genId, safeFloat, parsePagination, monthRange } from './helpers.js';

export async function handlePayments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase.from('payments').select('*, students(name)', { count: 'exact' }).order('paid_at', { ascending: false }).range(offset, offset + limit - 1);
        if (category) q = q.eq('category', category);
        if (month && year) {
            const { tzStart, tzEnd } = monthRange(month, year);
            q = q.gte('paid_at', tzStart).lte('paid_at', tzEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ payments: data });
    }

    if (method === 'POST') {
        const { student_id, description, amount, payment_method, paid_at, category } = req.body;
        if (!description || !amount || !payment_method)
            return res.status(400).json({ error: 'descrição, valor e forma de pagamento são obrigatórios.' });
        const { data, error } = await supabase
            .from('payments')
            .insert([{ id: genId('PA'), student_id: student_id || null, description, amount: safeFloat(amount, 0, 0), payment_method, paid_at: paid_at || new Date().toISOString(), category: category || 'outro' }])
            .select('*, students(name)').single();
        if (error) throw error;
        return res.status(201).json({ payment: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID da receita é obrigatório na query string.' });
        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
