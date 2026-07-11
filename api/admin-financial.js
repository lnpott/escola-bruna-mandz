/**
 * api/admin-financial.js
 * API financeira consolidada para o painel admin.
 * Roteamento interno por query string: ?resource=students|teachers|enrollments|tuitions|payments|expenses|investments|teacher_payments|lessons|attendance|summary

 * Protegido por header 'x-admin-password'.
 *
 * Consolida os endpoints em 1 único arquivo para respeitar o
 * limite de 12 Serverless Functions do Vercel Hobby plan.
 *
 * ── Etapa 37 ──────────────────────────────────────────────────────────────
 * `tuitions` deixou de carregar dado pedagógico (teacher_id, instrument,
 * duration_minutes, classes_per_week). Esses campos agora vivem em
 * `enrollments`, referenciada por `tuitions.enrollment_id`.
 * Ver painel_registro.md — Etapa 37 para o histórico completo da decisão.
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

const DEFAULT_PAGE_LIMIT = 200;
const MAX_PAGE_LIMIT = 1000;

function genId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function parsePagination(req) {
    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    return { limit, offset };
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
        const { limit, offset } = parsePagination(req);
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1);
        if (error) throw error;
        return res.status(200).json({ students: data });
    }

    if (method === 'POST') {
        const { name, cpf, email, phone, address, active, instruments, guardian_name, guardian_cpf, guardian_phone } = req.body;
        if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });
        const instrumentsStr = Array.isArray(instruments) ? instruments.join(', ') : (instruments || '');
        const { data, error } = await supabase
            .from('students')
            .insert([{ 
                id: genId('ST'), 
                name, 
                cpf: cpf || null,
                email: email || null, 
                phone: phone || null, 
                address: address || null, 
                instruments: instrumentsStr, 
                active: active !== undefined ? active : true,
                guardian_name: guardian_name || null,
                guardian_cpf: guardian_cpf || null,
                guardian_phone: guardian_phone || null
            }])
            .select().single();
        if (error) throw error;
        return res.status(201).json({ student: data });
    }

    if (method === 'PATCH') {
        const { id, name, cpf, email, phone, address, active, instruments, guardian_name, guardian_cpf, guardian_phone } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
        const upd = {};
        if (name    !== undefined) upd.name    = name;
        if (cpf     !== undefined) upd.cpf     = cpf || null;
        if (email   !== undefined) upd.email   = email || null;
        if (phone   !== undefined) upd.phone   = phone || null;
        if (address !== undefined) upd.address = address || null;
        if (active  !== undefined) upd.active  = active;
        if (instruments !== undefined) upd.instruments = Array.isArray(instruments) ? instruments.join(', ') : instruments;
        if (guardian_name !== undefined) upd.guardian_name = guardian_name || null;
        if (guardian_cpf  !== undefined) upd.guardian_cpf  = guardian_cpf || null;
        if (guardian_phone !== undefined) upd.guardian_phone = guardian_phone || null;
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

async function handleTeachers(req, res, supabase) {
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
        const { name, cpf, phone, specialty, days_of_week, rate_per_class } = req.body;
        if (!name) return res.status(400).json({ error: 'name é obrigatório.' });

        const days = Array.isArray(days_of_week)
            ? days_of_week
            : (typeof days_of_week === 'string' ? days_of_week.split(',').map(s => s.trim()).filter(Boolean) : []);

        const { data, error } = await supabase
            .from('teachers')
            .insert([{
                id: genId('TE'),
                name,
                cpf: cpf || null,
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
        const { id, name, cpf, phone, specialty, days_of_week, rate_per_class } = req.body;
        if (!id) return res.status(400).json({ error: 'id do professor é obrigatório.' });

        const upd = {};
        if (name !== undefined) upd.name = name;
        if (cpf !== undefined) upd.cpf = cpf || null;
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

// ── NOVO (Etapa 37): enrollments ───────────────────────────────────────────────
// Dono do vínculo pedagógico: aluno + professor + instrumento + dia/horário +
// valor mensal. Base tanto para a cobrança (tuitions) quanto para a Agenda.

async function handleEnrollments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { student_id, teacher_id, status, day_of_week } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('enrollments')
            .select('*, students(name), teachers(name, specialty)', { count: 'exact' })
            .order('day_of_week', { ascending: true })
            .range(offset, offset + limit - 1);
        if (student_id)  q = q.eq('student_id', student_id);
        if (teacher_id)  q = q.eq('teacher_id', teacher_id);
        if (status)      q = q.eq('status', status);
        if (day_of_week) q = q.eq('day_of_week', day_of_week);
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ enrollments: data });
    }

    if (method === 'POST') {
        const {
            student_id,
            teacher_id,
            instrument,
            day_of_week,
            class_time,
            duration_minutes,
            classes_per_week,
            monthly_fee,
            billing_type,
            total_amount,
            installments,
            status,
            notes,
        } = req.body;

        if (!student_id) return res.status(400).json({ error: 'student_id é obrigatório.' });

        const bt = billing_type || 'monthly';
        if (bt === 'full' && (!total_amount || parseFloat(total_amount) <= 0)) {
            return res.status(400).json({ error: 'Para cobrança Completa, o valor total (total_amount) é obrigatório.' });
        }

        const payload = {
            id: genId('EN'),
            student_id,
            teacher_id: teacher_id || null,
            instrument: instrument || null,
            day_of_week: day_of_week || null,
            class_time: class_time || null,
            duration_minutes: duration_minutes !== undefined && duration_minutes !== null ? parseInt(duration_minutes, 10) : 60,
            classes_per_week: classes_per_week !== undefined && classes_per_week !== null ? parseInt(classes_per_week, 10) : 1,
            monthly_fee: monthly_fee !== undefined && monthly_fee !== null ? parseFloat(monthly_fee) : 0,
            billing_type: bt,
            total_amount: bt === 'full' ? parseFloat(total_amount) : null,
            installments: parseFloat(installments || 1),
            status: status || 'active',
            notes: notes || null,
        };

        const { data, error } = await supabase
            .from('enrollments')
            .insert([payload])
            .select('*, students(name), teachers(name, specialty)')
            .single();
        if (error) throw error;

        return res.status(201).json({ enrollment: data });
    }

    if (method === 'PATCH') {
        const {
            id,
            teacher_id,
            instrument,
            day_of_week,
            class_time,
            duration_minutes,
            classes_per_week,
            monthly_fee,
            billing_type,
            total_amount,
            installments,
            status,
            notes,
        } = req.body;

        if (!id) return res.status(400).json({ error: 'ID do vínculo (enrollment) é obrigatório.' });

        const upd = {};
        if (teacher_id       !== undefined) upd.teacher_id       = teacher_id || null;
        if (instrument       !== undefined) upd.instrument       = instrument || null;
        if (day_of_week      !== undefined) upd.day_of_week      = day_of_week || null;
        if (class_time       !== undefined) upd.class_time       = class_time || null;
        if (duration_minutes !== undefined) upd.duration_minutes = parseInt(duration_minutes, 10);
        if (classes_per_week !== undefined) upd.classes_per_week = parseInt(classes_per_week, 10);
        if (monthly_fee      !== undefined) upd.monthly_fee      = parseFloat(monthly_fee);
        if (billing_type     !== undefined) upd.billing_type     = billing_type;
        if (total_amount     !== undefined) upd.total_amount     = total_amount ? parseFloat(total_amount) : null;
        if (installments     !== undefined) upd.installments     = parseInt(installments, 10);
        if (status           !== undefined) upd.status           = status;
        if (notes            !== undefined) upd.notes            = notes;

        const { data, error } = await supabase
            .from('enrollments')
            .update(upd)
            .eq('id', id)
            .select('*, students(name), teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(200).json({ enrollment: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do vínculo (enrollment) é obrigatório na query string.' });
        const { error } = await supabase.from('enrollments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

// ── tuitions (Etapa 37: agora é só a cobrança mensal, sem dado pedagógico) ─────

async function handleTuitions(req, res, supabase) {

    const { method } = req;

    if (method === 'GET') {
        const { status, month, year, student_id, enrollment_id } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('tuitions')
            .select('*, students(name), enrollments(instrument, teacher_id, teachers(name))', { count: 'exact' })
            .order('due_date', { ascending: false })
            .range(offset, offset + limit - 1);
        if (status)        q = q.eq('status', status);
        if (student_id)    q = q.eq('student_id', student_id);
        if (enrollment_id) q = q.eq('enrollment_id', enrollment_id);
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('due_date', dateStart).lte('due_date', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ tuitions: data });
    }

    if (method === 'POST') {
        const {
            student_id,
            enrollment_id,
            reference_month,
            amount,
            billing_type,
            installment_number,
            discount_amount,
            discount_reason,
            due_date,
            status,
            notes,
        } = req.body;

        if (!student_id || !amount || !due_date) {
            return res.status(400).json({ error: 'student_id, amount e due_date são obrigatórios.' });
        }

        const payload = {
            id: genId('TU'),
            student_id,
            enrollment_id: enrollment_id || null,
            reference_month: reference_month || null,
            amount: parseFloat(amount),
            billing_type: billing_type || null,
            installment_number: installment_number !== undefined && installment_number !== null ? parseInt(installment_number, 10) : null,
            discount_amount: parseFloat(discount_amount || 0),
            discount_reason: discount_reason || null,
            due_date,
            status: status || 'pending',
            notes: notes || null,
        };

        const { data, error } = await supabase
            .from('tuitions')
            .insert([payload])
            .select('*, students(name), enrollments(instrument, teacher_id, teachers(name))')
            .single();

        if (error) throw error;
        return res.status(201).json({ tuition: data });
    }


    if (method === 'PATCH') {
        const {
            id,
            enrollment_id,
            reference_month,
            status,
            payment_method,
            paid_at,
            billing_type,
            installment_number,
            discount_amount,
            discount_reason,
            amount,
            notes,
            due_date,
        } = req.body;

        if (!id) return res.status(400).json({ error: 'ID da mensalidade é obrigatório.' });

        const upd = {};
        if (enrollment_id       !== undefined) upd.enrollment_id       = enrollment_id || null;
        if (reference_month     !== undefined) upd.reference_month     = reference_month || null;
        if (status              !== undefined) upd.status              = status;
        if (payment_method      !== undefined) upd.payment_method      = payment_method;
        if (paid_at             !== undefined) upd.paid_at             = paid_at;
        if (billing_type        !== undefined) upd.billing_type        = billing_type;
        if (installment_number  !== undefined) upd.installment_number  = parseInt(installment_number, 10);
        if (discount_amount     !== undefined) upd.discount_amount     = parseFloat(discount_amount || 0);
        if (discount_reason     !== undefined) upd.discount_reason     = discount_reason;
        if (amount              !== undefined) upd.amount              = parseFloat(amount);
        if (notes               !== undefined) upd.notes               = notes;
        if (due_date            !== undefined) upd.due_date            = due_date;

        if (status === 'paid' && !upd.paid_at) upd.paid_at = new Date().toISOString();
        else if (status && status !== 'paid') { upd.paid_at = null; upd.payment_method = null; }

        const { data, error } = await supabase
            .from('tuitions')
            .update(upd)
            .eq('id', id)
            .select('*, students(name), enrollments(instrument, teacher_id, teachers(name))')
            .single();

        if (error) throw error;
        return res.status(200).json({ tuition: data });
    }


    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handlePayments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase.from('payments').select('*, students(name)', { count: 'exact' }).order('paid_at', { ascending: false }).range(offset, offset + limit - 1);
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
        const { paid, month, year, expense_type } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase.from('expenses').select('*').order('due_date', { ascending: false }).range(offset, offset + limit - 1);

        if (expense_type) q = q.eq('expense_type', expense_type);
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
        const { description, amount, category, due_date, paid, paid_at, expense_type } = req.body;

        if (!description || !amount || !due_date)
            return res.status(400).json({ error: 'descrição, valor e data de vencimento são obrigatórios.' });

        const payload = {
            id: genId('EX'),
            description,
            amount: parseFloat(amount),
            category: category || 'outro',
            due_date,
            expense_type: expense_type || 'fixed',
            paid: paid || false,
            paid_at: paid ? (paid_at || new Date().toISOString()) : null,
        };

        const { data, error } = await supabase
            .from('expenses')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json({ expense: data });
    }


    if (method === 'PATCH') {
        const { id, description, amount, category, due_date, paid, paid_at, expense_type } = req.body;
        if (!id) return res.status(400).json({ error: 'ID da despesa é obrigatório.' });

        const upd = {};
        if (description !== undefined) upd.description = description;
        if (amount      !== undefined) upd.amount      = parseFloat(amount);
        if (category    !== undefined) upd.category    = category;
        if (due_date    !== undefined) upd.due_date    = due_date;
        if (expense_type !== undefined) upd.expense_type = expense_type;
        if (paid        !== undefined) upd.paid        = paid;
        if (paid_at     !== undefined) upd.paid_at     = paid_at;

        if (paid === true  && !upd.paid_at) upd.paid_at = new Date().toISOString();
        if (paid === false) upd.paid_at = null;

        const { data, error } = await supabase
            .from('expenses')
            .update(upd)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ expense: data });
    }


    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handleInvestments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { category, month, year } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase.from('investments').select('*').order('purchased_at', { ascending: false }).range(offset, offset + limit - 1);
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

// ── NOVO (Etapa 37): teacher_payments ──────────────────────────────────────────
// Quanto pagar a cada professor por mês. Não tem cálculo automático ainda
// (pendência registrada na Etapa 37) — o valor é lançado manualmente por ora.

async function handleTeacherPayments(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { teacher_id, month, year, paid } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('teacher_payments')
            .select('*, teachers(name, specialty)', { count: 'exact' })
            .order('reference_month', { ascending: false })
            .range(offset, offset + limit - 1);
        if (teacher_id) q = q.eq('teacher_id', teacher_id);
        if (paid !== undefined && paid !== '') q = q.eq('paid', paid === 'true');
        if (month && year) {
            const { dateStart, dateEnd } = monthRange(month, year);
            q = q.gte('reference_month', dateStart).lte('reference_month', dateEnd);
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ teacher_payments: data });
    }

    if (method === 'POST') {
        const { teacher_id, reference_month, amount, paid, paid_at, notes } = req.body;
        if (!teacher_id || !reference_month || !amount)
            return res.status(400).json({ error: 'teacher_id, reference_month e amount são obrigatórios.' });

        const payload = {
            id: genId('TP'),
            teacher_id,
            reference_month,
            amount: parseFloat(amount),
            paid: paid || false,
            paid_at: paid ? (paid_at || new Date().toISOString()) : null,
            notes: notes || null,
        };

        const { data, error } = await supabase
            .from('teacher_payments')
            .insert([payload])
            .select('*, teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(201).json({ teacher_payment: data });
    }

    if (method === 'PATCH') {
        const { id, amount, paid, paid_at, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do pagamento ao professor é obrigatório.' });

        const upd = {};
        if (amount !== undefined) upd.amount = parseFloat(amount);
        if (notes  !== undefined) upd.notes  = notes;
        if (paid   !== undefined) upd.paid   = paid;
        if (paid_at !== undefined) upd.paid_at = paid_at;

        if (paid === true  && !upd.paid_at) upd.paid_at = new Date().toISOString();
        if (paid === false) upd.paid_at = null;

        const { data, error } = await supabase
            .from('teacher_payments')
            .update(upd)
            .eq('id', id)
            .select('*, teachers(name, specialty)')
            .single();
        if (error) throw error;
        return res.status(200).json({ teacher_payment: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID do pagamento ao professor é obrigatório na query string.' });
        const { error } = await supabase.from('teacher_payments').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

// ── NOVO (09/07/2026): lessons ─────────────────────────────────────────────────
// Aula real em data específica. Cada lesson é uma ocorrência concreta de um
// enrollment (vínculo pedagógico) em uma data e horário definidos.

async function handleLessons(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { date, date_from, date_to, student_id, teacher_id, enrollment_id, status, lesson_type } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('lessons')
            .select('*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)', { count: 'exact' })
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })
            .range(offset, offset + limit - 1);

        if (date)         q = q.eq('date', date);
        if (date_from)    q = q.gte('date', date_from);
        if (date_to)      q = q.lte('date', date_to);
        if (student_id)   q = q.eq('student_id', student_id);
        if (teacher_id)   q = q.eq('teacher_id', teacher_id);
        if (enrollment_id) q = q.eq('enrollment_id', enrollment_id);
        if (status)       q = q.eq('status', status);
        if (lesson_type)  q = q.eq('lesson_type', lesson_type);

        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ lessons: data });
    }

    if (method === 'POST') {
        const {
            enrollment_id,
            student_id,
            teacher_id,
            instrument,
            date,
            start_time,
            duration_minutes,
            status,
            lesson_type,
            notes,
        } = req.body;

        if (!date || !start_time) {
            return res.status(400).json({ error: 'date e start_time são obrigatórios.' });
        }

        let lessonStudentId = student_id || null;
        let lessonTeacherId = teacher_id || null;
        let lessonInstrument = instrument || null;
        let lessonEnrollmentId = enrollment_id || null;
        let lessonDuration = duration_minutes !== undefined && duration_minutes !== null
            ? parseInt(duration_minutes, 10)
            : 60;

        // Se enrollment_id foi fornecido, busca os dados do vínculo
        if (enrollment_id) {
            const { data: enrollment, error: enrollmentError } = await supabase
                .from('enrollments')
                .select('*, students(name), teachers(name, specialty)')
                .eq('id', enrollment_id)
                .single();

            if (enrollmentError || !enrollment) {
                return res.status(404).json({ error: 'Vínculo (enrollment) não encontrado.' });
            }

            if (enrollment.status !== 'active') {
                return res.status(400).json({ error: 'Não é possível criar aula para um vínculo inativo.' });
            }

            lessonStudentId = enrollment.student_id;
            lessonTeacherId = enrollment.teacher_id;
            lessonInstrument = enrollment.instrument;
            lessonDuration = lessonDuration || (enrollment.duration_minutes || 60);
        }

        if (!lessonStudentId) {
            return res.status(400).json({ error: 'student_id é obrigatório (forneça enrollment_id ou student_id).' });
        }

        const dur = lessonDuration;

        // Calcula end_time = start_time + duration_minutes
        const endTime = (() => {
            const [h, m] = start_time.split(':').map(Number);
            const totalMin = h * 60 + m + dur;
            const eh = Math.floor(totalMin / 60) % 24;
            const em = totalMin % 60;
            return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
        })();

        const payload = {
            id: genId('LS'),
            enrollment_id: lessonEnrollmentId,
            student_id: lessonStudentId,
            teacher_id: lessonTeacherId,
            instrument: lessonInstrument,
            date,
            start_time,
            end_time: endTime,
            duration_minutes: dur,
            lesson_type: lesson_type || 'regular',
            status: status || 'scheduled',
            notes: notes || null,
        };

        const { data, error } = await supabase
            .from('lessons')
            .insert([payload])
            .select('*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)')
            .single();

        if (error) {
            // unique_violation (professor já tem aula neste horário)
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Professor já tem aula neste horário. Escolha outro horário ou professor.' });
            }
            throw error;
        }

        return res.status(201).json({ lesson: data });
    }

    if (method === 'PATCH') {
        const {
            id,
            date,
            start_time,
            duration_minutes,
            status,
            lesson_type,
            notes,
        } = req.body;

        if (!id) return res.status(400).json({ error: 'ID da aula é obrigatório.' });

        const upd = {};
        if (date !== undefined)             upd.date = date;
        if (start_time !== undefined)       upd.start_time = start_time;
        if (duration_minutes !== undefined) upd.duration_minutes = parseInt(duration_minutes, 10);
        if (status !== undefined)           upd.status = status;
        if (lesson_type !== undefined)      upd.lesson_type = lesson_type;
        if (notes !== undefined)            upd.notes = notes;

        // Se start_time ou duration_minutes mudaram, recalcula end_time
        if (start_time !== undefined || duration_minutes !== undefined) {
            const currentStart = start_time;
            const currentDur = duration_minutes !== undefined ? parseInt(duration_minutes, 10) : undefined;

            // Precisamos dos valores atuais para recalcular
            const { data: currentLesson } = await supabase
                .from('lessons')
                .select('start_time, duration_minutes')
                .eq('id', id)
                .single();

            const finalStart = currentStart || currentLesson.start_time;
            const finalDur = currentDur || currentLesson.duration_minutes;

            const [h, m] = finalStart.split(':').map(Number);
            const totalMin = h * 60 + m + finalDur;
            const eh = Math.floor(totalMin / 60) % 24;
            const em = totalMin % 60;
            upd.end_time = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
        }

        const { data, error } = await supabase
            .from('lessons')
            .update(upd)
            .eq('id', id)
            .select('*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Professor já tem aula neste horário. Verifique conflitos de agenda.' });
            }
            throw error;
        }

        return res.status(200).json({ lesson: data });
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID da aula é obrigatório na query string.' });
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

// ── NOVO (09/07/2026): attendance ──────────────────────────────────────────────
// Registro de presença do aluno em uma aula.

async function handleAttendance(req, res, supabase) {
    const { method } = req;

    if (method === 'GET') {
        const { lesson_id, student_id, status } = req.query;
        const { limit, offset } = parsePagination(req);
        let q = supabase
            .from('attendance')
            .select('*, lessons(date, start_time, end_time, students(name)), students!attendance_student_id_fkey(name)', { count: 'exact' })
            .order('recorded_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (lesson_id)  q = q.eq('lesson_id', lesson_id);
        if (student_id) q = q.eq('student_id', student_id);
        if (status)     q = q.eq('status', status);

        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ attendance: data });
    }

    if (method === 'POST') {
        const { lesson_id, student_id, status: attStatus, late_minutes, notes } = req.body;

        if (!lesson_id || !student_id) {
            return res.status(400).json({ error: 'lesson_id e student_id são obrigatórios.' });
        }

        const payload = {
            id: genId('AT'),
            lesson_id,
            student_id,
            status: attStatus || 'present',
            late_minutes: late_minutes !== undefined ? parseInt(late_minutes, 10) : 0,
            notes: notes || null,
            recorded_at: new Date().toISOString(),
        };

        // Upsert: se já existe registro para esta lesson + student, atualiza
        const { data, error } = await supabase
            .from('attendance')
            .upsert(payload, { onConflict: 'lesson_id, student_id', ignoreDuplicates: false })
            .select('*, lessons(date, start_time, end_time, students(name)), students!attendance_student_id_fkey(name)')
            .single();

        if (error) throw error;
        return res.status(201).json({ attendance: data });
    }

    if (method === 'PATCH') {
        const { id, status: attStatus, late_minutes, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do registro de presença é obrigatório.' });

        const upd = {};
        if (attStatus !== undefined)    upd.status = attStatus;
        if (late_minutes !== undefined) upd.late_minutes = parseInt(late_minutes, 10);
        if (notes !== undefined)        upd.notes = notes;

        const { data, error } = await supabase
            .from('attendance')
            .update(upd)
            .eq('id', id)
            .select('*, lessons(date, start_time, end_time, students(name)), students!attendance_student_id_fkey(name)')
            .single();

        if (error) throw error;
        return res.status(200).json({ attendance: data });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}

async function handleSummary(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios.' });

    const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(month, year);

    // ── Data de hoje para detecção de atrasados ───────────────────────────────
    // Computada antes das queries para evitar SQL injection por string
    // interpolation dentro do filtro .or().
    const today = new Date().toISOString().split('T')[0];

    // ── 8 queries paralelas para o resumo financeiro ──────────────────────────
    // Cada query é suportada por índices específicos:
    //   tuitions:         tuitions_paid_at_idx (partial WHERE status=paid)
    //   payments:         payments_paid_at_idx
    //   expenses:         expenses_paid_at_idx (partial WHERE paid=true)
    //   investments:      investments_purchased_at_idx
    //   teacher_payments: teacher_payments_paid_at_idx (partial WHERE paid=true)
    //   pending tuitions: tuitions_status_idx + tuitions_due_date_idx
    const [
        { data: paidTuitions,  error: e1 },
        { data: avulsoPayments,error: e2 },
        { data: paidExpenses,  error: e3 },
        { data: investments,   error: e4 },
        { data: pendingTuitions, error: e5 },
        { data: overdueTuitions, error: e6 },
        { data: paidTeacherPayments, error: e7 },
        { data: pendingTeacherPayments, error: e8 },
    ] = await Promise.all([
        supabase.from('tuitions').select('amount,discount_amount').eq('status','paid').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('payments').select('amount').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('expenses').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('investments').select('amount').gte('purchased_at',dateStart).lte('purchased_at',dateEnd),
        supabase.from('tuitions').select('amount,discount_amount').in('status',['pending','overdue']).gte('due_date',dateStart).lte('due_date',dateEnd),
        // Busca alunos com status 'overdue' OU status 'pending' com due_date < hoje
        // (usa today pré-computado para evitar string interpolation insegura)
        supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`),
        supabase.from('teacher_payments').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('teacher_payments').select('amount').eq('paid',false).gte('reference_month',dateStart).lte('reference_month',dateEnd),
    ]);

    for (const e of [e1, e2, e3, e4, e5, e6, e7, e8]) { if (e) throw e; }

    const revenue  = paidTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0)
                   + avulsoPayments.reduce((s,p) => s + Number(p.amount), 0);
    const outgoings = paidExpenses.reduce((s,e) => s + Number(e.amount), 0)
                    + investments.reduce((s,i) => s + Number(i.amount), 0)
                    + paidTeacherPayments.reduce((s,p) => s + Number(p.amount), 0);

    return res.status(200).json({
        summary: {
            revenue,
            outgoings,
            balance:          revenue - outgoings,
            pending_tuitions: pendingTuitions.reduce((s,t) => s + Number(t.amount) - Number(t.discount_amount), 0),
            overdue_students: new Set(overdueTuitions.map(t => t.student_id)).size,
            pending_teacher_payments: pendingTeacherPayments.reduce((s,p) => s + Number(p.amount), 0),
        }
    });
}

// ── DASHBOARD: consolidado de indicadores para a tela inicial ────────────────

async function handleDashboard(req, res, supabase) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(thisMonth, thisYear);

    // ── 10 queries paralelas ────────────────────────────────────────────────────
    const [
        { data: paidTuitions,       error: e1  },
        { data: avulsoPayments,     error: e2  },
        { data: paidExpenses,       error: e3  },
        { data: investments,        error: e4  },
        { data: pendingTuitions,    error: e5  },
        { data: overdue,            error: e6  },
        { data: activeStudents,     error: e7  },
        { data: activeTeachers,     error: e8  },
        { data: todayClasses,       error: e9  },
        { data: pendingOrders,      error: e10 },
        { data: recentOrders,       error: e11 },
        { data: lowStock,           error: e12 },
    ] = await Promise.all([
        supabase.from('tuitions').select('amount,discount_amount').eq('status','paid').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('payments').select('amount').gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('expenses').select('amount').eq('paid',true).gte('paid_at',tzStart).lte('paid_at',tzEnd),
        supabase.from('investments').select('amount').gte('purchased_at',dateStart).lte('purchased_at',dateEnd),
        supabase.from('tuitions').select('amount,discount_amount').in('status',['pending','overdue']).gte('due_date',dateStart).lte('due_date',dateEnd),
        supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`),
        supabase.from('students').select('id').eq('active', true),
        supabase.from('teachers').select('id'),
        supabase.from('lessons').select('*, enrollments(monthly_fee), students(name), teachers(name, specialty)').eq('date', today).in('status', ['scheduled', 'completed']).order('start_time', { ascending: true }),
        supabase.from('orders').select('id').eq('status', 'pending'),
        supabase.from('orders').select('id,customer_name,total,created_at,status').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id,name,stock,active').lte('stock', 5).eq('active', true),
    ]);

    for (const e of [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12]) { if (e) throw e; }

    const revenue = paidTuitions.reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount), 0)
                  + avulsoPayments.reduce((s, p) => s + Number(p.amount), 0);
    const outgoings = paidExpenses.reduce((s, e) => s + Number(e.amount), 0)
                    + investments.reduce((s, i) => s + Number(i.amount), 0);

    return res.status(200).json({
        dashboard: {
            financial: {
                revenue,
                outgoings,
                balance: revenue - outgoings,
                pending_tuitions: pendingTuitions.reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount), 0),
                overdue_students: new Set(overdue.map(t => t.student_id)).size,
            },
            school: {
                active_students: activeStudents?.length ?? 0,
                active_teachers: activeTeachers?.length ?? 0,
                today_classes: todayClasses || [],
                today_classes_count: todayClasses?.length ?? 0,
            },
            store: {
                pending_orders: pendingOrders?.length ?? 0,
                recent_orders: recentOrders || [],
                low_stock_products: lowStock || [],
            },
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
            case 'dashboard':        return await handleDashboard(req, res, supabase);
            case 'students':         return await handleStudents(req, res, supabase);
            case 'teachers':         return await handleTeachers(req, res, supabase);
            case 'enrollments':      return await handleEnrollments(req, res, supabase);
            case 'tuitions':         return await handleTuitions(req, res, supabase);
            case 'payments':         return await handlePayments(req, res, supabase);
            case 'expenses':         return await handleExpenses(req, res, supabase);
            case 'investments':      return await handleInvestments(req, res, supabase);
            case 'teacher_payments': return await handleTeacherPayments(req, res, supabase);
            case 'lessons':          return await handleLessons(req, res, supabase);
            case 'attendance':       return await handleAttendance(req, res, supabase);
            case 'summary':          return await handleSummary(req, res, supabase);

            default:
                return res.status(400).json({ error: 'Parâmetro ?resource= inválido ou ausente. Use: dashboard, students, teachers, enrollments, tuitions, payments, expenses, investments, teacher_payments, lessons, attendance, summary.' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Erro interno.', details: err.message });
    }
}
