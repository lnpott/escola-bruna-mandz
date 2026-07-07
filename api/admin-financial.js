/**
 * api/admin-financial.js
 * API financeira consolidada para o painel admin.
 * Roteamento interno por query string: ?resource=students|tuitions|payments|expenses|investments|summary
 * Protegido por header 'x-admin-password'.
 *
 * Consolida os 6 endpoints anteriores em 1 único arquivo para respeitar o
 * limite de 12 Serverless Functions do Vercel Hobby plan.
 */

import { getSupabase } from './_lib/supabase.js';

// ── Auth ──────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function monthRange(month, year) {
    const m = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    return {
        dateStart: `${year}-${m}-01`,
        dateEnd:   `${year}-${m}-${lastDay}`,
        tzStart:   `${year}-${m}-01T00:00:00.000Z`,
        tzEnd:     `${year}-${m}-${lastDay}T23:59:59.999Z`,
    };
}

// ── Handlers por resource ─────────────────────────────────────────────────────

async function handleStudents(req, res, supabase) {
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

async function handleTuitions(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { status, month, year, student_id } = req.query;
        let q = supabase.from('tuitions').select('*, students(name)').order('due_date', { ascending: false });
        if (status)     q = q.eq('status', status);
        if (student_id) q = q.eq('student_id', student_id);
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('due_date', dateStart).lte('due_date', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ tuitions: data });
    }

    if (method === 'POST') {
        const { student_id, amount, discount_amount, discount_reason, due_date, status, notes } = req.body;
        if (!student_id || !amount || !due_date)
            return res.status(400).json({ error: 'student_id, amount e due_date são obrigatórios.' });
        const { data, error } = await supabase
            .from('tuitions')
            .insert([{ id: genId('TU'), student_id, amount: parseFloat(amount), discount_amount: parseFloat(discount_amount || 0), discount_reason: discount_reason || null, due_date, status: status || 'pending', notes: notes || null }])
            .select('*, students(name)').single();
        if (error) throw error;
        return res.status(201).json({ tuition: data });
    }

    if (method === 'PATCH') {
        const { id, status, payment_method, paid_at, discount_amount, discount_reason, amount, notes, due_date } = req.body;
        if (!id) return res.status(400).json({ error: 'ID da mensalidade é obrigatório.' });
        const upd = {};
        if (status           !== undefined) upd.status           = status;
        if (payment_method   !== undefined) upd.payment_method   = payment_method;
        if (paid_at          !== undefined) upd.paid_at          = paid_at;
        if (discount_amount  !== undefined) upd.discount_amount  = parseFloat(discount_amount || 0);
        if (discount_reason  !== undefined) upd.discount_reason  = discount_reason;
        if (amount           !== undefined) upd.amount           = parseFloat(amount);
        if (notes            !== undefined) upd.notes            = notes;
        if (due_date         !== undefined) upd.due_date         = due_date;
        if (status === 'paid' && !upd.paid_at) upd.paid_at = new Date().toISOString();
        else if (status && status !== 'paid') { upd.paid_at = null; upd.payment_method = null; }
        const { data, error } = await supabase.from('tuitions').update(upd).eq('id', id).select('*, students(name)').single();
        if (error) throw error;
        return res.status(200).json({ tuition: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handlePayments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        let q = supabase.from('payments').select('*, students(name)').order('paid_at', { ascending: false });
        if (category) q = q.eq('category', category);
        if (month && year) {
            const { tzStart, tzEnd } = monthRange(month, year);
            q = q.gte('paid_at', tzStart).lte('paid_at', tzEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ payments: data });
    }

    if (method === 'POST') {
        const { student_id, description, amount, payment_method, paid_at, category } = req.body;
        if (!description || !amount || !payment_method)
            return res.status(400).json({ error: 'descrição, valor e forma de pagamento são obrigatórios.' });
        const { data, error } = await supabase
            .from('payments')
            .insert([{ id: genId('PA'), student_id: student_id || null, description, amount: parseFloat(amount), payment_method, paid_at: paid_at || new Date().toISOString(), category: category || 'outro' }])
            .select('*, students(name)').single();
        if (error) throw error;
        return res.status(201).json({ payment: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handleExpenses(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { paid, month, year } = req.query;
        let q = supabase.from('expenses').select('*').order('due_date', { ascending: false });
        if (paid !== undefined && paid !== '') q = q.eq('paid', paid === 'true');
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('due_date', dateStart).lte('due_date', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ expenses: data });
    }

    if (method === 'POST') {
        const { description, amount, category, due_date, paid, paid_at } = req.body;
        if (!description || !amount || !due_date)
            return res.status(400).json({ error: 'descrição, valor e data de vencimento são obrigatórios.' });
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ id: genId('EX'), description, amount: parseFloat(amount), category: category || 'outro', due_date, paid: paid || false, paid_at: paid ? (paid_at || new Date().toISOString()) : null }])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ expense: data });
    }

    if (method === 'PATCH') {
        const { id, description, amount, category, due_date, paid, paid_at } = req.body;
        if (!id) return res.status(400).json({ error: 'ID da despesa é obrigatório.' });
        const upd = {};
        if (description !== undefined) upd.description = description;
        if (amount      !== undefined) upd.amount      = parseFloat(amount);
        if (category    !== undefined) upd.category    = category;
        if (due_date    !== undefined) upd.due_date    = due_date;
        if (paid        !== undefined) upd.paid        = paid;
        if (paid_at     !== undefined) upd.paid_at     = paid_at;
        if (paid === true  && !upd.paid_at) upd.paid_at = new Date().toISOString();
        if (paid === false) upd.paid_at = null;
        const { data, error } = await supabase.from('expenses').update(upd).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json({ expense: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handleInvestments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        let q = supabase.from('investments').select('*').order('purchased_at', { ascending: false });
        if (category) q = q.eq('category', category);
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('purchased_at', dateStart).lte('purchased_at', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ investments: data });
    }

    if (method === 'POST') {
        const { description, amount, category, purchased_at, notes } = req.body;
        if (!description || !amount || !purchased_at)
            return res.status(400).json({ error: 'descrição, valor e data de compra são obrigatórios.' });
        const { data, error } = await supabase
            .from('investments')
            .insert([{ id: genId('IN'), description, amount: parseFloat(amount), category: category || 'outro', purchased_at, notes: notes || null }])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ investment: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handleSummary(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios.' });

    const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(month, year);

    const [
        { data: paidTuitions,  error: e1 },
        { data: avulsoPayments,error: e2 },
        { data: paidExpenses,  error: e3 },
        { data: investments,   error: e4 },
        { data: pendingTuitions, error: e5 },
        { data: overdueTuitions, error: e6 },
    ] = await Promise.all([
        supabase.from('tuitions').select('amount,discount_amount').eq('status','paid').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('payments').select('amount').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('expenses').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('investments').select('amount').gte('purchased_at',dateStart).lte('purchased_at',dateEnd),
        supabase.from('tuitions').select('amount,discount_amount').in('status',['pending','overdue']).gte('due_date',dateStart).lte('due_date',dateEnd),
        supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${new Date().toISOString().split('T')[0]})`),
    ]);

    for (const e of [e1, e2, e3, e4, e5, e6]) { if (e) throw e; }

    const revenue  = paidTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0)
                   + avulsoPayments.reduce((s,p) => s + Number(p.amount), 0);
    const outgoings = paidExpenses.reduce((s,e) => s + Number(e.amount), 0)
                    + investments.reduce((s,i) => s + Number(i.amount), 0);

    return res.status(200).json({
        summary: {
            revenue,
            outgoings,
            balance:          revenue - outgoings,
            pending_tuitions: pendingTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0),
            overdue_students: new Set(overdueTuitions.map(t => t.student_id)).size,
        }
    });
}

// ── Handler principal ─────────────────────────────────────────────────────────

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        return res.status(500).json({ error: 'Supabase não configurado.', details: err.message });
    }

    const { resource } = req.query;

    try {
        switch (resource) {
            case 'students':    return await handleStudents(req, res, supabase);
            case 'tuitions':    return await handleTuitions(req, res, supabase);
            case 'payments':    return await handlePayments(req, res, supabase);
            case 'expenses':    return await handleExpenses(req, res, supabase);
            case 'investments': return await handleInvestments(req, res, supabase);
            case 'summary':     return await handleSummary(req, res, supabase);
            default:
                return res.status(400).json({ error: 'Parâmetro ?resource= inválido ou ausente. Use: students, tuitions, payments, expenses, investments, summary.' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Erro interno.', details: err.message });
    }
}
