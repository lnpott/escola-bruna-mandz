/**
 * api/admin-tuitions.js
 * Gerenciamento de mensalidades pelo painel admin.
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

function generateTuitionId() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TU-${randomPart}`;
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
            const { status, month, year, student_id } = req.query;

            let query = supabase
                .from('tuitions')
                .select('*, students(name)')
                .order('due_date', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }
            if (student_id) {
                query = query.eq('student_id', student_id);
            }

            if (month && year) {
                // Filtro por mês/ano. due_date é tipo DATE (YYYY-MM-DD)
                const start = `${year}-${month.padStart(2, '0')}-01`;
                // Calcula fim do mês de forma simples
                const lastDay = new Date(year, month, 0).getDate();
                const end = `${year}-${month.padStart(2, '0')}-${lastDay}`;
                
                query = query.gte('due_date', start).lte('due_date', end);
            }

            const { data, error } = await query;
            if (error) throw error;

            return res.status(200).json({ tuitions: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao listar mensalidades.', details: err.message });
        }
    }

    if (method === 'POST') {
        try {
            const { student_id, amount, discount_amount, discount_reason, due_date, status, notes } = req.body;
            if (!student_id || !amount || !due_date) {
                return res.status(400).json({ error: 'student_id, amount e due_date são obrigatórios.' });
            }

            const id = generateTuitionId();
            const { data, error } = await supabase
                .from('tuitions')
                .insert([{
                    id,
                    student_id,
                    amount: parseFloat(amount),
                    discount_amount: parseFloat(discount_amount || 0),
                    discount_reason: discount_reason || null,
                    due_date,
                    status: status || 'pending',
                    notes: notes || null
                }])
                .select('*, students(name)')
                .single();

            if (error) throw error;
            return res.status(201).json({ tuition: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao criar mensalidade.', details: err.message });
        }
    }

    if (method === 'PATCH') {
        try {
            const { id, status, payment_method, paid_at, discount_amount, discount_reason, amount, notes, due_date } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID da mensalidade é obrigatório.' });
            }

            const updateData = {};
            if (status !== undefined) updateData.status = status;
            if (payment_method !== undefined) updateData.payment_method = payment_method;
            if (paid_at !== undefined) updateData.paid_at = paid_at;
            if (discount_amount !== undefined) updateData.discount_amount = parseFloat(discount_amount || 0);
            if (discount_reason !== undefined) updateData.discount_reason = discount_reason;
            if (amount !== undefined) updateData.amount = parseFloat(amount);
            if (notes !== undefined) updateData.notes = notes;
            if (due_date !== undefined) updateData.due_date = due_date;

            // Se marcar como pago e não tiver paid_at definido, preenche com now()
            if (status === 'paid' && !updateData.paid_at) {
                updateData.paid_at = new Date().toISOString();
            } else if (status !== 'paid') {
                // Se desmarcar como pago, limpa paid_at e payment_method
                updateData.paid_at = null;
                updateData.payment_method = null;
            }

            const { data, error } = await supabase
                .from('tuitions')
                .update(updateData)
                .eq('id', id)
                .select('*, students(name)')
                .single();

            if (error) throw error;
            return res.status(200).json({ tuition: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao atualizar mensalidade.', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
