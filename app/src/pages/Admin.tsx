import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudents, fetchTeachers, fetchEnrollments, fetchDashboard } from '@/services/api';
import '@/styles/admin.css';

// ══════════════════════════════════════════════════════════════════════
//  ADMIN PAGE
// ══════════════════════════════════════════════════════════════════════

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<{
        students: number;
        studentsActive: number;
        teachers: number;
        enrollmentsActive: number;
        revenue: number;
        pendingOrders: number;
        lowStock: number;
        todayClasses: number;
    } | null>(null);

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [students, teachers, enrollments, dash] = await Promise.all([
                fetchStudents(),
                fetchTeachers(),
                fetchEnrollments(),
                fetchDashboard(),
            ]);

            setStats({
                students: students.length,
                studentsActive: students.filter(s => s.active).length,
                teachers: teachers.length,
                enrollmentsActive: enrollments.filter(e => e.status === 'active').length,
                revenue: dash.financial.revenue,
                pendingOrders: dash.store.pending_orders,
                lowStock: dash.store.low_stock_products.length,
                todayClasses: dash.school.today_classes_count,
            });
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar estatísticas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    // ── Cards de resumo rápido ─────────────────────────────────────

    const quickCards = [
        {
            icon: '🎓',
            title: 'Alunos',
            value: stats ? `${stats.studentsActive}/${stats.students}` : '—',
            subtitle: 'Ativos / Total',
            color: '#22c55e',
            to: '/academico',
        },
        {
            icon: '👨‍🏫',
            title: 'Professores',
            value: stats ? String(stats.teachers) : '—',
            subtitle: 'Cadastrados',
            color: '#3b82f6',
            to: '/academico/professores',
        },
        {
            icon: '📚',
            title: 'Matrículas Ativas',
            value: stats ? String(stats.enrollmentsActive) : '—',
            subtitle: 'Vínculos pedagógicos',
            color: '#a855f7',
            to: '/academico/turmas',
        },
        {
            icon: '📊',
            title: 'Aulas Hoje',
            value: stats ? String(stats.todayClasses) : '—',
            subtitle: 'Agendadas / Realizadas',
            color: '#f59e0b',
            to: '/agenda',
        },
        {
            icon: '💰',
            title: 'Receita do Mês',
            value: stats
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)
                : '—',
            subtitle: 'Mensalidades + Avulsos',
            color: '#22c55e',
            to: '/financeiro',
        },
        {
            icon: '🛍️',
            title: 'Pedidos Pendentes',
            value: stats ? String(stats.pendingOrders) : '—',
            subtitle: stats?.pendingOrders ? 'Aguardando aprovação' : 'Nenhum pendente',
            color: stats?.pendingOrders ? '#f87171' : '#22c55e',
            to: '/',
        },
    ];

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <Link to="/" className="legacy-link">← Voltar ao início</Link>
                    <h1>👥 Administração</h1>
                </div>
                <button
                    className="admin-refresh-btn"
                    onClick={loadStats}
                    disabled={loading}
                >
                    ↻ Atualizar
                </button>
            </div>

            {error && (
                <div className="admin-error">{error}</div>
            )}

            {loading && !stats && (
                <div className="admin-loading">Carregando estatísticas...</div>
            )}

            {/* ── Overview Cards ──────────────────────────────────── */}
            {stats && (
                <>
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

                    {/* ── Quick Links ──────────────────────────────── */}
                    <div className="admin-section">
                        <h2>Atalhos Rápidos</h2>
                        <div className="admin-links-grid">
                            <a href="../painel-x9k2f.html" className="admin-link-card">
                                <span className="admin-link-icon">🖥️</span>
                                <span className="admin-link-title">Painel Clássico</span>
                                <span className="admin-link-desc">Gerenciamento completo da loja</span>
                            </a>
                            <a href="../academic/index.html" className="admin-link-card">
                                <span className="admin-link-icon">📚</span>
                                <span className="admin-link-title">Painel Acadêmico</span>
                                <span className="admin-link-desc">Alunos, professores e agenda</span>
                            </a>
                            <Link to="/dashboard" className="admin-link-card">
                                <span className="admin-link-icon">📊</span>
                                <span className="admin-link-title">Dashboard React</span>
                                <span className="admin-link-desc">Indicadores em tempo real</span>
                            </Link>
                            <Link to="/financeiro" className="admin-link-card">
                                <span className="admin-link-icon">💰</span>
                                <span className="admin-link-title">Financeiro React</span>
                                <span className="admin-link-desc">Fluxo de caixa e relatórios</span>
                            </Link>
                        </div>
                    </div>

                    {/* ── System Info ──────────────────────────────── */}
                    <div className="admin-section">
                        <h2>Informações do Sistema</h2>
                        <div className="admin-info-grid">
                            <div className="admin-info-item">
                                <span className="admin-info-label">Versão do App</span>
                                <span className="admin-info-value">1.0.0</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Ambiente</span>
                                <span className="admin-info-value">Produção (Vercel)</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Banco de Dados</span>
                                <span className="admin-info-value">Supabase (PostgreSQL)</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Frontend</span>
                                <span className="admin-info-value">React 19 + TypeScript + Vite</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Autenticação</span>
                                <span className="admin-info-value">Senha Admin (x-admin-password)</span>
                            </div>
                            <div className="admin-info-item">
                                <span className="admin-info-label">Sessão</span>
                                <span className="admin-info-value">
                                    {sessionStorage.getItem('admin_password') ? '✅ Ativa' : '❌ Inativa'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Database Tables Overview ──────────────────── */}
                    <div className="admin-section">
                        <h2>Resumo do Banco de Dados</h2>
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
                                        <td>{stats.students}</td>
                                        <td><span className="admin-status-dot active" /> {stats.studentsActive} ativos</td>
                                    </tr>
                                    <tr>
                                        <td>👨‍🏫 Professores (teachers)</td>
                                        <td>{stats.teachers}</td>
                                        <td><span className="admin-status-dot active" /> {stats.teachers} cadastrados</td>
                                    </tr>
                                    <tr>
                                        <td>📚 Matrículas (enrollments)</td>
                                        <td>{stats.enrollmentsActive}</td>
                                        <td><span className="admin-status-dot active" /> {stats.enrollmentsActive} ativas</td>
                                    </tr>
                                    <tr>
                                        <td>📦 Produtos (products)</td>
                                        <td>{stats.lowStock > 0 ? `${stats.lowStock} com estoque baixo` : '—'}</td>
                                        <td><span className={`admin-status-dot ${stats.lowStock > 0 ? 'warn' : 'active'}`} />
                                            {stats.lowStock > 0 ? `${stats.lowStock} abaixo do mínimo` : 'OK'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>🛍️ Pedidos (orders)</td>
                                        <td>{stats.pendingOrders} pendentes</td>
                                        <td><span className={`admin-status-dot ${stats.pendingOrders > 0 ? 'warn' : 'active'}`} />
                                            {stats.pendingOrders > 0 ? 'Aguardando ação' : 'Nenhum pendente'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
