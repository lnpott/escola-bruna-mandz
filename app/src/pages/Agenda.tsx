import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Lesson, LessonStatus, LessonType, Enrollment, Student, Teacher } from '@/types';
import { DAY_NAMES, MONTH_NAMES, LESSON_STATUS_LABELS, LESSON_TYPE_LABELS } from '@/types';
import { fetchLessons, createLesson, updateLesson, deleteLesson, fetchEnrollments, fetchStudents, fetchTeachers } from '@/services/api';
import { useApp } from '@/App';
import '@/styles/agenda.css';

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

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
    const calStart = new Date(start);
    calStart.setDate(calStart.getDate() - calStart.getDay());
    const calEnd = new Date(end);
    calEnd.setDate(calEnd.getDate() + (6 - calEnd.getDay()));
    return { start: calStart, end: calEnd, month: m, year: y };
}

function getWeekRange(date: Date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
}

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
}

/** Maps short day codes (dom, seg, ...) to display names */
const DAY_SHORT_TO_LABEL: Record<string, string> = {
    'dom': 'Domingo',
    'seg': 'Segunda',
    'ter': 'Terça',
    'qua': 'Quarta',
    'qui': 'Quinta',
    'sex': 'Sexta',
    'sab': 'Sábado',
};

/** Export lessons as CSV download */
function exportCSV(lessons: Lesson[], filename: string) {
    const header = 'Data,Dia Semana,Horário,Aluno,Professor,Instrumento,Tipo,Status,Duração,Obs';
    const rows = lessons.map(l => {
        const d = new Date(l.date + 'T12:00:00');
        const dayName = DAY_NAMES[d.getDay()];
        return [
            l.date,
            dayName,
            l.start_time,
            l.students?.name || '—',
            l.teachers?.name || '—',
            l.instrument || '—',
            LESSON_TYPE_LABELS[l.lesson_type as LessonType] || l.lesson_type,
            LESSON_STATUS_LABELS[l.status as LessonStatus] || l.status,
            formatDuration(l.duration_minutes),
            (l.notes || '').replace(/,/g, ';'),
        ].join(',');
    }).join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════
//  AGENDA COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function Agenda() {
    const { showToast, confirm } = useApp();

    // ── View state ─────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [monthOffset, setMonthOffset] = useState(0);
    const [weekStart, setWeekStart] = useState<Date>(() => {
        const now = new Date();
        const s = new Date(now);
        s.setDate(s.getDate() - s.getDay());
        return s;
    });

    // ── Data ───────────────────────────────────────────────────
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorLeaving, setErrorLeaving] = useState(false);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // ── Filters ────────────────────────────────────────────────
    const [filterStudent, setFilterStudent] = useState('');
    const [filterTeacher, setFilterTeacher] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    // ── Modals ─────────────────────────────────────────────────
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // ── Form ───────────────────────────────────────────────────
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

    // ── Date ranges ────────────────────────────────────────────
    const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);
    const weekRange = useMemo(() => getWeekRange(weekStart), [weekStart]);

    const activeRange = viewMode === 'month' ? monthRange : { start: weekRange.start, end: weekRange.end, month: weekRange.start.getMonth(), year: weekRange.start.getFullYear() };

    // ── Load data ──────────────────────────────────────────────
    const loadStudents = useCallback(async () => {
        try { setStudents(await fetchStudents()); } catch { /* ignore */ }
    }, []);
    const loadTeachers = useCallback(async () => {
        try { setTeachers(await fetchTeachers()); } catch { /* ignore */ }
    }, []);

    const loadLessons = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const dateFrom = formatDate(activeRange.start);
            const dateTo = formatDate(activeRange.end);
            const lessons = await fetchLessons({ date_from: dateFrom, date_to: dateTo, limit: 500 });
            setAllLessons(lessons);
        } catch (err: unknown) {
            setError('Erro ao carregar agenda.');
        } finally {
            setLoading(false);
        }
    }, [activeRange]);

    const loadEnrollments = useCallback(async () => {
        try { setEnrollments(await fetchEnrollments({ status: 'active' })); } catch { /* ignore */ }
    }, []);

    useEffect(() => { loadLessons(); }, [loadLessons]);
    useEffect(() => { loadStudents(); loadTeachers(); }, [loadStudents, loadTeachers]);
    useEffect(() => { if (showCreateModal) loadEnrollments(); }, [showCreateModal, loadEnrollments]);

    // ── Filtered lessons ───────────────────────────────────────
    const filteredLessons = useMemo(() => {
        let list = allLessons;
        if (filterStudent) list = list.filter(l => l.student_id === filterStudent);
        if (filterTeacher) list = list.filter(l => l.teacher_id === filterTeacher);
        if (filterStatus) list = list.filter(l => l.status === filterStatus);
        if (filterType) list = list.filter(l => l.lesson_type === filterType);
        return list;
    }, [allLessons, filterStudent, filterTeacher, filterStatus, filterType]);

    const byDate = useMemo(() => {
        const map: Record<string, Lesson[]> = {};
        filteredLessons.forEach(l => {
            const d = l.date;
            if (!map[d]) map[d] = [];
            map[d].push(l);
        });
        return map;
    }, [filteredLessons]);

    // ── Calendar days ──────────────────────────────────────────
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
        const d = new Date(activeRange.start);
        while (d <= activeRange.end) {
            const dateStr = formatDate(d);
            result.push({
                date: new Date(d),
                dateStr,
                isToday: dateStr === todayStr,
                isCurrentMonth: d.getMonth() === activeRange.month,
                dayOfWeek: d.getDay(),
                lessons: (byDate[dateStr] || []).sort((a, b) => a.start_time.localeCompare(b.start_time)),
            });
            d.setDate(d.getDate() + 1);
        }
        return result;
    }, [activeRange, byDate]);

    // ── Summary ────────────────────────────────────────────────
    const summary = useMemo(() => {
        let total = 0, scheduled = 0, completed = 0;
        days.forEach(day => {
            if (day.isCurrentMonth || viewMode === 'week') {
                total += day.lessons.length;
                day.lessons.forEach(l => {
                    if (l.status === 'completed') completed++;
                    else if (l.status === 'scheduled') scheduled++;
                });
            }
        });
        return { total, scheduled, completed };
    }, [days, viewMode]);

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

    // ── Navigation ─────────────────────────────────────────────
    const navigatePrev = () => {
        if (viewMode === 'month') setMonthOffset(mo => mo - 1);
        else {
            const prev = new Date(weekStart);
            prev.setDate(prev.getDate() - 7);
            setWeekStart(prev);
        }
    };

    const navigateNext = () => {
        if (viewMode === 'month') setMonthOffset(mo => mo + 1);
        else {
            const next = new Date(weekStart);
            next.setDate(next.getDate() + 7);
            setWeekStart(next);
        }
    };

    const navigateToday = () => {
        if (viewMode === 'month') setMonthOffset(0);
        else {
            const now = new Date();
            const s = new Date(now);
            s.setDate(s.getDate() - s.getDay());
            setWeekStart(s);
        }
    };

    const viewLabel = viewMode === 'month'
        ? `${MONTH_NAMES[monthRange.month]} ${monthRange.year}`
        : `Semana de ${formatDate(weekRange.start)} a ${formatDate(weekRange.end)}`;

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
            showToast('Data e horário são obrigatórios.', 'error');
            return;
        }
        try {
            if (form.id) {
                await updateLesson(form.id, {
                    date: form.date,
                    start_time: form.start_time,
                    duration_minutes: form.duration_minutes,
                    status: form.status as LessonStatus,
                    lesson_type: form.lesson_type as LessonType,
                    notes: form.notes || null,
                });
                showToast('Aula atualizada!');
            } else {
                await createLesson({
                    enrollment_id: form.enrollment_id || undefined,
                    student_id: form.student_id || undefined,
                    teacher_id: form.teacher_id || undefined,
                    instrument: form.instrument || undefined,
                    date: form.date,
                    start_time: form.start_time,
                    duration_minutes: form.duration_minutes,
                    lesson_type: form.lesson_type as LessonType,
                    status: form.status as LessonStatus,
                    notes: form.notes || undefined,
                });
                showToast('Aula criada!');
            }
            setShowCreateModal(false);
            loadLessons();
        } catch (err: unknown) {
            showToast('Erro ao salvar aula.', 'error');
        }
    };

    const handleStatusChange = async (lessonId: string, newStatus: LessonStatus) => {
        try {
            await updateLesson(lessonId, { status: newStatus });
            showToast(`Aula ${LESSON_STATUS_LABELS[newStatus].toLowerCase()}`);
            loadLessons();
        } catch (err: unknown) {
            showToast('Erro ao atualizar status.', 'error');
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        const confirmed = await confirm({
            title: 'Excluir aula',
            message: 'Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await deleteLesson(lessonId);
            showToast('Aula excluída.');
            loadLessons();
        } catch (err: unknown) {
            showToast('Erro ao excluir aula.', 'error');
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

    /** Cancel lesson with reason */
    const handleCancelLesson = async (lesson: Lesson) => {
        const reason = window.prompt('Motivo do cancelamento (opcional):', '');
        const confirmed = await confirm({
            title: 'Cancelar Aula',
            message: `Deseja cancelar a aula de ${lesson.students?.name || '—'} em ${formatDate(new Date(lesson.date))} às ${lesson.start_time}?`,
            confirmText: 'Cancelar Aula',
            cancelText: 'Voltar',
            danger: true,
        });
        if (!confirmed) return;
        try {
            const notesUpdate = reason
                ? (lesson.notes ? `${lesson.notes}\n[Cancelada] ${reason}` : `[Cancelada] ${reason}`)
                : (lesson.notes ? `${lesson.notes}\n[Cancelada]` : '[Cancelada]');
            await updateLesson(lesson.id, { status: 'cancelled', notes: notesUpdate });
            showToast('Aula cancelada.');
            loadLessons();
        } catch (err: unknown) {
            showToast('Erro ao cancelar aula.', 'error');
        }
    };

    /** Reschedule lesson — opens edit form with date/time cleared */
    const handleReschedule = (lesson: Lesson) => {
        setForm({
            id: lesson.id,
            enrollment_id: lesson.enrollment_id || '',
            student_id: lesson.student_id,
            teacher_id: lesson.teacher_id || '',
            instrument: lesson.instrument || '',
            date: '',
            start_time: '',
            duration_minutes: lesson.duration_minutes,
            lesson_type: lesson.lesson_type,
            status: 'scheduled',
            notes: lesson.notes || '',
        });
        setShowCreateModal(true);
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="agenda-page">
            <h1 className="agenda-title">📅 Agenda</h1>

            {/* ── Toolbar ──────────────────────────────────────── */}
            <div className="agenda-toolbar">
                <button className="agenda-nav-btn" onClick={navigatePrev}>‹</button>
                <span className="agenda-month-label">{viewLabel}</span>
                <button className="agenda-nav-btn" onClick={navigateNext}>›</button>
                <button className="agenda-nav-btn" onClick={navigateToday}>📅 Hoje</button>

                <div className="agenda-view-toggle">
                    <button
                        className={`agenda-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >Mês</button>
                    <button
                        className={`agenda-view-btn ${viewMode === 'week' ? 'active' : ''}`}
                        onClick={() => setViewMode('week')}
                    >Semana</button>
                </div>

                <button className="agenda-btn-new" onClick={() => openCreateModal()}>➕ Nova Aula</button>
                {allLessons.length > 0 && (
                    <button
                        className="agenda-btn-export"
                        onClick={() => exportCSV(allLessons, `aulas-${formatDate(new Date())}.csv`)}
                        title="Exportar CSV"
                    >⬇ CSV</button>
                )}
            </div>

            {/* ── Filters ──────────────────────────────────────── */}
            <div className="agenda-filters">
                <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
                    <option value="">Todos os alunos</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                    <option value="">Todos os professores</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="scheduled">📅 Agendada</option>
                    <option value="completed">✅ Realizada</option>
                    <option value="cancelled">❌ Cancelada</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">Todos os tipos</option>
                    <option value="regular">Regular</option>
                    <option value="make_up">Reposição</option>
                    <option value="extra">Extra</option>
                    <option value="trial">Experimental</option>
                </select>
                {filterStudent || filterTeacher || filterStatus || filterType ? (
                    <button className="agenda-filter-clear" onClick={() => {
                        setFilterStudent('');
                        setFilterTeacher('');
                        setFilterStatus('');
                        setFilterType('');
                    }}>✕ Limpar filtros</button>
                ) : null}
            </div>

            {/* ── Summary ──────────────────────────────────────── */}
            <div className="agenda-summary">
                <span>Total: <strong>{summary.total}</strong></span>
                <span className="scheduled-count">📌 Agendadas: <strong>{summary.scheduled}</strong></span>
                <span className="completed-count">✅ Realizadas: <strong>{summary.completed}</strong></span>
                {allLessons.length > 0 && (
                    <span className="filtered-hint">
                        {filteredLessons.length < allLessons.length
                            ? `Mostrando ${filteredLessons.length} de ${allLessons.length}`
                            : `${allLessons.length} aulas no período`}
                    </span>
                )}
            </div>

            {/* ── Error ────────────────────────────────────────── */}
            {error && (
                <div
                    className={`error-banner${errorLeaving ? ' error-banner-hiding' : ''}`}
                    onClick={() => { setErrorLeaving(true); setTimeout(() => { setError(''); setErrorLeaving(false); }, 150); }}
                >{error}</div>
            )}

            {/* ── Calendar ─────────────────────────────────────── */}
            {loading ? (
                <div className="loading">Carregando agenda...</div>
            ) : (
                <div className={`agenda-calendar ${viewMode === 'week' ? 'agenda-week' : ''}`}>
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

            {/* ── Day Detail Modal ─────────────────────────────── */}
            {selectedDay && (
                <div className="agenda-modal-overlay" onClick={() => setSelectedDay(null)}>
                    <div className="agenda-modal agenda-day-modal" onClick={e => e.stopPropagation()}>
                        <div className="agenda-modal-header">
                            <h3>{formatDayName(selectedDay)}</h3>
                            <button className="agenda-modal-close" onClick={() => setSelectedDay(null)}>✕</button>
                        </div>
                        <div className="agenda-modal-body">
                            {selectedDayLessons.length === 0 ? (
                                <div className="empty-state empty-state-sm">Nenhuma aula neste dia.</div>
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
                                                <span>{formatDuration(l.duration_minutes)}</span>
                                            </div>
                                            <div className="lesson-info-row">
                                                <span className="lesson-label">Tipo:</span>
                                                <span>{LESSON_TYPE_LABELS[l.lesson_type as LessonType] || l.lesson_type}</span>
                                            </div>
                                            {l.notes && (
                                                <div className="lesson-info-row">
                                                    <span className="lesson-label">Obs:</span>
                                                    <span>{l.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="lesson-card-actions">
                                            <button className="btn-lesson-action btn-edit" onClick={() => { setSelectedDay(null); handleEditLesson(l); }} title="Editar">✏️</button>
                                            {l.status === 'scheduled' && (
                                                <button className="btn-lesson-action btn-reschedule" onClick={() => { setSelectedDay(null); handleReschedule(l); }} title="Reagendar">🔄</button>
                                            )}
                                            {l.status === 'scheduled' && (
                                                <button className="btn-lesson-action btn-complete" onClick={() => handleStatusChange(l.id, 'completed')} title="Marcar como realizada">✅</button>
                                            )}
                                            {l.status === 'scheduled' && (
                                                <button className="btn-lesson-action btn-cancel" onClick={() => handleCancelLesson(l)} title="Cancelar aula">🚫</button>
                                            )}
                                            {l.status === 'completed' && (
                                                <button className="btn-lesson-action btn-revert" onClick={() => handleStatusChange(l.id, 'scheduled')} title="Reverter para agendada">↩️</button>
                                            )}
                                            {l.status === 'cancelled' && (
                                                <button className="btn-lesson-action btn-reschedule" onClick={() => { setSelectedDay(null); handleReschedule(l); }} title="Reagendar (criar nova)">🔄</button>
                                            )}
                                            <button className="btn-lesson-action btn-delete" onClick={() => handleDeleteLesson(l.id)} title="Excluir">🗑️</button>
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

            {/* ── Create / Edit Lesson Modal ───────────────────── */}
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
                                    <select value={form.enrollment_id} onChange={e => handleEnrollmentChange(e.target.value)}>
                                        <option value="">— Sem vínculo —</option>
                                        {enrollments.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.students?.name || '?'} — {e.day_of_week ? (DAY_SHORT_TO_LABEL[e.day_of_week] || '?') : '?'} {e.class_time || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Data *</label>
                                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Horário *</label>
                                    <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Duração</label>
                                    <input type="number" min={15} max={240} step={5} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
                                </div>
                                {!form.enrollment_id && (
                                    <>
                                        <div className="form-group">
                                            <label>Aluno</label>
                                            <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}>
                                                <option value="">Selecione...</option>
                                                {students.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Professor</label>
                                            <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                                                <option value="">Selecione...</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Instrumento</label>
                                            <input type="text" value={form.instrument} onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))} />
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>Tipo de Aula</label>
                                    <select value={form.lesson_type} onChange={e => setForm(f => ({ ...f, lesson_type: e.target.value }))}>
                                        <option value="regular">Regular</option>
                                        <option value="make_up">Reposição</option>
                                        <option value="extra">Extra</option>
                                        <option value="trial">Experimental</option>
                                    </select>
                                </div>
                                {form.id && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            <option value="scheduled">📅 Agendada</option>
                                            <option value="completed">✅ Realizada</option>
                                            <option value="cancelled">❌ Cancelada</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group form-group-full">
                                    <label>Observações</label>
                                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
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
