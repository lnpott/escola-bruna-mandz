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
import { handleStudents } from './api/_lib/financial/students.js';
import { handleTeachers } from './api/_lib/financial/teachers.js';
import { handleEnrollments } from './api/_lib/financial/enrollments.js';
import { handleTuitions } from './api/_lib/financial/tuitions.js';
import { handlePayments } from './api/_lib/financial/payments.js';
import { handleExpenses } from './api/_lib/financial/expenses.js';
import { handleInvestments } from './api/_lib/financial/investments.js';
import { handleTeacherPayments } from './api/_lib/financial/teacherPayments.js';
import { handleLessons } from './api/_lib/financial/lessons.js';
import { handleAttendance } from './api/_lib/financial/attendance.js';

// ── Reusa handlers da loja da biblioteca compartilhada ───────────
// Elimina duplicação de ~80 linhas de queries de orders, products,
// order-status e config.
import {
    handleListOrders,
    handleListAllProducts,
    handleOrderStatus as handleOrderStatusLib,
    handleConfig as handleConfigLib,
} from './api/_lib/store/handlers.js';


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
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
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
    body: req.body,
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

// ── Parsing de JSON body para POST/PATCH ─────────────────────────
/**
 * Lê o body da requisição HTTP e faz parse como JSON.
 * Anexa o resultado em req.body. Se não houver body ou não for
 * JSON válido, req.body fica como null.
 */
function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'OPTIONS') {
      req.body = null;
      resolve();
      return;
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch {
          req.body = null;
        }
      } else {
        req.body = null;
      }
      resolve();
    });
    req.on('error', () => { req.body = null; resolve(); });
  });
}

// ── Handlers ────────────────────────────────────────────────────

// ── Handlers da loja delegados para api/_lib/store/handlers.js ──
// Foram extraídos seguindo o padrão do módulo financeiro (Etapa 75).
// Todos aceitam (req, res) para poder propagar req ao adaptador.

async function handleOrders(req, res) {
    await handleListOrders(toVercelReq(req), toVercelRes(res), supabase);
}

async function handleProducts(req, res) {
    await handleListAllProducts(toVercelReq(req), toVercelRes(res), supabase);
}

async function handleAdminProducts(req, res) {
    // server-dev só suporta GET — POST/PATCH vão para a Vercel em produção
    if (req.method === 'GET') {
        await handleListAllProducts(toVercelReq(req), toVercelRes(res), supabase);
        return;
    }
    json(res, 405, { error: 'Método não permitido.' });
}

async function handleAdminOrders(req, res) {
    await handleListOrders(toVercelReq(req), toVercelRes(res), supabase);
}

async function handleConfig(req, res) {
    await handleConfigLib(toVercelReq(req), toVercelRes(res));
}

async function handleOrderStatus(req, res) {
    await handleOrderStatusLib(toVercelReq(req), toVercelRes(res), supabase);
}

/**
 * Roteia /api/admin-financial delegando TODOS os resources para os
 * handlers da biblioteca compartilhada.
 *
 * CRUD completo (GET/POST/PATCH/DELETE) — diferente da versão anterior
 * que só suportava GET. O body de POST/PATCH é parseado automaticamente
 * pelo parseRequestBody() no router.
 */
async function handleFinancial(req, res) {
  const url = parseUrl(req);
  const resource = url.searchParams.get('resource');

  const resourceHandlers = {
    students:         handleStudents,
    teachers:         handleTeachers,
    enrollments:      handleEnrollments,
    tuitions:         handleTuitions,
    payments:         handlePayments,
    expenses:         handleExpenses,
    investments:      handleInvestments,
    teacher_payments: handleTeacherPayments,
    lessons:          handleLessons,
    attendance:       handleAttendance,
    dashboard:        handleDashboard,
    summary:          handleSummary,
  };

  const handler = resourceHandlers[resource];
  if (!handler) {
    json(res, 400, {
      error: 'Parâmetro ?resource= inválido ou ausente. Use: students, teachers, enrollments, tuitions, payments, expenses, investments, teacher_payments, summary, dashboard, lessons, attendance.',
    });
    return;
  }

  try {
    await handler(toVercelReq(req), toVercelRes(res), supabase);
  } catch (err) {
    console.error(`[server-dev] Erro em ${resource}:`, err);
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
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    });
    res.end();
    return;
  }

  try {
    // Parseia JSON body para POST/PATCH antes de rotear
    await parseRequestBody(req);

    switch (path) {
      case '/api/admin-financial':
        if (!auth(req, res)) return;
        await handleFinancial(req, res);
        break;

      case '/api/admin-orders':
        if (!auth(req, res)) return;
        await handleAdminOrders(req, res);
        break;

      case '/api/admin-products':
        if (!auth(req, res)) return;
        await handleAdminProducts(req, res);
        break;

      case '/api/products':
        await handleProducts(req, res);
        break;

      case '/api/order-status':
        await handleOrderStatus(req, res);
        break;

      case '/api/config':
        await handleConfig(req, res);
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
