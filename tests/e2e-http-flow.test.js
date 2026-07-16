/**
 * tests/e2e-http-flow.test.js
 *
 * Teste E2E via HTTP (fetch) que valida o fluxo completo chamando os
 * endpoints da API real (admin-financial.js) através de um servidor
 * HTTP temporário.
 *
 *   Criar aluno → Criar vínculo → Criar aula → Marcar presença
 *
 * Diferença do e2e-full-flow.test.js: este teste passa pelos HANDLERS
 * reais (validação, geração de ID, tratamento de erros) via chamadas
 * HTTP autênticas com fetch(). O outro testa o banco diretamente.
 *
 * Requer conexão real com Supabase (lê .env).
 * Pula automaticamente se .env não estiver disponível.
 * Cria, inicia servidor, testa, limpa e destrói servidor.
 *
 * Uso: node --test tests/e2e-http-flow.test.js
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Importa o handler real da API (Vercel-style)
import apiHandler from '../api/admin-financial.js';

// ── Carregar .env do diretório raiz do projeto ────────────────
function loadEnv() {
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) return {};
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
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'admin';

// ── Servidor HTTP temporário que adapta para o handler Vercel ──
let server;
let serverUrl;

/**
 * Cria um servidor HTTP que traduz chamadas fetch() para o formato
 * que o handler Vercel (api/admin-financial.js) espera:
 *   - req.query  → parsed from URL query string
 *   - req.body   → parsed JSON from request body
 *   - req.method → HTTP method
 *   - res.status(code).json(data) → HTTP response
 */
