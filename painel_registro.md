# ================================================================
# PAINEL ADMINISTRATIVO - REGISTRO DE DESENVOLVIMENTO
# Escola Bruna Mandz
# ================================================================

**Documento:** painel_registro.md

**Objetivo:** Registrar toda a evolução técnica e funcional do Painel Administrativo.

**Status:** Em desenvolvimento

**Última atualização:** DD/MM/AAAA

**Versão do documento:** 1.0

---

# =====================================================================
# ATENÇÃO - LEITURA OBRIGATÓRIA PARA QUALQUER AGENTE
# =====================================================================

Este documento é o REGISTRO OFICIAL do desenvolvimento do Painel Administrativo.

Antes de qualquer alteração no projeto:

1. Leia este documento completamente.
2. Verifique a última etapa registrada.
3. Identifique o que já foi implementado.
4. Verifique as pendências existentes.
5. Continue o desenvolvimento a partir da última etapa.

=====================================================================

## REGRA MAIS IMPORTANTE DESTE PROJETO

Toda implementação realizada DEVE ser registrada neste documento.

SEM EXCEÇÕES.

Se uma implementação não estiver registrada aqui, ela será considerada INCOMPLETA.

Documentar faz parte da implementação.

=====================================================================

## AO FINAL DE CADA IMPLEMENTAÇÃO O AGENTE DEVE

1. Criar uma NOVA ETAPA no FINAL deste documento.

2. Nunca alterar etapas antigas.

3. Nunca apagar registros antigos.

4. Nunca inserir registros entre etapas.

5. Sempre adicionar abaixo da ÚLTIMA ETAPA registrada.

6. Atualizar o Roadmap, caso alguma etapa tenha sido concluída.

7. Atualizar o Estado do Projeto, quando necessário.

8. Registrar:

- Data
- Horário
- Agente
- Commit
- Objetivo
- Implementações
- Arquivos alterados
- Banco de Dados
- Testes
- Pendências
- Próxima Etapa

=====================================================================

## EXEMPLO

Última etapa registrada:

ETAPA 36

↓

O agente implementou uma melhoria.

↓

Ele NÃO edita a Etapa 36.

↓

Ele cria:

ETAPA 37

↓

No FINAL deste documento.

Sempre.

# Objetivo deste Documento

Este documento possui como finalidade:

- Registrar toda evolução do Painel Administrativo.
- Documentar decisões técnicas.
- Registrar alterações de banco de dados.
- Registrar alterações na arquitetura.
- Registrar implementações realizadas.
- Registrar pendências.
- Facilitar a continuidade do projeto por qualquer agente.

Toda implementação relevante deverá ser registrada aqui.

---

# Regra Principal

**Nenhuma implementação é considerada concluída sem estar registrada neste documento.**

Sempre que houver alterações relevantes, atualizar este arquivo.

Nunca apagar registros antigos.

Sempre adicionar novos registros ao final do documento.

---

# Como Registrar uma Implementação

Toda implementação deverá possuir obrigatoriamente:

- Data
- Horário
- Agente responsável
- Etapa correspondente
- Objetivo
- Implementações realizadas
- Arquivos alterados
- Alterações no banco (quando houver)
- Status dos testes
- Pendências
- Próxima etapa planejada

Sempre utilizar o modelo padrão descrito neste documento.

---

# Regras Gerais

Antes de implementar qualquer funcionalidade:

- Ler este documento.
- Verificar a última etapa registrada.
- Verificar pendências.
- Evitar funcionalidades duplicadas.
- Respeitar decisões arquiteturais anteriores.

Caso seja necessário alterar uma funcionalidade existente:

- Registrar o motivo.
- Registrar o impacto.
- Registrar quais arquivos foram modificados.

Nunca remover histórico.

Nunca sobrescrever registros antigos.

---

# Sobre o Painel Administrativo

O Painel Administrativo é o sistema responsável pelo gerenciamento interno da Escola Bruna Mandz.

Seu objetivo é fornecer uma interface simples, rápida e intuitiva para utilização diária pela secretaria e administração da escola.

O Painel não possui objetivo de substituir sistemas contábeis ou ERPs completos.

Sempre priorizar:

- Simplicidade.
- Organização.
- Facilidade de uso.
- Poucos cliques.
- Rapidez.
- Código limpo.
- Componentes reutilizáveis.

---

# Filosofia do Projeto

Sempre desenvolver pensando na operação diária da escola.

Ao implementar qualquer funcionalidade, considerar:

- Facilidade de aprendizado.
- Baixo tempo de operação.
- Interface limpa.
- Poucas telas.
- Poucos cliques.
- Informações objetivas.

Evitar funcionalidades complexas quando uma solução simples atender à necessidade.

Sempre priorizar manutenção futura e reutilização de código.

---

# Tecnologias Utilizadas

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

---

## Backend

- Supabase
- PostgreSQL
- Edge Functions (quando necessário)

---

## Infraestrutura

- Vercel
- GitHub
- GitHub Actions

---

# Limitações Conhecidas

## Vercel

O projeto está hospedado na Vercel.

Considerar sempre:

- Ambiente Serverless.
- Evitar processos longos.
- Não depender de armazenamento local.
- Evitar tarefas pesadas durante requisições.

---

## Supabase

Toda alteração estrutural deverá ser realizada preferencialmente através de Migrations.

Sempre preservar:

- Integridade dos dados.
- Relacionamentos.
- RLS (quando aplicável).
- Compatibilidade com versões anteriores.

Evitar alterações manuais diretamente no banco de dados.

---

# Estrutura Geral do Painel

Painel Administrativo

- Dashboard
- Loja
- Financeiro
- Alunos
- Turmas
- Agenda
- Relatórios
- Configurações

Cada módulo deverá possuir documentação própria neste arquivo conforme sua evolução.

---

# Estado Atual do Projeto

| Módulo | Status |
|---------|--------|
| Dashboard | ✅ Estável |
| Loja | ✅ Estável |
| Financeiro | 🔄 Em desenvolvimento |
| Alunos | ⏳ Planejado |
| Turmas | ⏳ Planejado |
| Agenda | ⏳ Planejado |
| Relatórios | ⏳ Planejado |
| Configurações | 🔄 Em evolução |

---

# Organização das Etapas

Cada implementação deverá ser registrada em ordem cronológica.

Nunca alterar etapas anteriores.

Sempre criar uma nova etapa contendo:

- O que foi feito.
- Como foi feito.
- O motivo da implementação.
- O resultado obtido.
- Pendências encontradas.
- Próximas melhorias previstas.

O histórico deste documento representa a evolução oficial do Painel Administrativo.

# Estrutura Técnica do Painel

O Painel Administrativo é dividido em módulos independentes, cada um responsável por uma área específica do sistema.

O objetivo é manter baixo acoplamento entre os módulos, facilitando manutenção, testes e futuras expansões.

Sempre priorizar:

- Reutilização de componentes;
- Reutilização de hooks;
- Reutilização de funções utilitárias;
- Padronização visual;
- Código limpo e organizado.

Evitar componentes excessivamente grandes ou com múltiplas responsabilidades.

---

# Estrutura dos Módulos

## Dashboard

Responsável por apresentar informações gerais do sistema.

Principais objetivos:

- Indicadores rápidos;
- Acessos rápidos;
- Alertas;
- Informações resumidas.

---

## Loja

