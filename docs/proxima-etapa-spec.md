# Especificação — Próxima Etapa do Painel Administrativo

> **Data:** 10/07/2026
> **Agente:** Buffy (Freebuff)
> **Baseado em:** Entrevista com o usuário + análise do código atual
>
> ⚠️ **Nota histórica (15/07/2026):** As 3 prioridades definidas neste documento
> **já foram implementadas**:
> - 🔴 Agenda Mensal → ✅ Etapas 46/50
> - 🟡 Geração automática de mensalidade → ✅ Etapa 61 (wizard)
> - 🟢 Alunos Expandido → ✅ Etapa 53 (StudentDetail, CSV, guardian fields)
>
> Este documento é mantido como **referência histórica** da especificação original.
> Pendências atuais atualizadas em `docs/ROADMAP.MD`.

---

## 1. Visão Geral

### 1.1 O que este documento cobre

Este documento especifica as **próximas melhorias** a serem implementadas no Painel Administrativo da Escola Bruna Mandz, com base em:
- Análise do estado atual do código (API, frontend, banco)
- Documentação existente (ROADMAP, TODO, BUSINESS_RULES, novo_registro)
- Entrevista com o usuário (3 rodadas de perguntas)

### 1.2 Prioridades definidas pelo usuário (TODAS IMPLEMENTADAS ✅)

| Prioridade | Área | Descrição | Status |
|------------|------|-----------|:------:|
| 🔴 **1** | **Agenda** | Substituir visão semanal por **visão mensal** (calendário tipo Google Calendar) | ✅ Etapas 46/50 |
| 🟡 **2** | **Financeiro** | Melhorar criação de mensalidades: **geração automática ao criar vínculo** | ✅ Etapa 61 |
| 🟢 **3** | **Alunos** | Expandir cadastro de alunos com novos campos + melhorar visualização | ✅ Etapa 53 |

---

## 2. Auditoria do Estado Atual

### 2.1 O que já está funcional ✅

#### Dashboard (aba principal)
- KPIs financeiros (receita, despesas, saldo, pendentes, alunos em atraso)
- Aulas de Hoje (divididas em Agendadas/Realizadas, com tipo e duração)
- Alertas (inadimplência, pedidos pendentes, estoque baixo)
- Pedidos Recentes
- Produtos com Estoque Baixo
- ✅ Estável

#### Loja (aba principal)
- Catálogo de 10 produtos no Supabase
- Carrinho com variantes (tamanhos)
- Checkout PIX (QR Code real via Mercado Pago) e Cartão (Card Brick)
- Pedidos salvos no Supabase
- ✅ Estável

#### Financeiro (aba principal)
- **Alunos** — CRUD básico (nome, email, telefone, endereço, instrumento)
- **Professores** — CRUD completo (nome, telefone, especialidade, dias, valor/aula)
- **Vínculos (enrollments)** — CRUD completo (aluno + professor + instrumento + dia/horário + valor)
- **Aulas (lessons)** — CRUD completo com presença (attendance), filtro por período/status
- **Mensalidades (tuitions)** — CRUD com vínculo a enrollment, status, descontos
- **Pagto Professores** — CRUD manual (teacher_payments)
- **Receitas Avulsas** — CRUD com categorias e exportação CSV
- **Custos & Investimentos** — CRUD com categorias e status de pagamento
- **Agenda Semanal (recém-implementada)** — Grid 7 dias, navegação entre semanas
- ✅ Estável (com ressalvas — ver seção 3)

#### Painel Admin (geral)
- Login por senha (`x-admin-password`)
- Tabs: Dashboard, Agenda, Pedidos, Produtos, Financeiro
- Auto-refresh a cada 60s
- Responsivo para mobile
- ✅ Estável

#### API (`api/admin-financial.js`)
- 12 recursos: dashboard, students, teachers, enrollments, tuitions, payments, expenses, investments, teacher_payments, lessons, attendance, summary
- 17 funções, 1067 linhas
- ✅ Consolidada e funcional

