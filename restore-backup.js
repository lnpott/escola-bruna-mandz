/**
 * restore-backup.js
 * 🔄 Restaura um backup completo do Supabase para a Escola de Música Bruna Mandz.
 *
 * Uso:
 *   node restore-backup.js                     # restaura backup_dados.json
 *   node restore-backup.js caminho/arquivo.json # restaura arquivo específico
 *   node restore-backup.js arquivo.json.gz      # restaura de .gz
 *   node restore-backup.js --dry-run            # apenas simula, não insere
 *   node restore-backup.js --force              # pula confirmação
 *
 * ⚠️ ATENÇÃO: Isso irá SUBSTITUIR todos os dados das tabelas.
 * Faça um backup atual antes de restaurar!
 *
 * Requer variáveis de ambiente:
 *   SUPABASE_URL              → URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY → Service Role Key
 */

import fs from 'fs';
import zlib from 'zlib';
import { createInterface } from 'readline';

// ── Configuração ──────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env');
    process.exit(1);
}

// Ordem reversa de FK: filhos (que referenciam) primeiro, pais depois
// Isso evita violações de chave estrangeira ao inserir
const TABELAS_ORDER = [
    'attendance',        // referencia lessons, students
    'lessons',           // referencia enrollments, students, teachers
    'teacher_payments',  // referencia teachers
    'teacher_payments_teacher_id_fkey',
    'tuitions',          // referencia students, enrollments
    'payments',          // referencia students
    'expenses',          // folha
    'investments',       // folha
    'enrollments',       // referencia students, teachers
    'teachers',          // referenciado por enrollments, lessons, teacher_payments
    'students',          // referenciado por enrollments, tuitions, payments, lessons, attendance
    'orders',            // folha (loja)
    'products',          // folha (loja)
];

// Estratégia: limpa tabelas filhos antes dos pais (cascade), insere pais primeiro
// Ordem de DELETE (filhos primeiro):
const TABELAS_DELETE_ORDER = [
    'attendance',
    'lessons',
    'teacher_payments',
    'tuitions',
    'payments',
    'expenses',
    'investments',
    'enrollments',
    'orders',
    'products',
    'teachers',
    'students',
];

// Ordem de INSERT (pais primeiro — igual ao backup):
const TABELAS_INSERT_ORDER = [
    'students',
    'teachers',
    'enrollments',
    'tuitions',
    'payments',
    'expenses',
    'investments',
    'teacher_payments',
    'lessons',
    'attendance',
    'products',
    'orders',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');

function getBackupPath() {
    const fileArg = args.find(a => !a.startsWith('--'));
    return fileArg || './backup_dados.json';
}

async function readBackup(path) {
    let raw;

    if (path.endsWith('.gz')) {
        const compressed = fs.readFileSync(path);
        raw = zlib.gunzipSync(compressed).toString('utf-8');
        console.log(`📖 Lido: ${path} (comprimido, ${(compressed.length / 1024 / 1024).toFixed(2)} MB)`);
    } else {
        raw = fs.readFileSync(path, 'utf-8');
        console.log(`📖 Lido: ${path} (${(Buffer.byteLength(raw, 'utf-8') / 1024 / 1024).toFixed(2)} MB)`);
    }

    const backup = JSON.parse(raw);

    // Valida estrutura mínima
    if (!backup._meta || !backup._meta.version) {
        throw new Error('Backup inválido: _meta.version não encontrado. Este arquivo não é um backup compatível.');
    }

    const tablesFound = TABELAS_INSERT_ORDER.filter(t => Array.isArray(backup[t]));
    console.log(`📊 Backup v${backup._meta.version} — ${backup._meta.date || 'data desconhecida'}`);
    console.log(`   ${tablesFound.length}/${TABELAS_INSERT_ORDER.length} tabelas encontradas`);
    console.log(`   Total: ${backup._meta.summary?.total_records || '?'} registros`);

    if (backup._meta.errors?.length > 0) {
        console.log(`   ⚠️  Backup original teve ${backup._meta.errors.length} erro(s)`);
        for (const err of backup._meta.errors) {
            console.log(`       • ${err.table || err.bucket}: ${err.error}`);
        }
    }

    return backup;
}

async function confirmRestore(backup) {
    if (FORCE) return true;

    const tablesWithData = TABELAS_INSERT_ORDER.filter(t => (backup[t]?.length || 0) > 0);
    const total = tablesWithData.reduce((acc, t) => acc + backup[t].length, 0);

    console.log('\n⚠️  ╔════════════════════════════════════════════════════╗');
    console.log('⚠️  ║         ATENÇÃO — RESTAURAÇÃO DE DADOS           ║');
    console.log('⚠️  ╚════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`   Backup:  ${backup._meta.date || 'desconhecido'}`);
    console.log(`   Tabelas: ${tablesWithData.length}/${TABELAS_INSERT_ORDER.length}`);
    console.log(`   Registros: ~${total}`);
    console.log('');
    console.log('   Isso irá SUBSTITUIR todos os dados atuais no banco!');
    if (backup.storage && Object.values(backup.storage).some(f => f.length > 0)) {
        console.log('');
        console.log('   📦 Storage: Os arquivos de imagem NÃO serão restaurados');
        console.log('      automaticamente. Refaça o upload manualmente ou use');
        console.log('      o painel Supabase > Storage > product-images.');
    }
    console.log('');

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question('Digite "RESTAURAR" para confirmar: ', (answer) => {
            rl.close();
            resolve(answer.trim() === 'RESTAURAR');
        });
    });
}