Responsável pelo gerenciamento da Loja Oficial.

Inclui:

- Produtos;
- Categorias;
- Pedidos;
- Clientes;
- Estoque;
- Relatórios.

Toda evolução deste módulo continua sendo registrada em **loja_registro.md**.

Este documento registrará apenas alterações que impactem diretamente o Painel Administrativo.

---

## Financeiro

Responsável pelo gerenciamento financeiro da escola.

Escopo inicial:

- Dashboard Financeiro;
- Mensalidades;
- Recebimentos;
- Despesas;
- Fluxo de Caixa;
- Relatórios.

O módulo será desenvolvido por etapas, sempre priorizando simplicidade e facilidade de uso.

---

## Alunos

Responsável pelo cadastro e gerenciamento dos alunos.

Planejamento inicial:

- Cadastro;
- Dados pessoais;
- Responsáveis;
- Histórico;
- Situação;
- Informações financeiras.

---

## Turmas

Responsável pela organização das turmas.

Planejamento:

- Cadastro;
- Professores;
- Horários;
- Lista de alunos.

---

## Agenda

Módulo planejado para organização das atividades da escola.

Objetivos:

- Calendário;
- Eventos;
- Avisos;
- Aulas especiais.

---

## Relatórios

Centralizará todas as exportações do sistema.

Sempre priorizar:

- PDF;
- CSV;
- Impressão.

---

## Configurações

Responsável pelas configurações gerais do sistema.

Inclui:

- Usuários;
- Permissões;
- Preferências;
- Configurações internas.

---

# Organização do Projeto

Estrutura recomendada:

```text
src/

components/
pages/
hooks/
services/
contexts/
types/
utils/
assets/
```

Cada módulo deverá possuir organização própria.

Sempre dividir responsabilidades.

Evitar arquivos excessivamente grandes.

---

# Organização do Banco de Dados

As tabelas deverão permanecer organizadas por domínio.

Exemplos:

Financeiro

- financial_students
- financial_payments
- financial_expenses
- financial_categories

Loja

- products
- orders
- order_items

Sistema

- users
- profiles
- audit_logs

Sempre evitar tabelas genéricas.

Cada tabela deverá possuir apenas uma responsabilidade.

---

# Convenções de Desenvolvimento

## Banco de Dados

Utilizar sempre:

- nomes em inglês;
- snake_case;
- created_at;
- updated_at.

Exemplo:

student_id

created_at

payment_date

---

## React

Componentes:

PascalCase

Exemplo:

FinancialDashboard.tsx

Hooks:

Sempre iniciar com **use**

Exemplo:

useFinancial.ts

Funções:

camelCase

Exemplo:

calculateBalance()

---

## Commits

Sempre utilizar mensagens objetivas.

Exemplos:

feat: adiciona módulo financeiro

fix: corrige cálculo do saldo

refactor: reorganiza componentes

docs: atualiza painel_registro

---

## Branches

Utilizar nomes descritivos.

Exemplos:

feature/financeiro

feature/alunos

feature/dashboard

fix/login

refactor/orders

---

# Segurança

Sempre considerar:

- autenticação;
- autorização;
- validação dos dados;
- tratamento de erros;
- RLS no Supabase;
- proteção contra exclusões acidentais.

Nunca confiar apenas na validação do Frontend.

---

# Decisões Arquiteturais

Toda decisão importante deverá ser registrada.

Modelo:

Data

Decisão

Motivo

Impacto

Exemplo

Data

07/07/2026

Decisão

Criar módulo Financeiro separado da Loja.

Motivo

Separação das responsabilidades.

Impacto

Maior organização e facilidade de manutenção.

---

Data

07/07/2026

Decisão

Criar tabela `enrollments` como dona do domínio pedagógico (aluno + professor + instrumento + dia/horário + valor mensal), separada de `tuitions` (cobrança financeira mensal).

Motivo

`tuitions` estava carregando dado pedagógico (`teacher_id`, `instrument`, `duration_minutes`, `classes_per_week`) que também seria necessário pelos módulos Turmas e Agenda, ainda não implementados. Isso geraria duplicação de dado entre módulos.

Impacto

Como o modelo do negócio é 1 aula por semana por aluno, `enrollments` sozinha cobre tanto Turmas quanto Agenda na versão básica — a agenda passa a ser uma consulta sobre `enrollments` agrupada por `day_of_week`, sem tabela de calendário própria nesta fase. Ver Etapa 37 para detalhes completos.

---

# Roadmap do Painel

| Etapa | Descrição | Status |
|--------|-----------|--------|
| 33 | Estrutura do Financeiro | ✅ |
| 34 | Cadastro Financeiro | ✅ |
| 35 | Mensalidades | ✅ |
| 36 | Fluxo de Caixa | ✅ |
| 37 | Separação Pedagógico x Financeiro (enrollments) | ✅ |
| 38 | Relatórios | ⏳ |
| 39 | Alunos | ⏳ |
| 40 | Turmas | ⏳ |
| 41 | Agenda | ⏳ |

---

# Próximas Implementações

Ao concluir cada etapa, atualizar:

- Estado do sistema;
- Roadmap;
- Pendências;
- Próxima etapa.

Sempre manter este documento atualizado para garantir continuidade do projeto entre diferentes agentes.


# MODELO OFICIAL DE REGISTRO

Toda implementação realizada no Painel Administrativo deverá seguir este modelo.

---

# ETAPA XX

**Data:** DD/MM/AAAA

**Horário:** 00:00

**Agente Responsável:**
Ex.: ChatGPT GPT-5.5, Codex, Claude, Gemini ou Desenvolvedor.

**Commit Git:**
Hash do commit ou informar **Pendente**.

---

## Objetivo

Descrever resumidamente o objetivo da implementação.

---

## Implementações Realizadas

Descrever todas as alterações executadas.

Exemplo:

- Nova tela criada;
- Novo componente;
- Nova funcionalidade;
- Correções;
- Refatorações;
- Melhorias de desempenho.

---

## Arquivos Alterados

Relacionar apenas os principais arquivos alterados.

Exemplo:

- src/pages/Financeiro.tsx
- src/components/FinancialCard.tsx
- src/hooks/useFinancial.ts
- supabase/migrations/xxxx_financial.sql

---

## Alterações no Banco

Informar qualquer alteração realizada.

Exemplo:

- Nova tabela;
- Nova migration;
- Nova Policy;
- Novo índice;
- Alteração de relacionamento.

Caso não exista alteração:

**Nenhuma alteração no banco.**

---

## Testes

Informar obrigatoriamente.

Exemplos:

✅ Testado manualmente.

✅ Testado em ambiente de desenvolvimento.

⚠ Testado parcialmente.

⚠ Não testado.

---

## Pendências

Registrar tudo que ainda precisa ser feito relacionado à etapa.

Nunca apagar pendências antigas.

Quando forem resolvidas, registrar em uma nova etapa.

---

## Próxima Etapa

Informar claramente qual será a próxima implementação prevista.

---

# HISTÓRICO DE DESENVOLVIMENTO

A partir deste ponto inicia-se o histórico oficial do Painel Administrativo.

Todos os novos registros deverão ser adicionados abaixo, mantendo sempre a ordem cronológica.

Nunca apagar registros antigos.

Nunca alterar etapas anteriores sem registrar o motivo.

---

# ETAPA 33 — CRIAÇÃO DO PAINEL ADMINISTRATIVO

