/**
 * tests/e2e-full-flow.test.js
 *
 * Teste E2E (integração) que percorre o fluxo completo:
 *   Criar aluno → Criar vínculo → Criar aula → Marcar presença
 *
 * Requer conexão real com Supabase (lê .env).
 * Pula automaticamente se .env não estiver disponível.
 * Cria e limpa seus próprios dados de teste.
 *
 * Uso: node --test tests/e2e-full-flow.test.js
 * Ou:  npm test (pula se sem .env)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// ── Carregar .env do diretório raiz do projeto ────────────────
function loadEnv() {
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) {
        console.warn('⚠️ .env não encontrado em:', envPath);
        return {};
    }
    const content = readFileSync(envPath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        vars[key] = val;
    }
    return vars;
}

const env = loadEnv();
const hasEnv = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

// ── IDs únicos para este teste ─────────────────────────────────
const SUFFIX = randomUUID().slice(0, 8).toUpperCase();
const TEST_PREFIX = 'E2E';

const TEST_STUDENT = {
    id: `ST-${TEST_PREFIX}-${SUFFIX}`,
    name: `Teste E2E Aluno ${SUFFIX}`,
    email: `teste.aluno.${SUFFIX.toLowerCase()}@email.com`,
    phone: '(21) 99999-9999',
    instruments: 'Piano',
    status: 'active',
};

const TEST_TEACHER = {
    id: `TE-${TEST_PREFIX}-${SUFFIX}`,
    name: `Teste E2E Professor ${SUFFIX}`,
    phone: '(21) 99999-8888',
    specialty: 'Piano, Canto',
    days_of_week: '{seg,ter,qua,qui,sex}',
    rate_per_class: 50.00,
    active: true,
};

const TEST_ENROLLMENT = {
    id: `EN-${TEST_PREFIX}-${SUFFIX}`,
    student_id: TEST_STUDENT.id,
    teacher_id: TEST_TEACHER.id,
    instrument: 'Piano',
    day_of_week: 'seg',
    class_time: '14:00',
    duration_minutes: 60,
    classes_per_week: 1,
    monthly_fee: 300.00,
    billing_type: 'monthly',
    status: 'active',
};

const TEST_LESSON = {
    student_id: TEST_STUDENT.id,
    teacher_id: TEST_TEACHER.id,
    instrument: 'Piano',
    date: new Date().toISOString().slice(0, 10),
    start_time: '14:00',
    duration_minutes: 60,
    lesson_type: 'regular',
    status: 'scheduled',
};

const TEST_ATTENDANCE = {
    status: 'present',
    late_minutes: 0,
    notes: 'E2E test - presente',
};

// ── Session state ──────────────────────────────────────────────
let supabase;
let lessonId;

// ══════════════════════════════════════════════════════════════════
//  0. SETUP
// ══════════════════════════════════════════════════════════════════

test('[SETUP] Conectar ao Supabase', { skip: !hasEnv }, async () => {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('students').select('id', { count: 'exact', head: true }).limit(1);
    assert.ok(error === null, 'Conexão com Supabase OK');
});

test('[SETUP] Criar professor de teste', { skip: !hasEnv }, async () => {
    const { data, error } = await supabase
        .from('teachers')
        .insert(TEST_TEACHER)
        .select('id')
        .single();
    assert.equal(error, null, 'Professor criado');
    assert.equal(data.id, TEST_TEACHER.id);
});

// ══════════════════════════════════════════════════════════════════
//  1. CRIAR ALUNO
// ══════════════════════════════════════════════════════════════════

test('1.1 POST /students — criar aluno', { skip: !hasEnv }, async () => {
    const { data, error } = await supabase
        .from('students')
        .insert(TEST_STUDENT)
        .select('*')
        .single();
    assert.equal(error, null, 'Aluno criado sem erro');
    assert.equal(data.name, TEST_STUDENT.name);
    assert.equal(data.status, 'active');
    assert.ok(data.id.startsWith('ST-'), `ID começa com ST-: ${data.id}`);
});

test('1.2 GET /students — consultar aluno existe', { skip: !hasEnv }, async () => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', TEST_STUDENT.id)
        .single();
    assert.equal(error, null);
    assert.ok(data, 'Aluno encontrado');
    assert.equal(data.name, TEST_STUDENT.name);
});

// ══════════════════════════════════════════════════════════════════
//  2. CRIAR VÍNCULO
// ══════════════════════════════════════════════════════════════════

test('2.1 POST /enrollments — criar vínculo', { skip: !hasEnv }, async () => {
    const { data, error } = await supabase
        .from('enrollments')
        .insert(TEST_ENROLLMENT)
        .select('*')
        .single();
    assert.equal(error, null, 'Vínculo criado sem erro');
    assert.equal(data.student_id, TEST_STUDENT.id);
    assert.equal(data.teacher_id, TEST_TEACHER.id);
    assert.equal(data.monthly_fee, 300.00);
    assert.equal(data.status, 'active');
});

test('2.2 GET /enrollments — consultar vínculo', { skip: !hasEnv }, async () => {
    const { data, error } = await supabase
        .from('enrollments')
        .select('*, students(name), teachers(name)')
        .eq('id', TEST_ENROLLMENT.id)
        .single();
    assert.equal(error, null);
    assert.ok(data, 'Vínculo encontrado');
    assert.equal(data.students?.name, TEST_STUDENT.name);
    assert.equal(data.teachers?.name, TEST_TEACHER.name);
});

// ══════════════════════════════════════════════════════════════════
//  3. CRIAR AULA
// ══════════════════════════════════════════════════════════════════

test('3.1 POST /lessons — criar aula', { skip: !hasEnv }, async () => {
    const payload = {
        ...TEST_LESSON,
        enrollment_id: TEST_ENROLLMENT.id,
    };

    const { data, error } = await supabase
        .from('lessons')
        .insert({
            ...payload,
            id: `LS-${TEST_PREFIX}-${SUFFIX}`,
            end_time: '15:00',
        })
        .select('*, students(name), teachers(name)')
        .single();

    assert.equal(error, null, 'Aula criada sem erro');
    assert.equal(data.student_id, TEST_STUDENT.id);
    assert.equal(data.teacher_id, TEST_TEACHER.id);
    assert.equal(data.status, 'scheduled');
    lessonId = data.id;
    assert.ok(lessonId, 'lessonId salvo para próximos passos');
});

test('3.2 GET /lessons — consultar aula', { skip: !hasEnv }, async () => {
    assert.ok(lessonId, 'lessonId disponível');
    const { data, error } = await supabase
        .from('lessons')
        .select('*, students(name), teachers(name)')
        .eq('id', lessonId)
        .single();
    assert.equal(error, null);
    assert.ok(data, 'Aula encontrada');
    assert.equal(data.date, TEST_LESSON.date);
    assert.equal(data.start_time, '14:00');
});

test('3.3 PATCH /lessons — completar aula', { skip: !hasEnv }, async () => {
    assert.ok(lessonId, 'lessonId disponível');
    const { data, error } = await supabase
        .from('lessons')
        .update({ status: 'completed' })
        .eq('id', lessonId)
        .select('*')
        .single();
    assert.equal(error, null);
    assert.equal(data.status, 'completed', 'Aula marcada como completed');
});

// ══════════════════════════════════════════════════════════════════
//  4. MARCAR PRESENÇA
// ══════════════════════════════════════════════════════════════════

test('4.1 POST /attendance — marcar presença', { skip: !hasEnv }, async () => {
    assert.ok(lessonId, 'lessonId disponível');
    const { data, error } = await supabase
        .from('attendance')
        .insert({
            id: `AT-${TEST_PREFIX}-${SUFFIX}`,
            lesson_id: lessonId,
            student_id: TEST_STUDENT.id,
            status: TEST_ATTENDANCE.status,
            late_minutes: TEST_ATTENDANCE.late_minutes,
            notes: TEST_ATTENDANCE.notes,
            recorded_at: new Date().toISOString(),
        })
        .select('*, lessons(date, start_time), students!attendance_student_id_fkey(name)')
        .single();

    assert.equal(error, null, 'Presença registrada sem erro');
    assert.equal(data.status, 'present');
    assert.equal(data.student_id, TEST_STUDENT.id);
});

test('4.2 GET /attendance — consultar presença', { skip: !hasEnv }, async () => {
    const { data, error } = await supabase
        .from('attendance')
        .select('*, lessons(date, start_time), students!attendance_student_id_fkey(name)')
        .eq('lesson_id', lessonId);
    assert.equal(error, null);
    assert.ok(data.length >= 1, 'Presença encontrada');
    assert.equal(data[0].students?.name, TEST_STUDENT.name);
});

// ══════════════════════════════════════════════════════════════════
//  5. CLEANUP (sempre executa, mesmo se passos anteriores falharem)
// ══════════════════════════════════════════════════════════════════

test('[CLEANUP] Remover dados de teste', { skip: !hasEnv }, async () => {
    const results = [];

    if (lessonId) {
        const { error: e1 } = await supabase.from('attendance').delete().eq('lesson_id', lessonId);
        results.push(`attendance: ${e1 ? e1.message : 'OK'}`);
        const { error: e2 } = await supabase.from('lessons').delete().eq('id', lessonId);
        results.push(`lesson: ${e2 ? e2.message : 'OK'}`);
    }

    const { error: e3 } = await supabase.from('enrollments').delete().eq('id', TEST_ENROLLMENT.id);
    results.push(`enrollment: ${e3 ? e3.message : 'OK'}`);

    const { error: e4 } = await supabase.from('students').delete().eq('id', TEST_STUDENT.id);
    results.push(`student: ${e4 ? e4.message : 'OK'}`);

    const { error: e5 } = await supabase.from('teachers').delete().eq('id', TEST_TEACHER.id);
    results.push(`teacher: ${e5 ? e5.message : 'OK'}`);

    console.log('🧹 Cleanup:', results.join(' | '));
});

// ══════════════════════════════════════════════════════════════════
//  6. VERIFICAÇÃO FINAL (dados foram limpos)
// ══════════════════════════════════════════════════════════════════

test('[VERIFY] Dados de teste não existem mais', { skip: !hasEnv }, async () => {
    const tables = [
        { table: 'attendance', col: 'lesson_id', val: lessonId || 'NONE' },
        { table: 'lessons', col: 'id', val: lessonId || 'NONE' },
        { table: 'enrollments', col: 'id', val: TEST_ENROLLMENT.id },
        { table: 'students', col: 'id', val: TEST_STUDENT.id },
        { table: 'teachers', col: 'id', val: TEST_TEACHER.id },
    ];

    for (const { table, col, val } of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq(col, val);
        assert.equal(error, null, `${table}: query OK`);
        assert.equal(count, 0, `${table}: ${count} registro(s) restante(s) — cleanup falhou`);
    }

    console.log('✅ Todos os dados de teste foram removidos com sucesso.');
});
