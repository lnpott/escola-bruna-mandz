/**
 * api/_lib/financial/enrollments.js
 * CRUD de Vínculos Pedagógicos (Etapa 37): aluno + professor + instrumento +
 * dia/horário + valor. Base tanto para cobrança (tuitions) quanto Agenda.
 */
import { genId, normalizeOptionalFields, safeFloat, safeInt, parsePagination } from './helpers.js';

/** Calcula end_time a partir de start_time + duration_minutes */
function computeEndTime(startTime, durationMinutes) {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMinutes;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

export async function handleEnrollments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { student_id, teacher_id, status, day_of_week } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('enrollments')
            .select('*, students(name), teachers(name, specialty)', { count: 'exact' })
            .order('day_of_week', { ascending: true })
            .range(offset, offset + limit - 1);
        if (student_id)  q = q.eq('student_id', student_id);
        if (teacher_id)  q = q.eq('teacher_id', teacher_id);
        if (status)      q = q.eq('status', status);
        if (day_of_week) q = q.eq('day_of_week', day_of_week);
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ enrollments: data });
    }

    if (method === 'POST') {
        // ── Action: generate_lessons ────────────────────────────
        // Gera N semanas de aulas a partir do enrollment.
        if (req.body.action === 'generate_lessons') {
            const { id, weeks } = req.body;
            if (!id) return res.status(400).json({ error: 'ID do vínculo é obrigatório.' });
            const numWeeks = safeInt(weeks, 4, 1);

            const { data: enrollment, error: fetchErr } = await supabase
                .from('enrollments')
                .select('*, students(name), teachers(name, specialty)')
                .eq('id', id)
                .single();
            if (fetchErr || !enrollment) {
                return res.status(404).json({ error: 'Vínculo não encontrado.' });
            }
            if (enrollment.status !== 'active') {
                return res.status(400).json({ error: 'Vínculo não está ativo.' });
            }
            if (!enrollment.day_of_week || !enrollment.class_time) {
                return res.status(400).json({ error: 'Vínculo não tem dia da semana ou horário definidos.' });
            }

            // Mapeia day_of_week para índice (0=Dom, 1=Seg, ..., 6=Sáb)
            const DAY_MAP = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
            const targetDay = DAY_MAP[enrollment.day_of_week];
            if (targetDay === undefined) {
                return res.status(400).json({ error: `Dia da semana inválido: ${enrollment.day_of_week}` });
            }

            // Calcula a próxima data que cai no dia da semana desejado
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const currentDay = today.getDay();
            let daysUntilTarget = (targetDay - currentDay + 7) % 7;
            if (daysUntilTarget === 0) daysUntilTarget = 7; // próxima semana, não hoje

            const firstDate = new Date(today);
            firstDate.setDate(firstDate.getDate() + daysUntilTarget);

            // Para o número de semanas, cria aulas em datas que caem no dia certo
            const endTime = computeEndTime(enrollment.class_time, enrollment.duration_minutes);
            let created = 0;
            let skipped = 0;

            for (let w = 0; w < numWeeks; w++) {
                const lessonDate = new Date(firstDate);
                lessonDate.setDate(lessonDate.getDate() + (w * 7));
                const dateStr = lessonDate.toISOString().split('T')[0];

                const lessonId = genId('LS');
                const lessonPayload = {
                    id: lessonId,
                    enrollment_id: enrollment.id,
                    student_id: enrollment.student_id,
                    teacher_id: enrollment.teacher_id,
                    instrument: enrollment.instrument,
                    date: dateStr,
                    start_time: enrollment.class_time,
                    end_time: endTime,
                    duration_minutes: enrollment.duration_minutes,
                    lesson_type: 'regular',
                    status: 'scheduled',
                    notes: `Gerado automaticamente do vínculo ${enrollment.id}`,
                };

                try {
                    const { error: insErr } = await supabase
                        .from('lessons')
                        .insert([lessonPayload]);
                    if (insErr) {
                        if (insErr.code === '23505') {
                            skipped++; // Conflito de horário, pula
                        } else {
                            throw insErr;
                        }
                    } else {
                        created++;
                    }
                } catch (innerErr) {
                    if (innerErr.code === '23505') {
                        skipped++;
                    } else {
                        throw innerErr;
                    }
                }
            }

            return res.status(201).json({
                created,
                skipped,
                enrollment: enrollment.id,
                weeks: numWeeks,
                message: `${created} aula(s) gerada(s)${skipped > 0 ? `, ${skipped} pulada(s) por conflito de horário.` : '.'}`,
            });
        }

        const {
            student_id, teacher_id, instrument, day_of_week, class_time,
            duration_minutes, classes_per_week, monthly_fee, billing_type,
            total_amount, installments, status, notes,
        } = req.body;

        if (!student_id) return res.status(400).json({ error: 'student_id é obrigatório.' });

        const bt = billing_type || 'monthly';
        if (bt === 'full' && safeFloat(total_amount, 0) <= 0) {
            return res.status(400).json({ error: 'Para cobrança Completa, o valor total (total_amount) é obrigatório.' });
        }

        const payload = {
            id: genId('EN'),
            student_id,
            teacher_id,
            instrument,
            day_of_week: day_of_week || null,
            class_time: class_time || null,
            duration_minutes: safeInt(duration_minutes, 60),
            classes_per_week: safeInt(classes_per_week, 1),
            monthly_fee: safeFloat(monthly_fee, 0),
            billing_type: bt,
            total_amount: bt === 'full' ? safeFloat(total_amount, 0, 0) : null,
            installments: safeInt(installments, 1),
            status: status || 'active',
            notes,
        };

        normalizeOptionalFields(payload, ['teacher_id', 'instrument', 'notes']);

        const { data, error } = await supabase
            .from('enrollments')
            .insert([payload])
            .select('*, students(name), teachers(name, specialty)')
            .single();
        if (error) throw error;

        return res.status(201).json({ enrollment: data });
    }

    if (method === 'PATCH') {
        const {
            id, teacher_id, instrument, day_of_week, class_time,
            duration_minutes, classes_per_week, monthly_fee, billing_type,
            total_amount, installments, status, notes,
        } = req.body;

        if (!id) return res.status(400).json({ error: 'ID do vínculo (enrollment) é obrigatório.' });

        const upd = {};
        if (teacher_id       !== undefined) upd.teacher_id       = teacher_id || null;
        if (instrument       !== undefined) upd.instrument       = instrument || null;
        if (day_of_week      !== undefined) upd.day_of_week      = day_of_week || null;
        if (class_time       !== undefined) upd.class_time       = class_time || null;
        if (duration_minutes !== undefined) upd.duration_minutes = safeInt(duration_minutes, 60);
        if (classes_per_week !== undefined) upd.classes_per_week = safeInt(classes_per_week, 1);
        if (monthly_fee      !== undefined) upd.monthly_fee      = safeFloat(monthly_fee, 0);
        if (billing_type     !== undefined) upd.billing_type     = billing_type;
        if (total_amount     !== undefined) upd.total_amount     = total_amount ? safeFloat(total_amount, 0, 0) : null;
        if (installments     !== undefined) upd.installments     = safeInt(installments, 1);
        if (status           !== undefined) upd.status           = status;
        if (notes            !== undefined) upd.notes            = notes;

        const { data, error } = await supabase
            .from('enrollments')
            .update(upd)
            .eq('id', id)
            .select('*, students(name), teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(200).json({ enrollment: data });
    }

    if (method === 'DELETE') {
        const { id, cancel_tuitions } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do vínculo (enrollment) é obrigatório na query string.' });

        const { count, error: countError } = await supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .eq('enrollment_id', id);
        if (countError) throw countError;

        if (count && count > 0) {
            return res.status(409).json({
                error: `Não é possível excluir esta matrícula: existem ${count} aula(s) vinculada(s). Cancele ou desvincule as aulas primeiro.`
            });
        }

        // Se solicitado, cancela mensalidades pendentes/atrasadas do vínculo
        let cancelledCount = 0;
        if (cancel_tuitions === 'true') {
            const { data: tuitions, error: tErr } = await supabase
                .from('tuitions')
                .select('id')
                .eq('enrollment_id', id)
                .in('status', ['pending', 'overdue']);
            if (tErr) throw tErr;

            if (tuitions && tuitions.length > 0) {
                const { error: updErr } = await supabase
                    .from('tuitions')
                    .update({ status: 'cancelled', notes: 'Cancelada automaticamente ao excluir vínculo.' })
                    .eq('enrollment_id', id)
                    .in('status', ['pending', 'overdue']);
                if (updErr) throw updErr;
                cancelledCount = tuitions.length;
            }
        }

        const { error } = await supabase.from('enrollments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({
            success: true,
            cancelled_tuitions: cancelledCount,
            message: cancelledCount > 0
                ? `${cancelledCount} mensalidade(s) cancelada(s) e vínculo excluído.`
                : 'Vínculo excluído com sucesso.',
        });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
