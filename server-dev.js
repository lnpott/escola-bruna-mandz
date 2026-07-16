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

// ── Reusa handlers financeiros da biblioteca compartilhada ───────
// Elimina duplicação de ~100 linhas de queries de dashboard e summary.
import { handleDashboard } from './api/_lib/financial/dashboard.js';
import { handleSummary } from './api/_lib/financial/summary.js';


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

// ── Helpers ──────────────────────────────────────────────────────

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

export function parseUrl(req) {
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

/**
 * Adapta req/res do Node http.createServer para o formato Vercel
 * que os handlers em api/_lib/financial/ esperam:
 *   - req.query  → objeto de query params
 *   - req.method → string HTTP method
 *   - res.status(code).json(data) → encadeável
 *
 * Exportadas para testes unitários (ver tests/adapters.test.js).
 */
export function toVercelReq(req) {
  const url = parseUrl(req);
  return {
    method: req.method,
    query: Object.fromEntries(url.searchParams),
    headers: req.headers,
  };
}

export function toVercelRes(res) {
  return {
    status(code) {
      return {
        json: (data) => json(res, code, data),
      };
    },
  };
}

// ── Handlers ────────────────────────────────────────────────────

// NOTA: Os handlers abaixo (orders, products, admin-products, admin-orders,
// config, order-status) NÃO foram movidos para api/_lib/ ainda porque são
// específicos da loja e não do módulo financeiro. O refatoração futura pode
// extraí-los para api/_lib/store/.

async function handleOrders(res) {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) { json(res, 500, { error: 'Erro ao carregar pedidos.' }); return; }
  json(res, 200, { orders: data || [] });
}

async function handleProducts(res) {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
  if (error) { json(res, 500, { error: 'Erro ao carregar produtos.' }); return; }
  json(res, 200, { products: data || [] });
}

async function handleAdminProducts(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
    if (error) { json(res, 500, { error: 'Erro ao carregar produtos.' }); return; }
    json(res, 200, { products: data || [] });
    return;
  }
  json(res, 405, { error: 'Método não permitido.' });
}

async function handleAdminOrders(res) {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) { json(res, 500, { error: 'Erro ao carregar pedidos.' }); return; }
  json(res, 200, { orders: data || [] });
}

async function handleConfig(res) {
  json(res, 200, { mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || null });
}

async function handleOrderStatus(req, res) {
  const url = parseUrl(req);
  const id = url.searchParams.get('id');
  if (!id) { json(res, 400, { error: 'ID é obrigatório' }); return; }
  const { data, error } = await supabase.from('orders').select('id, status, total').eq('id', id).maybeSingle();
  if (error) { json(res, 500, { error: 'Erro ao consultar pedido.' }); return; }
  if (!data) { json(res, 404, { error: 'Pedido não encontrado' }); return; }
  json(res, 200, data);
}

/**
 * Roteia /api/admin-financial delegando dashboard e summary para os
 * handlers da biblioteca compartilhada (elimina ~120 linhas duplicadas).
 * Os demais resources usam uma listagem simples (GET-only) pois o
 * server-dev.js não implementa CRUD completo — em produção as chamadas
 * POST/PATCH/DELETE vão para as Vercel Functions reais em api/.
 */
async function handleFinancial(req, res) {
  const url = parseUrl(req);
  const resource = url.searchParams.get('resource');

  if (resource === 'dashboard') {
    // Delega para o handler da biblioteca, que reusa computeFinancialSummary
    await handleDashboard(toVercelReq(req), toVercelRes(res), supabase);
    return;
  }
  if (resource === 'summary') {
    // Delega para o handler da biblioteca (valida month/year, chama computeFinancialSummary)
    await handleSummary(toVercelReq(req), toVercelRes(res), supabase);
    return;
  }

  // Recursos financeiros: listagem simples (GET).
  // POST/PATCH/DELETE só funcionam em produção (Vercel).
  const validResources = {
    students: { table: 'students', orderBy: 'name', select: '*' },
    teachers: { table: 'teachers', orderBy: 'name', select: '*' },
    enrollments: { table: 'enrollments', orderBy: 'day_of_week', select: '*, students(name), teachers(name, specialty)' },
    tuitions: { table: 'tuitions', orderBy: 'due_date', select: '*, students(name), enrollments(instrument, teacher_id, teachers(name))' },
    payments: { table: 'payments', orderBy: 'paid_at', select: '*, students(name)' },
    expenses: { table: 'expenses', orderBy: 'due_date', select: '*' },
    investments: { table: 'investments', orderBy: 'purchased_at', select: '*' },
    teacher_payments: { table: 'teacher_payments', orderBy: 'reference_month', select: '*, teachers(name, specialty)' },
    lessons: { table: 'lessons', orderBy: 'date', select: '*, enrollments(monthly_fee, day_of_week), students(name), teachers(name, specialty)' },
    attendance: { table: 'attendance', orderBy: 'recorded_at', select: '*, lessons(date, start_time, end_time, students(name)), students!attendance_student_id_fkey(name)' },
  };

  const cfg = validResources[resource];
  if (!cfg) {
    json(res, 400, { error: `Resource inválido: ${resource}` });
    return;
  }

  try {
    const { data, error, count } = await supabase
      .from(cfg.table)
      .select(cfg.select, { count: 'exact' })
      .order(cfg.orderBy, { ascending: false })
      .limit(500);

    if (error) {
      console.error(`[server-dev] Erro na consulta ${resource}:`, error);
      json(res, 500, { error: 'Erro ao carregar dados.' });
      return;
    }

    json(res, 200, { [resource]: data || [], count });
  } catch (err) {
    console.error(`[server-dev] Erro inesperado em ${resource}:`, err);
    json(res, 500, { error: 'Erro interno do servidor.' });
  }
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
    // NÃO vaza err.message — a mensagem só aparece no console do servidor.
    json(res, 500, { error: 'Erro interno do servidor.' });
  }
});

// ── Só inicia o servidor se executado diretamente (não ao ser importado) ──
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && resolve(__filename) === resolve(process.argv[1]);

if (isMainModule) {
  const PORT = 3001;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ API Server rodando em http://localhost:${PORT}`);
    console.log(`   Endpoints: /api/admin-financial, /api/admin-orders, /api/admin-products, etc.`);
  });
}
