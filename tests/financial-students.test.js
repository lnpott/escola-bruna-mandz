import test from 'node:test';
import assert from 'node:assert/strict';
import { handleStudents } from '../api/_lib/financial/students.js';

/**
 * Mock mínimo e encadeável do client Supabase (supabase-js). Cobre só os
 * métodos que os handlers de fato chamam. Cada teste injeta seu próprio
 * comportamento de resposta via `resolveWith`.
 */
function makeSupabaseMock({ insertResult, updateResult, selectResult } = {}) {
    const calls = { insert: [], update: [], select: [] };

    const chain = {
        select: (...args) => { calls.select.push(args); return chain; },
        order: () => chain,
        range: () => chain,
        eq: () => chain,
        insert: (rows) => { calls.insert.push(rows); return chain; },
        update: (upd) => { calls.update.push(upd); return chain; },
        single: () => {
            if (calls.update.length) return Promise.resolve(updateResult ?? { data: { id: 'ST-000001', ...calls.update[0] }, error: null });
            if (calls.insert.length) return Promise.resolve(insertResult ?? { data: { id: 'ST-000001', ...calls.insert[0][0] }, error: null });
            return Promise.resolve(selectResult ?? { data: [], error: null });
        },
        then: (resolve) => resolve(selectResult ?? { data: [], error: null }),
    };

    return {
        from: () => chain,
        _calls: calls,
    };
}

function makeRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
    return res;
}

test('POST /students: não inclui mais o campo active no payload salvo', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'POST', body: { name: 'Maria Silva', status: 'active' } };
    const res = makeRes();

    await handleStudents(req, res, supabase);

    assert.equal(res.statusCode, 201);
    const insertedPayload = supabase._calls.insert[0][0];
    assert.ok(!('active' in insertedPayload), 'payload não deveria conter o campo active');
    assert.equal(insertedPayload.status, 'active');
});

test('POST /students: rejeita status inválido com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'POST', body: { name: 'João', status: 'nao-existe' } };
    const res = makeRes();

    await handleStudents(req, res, supabase);

    assert.equal(res.statusCode, 400);
});

test('POST /students: exige nome', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'POST', body: {} };
    const res = makeRes();

    await handleStudents(req, res, supabase);

    assert.equal(res.statusCode, 400);
});

test('PATCH /students: atualizar status não gera mais campo active espelhado', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'PATCH', body: { id: 'ST-000001', status: 'suspended' } };
    const res = makeRes();

    await handleStudents(req, res, supabase);

    assert.equal(res.statusCode, 200);
    const updatePayload = supabase._calls.update[0];
    assert.ok(!('active' in updatePayload), 'update não deveria mais escrever active');
    assert.equal(updatePayload.status, 'suspended');
});

test('GET /students: método não suportado retorna 405', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'PUT', body: {}, query: {} };
    const res = makeRes();

    await handleStudents(req, res, supabase);

    assert.equal(res.statusCode, 405);
});
