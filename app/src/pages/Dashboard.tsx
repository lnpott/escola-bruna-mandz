import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '@/services/api';
import type { DashboardData, LessonBrief, OrderBrief, ProductBrief } from '@/types';
import '@/styles/dashboard.css';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatTime(time: string): string {
    return time.slice(0, 5);
}

function isNewOrder(createdAt: string): boolean {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(createdAt).getTime() > fiveMinutesAgo;
}

type KpiColor = 'good' | 'warn' | 'bad' | 'neutral';

function KpiCard({ icon, label, value, color = 'neutral', subtitle, to }: {
    icon: string;
    label: string;
    value: string;
    color?: KpiColor;
    subtitle?: string;
    to?: string;
}) {
    const card = (
        <>
            <div className="dash-kpi-icon">{icon}</div>
            <div className="dash-kpi-label">{label}</div>
            <div className={`dash-kpi-value ${color}`}>{value}</div>
            {subtitle && <div className="dash-kpi-subtitle">{subtitle}</div>}
        </>
    );

    if (to) {
        return (
            <Link to={to} className="dash-kpi-card dash-kpi-link">
                {card}
            </Link>
        );
    }

    return (
        <div className="dash-kpi-card">
            {card}
        </div>
    );
}

function LessonRow({ lesson }: { lesson: LessonBrief }) {
    const statusIcon: Record<string, string> = {
        scheduled: '🟡',
        completed: '✅',
        cancelled: '❌',
    };
    return (
        <div className={`dash-class-row ${lesson.status === 'completed' ? 'completed' : ''}`}>
            <span className="dash-class-time">{formatTime(lesson.start_time)}</span>
            <span className="dash-class-student">{lesson.students?.name || '—'}</span>
            <span className="dash-class-teacher">{lesson.teachers?.name || ''}</span>
            <span className="dash-class-status">{statusIcon[lesson.status] || '🟡'}</span>
        </div>
    );
}

function OrderRow({ order }: { order: OrderBrief }) {
    const statusLabels: Record<string, string> = {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
        cancelled: 'Cancelado',
        refunded: 'Devolvido',
    };
    const isNew = isNewOrder(order.created_at);
    return (
        <div className={`dash-order-row ${isNew ? 'row-new' : ''}`}>
            <span className="dash-order-id">#{order.id.slice(0, 8)}</span>
            <span className="dash-order-customer">{order.customer_name}</span>
            <span className="dash-order-total">{formatCurrency(order.total)}</span>
            <span className={`status-pill ${
                order.status === 'approved' ? 'status-approved' :
                order.status === 'pending' ? 'status-pending' :
                'status-cancelled'
            }`}>{statusLabels[order.status] || order.status}</span>
        </div>
    );
}

