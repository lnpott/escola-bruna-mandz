/**
 * api/_lib/financial/report.js
 * Relatório financeiro detalhado: sumário + breakdown por categoria +
 * tendência mensal. Usado pela aba "📊 Relatório Mensal" do Financial.
 */
import { monthRange } from './helpers.js';
import { computeFinancialSummary } from './summary.js';

export async function handleFinancialReport(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const { month, year, date_from, date_to } = req.query;

    let dateStart, dateEnd;

    if (date_from && date_to) {
        dateStart = date_from;
        dateEnd = date_to;
    } else if (month && year) {
        const range = monthRange(month, year);
        dateStart = range.dateStart;
        dateEnd = range.dateEnd;
    } else {
        return res.status(400).json({
            error: 'Informe month/year (mês específico) ou date_from/date_to (intervalo personalizado).'
        });
    }

    // 1) Summary (reusa computeFinancialSummary)
    let summaryMonth = month ? Number(month) : new Date(date_from).getMonth() + 1;
    let summaryYear = year ? Number(year) : new Date(date_from).getFullYear();
    const summary = await computeFinancialSummary(supabase, summaryMonth, summaryYear);

    // 2) Breakdows — queries agregadas por categoria
    const [
        { data: paidTuitions,     error: e1 },
        { data: avulsoPayments,   error: e2 },
        { data: expenses,         error: e3 },
        { data: teacherPmts,      error: e4 },
    ] = await Promise.all([
        supabase.from('tuitions').select('amount,discount_amount,paid_at')
            .eq('status', 'paid').gte('paid_at', `${dateStart}T00:00:00.000Z`).lte('paid_at', `${dateEnd}T23:59:59.999Z`),
        supabase.from('payments').select('amount,category,paid_at')
            .gte('paid_at', `${dateStart}T00:00:00.000Z`).lte('paid_at', `${dateEnd}T23:59:59.999Z`),
        supabase.from('expenses').select('amount,category,expense_type,paid,paid_at')
            .gte('paid_at', `${dateStart}T00:00:00.000Z`).lte('paid_at', `${dateEnd}T23:59:59.999Z`),
        supabase.from('teacher_payments')
            .select('amount,paid,paid_at,teachers(name)')
            .gte('paid_at', `${dateStart}T00:00:00.000Z`).lte('paid_at', `${dateEnd}T23:59:59.999Z`),
    ]);

    for (const e of [e1, e2, e3, e4]) { if (e) throw e; }

    // Revenue breakdown
    const tuitionsCollected = paidTuitions.reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount), 0);

    const avulsoByCategory = {};
    for (const p of avulsoPayments) {
        const cat = p.category || 'outro';
        if (!avulsoByCategory[cat]) avulsoByCategory[cat] = { total: 0, count: 0 };
        avulsoByCategory[cat].total += Number(p.amount);
        avulsoByCategory[cat].count += 1;
    }
    const avulsoBreakdown = Object.entries(avulsoByCategory).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
    }));

    // Expenses breakdown
    const expensesByCategory = {};
    for (const e of expenses) {
        const cat = e.category || 'outro';
        if (!expensesByCategory[cat]) expensesByCategory[cat] = { total: 0, count: 0, paid: 0 };
        expensesByCategory[cat].total += Number(e.amount);
        expensesByCategory[cat].count += 1;
        if (e.paid) expensesByCategory[cat].paid += Number(e.amount);
    }
    const expenseBreakdown = Object.entries(expensesByCategory).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        paid: data.paid,
    }));

    const expensesByType = {};
    for (const e of expenses) {
        const type = e.expense_type || 'variable';
        if (!expensesByType[type]) expensesByType[type] = { total: 0, count: 0 };
        expensesByType[type].total += Number(e.amount);
        expensesByType[type].count += 1;
    }
    const expenseTypeBreakdown = Object.entries(expensesByType).map(([type, data]) => ({
        type,
        total: data.total,
        count: data.count,
    }));

    // Teacher payments breakdown
    const teacherPmtsByTeacher = {};
    for (const tp of teacherPmts) {
        const tid = tp.teacher_id || 'unknown';
        if (!teacherPmtsByTeacher[tid]) {
            teacherPmtsByTeacher[tid] = {
                teacher_id: tid,
                teacher_name: tp.teachers?.name || 'Desconhecido',
                total: 0,
                paid: 0,
            };
        }
        teacherPmtsByTeacher[tid].total += Number(tp.amount);
        if (tp.paid) teacherPmtsByTeacher[tid].paid += Number(tp.amount);
    }
    const teacherPaymentBreakdown = Object.values(teacherPmtsByTeacher);

    // 3) Monthly trend (last 6 months including current)
    const now = new Date();
    const trendMonths = [];
    const baseMonth = summaryMonth;
    const baseYear = summaryYear;
    for (let i = 5; i >= 0; i--) {
        const d = new Date(baseYear, baseMonth - 1 - i, 1);
        trendMonths.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    const monthlyTrend = await Promise.all(trendMonths.map(async ({ month: m, year: y }) => {
        try {
            const s = await computeFinancialSummary(supabase, m, y);
            return {
                label: `${String(m).padStart(2, '0')}/${y}`,
                revenue: s.revenue,
                outgoings: s.outgoings,
                balance: s.balance,
            };
        } catch {
            return { label: `${String(m).padStart(2, '0')}/${y}`, revenue: 0, outgoings: 0, balance: 0 };
        }
    }));

    return res.status(200).json({
        period: date_from && date_to
            ? { dateFrom: dateStart, dateTo: dateEnd }
            : { month: summaryMonth, year: summaryYear },
        summary,
        breakdown: {
            tuitions_collected: tuitionsCollected,
            tuitions_count: paidTuitions.length,
            avulso_payments: avulsoBreakdown,
            expenses: expenseBreakdown,
            expenses_by_type: expenseTypeBreakdown,
            teacher_payments: teacherPaymentBreakdown,
        },
        monthly_trend: monthlyTrend,
    });
}