**Data:** 07/07/2026

**Horário:** Planejamento

**Agente Responsável:** ChatGPT GPT-5.5

**Commit Git:** Não realizado.

---

## Objetivo

Criar oficialmente a documentação exclusiva do Painel Administrativo e iniciar o planejamento do módulo Financeiro.

---

## Implementações Realizadas

- Criação do documento `painel_registro.md`;
- Definição das regras de documentação;
- Definição da arquitetura inicial do Painel Administrativo;
- Separação da documentação da Loja e do Painel;
- Planejamento inicial do módulo Financeiro;
- Definição do padrão para futuras etapas.

---

## Arquivos Alterados

- painel_registro.md

---

## Alterações no Banco

Nenhuma.

Etapa destinada apenas ao planejamento e documentação.

---

## Testes

Não aplicável.

---

## Pendências

- Criar menu Financeiro;
- Criar estrutura inicial das páginas;
- Criar tabelas financeiras;
- Criar migrations;
- Criar Policies (RLS);
- Desenvolver Dashboard Financeiro;
- Desenvolver Cadastro Financeiro;
- Desenvolver Mensalidades;
- Desenvolver Despesas;
- Desenvolver Fluxo de Caixa.

---

## Próxima Etapa

Implementar a estrutura inicial do módulo Financeiro.

---

# ETAPA 34 — ESTRUTURA DO FINANCEIRO

**Data:** 07/07/2026

**Horário:** 14:35

**Agente Responsável:** Cascade SWE-1.6

**Commit Git:** Pendente

---

## Objetivo

Verificar e documentar o estado atual do módulo Financeiro do Painel Administrativo, garantindo que o schema, API e interface estejam funcionais.

---

## Implementações Realizadas

- Aplicação do schema financeiro completo no Supabase (migration ad-hoc)
- Verificação de todas as tabelas financeiras (students, teachers, tuitions, payments, expenses, investments)
- Confirmação de que a API `admin-financial.js` está completa e funcional
- Verificação da interface do painel financeiro em `painel-x9k2f.html`
- Identificação de pendências e funcionalidades faltantes

---

## Arquivos Alterados

- `supabase/financial-schema.sql` (aplicado via migration ad-hoc)
- `painel_registro.md` (este registro)

---

## Alterações no Banco

**Migration aplicada:**
- Criação da tabela `teachers` com campos: id, name, phone, specialty, days_of_week, created_at, updated_at
- Adição de colunas em `tuitions`: teacher_id, instrument, duration_minutes, classes_per_week
- Adição de coluna `expense_type` em `expenses`
- Criação de índices: teachers_name_idx, tuitions_teacher_id_idx, expenses_type_idx
- Habilitação de RLS na tabela teachers
- Criação de trigger `teachers_set_updated_at`

**Tabelas financeiras existentes:**
- students (1 registro)
- teachers (0 registros)
- tuitions (0 registros)
- payments (0 registros)
- expenses (0 registros)
- investments (0 registros)

---

## Testes

✅ Schema financeiro aplicado com sucesso no Supabase
✅ Todas as tabelas criadas com estrutura correta
✅ RLS habilitado em todas as tabelas
✅ Índices criados para performance
⚠ API não testada localmente (requer ambiente Vercel)
✅ Interface do painel verificada (código analisado)

---

## Pendências

- **Falta interface para gerenciar Professores (teachers)** - API existe em `admin-financial.js` mas não há UI no painel
- Não há sub-tab específica para Professores no módulo financeiro
- Campos pedagógicos das mensalidades (teacher_id, instrument, duration_minutes, classes_per_week) existem no banco mas não são usados na UI do modal de mensalidades
- Testes funcionais da API em ambiente de produção necessários
- Testes de usabilidade do painel financeiro necessários

---

## Próxima Etapa

Implementar a interface para gerenciar Professores no painel financeiro, incluindo:
- Nova sub-tab "Professores" no módulo financeiro
- Modal de cadastro/edição de professores
- Integração dos campos pedagógicos no modal de mensalidades (seleção de professor, instrument, duração, frequência)

---

# ETAPA 35 — INTERFACE DE PROFESSORES

**Data:** 07/07/2026

**Horário:** 14:45

**Agente Responsável:** Cascade SWE-1.6

**Commit Git:** 1d1c0de

---

## Objetivo

Criar interface completa para gerenciar professores no painel financeiro, permitindo cadastro, edição e exclusão de professores com seus dados de atendimento.

---

## Implementações Realizadas

- Adicionada sub-tab "👨‍🏫 Professores" nas sub-nav-tabs do módulo financeiro
- Criada div `subtab-teachers` com toolbar de busca e botão de novo professor
- Implementada função `loadTeachers()` para buscar professores via API `/api/admin-financial?resource=teachers`
- Implementada função `renderTeachers()` para exibir tabela com nome, telefone, especialidade e dias de atendimento
- Criado modal `modal-new-teacher` com campos:
  - Nome (obrigatório)
  - Telefone
  - Especialidade
  - Dias de atendimento (checkboxes: Seg, Ter, Qua, Qui, Sex, Sáb, Dom)
- Implementadas funções `openTeacherModal()` e `closeTeacherModal()` para controle do modal
- Adicionados eventos para criar, editar e excluir professores
- Integrado com `loadFinancialData()` para carregar ao entrar na sub-tab
- Adicionada variável `_allTeachers` para armazenar professores em memória
- Adicionado modal à lista de modais que fecham ao clicar fora

---

## Arquivos Alterados

- `painel-x9k2f.html` (sub-tab, modal, funções JS, eventos)

---

## Detalhes Técnicos

**API utilizada:** `/api/admin-financial?resource=teachers`
- GET: lista todos os professores
- POST: cria novo professor
- PATCH: atualiza professor
- DELETE: remove professor

**Dias da semana:** Array de strings ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] armazenado como JSON no banco

**Busca:** Filtro por nome, telefone ou especialidade em tempo real

---

## Testes

✅ Sub-tab de professores criada e funcional
✅ Modal de cadastro/edição implementado
✅ CRUD de professores integrado com API existente
⚠ Testes funcionais necessários em ambiente de produção

---

# ETAPA 36 — INTEGRAÇÃO PEDAGÓGICA NAS MENSALIDADES

**Data:** 07/07/2026

**Horário:** 14:52

**Agente Responsável:** Cascade SWE-1.6

**Commit Git:** 1d1c0de

---

## Objetivo

Integrar campos pedagógicos ao módulo de mensalidades, permitindo vincular professores, instrumentos e configurações de aulas às mensalidades.

---

## Implementações Realizadas

- Atualizado modal `modal-new-tuition` com seção "Dados Pedagógicos":
  - Professor (select populado com professores ativos)
  - Instrumento (text)
  - Duração (number, padrão 60 minutos)
  - Aulas por semana (number, padrão 1)
- Modificada função `populateStudentSelects()` para também buscar e popular professores no select
- Atualizado submit do formulário de mensalidades para incluir campos pedagógicos no payload
- Atualizada renderização da tabela de mensalidades para exibir:
  - Professor vinculado (com ícone 👨‍🏫)
  - Instrumento (com ícone 🎸)
- Adicionado filtro por professor na toolbar de mensalidades
- Implementado filtro dinâmico de professores baseado nas mensalidades carregadas
- Adicionado evento de change no filtro de professor para filtrar a tabela

