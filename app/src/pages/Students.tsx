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

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
    // Wizard state
    wizard_already_enrolled: boolean | null;
    wizard_enroll_instrument: string;
    wizard_has_teacher: boolean | null;
    wizard_schedule_first: boolean;
    wizard_first_lesson_date: string;
    wizard_first_lesson_time: string;
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
    wizard_already_enrolled: null,
    wizard_enroll_instrument: '',
    wizard_has_teacher: null,
    wizard_schedule_first: false,
    wizard_first_lesson_date: '',
    wizard_first_lesson_time: '',
};

// Parse BRL currency: "1.500,00" → 1500.00
const parseBRL = (val: string): number => {
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
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
    const navigate = useNavigate();
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
    const [wizardStep, setWizardStep] = useState<WizardStep>(1);

    // ── Wizard helpers ─────────────────────────────────────────
    const WIZARD_STEPS: { step: WizardStep; label: string }[] = [
        { step: 1, label: 'Dados do Aluno' },
        { step: 2, label: 'Matrícula' },
        { step: 3, label: 'Instrumento' },
        { step: 4, label: 'Professor' },
        { step: 5, label: 'Dia e Horário' },
        { step: 6, label: 'Valor' },
        { step: 7, label: '1ª Aula' },
        { step: 8, label: 'Confirmação' },
    ];

    function canGoNext(): boolean {
        switch (wizardStep) {
            case 1: return form.name.trim().length > 0;
            case 2: return form.wizard_already_enrolled !== null;
            case 3: return !!form.wizard_enroll_instrument;
            case 4: return true; // professor is optional
            case 5: return !!form.enroll_day_of_week && !!form.enroll_class_time;
            case 6: return parseBRL(form.enroll_monthly_fee) > 0;
            case 7: return true; // scheduling is optional
            case 8: return true; // confirmation
        }
    }

    function nextStep() {
        if (wizardStep === 2 && form.wizard_already_enrolled === false) {
            // Skip to confirmation — not enrolled, just basic student
            setWizardStep(8);
            return;
        }
        if (wizardStep < 8) setWizardStep((wizardStep + 1) as WizardStep);
    }

    function prevStep() {
        if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep);
    }

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
        setWizardStep(1);
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

    async function handleWizardSave() {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const wizardKeys = ['wizard_already_enrolled', 'wizard_enroll_instrument', 'wizard_has_teacher', 'wizard_schedule_first', 'wizard_first_lesson_date', 'wizard_first_lesson_time', 'enroll_teacher_id', 'enroll_day_of_week', 'enroll_class_time', 'enroll_duration', 'enroll_monthly_fee', 'enroll_billing_type'] as const;
            const studentPayload = Object.fromEntries(
                Object.entries(form).filter(([k]) => !wizardKeys.includes(k as any))
            ) as any;
            const created = await createStudent(studentPayload);

            // Create enrollment if wizard says enrolled and has instrument
            if (form.wizard_already_enrolled && form.wizard_enroll_instrument) {
                const monthlyFee = parseBRL(form.enroll_monthly_fee);
                await createEnrollment({
                    student_id: created.id,
                    teacher_id: form.enroll_teacher_id || undefined,
                    instrument: form.wizard_enroll_instrument,
                    day_of_week: form.enroll_day_of_week || undefined,
                    class_time: form.enroll_class_time || undefined,
                    duration_minutes: form.enroll_duration,
                    monthly_fee: monthlyFee || 0,
                    billing_type: form.enroll_billing_type,
                    classes_per_week: 1,
                    installments: 1,
                    status: 'active',
                    notes: form.wizard_schedule_first
                        ? `1ª aula agendada para ${form.wizard_first_lesson_date} às ${form.wizard_first_lesson_time}`
                        : undefined,
                });
            }

            showToast('Aluno criado com sucesso!');
            closeModal();
            await loadStudents();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setSaving(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) return;
        // Editing uses simple save
        if (editingId) {
            setSaving(true);
            try {
                const { wizard_already_enrolled: _, wizard_enroll_instrument: __, wizard_has_teacher: ___, wizard_schedule_first: ____, wizard_first_lesson_date: _____, wizard_first_lesson_time: ______, enroll_teacher_id: a, enroll_day_of_week: b, enroll_class_time: c, enroll_duration: d, enroll_monthly_fee: e, enroll_billing_type: f, ...studentPayload } = form;
                await updateStudent(editingId, studentPayload);
                showToast('Aluno atualizado!');
                closeModal();
                await loadStudents();
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setSaving(false);
            }
            return;
        }
        // Creation uses wizard
        await handleWizardSave();
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
                    <div className="modal-content wizard-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Wizard Step Indicator (só na criação) */}
                        {!editingId && (
                            <div className="wizard-steps">
                                {WIZARD_STEPS.filter(s => !(s.step >= 3 && form.wizard_already_enrolled === false)).map(s => (
                                    <div key={s.step} className={`wizard-step ${wizardStep === s.step ? 'active' : wizardStep > s.step ? 'done' : ''}`}>
                                        <div className="wizard-step-circle">
                                            {wizardStep > s.step ? '✓' : s.step}
                                        </div>
                                        <span className="wizard-step-label">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <h2>{editingId ? '✏️ Editar Aluno' : '🎓 Novo Aluno'}</h2>
                        <form onSubmit={handleSave}>
                            {/* ══ EDIT MODE: Flat form ══ */}
                            {editingId ? (
                                <>
                                    <div className="form-grid">
                                        <div className="form-field full-width">
                                            <label>Nome *</label>
                                            <input type="text" required value={form.name}
                                                onChange={(e) => updateField('name', e.target.value)} />
                                        </div>
                                        <div className="form-field">
                                            <label>CPF</label>
                                            <input type="text" placeholder="000.000.000-00" value={form.cpf}
                                                onChange={(e) => updateField('cpf', e.target.value)} />
                                        </div>
                                        <div className="form-field">
                                            <label>E-mail</label>
                                            <input type="email" value={form.email}
                                                onChange={(e) => updateField('email', e.target.value)} />
                                        </div>
                                        <div className="form-field">
                                            <label>Telefone</label>
                                            <input type="text" placeholder="(XX) XXXXX-XXXX" value={form.phone}
                                                onChange={(e) => updateField('phone', e.target.value)} />
                                        </div>
                                        <div className="form-field">
                                            <label>Endereço</label>
                                            <input type="text" value={form.address}
                                                onChange={(e) => updateField('address', e.target.value)} />
                                        </div>
                                        <div className="form-field full-width">
                                            <label>Instrumento(s)</label>
                                            <div className="instruments-checkbox-group">
                                                {INSTRUMENTS.map((inst) => {
                                                    const selected = form.instruments.split(',').map(s => s.trim()).includes(inst);
                                                    return (
                                                        <label key={inst} className={`instrument-chip ${selected ? 'selected' : ''}`}>
                                                            <input type="checkbox" checked={selected}
                                                                onChange={() => {
                                                                    const current = form.instruments.split(',').map(s => s.trim()).filter(Boolean);
                                                                    updateField('instruments', (selected ? current.filter(i => i !== inst) : [...current, inst]).join(', '));
                                                                }} />
                                                            {inst}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label>Status</label>
                                            <select value={form.status}
                                                onChange={(e) => updateField('status', e.target.value as StudentStatus)}>
                                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label>Origem</label>
                                            <select value={form.source}
                                                onChange={(e) => updateField('source', e.target.value as StudentSource)}>
                                                {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-section">
                                        <h3>Responsável (se menor)</h3>
                                        <div className="form-grid">
                                            <div className="form-field">
                                                <label>Nome</label>
                                                <input type="text" placeholder="Nome" value={form.guardian_name}
                                                    onChange={(e) => updateField('guardian_name', e.target.value)} />
                                            </div>
                                            <div className="form-field">
                                                <label>CPF</label>
                                                <input type="text" placeholder="000.000.000-00" value={form.guardian_cpf}
                                                    onChange={(e) => updateField('guardian_cpf', e.target.value)} />
                                            </div>
                                            <div className="form-field">
                                                <label>Telefone</label>
                                                <input type="text" placeholder="(XX) XXXXX-XXXX" value={form.guardian_phone}
                                                    onChange={(e) => updateField('guardian_phone', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-actions">
                                        <button type="submit" className="btn-primary" disabled={saving}>
                                            {saving ? 'Salvando...' : 'Salvar'}
                                        </button>
                                        <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                                    </div>
                                </>
                            ) : (
                                /* ══ WIZARD MODE ══ */
                                <>
                                    {/* Step 1: Dados do Aluno */}
                                    {wizardStep === 1 && (
                                        <div className="wizard-step-content">
                                            <p className="wizard-desc">Informe os dados básicos do aluno.</p>
                                            <div className="form-grid">
                                                <div className="form-field full-width">
                                                    <label>Nome completo *</label>
                                                    <input type="text" required value={form.name}
                                                        onChange={(e) => updateField('name', e.target.value)}
                                                        placeholder="Nome do aluno" autoFocus />
                                                </div>
                                                <div className="form-field">
                                                    <label>CPF</label>
                                                    <input type="text" placeholder="000.000.000-00" value={form.cpf}
                                                        onChange={(e) => updateField('cpf', e.target.value)} />
                                                </div>
                                                <div className="form-field">
                                                    <label>E-mail</label>
                                                    <input type="email" value={form.email}
                                                        onChange={(e) => updateField('email', e.target.value)} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Telefone</label>
                                                    <input type="text" placeholder="(XX) XXXXX-XXXX" value={form.phone}
                                                        onChange={(e) => updateField('phone', e.target.value)} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Endereço</label>
                                                    <input type="text" value={form.address}
                                                        onChange={(e) => updateField('address', e.target.value)} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Origem</label>
                                                    <select value={form.source}
                                                        onChange={(e) => updateField('source', e.target.value as StudentSource)}>
                                                        {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-section">
                                                <h3>👤 Responsável (se menor)</h3>
                                                <div className="form-grid">
                                                    <div className="form-field">
                                                        <label>Nome</label>
                                                        <input type="text" placeholder="Nome" value={form.guardian_name}
                                                            onChange={(e) => updateField('guardian_name', e.target.value)} />
                                                    </div>
                                                    <div className="form-field">
                                                        <label>CPF</label>
                                                        <input type="text" placeholder="000.000.000-00" value={form.guardian_cpf}
                                                            onChange={(e) => updateField('guardian_cpf', e.target.value)} />
                                                    </div>
                                                    <div className="form-field">
                                                        <label>Telefone</label>
                                                        <input type="text" placeholder="(XX) XXXXX-XXXX" value={form.guardian_phone}
                                                            onChange={(e) => updateField('guardian_phone', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Já Matriculado? */}
                                    {wizardStep === 2 && (
                                        <div className="wizard-step-content wizard-center">
                                            <p className="wizard-desc">Este aluno já vai começar com uma matrícula?</p>
                                            <div className="wizard-yesno">
                                                <button type="button"
                                                    className={`wizard-btn-choice ${form.wizard_already_enrolled === true ? 'selected' : ''}`}
                                                    onClick={() => updateField('wizard_already_enrolled', true)}>
                                                    <span className="wizard-choice-icon">✅</span>
                                                    <span className="wizard-choice-label">Sim, já vai se matricular</span>
                                                    <span className="wizard-choice-desc">Vou definir instrumento, professor e valor</span>
                                                </button>
                                                <button type="button"
                                                    className={`wizard-btn-choice ${form.wizard_already_enrolled === false ? 'selected' : ''}`}
                                                    onClick={() => updateField('wizard_already_enrolled', false)}>
                                                    <span className="wizard-choice-icon">📋</span>
                                                    <span className="wizard-choice-label">Ainda não</span>
                                                    <span className="wizard-choice-desc">Só cadastrar o aluno (lead / interesse)</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Instrumento */}
                                    {wizardStep === 3 && (
                                        <div className="wizard-step-content">
                                            <p className="wizard-desc">Qual instrumento o aluno vai estudar?</p>
                                            <div className="instruments-checkbox-group wizard-instrument-grid">
                                                {INSTRUMENTS.map(inst => (
                                                    <label key={inst}
                                                        className={`instrument-chip ${form.wizard_enroll_instrument === inst ? 'selected' : ''}`}
                                                        onClick={() => updateField('wizard_enroll_instrument', inst)}>
                                                        <input type="radio" name="wiz-inst" checked={form.wizard_enroll_instrument === inst}
                                                            onChange={() => {}} />
                                                        {inst}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Professor */}
                                    {wizardStep === 4 && (
                                        <div className="wizard-step-content">
                                            <p className="wizard-desc">Vincular um professor?</p>
                                            <div className="wizard-yesno" style={{ marginBottom: 16 }}>
                                                <button type="button"
                                                    className={`wizard-btn-choice-sm ${form.enroll_teacher_id ? 'selected' : ''}`}
                                                    onClick={() => updateField('enroll_teacher_id', teachers[0]?.id || '')}>
                                                    ✅ Sim, escolher agora
                                                </button>
                                                <button type="button"
                                                    className={`wizard-btn-choice-sm ${!form.enroll_teacher_id ? 'selected' : ''}`}
                                                    onClick={() => updateField('enroll_teacher_id', '')}>
                                                    ⏸️ Definir depois
                                                </button>
                                            </div>
                                            {form.enroll_teacher_id ? (
                                                <div className="form-field">
                                                    <label>Selecione o Professor</label>
                                                    <select value={form.enroll_teacher_id}
                                                        onChange={e => updateField('enroll_teacher_id', e.target.value)}>
                                                        <option value="">Selecione...</option>
                                                        {teachers.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <p style={{ color: '#71717a', fontSize: 13 }}>
                                                    O professor pode ser definido depois na página de Matrículas.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 5: Dia e Horário */}
                                    {wizardStep === 5 && (
                                        <div className="wizard-step-content">
                                            <p className="wizard-desc">Qual dia e horário das aulas?</p>
                                            <div className="form-grid">
                                                <div className="form-field">
                                                    <label>Dia da Semana *</label>
                                                    <select value={form.enroll_day_of_week}
                                                        onChange={e => updateField('enroll_day_of_week', e.target.value)}>
                                                        <option value="">Selecione...</option>
                                                        {DAY_OPTIONS.map(d => (
                                                            <option key={d.value} value={d.value}>{d.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-field">
                                                    <label>Horário *</label>
                                                    <input type="time" value={form.enroll_class_time}
                                                        onChange={e => updateField('enroll_class_time', e.target.value)} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Duração</label>
                                                    <select value={form.enroll_duration}
                                                        onChange={e => updateField('enroll_duration', Number(e.target.value))}>
                                                        <option value={30}>30 min</option>
                                                        <option value={45}>45 min</option>
                                                        <option value={60}>60 min</option>
                                                        <option value={90}>90 min</option>
                                                    </select>
                                                </div>
                                                <div className="form-field">
                                                    <label>Frequência</label>
                                                    <select defaultValue="1">
                                                        <option value="1">1x por semana</option>
                                                        <option value="2">2x por semana</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 6: Valor e Pagamento */}
                                    {wizardStep === 6 && (
                                        <div className="wizard-step-content">
                                            <p className="wizard-desc">Defina o valor da mensalidade.</p>
                                            <div className="form-grid">
                                                <div className="form-field">
                                                    <label>Valor da Mensalidade (R$) *</label>
                                                    <input type="text" inputMode="decimal" placeholder="0,00"
                                                        value={form.enroll_monthly_fee}
                                                        onChange={e => updateField('enroll_monthly_fee', e.target.value.replace(/[^0-9,]/g, ''))} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Tipo de Cobrança</label>
                                                    <select value={form.enroll_billing_type}
                                                        onChange={e => updateField('enroll_billing_type', e.target.value as 'weekly' | 'monthly' | 'full')}>
                                                        {BILLING_OPTIONS.map(b => (
                                                            <option key={b.value} value={b.value}>{b.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 7: Agendar 1ª Aula? */}
                                    {wizardStep === 7 && (
                                        <div className="wizard-step-content wizard-center">
                                            <p className="wizard-desc">Quer agendar a primeira aula agora?</p>
                                            <div className="wizard-yesno">
                                                <button type="button"
                                                    className={`wizard-btn-choice ${form.wizard_schedule_first ? 'selected' : ''}`}
                                                    onClick={() => updateField('wizard_schedule_first', true)}>
                                                    <span className="wizard-choice-icon">📅</span>
                                                    <span className="wizard-choice-label">Sim, agendar agora</span>
                                                    <span className="wizard-choice-desc">Escolher data e horário da 1ª aula</span>
                                                </button>
                                                <button type="button"
                                                    className={`wizard-btn-choice ${!form.wizard_schedule_first ? 'selected' : ''}`}
                                                    onClick={() => updateField('wizard_schedule_first', false)}>
                                                    <span className="wizard-choice-icon">⏳</span>
                                                    <span className="wizard-choice-label">Depois</span>
                                                    <span className="wizard-choice-desc">Agendar em outro momento</span>
                                                </button>
                                            </div>
                                            {form.wizard_schedule_first && (
                                                <div className="wizard-date-group">
                                                    <div className="wizard-date-field">
                                                        <label>📅 Data da 1ª Aula *</label>
                                                        <div className="wizard-date-input-wrap">
                                                            <input type="date" value={form.wizard_first_lesson_date}
                                                                onChange={e => updateField('wizard_first_lesson_date', e.target.value)}
                                                                title="Clique para abrir o calendário" />
                                                            <span className="wizard-date-icon">📅</span>
                                                        </div>
                                                        <span className="wizard-date-hint">Clique no campo ou no ícone para abrir o calendário</span>
                                                    </div>
                                                    <div className="wizard-date-field">
                                                        <label>🕐 Horário *</label>
                                                        <div className="wizard-date-input-wrap">
                                                            <input type="time" value={form.wizard_first_lesson_time}
                                                                onChange={e => updateField('wizard_first_lesson_time', e.target.value)}
                                                                title="Selecione o horário" />
                                                            <span className="wizard-date-icon">🕐</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 8: Confirmação */}
                                    {wizardStep === 8 && (
                                        <div className="wizard-step-content">
                                            <p className="wizard-desc">Revise os dados antes de salvar.</p>
                                            <div className="wizard-summary">
                                                <div className="wizard-summary-section">
                                                    <h4>📋 Dados do Aluno</h4>
                                                    <p><strong>Nome:</strong> {form.name}</p>
                                                    <p><strong>CPF:</strong> {form.cpf || '—'}</p>
                                                    <p><strong>E-mail:</strong> {form.email || '—'}</p>
                                                    <p><strong>Telefone:</strong> {form.phone || '—'}</p>
                                                    {form.guardian_name && <p><strong>Responsável:</strong> {form.guardian_name}</p>}
                                                </div>
                                                {form.wizard_already_enrolled && (
                                                    <div className="wizard-summary-section">
                                                        <h4>📚 Matrícula</h4>
                                                        <p><strong>Instrumento:</strong> {form.wizard_enroll_instrument}</p>
                                                        <p><strong>Professor:</strong> {form.enroll_teacher_id ? teachers.find(t => t.id === form.enroll_teacher_id)?.name || '—' : 'A definir'}</p>
                                                        <p><strong>Dia:</strong> {DAY_OPTIONS.find(d => d.value === form.enroll_day_of_week)?.label || '—'} às {form.enroll_class_time || '—'}</p>
                                                        <p><strong>Duração:</strong> {form.enroll_duration} min</p>
                                                        <p><strong>Valor:</strong> R$ {form.enroll_monthly_fee || '0,00'}</p>
                                                        <p><strong>Cobrança:</strong> {BILLING_OPTIONS.find(b => b.value === form.enroll_billing_type)?.label || '—'}</p>
                                                        {form.wizard_schedule_first && (
                                                            <p><strong>1ª Aula:</strong> {form.wizard_first_lesson_date || '—'} às {form.wizard_first_lesson_time || '—'}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Wizard Navigation */}
                                    {wizardStep < 8 && (
                                        <div className="wizard-nav">
                                            <button type="button" className="btn-secondary" onClick={prevStep}
                                                disabled={wizardStep === 1}>
                                                ← Anterior
                                            </button>
                                            <div className="wizard-nav-right">
                                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                                    Cancelar
                                                </button>
                                                <button type="button" className="btn-primary" onClick={nextStep}
                                                    disabled={!canGoNext()}>
                                                    {wizardStep === 7 ? 'Revisar →' : 'Próximo →'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 8: Save buttons */}
                                    {wizardStep === 8 && (
                                        <div className="wizard-nav">
                                            <button type="button" className="btn-secondary" onClick={prevStep}>
                                                ← Anterior
                                            </button>
                                            <div className="wizard-nav-right">
                                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                                    Cancelar
                                                </button>
                                                <button type="submit" className="btn-primary" disabled={saving}>
                                                    {saving ? 'Salvando...' : '✅ Salvar Aluno'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
