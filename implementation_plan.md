# Implementation Plan

[Overview]
Instalar e registrar o MCP server de Git no Blackbox (com o nome solicitado) e, em seguida, demonstrar uma tool do servidor e realizar um diagnóstico completo do Supabase/Backend para garantir que a “implantação” (operação do painel e consistência de dados) permanece correta.

O repositório já possui MCP configurado em nível de usuário para Supabase e também já possui configuração para o MCP server Git. A tarefa exige explicitamente usar como server name `github.com/modelcontextprotocol/servers/tree/main/src/git` e registrar evidências da demonstração do tool `git_status`.

Além disso, “reparo e implantação completa” exige que a demonstração do Git MCP não seja o único foco: o projeto depende de Vercel Functions com `SUPABASE_SERVICE_ROLE_KEY` (backend bypassa RLS) e a integridade do banco deve ser validada contra:
- `supabase/schema.sql` (Loja: `orders`, `products`)
- `supabase/financial-schema.sql` (Financeiro/Pedagógico: `students`, `teachers`, `enrollments`, `tuitions`, etc.)
- `supabase/migrations/*.sql` (aplicações reais)
- handlers do backend `api/admin-financial.js`, `api/admin-orders.js`, `api/admin-products.js`

Este plano elimina suposições ao alinhar as consultas do backend com os schemas/migrations, e ao registrar evidências (tool calls e respostas) para comprovar o funcionamento.

[Types]
Single sentence describing the type system changes.
Não haverá mudanças em tipos (TS/JS) — apenas ajustes de configuração JSON do MCP e validações observáveis (tool outputs + respostas HTTP).

Detailed type definitions, interfaces, enums, or data structures with complete specifications. Include field names, types, validation rules, and relationships.
N/A (sem alterações de tipo nesta etapa).

[Files]
Single sentence describing file modifications.
Modificar a configuração do Blackbox MCP (arquivo JSON do usuário) para adicionar o server Git e criar um arquivo de evidências no repositório para registrar a demonstração do tool `git_status`, além de atualizar `implementation_plan.md` para refletir a arquitetura e as regras reais documentadas em `docs/`.

Detailed breakdown:
- New files to be created (with full paths and purpose)
- `MCP_GIT_VERIFICATION.md`
  - Registra comando/inputs usados no MCP tool `git_status` e o resumo do output.
  - Registra também como o backend foi diagnosticado (endpoints e recursos consultados).
- Existing files to be modified (with specific changes)
  - `c:/Users/lnpot/AppData/Roaming/Code/User/globalStorage/blackboxapp.blackboxagent/settings/blackbox_mcp_settings.json`
    - Garantir que `mcpServers` contenha o server name `github.com/modelcontextprotocol/servers/tree/main/src/git` com execução compatível com Windows (preferência: `python -m mcp_server_git`).
    - Manter o server `supabase` existente intacto.
  - `implementation_plan.md`
    - Atualizar o texto para refletir os documentos reais de arquitetura/regras (especialmente `docs/ARCHITECTURE.MD`, `docs/modules.md`, `docs/BUSINESS_RULES.md`, `docs/database.md`, `docs/CONFIGURACAO_ENV.md`, `docs/ROADMAP.MD`, `docs/proxima-etapa-spec.md`).
- Files to be deleted or moved
  - Nenhum.
- Configuration file updates
  - `blackbox_mcp_settings.json` apenas.

[Functions]
Single sentence describing function modifications.
Nenhuma função do projeto será modificada; serão feitas apenas chamadas de tool do MCP (Git) e diagnósticos via leitura de schema/migrations e consistência de código.

Detailed breakdown:
- New functions
  - N/A.
- Modified functions (exact name, current file path, required changes)
  - N/A.
- Removed functions (name, file path, reason, migration strategy)
  - N/A.

[Classes]
Single sentence describing class modifications.
Nenhuma.

Detailed breakdown:
- New classes
  - N/A.
- Modified classes
  - N/A.
- Removed classes
  - N/A.

[Dependencies]
Single sentence describing dependency modifications.
Garantir disponibilidade do MCP Git no runtime do Blackbox (via `mcp-server-git` instalado em Python ou executável equivalente).

