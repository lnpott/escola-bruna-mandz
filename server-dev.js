/**
 * server-dev.js
 * Servidor de desenvolvimento local que emula as APIs Vercel.
 * Roda na porta 3001. O Vite faz proxy de /api/* para cá.
 *
 * Uso: node server-dev.js
 * (Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env)
 */

import { createServer } from 'http';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Carrega .env manualmente (sem dotenv)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// Helpers
function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  });
  res.end(JSON.stringify(data));
}

function auth(req, res) {
  const provided = req.headers['x-admin-password'];
  if (provided !== ADMIN_PASSWORD) {
    json(res, 401, { error: 'Senha incorreta.' });
    return false;
  }
  return true;
}

function parseUrl(req) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  return url;
}

function monthRange(month, year) {
  const m = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    dateStart: `${year}-${m}-01`,
    dateEnd: `${year}-${m}-${lastDay}`,
    tzStart: `${year}-${m}-01T00:00:00.000Z`,
    tzEnd: `${year}-${m}-${lastDay}T23:59:59.999Z`,
  };
}

async function handleDashboard(res) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const dayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const todayDay = dayNames[now.getDay()];
  const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(thisMonth, thisYear);

  const [
    { data: paidTuitions }, { data: avulsoPayments }, { data: paidExpenses },
    { data: investments }, { data: pendingTuitions }, { data: overdue },
    { data: activeStudents }, { data: activeTeachers }, { data: todayClasses },
    { data: pendingOrders }, { data: recentOrders }, { data: lowStock },
  ] = await Promise.all([
    supabase.from('tuitions').select('amount,discount_amount').eq('status', 'paid').gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('payments').select('amount').gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('expenses').select('amount').eq('paid', true).gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('investments').select('amount').gte('purchased_at', dateStart).lte('purchased_at', dateEnd),
    supabase.from('tuitions').select('amount,discount_amount').in('status', ['pending', 'overdue']).gte('due_date', dateStart).lte('due_date', dateEnd),
    supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`),
    supabase.from('students').select('id').eq('active', true),
    supabase.from('teachers').select('id'),
    supabase.from('enrollments').select('*, students(name), teachers(name, specialty)').eq('day_of_week', todayDay).eq('status', 'active').order('class_time', { ascending: true }),
    supabase.from('orders').select('id').eq('status', 'pending'),
    supabase.from('orders').select('id,customer_name,total,created_at,status').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id,name,stock,active').lte('stock', 5).eq('active', true),
  ]);

  const revenue = (paidTuitions || []).reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount || 0), 0)
    + (avulsoPayments || []).reduce((s, p) => s + Number(p.amount), 0);
  const outgoings = (paidExpenses || []).reduce((s, e) => s + Number(e.amount), 0)
    + (investments || []).reduce((s, i) => s + Number(i.amount), 0);
  const pendingTotal = (pendingTuitions || []).reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount || 0), 0);
  const overdueCount = new Set((overdue || []).map(t => t.student_id)).size;

  json(res, 200, {
    dashboard: {
      financial: {
        revenue,
        outgoings,
        balance: revenue - outgoings,
        pending_tuitions: pendingTotal,
        overdue_students: overdueCount,
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
    },
  });
}

async function handleOrders(res) {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) { json(res, 500, { error: error.message }); return; }
  json(res, 200, { orders: data || [] });
}

async function handleProducts(res) {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
  if (error) { json(res, 500, { error: error.message }); return; }
  json(res, 200, { products: data || [] });
}

async function handleAdminProducts(req, res) {
  const url = parseUrl(req);
  const method = req.method;

  if (method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
    if (error) { json(res, 500, { error: error.message }); return; }
    json(res, 200, { products: data || [] });
    return;
  }
  json(res, 405, { error: 'Método não permitido.' });
}

async function handleAdminOrders(res) {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) { json(res, 500, { error: error.message }); return; }
  json(res, 200, { orders: data || [] });
}

async function handleFinancial(req, res) {
  const url = parseUrl(req);
  const resource = url.searchParams.get('resource');

  if (resource === 'dashboard') {
    await handleDashboard(res);
    return;
  }
  if (resource === 'summary') {
    await handleSummary(req, res);
    return;
  }

  // Recursos financeiros: listagem simples
  const validResources = {
    students: { table: 'students', orderBy: 'name', select: '*' },
    teachers: { table: 'teachers', orderBy: 'name', select: '*' },
    enrollments: { table: 'enrollments', orderBy: 'day_of_week', select: '*, students(name), teachers(name, specialty)' },
    tuitions: { table: 'tuitions', orderBy: 'due_date', select: '*, students(name), enrollments(instrument, teacher_id, teachers(name))' },
    payments: { table: 'payments', orderBy: 'paid_at', select: '*, students(name)' },
    expenses: { table: 'expenses', orderBy: 'due_date', select: '*' },
    investments: { table: 'investments', orderBy: 'purchased_at', select: '*' },
    teacher_payments: { table: 'teacher_payments', orderBy: 'reference_month', select: '*, teachers(name, specialty)' },
  };

  const cfg = validResources[resource];
  if (!cfg) {
    json(res, 400, { error: `Resource inválido: ${resource}` });
    return;
  }

  let q = supabase.from(cfg.table).select(cfg.select, { count: 'exact' }).order(cfg.orderBy, { ascending: false }).limit(500);
  const { data, error, count } = await q;
  if (error) { json(res, 500, { error: error.message }); return; }
  json(res, 200, { [resource]: data || [], count });
}

async function handleSummary(req, res) {
  const url = parseUrl(req);
  const month = parseInt(url.searchParams.get('month'), 10);
  const year = parseInt(url.searchParams.get('year'), 10);
  if (!month || !year) { json(res, 400, { error: 'month e year são obrigatórios' }); return; }

  const today = new Date().toISOString().split('T')[0];
  const { dateStart, dateEnd, tzStart, tzEnd } = monthRange(month, year);

  const [
    { data: paidTuitions }, { data: avulsoPayments }, { data: paidExpenses },
    { data: investments }, { data: pendingTuitions }, { data: overdueTuitions },
    { data: paidTeacherPayments }, { data: pendingTeacherPayments },
  ] = await Promise.all([
    supabase.from('tuitions').select('amount,discount_amount').eq('status', 'paid').gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('payments').select('amount').gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('expenses').select('amount').eq('paid', true).gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('investments').select('amount').gte('purchased_at', dateStart).lte('purchased_at', dateEnd),
    supabase.from('tuitions').select('amount,discount_amount').in('status', ['pending', 'overdue']).gte('due_date', dateStart).lte('due_date', dateEnd),
    supabase.from('tuitions').select('student_id').or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`),
    supabase.from('teacher_payments').select('amount').eq('paid', true).gte('paid_at', tzStart).lte('paid_at', tzEnd),
    supabase.from('teacher_payments').select('amount').eq('paid', false).gte('reference_month', dateStart).lte('reference_month', dateEnd),
  ]);

  const revenue = (paidTuitions || []).reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount || 0), 0)
    + (avulsoPayments || []).reduce((s, p) => s + Number(p.amount), 0);
  const outgoings = (paidExpenses || []).reduce((s, e) => s + Number(e.amount), 0)
    + (investments || []).reduce((s, i) => s + Number(i.amount), 0)
    + (paidTeacherPayments || []).reduce((s, p) => s + Number(p.amount), 0);

  json(res, 200, {
    summary: {
      revenue,
      outgoings,
      balance: revenue - outgoings,
      pending_tuitions: (pendingTuitions || []).reduce((s, t) => s + Number(t.amount) - Number(t.discount_amount || 0), 0),
      overdue_students: new Set((overdueTuitions || []).map(t => t.student_id)).size,
      pending_teacher_payments: (pendingTeacherPayments || []).reduce((s, p) => s + Number(p.amount), 0),
    },
  });
}