---

## Arquivos Alterados

- `painel-x9k2f.html` (modal de mensalidades, funções JS, filtros)

---

## Detalhes Técnicos

**Campos pedagógicos no banco (já existiam):**
- `tuitions.teacher_id` (FK para teachers)
- `tuitions.instrument` (text)
- `tuitions.duration_minutes` (integer, padrão 60)
- `tuitions.classes_per_week` (integer, padrão 1)

**População do select de professores:** Busca via API e exibe nome + especialidade (ex: "João Silva (Piano)")

**Filtro por professor:** Filtra mensalidades localmente sem recarregar da API

---

## Testes

✅ Campos pedagógicos adicionados ao modal de mensalidades
✅ Select de professores populado corretamente
✅ Tabela de mensalidades exibe professor e instrumento
✅ Filtro por professor funcional
⚠ Testes funcionais necessários em ambiente de produção

---

## Pendências

- Testes funcionais em ambiente de produção
- Validação de campos pedagógicos
- Possível edição de mensalidades para atualizar campos pedagógicos

---

## Próxima Etapa

Testes funcionais do módulo financeiro em ambiente de produção e desenvolvimento de relatórios financeiros.

---

# ETAPA 37 — SEPARAÇÃO PEDAGÓGICO x FINANCEIRO (enrollments)

**Data:** 07/07/2026

**Horário:** [preencher — horário real em que a migration foi executada no Supabase]

**Agente Responsável:** Claude

**Commit Git:** Pendente

---

## Objetivo

Separar o vínculo pedagógico (aluno + professor + instrumento + dia/horário + valor mensal) do registro de cobrança mensal, corrigindo a mistura de responsabilidades identificada entre os módulos Financeiro, Alunos e Turmas. Preparar o schema para suportar Agenda (Etapa 41) sem tabela adicional, e adicionar remuneração de professores.

---

## Decisão Arquitetural Registrada

**Decisão:** Criar tabela `enrollments` como dona do domínio pedagógico. `tuitions` deixa de conter `teacher_id`, `instrument`, `duration_minutes`, `classes_per_week` e passa a representar apenas a cobrança mensal, referenciando `enrollment_id`.

**Motivo:** `tuitions` (objeto financeiro) estava carregando dado pedagógico que também seria necessário pelos módulos Turmas e Agenda, ainda não implementados. Isso geraria duplicação de dado ou necessidade de sincronização manual entre módulos quando fossem construídos.

**Impacto:** Como o modelo do negócio é 1 aula por semana por aluno, `enrollments` sozinha cobre tanto "Turmas" quanto "Agenda" na versão básica — a agenda é uma consulta sobre `enrollments` agrupada por `day_of_week`, sem necessidade de tabela de calendário própria nesta fase.

---

## Implementações Realizadas

- Criação da tabela `enrollments` (student_id, teacher_id, instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, status, notes)
- Adição da coluna `rate_per_class` em `teachers` (quanto o professor cobra por aula)
- Adição das colunas `enrollment_id` e `reference_month` em `tuitions`
- Remoção das colunas `teacher_id`, `instrument`, `duration_minutes`, `classes_per_week` de `tuitions` (migradas para `enrollments`)
- Backfill defensivo: qualquer `tuitions` pré-existente com dado pedagógico preenchido gerou um `enrollments` correspondente antes da remoção das colunas (nenhum registro afetado nesta execução — `tuitions` estava com 0 linhas no momento do planejamento)
- Criação da tabela `teacher_payments` (teacher_id, reference_month, amount, paid, paid_at)
- Criação de índices em `enrollments`, `tuitions.enrollment_id`, `tuitions.reference_month` e `teacher_payments`
- Habilitação de RLS em `enrollments` e `teacher_payments`
- **Migration executada no Supabase (SQL Editor).**

---

## Arquivos Alterados

- `supabase/migrations/037_enrollments_e_pagamentos_professores.sql` (novo)
- `painel_registro.md` (este registro)

---

## Alterações no Banco

**Novas tabelas:** `enrollments`, `teacher_payments`

**Tabelas alteradas:**
- `teachers`: + coluna `rate_per_class`
- `tuitions`: + colunas `enrollment_id`, `reference_month`; − colunas `teacher_id`, `instrument`, `duration_minutes`, `classes_per_week`

**Triggers criados:** `enrollments_set_updated_at`, `teacher_payments_set_updated_at`

**RLS:** habilitado em `enrollments` e `teacher_payments`. **Policies ainda não criadas** — pendência abaixo.

---

## Testes

✅ Migration executada no Supabase.
⚠ Não testado via API (`admin-financial.js` ainda não foi atualizado para os novos resources).
⚠ Não testado na UI do painel (`painel-x9k2f.html` ainda referencia os campos antigos de `tuitions`).

---

## Pendências

- **Criar Policies de RLS para `enrollments` e `teacher_payments`** — o schema original não define policies explícitas para as tabelas existentes, apenas habilita RLS; confirmar qual é o padrão de policy usado hoje (provavelmente baseado em role de admin autenticado) e replicar
- Atualizar `admin-financial.js` para:
  - novo resource `enrollments` (CRUD)
  - novo resource `teacher_payments` (CRUD)
  - ajustar resource `tuitions` para trabalhar com `enrollment_id` + `reference_month` em vez dos campos removidos
- Atualizar UI do `painel-x9k2f.html`:
  - modal de mensalidades passa a selecionar um `enrollment` existente em vez de preencher dados pedagógicos direto
  - novo modal/tela de cadastro de `enrollments` (vínculo aluno-professor)
  - exibir `rate_per_class` no cadastro de professor
- Construir view de Agenda básica: `enrollments` ativos agrupados por `day_of_week`
- Rotina (manual ou agendada) de geração mensal de `tuitions` a partir dos `enrollments` ativos
- Rotina equivalente para gerar `teacher_payments` mensal a partir de `enrollments.teacher_id` + `teachers.rate_per_class`

---

## Próxima Etapa

Criar as Policies de RLS para `enrollments` e `teacher_payments`, e atualizar `admin-financial.js` para os novos resources antes de iniciar a UI dos módulos Alunos e Agenda.

---

# ETAPA 38 — POLICIES DE RLS + API + UI DE VÍNCULOS, AGENDA E PAGTO PROFESSORES

**Data:** 07/07/2026

**Horário:** [preencher — horário real da sessão]

**Agente Responsável:** Claude

**Commit Git:** Pendente

---

## Objetivo

Fechar as pendências deixadas pela Etapa 37 antes de avançar para os módulos Alunos e Turmas/Agenda do roadmap: decidir e documentar a política de RLS de `enrollments`/`teacher_payments`, confirmar/ajustar a API para os novos resources, sincronizar os arquivos de schema do repositório com o estado real do banco, e atualizar a UI (`painel-x9k2f.html`) que ainda referenciava o formato antigo de `tuitions` (com `teacher_id`/`instrument` diretos).

---

## Decisão Arquitetural Registrada

**Decisão:** `enrollments` e `teacher_payments` seguem exatamente o mesmo padrão de segurança já usado em `students`, `teachers`, `tuitions`, `payments`, `expenses` e `investments`: RLS habilitado, **sem** policies explícitas.