function StockRow({ product }: { product: ProductBrief }) {
    return (
        <div className="dash-stock-row">
            <span className="dash-stock-name">{product.name}</span>
            <span className="dash-stock-count">{product.stock} un.</span>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData['dashboard'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [countdown, setCountdown] = useState(60);

    const load = useCallback(async () => {
        try {
            setError('');
            const result = await fetchDashboard();
            setData(result);
            setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
        } catch (err: unknown) {
            setError('Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 60_000);
        return () => clearInterval(interval);
    }, [load]);

    // Countdown timer
    useEffect(() => {
        if (loading) return;
        const timer = setInterval(() => {
            setCountdown((c) => (c <= 1 ? 60 : c - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [loading]);

    function getBalanceColor(balance: number): KpiColor {
        if (balance > 0) return 'good';
        if (balance < 0) return 'bad';
        return 'neutral';
    }

    if (loading && !data) {
        return (
            <div className="dash-page">
                <div className="loading">Carregando dashboard...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="dash-page">
                <div className="empty-state">Erro ao carregar dashboard.</div>
            </div>
        );
    }

    const { financial, school, store } = data;

    return (
        <div className="dash-page">
            {/* ── Header ─────────────────────────────── */}
            <div className="dash-header">
                <div>
                    <h1>📊 Dashboard</h1>
                    <p className="dash-header-subtitle">
                        Última atualização: {lastUpdate}
                        {!loading && <span className="dash-countdown"> (próximo em {countdown}s)</span>}
                    </p>
                </div>
                <div className="dash-header-actions">
                    <button className="btn-secondary" onClick={load} disabled={loading}>
                        ↻ {loading ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner" onClick={() => setError('')}>
                    {error}
                </div>
            )}

            {/* ── KPI Grid ───────────────────────────── */}
            <div className="dash-kpi-grid">
                <KpiCard
                    icon="💰"
                    label="Receita do Mês"
                    value={formatCurrency(financial.revenue)}
                    color="good"
                    to="/financeiro"
                />
                <KpiCard
                    icon="💸"
                    label="Despesas do Mês"
                    value={formatCurrency(financial.outgoings)}
                    color="warn"
                    to="/financeiro"
                />
                <KpiCard
                    icon="📊"
                    label="Saldo do Mês"
                    value={formatCurrency(financial.balance)}
                    color={getBalanceColor(financial.balance)}
                    to="/financeiro"
                />
                <KpiCard
                    icon="⏳"
                    label="Pendentes"
                    value={formatCurrency(financial.pending_tuitions)}
                    color="warn"
                    to="/financeiro"
                />
                <KpiCard
                    icon="🔴"
                    label="Alunos em Atraso"
                    value={String(financial.overdue_students)}
                    color={financial.overdue_students > 0 ? 'bad' : 'good'}
                    to="/financeiro"
                />
                <KpiCard
                    icon="🎓"
                    label="Alunos Ativos"
                    value={String(school.active_students)}
                    color="good"
                    to="/academico"
                />
            </div>

            {/* ── Split Row ──────────────────────────── */}
            <div className="dash-split">
                {/* Today's Classes */}
                <div className="dash-card">
                    <Link to="/agenda" className="dash-card-header dash-card-header-link">
                        <h3>📅 Aulas de Hoje</h3>
                        <span className="dash-badge">{school.today_classes_count}</span>
                    </Link>
                    <div className="dash-card-body">
                        {school.today_classes.length === 0 ? (
                            <div className="dash-empty">Nenhuma aula hoje.</div>
                        ) : (
                            school.today_classes.map((lesson) => (
                                <LessonRow key={lesson.id} lesson={lesson} />
                            ))
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h3>🔔 Alertas</h3>
                    </div>
                    <div className="dash-card-body">
                        {financial.overdue_students === 0 && store.pending_orders === 0 && store.low_stock_products.length === 0 ? (
                            <div className="dash-empty">Nenhum alerta no momento.</div>
                        ) : (
                            <>
                                {financial.overdue_students > 0 && (
                                    <Link to="/financeiro" className="dash-alert-row dash-alert-link">
                                        <span className="dash-alert-icon">🔴</span>
                                        <span className="dash-alert-text">
                                            <strong>{financial.overdue_students} aluno(s)</strong> em atraso
                                        </span>
                                        <span className="dash-alert-arrow">→</span>
                                    </Link>
                                )}
                                {store.pending_orders > 0 && (
                                    <Link to="/admin" className="dash-alert-row dash-alert-link">
                                        <span className="dash-alert-icon">📦</span>
                                        <span className="dash-alert-text">
                                            <strong>{store.pending_orders} pedido(s)</strong> pendente(s)
                                        </span>
                                        <span className="dash-alert-arrow">→</span>
                                    </Link>
                                )}
                                {store.low_stock_products.length > 0 && (
                                    <Link to="/admin" className="dash-alert-row dash-alert-link">
                                        <span className="dash-alert-icon">⚠️</span>
                                        <span className="dash-alert-text">
                                            <strong>{store.low_stock_products.length} produto(s)</strong> com estoque baixo
                                        </span>
                                        <span className="dash-alert-arrow">→</span>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Orders ──────────────────────── */}
            <div className="dash-card">
                <div className="dash-card-header">
                    <h3>🧾 Pedidos Recentes</h3>
                    {store.recent_orders.length > 0 && (
                        <Link to="/comercial/pedidos" className="dash-view-link">Ver todos →</Link>
                    )}
                </div>
                <div className="dash-card-body">
                    {store.recent_orders.length === 0 ? (
                        <div className="dash-empty">Nenhum pedido recente.</div>
                    ) : (
                        store.recent_orders.map((order) => (
                            <OrderRow key={order.id} order={order} />
                        ))
                    )}
                </div>
            </div>

            {/* ── Low Stock ──────────────────────────── */}
            {store.low_stock_products.length > 0 && (
                <div className="dash-card">
                    <Link to="/admin" className="dash-card-header dash-card-header-link">
                        <h3>📦 Produtos com Estoque Baixo</h3>
                        <span className="dash-view-link">Gerenciar →</span>
                    </Link>
                    <div className="dash-card-body">
                        {store.low_stock_products.map((product) => (
                            <StockRow key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
