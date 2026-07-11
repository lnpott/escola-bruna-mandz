import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Enrollment } from '@/types';
import { DAY_LABELS } from '@/types';
import { fetchEnrollments, createEnrollment, updateEnrollment, deleteEnrollment, fetchStudents, fetchTeachers } from '@/services/api';
import type { Student, Teacher } from '@/types';
import '@/styles/enrollments.css';

const BILLING_TYPE_LABELS: Record<string, string> = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    full: 'Completo',
};

export default function Enrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        id: '',
        student_id: '',
        teacher_id: '',
        instrument: '',
        day_of_week: '',
        class_time: '',
        duration_minutes: 60,
        classes_per_week: 1,
        monthly_fee: 250,
        billing_type: 'monthly' as string,
        total_amount: '',
        installments: 1,
        status: 'active' as string,
        notes: '',
    });

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [enrs, studs, teachs] = await Promise.all([
                fetchEnrollments({ status: statusFilter || undefined }),
                fetchStudents(),
                fetchTeachers(),
            ]);
            setEnrollments(enrs);
            setStudents(studs);
            setTeachers(teachs);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar vínculos.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        if (!search) return enrollments;
        const q = search.toLowerCase();
        return enrollments.filter(e => {
            const studentName = e.students?.name?.toLowerCase() || '';
            const teacherName = e.teachers?.name?.toLowerCase() || '';
            const instrument = e.instrument?.toLowerCase() || '';
            return studentName.includes(q) || teacherName.includes(q) || instrument.includes(q);
        });
    }, [enrollments, search]);

    const openNew = () => {
        setForm({
            id: '',
            student_id: '',
            teacher_id: '',
            instrument: '',
            day_of_week: '',
            class_time: '',
            duration_minutes: 60,
            classes_per_week: 1,
            monthly_fee: 250,
            billing_type: 'monthly',
            total_amount: '',
            installments: 1,
            status: 'active',
            notes: '',
        });
        setShowModal(true);
    };

    const openEdit = (enr: Enrollment) => {
        setForm({
            id: enr.id,
            student_id: enr.student_id,
            teacher_id: enr.teacher_id || '',
            instrument: enr.instrument || '',
            day_of_week: enr.day_of_week || '',
            class_time: enr.class_time || '',
            duration_minutes: enr.duration_minutes,
            classes_per_week: enr.classes_per_week,
            monthly_fee: enr.monthly_fee,
            billing_type: enr.billing_type,
            total_amount: enr.total_amount ? String(enr.total_amount) : '',
            installments: enr.installments,
            status: enr.status,
            notes: enr.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.student_id) {
            showToast('Selecione um aluno.');
            return;
        }
        if (form.billing_type === 'full' && (!form.total_amount || Number(form.total_amount) <= 0)) {
            showToast('Para cobrança completa, informe o valor total.');
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                student_id: form.student_id,
                teacher_id: form.teacher_id || null,
                instrument: form.instrument || null,
                day_of_week: form.day_of_week || null,
                class_time: form.class_time || null,
                duration_minutes: form.duration_minutes,
                classes_per_week: form.classes_per_week,
                monthly_fee: form.monthly_fee,
                billing_type: form.billing_type,
                status: form.status,
                notes: form.notes || null,
            };
            if (form.billing_type === 'full') {
                payload.total_amount = Number(form.total_amount);
                payload.installments = form.installments;
            }

            if (form.id) {
                await updateEnrollment(form.id, payload);
                showToast('Vínculo atualizado!');
            } else {
                await createEnrollment(payload);
                showToast('Vínculo criado!');
            }
            setShowModal(false);
            load();
        } catch (err: any) {
            showToast(err.message || 'Erro ao salvar vínculo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este vínculo?')) return;
        try {
            await deleteEnrollment(id);
            showToast('Vínculo excluído.');
            load();
        } catch (err: any) {
            showToast(err.message || 'Erro ao excluir vínculo.');
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'status-approved';
            case 'inactive': return 'status-warn';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return '✅ Ativo';
            case 'inactive': return '⏸️ Inativo';
            case 'cancelled': return '❌ Cancelado';
            default: return status;
        }
    };

    const studentOptions = useMemo(() => {
        return students.filter(s => s.active);
    }, [students]);

    const teacherOptions = useMemo(() => {
        return teachers.filter(t => t.active);
    }, [teachers]);

    const renderDay = (day: string | undefined | null) => {
        if (!day) return '—';
        return DAY_LABELS[day] || day;
    };

    return (
        <div className="enrollments-page">
            {toast && <div className="enrollments-toast">{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📚 Matrículas / Vínculos</h1>
                <Link to="/" className="legacy-link">← Voltar</Link>
            </div>

            {/* Toolbar */}
            <div className="enrollments-toolbar">
                <input
                    type="text"
                    placeholder="Buscar por aluno, professor ou instrumento..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="enrollments-search"
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="enrollments-filter"
                >
                    <option value="">Todos os status</option>
                    <option value="active">✅ Ativo</option>
                    <option value="inactive">⏸️ Inativo</option>
                    <option value="cancelled">❌ Cancelado</option>
                </select>
                <button className="enrollments-btn-new" onClick={openNew}>
                    ➕ Novo Vínculo
                </button>
            </div>

            {/* Error */}
            {error && <div className="enrollments-error">{error}</div>}

            {/* Loading */}
            {loading ? (
                <div className="enrollments-loading">Carregando vínculos...</div>
            ) : filtered.length === 0 ? (
                <div className="enrollments-empty">
                    {search || statusFilter
                        ? 'Nenhum vínculo encontrado com esses filtros.'
                        : 'Nenhum vínculo cadastrado. Clique em "Novo Vínculo" para começar.'}
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="enrollments-table-wrapper">
                        <table className="enrollments-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Professor</th>
                                    <th>Instrumento</th>
                                    <th>Dia/Horário</th>
                                    <th>Valor</th>
                                    <th>Cobrança</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(enr => (
                                    <tr key={enr.id}>
                                        <td data-label="Aluno"><strong>{enr.students?.name || '—'}</strong></td>
                                        <td data-label="Professor">{enr.teachers?.name || '—'}</td>
                                        <td data-label="Instrumento">{enr.instrument || '—'}</td>
                                        <td data-label="Dia/Horário">
                                            {renderDay(enr.day_of_week)}
                                            {enr.class_time ? ` ${enr.class_time}` : ''}
                                        </td>
                                        <td data-label="Valor" className="td-currency">
                                            R$ {enr.monthly_fee.toFixed(2)}
                                        </td>
                                        <td data-label="Cobrança">{BILLING_TYPE_LABELS[enr.billing_type] || enr.billing_type}</td>
                                        <td data-label="Status">
                                            <span className={`status-pill ${getStatusClass(enr.status)}`}>
                                                {getStatusLabel(enr.status)}
                                            </span>
                                        </td>
                                        <td data-label="Ações">
                                            <div className="enrollments-actions">
                                                <button className="btn-action-small" onClick={() => openEdit(enr)} title="Editar">✏️</button>
                                                <button className="btn-action-small" onClick={() => handleDelete(enr.id)} title="Excluir">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="enrollments-cards">
                        {filtered.map(enr => (
                            <div key={enr.id} className="enrollment-card">
                                <div className="enrollment-card-header">
                                    <strong>{enr.students?.name || '—'}</strong>
                                    <span className={`status-pill ${getStatusClass(enr.status)}`}>
                                        {getStatusLabel(enr.status)}
                                    </span>
                                </div>
                                <div className="enrollment-card-body">
                                    <div className="card-row"><span>Professor:</span> {enr.teachers?.name || '—'}</div>
                                    <div className="card-row"><span>Instrumento:</span> {enr.instrument || '—'}</div>
                                    <div className="card-row"><span>Horário:</span> {renderDay(enr.day_of_week)} {enr.class_time || ''}</div>
                                    <div className="card-row"><span>Valor:</span> R$ {enr.monthly_fee.toFixed(2)}</div>
                                    <div className="card-row"><span>Cobrança:</span> {BILLING_TYPE_LABELS[enr.billing_type] || enr.billing_type}</div>
                                </div>
                                <div className="enrollment-card-actions">
                                    <button onClick={() => openEdit(enr)} title="Editar">✏️ Editar</button>
                                    <button onClick={() => handleDelete(enr.id)} title="Excluir">🗑️ Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="enrollments-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="enrollments-modal" onClick={e => e.stopPropagation()}>
                        <div className="enrollments-modal-header">
                            <h3>{form.id ? '✏️ Editar Vínculo' : '➕ Novo Vínculo'}</h3>
                            <button className="enrollments-modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="enrollments-modal-body">
                            <div className="enrollments-form-grid">
                                <div className="form-group form-group-full">
                                    <label>Aluno *</label>
                                    <select
                                        value={form.student_id}
                                        onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                                    >
                                        <option value="">— Selecione um aluno —</option>
                                        {studentOptions.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Professor</label>
                                    <select
                                        value={form.teacher_id}
                                        onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                                    >
                                        <option value="">— Sem professor —</option>
                                        {teacherOptions.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Instrumento</label>
                                    <select
                                        value={form.instrument}
                                        onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))}
                                    >
                                        <option value="">— Selecione —</option>
                                        <option value="Piano">Piano</option>
                                        <option value="Teclado">Teclado</option>
                                        <option value="Violão">Violão</option>
                                        <option value="Guitarra">Guitarra</option>
                                        <option value="Baixo">Baixo</option>
                                        <option value="Bateria">Bateria</option>
                                        <option value="Canto">Canto</option>
                                        <option value="Violino">Violino</option>
                                        <option value="Flauta">Flauta</option>
                                        <option value="Saxofone">Saxofone</option>
                                        <option value="Teoria Musical">Teoria Musical</option>
                                        <option value="Musicalização Infantil">Musicalização Infantil</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Dia da Semana</label>
                                    <select
                                        value={form.day_of_week}
                                        onChange={e => setForm(f => ({ ...f, day_of_week: e.target.value }))}
                                    >
                                        <option value="">— Selecione —</option>
                                        <option value="seg">Segunda</option>
                                        <option value="ter">Terça</option>
                                        <option value="qua">Quarta</option>
                                        <option value="qui">Quinta</option>
                                        <option value="sex">Sexta</option>
                                        <option value="sab">Sábado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Horário</label>
                                    <input
                                        type="time"
                                        value={form.class_time}
                                        onChange={e => setForm(f => ({ ...f, class_time: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duração (min)</label>
                                    <input
                                        type="number"
                                        min={15}
                                        max={240}
                                        step={5}
                                        value={form.duration_minutes}
                                        onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Aulas/Semana</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={7}
                                        value={form.classes_per_week}
                                        onChange={e => setForm(f => ({ ...f, classes_per_week: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Valor Mensal (R$)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={form.monthly_fee}
                                        onChange={e => setForm(f => ({ ...f, monthly_fee: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipo de Cobrança</label>
                                    <select
                                        value={form.billing_type}
                                        onChange={e => setForm(f => ({ ...f, billing_type: e.target.value }))}
                                    >
                                        <option value="monthly">📆 Mensal</option>
                                        <option value="weekly">📅 Semanal</option>
                                        <option value="full">🎯 Completo (curso fechado)</option>
                                    </select>
                                </div>
                                {form.billing_type === 'full' && (
                                    <>
                                        <div className="form-group">
                                            <label>Valor Total (R$)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={form.total_amount}
                                                onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Parcelas</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={24}
                                                value={form.installments}
                                                onChange={e => setForm(f => ({ ...f, installments: Number(e.target.value) }))}
                                            />
                                        </div>
                                    </>
                                )}
                                {form.id && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={form.status}
                                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        >
                                            <option value="active">✅ Ativo</option>
                                            <option value="inactive">⏸️ Inativo</option>
                                            <option value="cancelled">❌ Cancelado</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group form-group-full">
                                    <label>Observações</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="enrollments-form-info">
                                💡 Para gerenciar aulas individuais, use o <Link to="/agenda">📅 Agenda</Link>.
                            </div>
                            <div className="enrollments-form-actions">
                                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button
                                    className="btn-save"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando...' : form.id ? 'Salvar Alterações' : 'Criar Vínculo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