#### Banco de Dados (`supabase/financial-schema.sql`)
- 10 tabelas: students, teachers, enrollments, lessons, attendance, tuitions, payments, expenses, investments, teacher_payments
- 409 linhas de schema
- ✅ Schema aplicado e sincronizado

### 2.2 O que está documentado mas não implementado ❌

| Item | Documentado em | Status |
|------|---------------|--------|
| Relatórios Financeiros (Etapa 40) | ROADMAP, novo_registro | ✅ Concluído (Etapa 57) |
| Rotina automática de geração mensal de tuitions | novo_registro (Etapa 61) | ✅ Concluído |
| Rotina automática de geração mensal de teacher_payments | novo_registro (pendências) | ⏳ Não iniciado |
| Portal do Professor (V2.0) | ROADMAP | ⏳ Futuro |
| Portal do Aluno (V2.0) | ROADMAP | ⏳ Futuro |
| Configurações (usuários, permissões) | ROADMAP, modules.md | ⏳ Futuro |
| Testes funcionais ponta a ponta pós-deploy | novo_registro (pendências) | ⚠️ Pendente |

---

## 3. Pontos de Dor Identificados (do usuário)

### 3.1 🔴 Agenda — "está muito ruim"

**Problema:** A visão semanal recém-implementada não atende à necessidade real.

**O que o usuário quer:**
- **Visão mensal como tela principal** (calendário tipo Google Calendar)
- Ver o **panorama do mês inteiro** de uma só vez
- Dias com aula devem mostrar **nome do aluno + horário** visíveis no calendário
- Poder **clicar em um dia** para ver os detalhes (lista de aulas)
- "Semanal assim não adianta" — a visão semanal isolada não é útil

**O que NÃO precisa (segundo usuário):**
- Não precisa de criação de aula ao clicar no dia (só ver)
- Não precisa de ações complexas no calendário

### 3.2 🟡 Financeiro — "mensalidade do aluno está uma merda"

**Problema:** Criar mensalidade a partir do vínculo (enrollment) é confuso e manual.

**Detalhes:**
- Hoje o fluxo é: criar vínculo → depois ir em Mensalidades → criar mensalidade manualmente selecionando o vínculo
- O usuário quer que **criar o vínculo já gere a mensalidade do mês atual automaticamente**
- **Não** precisa de botão "Gerar todas" — só a geração automática no momento da criação do vínculo

### 3.3 🟢 Alunos — cadastro básico incompleto

**Problema:** Cadastro de alunos tem só campos mínimos (nome, email, telefone).

**Campos necessários (confirmados pelo usuário):**
- Nome
- E-mail
- Telefone
- Endereço
- Instrumento(s)
- **Responsável** (nome e telefone) — NOVO

---

## 4. Especificação das Melhorias

---

### 4.1 🔴 PRIORIDADE 1 — Agenda Mensal

#### 4.1.1 Objetivo
Substituir a visão semanal atual por uma **visão mensal** no estilo Google Calendar, acessível pela aba "📅 Agenda" na navegação principal.

#### 4.1.2 Funcionalidades

| Funcionalidade | Descrição |
|---------------|-----------|
| **M1. Grade Mensal** | Grid 7xN (dias da semana x semanas do mês), com cabeçalho Seg-Sex (ou Dom-Sáb) e numeração dos dias |
| **M2. Navegação** | Botões ◀ ▶ para navegar entre meses + botão "Hoje" para voltar ao mês atual |
| **M3. Indicadores** | Dias com aula mostram **nome do aluno + horário** visíveis no calendário (cards compactos dentro da célula do dia) |
| **M4. Clique no dia** | Ao clicar em um dia, abre modal ou expande detalhes com lista completa de aulas daquele dia |
| **M5. Resumo** | Contador de aulas agendadas/realizadas no topo (já existe, adaptar para o mês) |

#### 4.1.3 Layout (conceitual)

