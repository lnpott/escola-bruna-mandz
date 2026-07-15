import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import type { Student, Enrollment, Lesson, Payment } from '@/types';
import { STATUS_LABELS, STATUS_CLASSES, STATUS_ICONS, SOURCE_LABELS } from '@/types';
import { fetchStudentById, fetchLessonsByStudent, fetchEnrollmentsByStudent, fetchTuitionsByStudent, fetchPaymentsByStudent } from '@/services/api';
import '@/styles/students.css';

/** Format BRL currency */
function formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/** Format date string to pt-BR */
function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR');
}

export default function StudentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useApp();

    const [student, setStudent] = useState<Student | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [tuitions, setTuitions] = useState<{
        id: string;
        amount: number;
        due_date: string;
        status: string;
        paid_at?: string;
        reference_month?: string;
    }[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'lessons' | 'tuitions' | 'payments'>('lessons');

    const loadAll = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const found = await fetchStudentById(id);
            if (!found) { setError('Aluno não encontrado.'); setLoading(false); return; }
            setStudent(found);

            const [enr, les, tui, pay] = await Promise.all([
                fetchEnrollmentsByStudent(id).catch(() => []),
                fetchLessonsByStudent(id).catch(() => []),
                fetchTuitionsByStudent(id).catch(() => []),
                fetchPaymentsByStudent(id).catch(() => []),
            ]);
            setEnrollments(enr);
            setLessons(les);
            setTuitions(tui);
            setPayments(pay);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados do aluno.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Stats ────────────────────────────────────────────────
    const totalPaid = tuitions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPending = tuitions
        .filter(t => t.status === 'pending' || t.status === 'overdue')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const attendanceRate = lessons.length > 0
        ? Math.round((lessons.filter(l => l.status === 'completed').length / lessons.length) * 100)
        : 0;

    if (loading) return <div className="students-page"><div className="loading">Carregando dados do aluno...</div></div>;
    if (error) return <div className="students-page"><div className="error-banner" onClick={() => navigate('/academico')}>{error}</div></div>;
    if (!student) return null;

    return (
        <div className="students-page">
            {/* ── Header ────────────────────────────────────── */}
            <div className="students-header">
                <div>
                    <h1>{student.name}</h1>
                    <span className={`status-pill ${STATUS_CLASSES[student.status] || 'status-pending'}`}
                        style={{ marginTop: 8, display: 'inline-flex' }}>
                        {STATUS_ICONS[student.status]} {STATUS_LABELS[student.status]}
                    </span>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/academico')}>← Voltar</button>
            </div>

            {/* ── Info Card ─────────────────────────────────── */}
            <div className="student-detail-info">
                <div className="student-info-grid">
                    <div className="info-item">
                        <span className="info-label">E-mail</span>
                        <span className="info-value">{student.email || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Telefone</span>
                        <span className="info-value">{student.phone || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">CPF</span>
                        <span className="info-value">{student.cpf || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Instrumento(s)</span>
                        <span className="info-value">{student.instruments || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Origem</span>
                        <span className="info-value">{student.source ? SOURCE_LABELS[student.source] || student.source : '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Matrícula</span>
                        <span className="info-value">{student.enrolled_at ? formatDate(student.enrolled_at) : '—'}</span>
                    </div>
                    {student.guardian_name && (
                        <>
                            <div className="info-item">
                                <span className="info-label">Responsável</span>
                                <span className="info-value">{student.guardian_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Tel. Responsável</span>
                                <span className="info-value">{student.guardian_phone || '—'}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Stats Cards ───────────────────────────────── */}
            <div className="student-stats-row">
                <div className="student-stat-card">
                    <span className="stat-number">{enrollments.filter(e => e.status === 'active').length}</span>
                    <span className="stat-label">Matrículas Ativas</span>
                </div>
                <div className="student-stat-card">
                    <span className="stat-number">{lessons.length}</span>
                    <span className="stat-label">Total de Aulas</span>
                </div>
                <div className="student-stat-card">
                    <span className="stat-number">{attendanceRate}%</span>
                    <span className="stat-label">Presença</span>
                </div>
                <div className="student-stat-card highlight-green">
                    <span className="stat-number">{formatBRL(totalPaid)}</span>
                    <span className="stat-label">Total Pago</span>
                </div>
                <div className="student-stat-card highlight-red">
                    <span className="stat-number">{formatBRL(totalPending)}</span>
                    <span className="stat-label">Pendente</span>
                </div>
            </div>

            {/* ── Enrollments ───────────────────────────────── */}
            {enrollments.length > 0 && (
                <div className="student-section">
                    <h3 className="section-title">📚 Matrículas ({enrollments.length})</h3>
                    <div className="enrollments-mini-list">
                        {enrollments.map(e => (
                            <div key={e.id} className="enrollment-mini-card">
                                <div className="enr-mini-top">
                                    <strong>{e.instrument || '—'}</strong>
                                    <span className={`status-pill ${e.status === 'active' ? 'status-approved' : 'status-cancelled'}`}
                                        style={{ fontSize: 9 }}>
                                        {e.status === 'active' ? '✅ Ativo' : '❌ Inativo'}
                                    </span>
                                </div>
                                <div className="enr-mini-details">
                                    <span>👨‍🏫 {e.teachers?.name || '—'}</span>
                                    <span>💰 {formatBRL(e.monthly_fee)}</span>
                                    {e.day_of_week && <span>📅 {e.day_of_week} {e.class_time || ''}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tabs: Lessons / Tuitions / Payments ───────── */}
            <div className="student-section">
                <div className="sub-nav" style={{ marginBottom: 12 }}>
                    <button className={`sub-nav-link ${activeTab === 'lessons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lessons')}>📅 Aulas ({lessons.length})</button>
                    <button className={`sub-nav-link ${activeTab === 'tuitions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tuitions')}>💰 Mensalidades ({tuitions.length})</button>
                    <button className={`sub-nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payments')}>💳 Pagamentos ({payments.length})</button>
                </div>

                {/* Lessons Tab */}
                {activeTab === 'lessons' && (
                    lessons.length === 0
                        ? <div className="empty-state empty-state-sm">Nenhuma aula registrada.</div>
                        : <div className="student-table-scroll">
                            <table className="students-table" style={{ fontSize: 12 }}>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Horário</th>
                                        <th>Professor</th>
                                        <th>Instrumento</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lessons.map(l => (
                                        <tr key={l.id}>
                                            <td>{formatDate(l.date)}</td>
                                            <td>{l.start_time || '—'}</td>
                                            <td>{l.teachers?.name || '—'}</td>
                                            <td>{l.instrument || '—'}</td>
                                            <td>
                                                <span className={`status-pill ${l.status === 'completed' ? 'status-approved' : l.status === 'cancelled' ? 'status-cancelled' : 'status-pending'}`}
                                                    style={{ fontSize: 9 }}>
                                                    {l.status === 'completed' ? '✅' : l.status === 'cancelled' ? '❌' : '📅'} {l.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                )}

                {/* Tuitions Tab */}
                {activeTab === 'tuitions' && (
                    tuitions.length === 0
                        ? <div className="empty-state empty-state-sm">Nenhuma mensalidade registrada.</div>
                        : <div className="student-table-scroll">
                            <table className="students-table" style={{ fontSize: 12 }}>
                                <thead>
                                    <tr>
                                        <th>Ref.</th>
                                        <th>Valor</th>
                                        <th>Vencimento</th>
                                        <th>Status</th>
                                        <th>Pago em</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tuitions.map(t => (
                                        <tr key={t.id}>
                                            <td>{t.reference_month ? formatDate(t.reference_month) : '—'}</td>
                                            <td>{formatBRL(Number(t.amount))}</td>
                                            <td>{formatDate(t.due_date)}</td>
                                            <td>
                                                <span className={`status-pill ${t.status === 'paid' ? 'status-approved' : t.status === 'overdue' ? 'status-cancelled' : 'status-pending'}`}
                                                    style={{ fontSize: 9 }}>
                                                    {t.status === 'paid' ? '✅' : t.status === 'overdue' ? '🔴' : '⏳'} {t.status}
                                                </span>
                                            </td>
                                            <td>{t.paid_at ? formatDate(t.paid_at) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    payments.length === 0
                        ? <div className="empty-state empty-state-sm">Nenhum pagamento avulso registrado.</div>
                        : <div className="student-table-scroll">
                            <table className="students-table" style={{ fontSize: 12 }}>
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Data</th>
                                        <th>Categoria</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.description}</td>
                                            <td>{formatBRL(Number(p.amount))}</td>
                                            <td>{p.paid_at ? formatDate(p.paid_at) : '—'}</td>
                                            <td>{p.category || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                )}
            </div>
        </div>
    );
}
