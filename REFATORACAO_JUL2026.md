# Refatoração do painel administrativo acadêmico — jul/2026

Resumo do que foi feito nesta rodada, pra registrar no `novo_registro.md`
como próxima Etapa e alinhar `AGENTS.md`/`TODO_PROGRESS.md`/`refatora.md`
com o estado real do código (que tinha divergido bastante da documentação).

## Achado principal: 3 frontends administrativos concorrentes, não 2

Ao investigar o repositório real (não só os `.md`), foram encontrados:

1. **`app/` (React SPA)** — Dashboard, Students, Teachers, Enrollments, Agenda,
   Financial, Admin. TypeScript, React 19, react-router-dom 7. **Mantido — é o
   frontend oficial daqui pra frente**, conforme decisão já registrada em
   `refatora.md`.
2. **`academic/index.html`** (~4600 linhas, vanilla JS) — praticamente um
   clone de `commercial/index.html`, cobrindo os mesmos recursos do React SPA
   (Agenda, Alunos, Professores) só que numa implementação paralela e
   desatualizada. Não estava linkado de nenhum lugar navegável do sistema —
   só acessível via `/academico` (rewrite direto no `vercel.json`).
   **→ Arquivado em `backups/academic-index-legacy-<data>.html` e removido do
   build.** `/academico` agora redireciona para `/app/`.
3. **`commercial/index.html`** (~4600 linhas, vanilla JS) — painel de
   Pedidos/Produtos da loja + Financeiro. **Fora do escopo desta refatoração**
   (é o painel de administração da loja, que deve permanecer como está) —
   **não foi tocado**. Fica registrado aqui que ele duplica a aba Financeiro
   que também existe no React SPA; se um dia o escopo da loja entrar em pauta,
   vale revisitar essa sobreposição.

`painel-x9k2f.html` não é um painel de verdade — é só a tela de login/portal
que decide entre `/app/` (acadêmico) e `commercial/index.html` (loja). Não
precisou de mudança, já apontava certo.

## Bug real corrigido: redundância `students.active` / `students.status`

Confirmado no schema e no handler: `students` tinha as duas colunas em
paralelo, com lógica de sincronização (`active` derivado de `status` e
vice-versa) duplicada em POST e PATCH. Como o banco pode ser recriado do
zero, a correção foi: **remover `active` de `students`** — `status` passa a
ser a única fonte de verdade. Ver `supabase/RESET_INSTRUCTIONS.md`.

`teachers.active` foi mantido — ali não é redundante (professores não têm um
ciclo de vida com múltiplos estágios como aluno tem).

## `api/admin-financial.js`: de 1300 linhas monolíticas para router + 12 módulos

Toda a lógica de handler foi movida para `api/_lib/financial/*.js` (um
arquivo por recurso), com `api/admin-financial.js` virando um router fino de
~80 linhas. Contrato HTTP idêntico (mesmas rotas, mesmos payloads) — só muda
a organização interna. Isso também foi o que tornou possível escrever testes
unitários de verdade pela primeira vez (antes, só existiam 2 testes de
webhook em todo o projeto).

### Bugs e gaps reais corrigidos no caminho

- **Dashboard contava professores errado**: `active_teachers` somava TODOS os
  professores, sem filtrar por `active = true`.
- **Dashboard usava `students.active`** pra contar alunos ativos — agora usa
  `status = 'active'`, consistente com a remoção da coluna.
- **`investments` não tinha PATCH/DELETE** — só criar, sem editar (pendência
  já registrada em `TODO_PROGRESS.md`). Adicionado CRUD completo.
- **`tuitions` e `attendance` não tinham DELETE** — adicionado.
- **`teachers` PATCH nunca permitia atualizar `active`** — campo existe no
  schema mas o handler não aceitava essa atualização. Corrigido.
- **PATCH de `lessons`**: quando só `duration_minutes` mudava (sem
  `start_time`), o recálculo de `end_time` usava `||` em vez de checar
  `!== undefined` — um `duration_minutes: 0` explícito caía no valor antigo
  por engano. Também não checava erro ao buscar a aula atual. Corrigido.

## Frontend React (`app/`)

Já estava construído em torno de `status` (não usava `active` pra lógica de
UI) — só precisou remover o campo `active` do tipo `Student` em `types.ts` e
do `Omit<>` em `createStudent` (`services/api.ts`). Nenhuma mudança de
comportamento visível.

## Testes

Adicionados `tests/financial-helpers.test.js` (17 testes unitários das
funções puras: `safeFloat`, `safeInt`, `classifyError`, `normalizeMonthDate`,
etc.) e `tests/financial-students.test.js` (5 testes do handler de students
com um mock leve do client Supabase, sem precisar de banco real) —
`npm test` passa de 2 para 29 testes.

## O que ficou de fora de propósito (fora do escopo pedido)

- `commercial/index.html` e tudo que é loja (`store/`, `api/admin-orders.js`,
  `api/admin-products.js`, `api/create-payment.js`, `api/webhook.js`,
  `supabase/schema.sql`) — mantidos intactos, como pedido.
- `resource=generate_monthly_billing`, chamado pelo `commercial/index.html`
  mas inexistente em `admin-financial.js` — é um recurso morto de uma versão
  anterior à redesenho de billing por enrollment. Como só é chamado de dentro
  do painel de loja (fora de escopo), não foi removido nem implementado — só
  fica registrado aqui como algo pra revisitar se o commercial/index.html
  entrar em pauta.

## Como aplicar

Todos os arquivos abaixo têm caminho completo igual ao do repositório —
é só sobrescrever/adicionar cada um e commitar:

- `supabase/financial-schema.sql` (schema limpo)
- `supabase/RESET_INSTRUCTIONS.md` (novo — instruções de recriação do banco)
- `api/admin-financial.js` (agora um router fino)
- `api/_lib/financial/*.js` (12 arquivos novos — os módulos por recurso)
- `app/src/types.ts`, `app/src/services/api.ts` (ajuste do campo `active`)
- `vercel.json`, `vite.config.js` (remoção da entrada `academic`)
- `academic/index.html` → **deletar** (já copiado para `backups/`)
- `tests/financial-helpers.test.js`, `tests/financial-students.test.js` (novos)

Depois de aplicar: recriar o banco seguindo
`supabase/RESET_INSTRUCTIONS.md`, então `npm install && npm test && npm run build`.