```
┌──────────────────────────────────────────────────────────────┐
│  ◀  Janeiro 2026  ▶  [Hoje]                                 │
│  Total: 45 aulas  📌 Agendadas: 38  ✅ Realizadas: 7         │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│ Dom  │ Seg  │ Ter  │ Qua  │ Qui  │ Sex  │ Sáb  │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  29  │  30  │  31  │  1   │  2   │  3   │  4   │
│      │      │      │João  │      │Maria │      │
│      │      │      │14:00 │      │10:00 │      │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  5   │  6   │  7   │  8   │  9   │  10  │  11  │
│      │Ana   │      │Pedro │      │      │      │
│      │09:00 │      │15:30 │      │      │      │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
```

#### 4.1.4 Limitações de espaço
- Dias com **muitas aulas** (ex: 6+), mostrar apenas as primeiras 3-4 + "e mais X aulas"
- Nomes de alunos truncados com ellipsis se necessário
- Em mobile, a grade pode quebrar para lista vertical

#### 4.1.5 Integração com API
- **Nenhuma API nova necessária**
- Reusa `resource=lessons` com parâmetros `date_from` e `date_to` (primeiro/ditimo dia do mês)
- Já implementado em `loadWeekAgenda()`, só adaptar para mês

#### 4.1.6 Mudanças técnicas estimadas
| Arquivo | O que muda |
|---------|-----------|
| `painel-x9k2f.html` | Substituir `loadWeekAgenda`/`renderWeekAgenda` por `loadMonthAgenda`/`renderMonthAgenda` (~100 linhas) |
| `painel-x9k2f.html` | CSS: substituir `.agenda-grid` (7 colunas) por grid mensal responsiva |
| `painel-x9k2f.html` | Manter event listeners de navegação, só adaptar de semana para mês |

#### 4.1.7 Critérios de aceite
- [ ] Grade mensal exibe corretamente os dias do mês
- [ ] Dias com aula mostram nome do aluno + horário
- [ ] Navegação entre meses (◀ ▶) funciona
- [ ] Botão "Hoje" volta ao mês atual
- [ ] Ao clicar em um dia, abre detalhes com aulas daquele dia
- [ ] Dados vêm corretamente da API (mesmo endpoint, filtro por mês)
- [ ] Responsivo: em mobile vira lista vertical
- [ ] Zero erros no console

---

### 4.2 🟡 PRIORIDADE 2 — Mensalidades Automáticas

#### 4.2.1 Objetivo
Eliminar o passo manual de criar mensalidade separadamente. Ao criar/confirmar um vínculo (enrollment), o sistema deve **gerar automaticamente** a tuition do mês de referência atual.

#### 4.2.2 Fluxo atual (problema)
```
Criar Vínculo (enrollment) → Ir em Mensalidades → Clicar "Nova Mensalidade" 
→ Selecionar aluno → Selecionar vínculo → Preencher data → Salvar
```
❌ Muitos passos, fácil errar

#### 4.2.3 Fluxo desejado
```
Criar Vínculo (enrollment) → Salvar → ✅ Mensalidade gerada automaticamente
```
✅ Um passo a menos, sem chance de esquecer

#### 4.2.4 Regras de negócio

| Regra | Detalhe |
|-------|---------|
| **R1** | Ao criar enrollment com `status='active'`, gerar uma tuition para o mês/ano corrente |
| **R2** | Valor da tuition = `enrollment.monthly_fee` |
| **R3** | `due_date` = último dia do mês corrente (ou configurável futuramente) |
| **R4** | `reference_month` = mês/ano corrente (YYYY-MM) |
| **R5** | Se enrollment for criado com `status='inactive'`, NÃO gerar tuition |
| **R6** | Se já existir uma tuition para o mesmo enrollment + mesmo reference_month, NÃO duplicar (idempotente) |
| **R7** | **Onde implementar:** no backend (`handleEnrollments` no `admin-financial.js`), após criar o enrollment com sucesso |

#### 4.2.5 Mudanças técnicas

