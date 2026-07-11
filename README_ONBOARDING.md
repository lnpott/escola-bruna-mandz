# Escola Bruna Mandz — Onboarding (Painel Admin + MCP Git)

## Objetivo
Este guia ajuda novos agentes/developers a:
- rodar o projeto localmente;
- entender o Painel Administrativo (clássico e React);
- verificar rapidamente a integração de **MCP Git** no Blackbox via `git_status`;
- preencher evidências nos arquivos do projeto.

---

## Estrutura relevante
- Painel clássico (HTML/JS): `painel-x9k2f.html`
- React (Vite/TS):
  - rotas em `app/src/App.tsx`
  - páginas em `app/src/pages/*`
- Backend admin (Vercel Functions / handlers):
  - `api/admin-financial.js`
  - `api/admin-orders.js`
  - `api/admin-products.js`
- Supabase schema (documentação via SQL):
  - `supabase/schema.sql` (Loja: `orders`, `products`)
  - `supabase/financial-schema.sql` (Financeiro/Pedagógico)
  - `supabase/migrations/*` (migrations reais)

---

## Requisitos do ambiente
- Node.js (para `npm test` / build)
- Acesso às variáveis usadas pelo backend:
  - `ADMIN_PASSWORD`
  - `SUPABASE_SERVICE_ROLE_KEY` (backend bypassa RLS)
  - `SUPABASE_URL`
- Supabase executa via `npx supabase ...` quando necessário (dependendo do auth/token do Supabase CLI).

---

## Passo 1 — Subir/validar local
### Testes
```bash
npm test
```

### Build
```bash
npm run build
```

---

## Passo 2 — Verificar MCP Git no Blackbox (tool `git_status`)
### Server name exigido
O MCP Git deve estar registrado no Blackbox com este **server name**:
`github.com/modelcontextprotocol/servers/tree/main/src/git`

### Tool / chamada esperada
- Tool: `git_status`
- Parâmetros:
  - `repo_path`: `c:/Users/lnpot/OneDrive/Documentos/site-escola`

### Onde registrar evidência
Preencher o arquivo:
- `MCP_GIT_VERIFICATION.md`

Recomendação de preenchimento:
1. Colar o output do `git_status` (working tree status).
2. Se necessário, adicionar também observações do que foi verificado.

---

## Passo 3 — Diagnóstico do Backend (consistência com schemas)
O checklist do projeto assume que o backend consulta tabelas definidas nos SQLs:
- `api/admin-financial.js` ↔ `supabase/financial-schema.sql`
- `api/admin-products.js` e `api/admin-orders.js` ↔ `supabase/schema.sql`

### Onde registrar evidência
Registrar no:
- `MCP_GIT_VERIFICATION.md`

---

## Como continuar o trabalho “oficialmente”
1. Ler `painel_registro.md` completamente.
2. Identificar a última etapa registrada.
3. Criar uma nova etapa no final do `painel_registro.md` para cada implementação relevante.
4. Atualizar/usar evidências em `MCP_GIT_VERIFICATION.md`.

---

## Evidência existente (contexto)
- `implementation_plan.md` descreve a intenção do passo.
- `MCP_GIT_VERIFICATION.md` contém a seção a ser preenchida após execução do `git_status` no Blackbox.