**Motivo:** Todo acesso a essas tabelas acontece exclusivamente pelo backend (`api/admin-financial.js`), que usa a `SUPABASE_SERVICE_ROLE_KEY` (bypassa RLS) e é protegido por senha de admin (`x-admin-password`). Confirmado que o frontend (`painel-x9k2f.html`) nunca instancia um client Supabase — só consome a API via `fetch`. Não existe, portanto, nenhum caminho client-side com chave anônima que precise de policy.

**Impacto:** A pendência "criar Policies de RLS" registrada na Etapa 37 está resolvida — não por criação de policies, mas pela confirmação de que o padrão arquitetural já em uso (acesso só via service role) já cobre `enrollments` e `teacher_payments` da mesma forma que cobre as demais tabelas. Isso foi documentado explicitamente nos comentários de `supabase/financial-schema.sql` e da migration, para que um agente futuro não reabra essa pendência por engano.

---

## Implementações Realizadas

- **Banco de dados:** criado `supabase/migrations/037_enrollments_e_pagamentos_professores.sql`, versão idempotente (com `IF NOT EXISTS`/`DO` blocks defensivos) da migration já aplicada manualmente no SQL Editor na Etapa 37 — agora com histórico versionado no repositório.
- **Banco de dados:** `supabase/financial-schema.sql` sincronizado com o estado real pós Etapa 37 (antes ainda descrevia `tuitions` com `teacher_id`/`instrument`/`duration_minutes`/`classes_per_week` diretos, e não tinha `enrollments` nem `teacher_payments` — schema-as-code estava desatualizado em relação à produção).
- **API (`admin-financial.js`):** conferido que `handleEnrollments`, `handleTuitions` (já usando `enrollment_id`/`reference_month`) e `handleTeacherPayments` já estavam implementados corretamente desde a Etapa 37; nenhuma mudança necessária além da revisão.
- **UI — Professores:** adicionado campo `rate_per_class` (quanto o professor recebe por aula) no modal de cadastro/edição e na listagem.
- **UI — Nova sub-aba "🔗 Vínculos":** CRUD completo de `enrollments` (aluno, professor, instrumento, dia/horário, duração, aulas/semana, mensalidade do aluno, status).
- **UI — Nova sub-aba "🗓️ Agenda":** view derivada dos vínculos ativos, agrupada por dia da semana — sem tabela nova, exatamente como decidido na Etapa 37.
- **UI — Nova sub-aba "💸 Pagto Professores":** CRUD de `teacher_payments` (professor, mês de referência, valor, status de pagamento).
- **UI — Mensalidades (correção de regressão):** o modal de nova mensalidade ainda enviava `teacher_id`/`instrument`/`duration_minutes`/`classes_per_week` soltos para a API — campos que a API já ignorava desde a Etapa 37, fazendo com que o vínculo pedagógico se perdesse silenciosamente ao criar uma mensalidade pela UI. Corrigido: o modal agora seleciona um `enrollment` existente do aluno (auto-preenchendo o valor a partir de `monthly_fee`) e envia `enrollment_id` + `reference_month`. Mantida a opção de mensalidade avulsa sem vínculo.
- **UI — Mensalidades (correção de bug):** `renderTuitions`/`loadTuitions` ainda lia `t.teachers`/`t.instrument` diretamente, mas a API já retorna esse dado aninhado em `t.enrollments.teachers`/`t.enrollments.instrument` desde a Etapa 37 — o nome do professor e o instrumento não apareciam mais na listagem. Corrigido.
- **UI — correção de bug pré-existente (não relacionado à Etapa 37):** a sub-aba "Professores" nunca era exibida ao clicar, porque a lógica de troca de sub-abas não tinha um `case` para `subtab-teachers` (só existia para students/tuitions/payments/expenses). Corrigido junto, já que a mesma lógica precisou ser estendida para as novas sub-abas.

---

## Arquivos Alterados

- `supabase/migrations/037_enrollments_e_pagamentos_professores.sql` (novo)
- `supabase/financial-schema.sql` (sincronizado com o estado real do banco)
- `painel-x9k2f.html` (UI: Vínculos, Agenda, Pagto Professores, correções em Professores e Mensalidades)
- `painel_registro.md` (este registro)

---

## Alterações no Banco

Nenhuma alteração nova de schema nesta etapa — `enrollments` e `teacher_payments` já existiam desde a Etapa 37. O que mudou foi o **registro versionado** dessas alterações (migration + schema file), que antes só existiam aplicadas diretamente no SQL Editor do Supabase.

**RLS:** decisão de não criar policies documentada acima e nos comentários SQL.

---

## Testes

⚠ **Não testado em produção/deploy.** As edições foram feitas localmente a partir do clone do repositório. Antes de considerar esta etapa concluída de fato, é necessário:
- Rodar/conferir a migration `037_enrollments_e_pagamentos_professores.sql` no SQL Editor do Supabase (idempotente — seguro mesmo já tendo enrollments/teacher_payments existentes).
- Dar deploy do `painel-x9k2f.html` atualizado na Vercel.
- Testar manualmente na UI: criar vínculo, gerar mensalidade a partir do vínculo, conferir Agenda, registrar pagamento a professor.

---

## Pendências

- Rotina (manual ou agendada) de geração mensal de `tuitions` a partir dos `enrollments` ativos — ainda não implementada, mensalidades continuam sendo criadas uma a uma pela UI.
- Rotina equivalente para gerar `teacher_payments` mensal a partir de `enrollments.teacher_id` + `teachers.rate_per_class` — hoje o valor é lançado manualmente.
- `teacher_payments` ainda não entra no cálculo de `outgoings` do resumo financeiro (`handleSummary` em `admin-financial.js`) — o saldo do mês não desconta o que é devido/pago aos professores.
- Módulo "Alunos" (cadastro estendido: responsáveis, histórico) e detalhamento de Turmas seguem no roadmap (Etapas 41/42), agora que a base de Vínculos e Agenda básica já existe.

---

## Próxima Etapa

Testes funcionais completos do Financeiro (Etapa 39, conforme roadmap já previsto) — validar o fluxo ponta a ponta (vínculo → mensalidade → pagamento → pagamento a professor → resumo) após o deploy, e então incluir `teacher_payments` no cálculo de `outgoings` do resumo financeiro.

---

# ROADMAP DO PAINEL

| Etapa | Implementação | Status |
|--------|---------------|--------|
| 33 | Documentação do Painel | ✅ |
| 34 | Estrutura do Financeiro | ✅ |
| 35 | Interface de Professores | ✅ |
| 36 | Integração Pedagógica nas Mensalidades | ✅ |
| 37 | Separação Pedagógico x Financeiro (enrollments) | ✅ |
| 38 | Policies de RLS + API + UI (Vínculos/Agenda/Pagto Professores) | ✅ (pendente teste pós-deploy) |
| 39 | teacher_payments no cálculo de outgoings do Resumo Financeiro | ✅ (pendente teste pós-deploy) |
| 40 | Relatórios Financeiros | ⏳ |
| 41 | Alunos (cadastro estendido) | ⏳ |
| 42 | Turmas / Agenda (detalhamento) | 🟡 (Agenda básica já entregue na Etapa 38) |

---

# ETAPA 39 — TEACHER_PAYMENTS NO RESUMO FINANCEIRO

**Data:** 08/07/2026

**Horário:** 02:47 (horário de Brasília)

**Agente Responsável:** Claude

**Commit Git:** Pendente

---

## Objetivo

