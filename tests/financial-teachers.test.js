/**
 * tests/financial-teachers.test.js
 *
 * Testes unitários para handleTeachers (api/_lib/financial/teachers.js).
 * Foca no guard de DELETE que impede exclusão de professores com
 * vínculos ativos.
 *
 * Uso: node --test tests/financial-teachers.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { handleTeachers } from '../api/_lib/financial/teachers.js';

/**
 * Mock encadeável do Supabase (mesmo padrão de financial-enrollments.test.js).
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
//  VALIDAÇÃO — ID AUSENTE
// ══════════════════════════════════════════════════════════════════════

test('DELETE /teachers: rejeita id ausente com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'DELETE', query: {} };
    const res = makeRes();

    await handleTeachers(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('ID'));
});

// ══════════════════════════════════════════════════════════════════════
//  GUARD: VÍNCULOS ATIVOS
// ══════════════════════════════════════════════════════════════════════

test('DELETE /teachers: bloqueia exclusão se há vínculos ativos (409)', async () => {
    const supabase = makeSupabaseMock({
        enrollments: { data: null, count: 2, error: null },  // 2 vínculos ativos
    });
    const req = { method: 'DELETE', query: { id: 'TE-001' } };
    const res = makeRes();

    await handleTeachers(req, res, supabase);

    assert.equal(res.statusCode, 409);
    assert.ok(res.body.error.includes('2 vínculo(s)'));
    assert.ok(res.body.error.includes('Remova ou inative'));
});

test('DELETE /teachers: permite exclusão se não há vínculos ativos', async () => {
    const supabase = makeSupabaseMock({
        enrollments: { data: null, count: 0, error: null },  // 0 vínculos ativos
    });
    const req = { method: 'DELETE', query: { id: 'TE-001' } };
    const res = makeRes();

    await handleTeachers(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.success);
});

test('DELETE /teachers: permite exclusão se há apenas vínculos inativos', async () => {
    const supabase = makeSupabaseMock({
        enrollments: { data: null, count: 0, error: null },  // 0 vínculos ACTIVE
    });
    const req = { method: 'DELETE', query: { id: 'TE-001' } };
    const res = makeRes();

    await handleTeachers(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.success);
});

// ══════════════════════════════════════════════════════════════════════
//  VERIFICAÇÃO DE CHAMADAS
// ══════════════════════════════════════════════════════════════════════

test('DELETE /teachers: verifica que consultou enrollments com teacher_id e status active', async () => {
    const supabase = makeSupabaseMock({
        enrollments: { data: null, count: 0, error: null },
    });
    const req = { method: 'DELETE', query: { id: 'TE-001' } };
    const res = makeRes();

    await handleTeachers(req, res, supabase);

    // Verifica ordem: enrollments → teachers
    const fromCalls = supabase._calls.from;
    assert.equal(fromCalls[0], 'enrollments', 'Primeira consulta deve ser enrollments');
    assert.equal(fromCalls[1], 'teachers', 'Segunda consulta deve ser teachers');

    // Verifica filtro de teacher_id e status
    const eqCalls = supabase._calls.eq || [];
    const teacherEq = eqCalls.find(c => c.table === 'enrollments' && c.args[0] === 'teacher_id');
    assert.ok(teacherEq, 'Deve filtrar enrollments por teacher_id');
    assert.equal(teacherEq.args[1], 'TE-001');

    const statusEq = eqCalls.find(c => c.table === 'enrollments' && c.args[0] === 'status');
    assert.ok(statusEq, 'Deve filtrar enrollments por status');
    assert.equal(statusEq.args[1], 'active');
});

test('DELETE /teachers: verifica que usou head:true para não trazer linhas', async () => {
    const supabase = makeSupabaseMock({
        enrollments: { data: null, count: 0, error: null },
    });
    const req = { method: 'DELETE', query: { id: 'TE-001' } };
    const res = makeRes();

    await handleTeachers(req, res, supabase);

    const selectCalls = supabase._calls.select || [];
    const enrollmentSelect = selectCalls.find(c => c.table === 'enrollments');
    assert.ok(enrollmentSelect, 'Deve ter chamado select em enrollments');
    // Verifica que passou head: true
    // select('id', { count: 'exact', head: true }) → args[0] = 'id', args[1] = { count: 'exact', head: true }
    const selectOptions = enrollmentSelect.args[1] || {};
    assert.ok(selectOptions.head === true, 'Deve usar head:true para contagem');
    assert.equal(selectOptions.count, 'exact', 'Deve usar count:exact');
});
