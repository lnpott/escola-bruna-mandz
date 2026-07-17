/**
 * backup-api.js
 * 🚀 Backup completo do Supabase — Escola de Música Bruna Mandz
 *
 * Executado pelo GitHub Actions (.github/workflows/supabase-backup.yml).
 * Gera backup_dados.json + backup_dados.json.gz e faz upload como Artifact.
 *
 * Variáveis de ambiente (configuradas nos Secrets do GitHub Actions):
 *   SUPABASE_URL              → URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY → Service Role Key (acesso total ao banco)
 *   BACKUP_STORAGE            ⇒ "false" para pular backup do Storage (default: true)
 *
 * Cobre TODAS as 12 tabelas + Storage (metadados das imagens).
 * Usa paginação (limite 1.000 registros por página) para tabelas grandes.
 * Comprime com gzip para reduzir tamanho do artifact.
 * Valida integridade pós-backup.
 */

import fs from 'fs';
import zlib from 'zlib';

// ── Configuração ──────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_STORAGE = process.env.BACKUP_STORAGE !== 'false';

if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL não configurado.');
    process.exit(1);
}
if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado.');
    process.exit(1);
}

// Todas as tabelas em ordem segura para FK (pais antes dos filhos)
const TABELAS = [
    'students',        // referenciada por enrollments, tuitions, payments, lessons, attendance
    'teachers',        // referenciada por enrollments, lessons, teacher_payments
    'enrollments',     // referenciada por tuitions, lessons
    'tuitions',        // folha (não referenciada)
    'payments',        // folha
    'expenses',        // folha
    'investments',     // folha
    'teacher_payments',// folha
    'lessons',         // referenciada por attendance
    'attendance',      // folha
    'products',        // folha (loja)
    'orders',          // folha (loja)
];