| Arquivo | O que muda |
|---------|-----------|
| `api/admin-financial.js` | `handleEnrollments`: após INSERT de enrollment, chamar lógica de criação de tuition |
| `painel-x9k2f.html` | Adicionar feedback visual: toast "Vínculo criado! Mensalidade gerada." |
| Nenhuma mudança de schema | Regra R6 já coberta por unique constraint ou verificação |

#### 4.2.6 Detalhe da implementação (back-end)

```javascript
// Pseudocódigo — dentro de handleEnrollments, método POST
if (enrollment.status === 'active') {
  const refMonth = new Date().toISOString().slice(0, 7); // "2026-07"
  // Verificar se já existe tuition para este enrollment + reference_month
  const { data: existing } = await supabase
    .from('tuitions')
    .select('id')
    .eq('enrollment_id', enrollment.id)
    .eq('reference_month', refMonth)
    .maybeSingle();
  if (!existing) {
    await supabase.from('tuitions').insert({
      student_id: enrollment.student_id,
      enrollment_id: enrollment.id,
      amount: enrollment.monthly_fee,
      due_date: último dia do mês,
      reference_month: refMonth,
      status: 'pending',
    });
  }
}
```

#### 4.2.7 Critérios de aceite
- [ ] Ao criar vínculo ativo, tuition é gerada automaticamente para o mês corrente
- [ ] Valor da tuition = monthly_fee do enrollment
- [ ] Não duplica se já existir tuition para o mesmo mês
- [ ] Vínculo inativo NÃO gera tuition
- [ ] Feedback visual no painel (toast)
- [ ] Mensalidade aparece imediatamente na sub-aba Mensalidades
- [ ] Testado: criar 2 vínculos para o mesmo mês → 2 tuitions independentes

---

### 4.3 🟢 PRIORIDADE 3 — Cadastro de Alunos Expandido

#### 4.3.1 Objetivo
Expandir o cadastro de alunos (modal `modal-new-student`) para incluir **responsável**, organizar melhor a visualização, e preparar para futuras melhorias (histórico, aulas, mensalidades por aluno).

#### 4.3.2 Campos atuais vs. novos

| Campo | Atual | Novo |
|-------|-------|------|
| Nome | ✅ | ✅ |
| E-mail | ✅ | ✅ |
| Telefone | ✅ | ✅ |
| Endereço | ✅ | ✅ |
| Instrumento(s) | ✅ | ✅ |
| Ativo | ✅ | ✅ |
| **Responsável (nome)** | ❌ | **➕ NOVO** |
| **Responsável (telefone)** | ❌ | **➕ NOVO** |

#### 4.3.3 Mudanças no layout do modal

```
┌──────────────────────────────────────┐
│  Novo Aluno                          │
├──────────────────────────────────────┤
│  Nome * [__________________________] │
│  E-mail  [__________________________] │
│  Telefone [__________________________] │
│  Endereço [__________________________] │
│  ─── Responsável ─────────────────── │
│  Nome do Resp. [____________________] │
│  Tel. do Resp. [____________________] │
│  ──────────────────────────────────── │
│  Instrumento(s) [____________________] │
│  ☑ Aluno ativo                       │
│  [Salvar] [Cancelar]                 │
└──────────────────────────────────────┘
```

#### 4.3.4 Mudanças no banco de dados

Tabela `students` — adicionar colunas:
```sql
ALTER TABLE students ADD COLUMN guardian_name TEXT;
ALTER TABLE students ADD COLUMN guardian_phone TEXT;
```

#### 4.3.5 Mudanças na API

`api/admin-financial.js` — `handleStudents`:
- Já usa `ON CONFLICT (id) DO UPDATE` — funciona para qualquer coluna
- **Nenhuma mudança estrutural** na API, só passar os novos campos no body
- Verificar se o INSERT/PATCH já envia todos os campos do body → se sim, zero mudanças

#### 4.3.6 Mudanças no frontend