async function clearTable(tabela) {
    const url = `${SUPABASE_URL}/rest/v1/${tabela}?limit=0`; // apenas valida
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`DELETE ${tabela}: HTTP ${res.status} — ${text.slice(0, 100)}`);
    }

    return true;
}

async function deleteAllFromTable(tabela) {
    // DELETE via REST API com supabase-filter para remover todos os registros
    // NOTA: Isso requer que RLS esteja desabilitado ou que a Service Role Key bypass
    const url = `${SUPABASE_URL}/rest/v1/${tabela}?id=neq._______`; // hack: condição que SEMPRE é true
    // Na verdade, o Supabase REST API exige um filtro para DELETE por segurança
    // Usamos uma condição sempre verdadeira: id=neq.<um-valor-que-nunca-existe>
    // Mas isso é frágil. Melhor usar um filtro que sempre pega tudo.
    // Supabase aceita: `?id=gt.0` para IDs numéricos, ou `?name=neq.` 
    // Para textos: `?id=is.` (IS NULL) não pega tudo.
    // A abordagem correta é usar `Prefer: resolution=merge-duplicates` + DELETE com match {}?
    // Na verdade, o Supabase REST API tem uma limitação: DELETE exige filtro.
    // Solução: USAR DELETE COM TODOS OS VALORES POSSÍVEIS.
    // Ou melhor: usar a abordagem de deletar via fetch com cada ID.

    // Estratégia: buscar todos os IDs e deletar um por um
    // Para datasets grandes, isso pode ser lento. Alternativa: raw SQL.
    // Para este script de restore, vamos usar uma abordagem mais robusta:

    // Opção A: DELETE via filtro com Prefer: count=exact
    // Supabase permite: DELETE /rest/v1/tabela?id=in.(id1,id2,id3) com header Prefer: resolution=ignore-duplicates

    // Opção mais segura: buscar IDs primeiro, depois deletar em batch
    const listUrl = `${SUPABASE_URL}/rest/v1/${tabela}?select=id`;
    const listRes = await fetch(listUrl, {
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
    });

    if (!listRes.ok) {
        if (listRes.status === 404) return { deleted: 0, error: `Tabela ${tabela} não existe` };
        throw new Error(`List ${tabela}: HTTP ${listRes.status}`);
    }

    const rows = await listRes.json();
    if (rows.length === 0) return { deleted: 0 };

    // Deleta em batch de 100 (via filtro IN)
    let totalDeleted = 0;
    for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100).map(r => r.id);
        const ids = batch.join(',');
        const delUrl = `${SUPABASE_URL}/rest/v1/${tabela}?id=in.(${ids})`;
        const delRes = await fetch(delUrl, {
            method: 'DELETE',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                Prefer: 'return=minimal',
            },
        });

        if (!delRes.ok) {
            const text = await delRes.text().catch(() => '');
            throw new Error(`DELETE ${tabela} batch: HTTP ${delRes.status} — ${text.slice(0, 100)}`);
        }

        // O Supabase REST API retorna 200 com body contendo as linhas deletadas
        // ou 204 se return=minimal
        totalDeleted += batch.length;
    }

    return { deleted: totalDeleted };
}

