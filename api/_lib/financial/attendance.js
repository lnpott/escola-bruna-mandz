/**
 * api/_lib/financial/attendance.js
 * Registro de presença do aluno em uma aula. Upsert por (lesson_id, student_id)
 * — marcar presença duas vezes para a mesma aula/aluno atualiza o registro
 * em vez de duplicar.
 */
import { genId, normalizeOptionalFields, safeInt, parsePagination } from './helpers.js';

const ATTENDANCE_SELECT = '*, lessons(date, start_time, end_time, students(name)), students!attendance_student_id_fkey(name)';

export async function handleAttendance(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { lesson_id, student_id, status } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('attendance')
            .select(ATTENDANCE_SELECT, { count: 'exact' })
            .order('recorded_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (lesson_id)  q = q.eq('lesson_id', lesson_id);
        if (student_id) q = q.eq('student_id', student_id);
        if (status)     q = q.eq('status', status);

        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ attendance: data });
    }

    if (method === 'POST') {
        const { lesson_id, student_id, status: attStatus, late_minutes, notes } = req.body;

        if (!lesson_id || !student_id) {
            return res.status(400).json({ error: 'lesson_id e student_id são obrigatórios.' });
        }

        // Upsert de forma atômica por (lesson_id, student_id).
        // Se o registro já existir, mantemos o ID original. Se não existir, geramos um novo ID ('AT-xxxxx').
        const existingRecord = await supabase
            .from('attendance')
            .select('id')
            .eq('lesson_id', lesson_id)
            .eq('student_id', student_id)
            .maybeSingle();

        const upsertPayload = {
            id: existingRecord?.data?.id || genId('AT'),
            lesson_id,
            student_id,
            status: attStatus || 'present',
            late_minutes: safeInt(late_minutes, 0),
            notes,
            recorded_at: new Date().toISOString(),
        };
        normalizeOptionalFields(upsertPayload, ['notes']);

        // Se porventura houver corrida de concorrência, o Supabase upsert por onConflict (lesson_id, student_id)
        // garante a unicidade do registro.
        const { data, error } = await supabase
            .from('attendance')
            .upsert(upsertPayload, { onConflict: 'lesson_id,student_id', ignoreDuplicates: false })
            .select(ATTENDANCE_SELECT)
            .single();

        if (error) throw error;
        return res.status(201).json({ attendance: data });
    }

    if (method === 'PATCH') {
        const { id, status: attStatus, late_minutes, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do registro de presença é obrigatório.' });

        const upd = {};
        if (attStatus !== undefined)    upd.status = attStatus;
        if (late_minutes !== undefined) upd.late_minutes = safeInt(late_minutes, 0);
        if (notes !== undefined)        upd.notes = notes;

        const { data, error } = await supabase
            .from('attendance')
            .update(upd)
            .eq('id', id)
            .select(ATTENDANCE_SELECT)
            .single();

        if (error) throw error;
        return res.status(200).json({ attendance: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do registro de presença é obrigatório na query string.' });
        const { error } = await supabase.from('attendance').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
