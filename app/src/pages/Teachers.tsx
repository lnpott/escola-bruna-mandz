import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/App';
import type { Teacher } from '@/types';
import { DAY_LABELS } from '@/types';
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/services/api';
import '@/styles/teachers.css';

const WEEKDAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const;

const SPECIALTY_OPTIONS = [
    'Piano', 'Teclado', 'Violão', 'Guitarra', 'Baixo', 'Bateria',
    'Canto', 'Violino', 'Viola', 'Violoncelo', 'Saxofone', 'Flauta',
    'Ukulele', 'Cavaquinho', 'Acordeon', 'Musicalização Infantil', 'Teoria Musical',
    'Outro',
];

interface TeacherForm {
    name: string;
    cpf: string;
    phone: string;
    specialty: string;
    rate_per_class: string;
    days_of_week: string[];
}

const emptyForm: TeacherForm = {
    name: '',
    cpf: '',
    phone: '',
    specialty: '',
    rate_per_class: '0.00',
    days_of_week: [],
};

export default function Teachers() {
    const { confirm } = useApp();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<TeacherForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchTeachers();
            setTeachers(data);
        } catch (err: unknown) {
            setError('Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Filter ───────────────────────────────────────────────
    const filtered = teachers.filter((t) =>
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.phone || '').includes(search)
    );

    // ── Modal ────────────────────────────────────────────────
    function openNew() {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(true);
    }

    function openEdit(teacher: Teacher) {
        const days = Array.isArray(teacher.days_of_week)
            ? teacher.days_of_week
            : typeof teacher.days_of_week === 'string'
                ? teacher.days_of_week.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];

        setForm({
            name: teacher.name,
            cpf: teacher.cpf || '',
            phone: teacher.phone || '',
            specialty: teacher.specialty || '',
            rate_per_class: String(teacher.rate_per_class ?? '0.00'),
            days_of_week: days,
        });
        setEditingId(teacher.id);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
    }

    function updateField<K extends keyof TeacherForm>(key: K, value: TeacherForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function toggleDay(day: string) {
        setForm((prev) => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter((d) => d !== day)
                : [...prev.days_of_week, day],
        }));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) return;

        setSaving(true);
        try {
            const payload = {
                ...form,
                rate_per_class: parseFloat(form.rate_per_class || '0'),
                days_of_week: form.days_of_week,
            };

            if (editingId) {
                await updateTeacher(editingId, payload);
            } else {
                await createTeacher(payload);
            }
            closeModal();
            await load();
        } catch (err: unknown) {
            setError('Erro desconhecido');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await confirm({
            title: 'Excluir Professor',
            message: `Tem certeza que deseja excluir ${teachers.find(t => t.id === id)?.name || 'este professor'}? Esta ação não pode ser desfeita.`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await deleteTeacher(id);
            await load();
        } catch (err: unknown) {
            setError('Erro desconhecido');
        }
    }

    // ── Render days of week ──────────────────────────────────
    function renderDays(days: string[] | string): string {
        const arr = Array.isArray(days) ? days : typeof days === 'string'
            ? days.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];
        return arr.map((d: string) => DAY_LABELS[d] || d).join(', ') || '—';
    }

    // ── Input masks ────────────────────────────────────────────
    const maskCPF = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        return digits
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
    };

    const maskPhone = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 10) {
            return digits
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
        return digits
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
    };

    // ── Render ───────────────────────────────────────────────
    if (loading && !teachers.length) {
        return <div className="teachers-page"><div className="loading">Carregando professores...</div></div>;
    }

    return (
        <div className="teachers-page">
            <div className="teachers-header">
                <h1>👨‍🏫 Professores</h1>
                <button className="btn-primary" onClick={openNew}>➕ Novo Professor</button>
            </div>

            {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}

            <div className="teachers-filters">
                <input
                    type="text"
                    placeholder="Buscar por nome, especialidade ou telefone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <span className="teachers-count">{filtered.length} professor(es)</span>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    {search
                        ? 'Nenhum professor encontrado com esse filtro.'
                        : 'Nenhum professor cadastrado. Clique em "Novo Professor" para começar.'}
                </div>
            ) : (
                <div className="teachers-table-wrapper">
                    <table className="teachers-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Especialidade</th>
                                <th>Dias</th>
                                <th>Valor/Aula</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t) => (
                                <tr key={t.id}>
                                    <td data-label="Nome"><strong>{t.name}</strong></td>
                                    <td data-label="CPF">{t.cpf || '—'}</td>
                                    <td data-label="Telefone">{t.phone || '—'}</td>
                                    <td data-label="Especialidade">{t.specialty || '—'}</td>
                                    <td data-label="Dias">{renderDays(t.days_of_week)}</td>
                                    <td data-label="Valor/Aula">
                                        <span className="td-currency">R$ {Number(t.rate_per_class).toFixed(2)}</span>
                                    </td>
                                    <td data-label="Ações">
                                        <button className="btn-action" onClick={() => openEdit(t)} title="Editar">✏️</button>
                                        <button className="btn-action btn-action-danger" onClick={() => handleDelete(t.id)} title="Excluir">🗑️</button>
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
                        <h2>{editingId ? 'Editar Professor' : 'Novo Professor'}</h2>
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
                                        onChange={(e) => updateField('cpf', maskCPF(e.target.value))}
                                        maxLength={14}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(XX) XXXXX-XXXX"
                                        value={form.phone}
                                        onChange={(e) => updateField('phone', maskPhone(e.target.value))}
                                        maxLength={15}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Especialidade</label>
                                    <select
                                        value={form.specialty}
                                        onChange={(e) => updateField('specialty', e.target.value)}
                                    >
                                        <option value="">— Selecione —</option>
                                        {SPECIALTY_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Valor por Aula (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.rate_per_class}
                                        onChange={(e) => updateField('rate_per_class', e.target.value)}
                                    />
                                    <span className="form-help">Quanto o professor recebe por aula</span>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Dias de Atendimento</h3>
                                <div className="days-grid">
                                    {WEEKDAYS.map((day) => (
                                        <label key={day} className="day-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={form.days_of_week.includes(day)}
                                                onChange={() => toggleDay(day)}
                                            />
                                            {DAY_LABELS[day]}
                                        </label>
                                    ))}
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
