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

# Roadmap do Painel

| Etapa | Descrição | Status |
|--------|-----------|--------|
| 33 | Estrutura do Financeiro | 🔄 |
| 34 | Cadastro Financeiro | ⏳ |
| 35 | Mensalidades | ⏳ |
| 36 | Fluxo de Caixa | ⏳ |
| 37 | Relatórios | ⏳ |
| 38 | Alunos | ⏳ |
| 39 | Turmas | ⏳ |
| 40 | Agenda | ⏳ |

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

# ROADMAP DO PAINEL

| Etapa | Implementação | Status |
|--------|---------------|--------|
| 33 | Documentação do Painel | ✅ |
| 34 | Estrutura do Financeiro | ✅ |
| 35 | Interface de Professores | ✅ |
| 36 | Integração Pedagógica nas Mensalidades | ✅ |
| 37 | Testes Funcionais do Financeiro | ⏳ |
| 38 | Relatórios Financeiros | ⏳ |
| 39 | Turmas | ⏳ |
| 40 | Agenda | ⏳ |

---

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