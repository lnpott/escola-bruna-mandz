/**
 * api/admin-payments.js
 * Gerenciamento de pagamentos avulsos pelo painel admin.
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

function generatePaymentId() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PA-${randomPart}`;
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
                .from('payments')
                .select('*, students(name)')
                .order('paid_at', { ascending: false });

            if (category) {
                query = query.eq('category', category);
            }

            if (month && year) {
                // Filtro por mês/ano. paid_at é timestamptz
                const start = `${year}-${month.padStart(2, '0')}-01T00:00:00Z`;
                const lastDay = new Date(year, month, 0).getDate();
                const end = `${year}-${month.padStart(2, '0')}-${lastDay}T23:59:59Z`;
                
                query = query.gte('paid_at', start).lte('paid_at', end);
            }

            const { data, error } = await query;
            if (error) throw error;

            return res.status(200).json({ payments: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao listar pagamentos avulsos.', details: err.message });
        }
    }

    if (method === 'POST') {
        try {
            const { student_id, description, amount, payment_method, paid_at, category } = req.body;
            if (!description || !amount || !payment_method) {
                return res.status(400).json({ error: 'descrição, valor e forma de pagamento são obrigatórios.' });
            }

            const id = generatePaymentId();
            const { data, error } = await supabase
                .from('payments')
                .insert([{
                    id,
                    student_id: student_id || null,
                    description,
                    amount: parseFloat(amount),
                    payment_method,
                    paid_at: paid_at || new Date().toISOString(),
                    category: category || 'outro'
                }])
                .select('*, students(name)')
                .single();

            if (error) throw error;
            return res.status(201).json({ payment: data });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao registrar pagamento avulso.', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
