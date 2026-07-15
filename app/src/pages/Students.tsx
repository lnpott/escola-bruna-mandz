import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import {
    Student,
    StudentStatus,
    StudentSource,
    STATUS_LABELS,
    STATUS_CLASSES,
    STATUS_ICONS,
    SOURCE_LABELS,
} from '@/types';
import { fetchStudents, createStudent, updateStudent, deleteStudent, fetchTeachers, createEnrollment } from '@/services/api';
import '@/styles/students.css';

const STATUS_OPTIONS: { value: StudentStatus; label: string }[] = [
    { value: 'lead', label: '📋 Lead (Primeiro Contato)' },
    { value: 'interested', label: '🔍 Interessado' },
    { value: 'enrolled', label: '📝 Matriculado' },
    { value: 'active', label: '✅ Ativo' },
    { value: 'suspended', label: '⏸️ Trancado' },
    { value: 'completed', label: '🎓 Concluído' },
    { value: 'cancelled', label: '❌ Cancelado' },
];

const SOURCE_OPTIONS: { value: StudentSource; label: string }[] = [
    { value: '', label: 'Não informado' },
    { value: 'website', label: '🌐 Site/Google' },
    { value: 'indicacao', label: '👥 Indicação' },
    { value: 'social', label: '📱 Redes Sociais' },
    { value: 'presencial', label: '🏫 Presencial' },
    { value: 'outro', label: '🔄 Outro' },
];

const INSTRUMENTS = [
    'Piano', 'Teclado', 'Violão', 'Guitarra', 'Baixo', 'Bateria',
    'Canto', 'Violino', 'Viola', 'Violoncelo', 'Saxofone', 'Flauta',
    'Ukulele', 'Cavaquinho', 'Acordeon', 'Musicalização Infantil', 'Teoria Musical',
];

interface StudentForm {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    address: string;
    status: StudentStatus;
    source: StudentSource;
    instruments: string;
    guardian_name: string;
    guardian_cpf: string;
    guardian_phone: string;
    // Enrollment fields
    enroll_teacher_id: string;
    enroll_day_of_week: string;
    enroll_class_time: string;
    enroll_duration: number;
    enroll_monthly_fee: string;
    enroll_billing_type: 'weekly' | 'monthly' | 'full';
}

const emptyForm: StudentForm = {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    source: '',
    instruments: '',
    guardian_name: '',
    guardian_cpf: '',
    guardian_phone: '',
    enroll_teacher_id: '',
    enroll_day_of_week: '',
    enroll_class_time: '',
    enroll_duration: 60,
    enroll_monthly_fee: '',
    enroll_billing_type: 'monthly',
};

const DAY_OPTIONS = [
    { value: 'seg', label: 'Segunda' },
    { value: 'ter', label: 'Terça' },
    { value: 'qua', label: 'Quarta' },
    { value: 'qui', label: 'Quinta' },
    { value: 'sex', label: 'Sexta' },
    { value: 'sab', label: 'Sábado' },
];

const BILLING_OPTIONS = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'full', label: 'Semestral/Anual' },
];

