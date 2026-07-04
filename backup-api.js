import fs from 'fs';

// 1. CONFIGURAÇÃO (Carregada via variáveis de ambiente para segurança)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ljosqddzxreloizpynvf.supabase.co"; 
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ Erro: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está definida.");
    process.exit(1);
}

// Lista as tabelas do teu banco que queres fazer backup
// Exemplo: ['produtos', 'pedidos', 'usuarios']
const TABELAS = ['products', 'orders']; 

async function fazerBackup() {
    console.log("🚀 A iniciar backup via API do Supabase...");
    const backupCompleto = {};

    for (const tabela of TABELAS) {
        console.log(`📥 A descarregar dados da tabela: ${tabela}...`);
        
        try {
            // Faz o pedido HTTP direto à API do Supabase usando a chave
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?select=*`, {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const dados = await response.json();
            backupCompleto[tabela] = dados;
            
        } catch (erro) {
            console.error(`❌ Erro ao baixar a tabela ${tabela}:`, erro.message);
        }
    }

    // Criar a pasta supabase se não existir
    if (!fs.existsSync('./supabase')){
        fs.mkdirSync('./supabase');
    }

    // Guarda o resultado final num ficheiro JSON
    const caminhoFicheiro = './supabase/backup_dados.json';
    fs.writeFileSync(caminhoFicheiro, JSON.stringify(backupCompleto, null, 2));
    
    console.log(`\n🎉 Backup concluído! Dados guardados em: ${caminhoFicheiro}`);
}

fazerBackup();