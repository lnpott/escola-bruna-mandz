import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/App';
import {
    fetchFinancialSummary,
    fetchPayments, createPayment,
    fetchExpenses, createExpense, updateExpense,
    fetchInvestments, createInvestment,
    fetchTeacherPayments, createTeacherPayment, updateTeacherPayment, deleteTeacherPayment,
    fetchStudents,
    fetchTeachers,
} from '@/services/api';
import type {
    FinancialSummary as FinSummary,
    Payment, Expense, Investment, TeacherPayment,
    Student, Teacher,
} from '@/types';
import '@/styles/financial.css';

// ── Helpers ────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function nowISO() {
    return new Date().toISOString().slice(0, 16);
}

function formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
}

function formatDateTime(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i);

type FinTab = 'payments' | 'expenses' | 'investments' | 'teacher_payments';

const TAB_LABELS: Record<FinTab, string> = {
    payments: '🧾 Receitas Avulsas',
    expenses: '📉 Custos',
    investments: '📈 Investimentos',
    teacher_payments: '👨‍🏫 Pag. Professores',
};

function parseCurrencyInput(value: string): number {
    if (!value) return 0;
    // Remove tudo que não é dígito ou vírgula/ponto
    const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════

export default function Financial() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [activeTab, setActiveTab] = useState<FinTab>('payments');
    const [summary, setSummary] = useState<FinSummary['summary'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ── Sub-list data ─────────────────────────────────────────────
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [teacherPayments, setTeacherPayments] = useState<TeacherPayment[]>([]);

    // ── Payment filter ────────────────────────────────────────────
    const [paymentCategory, setPaymentCategory] = useState('');

    // ── Modal states ──────────────────────────────────────────────
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showInvestmentModal, setShowInvestmentModal] = useState(false);
    const [showTeacherPaymentModal, setShowTeacherPaymentModal] = useState(false);

    // ── Form defaults ─────────────────────────────────────────────
    const emptyPaymentForm = () => ({
        student_id: '',
        description: '',
        amount: '',
        payment_method: 'pix',
        paid_at: nowISO(),
        category: 'material',
    });
    const [payForm, setPayForm] = useState(emptyPaymentForm());

    const emptyExpenseForm = () => ({
        description: '',
        amount: '',
        category: 'outro',
        due_date: new Date().toISOString().slice(0, 10),
        paid: false,
        expense_type: 'fixed',
    });
    const [expForm, setExpForm] = useState(emptyExpenseForm());

    const emptyInvestmentForm = () => ({
        description: '',
        amount: '',
        category: 'outro',
        purchased_at: new Date().toISOString().slice(0, 10),
        notes: '',
    });
    const [invForm, setInvForm] = useState(emptyInvestmentForm());

    const emptyTPForm = () => ({
        teacher_id: '',
        reference_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        amount: '',
        paid: false,
        notes: '',
    });
    const [tpForm, setTpForm] = useState(emptyTPForm());

    // ── Supporting data ───────────────────────────────────────────
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const { showToast, confirm } = useApp();

    // ── Submitting guard ──────────────────────────────────────────
    const [submitting, setSubmitting] = useState(false);

    // ── Load summary and students/teachers ──────────────────────────
    const loadSummary = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [s, st, te] = await Promise.all([
                fetchFinancialSummary(month, year),
                fetchStudents(),
                fetchTeachers(),
            ]);
            setSummary(s);
            setStudents(st);
            setTeachers(te);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados financeiros.');
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { loadSummary(); }, [loadSummary]);

    // ── Load sub-list based on active tab ───────────────────────────
    const loadSubList = useCallback(async () => {
        try {
            switch (activeTab) {
                case 'payments': {
                    const p = await fetchPayments(month, year, paymentCategory || undefined);
                    setPayments(p);
                    break;
                }
                case 'expenses': {
                    const e = await fetchExpenses(month, year);
                    setExpenses(e);
                    break;
                }
                case 'investments': {
                    const i = await fetchInvestments(month, year);
                    setInvestments(i);
                    break;
                }
                case 'teacher_payments': {
                    const tp = await fetchTeacherPayments(month, year);
                    setTeacherPayments(tp);
                    break;
                }
            }
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao carregar dados.', 'error');
        }
    }, [month, year, activeTab, paymentCategory]);

    useEffect(() => { loadSubList(); }, [loadSubList]);

    // ── Refresh all ──────────────────────────────────────────────
    const handleRefresh = () => {
        loadSummary();
        loadSubList();
    };

    // ══════════════════════════════════════════════════════════════════
    //  HANDLERS: Payments
    // ══════════════════════════════════════════════════════════════════

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createPayment({
                student_id: payForm.student_id || undefined,
                description: payForm.description,
                amount: parseCurrencyInput(payForm.amount),
                payment_method: payForm.payment_method,
                paid_at: payForm.paid_at || new Date().toISOString(),
                category: payForm.category,
            });
            showToast('Receita registrada com sucesso!');
            setShowPaymentModal(false);
            setPayForm(emptyPaymentForm());
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao registrar receita.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ══════════════════════════════════════════════════════════════════
    //  HANDLERS: Expenses
    // ══════════════════════════════════════════════════════════════════

    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

    const openExpenseEdit = (exp: Expense) => {
        setEditingExpenseId(exp.id);
        setExpForm({
            description: exp.description,
            amount: String(exp.amount).replace('.', ','),
            category: exp.category,
            due_date: exp.due_date,
            paid: exp.paid,
            expense_type: exp.expense_type,
        });
        setShowExpenseModal(true);
    };

    const handleSaveExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingExpenseId) {
                await updateExpense(editingExpenseId, {
                    description: expForm.description,
                    amount: parseCurrencyInput(expForm.amount),
                    category: expForm.category,
                    due_date: expForm.due_date,
                    paid: expForm.paid,
                    expense_type: expForm.expense_type,
                });
                showToast('Despesa atualizada!');
            } else {
                await createExpense({
                    description: expForm.description,
                    amount: parseCurrencyInput(expForm.amount),
                    category: expForm.category,
                    due_date: expForm.due_date,
                    paid: expForm.paid,
                    expense_type: expForm.expense_type,
                });
                showToast('Despesa registrada!');
            }
            setShowExpenseModal(false);
            setEditingExpenseId(null);
            setExpForm(emptyExpenseForm());
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao salvar despesa.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleExpensePaid = async (exp: Expense) => {
        try {
            await updateExpense(exp.id, { paid: !exp.paid });
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao atualizar despesa.', 'error');
        }
    };

    // ══════════════════════════════════════════════════════════════════
    //  HANDLERS: Investments
    // ══════════════════════════════════════════════════════════════════

    const handleCreateInvestment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createInvestment({
                description: invForm.description,
                amount: parseCurrencyInput(invForm.amount),
                category: invForm.category,
                purchased_at: invForm.purchased_at,
                notes: invForm.notes || undefined,
            });
            showToast('Investimento registrado!');
            setShowInvestmentModal(false);
            setInvForm(emptyInvestmentForm());
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao registrar investimento.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ══════════════════════════════════════════════════════════════════
    //  HANDLERS: Teacher Payments
    // ══════════════════════════════════════════════════════════════════

    const handleCreateTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createTeacherPayment({
                teacher_id: tpForm.teacher_id,
                reference_month: tpForm.reference_month,
                amount: parseCurrencyInput(tpForm.amount),
                paid: tpForm.paid,
                notes: tpForm.notes || undefined,
            });
            showToast('Pagamento registrado!');
            setShowTeacherPaymentModal(false);
            setTpForm(emptyTPForm());
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao registrar pagamento.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleTPaid = async (tp: TeacherPayment) => {
        try {
            await updateTeacherPayment(tp.id, { paid: !tp.paid });
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao atualizar pagamento.', 'error');
        }
    };

    const handleDeleteTP = async (id: string) => {
        const confirmed = await confirm({
            title: 'Excluir Pagamento',
            message: 'Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await deleteTeacherPayment(id);
            showToast('Pagamento excluído!');
            loadSubList();
            loadSummary();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao excluir.', 'error');
        }
    };

    // ══════════════════════════════════════════════════════════════════
    //  RENDER
    // ══════════════════════════════════════════════════════════════════

    return (
        <div className="fin-container">

            {/* Header */}
            <div className="fin-header">
                <div className="fin-header-left">
                    <h1>💰 Financeiro</h1>
                </div>
                <div className="fin-period-filter">
                    <label>Mês/Ano de Referência:</label>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                        {MONTHS.map(m => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))}>
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button className="fin-btn fin-btn-secondary" onClick={handleRefresh}>
                        ↻ Atualizar
                    </button>
                </div>
            </div>

            {/* KPIs */}
            {loading && !summary && (
                <div className="loading">Carregando indicadores...</div>
            )}
            {error && (
                <div className="error-banner" onClick={() => setError('')}>{error}</div>
            )}
            {summary && (
                <div className="fin-kpi-grid">
                    <div className="fin-kpi-card">
                        <div className="fin-kpi-label">Recebido no Mês</div>
                        <div className="fin-kpi-value good">{formatCurrency(summary.revenue)}</div>
                    </div>
                    <div className="fin-kpi-card">
                        <div className="fin-kpi-label">Pago no Mês</div>
                        <div className="fin-kpi-value warn">{formatCurrency(summary.outgoings)}</div>
                    </div>
                    <div className="fin-kpi-card">
                        <div className="fin-kpi-label">Saldo do Mês</div>
                        <div className={`fin-kpi-value ${summary.balance >= 0 ? 'good' : 'bad'}`}>
                            {formatCurrency(summary.balance)}
                        </div>
                    </div>
                    <div className="fin-kpi-card">
                        <div className="fin-kpi-label">Pendentes (Mensalidades)</div>
                        <div className="fin-kpi-value warn">{formatCurrency(summary.pending_tuitions)}</div>
                    </div>
                    <div className="fin-kpi-card">
                        <div className="fin-kpi-label">Alunos em Atraso</div>
                        <div className={`fin-kpi-value ${summary.overdue_students > 0 ? 'bad' : 'good'}`}>
                            {summary.overdue_students}
                        </div>
                    </div>
                    <div className="fin-kpi-card">
                        <div className="fin-kpi-label">A Pagar (Professores)</div>
                        <div className="fin-kpi-value warn">{formatCurrency(summary.pending_teacher_payments)}</div>
                    </div>
                </div>
            )}

            {/* Sub-tabs */}
            <div className="fin-sub-nav">
                {(Object.keys(TAB_LABELS) as FinTab[]).map(tab => (
                    <button
                        key={tab}
                        className={`fin-sub-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {TAB_LABELS[tab]}
                    </button>
                ))}
            </div>

            {/* ── Tab: Payments ─────────────────────────────────── */}
            {activeTab === 'payments' && (
                <div className="fin-tab-content">
                    <div className="fin-toolbar">
                        <select
                            value={paymentCategory}
                            onChange={e => setPaymentCategory(e.target.value)}
                            className="fin-select"
                        >
                            <option value="">Todas as categorias</option>
                            <option value="matricula">Matrícula</option>
                            <option value="material">Material</option>
                            <option value="aula_extra">Aula Extra</option>
                            <option value="outro">Outro</option>
                        </select>
                        <button className="fin-btn fin-btn-primary" onClick={() => setShowPaymentModal(true)}>
                            ➕ Novo Pagamento
                        </button>
                    </div>

                    {payments.length === 0 ? (
                        <div className="empty-state empty-state-sm">Nenhum pagamento avulso registrado neste mês.</div>
                    ) : (
                        <div className="fin-table-wrap">
                            <table className="fin-table">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Aluno</th>
                                        <th>Valor</th>
                                        <th>Categoria</th>
                                        <th>Forma</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id}>
                                            <td data-label="Descrição">{p.description}</td>
                                            <td data-label="Aluno">{p.students?.name || '—'}</td>
                                            <td data-label="Valor" className="fin-cell-currency">{formatCurrency(p.amount)}</td>
                                            <td data-label="Categoria">
                                                <span className="fin-pill">{p.category}</span>
                                            </td>
                                            <td data-label="Forma">{p.payment_method}</td>
                                            <td data-label="Data">{formatDateTime(p.paid_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Expenses ──────────────────────────────────── */}
            {activeTab === 'expenses' && (
                <div className="fin-tab-content">
                    <div className="fin-toolbar">
                        <div className="fin-toolbar-info">
                            {expenses.filter(e => !e.paid).length} pendente(s) · {expenses.filter(e => e.paid).length} paga(s)
                        </div>
                        <button className="fin-btn fin-btn-primary" onClick={() => {
                            setEditingExpenseId(null);
                            setExpForm(emptyExpenseForm());
                            setShowExpenseModal(true);
                        }}>
                            ➕ Novo Custo
                        </button>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="empty-state empty-state-sm">Nenhum custo registrado neste mês.</div>
                    ) : (
                        <div className="fin-table-wrap">
                            <table className="fin-table">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Categoria</th>
                                        <th>Vencimento</th>
                                        <th>Tipo</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(e => (
                                        <tr key={e.id} className={e.paid ? 'fin-row-paid' : ''}>
                                            <td data-label="Descrição">{e.description}</td>
                                            <td data-label="Valor" className="fin-cell-currency">{formatCurrency(e.amount)}</td>
                                            <td data-label="Categoria"><span className="fin-pill">{e.category}</span></td>
                                            <td data-label="Vencimento">{formatDate(e.due_date)}</td>
                                            <td data-label="Tipo">{e.expense_type === 'fixed' ? 'Fixo' : 'Variável'}</td>
                                            <td data-label="Status">
                                                <span className={`fin-status-pill ${e.paid ? 'fin-status-paid' : 'fin-status-pending'}`}>
                                                    {e.paid ? '✅ Pago' : '⏳ Pendente'}
                                                </span>
                                            </td>
                                            <td data-label="Ações">
                                                <div className="fin-actions">
                                                    <button
                                                        className="fin-btn-sm"
                                                        onClick={() => openExpenseEdit(e)}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className={`fin-btn-sm ${e.paid ? 'fin-btn-sm-undo' : 'fin-btn-sm-pay'}`}
                                                        onClick={() => handleToggleExpensePaid(e)}
                                                        title={e.paid ? 'Marcar como não pago' : 'Marcar como pago'}
                                                    >
                                                        {e.paid ? '↩️' : '✅'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Investments ───────────────────────────────── */}
            {activeTab === 'investments' && (
                <div className="fin-tab-content">
                    <div className="fin-toolbar">
                        <span className="fin-toolbar-info">
                            Total investido: <strong>{formatCurrency(investments.reduce((s, i) => s + i.amount, 0))}</strong>
                        </span>
                        <button className="fin-btn fin-btn-primary" onClick={() => {
                            setInvForm(emptyInvestmentForm());
                            setShowInvestmentModal(true);
                        }}>
                            ➕ Novo Investimento
                        </button>
                    </div>

                    {investments.length === 0 ? (
                        <div className="empty-state empty-state-sm">Nenhum investimento registrado neste mês.</div>
                    ) : (
                        <div className="fin-table-wrap">
                            <table className="fin-table">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Categoria</th>
                                        <th>Data</th>
                                        <th>Obs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {investments.map(i => (
                                        <tr key={i.id}>
                                            <td data-label="Descrição">{i.description}</td>
                                            <td data-label="Valor" className="fin-cell-currency">{formatCurrency(i.amount)}</td>
                                            <td data-label="Categoria"><span className="fin-pill">{i.category}</span></td>
                                            <td data-label="Data">{formatDate(i.purchased_at)}</td>
                                            <td data-label="Obs" className="fin-cell-notes">{i.notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Teacher Payments ──────────────────────────── */}
            {activeTab === 'teacher_payments' && (
                <div className="fin-tab-content">
                    <div className="fin-toolbar">
                        <span className="fin-toolbar-info">
                            {teacherPayments.filter(tp => !tp.paid).length} pendente(s)
                        </span>
                        <button className="fin-btn fin-btn-primary" onClick={() => {
                            setTpForm(emptyTPForm());
                            setShowTeacherPaymentModal(true);
                        }}>
                            ➕ Novo Pagamento
                        </button>
                    </div>

                    {teacherPayments.length === 0 ? (
                        <div className="empty-state empty-state-sm">Nenhum pagamento a professor registrado neste mês.</div>
                    ) : (
                        <div className="fin-table-wrap">
                            <table className="fin-table">
                                <thead>
                                    <tr>
                                        <th>Professor</th>
                                        <th>Mês Ref.</th>
                                        <th>Valor</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherPayments.map(tp => (
                                        <tr key={tp.id} className={tp.paid ? 'fin-row-paid' : ''}>
                                            <td data-label="Professor">
                                                <strong>{tp.teachers?.name || '—'}</strong>
                                                {tp.teachers?.specialty && (
                                                    <span className="fin-sub-text"> ({tp.teachers.specialty})</span>
                                                )}
                                            </td>
                                            <td data-label="Mês Ref.">{tp.reference_month}</td>
                                            <td data-label="Valor" className="fin-cell-currency">{formatCurrency(tp.amount)}</td>
                                            <td data-label="Status">
                                                <span className={`fin-status-pill ${tp.paid ? 'fin-status-paid' : 'fin-status-pending'}`}>
                                                    {tp.paid ? '✅ Pago' : '⏳ Pendente'}
                                                </span>
                                            </td>
                                            <td data-label="Ações">
                                                <div className="fin-actions">
                                                    <button
                                                        className={`fin-btn-sm ${tp.paid ? 'fin-btn-sm-undo' : 'fin-btn-sm-pay'}`}
                                                        onClick={() => handleToggleTPaid(tp)}
                                                        title={tp.paid ? 'Marcar como não pago' : 'Marcar como pago'}
                                                    >
                                                        {tp.paid ? '↩️' : '✅'}
                                                    </button>
                                                    <button
                                                        className="fin-btn-sm fin-btn-sm-danger"
                                                        onClick={() => handleDeleteTP(tp.id)}
                                                        title="Excluir"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                MODALS
                ══════════════════════════════════════════════════════════ */}

            {/* ── Payment Modal ─────────────────────────────────── */}
            {showPaymentModal && (
                <div className="fin-modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="fin-modal" onClick={e => e.stopPropagation()}>
                        <h2>Novo Pagamento Avulso</h2>
                        <form onSubmit={handleCreatePayment}>
                            <div className="fin-form-group">
                                <label>Aluno (opcional)</label>
                                <select value={payForm.student_id} onChange={e => setPayForm(f => ({ ...f, student_id: e.target.value }))}>
                                    <option value="">Nenhum / Externo</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="fin-form-group">
                                <label>Descrição *</label>
                                <input
                                    type="text"
                                    value={payForm.description}
                                    onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Ex: Apostila de Violão Vol 1"
                                    required
                                />
                            </div>
                            <div className="fin-form-row">
                                <div className="fin-form-group">
                                    <label>Valor (R$) *</label>
                                    <input
                                        type="text"
                                        value={payForm.amount}
                                        onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div className="fin-form-group">
                                    <label>Categoria *</label>
                                    <select value={payForm.category} onChange={e => setPayForm(f => ({ ...f, category: e.target.value }))}>
                                        <option value="material">Material</option>
                                        <option value="matricula">Matrícula</option>
                                        <option value="aula_extra">Aula Extra</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <div className="fin-form-row">
                                <div className="fin-form-group">
                                    <label>Forma de Pagamento *</label>
                                    <select value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}>
                                        <option value="pix">PIX</option>
                                        <option value="card">Cartão</option>
                                        <option value="money">Dinheiro</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                                <div className="fin-form-group">
                                    <label>Data de Recebimento</label>
                                    <input
                                        type="datetime-local"
                                        value={payForm.paid_at}
                                        onChange={e => setPayForm(f => ({ ...f, paid_at: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="fin-form-actions">
                                <button type="submit" className="fin-btn fin-btn-primary" disabled={submitting}>
                                    {submitting ? 'Salvando...' : 'Registrar Receita'}
                                </button>
                                <button type="button" className="fin-btn fin-btn-secondary" onClick={() => setShowPaymentModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Expense Modal ─────────────────────────────────── */}
            {showExpenseModal && (
                <div className="fin-modal-overlay" onClick={() => { setShowExpenseModal(false); setEditingExpenseId(null); }}>
                    <div className="fin-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingExpenseId ? 'Editar Despesa' : 'Novo Custo / Despesa'}</h2>
                        <form onSubmit={handleSaveExpense}>
                            <div className="fin-form-group">
                                <label>Descrição *</label>
                                <input
                                    type="text"
                                    value={expForm.description}
                                    onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Ex: Aluguel da Escola"
                                    required
                                />
                            </div>
                            <div className="fin-form-row">
                                <div className="fin-form-group">
                                    <label>Valor (R$) *</label>
                                    <input
                                        type="text"
                                        value={expForm.amount}
                                        onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div className="fin-form-group">
                                    <label>Categoria *</label>
                                    <select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
                                        <option value="aluguel">Aluguel</option>
                                        <option value="luz">Energia/Luz</option>
                                        <option value="agua">Água</option>
                                        <option value="material">Materiais</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <div className="fin-form-row">
                                <div className="fin-form-group">
                                    <label>Vencimento *</label>
                                    <input
                                        type="date"
                                        value={expForm.due_date}
                                        onChange={e => setExpForm(f => ({ ...f, due_date: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="fin-form-group">
                                    <label>Tipo</label>
                                    <select value={expForm.expense_type} onChange={e => setExpForm(f => ({ ...f, expense_type: e.target.value }))}>
                                        <option value="fixed">Fixo</option>
                                        <option value="variable">Variável</option>
                                    </select>
                                </div>
                            </div>
                            <label className="fin-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={expForm.paid}
                                    onChange={e => setExpForm(f => ({ ...f, paid: e.target.checked }))}
                                />
                                Já foi pago
                            </label>
                            <div className="fin-form-actions">
                                <button type="submit" className="fin-btn fin-btn-primary" disabled={submitting}>
                                    {submitting ? 'Salvando...' : editingExpenseId ? 'Atualizar' : 'Registrar'}
                                </button>
                                <button type="button" className="fin-btn fin-btn-secondary" onClick={() => { setShowExpenseModal(false); setEditingExpenseId(null); }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Investment Modal ───────────────────────────────── */}
            {showInvestmentModal && (
                <div className="fin-modal-overlay" onClick={() => setShowInvestmentModal(false)}>
                    <div className="fin-modal" onClick={e => e.stopPropagation()}>
                        <h2>Novo Investimento</h2>
                        <form onSubmit={handleCreateInvestment}>
                            <div className="fin-form-group">
                                <label>Descrição *</label>
                                <input
                                    type="text"
                                    value={invForm.description}
                                    onChange={e => setInvForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Ex: Aquisição de equipamento"
                                    required
                                />
                            </div>
                            <div className="fin-form-row">
                                <div className="fin-form-group">
                                    <label>Valor (R$) *</label>
                                    <input
                                        type="text"
                                        value={invForm.amount}
                                        onChange={e => setInvForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div className="fin-form-group">
                                    <label>Categoria</label>
                                    <select value={invForm.category} onChange={e => setInvForm(f => ({ ...f, category: e.target.value }))}>
                                        <option value="equipamento">Equipamento</option>
                                        <option value="infraestrutura">Infraestrutura</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <div className="fin-form-group">
                                <label>Data de Compra *</label>
                                <input
                                    type="date"
                                    value={invForm.purchased_at}
                                    onChange={e => setInvForm(f => ({ ...f, purchased_at: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="fin-form-group">
                                <label>Observações</label>
                                <textarea
                                    value={invForm.notes}
                                    onChange={e => setInvForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Notas internas..."
                                />
                            </div>
                            <div className="fin-form-actions">
                                <button type="submit" className="fin-btn fin-btn-primary" disabled={submitting}>
                                    {submitting ? 'Salvando...' : 'Registrar Investimento'}
                                </button>
                                <button type="button" className="fin-btn fin-btn-secondary" onClick={() => setShowInvestmentModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Teacher Payment Modal ─────────────────────────── */}
            {showTeacherPaymentModal && (
                <div className="fin-modal-overlay" onClick={() => setShowTeacherPaymentModal(false)}>
                    <div className="fin-modal" onClick={e => e.stopPropagation()}>
                        <h2>Novo Pagamento a Professor</h2>
                        <form onSubmit={handleCreateTP}>
                            <div className="fin-form-group">
                                <label>Professor *</label>
                                <select
                                    value={tpForm.teacher_id}
                                    onChange={e => setTpForm(f => ({ ...f, teacher_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {teachers.filter(t => t.active !== false).map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}{t.specialty ? ` (${t.specialty})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="fin-form-row">
                                <div className="fin-form-group">
                                    <label>Mês de Referência *</label>
                                    <input
                                        type="month"
                                        value={tpForm.reference_month}
                                        onChange={e => setTpForm(f => ({ ...f, reference_month: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="fin-form-group">
                                    <label>Valor (R$) *</label>
                                    <input
                                        type="text"
                                        value={tpForm.amount}
                                        onChange={e => setTpForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                            </div>
                            <label className="fin-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={tpForm.paid}
                                    onChange={e => setTpForm(f => ({ ...f, paid: e.target.checked }))}
                                />
                                Já foi pago
                            </label>
                            <div className="fin-form-group">
                                <label>Observações</label>
                                <textarea
                                    value={tpForm.notes}
                                    onChange={e => setTpForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Notas internas..."
                                />
                            </div>
                            <div className="fin-form-actions">
                                <button type="submit" className="fin-btn fin-btn-primary" disabled={submitting}>
                                    {submitting ? 'Salvando...' : 'Registrar'}
                                </button>
                                <button type="button" className="fin-btn fin-btn-secondary" onClick={() => setShowTeacherPaymentModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
