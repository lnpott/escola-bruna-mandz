import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEnrollments } from '../api/_lib/financial/enrollments.js';

/**
 * Mock encadeável do Supabase que suporta retorno por tabela e contagem de chamadas.
 */
function makeSupabaseMock(tableResults = {}) {
    const calls = { from: [] };
    const counters = {};

    function getResult(tableName) {
        const result = tableResults[tableName];
        if (Array.isArray(result)) {
            counters[tableName] = (counters[tableName] || 0);
            const idx = counters[tableName];
            counters[tableName]++;
            return result[idx] ?? result[result.length - 1] ?? { data: [], error: null };
        }
        return result ?? { data: [], error: null };
    }

    function makeChain(tableName) {
        const chain = {
            select: (...args) => {
                calls.select = calls.select || [];
                calls.select.push({ table: tableName, args });
                return chain;
            },
            order: () => chain,
            range: () => chain,
            eq: (...args) => {
                calls.eq = calls.eq || [];
                calls.eq.push({ table: tableName, args });
                return chain;
            },
            in: (...args) => {
                calls.in = calls.in || [];
                calls.in.push({ table: tableName, args });
                return chain;
            },
            gt: () => chain,
            gte: () => chain,
            lte: () => chain,
            insert: (rows) => {
                calls.insert = calls.insert || [];
                calls.insert.push({ table: tableName, rows });
                return chain;
            },
            update: (upd) => {
                calls.update = calls.update || [];
                calls.update.push({ table: tableName, upd });
                return chain;
            },
            delete: () => chain,
            single: () => chain,
            maybeSingle: () => chain,
            head: () => chain,
            then: (resolve) => {
                const result = getResult(tableName);
                return resolve(result);
            },
        };
        return chain;
    }

    return {
        from: (table) => {
            calls.from.push(table);
            return makeChain(table);
        },
        _calls: calls,
    };
}

function makeRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
}

// ══════════════════════════════════════════════════════════════════════
//  VALIDAÇÃO
// ══════════════════════════════════════════════════════════════════════

test('DELETE /enrollments: rejeita id ausente com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'DELETE', query: {} };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('ID'));
});

// ══════════════════════════════════════════════════════════════════════
//  GUARD: AULAS VINCULADAS
// ══════════════════════════════════════════════════════════════════════

test('DELETE /enrollments: bloqueia exclusão se há aulas vinculadas (409)', async () => {
    const supabase = makeSupabaseMock({
        lessons: { data: null, count: 3, error: null },  // 3 aulas vinculadas
    });
    const req = { method: 'DELETE', query: { id: 'EN-001' } };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    assert.equal(res.statusCode, 409);
    assert.ok(res.body.error.includes('3 aula(s)'));
    assert.ok(res.body.error.includes('Cancele ou desvincule'));
});

test('DELETE /enrollments: permite exclusão se não há aulas vinculadas', async () => {
    const supabase = makeSupabaseMock({
        lessons: { data: null, count: 0, error: null },  // 0 aulas vinculadas
    });
    const req = { method: 'DELETE', query: { id: 'EN-001' } };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.success);
});

// ══════════════════════════════════════════════════════════════════════
//  DELETE SEM CANCEL_TUITIONS
// ══════════════════════════════════════════════════════════════════════

test('DELETE /enrollments: sem cancel_tuitions, mensalidades não são alteradas', async () => {
    const supabase = makeSupabaseMock({
        lessons: { data: null, count: 0, error: null },
    });
    const req = { method: 'DELETE', query: { id: 'EN-001' } };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.cancelled_tuitions, 0);
    assert.equal(res.body.message, 'Vínculo excluído com sucesso.');

    // Verifica que NÃO consultou tuitions
    const fromCalls = supabase._calls.from;
    assert.ok(!fromCalls.includes('tuitions'), 'Não deve consultar tuitions sem cancel_tuitions');
});

// ══════════════════════════════════════════════════════════════════════
//  DELETE COM CANCEL_TUITIONS = TRUE
// ══════════════════════════════════════════════════════════════════════

test('DELETE /enrollments: cancel_tuitions=true com mensalidades pendentes cancela e retorna count', async () => {
    const supabase = makeSupabaseMock({
        lessons: { data: null, count: 0, error: null },
        tuitions: {
            data: [
                { id: 'T-001' },
                { id: 'T-002' },
                { id: 'T-003' },
            ],
            error: null,
        },  // 3 mensalidades pendentes/atrasadas
    });
    const req = { method: 'DELETE', query: { id: 'EN-001', cancel_tuitions: 'true' } };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.cancelled_tuitions, 3);
    assert.ok(res.body.message.includes('3 mensalidade(s) cancelada(s)'));
    assert.ok(res.body.success);

    // Verifica que chamou update nas tuitions com status cancelled
    const updateCalls = supabase._calls.update || [];
    const tuitionUpdate = updateCalls.find(c => c.table === 'tuitions');
    assert.ok(tuitionUpdate, 'Deve ter chamado update em tuitions');
    assert.equal(tuitionUpdate.upd.status, 'cancelled');
    assert.ok(tuitionUpdate.upd.notes.includes('Cancelada automaticamente'));

    // Verifica que filtrou por pending/overdue
    const inCalls = supabase._calls.in || [];
    const tuitionIn = inCalls.find(c => c.table === 'tuitions');
    assert.ok(tuitionIn, 'Deve ter chamado .in() em tuitions');
    assert.deepEqual(tuitionIn.args[1], ['pending', 'overdue']);
});

test('DELETE /enrollments: cancel_tuitions=true sem tuitions retorna 0', async () => {
    const supabase = makeSupabaseMock({
        lessons: { data: null, count: 0, error: null },
        tuitions: { data: [], error: null },  // nenhuma mensalidade
    });
    const req = { method: 'DELETE', query: { id: 'EN-001', cancel_tuitions: 'true' } };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.cancelled_tuitions, 0);
    assert.equal(res.body.message, 'Vínculo excluído com sucesso.');
});

// ══════════════════════════════════════════════════════════════════════
//  VERIFICAÇÃO DE CHAMADAS
// ══════════════════════════════════════════════════════════════════════

test('DELETE /enrollments: fluxo completo verifica guard de lessons primeiro', async () => {
    const supabase = makeSupabaseMock({
        lessons: { data: null, count: 0, error: null },
        tuitions: { data: [], error: null },
    });
    const req = { method: 'DELETE', query: { id: 'EN-001', cancel_tuitions: 'true' } };
    const res = makeRes();

    await handleEnrollments(req, res, supabase);

    // Ordem das chamadas: lessons → tuitions (select) → enrollments (delete)
    const fromCalls = supabase._calls.from;
    assert.equal(fromCalls[0], 'lessons', 'Primeira consulta deve ser lessons');
    assert.equal(fromCalls[1], 'tuitions', 'Segunda consulta deve ser tuitions');

    // Verifica filtro de enrollment_id
    const eqCalls = supabase._calls.eq || [];
    const lessonEq = eqCalls.find(c => c.table === 'lessons' && c.args[0] === 'enrollment_id');
    assert.ok(lessonEq, 'Deve filtrar lessons por enrollment_id');
    assert.equal(lessonEq.args[1], 'EN-001');

    const tuitionEq = eqCalls.find(c => c.table === 'tuitions' && c.args[0] === 'enrollment_id');
    assert.ok(tuitionEq, 'Deve filtrar tuitions por enrollment_id');
    assert.equal(tuitionEq.args[1], 'EN-001');
});
