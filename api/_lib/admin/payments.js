/**
 * api/_lib/admin/payments.js
 * Resource: payments (pagamentos avulsos, não vinculados a mensalidade).
 */

import { genId, monthRange } from './shared.js';

export async function handlePayments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        let q = supabase.from('payments').select('*, students(name)').order('paid_at', { ascending: false });
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
            .insert([{ id: genId('PA'), student_id: student_id || null, description, amount: parseFloat(amount), payment_method, paid_at: paid_at || new Date().toISOString(), category: category || 'outro' }])
            .select('*, students(name)').single();
        if (error) throw error;
        return res.status(201).json({ payment: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
