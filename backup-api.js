/**
 * backup-api.js
 * Exporta as tabelas do Supabase para um arquivo JSON local.
 * Executado pelo GitHub Actions (.github/workflows/supabase-backup.yml).
 * O arquivo gerado é enviado como Artifact — nunca commitado no repositório.
 *
 * Variáveis de ambiente necessárias (configuradas nos Secrets do GitHub Actions):
 *   SUPABASE_URL              → URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY → Service Role Key (acesso total ao banco)
 */

import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL não configurado.');
    process.exit(1);
}
if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado.');
    process.exit(1);
}

const TABELAS = ['products', 'orders'];

async function fazerBackup() {
    const dataHoje = new Date().toISOString().slice(0, 10);
    console.log(`🚀 Iniciando backup — ${dataHoje}`);

    const backupCompleto = { _meta: { date: dataHoje, tables: TABELAS } };

    for (const tabela of TABELAS) {
        console.log(`📥 Baixando tabela: ${tabela}…`);
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?select=*`, {
                headers: {
                    apikey: SUPABASE_SERVICE_KEY,
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            backupCompleto[tabela] = await response.json();
            console.log(`✅ ${tabela}: ${backupCompleto[tabela].length} registros`);
        } catch (err) {
            console.error(`❌ Erro na tabela ${tabela}:`, err.message);
            backupCompleto[tabela] = [];
        }
    }

    // Salva na raiz — o workflow faz o upload como Artifact a partir daqui
    const caminho = './backup_dados.json';
    fs.writeFileSync(caminho, JSON.stringify(backupCompleto, null, 2));
    console.log(`\n🎉 Backup concluído → ${caminho}`);
}

fazerBackup();
