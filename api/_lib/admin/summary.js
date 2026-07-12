/**
 * api/_lib/admin/summary.js
 * Resource: summary — resumo financeiro do mês (receita, saídas, saldo,
 * pendências). Etapa 39: teacher_payments passou a entrar no cálculo de
 * outgoings.
 */

import { monthRange } from './shared.js';

export async function handleSummary(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios.' });

    const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(month, year);

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
        supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${new Date().toISOString().split('T')[0]})`),
        // Etapa 39: teacher_payments passa a entrar no cálculo de outgoings.
        // `paid_at` é preenchido no momento do pagamento (ver teacher-payments.js),
        // então usamos o mesmo padrão de expenses/payments (paid_at dentro do mês).
        supabase.from('teacher_payments').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        // Pendente de pagamento no mês de referência (reference_month é date, sem timezone),
        // para exibir "a pagar a professores" no resumo assim como pending_tuitions.
        supabase.from('teacher_payments').select('amount').eq('paid',false).gte('reference_month',dateStart).lte('reference_month',dateEnd),
    ]);

    for (const e of [e1, e2, e3, e4, e5, e6, e7, e8]) { if (e) throw e; }

    const revenue  = paidTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0)
                   + avulsoPayments.reduce((s,p) => s + Number(p.amount), 0);
    const outgoings = paidExpenses.reduce((s,e) => s + Number(e.amount), 0)
                    + investments.reduce((s,i) => s + Number(i.amount), 0)
                    + paidTeacherPayments.reduce((s,p) => s + Number(p.amount), 0);

    return res.status(200).json({
        summary: {
            revenue,
            outgoings,
            balance:          revenue - outgoings,
            pending_tuitions: pendingTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0),
            overdue_students: new Set(overdueTuitions.map(t => t.student_id)).size,
            pending_teacher_payments: pendingTeacherPayments.reduce((s,p) => s + Number(p.amount), 0),
        }
    });
}
