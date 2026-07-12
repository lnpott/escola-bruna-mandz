/**
 * api/_lib/admin/enrollments.js
 * Resource: enrollments (Etapa 37) — dono do vínculo pedagógico: aluno +
 * professor + instrumento + dia/horário + valor mensal. Base tanto para a
 * cobrança (tuitions) quanto para a Agenda.
 */

import { genId } from './shared.js';

export async function handleEnrollments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { student_id, teacher_id, status, day_of_week } = req.query;
        let q = supabase
            .from('enrollments')
            .select('*, students(name), teachers(name, specialty)')
            .order('day_of_week', { ascending: true });
        if (student_id)  q = q.eq('student_id', student_id);
        if (teacher_id)  q = q.eq('teacher_id', teacher_id);
        if (status)      q = q.eq('status', status);
        if (day_of_week) q = q.eq('day_of_week', day_of_week);
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ enrollments: data });
    }

    if (method === 'POST') {
        const {
            student_id,
            teacher_id,
            instrument,
            day_of_week,
            class_time,
            duration_minutes,
            classes_per_week,
            monthly_fee,
            status,
            notes,
        } = req.body;

        if (!student_id) return res.status(400).json({ error: 'student_id é obrigatório.' });

        const payload = {
            id: genId('EN'),
            student_id,
            teacher_id: teacher_id || null,
            instrument: instrument || null,
            day_of_week: day_of_week || null,
            class_time: class_time || null,
            duration_minutes: duration_minutes !== undefined && duration_minutes !== null ? parseInt(duration_minutes, 10) : 60,
            classes_per_week: classes_per_week !== undefined && classes_per_week !== null ? parseInt(classes_per_week, 10) : 1,
            monthly_fee: monthly_fee !== undefined && monthly_fee !== null ? parseFloat(monthly_fee) : 0,
            status: status || 'active',
            notes: notes || null,
        };

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
            id,
            teacher_id,
            instrument,
            day_of_week,
            class_time,
            duration_minutes,
            classes_per_week,
            monthly_fee,
            status,
            notes,
        } = req.body;

        if (!id) return res.status(400).json({ error: 'ID do vínculo (enrollment) é obrigatório.' });

        const upd = {};
        if (teacher_id       !== undefined) upd.teacher_id       = teacher_id || null;
        if (instrument       !== undefined) upd.instrument       = instrument || null;
        if (day_of_week      !== undefined) upd.day_of_week      = day_of_week || null;
        if (class_time       !== undefined) upd.class_time       = class_time || null;
        if (duration_minutes !== undefined) upd.duration_minutes = parseInt(duration_minutes, 10);
        if (classes_per_week !== undefined) upd.classes_per_week = parseInt(classes_per_week, 10);
        if (monthly_fee      !== undefined) upd.monthly_fee      = parseFloat(monthly_fee);
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
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do vínculo (enrollment) é obrigatório na query string.' });
        const { error } = await supabase.from('enrollments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
