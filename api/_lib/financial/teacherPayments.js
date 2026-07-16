/**
 * api/_lib/financial/teacherPayments.js
 * Pagamentos a professores por mês de referência.
 * - CRUD manual (GET/POST/PATCH/DELETE)
 * - Geração automática: action=generate calcula rate_per_class × aulas
 *   completadas no mês e cria os registros automaticamente.
 */
import { genId, normalizeOptionalFields, safeFloat, resolvePaidTimestamp, normalizeMonthDate, parsePagination, monthRange } from './helpers.js';

export async function handleTeacherPayments(req, res, supabase) {
    const { method } = req;

    // ── Ação especial: gerar pagamentos automaticamente ──────────────
    if (method === 'GET' && req.query.action === 'generate') {
        return await handleGenerateTeacherPayments(req, res, supabase);
    }

    if (method === 'GET') {
        const { teacher_id, month, year, paid } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('teacher_payments')
            .select('*, teachers(name, specialty)', { count: 'exact' })
            .order('reference_month', { ascending: false })
            .range(offset, offset + limit - 1);
        if (teacher_id) q = q.eq('teacher_id', teacher_id);
        if (paid !== undefined && paid !== '') q = q.eq('paid', paid === 'true');
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('reference_month', dateStart).lte('reference_month', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ teacher_payments: data });
    }

    if (method === 'POST') {
        const { teacher_id, reference_month, amount, paid, paid_at, notes } = req.body;
        if (!teacher_id || !reference_month || !amount)
            return res.status(400).json({ error: 'teacher_id, reference_month e amount são obrigatórios.' });

        const normalizedRefMonth = normalizeMonthDate(reference_month);
        if (!normalizedRefMonth) {
            return res.status(400).json({ error: 'reference_month inválido. Use o formato YYYY-MM ou YYYY-MM-DD.' });
        }

        const payload = {
            id: genId('TP'),
            teacher_id,
            reference_month: normalizedRefMonth,
            amount: safeFloat(amount, 0, 0),
            paid: paid || false,
            paid_at: paid ? (paid_at || new Date().toISOString()) : null,
            notes,
        };

        normalizeOptionalFields(payload, ['notes']);

        const { data, error } = await supabase
            .from('teacher_payments')
            .insert([payload])
            .select('*, teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(201).json({ teacher_payment: data });
    }

    if (method === 'PATCH') {
        const { id, amount, paid, paid_at, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do pagamento ao professor é obrigatório.' });

        const upd = {};
        if (amount !== undefined) upd.amount = safeFloat(amount, 0, 0);
        if (notes  !== undefined) upd.notes  = notes;
        if (paid   !== undefined) upd.paid   = paid;
        if (paid_at !== undefined) upd.paid_at = paid_at;

        resolvePaidTimestamp(upd, paid);

        const { data, error } = await supabase
            .from('teacher_payments')
            .update(upd)
            .eq('id', id)
            .select('*, teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(200).json({ teacher_payment: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do pagamento ao professor é obrigatório na query string.' });
        const { error } = await supabase.from('teacher_payments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

/**
 * Gera pagamentos a professores automaticamente para um mês/ano.
 *
 * Regra de negócio:
 *   teacher_payment = teacher.rate_per_class × total de aulas completadas
 *   no mês onde aquele professor deu aula.
 *
 * Só cria registros que ainda não existem (evita duplicação).
 */
async function handleGenerateTeacherPayments(req, res, supabase) {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: 'month e year são obrigatórios.' });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || m < 1 || m > 12 || isNaN(y) || y < 2000) {
        return res.status(400).json({ error: 'month (1-12) e year (>=2000) inválidos.' });
    }

    const { dateStart, dateEnd } = monthRange(m, y);
    const normalizedRefMonth = normalizeMonthDate(`${y}-${String(m).padStart(2, '0')}`);

    // 1) Busca todos os professores ativos com rate_per_class > 0
    const { data: teachers, error: tErr } = await supabase
        .from('teachers')
        .select('id, name, rate_per_class')
        .eq('active', true)
        .gt('rate_per_class', 0);
    if (tErr) throw tErr;

    if (!teachers || teachers.length === 0) {
        return res.status(200).json({
            generated: [],
            message: 'Nenhum professor ativo com rate_per_class > 0 encontrado.',
        });
    }

    // 2) Para cada professor, conta aulas completadas no mês
    const results = [];

    for (const teacher of teachers) {
        // Conta lessons completadas (status = 'completed') do professor no período
        const { count: completedCount, error: lErr } = await supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', teacher.id)
            .eq('status', 'completed')
            .gte('date', dateStart)
            .lte('date', dateEnd);
        if (lErr) throw lErr;

        const totalLessons = completedCount || 0;
        if (totalLessons === 0) {
            results.push({
                teacher_id: teacher.id,
                teacher_name: teacher.name,
                completed_lessons: 0,
                amount: 0,
                created: false,
                reason: 'Nenhuma aula completada no período',
            });
            continue;
        }

        const calculatedAmount = Number(teacher.rate_per_class) * totalLessons;

        // 3) Verifica se já existe pagamento para este professor + mês
        const { data: existing, error: eErr } = await supabase
            .from('teacher_payments')
            .select('id')
            .eq('teacher_id', teacher.id)
            .eq('reference_month', normalizedRefMonth)
            .maybeSingle();
        if (eErr) throw eErr;

        if (existing) {
            results.push({
                teacher_id: teacher.id,
                teacher_name: teacher.name,
                completed_lessons: totalLessons,
                amount: calculatedAmount,
                created: false,
                reason: 'Já existe pagamento para este mês',
            });
            continue;
        }

        // 4) Cria o registro de pagamento
        const payload = {
            id: genId('TP'),
            teacher_id: teacher.id,
            reference_month: normalizedRefMonth,
            amount: calculatedAmount,
            paid: false,
            notes: `Gerado automaticamente: ${totalLessons} aulas × R$ ${Number(teacher.rate_per_class).toFixed(2)}`,
        };

        const { data: created, error: cErr } = await supabase
            .from('teacher_payments')
            .insert([payload])
            .select('*, teachers(name, specialty)')
            .single();

        if (cErr) {
            results.push({
                teacher_id: teacher.id,
                teacher_name: teacher.name,
                completed_lessons: totalLessons,
                amount: calculatedAmount,
                created: false,
                reason: `Erro ao criar: ${cErr.message}`,
            });
            continue;
        }

        results.push({
            teacher_id: teacher.id,
            teacher_name: teacher.name,
            completed_lessons: totalLessons,
            amount: calculatedAmount,
            created: true,
            payment_id: created.id,
        });
    }

    const generated = results.filter(r => r.created);
    const skipped = results.filter(r => !r.created);

    return res.status(200).json({
        generated,
        skipped,
        summary: {
            total_teachers: teachers.length,
            generated_count: generated.length,
            skipped_count: skipped.length,
            total_amount: generated.reduce((s, r) => s + r.amount, 0),
        },
    });
}