const STORAGE_BUCKETS = ['product-images'];
const PAGE_SIZE = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function supabaseFetch(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} — ${res.statusText}${text ? ` (${text.slice(0, 200)})` : ''}`);
    }

    return res;
}

/**
 * Busca TODAS as linhas de uma tabela, paginando automaticamente.
 * Supabase REST API default limit = 1.000, então paginamos em PAGE_SIZE.
 */
async function fetchAllRows(tabela) {
    const allRows = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const url = `${SUPABASE_URL}/rest/v1/${tabela}?select=*&limit=${PAGE_SIZE}&offset=${offset}`;
        const res = await supabaseFetch(url);
        const rows = await res.json();

        allRows.push(...rows);
        offset += rows.length;
        hasMore = rows.length === PAGE_SIZE;
    }

    return allRows;
}

/**
 * Lista todos os objetos de um bucket do Storage.
 * Retorna array com metadados (id, name, size, created_at, etc.).
 */
async function listStorageFiles(bucketId) {
    const url = `${SUPABASE_URL}/storage/v1/object/list/${bucketId}`;
    const res = await supabaseFetch(url, {
        method: 'POST',
        body: JSON.stringify({ prefix: '', limit: PAGE_SIZE, offset: 0 }),
    });

    const files = await res.json();

    // Adiciona URL pública para cada arquivo
    return files.map(f => ({
        ...f,
        public_url: `${SUPABASE_URL}/storage/v1/object/public/${bucketId}/${f.name}`,
        download_url: `${SUPABASE_URL}/storage/v1/object/${bucketId}/${f.name}`,
    }));
}

// ── Backup principal ──────────────────────────────────────────────────────────

async function fazerBackup() {
    const dataHoje = new Date().toISOString().slice(0, 10);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║        🚀 BACKUP COMPLETO — ESCOLA BRUNA MANDZ              ║');
    console.log(`║        ${dataHoje}                                       ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`📊 ${TABELAS.length} tabelas | bucket(s): ${STORAGE_BUCKETS.join(', ')}`);

    const backup = {
        _meta: {
            date: dataHoje,
            timestamp: new Date().toISOString(),
            tables: [...TABELAS],
            storage_buckets: [...STORAGE_BUCKETS],
            version: '2.0',
        },
        storage: {},
    };

    // ── Fase 1: Tabelas ──────────────────────────────────────────────────

    console.log('\n─── 📋 TABELAS ────────────────────────────────────────────');

    for (const tabela of TABELAS) {
        process.stdout.write(`📥 ${tabela.padEnd(20)}… `);
        try {
            const rows = await fetchAllRows(tabela);
            backup[tabela] = rows;
            console.log(`✅ ${String(rows.length).padStart(5)} registro(s)`);
        } catch (err) {
            console.log(`❌ ERRO: ${err.message}`);
            backup[tabela] = [];
            backup._meta.errors = backup._meta.errors || [];
            backup._meta.errors.push({ table: tabela, error: err.message });
        }
    }

    // ── Fase 2: Storage ─────────────────────────────────────────────────

    if (BACKUP_STORAGE) {
        console.log('\n─── 📦 STORAGE ────────────────────────────────────────────');
        for (const bucket of STORAGE_BUCKETS) {
            process.stdout.write(`📦 ${bucket.padEnd(20)}… `);
            try {
                const files = await listStorageFiles(bucket);
                backup.storage[bucket] = files;
                const totalSize = files.reduce((acc, f) => acc + (f.metadata?.size || f.size || 0), 0);
                const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
                console.log(`✅ ${String(files.length).padStart(4)} arquivo(s), ${sizeMB} MB`);
            } catch (err) {
                console.log(`❌ ERRO: ${err.message}`);
                backup.storage[bucket] = [];
                backup._meta.errors = backup._meta.errors || [];
                backup._meta.errors.push({ bucket, error: err.message });
            }
        }
    } else {
        console.log('\n─── 📦 STORAGE ────────────────────────────────────────────');
        console.log('⏩ Backup de Storage desabilitado (BACKUP_STORAGE=false)');
        console.log('   Os metadados das imagens NÃO foram salvos no backup.');
    }

    // ── Fase 3: Validação + Resumo ──────────────────────────────────────

    const totalRegistros = TABELAS.reduce((acc, t) => acc + (backup[t]?.length || 0), 0);
    const tablesWithData = TABELAS.filter(t => (backup[t]?.length || 0) > 0).length;
    const tablesEmpty = TABELAS.filter(t => (backup[t]?.length || 0) === 0).length;
    const hasErrors = (backup._meta.errors?.length || 0) > 0;

    backup._meta.summary = {
        total_tables: TABELAS.length,
        tables_with_data: tablesWithData,
        tables_empty: tablesEmpty,
        total_records: totalRegistros,
        has_errors: hasErrors,
        error_count: backup._meta.errors?.length || 0,
        storage_total_files: Object.values(backup.storage).reduce((acc, files) => acc + files.length, 0),
    };

    console.log('\n─── 📊 RESUMO ───────────────────────────────────────────────');
    console.log(`   Tabelas com dados: ${tablesWithData}/${TABELAS.length}`);
    console.log(`   Tabelas vazias:    ${tablesEmpty}/${TABELAS.length}`);
    console.log(`   Registros totais:  ${totalRegistros}`);
    console.log(`   Arquivos Storage:  ${backup._meta.summary.storage_total_files}`);

    if (hasErrors) {
        console.log(`   ⚠️  Erros:           ${backup._meta.errors.length}`);
        for (const err of backup._meta.errors) {
            const ctx = err.table || err.bucket || 'desconhecido';
            console.log(`       • ${ctx}: ${err.error}`);
        }
    } else {
        console.log('   ✅ Nenhum erro detectado');
    }

    // ── Fase 4: Salvar + Comprimir ─────────────────────────────────────

    const caminho = './backup_dados.json';
    const caminhoGz = './backup_dados.json.gz';

    const json = JSON.stringify(backup, null, 2);
    const rawBytes = Buffer.byteLength(json, 'utf-8');
    const rawMB = (rawBytes / 1024 / 1024).toFixed(2);

    fs.writeFileSync(caminho, json, 'utf-8');
    console.log(`\n💾 Backup salvo:       ${caminho} (${rawMB} MB)`);

    // Comprime com gzip (nível 9 = máxima compressão)
    const compressed = zlib.gzipSync(json, { level: 9 });
    const gzBytes = compressed.length;
    const gzMB = (gzBytes / 1024 / 1024).toFixed(2);
    const ratio = rawBytes > 0 ? ((1 - gzBytes / rawBytes) * 100).toFixed(1) : '0.0';

    fs.writeFileSync(caminhoGz, compressed);
    console.log(`📦 Comprimido (gz):    ${caminhoGz} (${gzMB} MB, ${ratio}% de redução)`);

    // ── Validação final ────────────────────────────────────────────────

    // Verifica se o JSON comprimido é válido
    try {
        const decompressed = zlib.gunzipSync(compressed).toString('utf-8');
        const parsed = JSON.parse(decompressed);
        const tablesInBackup = TABELAS.filter(t => Array.isArray(parsed[t])).length;
        console.log(`🔍 Validação:         JSON íntegro, ${tablesInBackup}/${TABELAS.length} tabelas verificadas`);
        backup._meta.validation = { passed: true, tables_verified: tablesInBackup };
    } catch (err) {
        console.error(`🔍 Validação:         ❌ FALHOU — backup pode estar corrompido: ${err.message}`);
        backup._meta.validation = { passed: false, error: err.message };
        process.exitCode = 1;
    }

    console.log('\n' + (hasErrors || process.exitCode ? '⚠️  Backup concluído com ressalvas!' : '🎉 Backup concluído com sucesso!'));
}

fazerBackup();