export default function Students() {
    const { confirm, showToast } = useApp();
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<StudentForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadStudents = useCallback(async () => {
        try {
            setLoading(true);
            const [data, teacherData] = await Promise.all([
                fetchStudents(),
                fetchTeachers(),
            ]);
            setStudents(data);
            setTeachers(teacherData.map(t => ({ id: t.id, name: t.name })));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    // ── Filter ───────────────────────────────────────────────
    const filtered = students.filter((s) => {
        const matchesSearch =
            !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.phone || '').includes(search);
        const matchesStatus = !statusFilter || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // ── Modal ────────────────────────────────────────────────
    function openNew() {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(true);
    }

    function openEdit(student: Student) {
        setForm({
            name: student.name,
            cpf: student.cpf || '',
            email: student.email || '',
            phone: student.phone || '',
            address: student.address || '',
            status: student.status,
            source: (student.source as StudentSource) || '',
            instruments: student.instruments || '',
            guardian_name: student.guardian_name || '',
            guardian_cpf: student.guardian_cpf || '',
            guardian_phone: student.guardian_phone || '',
            enroll_teacher_id: '',
            enroll_day_of_week: '',
            enroll_class_time: '',
            enroll_duration: 60,
            enroll_monthly_fee: '',
            enroll_billing_type: 'monthly',
        });
        setEditingId(student.id);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
    }

    function updateField<K extends keyof StudentForm>(key: K, value: StudentForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) return;

        setSaving(true);
        try {
            const { enroll_teacher_id, enroll_day_of_week, enroll_class_time, enroll_duration, enroll_monthly_fee, enroll_billing_type, ...studentPayload } = form;

            // Parse BRL currency: "1.500,00" → 1500.00
            const parseBRL = (val: string): number => {
                const cleaned = val.replace(/\./g, '').replace(',', '.');
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
            };

            if (editingId) {
                await updateStudent(editingId, studentPayload);
                showToast('Aluno atualizado!');
            } else {
                const created = await createStudent(studentPayload);
                const monthlyFee = parseBRL(enroll_monthly_fee);
                // Create enrollment if fields are filled
                if (enroll_teacher_id && monthlyFee > 0) {
                    try {
                        await createEnrollment({
                            student_id: created.id,
                            teacher_id: enroll_teacher_id || undefined,
                            instrument: studentPayload.instruments?.split(',')[0]?.trim() || undefined,
                            day_of_week: enroll_day_of_week || undefined,
                            class_time: enroll_class_time || undefined,
                            duration_minutes: enroll_duration,
                            monthly_fee: monthlyFee,
                            billing_type: enroll_billing_type,
                            classes_per_week: 1,
                            installments: 1,
                            status: 'active',
                        });
                        showToast('Aluno e matrícula criados com sucesso!');
                    } catch (enrErr: unknown) {
                        showToast(
                            'Aluno criado, mas erro ao criar matrícula: ' + (enrErr instanceof Error ? enrErr.message : 'erro'),
                            'error'
                        );
                    }
                } else {
                    showToast('Aluno criado!');
                }
            }
            closeModal();
            await loadStudents();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await confirm({
            title: 'Excluir Aluno',
            message: `Tem certeza que deseja excluir ${students.find(s => s.id === id)?.name || 'este aluno'}? Esta ação não pode ser desfeita.`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await deleteStudent(id);
            await loadStudents();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
    }

    // ── CSV Export ─────────────────────────────────────────
    function exportCSV() {
        const header = 'Nome,CPF,E-mail,Telefone,Instrumento,Status,Origem,Responsável';
        const rows = filtered.map(s => [
            s.name,
            s.cpf || '',
            s.email || '',
            s.phone || '',
            (s.instruments || '').replace(/,/g, ';'),
            STATUS_LABELS[s.status] || s.status,
            s.source ? SOURCE_LABELS[s.source] || s.source : '',
            s.guardian_name || '',
        ].join(',')).join('\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alunos-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── Render ───────────────────────────────────────────────
    if (loading && !students.length) {
        return <div className="students-page"><div className="loading">Carregando alunos...</div></div>;
    }

    return (
        <div className="students-page">
            <div className="students-header">
                <h1>🎓 Alunos</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    {filtered.length > 0 && (
                        <button className="btn-secondary" onClick={exportCSV} title="Exportar CSV">
                            ⬇ CSV
                        </button>
                    )}
                    <button className="btn-primary" onClick={openNew}>
                        ➕ Novo Aluno
                    </button>
                </div>
            </div>

            {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}

            <div className="students-filters">
                <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou telefone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StudentStatus | '')}
                >
                    <option value="">Todos os status</option>
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <span className="students-count">{filtered.length} aluno(s)</span>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    {search || statusFilter
                        ? 'Nenhum aluno encontrado com esses filtros.'
                        : 'Nenhum aluno cadastrado. Clique em "Novo Aluno" para começar.'}
                </div>
            ) : (
                <div className="students-table-wrapper">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                <th>Instrumento</th>
                                <th>Status</th>
                                <th>Origem</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.id} className="student-row-clickable" onClick={() => navigate(`/academico/aluno/${s.id}`)}>
                                    <td data-label="Nome">
                                        <strong>{s.name}</strong>
                                        {s.guardian_name && <div className="student-guardian-hint">Resp: {s.guardian_name}</div>}
                                    </td>
                                    <td data-label="CPF">{s.cpf || '—'}</td>
                                    <td data-label="E-mail">{s.email || '—'}</td>
                                    <td data-label="Telefone">{s.phone || '—'}</td>
                                    <td data-label="Instrumento">{s.instruments || '—'}</td>
                                    <td data-label="Status">
                                        <span
                                            className={`status-pill ${STATUS_CLASSES[s.status] || 'status-pending'}`}
                                            title={STATUS_LABELS[s.status]}
                                        >
                                            {STATUS_ICONS[s.status]} {STATUS_LABELS[s.status]}
                                        </span>
                                    </td>
                                    <td data-label="Origem">
                                        <span className="source-badge">
                                            {s.source ? SOURCE_LABELS[s.source] || s.source : '—'}
                                        </span>
                                    </td>
                                    <td data-label="Ações" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="btn-action"
                                            onClick={() => openEdit(s)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-action btn-action-danger"
                                            onClick={() => handleDelete(s.id)}
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                        <button
                                            className="btn-action"
                                            onClick={() => navigate(`/academico/aluno/${s.id}`)}
                                            title="Detalhes"
                                        >
                                            📋
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal ──────────────────────────────────── */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Editar Aluno' : 'Novo Aluno'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="form-field full-width">
                                    <label>Nome *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={form.cpf}
                                        onChange={(e) => updateField('cpf', e.target.value)}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>E-mail</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(XX) XXXXX-XXXX"
                                        value={form.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Endereço</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                    />
                                </div>

                                <div className="form-field full-width">
                                    <label>Instrumento(s)</label>
                                    <div className="instruments-checkbox-group">
                                        {INSTRUMENTS.map((inst) => {
                                            const selected = form.instruments.split(',').map(s => s.trim()).includes(inst);
                                            return (
                                                <label key={inst} className={`instrument-chip ${selected ? 'selected' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => {
                                                            const current = form.instruments.split(',').map(s => s.trim()).filter(Boolean);
                                                            const updated = selected
                                                                ? current.filter(i => i !== inst)
                                                                : [...current, inst];
                                                            updateField('instruments', updated.join(', '));
                                                        }}
                                                    />
                                                    {inst}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Status do Aluno</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => updateField('status', e.target.value as StudentStatus)}
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Origem do Lead</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => updateField('source', e.target.value as StudentSource)}
                                    >
                                        {SOURCE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Matrícula (apenas na criação) */}
                            {!editingId && (
                                <div className="form-section">
                                    <h3>📚 Matrícula (opcional)</h3>
                                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 12 }}>
                                        Preencha para criar a matrícula junto com o aluno.
                                    </p>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Professor</label>
                                            <select
                                                value={form.enroll_teacher_id}
                                                onChange={e => updateField('enroll_teacher_id', e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label>Dia da Semana</label>
                                            <select
                                                value={form.enroll_day_of_week}
                                                onChange={e => updateField('enroll_day_of_week', e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {DAY_OPTIONS.map(d => (
                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label>Horário</label>
                                            <input
                                                type="time"
                                                value={form.enroll_class_time}
                                                onChange={e => updateField('enroll_class_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Duração (min)</label>
                                            <select
                                                value={form.enroll_duration}
                                                onChange={e => updateField('enroll_duration', Number(e.target.value))}
                                            >
                                                <option value={30}>30 min</option>
                                                <option value={45}>45 min</option>
                                                <option value={60}>60 min</option>
                                                <option value={90}>90 min</option>
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label>Valor Mensal (R$)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0,00"
                                                value={form.enroll_monthly_fee}
                                                onChange={e => updateField('enroll_monthly_fee', e.target.value.replace(/[^0-9,]/g, ''))}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Tipo de Cobrança</label>
                                            <select
                                                value={form.enroll_billing_type}
                                                onChange={e => updateField('enroll_billing_type', e.target.value as 'weekly' | 'monthly' | 'full')}
                                            >
                                                {BILLING_OPTIONS.map(b => (
                                                    <option key={b.value} value={b.value}>{b.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Responsável */}
                            <div className="form-section">
                                <h3>Responsável (se menor)</h3>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Nome do Responsável</label>
                                        <input
                                            type="text"
                                            placeholder="Nome"
                                            value={form.guardian_name}
                                            onChange={(e) => updateField('guardian_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>CPF do Responsável</label>
                                        <input
                                            type="text"
                                            placeholder="000.000.000-00"
                                            value={form.guardian_cpf}
                                            onChange={(e) => updateField('guardian_cpf', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Telefone do Responsável</label>
                                        <input
                                            type="text"
                                            placeholder="(XX) XXXXX-XXXX"
                                            value={form.guardian_phone}
                                            onChange={(e) => updateField('guardian_phone', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={closeModal}>
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
