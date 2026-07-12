/**
 * api/_lib/financial/teachers.js
 * CRUD de Professores. `active` (boolean) é mantido aqui de propósito —
 * ao contrário de students, teachers não tem um ciclo de vida com múltiplos
 * estágios (lead→cancelled), então um boolean simples não é redundante.
 */
import { genId, normalizeOptionalFields, safeFloat, parsePagination } from './helpers.js';

export async function handleTeachers(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { limit, offset } = parsePagination(req);
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1);
        if (error) throw error;
        return res.status(200).json({ teachers: data });
    }

    if (method === 'POST') {
        const { name, cpf, email, phone, specialty, days_of_week, rate_per_class } = req.body;
        if (!name) return res.status(400).json({ error: 'name é obrigatório.' });

        const daysCsv = Array.isArray(days_of_week)
            ? days_of_week.map(s => String(s).trim()).filter(Boolean).join(', ')
            : (typeof days_of_week === 'string' ? days_of_week.trim() : null);

        const { data, error } = await supabase
            .from('teachers')
            .insert([normalizeOptionalFields({
                id: genId('TE'),
                name,
                cpf: cpf || null,
                email,
                phone: phone || null,
                specialty: specialty || null,
                days_of_week: daysCsv,
                rate_per_class: safeFloat(rate_per_class, 0),
            }, ['cpf', 'email', 'phone', 'specialty'])])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ teacher: data });
    }

    if (method === 'PATCH') {
        const { id, name, cpf, email, phone, specialty, days_of_week, rate_per_class, active } = req.body;
        if (!id) return res.status(400).json({ error: 'id do professor é obrigatório.' });

        const upd = {};
        if (name !== undefined) upd.name = name;
        if (cpf !== undefined) upd.cpf = cpf || null;
        if (email !== undefined) upd.email = email || null;
        if (phone !== undefined) upd.phone = phone || null;
        if (specialty !== undefined) upd.specialty = specialty || null;
        if (rate_per_class !== undefined) upd.rate_per_class = safeFloat(rate_per_class, 0);
        if (active !== undefined) upd.active = !!active;

        if (days_of_week !== undefined) {
            const daysCsv = Array.isArray(days_of_week)
                ? days_of_week.map(s => String(s).trim()).filter(Boolean).join(', ')
                : (typeof days_of_week === 'string' ? days_of_week.trim() : null);
            upd.days_of_week = daysCsv;
        }

        const { data, error } = await supabase
            .from('teachers')
            .update(normalizeOptionalFields(upd, ['cpf', 'email', 'phone', 'specialty']))
            .eq('id', id)
            .select().single();
        if (error) throw error;
        return res.status(200).json({ teacher: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do professor é obrigatório na query string.' });
        const { error } = await supabase.from('teachers').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
