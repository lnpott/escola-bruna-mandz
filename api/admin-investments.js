/**
 * api/admin-investments.js
 * Gerenciamento de investimentos pelo painel admin.
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

function generateInvestmentId() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `IN-${randomPart}`;
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
            const { category, month, year } = req.query;

            let query = supabase
                .from('investments')
                .select('*')
                .order('purchased_at', { ascending: false });

            if (category) {
                query = query.eq('category', category);
            }

            if (month && year) {
                // Filtro por mês/ano do purchased_at (date format YYYY-MM-DD)
                const start = `${year}-${month.padStart(2, '0')}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                const end = `${year}-${month.padStart(2, '0')}-${lastDay}`;
                
                query = query.gte('purchased_at', start).lte('purchased_at', end);
            }

            const { data, error } = await query;
            if (error) throw error;

            return res.status(200).json({ investments: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao listar investimentos.', details: err.message });
        }
    }

    if (method === 'POST') {
        try {
            const { description, amount, category, purchased_at, notes } = req.body;
            if (!description || !amount || !purchased_at) {
                return res.status(400).json({ error: 'descrição, valor e data de compra são obrigatórios.' });
            }

            const id = generateInvestmentId();
            const { data, error } = await supabase
                .from('investments')
                .insert([{
                    id,
                    description,
                    amount: parseFloat(amount),
                    category: category || 'outro',
                    purchased_at,
                    notes: notes || null
                }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json({ investment: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao registrar investimento.', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