Details of new packages, version changes, and integration requirements.
- `mcp-server-git` instalado via pip já foi tentado no ambiente Python do usuário.
- A integração no Blackbox deve apontar para o método de execução que funcione no Windows:
  - Preferência: `python -m mcp_server_git`
  - Alternativa: apontar para o executável `mcp-server-git.exe` localizado em `C:\Users\lnpot\AppData\Roaming\Python\Python314\Scripts\...`
- Não adicionar dependências em `package.json`.

[Testing]
Single sentence describing testing approach.
Executar um conjunto mínimo de validações (“critical-path”) para comprovar o Git MCP e a consistência operacional do Supabase/Backend para os endpoints principais do painel admin.

Test file requirements, existing test modifications, and validation strategies.
Sem novos testes automatizados.

Critérios de passagem:
1) Git MCP:
   - Tool do Git server `git_status` executa com sucesso e retorna status do working tree para `repo_path = c:/Users/lnpot/OneDrive/Documentos/site-escola`.
2) Supabase/Backend:
   - Requests ao backend admin (via chamadas que o Blackbox conseguir executar, ou via inspeção de código e validação por parâmetros) retornam sucesso para:
     - `api/admin-financial.js` com `resource=dashboard`
     - `api/admin-financial.js` com `resource=summary`
     - `api/admin-products.js` via GET (lista produtos)
     - `api/admin-orders.js` via GET (lista pedidos)
   - Coerência verificada entre:
     - `api/admin-financial.js` resources e tabelas existentes em `supabase/financial-schema.sql`
     - `api/admin-orders.js`/`api/admin-products.js` e tabelas em `supabase/schema.sql`
   - Observação importante para diagnóstico:
     - Documentação real afirma que o painel usa service role e “bypassa RLS”; portanto, mesmo com RLS/policies inconsistentes, a operação via backend deve funcionar. O plano registra divergências encontradas para possíveis hardening futuros.

[Implementation Order]
Single sentence describing the implementation sequence.
1) Finalizar/configurar o MCP Git no Blackbox; 2) demonstrar com `git_status`; 3) validar endpoints do painel admin por diagnóstico de consistência com schemas/migrations; 4) registrar evidências no arquivo de verificação.

Numbered steps showing the logical order of changes to minimize conflicts and ensure successful integration.
1. Confirmar execução do MCP Git no ambiente:
   - Confirmar que `python -m mcp_server_git` funciona (ou identificar o `mcp-server-git.exe` instalado no Scripts do usuário).
   - Garantir que o Blackbox consegue iniciar o server usando o formato esperado em `blackbox_mcp_settings.json`.
2. Atualizar `c:/Users/lnpot/AppData/Roaming/Code/User/globalStorage/blackboxapp.blackboxagent/settings/blackbox_mcp_settings.json`:
   - Inserir `mcpServers.git` com o server name requerido: `github.com/modelcontextprotocol/servers/tree/main/src/git`.
   - Manter `mcpServers.supabase` existente sem alterações.
3. Demonstrar capacidades com MCP:
   - Chamar tool `git_status` com `repo_path: "c:/Users/lnpot/OneDrive/Documentos/site-escola"`.
   - Salvar resumo do output no `MCP_GIT_VERIFICATION.md`.
4. Diagnóstico de consistência Supabase/Backend:
   - Checar que `api/admin-financial.js` usa recursos que existem em `supabase/financial-schema.sql`:
     - `students`, `teachers`, `enrollments`, `tuitions`, `payments`, `expenses`, `investments`, `teacher_payments`, `lessons`, `attendance`, `summary`, `dashboard`
   - Checar que Loja usa tabelas em `supabase/schema.sql`:
     - `products`, `orders`
   - Conferir migrations esperadas existem no diretório `supabase/migrations/`:
     - 043, 045, 046, 047, 050
   - Registrar divergências entre documentos “RLS sem policies” vs o que está no schema:
     - A revisão atual de docs e schemas reais sugere que o comportamento real é “backend bypass RLS” via service role; ainda assim, o plano inclui registrar o que existe de policies no schema para futuras correções/hardening.
5. Conclusão:
   - A entrega será considerada completa quando:
     - Git MCP estiver configurado e `git_status` retornar output.
     - O diagnóstico de consistência do Supabase/Backend não revelar consultas a tabelas inexistentes.
