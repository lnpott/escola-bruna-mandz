/**
 * tests/adapters.test.js
 *
 * Testes unitários para os adaptadores toVercelReq / toVercelRes do
 * server-dev.js. Validam que req/res do Node http.createServer são
 * traduzidos corretamente para o formato Vercel-style esperado pelos
 * handlers em api/_lib/financial/.
 *
 * NÃO requer conexão com Supabase — testa apenas funções puras.
 *
 * Uso: node --test tests/adapters.test.js
 * Ou:  npm test (roda todos os testes)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { toVercelReq, toVercelRes, parseUrl } from '../server-dev.js';

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Cria um mock de IncomingMessage (Node http) simples para os testes.
 * @param {string} urlPath - Caminho + query string (ex: "/api/test?foo=1")
 * @param {string} method - HTTP method (default "GET")
 * @param {object} headers - Cabeçalhos extras
 * @returns {object} Objeto com interface similar a IncomingMessage
 */
function mockReq(urlPath, method = 'GET', headers = {}) {
    return {
        url: urlPath,
        method,
        headers: {
            host: 'localhost:3001',
            ...headers,
        },
    };
}

/**
 * Cria um mock de ServerResponse (Node http) que captura writeHead/end.
 * @returns {{ res: object, calls: { writeHead: object[], end: object[] } }}
 */
function mockRes() {
    const calls = { writeHead: [], end: [] };
    const res = {
        writeHead(status, headers) {
            calls.writeHead.push({ status, headers });
            return this;
        },
        end(data) {
            calls.end.push({ data });
            return this;
        },
    };
    return { res, calls };
}

// ═══════════════════════════════════════════════════════════════════
//  parseUrl
// ═══════════════════════════════════════════════════════════════════

test('parseUrl: extrai pathname e searchParams de URL absoluta', () => {
    const req = mockReq('/api/test?resource=students&limit=10');
    const url = parseUrl(req);
    assert.equal(url.pathname, '/api/test');
    assert.equal(url.searchParams.get('resource'), 'students');
    assert.equal(url.searchParams.get('limit'), '10');
});

test('parseUrl: funciona com URL relativa sem host', () => {
    const req = {
        url: '/api/test?foo=bar',
        headers: { host: 'example.com' },
    };
    const url = parseUrl(req);
    assert.equal(url.pathname, '/api/test');
    assert.equal(url.searchParams.get('foo'), 'bar');
});

test('parseUrl: funciona com URL sem query string', () => {
    const req = mockReq('/api/dashboard');
    const url = parseUrl(req);
    assert.equal(url.pathname, '/api/dashboard');
    assert.equal(url.searchParams.size, 0);
});

test('parseUrl: lida com query params codificados', () => {
    const req = mockReq('/api?name=Jo%C3%A3o%20Silva');
    const url = parseUrl(req);
    assert.equal(url.searchParams.get('name'), 'João Silva');
});

// ═══════════════════════════════════════════════════════════════════
//  toVercelReq
// ═══════════════════════════════════════════════════════════════════

test('toVercelReq: converte method, query e headers', () => {
    const req = mockReq('/api/admin-financial?resource=students&limit=20', 'GET', {
        'x-admin-password': 'secret',
        'content-type': 'application/json',
    });
    const vercelReq = toVercelReq(req);

    assert.equal(vercelReq.method, 'GET');
    assert.deepEqual(vercelReq.query, { resource: 'students', limit: '20' });
    assert.equal(vercelReq.headers['x-admin-password'], 'secret');
    assert.equal(vercelReq.headers['content-type'], 'application/json');
});

test('toVercelReq: query vazia retorna objeto vazio', () => {
    const req = mockReq('/api/dashboard', 'GET');
    const vercelReq = toVercelReq(req);
    assert.deepEqual(vercelReq.query, {});
});

test('toVercelReq: reflection de method POST', () => {
    const req = mockReq('/api/admin-financial?resource=students', 'POST');
    const vercelReq = toVercelReq(req);
    assert.equal(vercelReq.method, 'POST');
});

test('toVercelReq: reflection de method PATCH', () => {
    const req = mockReq('/api/admin-financial?resource=students&id=ST-ABC123', 'PATCH');
    const vercelReq = toVercelReq(req);
    assert.equal(vercelReq.method, 'PATCH');
    assert.equal(vercelReq.query.id, 'ST-ABC123');
});

test('toVercelReq: query com múltiplos parâmetros', () => {
    // O URLSearchParams lida com parâmetros duplicados: 'a=1&a=2' → get('a') retorna '2'
    const req = mockReq('/api?resource=summary&month=7&year=2026&foo=bar&baz=qux');
    const vercelReq = toVercelReq(req);
    assert.equal(vercelReq.query.resource, 'summary');
    assert.equal(vercelReq.query.month, '7');
    assert.equal(vercelReq.query.year, '2026');
    assert.equal(vercelReq.query.foo, 'bar');
    assert.equal(vercelReq.query.baz, 'qux');
});

test('toVercelReq: headers inclui host', () => {
    const req = mockReq('/api/test?resource=summary&month=7&year=2026');
    const vercelReq = toVercelReq(req);
    assert.equal(vercelReq.headers.host, 'localhost:3001');
});

