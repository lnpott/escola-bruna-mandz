/**
 * api/admin-financial-summary.js
 * Consolidação de KPIs financeiros para o painel admin.
 * Protegido por header 'x-admin-password'.
 */

import { getSupabase } from './_lib/supabase.js';

function auth(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
        return false;
    }
    if (req.headers['x-admin-password'] !== adminPassword) {
        res.status(401).json({ error: 'Senha incorreta.' });
        return false;
    }
    return true;
}

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        return res.status(500).json({ error: 'Supabase não configurado.', details: err.message });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios.' });
        }

        const m = month.padStart(2, '0');
        const lastDay = new Date(year, month, 0).getDate();
        
        // Intervalos de data para data (YYYY-MM-DD)
        const dateStart = `${year}-${m}-01`;
        const dateEnd = `${year}-${m}-${lastDay}`;

        // Intervalos de data para timestamptz (ISO 8601)
        const tzStart = `${year}-${m}-01T00:00:00.000Z`;
        const tzEnd = `${year}-${m}-${lastDay}T23:59:59.999Z`;

        // 1. Buscar mensalidades pagas cujo pagamento foi nesse mês
        const { data: paidTuitions, error: err1 } = await supabase
            .from('tuitions')
            .select('amount, discount_amount')
            .eq('status', 'paid')
            .gte('paid_at', tzStart)
            .lte('paid_at', tzEnd);

        if (err1) throw err1;

        // 2. Buscar pagamentos avulsos recebidos nesse mês
        const { data: avulsoPayments, error: err2 } = await supabase
            .from('payments')
            .select('amount')
            .gte('paid_at', tzStart)
            .lte('paid_at', tzEnd);

        if (err2) throw err2;

        // 3. Buscar despesas pagas nesse mês
        const { data: paidExpenses, error: err3 } = await supabase
            .from('expenses')
            .select('amount')
            .eq('paid', true)
            .gte('paid_at', tzStart)
            .lte('paid_at', tzEnd);

        if (err3) throw err3;

        // 4. Buscar investimentos desse mês
        const { data: investments, error: err4 } = await supabase
            .from('investments')
            .select('amount')
            .gte('purchased_at', dateStart)
            .lte('purchased_at', dateEnd);

        if (err4) throw err4;

        // 5. Buscar mensalidades pendentes/atrasadas com vencimento nesse mês (ainda não pagas)
        const { data: pendingTuitions, error: err5 } = await supabase
            .from('tuitions')
            .select('amount, discount_amount')
            .in('status', ['pending', 'overdue'])
            .gte('due_date', dateStart)
            .lte('due_date', dateEnd);

        if (err5) throw err5;

        // 6. Alunos em atraso (geral, independente de mês, que possuam mensalidade pendente após a data de vencimento)
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Pegar quantidade de alunos distintos que estão com mensalidades pendentes e vencidas, ou com status 'overdue'
        const { data: overdueTuitions, error: err6 } = await supabase
            .from('tuitions')
            .select('student_id')
            .or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${todayStr})`);

        if (err6) throw err6;

        const uniqueOverdueStudents = new Set(overdueTuitions.map(t => t.student_id)).size;

        // Calcular Totais
        const totalPaidTuitions = paidTuitions.reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.discount_amount)), 0);
        const totalAvulsos = avulsoPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const revenue = totalPaidTuitions + totalAvulsos;

        const totalExpenses = paidExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalInvestments = investments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const outgoings = totalExpenses + totalInvestments;

        const balance = revenue - outgoings;

        const pendingTuitionsTotal = pendingTuitions.reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.discount_amount)), 0);

        return res.status(200).json({
            summary: {
                revenue,              // Recebido no mês (mensalidades + avulsos)
                outgoings,            // Pago no mês (despesas + investimentos)
                balance,              // Saldo (receita - despesa)
                pending_tuitions: pendingTuitionsTotal, // Total pendente vencendo no mês
                overdue_students: uniqueOverdueStudents // Quantidade de alunos em atraso no sistema (geral)
            }
        });

    } catch (err) {
        return res.status(500).json({ error: 'Erro ao gerar resumo financeiro.', details: err.message });
    }
}
