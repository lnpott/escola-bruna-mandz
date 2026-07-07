/**
 * api/admin-students.js
 * Gerenciamento de alunos pelo painel admin.
 * Protegido por header 'x-admin-password'.
 */

import { getSupabase } from './_lib/supabase.js';

function auth(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
        return false;
    }
    if (req.headers['x-admin-password'] !== adminPassword) {
        res.status(401).json({ error: 'Senha incorreta.' });
        return false;
    }
    return true;
}

function generateStudentId() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ST-${randomPart}`;
}

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        return res.status(500).json({ error: 'Supabase não configurado.', details: err.message });
    }

    const { method } = req;

    if (method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return res.status(200).json({ students: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao listar alunos.', details: err.message });
        }
    }

    if (method === 'POST') {
        try {
            const { name, email, phone, address, active } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Nome é obrigatório.' });
            }

            const id = generateStudentId();
            const { data, error } = await supabase
                .from('students')
                .insert([{
                    id,
                    name,
                    email: email || null,
                    phone: phone || null,
                    address: address || null,
                    active: active !== undefined ? active : true
                }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json({ student: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao criar aluno.', details: err.message });
        }
    }

    if (method === 'PATCH') {
        try {
            const { id, name, email, phone, address, active } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (email !== undefined) updateData.email = email || null;
            if (phone !== undefined) updateData.phone = phone || null;
            if (address !== undefined) updateData.address = address || null;
            if (active !== undefined) updateData.active = active;

            const { data, error } = await supabase
                .from('students')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ student: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao atualizar aluno.', details: err.message });
        }
    }

    if (method === 'DELETE') {
        try {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: 'ID do aluno é obrigatório na query string.' });
            }

            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao excluir aluno.', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
