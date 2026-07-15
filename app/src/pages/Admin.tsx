import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudents, fetchTeachers, fetchEnrollments, fetchDashboard, fetchMonthlyTrend, fetchFinancialSummary } from '@/services/api';
import type { Student, Teacher, Enrollment } from '@/types';
import '@/styles/admin.css';

// ══════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════

const STATUS_LABELS: Record<string, string> = {
    lead: 'Lead',
    interested: 'Interessado',
    enrolled: 'Matriculado',
    active: 'Ativo',
    suspended: 'Trancado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
    lead: '#52525b',
    interested: '#f59e0b',
    enrolled: '#3b82f6',
    active: '#22c55e',
    suspended: '#f97316',
    completed: '#a855f7',
    cancelled: '#ef4444',
};

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label?: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="chart-bar-row">
            {label && <span className="chart-bar-label">{label}</span>}
            <div className="chart-bar-track">
                <div
                    className="chart-bar-fill"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color, '--bar-color': color } as React.CSSProperties}
                />
            </div>
            <span className="chart-bar-value">{value}</span>
        </div>
    );
}

function formatBRL(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

// ══════════════════════════════════════════════════════════════════════
//  ADMIN PAGE
// ══════════════════════════════════════════════════════════════════════

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState<{
        students: Student[];
        teachers: Teacher[];
        enrollments: Enrollment[];
        dash: {
            financial: { revenue: number; outgoings: number; balance: number; pending_tuitions: number; overdue_students: number };
            school: { active_students: number; active_teachers: number; today_classes_count: number };
            store: { pending_orders: number; low_stock_products: { id: string; name: string; stock: number }[] };
        };
        trend: { month: number; year: number; label: string; revenue: number; outgoings: number; balance: number }[];
        currentSummary: { revenue: number; outgoings: number; balance: number; pending_tuitions: number; overdue_students: number; pending_teacher_payments: number };
    } | null>(null);

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const [students, teachers, enrollments, dash, trend, currentSummary] = await Promise.all([
                fetchStudents(),
                fetchTeachers(),
                fetchEnrollments(),
                fetchDashboard(),
                fetchMonthlyTrend(6),
                fetchFinancialSummary(month, year),
            ]);

            setData({ students, teachers, enrollments, dash, trend, currentSummary });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    // ── Derived statistics ──────────────────────────────────────────

    const statusDist = (() => {
        if (!data) return [];
        const counts: Record<string, number> = {};
        for (const s of data.students) {
            counts[s.status] = (counts[s.status] || 0) + 1;
        }
        const order = ['lead', 'interested', 'enrolled', 'active', 'suspended', 'completed', 'cancelled'];
        const maxVal = Math.max(...Object.values(counts), 1);
        return order.filter(k => counts[k]).map(k => ({
            status: k,
            label: STATUS_LABELS[k] || k,
            count: counts[k],
            color: STATUS_COLORS[k] || '#71717a',
            max: maxVal,
        }));
    })();

    const sourceDist = (() => {
        if (!data) return [];
        const counts: Record<string, number> = {};
        for (const s of data.students) {
            const src = s.source || '';
            counts[src] = (counts[src] || 0) + 1;
        }
        const labels: Record<string, string> = {
            '': 'Não informado',
            website: 'Site/Google',
            indicacao: 'Indicação',
            social: 'Redes Sociais',
            presencial: 'Presencial',
            outro: 'Outro',
        };
        const colors = ['#71717a', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];
        const maxVal = Math.max(...Object.values(counts), 1);
        return Object.entries(counts).map(([key, count], i) => ({
            key,
            label: labels[key] || key,
            count,
            color: colors[i % colors.length],
            max: maxVal,
        }));
    })();

    const teacherLoad = (() => {
        if (!data) return [];
        const counts: Record<string, { name: string; count: number }> = {};
        for (const e of data.enrollments) {
            if (e.teacher_id && e.teachers?.name) {
                if (!counts[e.teacher_id]) {
                    counts[e.teacher_id] = { name: e.teachers.name, count: 0 };
                }
                counts[e.teacher_id].count++;
            }
        }
        const arr = Object.values(counts).sort((a, b) => b.count - a.count);
        const maxVal = Math.max(...arr.map(a => a.count), 1);
        return arr.slice(0, 8).map(item => ({
            ...item,
            max: maxVal,
            color: '#3b82f6',
        }));
    })();

    const instrumentDist = (() => {
        if (!data) return [];
        const counts: Record<string, number> = {};
        for (const s of data.students) {
            const inst = s.instruments;
            if (inst) {
                const list = inst.split(',').map(i => i.trim()).filter(Boolean);
                for (const i of list) {
                    counts[i] = (counts[i] || 0) + 1;
                }
            }
        }
        const arr = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
        const maxVal = Math.max(...arr.map(a => a.count), 1);
        const colors = ['#dc2626', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];
        return arr.map((item, i) => ({
            ...item,
            max: maxVal,
            color: colors[i % colors.length],
        }));
    })();

    // ── Quick cards ────────────────────────────────────────────────

    const quickCards = data ? [
        { icon: '🎓', title: 'Alunos', value: `${data.dash.school.active_students}/${data.students.length}`, subtitle: 'Ativos / Total', color: '#22c55e', to: '/academico' },
        { icon: '👨‍🏫', title: 'Professores', value: String(data.dash.school.active_teachers), subtitle: 'Ativos', color: '#3b82f6', to: '/academico/professores' },
        { icon: '📚', title: 'Matrículas', value: String(data.enrollments.filter(e => e.status === 'active').length), subtitle: 'Vínculos ativos', color: '#a855f7', to: '/academico/turmas' },
        { icon: '📅', title: 'Aulas Hoje', value: String(data.dash.school.today_classes_count), subtitle: 'Agendadas / Realizadas', color: '#f59e0b', to: '/agenda' },
        { icon: '💰', title: 'Receita do Mês', value: formatBRL(data.dash.financial.revenue), subtitle: 'Mensalidades + Avulsos', color: '#22c55e', to: '/financeiro' },
        { icon: '⚠️', title: 'Pendentes', value: formatBRL(data.dash.financial.pending_tuitions), subtitle: 'Valor em aberto', color: '#f87171', to: '/financeiro' },
    ] : [];

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>👥 Administração</h1>
                </div>
                <button className="admin-refresh-btn" onClick={loadStats} disabled={loading}>
                    ↻ Atualizar
                </button>
            </div>

            {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}
            {loading && !data && <div className="loading">Carregando estatísticas...</div>}

            {data && (
                <>
                    {/* ── Overview Cards ────────────────────────────── */}
                    <div className="admin-overview-grid">
                        {quickCards.map(card => (
                            <Link to={card.to} key={card.title} className="admin-card" style={{ '--card-accent': card.color } as React.CSSProperties}>
                                <div className="admin-card-icon">{card.icon}</div>
                                <div className="admin-card-body">
                                    <div className="admin-card-label">{card.title}</div>
                                    <div className="admin-card-value">{card.value}</div>
                                    <div className="admin-card-subtitle">{card.subtitle}</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* ── Alert Center ────────────────────────────── */}
                    {(() => {
                        const alerts: { icon: string; message: string; severity: 'critical' | 'warning' | 'info'; link?: string }[] = [];
                        if (data.dash.financial.overdue_students > 0)
                            alerts.push({ icon: '⚠️', message: `${data.dash.financial.overdue_students} aluno(s) com mensalidades em atraso`, severity: 'critical', link: '/financeiro' });
                        if (data.currentSummary.pending_teacher_payments > 0)
                            alerts.push({ icon: '👨‍🏫', message: `${formatBRL(data.currentSummary.pending_teacher_payments)} em pagamentos de professores pendentes`, severity: 'warning', link: '/financeiro' });
                        if (data.dash.store.pending_orders > 0)
                            alerts.push({ icon: '🛍️', message: `${data.dash.store.pending_orders} pedido(s) aguardando aprovação`, severity: 'warning', link: '/loja' });
                        if (data.dash.store.low_stock_products.length > 0)
                            alerts.push({ icon: '📦', message: `${data.dash.store.low_stock_products.length} produto(s) com estoque baixo`, severity: 'info', link: '/loja' });

                        if (alerts.length === 0) return null;

                        return (
                            <div className="admin-section">
                                <h2>⚠️ Central de Alertas</h2>
                                <div className="admin-alerts-grid">
                                    {alerts.map((a, i) => (
                                        a.link ? (
                                            <Link to={a.link} key={i} className={`admin-alert-card severity-${a.severity}`}>
                                                <span className="admin-alert-icon">{a.icon}</span>
                                                <span className="admin-alert-msg">{a.message}</span>
                                                <span className="admin-alert-arrow">→</span>
                                            </Link>
                                        ) : (
                                            <div key={i} className={`admin-alert-card severity-${a.severity}`}>
                                                <span className="admin-alert-icon">{a.icon}</span>
                                                <span className="admin-alert-msg">{a.message}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* ── Charts Grid ───────────────────────────────── */}
                    <div className="admin-charts-grid">
                        {/* Student Status Distribution */}
                        <div className="admin-chart-card">
                            <h3 className="admin-chart-title">📊 Distribuição por Status</h3>
                            <div className="chart-bars">
                                {statusDist.map(s => (
                                    <Bar key={s.status} value={s.count} max={s.max} color={s.color} label={s.label} />
                                ))}
                            </div>
                        </div>

                        {/* Student Source Distribution */}
                        <div className="admin-chart-card">
                            <h3 className="admin-chart-title">📋 Origem dos Alunos</h3>
                            {sourceDist.length > 0 ? (
                                <div className="chart-bars">
                                    {sourceDist.map(s => (
                                        <Bar key={s.key} value={s.count} max={s.max} color={s.color} label={s.label} />
                                    ))}
                                </div>
                            ) : (
                                <div className="chart-empty">Dados de origem não preenchidos.</div>
                            )}
                        </div>

                        {/* Most Popular Instruments */}
                        <div className="admin-chart-card">
                            <h3 className="admin-chart-title">🎵 Instrumentos Mais Populares</h3>
                            {instrumentDist.length > 0 ? (
                                <div className="chart-bars">
                                    {instrumentDist.map((inst, i) => (
                                        <Bar key={inst.name} value={inst.count} max={inst.max} color={inst.color} label={inst.name} />
                                    ))}
                                </div>
                            ) : (
                                <div className="chart-empty">Nenhum instrumento registrado.</div>
                            )}
                        </div>

                        {/* Teacher Class Load */}
                        <div className="admin-chart-card">
                            <h3 className="admin-chart-title">👨‍🏫 Carga de Aulas por Professor</h3>
                            {teacherLoad.length > 0 ? (
                                <div className="chart-bars">
                                    {teacherLoad.map(t => (
                                        <Bar key={t.name} value={t.count} max={t.max} color={t.color} label={t.name} />
                                    ))}
                                </div>
                            ) : (
                                <div className="chart-empty">Nenhum professor com vínculos.</div>
                            )}
                        </div>

                        {/* Billing Type Distribution */}
                        {(() => {
                            const counts: Record<string, number> = {};
                            for (const e of data.enrollments) {
                                const bt = e.billing_type || 'monthly';
                                counts[bt] = (counts[bt] || 0) + 1;
                            }
                            const labels: Record<string, string> = { weekly: 'Semanal', monthly: 'Mensal', full: 'Semestral/Anual' };
                            const colors: Record<string, string> = { weekly: '#f59e0b', monthly: '#22c55e', full: '#a855f7' };
                            const arr = Object.entries(counts).map(([key, count]) => ({ key, label: labels[key] || key, count, color: colors[key] || '#71717a' }));
                            const maxVal = Math.max(...arr.map(a => a.count), 1);
                            return (
                                <div className="admin-chart-card">
                                    <h3 className="admin-chart-title">💳 Distribuição por Tipo de Cobrança</h3>
                                    {arr.length > 0 ? (
                                        <div className="chart-bars">
                                            {arr.map(a => (
                                                <Bar key={a.key} value={a.count} max={maxVal} color={a.color} label={a.label} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="chart-empty">Nenhum vínculo registrado.</div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* ── Monthly Financial Trend ───────────────────── */}
                    <div className="admin-section">
                        <h2>📈 Tendência Financeira (6 meses)</h2>
                        <div className="admin-trend-card">
                            <div className="trend-chart">
                                {data.trend.map(m => {
                                    const maxVal = Math.max(...data.trend.map(x => Math.max(x.revenue, x.outgoings)), 1);
                                    const revPct = (m.revenue / maxVal) * 100;
                                    const outPct = (m.outgoings / maxVal) * 100;
                                    return (
                                        <div key={m.label} className="trend-month">
                                            <div className="trend-bars">
                                                <div className="trend-bar-wrapper">
                                                    <div
                                                        className="trend-bar revenue"
                                                        style={{ height: `${Math.max(revPct, 3)}%` }}
                                                        title={`Receita: ${formatBRL(m.revenue)}`}
                                                    />
                                                </div>
                                                <div className="trend-bar-wrapper">
                                                    <div
                                                        className="trend-bar outgoings"
                                                        style={{ height: `${Math.max(outPct, 3)}%` }}
                                                        title={`Despesas: ${formatBRL(m.outgoings)}`}
                                                    />
                                                </div>
                                            </div>
                                            <span className="trend-label">{m.label}</span>
                                            <span className="trend-balance" style={{ color: m.balance >= 0 ? '#22c55e' : '#ef4444' }}>
                                                {formatBRL(m.balance)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="trend-legend">
                                <span className="trend-legend-item"><span className="trend-dot revenue" /> Receita</span>
                                <span className="trend-legend-item"><span className="trend-dot outgoings" /> Despesas</span>
                                <span className="trend-legend-item">Valor abaixo = Saldo do mês</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Financial KPIs (Detalhado) ──────────────── */}
                    <div className="admin-section">
                        <h2>💰 Indicadores Financeiros</h2>
                        <div className="admin-fin-kpis">
                            <div className="admin-fin-card">
                                <span className="admin-fin-label">Receita do Mês</span>
                                <span className="admin-fin-value" style={{ color: '#22c55e' }}>{formatBRL(data.currentSummary.revenue)}</span>
                                <span className="admin-fin-trend">
                                    {data.trend.length >= 2 && data.trend[data.trend.length - 1].revenue > data.trend[data.trend.length - 2].revenue ? '📈' : '📉'}
                                    vs. mês anterior
                                </span>
                            </div>
                            <div className="admin-fin-card">
                                <span className="admin-fin-label">Despesas do Mês</span>
                                <span className="admin-fin-value" style={{ color: '#ef4444' }}>{formatBRL(data.currentSummary.outgoings)}</span>
                                <span className="admin-fin-trend">
                                    {data.currentSummary.revenue > 0 ? `${Math.round((data.currentSummary.outgoings / data.currentSummary.revenue) * 100)}% da receita` : '—'}
                                </span>
                            </div>
                            <div className="admin-fin-card">
                                <span className="admin-fin-label">Saldo Líquido</span>
                                <span className={`admin-fin-value ${data.currentSummary.balance >= 0 ? 'positive' : 'negative'}`}>
                                    {formatBRL(data.currentSummary.balance)}
                                </span>
                                <span className="admin-fin-trend">
                                    {data.currentSummary.balance >= 0 ? '✅ Positivo' : '🔴 Negativo'}
                                </span>
                            </div>
                            <div className="admin-fin-card">
                                <span className="admin-fin-label">Mensalidades Pendentes</span>
                                <span className="admin-fin-value" style={{ color: '#f59e0b' }}>{formatBRL(data.currentSummary.pending_tuitions)}</span>
                                <span className="admin-fin-trend">
                                    {data.currentSummary.overdue_students} aluno(s) em atraso
                                </span>
                            </div>
                            <div className="admin-fin-card">
                                <span className="admin-fin-label">A Pagar Professores</span>
                                <span className="admin-fin-value" style={{ color: '#f97316' }}>{formatBRL(data.currentSummary.pending_teacher_payments)}</span>
                                <span className="admin-fin-trend">
                                    Pendente do mês
                                </span>
                            </div>
                            <div className="admin-fin-card">
                                <span className="admin-fin-label">Mensalidade Média</span>
                                <span className="admin-fin-value" style={{ color: '#a855f7' }}>
                                    {formatBRL((() => {
                                        const active = data.enrollments.filter(e => e.status === 'active');
                                        return active.length > 0 ? active.reduce((s, e) => s + e.monthly_fee, 0) / active.length : 0;
                                    })())}
                                </span>
                                <span className="admin-fin-trend">
                                    {data.enrollments.filter(e => e.status === 'active').length} vínculo(s) ativo(s)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Database Tables Overview ──────────────────── */}
                    <div className="admin-section">
                        <h2>🏛️ Resumo do Banco de Dados</h2>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Tabela</th>
                                        <th>Registros</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>🎓 Alunos (students)</td>
                                        <td>{data.students.length}</td>
                                        <td><span className="admin-status-dot active" /> {data.dash.school.active_students} ativos</td>
                                    </tr>
                                    <tr>
                                        <td>👨‍🏫 Professores (teachers)</td>
                                        <td>{data.teachers.length}</td>
                                        <td><span className="admin-status-dot active" /> {data.dash.school.active_teachers} ativos</td>
                                    </tr>
                                    <tr>
                                        <td>📚 Matrículas (enrollments)</td>
                                        <td>{data.enrollments.length}</td>
                                        <td><span className="admin-status-dot active" /> {data.enrollments.filter(e => e.status === 'active').length} ativas</td>
                                    </tr>
                                    <tr>
                                        <td>📦 Produtos (products)</td>
                                        <td>{data.dash.store.low_stock_products.length > 0 ? `${data.dash.store.low_stock_products.length} com estoque baixo` : '—'}</td>
                                        <td>
                                            <span className={`admin-status-dot ${data.dash.store.low_stock_products.length > 0 ? 'warn' : 'active'}`} />
                                            {data.dash.store.low_stock_products.length > 0 ? `${data.dash.store.low_stock_products.length} abaixo do mínimo` : 'OK'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>🛍️ Pedidos (orders)</td>
                                        <td>{data.dash.store.pending_orders} pendentes</td>
                                        <td>
                                            <span className={`admin-status-dot ${data.dash.store.pending_orders > 0 ? 'warn' : 'active'}`} />
                                            {data.dash.store.pending_orders > 0 ? 'Aguardando ação' : 'Nenhum pendente'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── System Info (compacta) ────────────────────── */}
                    <div className="admin-section">
                        <h2>⚙️ Sistema</h2>
                        <div className="admin-info-grid">
                            <div className="admin-info-item">
                                <span className="admin-info-label">Versão</span>
                                <span className="admin-info-value">1.0.0</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Frontend</span>
                                <span className="admin-info-value">React 19 + Vite</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Banco</span>
                                <span className="admin-info-value">Supabase (PostgreSQL)</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Sessão</span>
                                <span className="admin-info-value">
                                    {sessionStorage.getItem('admin_password') ? '✅ Ativa' : '❌ Inativa'}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
