/**
 * api/_lib/financial/dashboard.js
 * Consolidado de indicadores para a tela inicial: financeiro do mês,
 * escola (alunos/professores ativos, aulas de hoje) e loja (pedidos
 * pendentes, estoque baixo). Reusa computeFinancialSummary para não
 * duplicar as 8 queries financeiras.
 */
import { computeFinancialSummary } from './summary.js';

export async function handleDashboard(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    // 1) Reusa a lógica financeira (elimina ~50 linhas de queries duplicadas)
    const financial = await computeFinancialSummary(supabase, thisMonth, thisYear);

    // 2) Queries específicas do dashboard (escola + loja)
    const [
        { data: activeStudents,     error: e7  },
        { data: activeTeachers,     error: e8  },
        { data: todayClasses,       error: e9  },
        { data: pendingOrders,      error: e10 },
        { data: recentOrders,       error: e11 },
        { data: lowStock,           error: e12 },
    ] = await Promise.all([
        // Correção (jul/2026): 'active' foi removido de students — a única
        // fonte de verdade agora é status = 'active'.
        supabase.from('students').select('id').eq('status', 'active'),
        supabase.from('teachers').select('id').eq('active', true),
        supabase.from('lessons').select('*, enrollments(monthly_fee), students(name), teachers(name, specialty)').eq('date', today).in('status', ['scheduled', 'completed']).order('start_time', { ascending: true }),
        supabase.from('orders').select('id').eq('status', 'pending'),
        supabase.from('orders').select('id,customer_name,total,created_at,status').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id,name,stock,active').lte('stock', 5).eq('active', true),
    ]);

    for (const e of [e7, e8, e9, e10, e11, e12]) { if (e) throw e; }

    return res.status(200).json({
        dashboard: {
            financial: {
                revenue: financial.revenue,
                outgoings: financial.outgoings,
                balance: financial.balance,
                pending_tuitions: financial.pending_tuitions,
                overdue_students: financial.overdue_students,
            },
            school: {
                active_students: activeStudents?.length ?? 0,
                active_teachers: activeTeachers?.length ?? 0,
                today_classes: todayClasses || [],
                today_classes_count: todayClasses?.length ?? 0,
            },
            store: {
                pending_orders: pendingOrders?.length ?? 0,
                recent_orders: recentOrders || [],
                low_stock_products: lowStock || [],
            },
        }
    });
}
