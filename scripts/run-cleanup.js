/**
 * scripts/run-cleanup.js
 * Limpa o banco Supabase para uso — mantém 1 aluno, 1 professor, 1 vínculo.
 * Store (products, orders) permanece INTOCADA.
 *
 * Uso: node scripts/run-cleanup.js [--force|--yes|-f]
 * Requer .env com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Carregar .env ────────────────────────────────────────────
function loadEnv() {
    const envPath = join(__dirname, '..', '.env');
    if (!existsSync(envPath)) {
        console.error('.env nao encontrado em:', envPath);
        process.exit(1);
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
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const FORCE = process.argv.includes('--force') || process.argv.includes('--yes') || process.argv.includes('-f');

// ── Confirmação ──────────────────────────────────────────────
function askConfirm() {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question('\nDigite "LIMPAR" para confirmar: ', (answer) => {
            rl.close();
            resolve(answer.trim() === 'LIMPAR');
        });
    });
}

// ── Delete helpers ────────────────────────────────────────────
async function deleteAll(table) {
    const { error, count } = await supabase
        .from(table).delete({ count: 'exact' }).neq('id', '');
    if (error) throw error;
    return count ?? 0;
}

async function deleteWhereNot(table, column, value) {
    const { error, count } = await supabase
        .from(table).delete({ count: 'exact' }).neq(column, value);
    if (error) throw error;
    return count ?? 0;
}

// ════════════════════════════════════════════════════════════════
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        LIMPEZA DO BANCO — ESCOLA BRUNA MANDZ               ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

if (!FORCE) {
    const ok = await askConfirm();
    if (!ok) { console.log('Cancelado.'); process.exit(0); }
} else {
    console.log('Modo --force: pulando confirmacao');
}

console.log();

// ── Fase 1: DELETE (FK-safe) ────────────────────────────────
const ORDEM_DELETE = [
    'attendance', 'lessons', 'teacher_payments',
    'tuitions', 'payments', 'expenses', 'investments', 'enrollments',
];

for (const table of ORDEM_DELETE) {
    try {
        const n = await deleteAll(table);
        console.log('  ' + table.padEnd(20) + String(n).padStart(4) + ' registro(s) removido(s)');
    } catch (e) {
        console.log('  ' + table.padEnd(20) + 'ERRO: ' + e.message.slice(0, 80));
    }
}

// Students (exceto ST-ABCDEF)
try {
    const n = await deleteWhereNot('students', 'id', 'ST-ABCDEF');
    console.log('  students'.padEnd(20) + String(n).padStart(4) + ' removido(s) (exceto ST-ABCDEF)');
} catch (e) {
    console.log('  students'.padEnd(20) + 'ERRO: ' + e.message.slice(0, 80));
}

// Teachers (exceto TE-A7B2C3)
try {
    const n = await deleteWhereNot('teachers', 'id', 'TE-A7B2C3');
    console.log('  teachers'.padEnd(20) + String(n).padStart(4) + ' removido(s) (exceto TE-A7B2C3)');
} catch (e) {
    console.log('  teachers'.padEnd(20) + 'ERRO: ' + e.message.slice(0, 80));
}

// ── Fase 2: Recriar dados mínimos ────────────────────────────
console.log('\nRecriando dados minimos...');

// Sofia
const { data: sofia } = await supabase
    .from('students').select('id').eq('id', 'ST-ABCDEF').maybeSingle();
if (!sofia) {
    await supabase.from('students').insert({
        id: 'ST-ABCDEF', name: 'Sofia Almeida',
        email: 'sofia.almeida@email.com', phone: '(21) 97001-0001',
        instruments: 'Piano', status: 'active',
    });
    console.log('  Aluno Sofia Almeida criado');
} else {
    console.log('  Aluno Sofia Almeida ja existe');
}

// Bruna
const { data: bruna } = await supabase
    .from('teachers').select('id').eq('id', 'TE-A7B2C3').maybeSingle();
if (!bruna) {
    await supabase.from('teachers').insert({
        id: 'TE-A7B2C3', name: 'Bruna Mandz',
        phone: '(21) 99999-0001', specialty: 'Piano, Canto',
        days_of_week: '{seg,ter,qua,qui,sex}', rate_per_class: 0, active: true,
    });
    console.log('  Professor Bruna Mandz criado');
} else {
    console.log('  Professor Bruna Mandz ja existe');
}

// Enrollment
const { error: enrErr } = await supabase.from('enrollments').upsert({
    id: 'EN-ABCDEF', student_id: 'ST-ABCDEF', teacher_id: 'TE-A7B2C3',
    instrument: 'Piano', day_of_week: 'seg', class_time: '14:00',
    duration_minutes: 60, classes_per_week: 1, monthly_fee: 300.00,
    billing_type: 'monthly', status: 'active',
});
console.log(enrErr ? '  Vinculo ERRO: ' + enrErr.message : '  Vinculo Sofia + Bruna criado/atualizado');

// Tuition
const refMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const dueDate = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

const { error: tuErr } = await supabase.from('tuitions').upsert({
    id: 'TU-AAAAAA', student_id: 'ST-ABCDEF', enrollment_id: 'EN-ABCDEF',
    reference_month: refMonth, amount: 300.00, discount_amount: 0,
    due_date: dueDate, status: 'paid', paid_at: new Date().toISOString(),
    payment_method: 'pix',
});
console.log(tuErr ? '  Mensalidade ERRO: ' + tuErr.message : '  Mensalidade criada/atualizada (paga)');

// ── Fase 3: Verificação ─────────────────────────────────────
console.log('\nVerificacao final:\n');

const TABELAS = ['students','teachers','enrollments','tuitions','lessons',
    'attendance','payments','expenses','investments','teacher_payments',
    'products','orders'];

for (const t of TABELAS) {
    const { count, error } = await supabase
        .from(t).select('*', { count: 'exact', head: true });
    const ic = (t === 'products' || t === 'orders') ? '  (loja)' :
               count === 0 ? '        ' : '  (ok)  ';
    console.log('  ' + t.padEnd(20) + String(count ?? '?').padStart(4) + ic + (error ? ' ERRO' : ''));
}

console.log('\nFinalizado!');
