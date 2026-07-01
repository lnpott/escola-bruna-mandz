import fs from 'fs';

// 1. CONFIGURAÇÃO (Substitui pelos teus dados do Supabase)
const SUPABASE_URL = "https://ljosqddzxreloizpynvf.supabase.co"; 
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb3NxZGR6eHJlbG9penB5bnZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjYwNDAwOSwiZXhwIjoyMDk4MTgwMDA5fQ.0L-E3dJVO5Kj41S_JEyLDCt9gEqEbtloVtWX-HaNWeE"; // Começa com eyJ...

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

    // Criar a pasta de backups se não existir
    if (!fs.existsSync('./backups')){
        fs.mkdirSync('./backups');
    }

    // Guarda o resultado final num ficheiro JSON
    const caminhoFicheiro = './backups/backup_dados.json';
    fs.writeFileSync(caminhoFicheiro, JSON.stringify(backupCompleto, null, 2));
    
    console.log(`\n🎉 Backup concluído! Dados guardados em: ${caminhoFicheiro}`);
}

fazerBackup();