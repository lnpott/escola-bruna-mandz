import test from 'node:test';
import assert from 'node:assert/strict';
import {
    safeFloat,
    safeInt,
    normalizeMonthDate,
    normalizeOptionalFields,
    classifyError,
    monthRange,
    resolvePaidTimestamp,
    genId,
} from '../api/_lib/financial/helpers.js';

// ── safeFloat ────────────────────────────────────────────────────────────

test('safeFloat: aceita número válido', () => {
    assert.equal(safeFloat('12.5'), 12.5);
});

test('safeFloat: retorna fallback para NaN', () => {
    assert.equal(safeFloat('abc', 42), 42);
});

test('safeFloat: retorna fallback para undefined/null', () => {
    assert.equal(safeFloat(undefined, 7), 7);
    assert.equal(safeFloat(null, 7), 7);
});

test('safeFloat: rejeita valor abaixo do mínimo', () => {
    assert.equal(safeFloat(-5, 0, 0), 0);
});

// ── safeInt ──────────────────────────────────────────────────────────────

test('safeInt: aceita inteiro válido', () => {
    assert.equal(safeInt('10'), 10);
});

test('safeInt: retorna fallback para NaN', () => {
    assert.equal(safeInt('não é número', 3), 3);
});

test('safeInt: aceita fallback null (usado em installment_number)', () => {
    assert.equal(safeInt(undefined, null), null);
});

// ── normalizeMonthDate ───────────────────────────────────────────────────

test('normalizeMonthDate: completa YYYY-MM com dia 01', () => {
    assert.equal(normalizeMonthDate('2026-07'), '2026-07-01');
});

test('normalizeMonthDate: mantém YYYY-MM-DD como está', () => {
    assert.equal(normalizeMonthDate('2026-07-15'), '2026-07-15');
});

test('normalizeMonthDate: retorna null para formato inválido', () => {
    assert.equal(normalizeMonthDate('julho/2026'), null);
});

test('normalizeMonthDate: retorna null para valor vazio', () => {
    assert.equal(normalizeMonthDate(''), null);
    assert.equal(normalizeMonthDate(null), null);
});

// ── normalizeOptionalFields ──────────────────────────────────────────────

test('normalizeOptionalFields: converte string vazia em null', () => {
    const obj = { cpf: '', email: 'a@b.com' };
    normalizeOptionalFields(obj, ['cpf', 'email']);
    assert.equal(obj.cpf, null);
    assert.equal(obj.email, 'a@b.com');
});

test('normalizeOptionalFields: converte undefined em null', () => {
    const obj = { phone: undefined };
    normalizeOptionalFields(obj, ['phone']);
    assert.equal(obj.phone, null);
});

// ── classifyError ────────────────────────────────────────────────────────

test('classifyError: unique_violation vira 409', () => {
    const result = classifyError({ code: '23505' });
    assert.equal(result.statusCode, 409);
    assert.equal(result.errorCode, 'ERR_DB_UNIQUE_VIOLATION');
});

test('classifyError: not_null_violation vira 400', () => {
    const result = classifyError({ code: '23502' });
    assert.equal(result.statusCode, 400);
});

test('classifyError: código desconhecido vira 500 sem vazar err.message', () => {
    const result = classifyError({ code: 'XX999', message: 'detalhe interno sensível' });
    assert.equal(result.statusCode, 500);
    assert.equal(result.errorCode, 'ERR_INTERNAL');
    assert.ok(!result.friendlyMessage.includes('detalhe interno sensível'));
});

// ── monthRange ───────────────────────────────────────────────────────────

test('monthRange: calcula último dia do mês corretamente (fevereiro)', () => {
    const r = monthRange(2, 2026);
    assert.equal(r.dateStart, '2026-02-01');
    assert.equal(r.dateEnd, '2026-02-28');
});

test('monthRange: calcula último dia do mês corretamente (mês de 31 dias)', () => {
    const r = monthRange(7, 2026);
    assert.equal(r.dateEnd, '2026-07-31');
});

// ── resolvePaidTimestamp ─────────────────────────────────────────────────

test('resolvePaidTimestamp: define paid_at ao marcar como pago sem data', () => {
    const upd = {};
    resolvePaidTimestamp(upd, true);
    assert.ok(upd.paid_at);
});

test('resolvePaidTimestamp: não sobrescreve paid_at já definido', () => {
    const upd = { paid_at: '2026-01-01T00:00:00.000Z' };
    resolvePaidTimestamp(upd, true);
    assert.equal(upd.paid_at, '2026-01-01T00:00:00.000Z');
});

test('resolvePaidTimestamp: limpa paid_at ao desmarcar', () => {
    const upd = { paid_at: '2026-01-01T00:00:00.000Z' };
    resolvePaidTimestamp(upd, false);
    assert.equal(upd.paid_at, null);
});

// ── genId ────────────────────────────────────────────────────────────────

test('genId: gera ID com prefixo correto e formato esperado', () => {
    const id = genId('ST');
    assert.match(id, /^ST-[A-Z0-9]{6}$/);
});