Fechar a pendência deixada pelas Etapas 37/38: incluir `teacher_payments` no cálculo de `outgoings` do resumo financeiro (`handleSummary` em `admin-financial.js`), que até aqui só considerava `expenses` e `investments`, subestimando o quanto a escola efetivamente gasta no mês (o pagamento a professores ficava de fora do saldo).

---

## Implementações Realizadas

- **API (`admin-financial.js` — `handleSummary`):** `outgoings` passa a somar também os `teacher_payments` com `paid = true` e `paid_at` dentro do mês/ano filtrado — mesmo padrão já usado para `expenses` (campo `paid_at`, timestamptz).
- **API (`admin-financial.js` — `handleSummary`):** novo campo `pending_teacher_payments` na resposta do resumo, somando `teacher_payments` com `paid = false` cujo `reference_month` cai dentro do mês/ano filtrado — mesmo papel que `pending_tuitions` já cumpre para mensalidades, mas do lado do que a escola deve aos professores.
- **UI (`painel-x9k2f.html`):** novo card de KPI "A Pagar a Professores" na grade de KPIs do Financeiro, exibindo `pending_teacher_payments`.
- **UI (`painel-x9k2f.html` — `loadFinancialSummary`):** vínculo do novo campo `pending_teacher_payments` ao card de KPI recém-criado.

---

## Arquivos Alterados

- `api/admin-financial.js` (`handleSummary`: outgoings + novo campo `pending_teacher_payments`)
- `painel-x9k2f.html` (novo KPI card + binding em `loadFinancialSummary`)
- `painel_registro.md` (este registro)

---

## Alterações no Banco

Nenhuma. Etapa exclusivamente de API/UI, sem mudança de schema.

---

## Testes

✅ Sintaxe de `admin-financial.js` validada (`node --check`).
✅ Sintaxe do JavaScript embutido em `painel-x9k2f.html` validada (extração + `node --check`).
⚠ **Não testado em produção/deploy.** Antes de considerar esta etapa concluída de fato, é necessário:
- Dar deploy do `admin-financial.js` e do `painel-x9k2f.html` atualizados na Vercel.
- Testar manualmente: registrar um `teacher_payment` como pago dentro do mês corrente e conferir se `outgoings`/`Saldo do Mês` refletem o valor.
- Testar manualmente: registrar um `teacher_payment` pendente com `reference_month` no mês corrente e conferir o card "A Pagar a Professores".

---

## Pendências

- Rotina (manual ou agendada) de geração mensal de `tuitions` a partir dos `enrollments` ativos — ainda não implementada.
- Rotina equivalente para gerar `teacher_payments` mensal a partir de `enrollments.teacher_id` + `teachers.rate_per_class` — hoje o valor é lançado manualmente.
- Módulo "Alunos" (cadastro estendido: responsáveis, histórico) e detalhamento de Turmas seguem no roadmap (Etapas 41/42).
- Testes funcionais ponta a ponta completos (vínculo → mensalidade → pagamento → pagamento a professor → resumo) ainda dependem do deploy — item já estava pendente desde a Etapa 38 e segue em aberto.

---

## Próxima Etapa

Deploy das alterações desta etapa na Vercel e execução dos testes funcionais ponta a ponta do Financeiro (fluxo completo). Depois disso, avaliar prioridade entre Relatórios Financeiros (Etapa 40) e as rotinas automáticas de geração mensal de `tuitions`/`teacher_payments` registradas como pendência.

---

---

# ETAPA 40 — REMOÇÃO DA INTEGRAÇÃO COM MERCADO PAGO

**Data:** 12/07/2026

**Horário:** [preencher — horário real da sessão]

**Agente Responsável:** Claude

**Commit Git:** Pendente

---

## Objetivo

O checkout do site já operava, na prática, em modo "somente pedido" desde uma migração anterior (`store/checkout-modal.js` só envia `method: 'manual'` para `/api/create-payment`, sem nunca carregar o SDK do Mercado Pago). Ficou confirmado com o responsável pelo projeto que esse é o comportamento definitivo: **não haverá cobrança online**, o pagamento é sempre combinado diretamente entre a escola e o cliente. Esta etapa remove o código morto de PIX/Cartão via Mercado Pago que ainda existia no backend e nas telas do painel, deixando o sistema coerente com o fluxo real em uso.

Contexto adicional: essa decisão também esclarece um item que constava como "pendência a investigar" no `relatorio_auditoria_sistema.md` (05/07/2026) — o fato de 0 dos 18 pedidos estarem com status `approved` não é um bug de webhook, é o comportamento esperado, já que nenhuma aprovação automática existe.

---

## Implementações Realizadas

- **API (`create-payment.js`):** removidos os ramos `pix` e `card` (integração real com Mercado Pago) e o modo `local` (fallback para quando faltavam credenciais do MP). O endpoint `/api/create-payment` foi mantido com esse nome (para não quebrar o front-end e o histórico de pedidos), mas agora só processa o fluxo de pedido manual: salva o pedido no Supabase com `status: 'pending'` e notifica a Bruna por e-mail.
- **API:** removidos os arquivos `api/webhook.js` (recebia notificações do Mercado Pago) e `api/verify-mp-payment.js` (consultava status de um pagamento no MP) — nenhum dos dois tinha mais chamador real.
- **API:** removido `api/config.js`, que só existia para expor a `MERCADO_PAGO_PUBLIC_KEY` ao front-end; essa chave não é mais buscada em lugar nenhum.
- **Frontend (`store/payment-config.js`):** simplificado — removida a função `getMercadoPagoPublicKey` e toda a config de métodos de pagamento (`pix`/`card`); ficou só o endpoint de criação de pedido.
- **Frontend (`index.html`):** removida a seção `checkout-step-payment` inteira (container do Payment Brick, resultado de QR Code PIX, texto "processado com segurança pelo Mercado Pago") — HTML morto, já que o checkout nunca chega nesse step. Removido também o modal órfão `checkout-close-confirm` (sem listener em nenhum JS) e a linha comentada do SDK do Mercado Pago.
- **Frontend (`painel-x9k2f.html`):** removidos o botão "Consultar status real no MP" na listagem de pedidos, a função `verifyMpPayment`, a variável `mpId` e o CSS associado (`.btn-mp`, `.mp-result`).
- **Dependências (`package.json`):** removida a dependência `mercadopago`.

---

## Arquivos Alterados

- `api/create-payment.js` (simplificado — só fluxo manual)
- `api/webhook.js` (removido)
- `api/verify-mp-payment.js` (removido)
- `api/config.js` (removido)
- `store/payment-config.js` (simplificado)
- `index.html` (removida seção de pagamento e modal órfão)
- `painel-x9k2f.html` (removido botão/função de verificação MP e CSS associado)
- `package.json` (removida dependência `mercadopago`)
- `painel_registro.md` (este registro)

---

## Alterações no Banco

Nenhuma. Os campos `mp_payment_id`, `mp_status`, `mp_status_detail` continuam existindo na tabela `orders` por compatibilidade com pedidos antigos, mas passam a ser sempre `null` em pedidos novos. Podem ser removidos do schema numa limpeza futura, sem urgência.

---

## Testes

