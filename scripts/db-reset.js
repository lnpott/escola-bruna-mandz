#!/usr/bin/env node

/**
 * scripts/db-reset.js
 *
 * Executa o reset completo do banco de desenvolvimento via Supabase Management API.
 * Lê os arquivos SQL na ordem correta e envia tudo em uma requisição.
 *
 * Uso:
 *   npm run db:reset
 *
 * Pré-requisito: SUPABASE_ACCESS_TOKEN no .env
 *   - Gere em: https://app.supabase.com/account/tokens
 *   - Adicione ao .env: SUPABASE_ACCESS_TOKEN=seu_token_aqui
 *
 * O script também lê SUPABASE_URL do .env para extrair o project ref.
 *
 * Ordem de execução:
 *   1. supabase/schema.sql          (tabelas da loja + função set_updated_at)
 *   2. supabase/financial-schema.sql (tabelas acadêmicas + financeiras)
 *   3. supabase/reset-dev.sql       (limpa dados + migrations + seed)
 *   4. supabase/seed-products.sql   (produtos da loja)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Carrega .env manualmente (sem dotenv) ──────────────────────────────
function loadEnv() {
    const envPath = resolve(ROOT, '.env');
    if (!existsSync(envPath)) {
        console.error('❌ Arquivo .env não encontrado em', envPath);
        console.error('   Crie um arquivo .env com SUPABASE_URL e SUPABASE_ACCESS_TOKEN');
        process.exit(1);
    }

    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
    }
}

// ── Extrai o project ref da SUPABASE_URL ───────────────────────────────
function getProjectRef(url) {
    // URL format: https://xxxxx.supabase.co  ou  https://xxxxx.pages.dev
    const match = url?.match(/https:\/\/([^.]+)/);
    if (!match) {
        console.error('❌ Não foi possível extrair o project ref de SUPABASE_URL:', url);
        console.error('   Formato esperado: https://xxxxx.supabase.co');
        process.exit(1);
    }
    return match[1];
}

// ── Lê um arquivo SQL, ignorando se não existir ───────────────────────
function readSQL(path) {
    const fullPath = resolve(ROOT, path);
    if (!existsSync(fullPath)) {
        console.warn(`⚠️  Arquivo não encontrado: ${path} — ignorando`);
        return '';
    }
    const sql = readFileSync(fullPath, 'utf-8').trim();
    if (!sql) {
        console.warn(`⚠️  Arquivo vazio: ${path} — ignorando`);
        return '';
    }
    console.log(`   📄 ${path} (${(sql.length / 1024).toFixed(0)} KB)`);
    return sql + '\n\n';
}

// ── Executa SQL via Management API ────────────────────────────────────
async function executeSQL(projectRef, accessToken, sql) {
    const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

    // Management API aceita até ~500 KB por requisição.
    // Se o SQL for maior, dividimos em chunks.
    const MAX_CHUNK = 400 * 1024; // 400 KB
    const chunks = [];
    for (let i = 0; i < sql.length; i += MAX_CHUNK) {
        chunks.push(sql.slice(i, i + MAX_CHUNK));
    }

    console.log(`\n   ☕ Enviando ${chunks.length} chunk(s) para a API...`);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`   → Chunk ${i + 1}/${chunks.length} (${(chunk.length / 1024).toFixed(0)} KB)`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: chunk }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Sem detalhes');
            console.error(`\n❌ Erro HTTP ${response.status} no chunk ${i + 1}:`);
            console.error(`   ${errorText.slice(0, 500)}`);

            // Tenta extrair mensagem de erro amigável
            try {
                const err = JSON.parse(errorText);
                console.error(`   Mensagem: ${err.message || err.error || err.hint || 'Desconhecido'}`);
                if (err.hint) console.error(`   Dica: ${err.hint}`);
            } catch {
                // Texto puro
            }

            process.exit(1);
        }

        console.log(`   ✅ Chunk ${i + 1}/${chunks.length} concluído`);
    }

    return { success: true };
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║    🎵 Reset do Banco — Escola Bruna Mandz              ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    // 1. Carrega credenciais
    loadEnv();

    const supabaseUrl = process.env.SUPABASE_URL;
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

    if (!supabaseUrl) {
        console.error('❌ SUPABASE_URL não encontrado no .env');
        process.exit(1);
    }
    if (!accessToken) {
        console.error('❌ SUPABASE_ACCESS_TOKEN não encontrado no .env');
        console.error('');
        console.error('   Para gerar seu token de acesso:');
        console.error('   1. Acesse https://app.supabase.com/account/tokens');
        console.error('   2. Clique em "Generate New Token"');
        console.error('   3. Adicione ao .env:');
        console.error('      SUPABASE_ACCESS_TOKEN=seu_token_aqui');
        console.error('');
        console.error('   Ou execute manualmente no SQL Editor do Supabase:');
        console.error('   1. schema.sql');
        console.error('   2. financial-schema.sql');
        console.error('   3. reset-dev.sql');
        console.error('   4. seed-products.sql');
        process.exit(1);
    }

    const projectRef = getProjectRef(supabaseUrl);
    console.log(`🔗 Projeto: ${projectRef}`);
    console.log(`📁 Raiz:    ${ROOT}`);
    console.log('');

    // 2. Lê os arquivos SQL na ordem correta
    console.log('📖 Lendo arquivos SQL...');
    console.log('');

    const schemaSQL       = readSQL('supabase/schema.sql');
    const financialSQL    = readSQL('supabase/financial-schema.sql');
    const resetDevSQL     = readSQL('supabase/reset-dev.sql');
    const seedProductsSQL = readSQL('supabase/seed-products.sql');

    const allSQL = schemaSQL + financialSQL + resetDevSQL + seedProductsSQL;

    if (!allSQL.trim()) {
        console.error('❌ Nenhum SQL para executar.');
        process.exit(1);
    }

    console.log(`\n📊 Total: ${(allSQL.length / 1024).toFixed(0)} KB de SQL`);

    // 3. Executa
    console.log('\n🚀 Executando reset no Supabase...');
    await executeSQL(projectRef, accessToken, allSQL);

    // 4. Relatório final
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║    ✅ Reset concluído com sucesso!                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('   Dados carregados:');
    console.log('   • 6 professores');
    console.log('   • 12 alunos (todos os 7 status)');
    console.log('   • 8 matrículas, mensalidades, aulas');
    console.log('   • Despesas, investimentos, receitas avulsas');
    console.log('   • Pagamentos a professores');
    console.log('   • Produtos da loja');
    console.log('');
    console.log('   🎹 Pronto para desenvolver!');
    console.log('');
}

main().catch((err) => {
    console.error('❌ Erro inesperado:', err.message);
    process.exit(1);
});
