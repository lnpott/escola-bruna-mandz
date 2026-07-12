/**
 * api/_lib/admin/students.js
 * Resource: students (CRUD de alunos).
 */

import { genId } from './shared.js';

export async function handleStudents(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ students: data });
    }

    if (method === 'POST') {
        const { name, email, phone, address, active } = req.body;
        if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });
        const { data, error } = await supabase
            .from('students')
            .insert([{ id: genId('ST'), name, email: email || null, phone: phone || null, address: address || null, active: active !== undefined ? active : true }])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ student: data });
    }

    if (method === 'PATCH') {
        const { id, name, email, phone, address, active } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
        const upd = {};
        if (name    !== undefined) upd.name    = name;
        if (email   !== undefined) upd.email   = email || null;
        if (phone   !== undefined) upd.phone   = phone || null;
        if (address !== undefined) upd.address = address || null;
        if (active  !== undefined) upd.active  = active;
        const { data, error } = await supabase.from('students').update(upd).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json({ student: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do aluno é obrigatório na query string.' });
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
