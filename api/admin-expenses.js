/**
 * api/admin-expenses.js
 * Gerenciamento de despesas pelo painel admin.
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

function generateExpenseId() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EX-${randomPart}`;
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
            const { paid, month, year } = req.query;

            let query = supabase
                .from('expenses')
                .select('*')
                .order('due_date', { ascending: false });

            if (paid !== undefined && paid !== '') {
                query = query.eq('paid', paid === 'true');
            }

            if (month && year) {
                // Filtro por mês/ano do vencimento (due_date)
                const start = `${year}-${month.padStart(2, '0')}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                const end = `${year}-${month.padStart(2, '0')}-${lastDay}`;
                
                query = query.gte('due_date', start).lte('due_date', end);
            }

            const { data, error } = await query;
            if (error) throw error;

            return res.status(200).json({ expenses: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao listar despesas.', details: err.message });
        }
    }

    if (method === 'POST') {
        try {
            const { description, amount, category, due_date, paid, paid_at } = req.body;
            if (!description || !amount || !due_date) {
                return res.status(400).json({ error: 'descrição, valor e data de vencimento são obrigatórios.' });
            }

            const id = generateExpenseId();
            const { data, error } = await supabase
                .from('expenses')
                .insert([{
                    id,
                    description,
                    amount: parseFloat(amount),
                    category: category || 'outro',
                    due_date,
                    paid: paid || false,
                    paid_at: paid ? (paid_at || new Date().toISOString()) : null
                }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json({ expense: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao criar despesa.', details: err.message });
        }
    }

    if (method === 'PATCH') {
        try {
            const { id, description, amount, category, due_date, paid, paid_at } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID da despesa é obrigatório.' });
            }

            const updateData = {};
            if (description !== undefined) updateData.description = description;
            if (amount !== undefined) updateData.amount = parseFloat(amount);
            if (category !== undefined) updateData.category = category;
            if (due_date !== undefined) updateData.due_date = due_date;
            if (paid !== undefined) updateData.paid = paid;
            if (paid_at !== undefined) updateData.paid_at = paid_at;

            // Se marcar como pago e não tiver paid_at definido, preenche com now()
            if (paid === true && !updateData.paid_at) {
                updateData.paid_at = new Date().toISOString();
            } else if (paid === false) {
                // Se desmarcar como pago, limpa paid_at
                updateData.paid_at = null;
            }

            const { data, error } = await supabase
                .from('expenses')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ expense: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao atualizar despesa.', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
