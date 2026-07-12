# Plano de Refatoração — Painel Administrativo

> Documento oficial de planejamento da reforma do sistema.
> Criado: 12/07/2026
> Baseado em: entrevista com usuário + análise do código atual + documentação em `docs/`

---

## Diagnóstico do Estado Atual

### Problemas identificados

1. **Dois frontends concorrentes**: O painel clássico (`painel-x9k2f.html`, ~4400 linhas JS puro) e o React SPA (`app/`, construído nas Etapas 50-55) coexistem. O portal redireciona ao React SPA (Etapa 56), mas o React SPA apresenta erros 500 ao tentar modificar dados.

2. **Erro 500 generalizado**: A API `admin-financial.js` captura erros genericamente (`catch (err) → "Erro interno."`), sem log detalhado ou distinção entre erro de validação, erro de banco ou erro de configuração. Qualquer falha vira 500 sem informação para o usuário ou para debug.

3. **Schema do banco com redundâncias**: Tabela `students` tem `active` (boolean) e `status` (text com 7 valores) — o campo `active` é derivado de `status` mas ambos são mantidos para compatibilidade. Várias colunas nullable que poderiam ter defaults mais rígidos.

4. **Navegação confusa**: O usuário relatou que precisa "trocar de página toda hora" para acessar funções vitais.

5. **Cobertura de testes inexistente**: Apenas 2 testes de webhook (`tests/webhook-signature.test.js`). Zero testes para a API administrativa, zero testes para componentes React.

### O que funciona bem (manter)

- Estrutura de dados: entidades (students, teachers, enrollments, lessons, attendance, tuitions, payments, expenses, investments, teacher_payments) cobrem bem o domínio
- API consolidada em um arquivo (`admin-financial.js`) respeita o limite de 12 Serverless Functions da Vercel
- React SPA já tem todas as páginas construídas (Dashboard, Students, Teachers, Enrollments, Agenda, Financial, Admin)
- Autenticação via `sessionStorage` + `x-admin-password` compartilhada entre painel clássico e React SPA
- Tratamento seguro de valores financeiros (`safeFloat`/`safeInt`)

---

## Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Frontend único | **React SPA** (`app/`) | Abandonar painel clássico, manter React/TypeScript |
| API | **Consolidada** (`admin-financial.js` + `resource=`) | Limite de 12 functions Vercel Hobby |
| Banco | **Redesenhado** com schema mais limpo | Remover redundâncias, normalizar relações |
| Autenticação | **Manter `sessionStorage` + `x-admin-password`** | Já funciona, compartilhada entre frontends |
| Loja | **Separada** (mantida como está) | Não faz parte do escopo da reforma |
| Testes | **Adicionar** cobertura para API e componentes | Zero cobertura atual |

---

## Plano de Commits

Cada commit deixa o código em estado funcional ou pelo menos não pior que antes.

### Fase 1 — Diagnosticar e estabilizar o sistema atual
*(Antes de qualquer redesign, garantir que o que existe funciona)*

**Commit 1.1: Adicionar log detalhado nos erros 500 da API**
- Substituir `console.error('Erro interno:', err.message)` por log estruturado com stack trace
- Diferenciar erros de validação (400), erros de banco (503) e erros internos (500)
- Respostas de erro incluem código de erro para debug sem vazar detalhes internos

**Commit 1.2: Identificar e corrigir causas dos 500 em POST/PATCH**
- Testar cada handler (students, teachers, lessons) isoladamente
- Verificar parsing de `req.body` (Vercel pode não parsear automaticamente em alguns casos)
- Garantir que todos os campos obrigatórios são validados antes da query
- Verificar constraint violations no Supabase (FKs, unique checks)

**Commit 1.3: Adicionar testes de API para admin-financial.js**
- Testar GET, POST, PATCH, DELETE para cada resource
- Validar retorno 200/201/400/401/404/500 conforme o caso
- Usar `node --test` (padrão já existente no projeto)

### Fase 2 — Redesenhar o banco de dados
*(Schema novo, limpo, sem quebrar os dados existentes)*

**Commit 2.1: Criar script de análise do schema atual**
- Mapear todas as colunas, constraints, índices, FKs
- Identificar redundâncias (ex: `students.active` vs `students.status`)
- Identificar inconsistências (ex: `teachers.days_of_week` como text)

**Commit 2.2: Criar novo schema SQL**
- Tabelas normalizadas e consistentes
- Decidir: remover `active` de students (só usar `status`)
- Decidir: normalizar `days_of_week` para tabela própria ou manter como text
- Adicionar constraints CHECK mais rigorosas
- Manter IDs com prefixo legível (ST-XXXX, TE-XXXX, etc.)
- Manter triggers `set_updated_at`

**Commit 2.3: Criar migration do schema antigo para o novo**
- Script SQL que cria as novas tabelas
- Migra os dados existentes
- Remove as tabelas antigas (após verificação)

### Fase 3 — Reescrever a API
*(Adaptar admin-financial.js ao novo schema)*

**Commit 3.1: Refatorar handler principal**
- Mapper resource → handler mais explícito
- Tratamento de erro centralizado
- Validação de entrada antes de qualquer operação de banco

