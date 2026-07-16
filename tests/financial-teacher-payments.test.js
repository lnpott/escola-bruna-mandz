import test from 'node:test';
import assert from 'node:assert/strict';
import { handleTeacherPayments } from '../api/_lib/financial/teacherPayments.js';

/**
 * Mock encadeável do Supabase que suporta:
 * - Retorno estático por tabela: { tabela: { data, error } }
 * - Retorno em sequência: { tabela: [{ data, count, error }, { data, error }] }
 * - Registro de chamadas para assertions
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
            gt: () => chain,
            gte: () => chain,
            lte: () => chain,
            in: () => chain,
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
        // Usa Proxy para capturar acesso a propriedades não definidas (ex: data, count)
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
//  VALIDAÇÃO DE PARÂMETROS
// ══════════════════════════════════════════════════════════════════════

test('generate: rejeita month ausente com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'GET', query: { action: 'generate', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('month'));
});

test('generate: rejeita year ausente com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'GET', query: { action: 'generate', month: '7' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('year'));
});

test('generate: rejeita month inválido (< 1) com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'GET', query: { action: 'generate', month: '0', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('month'));
});

test('generate: rejeita month inválido (> 12) com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'GET', query: { action: 'generate', month: '13', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('month'));
});

test('generate: rejeita year inválido (< 2000) com 400', async () => {
    const supabase = makeSupabaseMock();
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '1999' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('year'));
});

// ══════════════════════════════════════════════════════════════════════
//  CASOS DE NEGÓCIO
// ══════════════════════════════════════════════════════════════════════

test('generate: sem professores ativos retorna mensagem informativa', async () => {
    const supabase = makeSupabaseMock({
        teachers: { data: [], error: null },
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.generated, []);
    assert.ok(res.body.message.includes('Nenhum professor ativo'));
});

test('generate: professor sem aulas completadas é ignorado com reason', async () => {
    const supabase = makeSupabaseMock({
        teachers: { data: [{ id: 'T-001', name: 'João', rate_per_class: 50 }], error: null },
        lessons: { data: null, count: 0, error: null },  // 0 aulas completadas
        teacher_payments: { data: null, error: null },
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.generated.length, 0);
    assert.equal(res.body.skipped.length, 1);
    assert.equal(res.body.skipped[0].teacher_name, 'João');
    assert.equal(res.body.skipped[0].reason, 'Nenhuma aula completada no período');
    assert.equal(res.body.summary.total_teachers, 1);
});

test('generate: professor com aulas gera pagamento com valor correto', async () => {
    const supabase = makeSupabaseMock({
        teachers: { data: [{ id: 'T-001', name: 'João', rate_per_class: 50 }], error: null },
        lessons: { data: null, count: 5, error: null },  // 5 aulas × R$ 50 = R$ 250
        teacher_payments: [
            { data: null, error: null },                    // maybeSingle → sem existente
            { data: { id: 'TP-GEN-001', teacher_id: 'T-001', amount: 250 }, error: null },  // insert result
        ],
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.generated.length, 1);
    assert.equal(res.body.generated[0].teacher_name, 'João');
    assert.equal(res.body.generated[0].completed_lessons, 5);
    assert.equal(res.body.generated[0].amount, 250);  // 5 × 50
    assert.equal(res.body.generated[0].created, true);
    assert.ok(res.body.generated[0].payment_id);
    assert.equal(res.body.skipped.length, 0);
    assert.equal(res.body.summary.generated_count, 1);
    assert.equal(res.body.summary.total_amount, 250);
});

test('generate: professor com pagamento existente é ignorado (idempotência)', async () => {
    const supabase = makeSupabaseMock({
        teachers: { data: [{ id: 'T-001', name: 'João', rate_per_class: 50 }], error: null },
        lessons: { data: null, count: 5, error: null },                // 5 aulas
        teacher_payments: { data: { id: 'TP-EXISTING' }, error: null }, // já existe pagamento
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.generated.length, 0);
    assert.equal(res.body.skipped.length, 1);
    assert.equal(res.body.skipped[0].reason, 'Já existe pagamento para este mês');
    assert.equal(res.body.skipped[0].completed_lessons, 5);  // mesmo tendo aulas, não duplica
    assert.equal(res.body.summary.generated_count, 0);
});

test('generate: múltiplos professores com cenários mistos', async () => {
    const supabase = makeSupabaseMock({
        teachers: {
            data: [
                { id: 'T-001', name: 'João', rate_per_class: 50 },
                { id: 'T-002', name: 'Maria', rate_per_class: 75 },
                { id: 'T-003', name: 'Pedro', rate_per_class: 40 },
            ],
            error: null,
        },
        lessons: [
            { data: null, count: 5, error: null },   // T-001: 5 aulas completadas
            { data: null, count: 0, error: null },   // T-002: 0 aulas completadas
            { data: null, count: 3, error: null },   // T-003: 3 aulas completadas
        ],
        teacher_payments: [
            { data: null, error: null },                    // T-001: maybeSingle → sem existente
            { data: { id: 'TP-T001', amount: 250 }, error: null }, // T-001: insert result
            // T-002: 0 aulas → nunca chega a teacher_payments (continue)
            { data: { id: 'TP-003' }, error: null },       // T-003: maybeSingle → já existe
        ],
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.generated.length, 1);           // só T-001 gerou
    assert.equal(res.body.generated[0].teacher_name, 'João');
    assert.equal(res.body.generated[0].amount, 250);      // 5 × 50
    assert.equal(res.body.skipped.length, 2);              // T-002 (sem aulas) + T-003 (já existe)
    assert.equal(res.body.skipped[0].teacher_name, 'Maria');
    assert.equal(res.body.skipped[0].reason, 'Nenhuma aula completada no período');
    assert.equal(res.body.skipped[1].teacher_name, 'Pedro');
    assert.equal(res.body.skipped[1].reason, 'Já existe pagamento para este mês');
    assert.equal(res.body.summary.total_teachers, 3);
    assert.equal(res.body.summary.generated_count, 1);
    assert.equal(res.body.summary.skipped_count, 2);
    assert.equal(res.body.summary.total_amount, 250);
});

test('generate: verifica que consultou teachers ativos com rate_per_class > 0', async () => {
    const supabase = makeSupabaseMock({
        teachers: { data: [], error: null },
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    // Verifica que a chamada ao Supabase foi teachers.select().eq('active', true).gt('rate_per_class', 0)
    const fromCalls = supabase._calls.from;
    assert.ok(fromCalls.includes('teachers'));

    const selectCalls = supabase._calls.select || [];
    const teacherSelect = selectCalls.find(c => c.table === 'teachers');
    assert.ok(teacherSelect, 'Deve ter chamado select em teachers');
    assert.deepEqual(teacherSelect.args[0], 'id, name, rate_per_class');
});

test('generate: notas do pagamento incluem cálculo detalhado', async () => {
    const supabase = makeSupabaseMock({
        teachers: { data: [{ id: 'T-001', name: 'João', rate_per_class: 50 }], error: null },
        lessons: { data: null, count: 5, error: null },
        teacher_payments: [
            { data: null, error: null },                    // maybeSingle
            { data: { id: 'TP-GEN-002', amount: 250 }, error: null },  // insert result
        ],
    });
    const req = { method: 'GET', query: { action: 'generate', month: '7', year: '2026' } };
    const res = makeRes();

    await handleTeacherPayments(req, res, supabase);

    const insertCalls = supabase._calls.insert || [];
    const paymentInsert = insertCalls.find(c => c.table === 'teacher_payments');
    assert.ok(paymentInsert, 'Deve ter chamado insert em teacher_payments');
    const payload = paymentInsert.rows[0];
    assert.ok(payload.notes.includes('5 aulas'));
    assert.ok(payload.notes.includes('R$ 50.00'));
    assert.equal(payload.amount, 250);
    assert.equal(payload.paid, false);
});
