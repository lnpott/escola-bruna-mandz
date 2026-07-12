/**
 * api/_lib/financial/teacherPayments.js
 * Pagamentos a professores por mês de referência. Sem cálculo automático a
 * partir de rate_per_class + aulas dadas ainda (pendência conhecida) — o
 * valor é lançado manualmente.
 */
import { genId, normalizeOptionalFields, safeFloat, resolvePaidTimestamp, normalizeMonthDate, parsePagination, monthRange } from './helpers.js';

export async function handleTeacherPayments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { teacher_id, month, year, paid } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('teacher_payments')
            .select('*, teachers(name, specialty)', { count: 'exact' })
            .order('reference_month', { ascending: false })
            .range(offset, offset + limit - 1);
        if (teacher_id) q = q.eq('teacher_id', teacher_id);
        if (paid !== undefined && paid !== '') q = q.eq('paid', paid === 'true');
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('reference_month', dateStart).lte('reference_month', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ teacher_payments: data });
    }

    if (method === 'POST') {
        const { teacher_id, reference_month, amount, paid, paid_at, notes } = req.body;
        if (!teacher_id || !reference_month || !amount)
            return res.status(400).json({ error: 'teacher_id, reference_month e amount são obrigatórios.' });

        const normalizedRefMonth = normalizeMonthDate(reference_month);
        if (!normalizedRefMonth) {
            return res.status(400).json({ error: 'reference_month inválido. Use o formato YYYY-MM ou YYYY-MM-DD.' });
        }

        const payload = {
            id: genId('TP'),
            teacher_id,
            reference_month: normalizedRefMonth,
            amount: safeFloat(amount, 0, 0),
            paid: paid || false,
            paid_at: paid ? (paid_at || new Date().toISOString()) : null,
            notes,
        };

        normalizeOptionalFields(payload, ['notes']);

        const { data, error } = await supabase
            .from('teacher_payments')
            .insert([payload])
            .select('*, teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(201).json({ teacher_payment: data });
    }

    if (method === 'PATCH') {
        const { id, amount, paid, paid_at, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do pagamento ao professor é obrigatório.' });

        const upd = {};
        if (amount !== undefined) upd.amount = safeFloat(amount, 0, 0);
        if (notes  !== undefined) upd.notes  = notes;
        if (paid   !== undefined) upd.paid   = paid;
        if (paid_at !== undefined) upd.paid_at = paid_at;

        resolvePaidTimestamp(upd, paid);

        const { data, error } = await supabase
            .from('teacher_payments')
            .update(upd)
            .eq('id', id)
            .select('*, teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(200).json({ teacher_payment: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do pagamento ao professor é obrigatório na query string.' });
        const { error } = await supabase.from('teacher_payments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