**Commit 3.2: Implementar handler de Students**
- CRUD completo
- Validações: nome obrigatório, CPF único (se fornecido)
- Status lifecycle consistente

**Commit 3.3: Implementar handler de Teachers**
- CRUD completo
- rate_per_class como safeFloat

**Commit 3.4: Implementar handler de Enrollments**
- CRUD completo com billing_type (weekly/monthly/full)
- Validação: se billing_type=full, total_amount obrigatório

**Commit 3.5: Implementar handler de Lessons + Attendance**
- CRUD completo
- Cálculo de end_time automático
- Presença com constraint única (lesson_id, student_id)

**Commit 3.6: Implementar handlers financeiros**
- Tuitions: CRUD com status lifecycle
- Payments (receitas avulsas): CRUD
- Expenses: CRUD com toggle paid
- Investments: CRUD
- Teacher Payments: CRUD
- Summary: consolidado mensal
- Dashboard: KPIs consolidados

### Fase 4 — Estabilizar o React SPA
*(Fazer o frontend React funcionar de verdade)*

**Commit 4.1: Corrigir fluxo de autenticação**
- Login salva senha em sessionStorage
- AuthGuard verifica sessão válida
- Logout limpa sessão e redireciona
- Tratamento de 401 (senha expirada/inválida)

**Commit 4.2: Corrigir Dashboard**
- Verificar chamadas de API (fetchDashboard)
- Tratar estados de loading/erro/vazio
- Auto-refresh a cada 60s com contagem regressiva

**Commit 4.3: Corrigir Students**
- Listagem com busca e filtro por status
- Modal CRUD com status lifecycle (lead→cancelled)
- Campos de responsável (guardian)

**Commit 4.4: Corrigir Teachers**
- Listagem com busca
- Modal CRUD com dias de atendimento e rate_per_class

**Commit 4.5: Corrigir Enrollments**
- Listagem com busca e filtro
- Modal CRUD com billing_type
- Seleção de aluno/professor/instrumento

**Commit 4.6: Corrigir Agenda + Lessons**
- Calendário mensal grid 7 colunas
- Navegação entre meses
- Modal de detalhe do dia
- CRUD de aulas
- Presença (attendance)

**Commit 4.7: Corrigir Financial**
- KPIs com seletor de mês/ano
- Sub-abas: Receitas, Custos, Investimentos, Pagto Professores
- CRUDs com modais
- Toggle paid/unpaid inline

### Fase 5 — Navegação e UX
*(Painel único sem troca de páginas desnecessária)*

**Commit 5.1: Simplificar navegação**
- Mover sub-abas para navegação principal quando fizer sentido
- Breadcrumbs para contexto
- Links rápidos entre entidades relacionadas (ex: de aluno para matrículas)

**Commit 5.2: Melhorar feedback visual**
- Toasts de sucesso/erro consistentes
- Loading spinners
- Empty states para listas vazias
- Confirmação em ações destrutivas (excluir)

**Commit 5.3: Responsividade**
- Verificar layout em mobile
- Ajustar grids e modais

### Fase 6 — Limpeza
*(Remover o que não será mais usado)*

**Commit 6.1: Remover redirect forçado ao React SPA do painel clássico**
- Manter painel clássico acessível via URL direta
- Remover redirecionamento automático
- Adicionar aviso de que o novo sistema está em `/app/`

**Commit 6.2: Arquivar código morto**
- Mover `painel-x9k2f.html` para backup (não deletar)
- Documentar que o frontend oficial é o React SPA

---

## O que NÃO está no escopo

1. **Loja** (`store/`, `api/admin-orders.js`, `api/admin-products.js`, `api/create-payment.js`, `api/webhook.js`) — mantida como está, separada.
2. **Portal do Professor/Aluno** — Versão 2.0 do roadmap, não faz parte desta reforma.
3. **Supabase Auth** — Continua usando senha única via `x-admin-password`.
4. **Infraestrutura** — Vercel + Supabase continuam como estão.
5. **Funcionalidades novas** (relatórios, gráficos, exportação) — a menos que apareçam como necessárias para substituir funcionalidades existentes.
6. **Página pública** (`index.html`, piano virtual, quiz) — mantida como está.

---

## Cronograma Estimado

| Fase | Commits | Esforço estimado |
|------|---------|-----------------|
| Fase 1 — Diagnosticar e estabilizar | 3 | 🟢 Médio (bugs específicos) |
| Fase 2 — Redesenhar banco | 3 | 🟡 Alto (schema novo) |
| Fase 3 — Reescrever API | 6 | 🔴 Alto (toda a API) |
| Fase 4 — Estabilizar React SPA | 7 | 🔴 Alto (cada página) |
| Fase 5 — Navegação e UX | 3 | 🟢 Médio |
| Fase 6 — Limpeza | 2 | 🟢 Baixo |

**Total estimado: 24 commits**

---

## Próximos Passos

1. Revisar e aprovar este plano
2. Iniciar Fase 1 — diagnosticar os erros 500
3. Acompanhar cada commit com testes
4. Validar em produção após cada fase
