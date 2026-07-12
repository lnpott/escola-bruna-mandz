/**
 * api/_lib/admin/teachers.js
 * Resource: teachers (CRUD de professores).
 */

import { genId } from './shared.js';

export async function handleTeachers(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ teachers: data });
    }

    if (method === 'POST') {
        const { name, phone, specialty, days_of_week, rate_per_class } = req.body;
        if (!name) return res.status(400).json({ error: 'name é obrigatório.' });

        const days = Array.isArray(days_of_week)
            ? days_of_week
            : (typeof days_of_week === 'string' ? days_of_week.split(',').map(s => s.trim()).filter(Boolean) : []);

        const { data, error } = await supabase
            .from('teachers')
            .insert([{
                id: genId('TE'),
                name,
                phone: phone || null,
                specialty: specialty || null,
                days_of_week: days,
                rate_per_class: rate_per_class !== undefined && rate_per_class !== null ? parseFloat(rate_per_class) : 0,
            }])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ teacher: data });
    }

    if (method === 'PATCH') {
        const { id, name, phone, specialty, days_of_week, rate_per_class } = req.body;
        if (!id) return res.status(400).json({ error: 'id do professor é obrigatório.' });

        const upd = {};
        if (name !== undefined) upd.name = name;
        if (phone !== undefined) upd.phone = phone || null;
        if (specialty !== undefined) upd.specialty = specialty || null;
        if (rate_per_class !== undefined) upd.rate_per_class = parseFloat(rate_per_class || 0);

        if (days_of_week !== undefined) {
            const days = Array.isArray(days_of_week)
                ? days_of_week
                : (typeof days_of_week === 'string' ? days_of_week.split(',').map(s => s.trim()).filter(Boolean) : []);
            upd.days_of_week = days;
        }

        const { data, error } = await supabase
            .from('teachers')
            .update(upd)
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