async function insertRows(tabela, rows) {
    if (rows.length === 0) return { inserted: 0 };

    // Insere em batch de 500 (limite seguro do Supabase REST API)
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const url = `${SUPABASE_URL}/rest/v1/${tabela}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal, resolution=merge-duplicates',
            },
            body: JSON.stringify(batch),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`INSERT ${tabela}: HTTP ${res.status} — ${text.slice(0, 200)}`);
        }

        inserted += batch.length;
    }

    return { inserted };
}

// ── Restore principal ─────────────────────────────────────────────────────────

async function fazerRestore() {
    const path = getBackupPath();

    if (!fs.existsSync(path)) {
        console.error(`❌ Arquivo não encontrado: ${path}`);
        console.error('   Use: node restore-backup.js <caminho/para/backup_dados.json>');
        process.exit(1);
    }

    // 1. Ler backup
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     🔄 RESTAURAÇÃO DE BACKUP — ESCOLA BRUNA MANDZ          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`🔧 Modo: ${DRY_RUN ? '🧪 DRY RUN (simulação)' : '🚀 REAL (irá modificar dados)'}`);

    let backup;
    try {
        backup = await readBackup(path);
    } catch (err) {
        console.error(`❌ Erro ao ler backup: ${err.message}`);
        process.exit(1);
    }

    // 2. Confirmação
    if (DRY_RUN) {
        console.log('\n🧪 DRY RUN — Nenhum dado foi modificado.');
        return;
    }

    const confirmed = await confirmRestore(backup);
    if (!confirmed) {
        console.log('\n⏹️  Restauração cancelada pelo usuário. Nenhum dado foi modificado.');
        return;
    }

    // 3. Limpar dados existentes (ordem reversa de FK)
    console.log('\n─── 🗑️  LIMPANDO DADOS EXISTENTES ─────────────────────────────');
    const deleteStats = {};
    for (const tabela of TABELAS_DELETE_ORDER) {
        const rows = backup[tabela];
        if (!Array.isArray(rows) || rows.length === 0) {
            deleteStats[tabela] = { skipped: true };
            continue;
        }

        process.stdout.write(`🗑️  ${tabela.padEnd(20)}… `);
        try {
            const result = await deleteAllFromTable(tabela);
            deleteStats[tabela] = result;
            console.log(`🧹 ${result.deleted} registro(s) removido(s)`);
        } catch (err) {
            console.log(`❌ ${err.message}`);
            console.log(`   ⚠️  Continuando mesmo assim...`);
            deleteStats[tabela] = { error: err.message };
        }
    }

    // 4. Inserir dados do backup (ordem correta de FK)
    console.log('\n─── 📥 RESTAURANDO DADOS ──────────────────────────────────────');
    const insertStats = {};
    let totalInserted = 0;

    for (const tabela of TABELAS_INSERT_ORDER) {
        const rows = backup[tabela];
        if (!Array.isArray(rows) || rows.length === 0) {
            insertStats[tabela] = { skipped: true };
            continue;
        }

        process.stdout.write(`📥 ${tabela.padEnd(20)}… `);
        try {
            const result = await insertRows(tabela, rows);
            insertStats[tabela] = result;
            totalInserted += result.inserted;
            console.log(`✅ ${result.inserted} registro(s) inserido(s)`);
        } catch (err) {
            console.log(`❌ ${err.message}`);
            insertStats[tabela] = { error: err.message };
        }
    }

    // 5. Resumo final
    console.log('\n─── 📊 RESUMO ───────────────────────────────────────────────────');
    let successCount = 0;
    let failCount = 0;

    for (const tabela of TABELAS_INSERT_ORDER) {
        const stat = insertStats[tabela];
        if (!stat) continue;
        if (stat.error) {
            console.log(`   ❌ ${tabela}: ${stat.error}`);
            failCount++;
        } else if (stat.skipped) {
            // skip (tabela vazia)
        } else {
            console.log(`   ✅ ${tabela}: ${stat.inserted} registro(s)`);
            successCount++;
        }
    }

    console.log(`\n📦 ${totalInserted} registros restaurados em ${successCount} tabelas`);
    if (failCount > 0) {
        console.log(`⚠️  ${failCount} tabela(s) com erro(s)`);
        console.log('   Verifique os logs acima e execute novamente se necessário.');
        process.exitCode = 1;
    } else {
        console.log('🎉 Restauração concluída com sucesso!');
    }

    // Nota sobre Storage
    const storageFiles = Object.values(backup.storage || {}).reduce((acc, f) => acc + f.length, 0);
    if (storageFiles > 0) {
        console.log(`\n📦 IMPORTANTE: O backup contém ${storageFiles} arquivo(s) de imagem.`);
        console.log('   Eles NÃO foram restaurados automaticamente. Para restaurar:');
        console.log('   1. Acesse o painel Supabase > Storage > product-images');
        console.log('   2. Faça upload manual das imagens');
        console.log('   3. Ou use o painel Admin > Storage Manager para gerenciar');
    }
}

fazerRestore();
