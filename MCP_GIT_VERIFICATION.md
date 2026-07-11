# MCP_GIT_VERIFICATION.md

## 1) Git MCP — tool `git_status` (evidências)
- **Server name (Blackbox MCP):** `github.com/modelcontextprotocol/servers/tree/main/src/git`
- **repo_path esperado:** `c:/Users/lnpot/OneDrive/Documentos/site-escola`

### Como executar (via Blackbox / tool do MCP Git)
- Chamada: `git_status`
- Parâmetros:
  - `repo_path`: `c:/Users/lnpot/OneDrive/Documentos/site-escola`

### Output (preenchido após teste)
- `git_status output:` **(preencher com o output real do tool)**

---

## 2) Diagnóstico Supabase/Backend (consistência de tabelas)
### 2.1 Endpoints verificados
- `api/admin-financial.js`
  - `?resource=dashboard`
  - `?resource=summary`
  - (resources adicionais no handler: `students`, `teachers`, `enrollments`, `tuitions`, `payments`, `expenses`, `investments`, `teacher_payments`, `lessons`, `attendance`)
- `api/admin-products.js`
  - `GET` lista `products`
  - (também foi verificado: `POST`/`PATCH` dependem de `products`)
- `api/admin-orders.js`
  - `GET` lista `orders`

### 2.2 Tabelas e recursos — Loja (`supabase/schema.sql`)
**Usadas pelos handlers:**
- `orders` (em `api/admin-orders.js` e também em `dashboard`/store do admin-financial)
- `products` (em `api/admin-products.js` e também em `dashboard`/store do admin-financial)

**Confirmado no schema:**
- `public.orders` existe em `supabase/schema.sql`
- `public.products` existe em `supabase/schema.sql`

---

### 2.3 Tabelas e resources — Financeiro/Pedagógico (`supabase/financial-schema.sql`)
**Usadas por `api/admin-financial.js` (handleDashboard/handleSummary e resources):**
- `students`
- `teachers`
- `enrollments`
- `tuitions`
- `payments`
- `expenses`
- `investments`
- `teacher_payments`
- `lessons`
- `attendance`

**Confirmado no schema:**
- Todas as tabelas acima existem em `supabase/financial-schema.sql` com os campos consultados no backend (ex.: `students.name`, `teachers.name/specialty`, `enrollments.instrument/day_of_week`, `tuitions.due_date/status`, etc.)

---

## 3) Observação sobre RLS / Service Role Key
- Os SQLs habilitam RLS, mas descrevem a estratégia: **backend usa `SUPABASE_SERVICE_ROLE_KEY` para bypassar RLS**.
- O código dos handlers usa `getSupabase()` e declara dependência de `SUPABASE_SERVICE_ROLE_KEY` (e `ADMIN_PASSWORD` para o “painel admin” via header simples).
