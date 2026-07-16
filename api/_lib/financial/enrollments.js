/**
 * api/_lib/financial/enrollments.js
 * CRUD de Vínculos Pedagógicos (Etapa 37): aluno + professor + instrumento +
 * dia/horário + valor. Base tanto para cobrança (tuitions) quanto Agenda.
 */
import { genId, normalizeOptionalFields, safeFloat, safeInt, parsePagination } from './helpers.js';

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
