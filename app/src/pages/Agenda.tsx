import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Lesson, LessonStatus, Enrollment } from '@/types';
import { DAY_NAMES, MONTH_NAMES, LESSON_STATUS_LABELS } from '@/types';
import { fetchLessons, createLesson, updateLesson, deleteLesson, fetchEnrollments } from '@/services/api';
import '@/styles/agenda.css';

/* ── helpers ─────────────────────────────────────────────────── */
function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getMonthRange(offset: number) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + offset;
    const m = ((month % 12) + 12) % 12;
    const y = year + Math.floor(month / 12);
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    // Adjust to start from Sunday before or on the 1st
    const calStart = new Date(start);
    calStart.setDate(calStart.getDate() - calStart.getDay());
    // Adjust to end on Saturday after or on the last day
    const calEnd = new Date(end);
    calEnd.setDate(calEnd.getDate() + (6 - calEnd.getDay()));
    return { start: calStart, end: calEnd, month: m, year: y };
}



/* ── Agenda component ─────────────────────────────────────────── */
export default function Agenda() {
    const [monthOffset, setMonthOffset] = useState(0);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [toast, setToast] = useState('');

    // Form state for create/edit
    const [form, setForm] = useState({
        id: '',
        enrollment_id: '',
        student_id: '',
        teacher_id: '',
        instrument: '',
        date: '',
        start_time: '',
        duration_minutes: 60,
        lesson_type: 'regular' as string,
        status: 'scheduled' as string,
        notes: '',
    });

    const range = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }, []);

    const loadLessons = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const dateFrom = formatDate(range.start);
            const dateTo = formatDate(range.end);
            const lessons = await fetchLessons({ date_from: dateFrom, date_to: dateTo, limit: 500 });
            setAllLessons(lessons);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar agenda.');
        } finally {
            setLoading(false);
        }
    }, [range]);

    const loadEnrollments = useCallback(async () => {
        try {
            const enrs = await fetchEnrollments({ status: 'active' });
            setEnrollments(enrs);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        loadLessons();
    }, [loadLessons]);

    useEffect(() => {
        if (showCreateModal) loadEnrollments();
    }, [showCreateModal, loadEnrollments]);

    // Group lessons by date
    const byDate = useMemo(() => {
        const map: Record<string, Lesson[]> = {};
        allLessons.forEach(l => {
            const d = l.date;
            if (!map[d]) map[d] = [];
            map[d].push(l);
        });
        return map;
    }, [allLessons]);

    // Build calendar days
    const days = useMemo(() => {
        const result: {
            date: Date;
            dateStr: string;
            isToday: boolean;
            isCurrentMonth: boolean;
            dayOfWeek: number;
            lessons: Lesson[];
        }[] = [];
        const today = new Date();
        const todayStr = formatDate(today);
        const d = new Date(range.start);
        while (d <= range.end) {
            const dateStr = formatDate(d);
            result.push({
                date: new Date(d),
                dateStr,
                isToday: dateStr === todayStr,
                isCurrentMonth: d.getMonth() === range.month,
                dayOfWeek: d.getDay(),
                lessons: (byDate[dateStr] || []).sort((a, b) => a.start_time.localeCompare(b.start_time)),
            });
            d.setDate(d.getDate() + 1);
        }
        return result;
    }, [range, byDate]);

    // Summary counts
    const summary = useMemo(() => {
        let total = 0, scheduled = 0, completed = 0;
        days.forEach(day => {
            if (day.isCurrentMonth) {
                total += day.lessons.length;
                day.lessons.forEach(l => {
                    if (l.status === 'completed') completed++;
                    else scheduled++;
                });
            }
        });
        return { total, scheduled, completed };
    }, [days]);

    // ── Day modal ──────────────────────────────────────────────
    const selectedDayLessons = useMemo(() => {
        if (!selectedDay) return [];
        return byDate[selectedDay] || [];
    }, [selectedDay, byDate]);

    const formatDayName = (dateStr: string) => {
        const parts = dateStr.split('-');
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    // ── Create / Edit lesson ───────────────────────────────────
    const openCreateModal = (date?: string) => {
        setForm({
            id: '',
            enrollment_id: '',
            student_id: '',
            teacher_id: '',
            instrument: '',
            date: date || formatDate(new Date()),
            start_time: '',
            duration_minutes: 60,
            lesson_type: 'regular',
            status: 'scheduled',
            notes: '',
        });
        setShowCreateModal(true);
    };

    const handleEnrollmentChange = (enrollmentId: string) => {
        const enr = enrollments.find(e => e.id === enrollmentId);
        if (enr) {
            setForm(prev => ({
                ...prev,
                enrollment_id: enrollmentId,
                student_id: enr.student_id,
                teacher_id: enr.teacher_id || '',
                instrument: enr.instrument || '',
                date: prev.date || formatDate(new Date()),
                start_time: enr.class_time || prev.start_time,
                duration_minutes: enr.duration_minutes || prev.duration_minutes,
            }));
        } else {
            setForm(prev => ({ ...prev, enrollment_id: '', student_id: '', teacher_id: '', instrument: '' }));
        }
    };

    const handleSaveLesson = async () => {
        if (!form.date || !form.start_time) {
            showToast('Data e horário são obrigatórios.');
            return;
        }
        try {
            if (form.id) {
                // Update existing
                await updateLesson(form.id, {
                    date: form.date,
                    start_time: form.start_time,
                    duration_minutes: form.duration_minutes,
                    status: form.status as LessonStatus,
                    lesson_type: form.lesson_type as any,
                    notes: form.notes || null,
                });
                showToast('Aula atualizada!');
            } else {
                // Create new
                await createLesson({
                    enrollment_id: form.enrollment_id || undefined,
                    student_id: form.student_id || undefined,
                    teacher_id: form.teacher_id || undefined,
                    instrument: form.instrument || undefined,
                    date: form.date,
                    start_time: form.start_time,
                    duration_minutes: form.duration_minutes,
                    lesson_type: form.lesson_type as any,
                    status: form.status as LessonStatus,
                    notes: form.notes || undefined,
                });
                showToast('Aula criada!');
            }
            setShowCreateModal(false);
            loadLessons();
        } catch (err: any) {
            showToast(err.message || 'Erro ao salvar aula.');
        }
    };

    const handleStatusChange = async (lessonId: string, newStatus: LessonStatus) => {
        try {
            await updateLesson(lessonId, { status: newStatus });
            showToast(`Aula ${LESSON_STATUS_LABELS[newStatus].toLowerCase()}`);
            loadLessons();
        } catch (err: any) {
            showToast(err.message || 'Erro ao atualizar status.');
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
        try {
            await deleteLesson(lessonId);
            showToast('Aula excluída.');
            loadLessons();
        } catch (err: any) {
            showToast(err.message || 'Erro ao excluir aula.');
        }
    };

    const handleEditLesson = (lesson: Lesson) => {
        setForm({
            id: lesson.id,
            enrollment_id: lesson.enrollment_id || '',
            student_id: lesson.student_id,
            teacher_id: lesson.teacher_id || '',
            instrument: lesson.instrument || '',
            date: lesson.date,
            start_time: lesson.start_time,
            duration_minutes: lesson.duration_minutes,
            lesson_type: lesson.lesson_type,
            status: lesson.status,
            notes: lesson.notes || '',
        });
        setShowCreateModal(true);
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="agenda-page">
            {/* Toast */}
            {toast && <div className="agenda-toast">{toast}</div>}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📅 Agenda Mensal</h1>
                <Link to="/" className="legacy-link">← Voltar</Link>
            </div>

            {/* Toolbar */}
            <div className="agenda-toolbar">
                <button className="agenda-nav-btn" onClick={() => setMonthOffset(mo => mo - 1)}>‹ Mês Anterior</button>
                <span className="agenda-month-label">{MONTH_NAMES[range.month]} {range.year}</span>
                <button className="agenda-nav-btn" onClick={() => setMonthOffset(mo => mo + 1)}>Próximo Mês ›</button>
                <button className="agenda-nav-btn" onClick={() => setMonthOffset(0)}>📅 Hoje</button>
                <button className="agenda-btn-new" onClick={() => openCreateModal()}>➕ Nova Aula</button>
            </div>

            {/* Summary */}
            <div className="agenda-summary">
                <span>Total: <strong>{summary.total}</strong></span>
                <span className="scheduled-count">Agendadas: <strong>{summary.scheduled}</strong></span>
                <span className="completed-count">Realizadas: <strong>{summary.completed}</strong></span>
            </div>

            {/* Error */}
            {error && <div className="agenda-error">{error}</div>}

            {/* Calendar */}
            {loading ? (
                <div className="agenda-loading">Carregando agenda...</div>
            ) : (
                <div className="agenda-calendar">
                    {/* Day name headers */}
                    {DAY_NAMES.map((name, i) => (
                        <div key={i} className={`agenda-cal-header ${i === 0 || i === 6 ? 'weekend' : ''}`}>
                            {name}
                        </div>
                    ))}
                    {/* Day cells */}
                    {days.map(day => {
                        const cls = [
                            'agenda-day-cell',
                            day.isToday ? 'today' : '',
                            !day.isCurrentMonth ? 'other-month' : '',
                            day.lessons.length > 0 ? 'has-lessons' : '',
                        ].filter(Boolean).join(' ');

                        const visibleItems = day.lessons.slice(0, 3);
                        const remaining = day.lessons.length - 3;

                        return (
                            <div
                                key={day.dateStr}
                                className={cls}
                                onClick={() => setSelectedDay(day.dateStr)}
                            >
                                <div className={`agenda-day-number ${day.isToday ? 'today' : ''}`}>
                                    {day.date.getDate()}
                                </div>
                                {visibleItems.map(l => (
                                    <div
                                        key={l.id}
                                        className={`agenda-lesson-marker ${l.status}`}
                                        onClick={e => { e.stopPropagation(); setSelectedDay(day.dateStr); }}
                                    >
                                        <span className="time">{l.start_time || '--:--'}</span>{' '}
                                        <span className="name">{l.students?.name || '—'}</span>
                                    </div>
                                ))}
                                {remaining > 0 && (
                                    <div className="agenda-more-link">+{remaining} mais</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Day Detail Modal ────────────────────────────── */}
            {selectedDay && (
                <div className="agenda-modal-overlay" onClick={() => setSelectedDay(null)}>
                    <div className="agenda-modal agenda-day-modal" onClick={e => e.stopPropagation()}>
                        <div className="agenda-modal-header">
                            <h3>{formatDayName(selectedDay)}</h3>
                            <button className="agenda-modal-close" onClick={() => setSelectedDay(null)}>✕</button>
                        </div>
                        <div className="agenda-modal-body">
                            {selectedDayLessons.length === 0 ? (
                                <div className="dash-empty">Nenhuma aula neste dia.</div>
                            ) : (
                                selectedDayLessons.map(l => (
                                    <div key={l.id} className={`agenda-lesson-card ${l.status}`}>
                                        <div className="lesson-card-header">
                                            <span className="lesson-time-tag">{l.start_time} – {l.end_time}</span>
                                            <span className={`lesson-status-badge ${l.status}`}>
                                                {LESSON_STATUS_LABELS[l.status] || l.status}
                                            </span>
                                        </div>
                                        <div className="lesson-card-body">
                                            <div className="lesson-info-row">
                                                <span className="lesson-label">Aluno:</span>
                                                <strong>{l.students?.name || '—'}</strong>
                                            </div>
                                            <div className="lesson-info-row">
                                                <span className="lesson-label">Professor:</span>
                                                <span>{l.teachers?.name || '—'}</span>
                                            </div>
                                            <div className="lesson-info-row">
                                                <span className="lesson-label">Instrumento:</span>
                                                <span>{l.instrument || '—'}</span>
                                            </div>
                                            <div className="lesson-info-row">
                                                <span className="lesson-label">Duração:</span>
                                                <span>{l.duration_minutes} min</span>
                                            </div>
                                            {l.notes && (
                                                <div className="lesson-info-row">
                                                    <span className="lesson-label">Obs:</span>
                                                    <span>{l.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="lesson-card-actions">
                                            <button
                                                className="btn-lesson-action btn-edit"
                                                onClick={() => { setSelectedDay(null); handleEditLesson(l); }}
                                                title="Editar"
                                            >✏️</button>
                                            {l.status === 'scheduled' && (
                                                <button
                                                    className="btn-lesson-action btn-complete"
                                                    onClick={() => handleStatusChange(l.id, 'completed')}
                                                    title="Marcar como realizada"
                                                >✅</button>
                                            )}
                                            {l.status === 'scheduled' && (
                                                <button
                                                    className="btn-lesson-action btn-cancel"
                                                    onClick={() => handleStatusChange(l.id, 'cancelled')}
                                                    title="Cancelar aula"
                                                >❌</button>
                                            )}
                                            {l.status === 'completed' && (
                                                <button
                                                    className="btn-lesson-action btn-revert"
                                                    onClick={() => handleStatusChange(l.id, 'scheduled')}
                                                    title="Reverter para agendada"
                                                >↩️</button>
                                            )}
                                            <button
                                                className="btn-lesson-action btn-delete"
                                                onClick={() => handleDeleteLesson(l.id)}
                                                title="Excluir"
                                            >🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                            <button className="agenda-btn-new" style={{ marginTop: 12, width: '100%' }}
                                onClick={() => openCreateModal(selectedDay)}>
                                ➕ Adicionar aula neste dia
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Lesson Modal ──────────────────── */}
            {showCreateModal && (
                <div className="agenda-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="agenda-modal agenda-form-modal" onClick={e => e.stopPropagation()}>
                        <div className="agenda-modal-header">
                            <h3>{form.id ? '✏️ Editar Aula' : '➕ Nova Aula'}</h3>
                            <button className="agenda-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <div className="agenda-modal-body">
                            <div className="agenda-form-grid">
                                <div className="form-group">
                                    <label>Vínculo (opcional)</label>
                                    <select
                                        value={form.enrollment_id}
                                        onChange={e => handleEnrollmentChange(e.target.value)}
                                    >
                                        <option value="">— Sem vínculo —</option>
                                        {enrollments.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.students?.name || '?'} — {e.day_of_week ? DAY_NAMES[['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].indexOf(e.day_of_week)] : '?'} {e.class_time || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Data *</label>
                                    <input type="date" value={form.date}
                                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Horário *</label>
                                    <input type="time" value={form.start_time}
                                        onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Duração (min)</label>
                                    <input type="number" min={15} max={240} step={5} value={form.duration_minutes}
                                        onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
                                </div>
                                {!form.enrollment_id && (
                                    <>
                                        <div className="form-group">
                                            <label>Aluno ID</label>
                                            <input type="text" value={form.student_id}
                                                onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                                                placeholder="ST-XXXXXX" />
                                        </div>
                                        <div className="form-group">
                                            <label>Professor ID</label>
                                            <input type="text" value={form.teacher_id}
                                                onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                                                placeholder="TE-XXXXXX" />
                                        </div>
                                        <div className="form-group">
                                            <label>Instrumento</label>
                                            <input type="text" value={form.instrument}
                                                onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))} />
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>Tipo de Aula</label>
                                    <select value={form.lesson_type}
                                        onChange={e => setForm(f => ({ ...f, lesson_type: e.target.value }))}>
                                        <option value="regular">Regular</option>
                                        <option value="make_up">Reposição</option>
                                        <option value="extra">Extra</option>
                                        <option value="trial">Experimental</option>
                                    </select>
                                </div>
                                {form.id && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={form.status}
                                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            <option value="scheduled">📅 Agendada</option>
                                            <option value="completed">✅ Realizada</option>
                                            <option value="cancelled">❌ Cancelada</option>
                                            <option value="make_up">🔄 Reposição</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group form-group-full">
                                    <label>Observações</label>
                                    <textarea value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        rows={3} />
                                </div>
                            </div>
                            <div className="agenda-form-actions">
                                <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                <button className="btn-save" onClick={handleSaveLesson}>
                                    {form.id ? 'Salvar Alterações' : 'Criar Aula'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
