/**
 * api/_lib/financial/lessons.js
 * Aula real em data específica (ocorrência concreta de um enrollment).
 * Um índice único parcial (lessons_no_overlap_active) impede que o mesmo
 * professor tenha duas aulas não-canceladas no mesmo horário — o handler
 * traduz a violação (23505) em 409 com mensagem amigável.
 */
import { genId, normalizeOptionalFields, safeInt, parsePagination } from './helpers.js';

function computeEndTime(startTime, durationMinutes) {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMinutes;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

export async function handleLessons(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { date, date_from, date_to, student_id, teacher_id, enrollment_id, status, lesson_type } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('lessons')
            .select('*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)', { count: 'exact' })
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })
            .range(offset, offset + limit - 1);

        if (date)         q = q.eq('date', date);
        if (date_from)    q = q.gte('date', date_from);
        if (date_to)      q = q.lte('date', date_to);
        if (student_id)   q = q.eq('student_id', student_id);
        if (teacher_id)   q = q.eq('teacher_id', teacher_id);
        if (enrollment_id) q = q.eq('enrollment_id', enrollment_id);
        if (status)       q = q.eq('status', status);
        if (lesson_type)  q = q.eq('lesson_type', lesson_type);

        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ lessons: data });
    }

    if (method === 'POST') {
        const {
            enrollment_id, student_id, teacher_id, instrument, date, start_time,
            duration_minutes, status, lesson_type, notes,
        } = req.body;

        if (!date || !start_time) {
            return res.status(400).json({ error: 'date e start_time são obrigatórios.' });
        }

        let lessonStudentId = student_id || null;
        let lessonTeacherId = teacher_id || null;
        let lessonInstrument = instrument || null;
        const lessonEnrollmentId = enrollment_id || null;
        let lessonDuration = safeInt(duration_minutes, 60);

        // Se enrollment_id foi fornecido, busca os dados do vínculo
        if (enrollment_id) {
            const { data: enrollment, error: enrollmentError } = await supabase
                .from('enrollments')
                .select('*, students(name), teachers(name, specialty)')
                .eq('id', enrollment_id)
                .single();

            if (enrollmentError || !enrollment) {
                return res.status(404).json({ error: 'Vínculo (enrollment) não encontrado.' });
            }

            if (enrollment.status !== 'active') {
                return res.status(400).json({ error: 'Não é possível criar aula para um vínculo inativo.' });
            }

            lessonStudentId = enrollment.student_id;
            lessonTeacherId = enrollment.teacher_id;
            lessonInstrument = enrollment.instrument;
            lessonDuration = lessonDuration || (enrollment.duration_minutes || 60);
        }

        if (!lessonStudentId) {
            return res.status(400).json({ error: 'student_id é obrigatório (forneça enrollment_id ou student_id).' });
        }

        const dur = lessonDuration;
        const endTime = computeEndTime(start_time, dur);

        const payload = {
            id: genId('LS'),
            enrollment_id: lessonEnrollmentId,
            student_id: lessonStudentId,
            teacher_id: lessonTeacherId,
            instrument: lessonInstrument,
            date,
            start_time,
            end_time: endTime,
            duration_minutes: dur,
            lesson_type: lesson_type || 'regular',
            status: status || 'scheduled',
            notes,
        };
        normalizeOptionalFields(payload, ['notes']);

        const { data, error } = await supabase
            .from('lessons')
            .insert([payload])
            .select('*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Professor já tem aula neste horário. Escolha outro horário ou professor.' });
            }
            throw error;
        }

        return res.status(201).json({ lesson: data });
    }

    if (method === 'PATCH') {
        const { id, date, start_time, duration_minutes, status, lesson_type, notes } = req.body;

        if (!id) return res.status(400).json({ error: 'ID da aula é obrigatório.' });

        const upd = {};
        if (date !== undefined)             upd.date = date;
        if (start_time !== undefined)       upd.start_time = start_time;
        if (duration_minutes !== undefined) upd.duration_minutes = safeInt(duration_minutes, 60);
        if (status !== undefined)           upd.status = status;
        if (lesson_type !== undefined)      upd.lesson_type = lesson_type;
        if (notes !== undefined)            upd.notes = notes;

        // Se start_time ou duration_minutes mudaram, recalcula end_time
        if (start_time !== undefined || duration_minutes !== undefined) {
            const { data: currentLesson, error: fetchError } = await supabase
                .from('lessons')
                .select('start_time, duration_minutes')
                .eq('id', id)
                .single();
            if (fetchError) throw fetchError;

            const finalStart = start_time !== undefined ? start_time : currentLesson.start_time;
            const finalDur = duration_minutes !== undefined ? safeInt(duration_minutes, 60) : currentLesson.duration_minutes;
            upd.end_time = computeEndTime(finalStart, finalDur);
        }

        const { data, error } = await supabase
            .from('lessons')
            .update(upd)
            .eq('id', id)
            .select('*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Professor já tem aula neste horário. Verifique conflitos de agenda.' });
            }
            throw error;
        }

        return res.status(200).json({ lesson: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID da aula é obrigatório na query string.' });
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
