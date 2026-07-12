/**
 * api/_lib/financial/summary.js
 * computeFinancialSummary: núcleo dos cálculos financeiros (receita, saída,
 * saldo, pendências) compartilhado entre ?resource=summary e ?resource=dashboard.
 * handleSummary: endpoint que expõe o resumo de um mês/ano específico.
 */
import { monthRange } from './helpers.js';

/**
 * Executa as 8 queries financeiras compartilhadas e retorna os indicadores
 * calculados (revenue, outgoings, balance, pending_tuitions, etc.).
 * @param {Object} supabase - Cliente Supabase autenticado
 * @param {number|string} month - Mês (1-12)
 * @param {number|string} year - Ano (ex: 2026)
 * @returns {Promise<Object>} financial summary object
 */
export async function computeFinancialSummary(supabase, month, year) {
    const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(month, year);
    const today = new Date().toISOString().split('T')[0];

    const [
        { data: paidTuitions,  error: e1 },
        { data: avulsoPayments,error: e2 },
        { data: paidExpenses,  error: e3 },
        { data: investments,   error: e4 },
        { data: pendingTuitions, error: e5 },
        { data: overdueTuitions, error: e6 },
        { data: paidTeacherPayments, error: e7 },
        { data: pendingTeacherPayments, error: e8 },
    ] = await Promise.all([
        supabase.from('tuitions').select('amount,discount_amount').eq('status','paid').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('payments').select('amount').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('expenses').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('investments').select('amount').gte('purchased_at',dateStart).lte('purchased_at',dateEnd),
        supabase.from('tuitions').select('amount,discount_amount').in('status',['pending','overdue']).gte('due_date',dateStart).lte('due_date',dateEnd),
        supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`),
        supabase.from('teacher_payments').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('teacher_payments').select('amount').eq('paid',false).gte('reference_month',dateStart).lte('reference_month',dateEnd),
    ]);

    for (const e of [e1, e2, e3, e4, e5, e6, e7, e8]) { if (e) throw e; }

    const revenue  = paidTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0)
                   + avulsoPayments.reduce((s,p) => s + Number(p.amount), 0);
    const outgoings = paidExpenses.reduce((s,e) => s + Number(e.amount), 0)
                    + investments.reduce((s,i) => s + Number(i.amount), 0)
                    + paidTeacherPayments.reduce((s,p) => s + Number(p.amount), 0);

    return {
        revenue,
        outgoings,
        balance: revenue - outgoings,
        pending_tuitions: pendingTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0),
        overdue_students: new Set(overdueTuitions.map(t => t.student_id)).size,
        pending_teacher_payments: pendingTeacherPayments.reduce((s,p) => s + Number(p.amount), 0),
    };
}

export async function handleSummary(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios.' });

    const financial = await computeFinancialSummary(supabase, month, year);

    return res.status(200).json({ summary: financial });
}