async function handleConfig(res) {
  json(res, 200, { mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || null });
}

async function handleOrderStatus(req, res) {
  const url = parseUrl(req);
  const id = url.searchParams.get('id');
  if (!id) { json(res, 400, { error: 'ID é obrigatório' }); return; }
  const { data, error } = await supabase.from('orders').select('id, status, total').eq('id', id).maybeSingle();
  if (error) { json(res, 500, { error: error.message }); return; }
  if (!data) { json(res, 404, { error: 'Pedido não encontrado' }); return; }
  json(res, 200, data);
}

// ── Router ───────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const url = parseUrl(req);
  const path = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  try {
    switch (path) {
      case '/api/admin-financial':
        if (!auth(req, res)) return;
        await handleFinancial(req, res);
        break;

      case '/api/admin-orders':
        if (!auth(req, res)) return;
        await handleAdminOrders(res);
        break;

      case '/api/admin-products':
        if (!auth(req, res)) return;
        await handleAdminProducts(req, res);
        break;

      case '/api/products':
        await handleProducts(res);
        break;

      case '/api/order-status':
        await handleOrderStatus(req, res);
        break;

      case '/api/config':
        await handleConfig(res);
        break;

      default:
        json(res, 404, { error: `Endpoint não encontrado: ${path}` });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    json(res, 500, { error: 'Erro interno.', details: err.message });
  }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API Server rodando em http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/admin-financial, /api/admin-orders, /api/admin-products, etc.`);
});
