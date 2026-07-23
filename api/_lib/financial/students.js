/**
 * api/_lib/financial/students.js
 * CRUD de Alunos.
 *
 * ── Refatoração (jul/2026) ──────────────────────────────────────────────────
 * O campo `students.active` (boolean) foi REMOVIDO do schema. Antes, o
 * sistema mantinha `active` e `status` (7 valores: lead..cancelled) em
 * paralelo, exigindo lógica de sincronização dupla em cada POST/PATCH e
 * criando risco de os dois campos ficarem inconsistentes entre si.
 * Agora `status` é a única fonte de verdade. "Aluno ativo" = status = 'active'.
 */
import { genId, parsePagination, normalizeOptionalFields } from './helpers.js';

const VALID_STATUS = ['lead', 'interested', 'enrolled', 'active', 'suspended', 'completed', 'cancelled'];
const VALID_SOURCE = ['website', 'indicacao', 'social', 'presencial', 'outro'];

export async function handleStudents(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { limit, offset } = parsePagination(req);
        const { status, id, search } = req.query;
        let q = supabase
            .from('students')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1);
        if (id) q = q.eq('id', id);
        if (status) q = q.eq('status', status);
        if (search) q = q.ilike('name', `%${search}%`);
        const { data, count, error } = await q;
        if (error) throw error;
        return res.status(200).json({ students: data, count: count ?? (data?.length || 0) });
    }

    if (method === 'POST') {
        const { name, cpf, email, phone, address, status, enrolled_at, source, instruments, guardian_name, guardian_cpf, guardian_phone } = req.body;
        if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });

        if (status !== undefined && !VALID_STATUS.includes(status)) {
            return res.status(400).json({ error: `status inválido. Use um de: ${VALID_STATUS.join(', ')}.` });
        }
        if (source && !VALID_SOURCE.includes(source)) {
            return res.status(400).json({ error: `source inválido. Use um de: ${VALID_SOURCE.join(', ')}.` });
        }

        const instrumentsStr = Array.isArray(instruments) ? instruments.join(', ') : (instruments || '');

        const payload = {
            id: genId('ST'),
            name,
            cpf,
            email,
            phone,
            address,
            instruments: instrumentsStr,
            status: status || 'active',
            enrolled_at: enrolled_at || null,
            source,
            guardian_name,
            guardian_cpf,
            guardian_phone,
        };

        normalizeOptionalFields(payload, ['cpf', 'email', 'phone', 'address', 'source', 'guardian_name', 'guardian_cpf', 'guardian_phone']);

        const { data, error } = await supabase
            .from('students')
            .insert([payload])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ student: data });
    }

    if (method === 'PATCH') {
        const { id, name, cpf, email, phone, address, status, enrolled_at, source, instruments, guardian_name, guardian_cpf, guardian_phone } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do aluno é obrigatório.' });

        if (status !== undefined && !VALID_STATUS.includes(status)) {
            return res.status(400).json({ error: `status inválido. Use um de: ${VALID_STATUS.join(', ')}.` });
        }
        if (source && !VALID_SOURCE.includes(source)) {
            return res.status(400).json({ error: `source inválido. Use um de: ${VALID_SOURCE.join(', ')}.` });
        }

        const upd = {};
        if (name    !== undefined) upd.name    = name;
        if (cpf     !== undefined) upd.cpf     = cpf || null;
        if (email   !== undefined) upd.email   = email || null;
        if (phone   !== undefined) upd.phone   = phone || null;
        if (address !== undefined) upd.address = address || null;
        if (status  !== undefined) upd.status  = status;
        if (enrolled_at !== undefined) upd.enrolled_at = enrolled_at || null;
        if (source     !== undefined) upd.source     = source || null;
        if (instruments !== undefined) upd.instruments = Array.isArray(instruments) ? instruments.join(', ') : instruments;
        if (guardian_name !== undefined) upd.guardian_name = guardian_name || null;
        if (guardian_cpf  !== undefined) upd.guardian_cpf  = guardian_cpf || null;
        if (guardian_phone !== undefined) upd.guardian_phone = guardian_phone || null;

        const { data, error } = await supabase.from('students').update(
            normalizeOptionalFields(upd, ['cpf', 'email', 'phone', 'address', 'source', 'guardian_name', 'guardian_cpf', 'guardian_phone'])
        ).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json({ student: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do aluno é obrigatório na query string.' });

        // Verifica se existem vínculos ativos para este aluno
        const { count, error: countError } = await supabase
            .from('enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', id)
            .eq('status', 'active');
        if (countError) throw countError;

        if (count && count > 0) {
            return res.status(409).json({
                error: `Não é possível excluir este aluno: existem ${count} vínculo(s) ativo(s) vinculado(s) a ele. Remova ou inative os vínculos primeiro.`
            });
        }

        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