✅ Sintaxe de `create-payment.js` e `payment-config.js` validada (`node --check`).
✅ Sintaxe do JavaScript embutido em `painel-x9k2f.html` validada (extração + `node --check`).
✅ Confirmado por busca no repositório que não sobrou nenhuma referência a `mercadopago`, `MercadoPago`, `verify-mp-payment` ou `payment-brick`.
⚠ **Não testado em produção/deploy.** Antes de considerar esta etapa concluída de fato, é necessário:
- Rodar `npm install` para remover `mercadopago` do `node_modules`.
- Testar localmente o fluxo completo de checkout (`npm run dev`).
- Dar deploy e testar: adicionar produto ao carrinho → finalizar pedido → conferir que aparece em `pending` no painel, sem nenhum resquício de UI do Mercado Pago.

---

## Pendências

- Variáveis de ambiente `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY` e `MP_WEBHOOK_URL` na Vercel não são mais usadas — podem ser removidas quando for conveniente (não bloqueante).
- Rotina (manual ou agendada) de geração mensal de `tuitions`/`teacher_payments` — pendência anterior (Etapa 39), segue em aberto, sem relação com esta etapa.

---

## Próxima Etapa

Consolidar `TODO.md` e `TODO_PROGRESS.md` em uma única fonte de pendências, e decidir o destino das branches órfãs (`LOJA`, `QWEN`, `VSCODER`, `codex/implementar-o-plano-completo`) — conforme Fase 1 do plano de refatoração geral do projeto.

---

# ETAPA 41 — ARQUIVAMENTO DE TODOs + MODULARIZAÇÃO DA API FINANCEIRA

**Data:** 12/07/2026

**Horário:** [preencher — horário real da sessão]

**Agente Responsável:** Claude

**Commit Git:** Pendente

---

## Objetivo

Duas limpezas de processo/estrutura, parte da Fase 1 e Fase 2 do plano de refatoração geral do projeto: (1) eliminar o sistema de pendências paralelo (`TODO.md`/`TODO_PROGRESS.md`), que duplicava o que já vinha sendo registrado aqui; (2) dividir `api/admin-financial.js` (706 linhas, 9 handlers num arquivo só) em módulos menores, sem aumentar a contagem de Serverless Functions do plano Hobby da Vercel (limite de 12).

---

## Implementações Realizadas

- **Documentação:** `TODO.md` e `TODO_PROGRESS.md` movidos para `docs/archive/`, com cabeçalho explicando que o conteúdo já foi implementado (Etapas 34–39) e que a fonte de verdade de pendências passa a ser exclusivamente este documento. Nenhum conteúdo foi apagado, só movido.
- **API (`admin-financial.js`):** os 9 handlers (`students`, `teachers`, `enrollments`, `tuitions`, `payments`, `expenses`, `investments`, `teacher_payments`, `summary`) foram extraídos para `api/_lib/admin/*.js`, um arquivo por resource, mais `api/_lib/admin-auth.js` (autenticação) e `api/_lib/admin/shared.js` (helpers `genId`/`monthRange`). `admin-financial.js` virou um roteador fino (77 linhas) que só importa e despacha para o `resource` certo. Nenhuma lógica de negócio mudou — é reorganização pura.
- **Importante — por que não virou 9 arquivos em `api/`:** arquivos direto em `api/*.js` viram Serverless Functions na Vercel; o projeto está no plano Hobby (limite de 12 funções por deploy, confirmado por busca na documentação oficial da Vercel) e já tinha 9 funções antes desta etapa. Criar 9 rotas novas estouraria o limite. A solução foi manter tudo em `api/_lib/` (que não conta como rota, mesma convenção já usada por `api/_lib/supabase.js`), preservando a contagem em 9 funções.

---

## Arquivos Alterados

- `TODO.md` → movido para `docs/archive/TODO_professores_mensalidade.md`
- `TODO_PROGRESS.md` → movido para `docs/archive/TODO_PROGRESS_professores_mensalidade.md`
- `api/admin-financial.js` (reescrito como roteador fino)
- `api/_lib/admin-auth.js` (novo)
- `api/_lib/admin/shared.js` (novo)
- `api/_lib/admin/students.js` (novo)
- `api/_lib/admin/teachers.js` (novo)
- `api/_lib/admin/enrollments.js` (novo)
- `api/_lib/admin/tuitions.js` (novo)
- `api/_lib/admin/payments.js` (novo)
- `api/_lib/admin/expenses.js` (novo)
- `api/_lib/admin/investments.js` (novo)
- `api/_lib/admin/teacher-payments.js` (novo)
- `api/_lib/admin/summary.js` (novo)
- `painel_registro.md` (este registro)

---

## Alterações no Banco

Nenhuma.

---

## Testes

✅ `node --check` em todos os módulos novos e no roteador — sintaxe OK.
✅ Import completo do roteador testado com `node` (ESM dinâmico), com `@supabase/supabase-js` instalado: os 9 módulos resolvem sem erro.
✅ Testado programaticamente: senha incorreta → 401; `resource` inválido → 400 com a mensagem esperada; senha correta + `resource` válido → chega até o handler certo.
✅ Confirmado que a contagem de arquivos direto em `api/*.js` continua em 9 (mesma de antes desta etapa).
⚠ **Não testado contra um banco Supabase real.** A lógica foi copiada linha a linha dos handlers originais (mesmas queries, mesmos payloads), mas antes de considerar concluído: dar deploy e testar manualmente cada sub-aba do Financeiro no painel (Alunos, Professores, Vínculos, Mensalidades, Pagamentos, Despesas, Investimentos, Pagto Professores, resumo).

---

## Pendências

- Testes funcionais pós-deploy da API financeira modularizada (ver acima).
- Fase 3 do plano de refatoração geral (modularizar `painel-x9k2f.html`, hoje com 3384 linhas e 57 funções globais num único `<script>`) segue não iniciada.
- Pendências financeiras anteriores (rotina de geração automática de `tuitions`/`teacher_payments`) seguem em aberto, sem relação com esta etapa.

---

## Próxima Etapa

Testes funcionais pós-deploy desta etapa e da Etapa 40. Depois, avaliar se parte para a Fase 3 (modularização do painel) ou para a decisão sobre as branches órfãs do repositório (`LOJA`, `QWEN`, `VSCODER`, `codex/implementar-o-plano-completo`), que segue pendente da Fase 1.

# OBSERVAÇÕES FINAIS

Este documento passa a ser o registro oficial de evolução do Painel Administrativo.

Sempre que uma nova implementação for concluída:

- Registrar uma nova etapa;
- Informar data e horário;
- Informar o agente responsável;
- Informar se houve alteração no banco;
- Informar se a implementação foi testada;
- Registrar pendências;
- Registrar a próxima etapa prevista.

O objetivo deste documento é garantir a continuidade do desenvolvimento por qualquer agente (IA ou desenvolvedor), preservando o histórico técnico e as decisões arquiteturais do projeto.

**Se uma implementação não estiver registrada neste documento, ela não deverá ser considerada oficialmente concluída.**

---

# ETAPA 42 — LIMPEZA REFAC: REMOÇÃO DO MP + UNIFICAÇÃO DE MÓDULOS

**Data:** 12/07/2026

**Horário:** 16:59

**Agente Responsável:** Claude (Anthropic)

**Commit Git:** Pendente — aplicar na branch REFAC antes do merge

---

## Objetivo