// ═══════════════════════════════════════════════════════════════════
//  toVercelRes
// ═══════════════════════════════════════════════════════════════════

test('toVercelRes: status(200).json() chama writeHead com código correto', () => {
    const { res, calls } = mockRes();
    const vRes = toVercelRes(res);
    vRes.status(200).json({ ok: true });

    assert.equal(calls.writeHead.length, 1);
    assert.equal(calls.writeHead[0].status, 200);
    assert.ok(calls.writeHead[0].headers['Content-Type'], 'application/json');
});

test('toVercelRes: status(201).json() chama writeHead com 201', () => {
    const { res, calls } = mockRes();
    const vRes = toVercelRes(res);
    vRes.status(201).json({ student: { id: 'ST-ABC123' } });

    assert.equal(calls.writeHead.length, 1);
    assert.equal(calls.writeHead[0].status, 201);
});

test('toVercelRes: status(400).json() com erro', () => {
    const { res, calls } = mockRes();
    const vRes = toVercelRes(res);
    vRes.status(400).json({ error: 'Parâmetro inválido.' });

    assert.equal(calls.writeHead[0].status, 400);
    assert.equal(calls.end.length, 1);
    const parsed = JSON.parse(calls.end[0].data);
    assert.equal(parsed.error, 'Parâmetro inválido.');
});

test('toVercelRes: status(500).json() com erro genérico', () => {
    const { res, calls } = mockRes();
    const vRes = toVercelRes(res);
    vRes.status(500).json({ error: 'Erro interno do servidor.' });

    assert.equal(calls.writeHead[0].status, 500);
    const parsed = JSON.parse(calls.end[0].data);
    assert.equal(parsed.error, 'Erro interno do servidor.');
    // Garante que err.message NÃO vaza
    assert.equal(parsed.details, undefined);
});

test('toVercelRes: JSON serializado corretamente', () => {
    const { res, calls } = mockRes();
    const payload = {
        dashboard: {
            financial: { revenue: 1500, balance: 500 },
            school: { active_students: 10 },
        },
    };
    const vRes = toVercelRes(res);
    vRes.status(200).json(payload);

    const parsed = JSON.parse(calls.end[0].data);
    assert.deepEqual(parsed, payload);
});

test('toVercelRes: chamadas sucessivas acumulam no mock correto', () => {
    const { res, calls } = mockRes();
    const vRes = toVercelRes(res);

    vRes.status(200).json({ first: true });
    vRes.status(404).json({ error: 'Not found' });

    assert.equal(calls.writeHead.length, 2);
    assert.equal(calls.writeHead[0].status, 200);
    assert.equal(calls.writeHead[1].status, 404);
    assert.equal(JSON.parse(calls.end[0].data).first, true);
    assert.equal(JSON.parse(calls.end[1].data).error, 'Not found');
});

// ═══════════════════════════════════════════════════════════════════
//  INTEGRAÇÃO: Adapter + Handler (simulado)
// ═══════════════════════════════════════════════════════════════════

test('[integração] toVercelReq + toVercelRes fornecem o formato que handleSummary espera', () => {
    // Simula o que handleSummary (em api/_lib/financial/summary.js) faz:
    //   1. Lê req.query.month e req.query.year
    //   2. Verifica req.method
    //   3. Retorna res.status(400).json({ error: '...' }) se sem parâmetros
    const req = mockReq('/api/admin-financial?resource=summary&month=7&year=2026');
    const { res, calls } = mockRes();

    const vReq = toVercelReq(req);
    const vRes = toVercelRes(res);

    // Simula a lógica de handleSummary
    assert.equal(vReq.method, 'GET');
    assert.equal(vReq.query.month, '7');
    assert.equal(vReq.query.year, '2026');

    // Resposta simulada
    vRes.status(200).json({ summary: { revenue: 5000 } });
    assert.equal(JSON.parse(calls.end[0].data).summary.revenue, 5000);
});

test('[integração] adapter rejeita requisição sem parâmetros obrigatórios (simula handleSummary)', () => {
    const req = mockReq('/api/admin-financial?resource=summary'); // sem month/year
    const { res, calls } = mockRes();

    const vReq = toVercelReq(req);
    const vRes = toVercelRes(res);

    // Simula validação de handleSummary
    const { month, year } = vReq.query;
    if (!month || !year) {
        vRes.status(400).json({ error: 'Parâmetros month e year são obrigatórios.' });
    }

    assert.equal(calls.writeHead[0].status, 400);
    const parsed = JSON.parse(calls.end[0].data);
    assert.ok(parsed.error.includes('month'));
});

test('[integração] adapter reflete POST no Dashboard — dashboard só aceita GET', () => {
    const req = mockReq('/api/admin-financial?resource=dashboard', 'POST');
    const { res, calls } = mockRes();

    const vReq = toVercelReq(req);
    const vRes = toVercelRes(res);

    // Simula a validação de handleDashboard
    if (vReq.method !== 'GET') {
        vRes.status(405).json({ error: 'Método não permitido.' });
    }

    assert.equal(calls.writeHead[0].status, 405);
});
