# Módulos do Sistema

## Objetivo

Este documento descreve os módulos principais do sistema Escola Bruna Mandz.

O sistema será desenvolvido através de um painel administrativo, onde todos os módulos serão acessados e gerenciados pelos usuários autorizados.

Este documento descreve somente o escopo conhecido de cada módulo. Regras específicas de funcionamento serão definidas em `BUSINESS_RULES.md`.

---

# Estrutura Geral

O sistema possui os seguintes módulos principais:

```
Dashboard

Alunos

Professores

Agenda

Financeiro

Loja

Configurações
```

---

# Dashboard

## Objetivo

Apresentar uma visão geral das informações importantes da escola.

## Responsabilidade

Centralizar indicadores e informações resumidas para facilitar a administração.

## Informações apresentadas

A definir.

---

# Alunos

## Objetivo

Gerenciar os alunos cadastrados na escola.

## Responsabilidades

- Cadastro de alunos.
- Consulta de alunos.
- Edição de informações.
- Visualização de dados relacionados ao aluno.

## Integrações

Relaciona-se com:

- Agenda.
- Financeiro.

Detalhamento das relações:

A definir.

---

# Professores

## Objetivo

Gerenciar os professores da escola.

## Responsabilidades

- Cadastro de professores.
- Consulta de professores.
- Edição de informações.
- Gerenciamento das informações relacionadas aos professores.

## Integrações

Relaciona-se com:

- Agenda.

Detalhamento das relações:

A definir.

---

# Agenda

## Objetivo

Gerenciar a organização das aulas da escola.

## Responsabilidades

- Visualização dos horários.
- Organização das aulas.
- Controle da agenda.

## Integrações

Relaciona-se com:

- Alunos.
- Professores.

Detalhamento das relações:

A definir.

---

# Financeiro

## Objetivo

Gerenciar as informações financeiras da escola.

## Responsabilidades

- Controle financeiro.
- Visualização de movimentações.
- Gestão das informações financeiras.

## Integrações

Relaciona-se com:

- Alunos.
- Loja.
- Outros módulos conforme regras definidas.

Detalhamento das relações:

A definir.

---

# Loja

## Objetivo

Gerenciar a operação de vendas da escola.

## Responsabilidades

- Cadastro de produtos.
- Controle das vendas.
- Gerenciamento das informações da loja.

## Integrações

Relaciona-se com:

- Financeiro.

Detalhamento das relações:

A definir.

---

# Configurações

## Objetivo

Gerenciar as configurações gerais do sistema.

## Responsabilidades

A definir.

---

# Regras Gerais dos Módulos

- Cada módulo deve possuir responsabilidade própria.
- Um módulo não deve assumir responsabilidades de outro módulo.
- Alterações que afetem mais de um módulo devem ser documentadas.
- Novas funcionalidades devem ser associadas a um módulo existente ou justificar a criação de um novo módulo.

---

# Evolução

Este documento será atualizado conforme as regras de negócio e funcionalidades forem definidas.

Nenhuma funcionalidade deve ser considerada existente apenas por estar planejada neste documento.