Resolver os dois problemas que impediam o deploy da branch REFAC na Vercel:
1. Contagem de Serverless Functions acima do limite seguro do plano Hobby (eram 12, limite é 12 — sem margem de manobra)
2. Dois conjuntos de módulos internos paralelos (`api/_lib/admin/` e `api/_lib/financial/`) causando duplicação e confusão

---

## Implementações Realizadas

- **Removidos** `api/webhook.js`, `api/verify-mp-payment.js`, `api/config.js` — código morto do Mercado Pago (integração removida na Etapa 40; esses arquivos voltaram por extração de zip por cima do repositório sem apagar os anteriores)
- **Removida** dependência `mercadopago` do `package.json`
- **Removida** pasta `api/_lib/admin/` inteira (10 módulos) — substituída por `api/_lib/financial/` que é mais completo e correto
- **`api/admin-financial.js`** reescrito para importar de `api/_lib/financial/` — cobre 12 resources: students, teachers, enrollments, tuitions, payments, expenses, investments, teacher_payments, summary, dashboard, lessons, attendance
- **`api/_lib/admin-auth.js`** recriado como arquivo standalone (único sobrevivente da pasta admin/)
- Contagem de Serverless Functions: **12 → 9**

### Melhorias trazidas pelo _lib/financial/ em relação ao _lib/admin/

- `investments`: CRUD completo — PATCH e DELETE adicionados (antes só GET/POST, pendência registrada em TODO_PROGRESS.md)
- `students`: usa `status` como única fonte de verdade (sem `students.active` que foi removido do schema na refatoração de jul/2026)
- `dashboard`: corrige bug onde `active_teachers` contava todos os professores sem filtrar por `active = true`
- `helpers`: `safeFloat`, `safeInt`, `parsePagination`, `normalizeOptionalFields`, `resolvePaidTimestamp` — não existiam em admin/
- Cobertura de testes unitários real: `tests/financial-helpers.test.js` e `tests/financial-students.test.js`
- Recursos novos expostos via roteador: `dashboard`, `lessons`, `attendance` (não existiam em _lib/admin/)

---

## Arquivos Alterados

- `api/webhook.js` — **removido**
- `api/verify-mp-payment.js` — **removido**
- `api/config.js` — **removido**
- `api/_lib/admin/` — **pasta removida inteira**
- `api/_lib/admin-auth.js` — recriado standalone
- `api/admin-financial.js` — reescrito (71 linhas, importa de _lib/financial/)
- `package.json` — dependência `mercadopago` removida

---

## Alterações no Banco

Nenhuma.

---

## Testes

✅ `node --check` em 15 arquivos JS — todos passaram
✅ `npm test` — **29/29 testes passando**, zero falhas (financial-helpers: 22, financial-students: 5, webhook-signature: 2)
✅ Nenhuma referência ao Mercado Pago restante (grep vazio em api/, app/, store/, index.html)
✅ Contagem de Serverless Functions: **9** (limite do plano Hobby: 12)
⚠ `npm run build` não executado neste ambiente (npmjs.org bloqueado) — rodar localmente ou deixar a Vercel executar no deploy

---

## Pendências

- Fazer commit e push da branch REFAC com estas alterações
- Deploy na Vercel a partir da branch REFAC e validação funcional ponta a ponta
- Merge da REFAC na main após validação em produção
- Variáveis de ambiente na Vercel: `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY`, `MP_WEBHOOK_URL` não são mais usadas — remover quando conveniente

---

## Próxima Etapa

Commit + push da REFAC, deploy na Vercel, testes funcionais ponta a ponta (fluxo: vínculo → aula → presença → financeiro), e merge para main.

---

# ETAPA 43 — PORTAGEM DAS CORREÇÕES DE FRONT-END DA MAIN PARA A REFAC

**Data:** 12/07/2026

**Horário:** 19:46

**Agente Responsável:** Claude (Anthropic)

**Commit Git:** Pendente — aplicar na branch REFAC

---

## Objetivo

Sincronizar a branch REFAC com as 4 correções de código morto/tangled aplicadas na `main` (Etapa 46 da main), que não estavam presentes na REFAC. A REFAC estava adiantada na camada de API (Etapas 40–42), mas atrasada na camada de front-end (`painel-x9k2f.html`).

---

## Contexto

Ao comparar `painel-x9k2f.html` entre REFAC e main, identificou-se que a REFAC ainda continha os seguintes problemas que já haviam sido corrigidos na main:

1. `_activeSubTab` inicializado com `'students'` (default implícito que forçava a sub-aba Alunos ao navegar para Financeiro mesmo sem o usuário clicar nela)
2. `switch (_activeSubTab)` em `loadFinancialData()` sem cases para `'lessons'` e `'investments'`, e com case `'agenda'` chamando `loadAgenda()` que apontava para um sistema paralelo legado
3. Par de funções legadas `loadAgenda()` / `renderAgenda()` — sistema paralelo de agenda que duplicava lógica já presente na sub-aba Vínculos; gerava confusão e chamada redundante à API
4. Referências ao endpoint de verificação de MP já removido (ausentes na REFAC — este item não existia na REFAC, apenas na main pré-correção)

---

## Implementações Realizadas

### Fix 1 — `_activeSubTab` sem default implícito
- Alterado de `let _activeSubTab = 'students'` para `let _activeSubTab = ''`
- A sub-aba ativa é determinada exclusivamente pelo clique do usuário nas sub-tabs, não por um default hardcoded

### Fix 2 — `switch (_activeSubTab)` em `loadFinancialData()`
- Adicionados cases para `'lessons'` e `'investments'` (chamam `loadLessons(month, year)` e `loadInvestments(month, year)` respectivamente — funções a serem implementadas na próxima etapa)
- Case `'agenda'` atualizado para chamar `loadEnrollmentsForAgenda()` em vez do sistema legado `loadAgenda()`

### Fix 3 — Remoção do sistema legado de Agenda
- Removidas funções `async function loadAgenda()` e `function renderAgenda(enrollments)` (52 linhas)
- Substituídas por função unificada `async function loadEnrollmentsForAgenda()` (38 linhas) que incorpora fetch + render em um único escopo, sem dependência de função auxiliar separada
- Net: −14 linhas

### Fix 4 — Verificação de referências ao MP
- Grep confirmou zero referências ao Mercado Pago no HTML da REFAC — este fix não era necessário (a limpeza já havia ocorrido na Etapa 40)

---

## Arquivos Alterados

- `painel-x9k2f.html` — 3 linhas removidas líquidas (3339 → 3336)
- `painel_registro.md` — esta entrada

---

## Alterações no Banco

Nenhuma.

---

## Testes

✅ `node --check` no bloco `<script>` principal — sintaxe válida
✅ Zero referências a `loadAgenda` ou `renderAgenda` remanescentes
✅ Zero referências ao Mercado Pago no HTML

---

## Pendências

- Fazer commit e push da branch REFAC com estas alterações
- Deploy na Vercel a partir da branch REFAC + validação funcional ponta a ponta (fluxo: vínculo → agenda → mensalidade → pagamento → professor)
- Implementar `loadLessons()` e `loadInvestments()` (cases adicionados no switch mas funções ainda não existem)
- Merge da REFAC na main após validação em produção
- Variáveis de ambiente na Vercel: `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY`, `MP_WEBHOOK_URL` não são mais usadas — remover quando conveniente

---

## Próxima Etapa

Commit + push da REFAC, deploy na Vercel, e validação funcional ponta a ponta.
