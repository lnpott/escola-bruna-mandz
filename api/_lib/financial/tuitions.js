/**
 * api/_lib/financial/tuitions.js
 * CRUD de Mensalidades. Desde a Etapa 37, tuitions carrega só o dado de
 * cobrança — o dado pedagógico (professor, instrumento, horário) vive em
 * enrollments, referenciada por tuitions.enrollment_id.
 */
import { genId, normalizeOptionalFields, safeFloat, safeInt, parsePagination, monthRange } from './helpers.js';

export async function handleTuitions(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { status, month, year, student_id, enrollment_id } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('tuitions')
            .select('*, students(name), enrollments(instrument, teacher_id, teachers(name))', { count: 'exact' })
            .order('due_date', { ascending: false })
            .range(offset, offset + limit - 1);
        if (status)        q = q.eq('status', status);
        if (student_id)    q = q.eq('student_id', student_id);
        if (enrollment_id) q = q.eq('enrollment_id', enrollment_id);
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('due_date', dateStart).lte('due_date', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ tuitions: data });
    }

    if (method === 'POST') {
        const {
            student_id, enrollment_id, reference_month, amount, billing_type,
            installment_number, discount_amount, discount_reason, due_date,
            status, notes,
        } = req.body;

        if (!student_id || !amount || !due_date) {
            return res.status(400).json({ error: 'student_id, amount e due_date são obrigatórios.' });
        }

        const payload = {
            id: genId('TU'),
            student_id,
            enrollment_id: enrollment_id || null,
            reference_month: reference_month || null,
            amount: safeFloat(amount, 0, 0),
            billing_type: billing_type || null,
            installment_number: safeInt(installment_number, null),
            discount_amount: safeFloat(discount_amount, 0),
            discount_reason,
            due_date,
            status: status || 'pending',
            notes,
        };

        normalizeOptionalFields(payload, ['notes', 'discount_reason']);

        const { data, error } = await supabase
            .from('tuitions')
            .insert([payload])
            .select('*, students(name), enrollments(instrument, teacher_id, teachers(name))')
            .single();

        if (error) throw error;
        return res.status(201).json({ tuition: data });
    }

    if (method === 'PATCH') {
        const {
            id, enrollment_id, reference_month, status, payment_method, paid_at,
            billing_type, installment_number, discount_amount, discount_reason,
            amount, notes, due_date,
        } = req.body;

        if (!id) return res.status(400).json({ error: 'ID da mensalidade é obrigatório.' });

        const upd = {};
        if (enrollment_id       !== undefined) upd.enrollment_id       = enrollment_id || null;
        if (reference_month     !== undefined) upd.reference_month     = reference_month || null;
        if (status              !== undefined) upd.status              = status;
        if (payment_method      !== undefined) upd.payment_method      = payment_method;
        if (paid_at             !== undefined) upd.paid_at             = paid_at;
        if (billing_type        !== undefined) upd.billing_type        = billing_type;
        if (installment_number  !== undefined) upd.installment_number  = safeInt(installment_number, null);
        if (discount_amount     !== undefined) upd.discount_amount     = safeFloat(discount_amount, 0);
        if (discount_reason     !== undefined) upd.discount_reason     = discount_reason;
        if (amount              !== undefined) upd.amount              = safeFloat(amount, 0, 0);
        if (notes               !== undefined) upd.notes               = notes;
        if (due_date            !== undefined) upd.due_date            = due_date;

        if (status === 'paid' && !upd.paid_at) upd.paid_at = new Date().toISOString();
        else if (status && status !== 'paid') { upd.paid_at = null; upd.payment_method = null; }

        const { data, error } = await supabase
            .from('tuitions')
            .update(upd)
            .eq('id', id)
            .select('*, students(name), enrollments(instrument, teacher_id, teachers(name))')
            .single();

        if (error) throw error;
        return res.status(200).json({ tuition: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID da mensalidade é obrigatório na query string.' });
        const { error } = await supabase.from('tuitions').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