function startTestServer() {
    return new Promise((resolve, reject) => {
        server = http.createServer(async (req, res) => {
            try {
                const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

                // Collect request body
                let body = '';
                await new Promise((resolveBody) => {
                    req.on('data', (chunk) => { body += chunk; });
                    req.on('end', resolveBody);
                });

                // Build Vercel-style req object
                const searchParams = Object.fromEntries(url.searchParams);
                const vercelReq = {
                    method: req.method,
                    query: searchParams,
                    body: body ? JSON.parse(body) : undefined,
                    headers: req.headers,
                };

                // Build Vercel-style res capture
                let statusCode = 200;
                let responseData = null;
                const vercelRes = {
                    status(code) { statusCode = code; return this; },
                    json(data) { responseData = data; },
                };

                await apiHandler(vercelReq, vercelRes);

                res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(responseData));

            } catch (err) {
                console.error('[TEST SERVER] Error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });

        // Porta 0 = atribuição automática
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            serverUrl = `http://127.0.0.1:${addr.port}`;
            console.log(`🧪 Test server listening at ${serverUrl}`);
            resolve(serverUrl);
        });
        server.on('error', reject);
    });
}

function stopTestServer() {
    return new Promise((resolve) => {
        if (server) server.close(resolve);
        else resolve();
    });
}

/**
 * Helper: faz uma requisição HTTP para o servidor de teste.
 * Retorna { status, body }.
 */
async function api(method, resource, queryParams = {}, body = undefined) {
    const params = new URLSearchParams({ resource, ...queryParams });
    const url = `${serverUrl}/api/admin-financial?${params}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-admin-password': ADMIN_PASSWORD,
        },
    };
    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();
    return { status: res.status, body: data };
}

// ── IDs únicos para isolar os dados de teste ──────────────────
const SUFFIX = randomUUID().slice(0, 8).toUpperCase();
const PREFIX = 'HTTP';

const TEST_DATA = {
    student: {
        name: `Test HTTP Aluno ${SUFFIX}`,
        email: `test.http.${SUFFIX.toLowerCase()}@email.com`,
        phone: '(21) 99999-7777',
        instruments: 'Violino',
        status: 'active',
    },
    teacher: {
        name: `Test HTTP Professor ${SUFFIX}`,
        phone: '(21) 99999-6666',
        specialty: 'Violino, Teoria',
        days_of_week: '{seg,ter,qua,qui,sex}',
        rate_per_class: 60.00,
        active: true,
    },
    enrollment: null, // will be filled after creation
    lesson: {
        date: new Date().toISOString().slice(0, 10),
        start_time: '10:00',
        duration_minutes: 60,
    },
    attendance: {
        status: 'present',
        late_minutes: 5,
        notes: 'HTTP E2E - presente com 5min atraso',
    },
};

// ── IDs que serão armazenados durante o teste ─────────────────
let createdStudentId = null;
let createdTeacherId = null;
let createdEnrollmentId = null;
let createdLessonId = null;
let createdAttendanceId = null;

// ══════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════

test('[SETUP] Iniciar servidor HTTP de teste', { skip: !hasEnv }, async () => {
    const url = await startTestServer();
    assert.ok(url.startsWith('http://'), `Servidor iniciou em ${url}`);
});

test('[SETUP] Criar professor de teste via API', { skip: !hasEnv }, async () => {
    // O handler da API não expõe CRUD de teachers via admin-financial.
    // Precisamos inserir o professor diretamente no Supabase para que
    // os próximos passos possam referenciá-lo.
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const teacherId = `TE-${PREFIX}-${SUFFIX}`;
    const { data, error } = await supabase
        .from('teachers')
        .insert({ id: teacherId, ...TEST_DATA.teacher })
        .select('id')
        .single();
    assert.equal(error, null, 'Professor inserido no banco');
    assert.equal(data.id, teacherId);
    createdTeacherId = teacherId;
});

// ══════════════════════════════════════════════════════════════
//  1. ALUNO
// ══════════════════════════════════════════════════════════════

test('1. POST /students — criar aluno via HTTP', { skip: !hasEnv }, async () => {
    const { status, body } = await api('POST', 'students', {}, TEST_DATA.student);

    assert.equal(status, 201, `Status 201: ${JSON.stringify(body)}`);
    assert.ok(body.student, 'Resposta contém student');
    assert.equal(body.student.name, TEST_DATA.student.name);
    assert.equal(body.student.status, 'active');
    assert.ok(body.student.id.startsWith('ST-'), `ID gerado: ${body.student.id}`);

    createdStudentId = body.student.id;
    console.log(`  → Aluno criado: ${createdStudentId}`);
});

test('2. GET /students — consultar aluno por ID via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdStudentId, 'studentId disponível');

    const { status, body } = await api('GET', 'students', { id: createdStudentId });

    assert.equal(status, 200);
    assert.ok(body.students, 'Resposta contém students array');
    assert.equal(body.students.length, 1, '1 aluno retornado');
    assert.equal(body.students[0].name, TEST_DATA.student.name);
    assert.equal(body.students[0].email, TEST_DATA.student.email);
    assert.equal(body.students[0].status, 'active');
});

test('3. PATCH /students — atualizar telefone via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdStudentId, 'studentId disponível');
    const newPhone = '(21) 98888-7777';

    const { status, body } = await api('PATCH', 'students', {}, {
        id: createdStudentId,
        phone: newPhone,
    });

    assert.equal(status, 200, `Status 200: ${JSON.stringify(body)}`);
    assert.equal(body.student.phone, newPhone);
});

// ══════════════════════════════════════════════════════════════
//  2. VÍNCULO (ENROLLMENT)
// ══════════════════════════════════════════════════════════════

test('4. POST /enrollments — criar vínculo via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdStudentId, 'studentId disponível');
    assert.ok(createdTeacherId, 'teacherId disponível');

    const payload = {
        student_id: createdStudentId,
        teacher_id: createdTeacherId,
        instrument: 'Violino',
        day_of_week: 'qua',
        class_time: '10:00',
        duration_minutes: 60,
        classes_per_week: 1,
        monthly_fee: 350.00,
        billing_type: 'monthly',
        status: 'active',
    };

    const { status, body } = await api('POST', 'enrollments', {}, payload);

    assert.equal(status, 201, `Status 201: ${JSON.stringify(body)}`);
    assert.ok(body.enrollment, 'Resposta contém enrollment');
    assert.equal(body.enrollment.student_id, createdStudentId);
    assert.equal(body.enrollment.monthly_fee, 350);
    assert.equal(body.enrollment.status, 'active');
    assert.ok(body.enrollment.id.startsWith('EN-'), `ID gerado: ${body.enrollment.id}`);

    createdEnrollmentId = body.enrollment.id;
    console.log(`  → Vínculo criado: ${createdEnrollmentId}`);
});

test('5. GET /enrollments — consultar vínculo por student_id via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdStudentId, 'studentId disponível');

    const { status, body } = await api('GET', 'enrollments', { student_id: createdStudentId });

    assert.equal(status, 200);
    assert.ok(body.enrollments, 'Resposta contém enrollments');
    assert.ok(body.enrollments.length >= 1, 'Pelo menos 1 vínculo');
    const enrollment = body.enrollments.find(e => e.id === createdEnrollmentId);
    assert.ok(enrollment, 'Vínculo encontrado na lista');
    assert.equal(enrollment.students?.name, TEST_DATA.student.name);
});

// ══════════════════════════════════════════════════════════════
//  3. AULA (LESSON)
// ══════════════════════════════════════════════════════════════

test('6. POST /lessons — criar aula via HTTP (com enrollment_id)', { skip: !hasEnv }, async () => {
    assert.ok(createdEnrollmentId, 'enrollmentId disponível');

    const payload = {
        enrollment_id: createdEnrollmentId,
        date: TEST_DATA.lesson.date,
        start_time: TEST_DATA.lesson.start_time,
        duration_minutes: TEST_DATA.lesson.duration_minutes,
    };

    const { status, body } = await api('POST', 'lessons', {}, payload);

    assert.equal(status, 201, `Status 201: ${JSON.stringify(body)}`);
    assert.ok(body.lesson, 'Resposta contém lesson');
    assert.equal(body.lesson.student_id, createdStudentId);
    assert.equal(body.lesson.teacher_id, createdTeacherId);
    assert.equal(body.lesson.status, 'scheduled');
    assert.equal(body.lesson.enrollment_id, createdEnrollmentId);
    assert.ok(body.lesson.id.startsWith('LS-'), `ID gerado: ${body.lesson.id}`);

    createdLessonId = body.lesson.id;
    console.log(`  → Aula criada: ${createdLessonId}`);
});

test('7. GET /lessons — consultar aula por ID via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdLessonId, 'lessonId disponível');

    const { status, body } = await api('GET', 'lessons', { id: createdLessonId });

    assert.equal(status, 200);
    assert.ok(body.lessons, 'Resposta contém lessons');
    assert.equal(body.lessons[0]?.id, createdLessonId);
    assert.equal(body.lessons[0]?.students?.name, TEST_DATA.student.name);
});

test('8. PATCH /lessons — completar aula via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdLessonId, 'lessonId disponível');

    const { status, body } = await api('PATCH', 'lessons', {}, {
        id: createdLessonId,
        status: 'completed',
    });

    assert.equal(status, 200, `Status 200: ${JSON.stringify(body)}`);
    assert.equal(body.lesson.status, 'completed');
});

// ══════════════════════════════════════════════════════════════
//  4. PRESENÇA (ATTENDANCE)
// ══════════════════════════════════════════════════════════════

test('9. POST /attendance — marcar presença via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdLessonId, 'lessonId disponível');
    assert.ok(createdStudentId, 'studentId disponível');

    const payload = {
        lesson_id: createdLessonId,
        student_id: createdStudentId,
        status: TEST_DATA.attendance.status,
        late_minutes: TEST_DATA.attendance.late_minutes,
        notes: TEST_DATA.attendance.notes,
    };

    const { status, body } = await api('POST', 'attendance', {}, payload);

    assert.equal(status, 201, `Status 201: ${JSON.stringify(body)}`);
    assert.ok(body.attendance, 'Resposta contém attendance');
    assert.equal(body.attendance.lesson_id, createdLessonId);
    assert.equal(body.attendance.student_id, createdStudentId);
    assert.equal(body.attendance.status, 'present');
    assert.equal(body.attendance.late_minutes, 5);
    assert.ok(body.attendance.id.startsWith('AT-'), `ID gerado: ${body.attendance.id}`);

    createdAttendanceId = body.attendance.id;
    console.log(`  → Presença registrada: ${createdAttendanceId}`);
});

test('10. GET /attendance — consultar presença por lesson_id via HTTP', { skip: !hasEnv }, async () => {
    assert.ok(createdLessonId, 'lessonId disponível');

    const { status, body } = await api('GET', 'attendance', { lesson_id: createdLessonId });

    assert.equal(status, 200);
    assert.ok(body.attendance, 'Resposta contém attendance');
    assert.ok(body.attendance.length >= 1, 'Pelo menos 1 registro');
    const record = body.attendance.find(a => a.id === createdAttendanceId);
    assert.ok(record, 'Registro de presença encontrado');
    assert.equal(record.status, 'present');
});

// ══════════════════════════════════════════════════════════════
//  5. VALIDAÇÕES DE ERRO
// ══════════════════════════════════════════════════════════════

test('11. POST /students — rejeita aluno sem nome (400)', { skip: !hasEnv }, async () => {
    const { status, body } = await api('POST', 'students', {}, { status: 'active' });
    assert.equal(status, 400);
    assert.ok(body.error, 'Resposta contém error');
    assert.ok(body.error.includes('Nome'), `Erro menciona "Nome": ${body.error}`);
});

test('12. POST /lessons — rejeita aula sem date (400)', { skip: !hasEnv }, async () => {
    const { status, body } = await api('POST', 'lessons', {}, {
        enrollment_id: createdEnrollmentId || 'NONE',
    });
    assert.equal(status, 400);
    assert.ok(body.error.includes('date'), `Erro menciona "date": ${body.error}`);
});

test('13. GET /students — rejeita sem senha (401)', { skip: !hasEnv }, async () => {
    // Faz a requisição SEM o header x-admin-password
    const params = new URLSearchParams({ resource: 'students' });
    const url = `${serverUrl}/api/admin-financial?${params}`;
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    assert.equal(res.status, 401, 'Sem senha deve retornar 401');
    const body = await res.json();
    assert.ok(body.error, 'Resposta contém mensagem de erro');
});

// ══════════════════════════════════════════════════════════════
//  6. CLEANUP (via API DELETE)
// ══════════════════════════════════════════════════════════════

test('[CLEANUP] Remover dados de teste via API DELETE', { skip: !hasEnv }, async () => {
    const results = [];

    if (createdAttendanceId) {
        const { status, body } = await api('DELETE', 'attendance', { id: createdAttendanceId });
        results.push(`attendance: ${status} ${body.success ? 'OK' : body.error || '❌'}`);
    }

    if (createdLessonId) {
        const { status, body } = await api('DELETE', 'lessons', { id: createdLessonId });
        results.push(`lesson: ${status} ${body.success ? 'OK' : body.error || '❌'}`);
    }

    if (createdEnrollmentId) {
        const { status, body } = await api('DELETE', 'enrollments', {
            id: createdEnrollmentId,
            cancel_tuitions: 'true',
        });
        results.push(`enrollment: ${status} ${body.success ? 'OK' : body.error || '❌'}`);
    }

    if (createdStudentId) {
        const { status, body } = await api('DELETE', 'students', { id: createdStudentId });
        results.push(`student: ${status} ${body.success ? 'OK' : body.error || '❌'}`);
    }

    // Remove teacher diretamente do banco (não exposto via API)
    if (createdTeacherId) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        const { error } = await supabase.from('teachers').delete().eq('id', createdTeacherId);
        results.push(`teacher: ${error ? error.message : 'OK'}`);
    }

    console.log('🧹 Cleanup via HTTP:', results.join(' | '));
});

// ══════════════════════════════════════════════════════════════
//  7. TEARDOWN
// ══════════════════════════════════════════════════════════════

test('[TEARDOWN] Parar servidor HTTP', { skip: !hasEnv }, async () => {
    await stopTestServer();
    console.log('🛑 Servidor de teste parado.');
});