| Arquivo | O que muda |
|---------|-----------|
| `painel-x9k2f.html` | Modal `modal-new-student`: adicionar campos guardian_name e guardian_phone |
| `painel-x9k2f.html` | `renderStudents()`: exibir responsável na tabela (se houver) |
| `painel-x9k2f.html` | `openStudentModal()`: popular campos de responsável na edição |
| `painel-x9k2f.html` | Submit do form: incluir guardian_name e guardian_phone no payload |

#### 4.3.7 Critérios de aceite
- [ ] Modal de aluno tem campos de responsável (nome + telefone)
- [ ] Ao salvar, dados vão para o Supabase
- [ ] Ao editar, campos de responsável são carregados
- [ ] Tabela de alunos mostra responsável quando preenchido
- [ ] Responsável não é obrigatório (pode ficar vazio)
- [ ] Migração SQL aplicada sem erros (colunas novas)

---

## 5. Considerações Técnicas

### 5.1 Arquitetura
- Todas as mudanças são **frontend + API** — sem novas tabelas no banco (exceto colunas novas em students)
- Nenhuma nova dependência externa
- Sempre priorizar o padrão existente: HTML único com CSS/JS inline, API consolidada

### 5.2 Limitações
- **Vercel Hobby**: máximo 12 Serverless Functions (já atingido). Todo novo recurso deve ir para `api/admin-financial.js`
- **Supabase Free**: sem Edge Functions. Lógica de negócio no backend ou no banco (via função SQL, se necessário)
- **Painel em HTML único**: ~4150 linhas. Manter organização por seções (tabs, sub-abas, funções JS, event listeners)

### 5.3 Ordem de implementação sugerida
1. Banco: adicionar colunas guardian_name/guardian_phone em students
2. API: geração automática de tuition ao criar enrollment
3. Frontend: Alunos expandido (modal + listagem)
4. Frontend: Agenda Mensal (substituir visão semanal)
5. Remover código morto (visão semanal antiga, se aplicável)

### 5.4 Testes
- **Sempre**: `node --check` no JS, `npm run build`, verificar console do navegador
- **Financeiro**: testar fluxo completo: criar vínculo → ver tuition gerada → Mensalidades
- **Alunos**: criar/editar aluno com responsável, confirmar no Supabase
- **Agenda**: navegar meses, verificar dados corretos, clicar em dia

---

## 6. Perguntas em Aberto (para futuras iterações)

1. **Teacher payments automáticos:** Devem ser gerados junto com as mensalidades? (Regra de negócio: teacher_payment = enrollment.teacher.rate_per_class × aulas do mês)
2. **Relatórios Financeiros (Etapa 40):** Qual o formato? Fechamento mensal? Por aluno? Por professor?
3. **Dashboard:** Disse que "está ok", mas quais melhorias futuras seriam bem-vindas? (gráficos? mais KPIs?)
4. **Turmas (Etapa 42):** Ainda faz sentido como módulo separado ou a Agenda + Vínculos já cobre?
5. **Exclusão de vínculo:** Se um vínculo for excluído, as mensalidades geradas automaticamente devem ser canceladas também?

---

## 7. Referências

| Documento | Conteúdo |
|-----------|----------|
| `docs/ROADMAP.MD` | Roadmap completo do projeto |
| `docs/BUSINESS_RULES.md` | Regras de negócio |
| `docs/modules.md` | Descrição dos módulos |
| `docs/database.md` | Schema e relacionamentos |
| `docs/ARCHITECTURE.MD` | Arquitetura do sistema |
| `novo_registro.md` | Histórico completo de desenvolvimento do painel (Etapas 44-63) — versão condensada |
| `loja_registro.md` | Histórico da Loja |
| `TODO.md` / `TODO_PROGRESS.md` | Listas de tarefas pendentes |
| `supabase/financial-schema.sql` | Schema financeiro atual |
| `api/admin-financial.js` | API consolidada (1067 linhas, 12 recursos) |
| `painel-x9k2f.html` | Frontend do painel (~4150 linhas) |
