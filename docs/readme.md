# Escola Bruna Mandz

Sistema de gestão para escolas de música desenvolvido para centralizar a administração acadêmica, financeira e comercial em uma única plataforma.

Este repositório contém o código-fonte, a documentação e a estrutura do sistema utilizado pela Escola Bruna Mandz.

---

# Objetivo

O projeto tem como objetivo substituir controles manuais e planilhas por um sistema único, organizado e de fácil manutenção.

O sistema foi projetado para crescer de forma modular, permitindo a adição de novas funcionalidades sem grandes alterações na arquitetura.

---

# Funcionalidades

O sistema é dividido nos seguintes módulos:

- Dashboard
- Alunos
- Professores
- Agenda
- Financeiro
- Loja
- Configurações

Cada módulo possui responsabilidades independentes, compartilhando autenticação, permissões e banco de dados.

---

# Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Backend

- Supabase

## Banco de Dados

- PostgreSQL

## Autenticação

- Supabase Auth

## Armazenamento

- Supabase Storage

## Deploy

- Vercel

---

# Estrutura do Repositório

```
apps/
    web/

docs/

supabase/

docker/

packages/
```

## Descrição

| Pasta | Responsabilidade |
|--------|------------------|
| apps/web | Aplicação principal |
| docs | Documentação oficial do projeto |
| supabase | Banco de dados, migrations, seeds e políticas |
| docker | Ambiente de desenvolvimento |
| packages | Bibliotecas compartilhadas (quando necessário) |

---

# Organização da Aplicação

A aplicação é organizada por domínio de negócio.

```
features/

    dashboard/

    students/

    teachers/

    schedule/

    finance/

    store/

    settings/

shared/
```

Cada módulo contém apenas regras relacionadas ao seu domínio.

---

# Fluxo Geral

```
Usuário

↓

Login

↓

Dashboard

↓

Seleciona um módulo

↓

Executa uma operação

↓

Banco de Dados

↓

Interface atualizada
```

---

# Módulos

## Dashboard

Apresenta informações resumidas sobre a operação da escola.

Responsabilidades:

- Indicadores
- Agenda do dia
- Alertas
- Resumo financeiro

---

## Alunos

Responsável pelo gerenciamento dos alunos.

Principais funcionalidades:

- Cadastro
- Consulta
- Edição
- Matrículas
- Histórico

---

## Professores

Responsável pelo gerenciamento dos professores.

Principais funcionalidades:

- Cadastro
- Especialidades
- Disponibilidade
- Agenda

---

## Agenda

Responsável pelo gerenciamento das aulas.

Principais funcionalidades:

- Agendamento
- Reposição
- Cancelamento
- Frequência
- Histórico

---

## Financeiro

Responsável pelo controle financeiro da escola.

Principais funcionalidades:

- Cobranças
- Recebimentos
- Despesas
- Fluxo de Caixa
- Inadimplência

---

## Loja

Responsável pela operação comercial.

Principais funcionalidades:

- Produtos
- Categorias
- Estoque
- Vendas
- Caixa

---

## Configurações

Responsável pelas configurações gerais do sistema.

Principais funcionalidades:

- Usuários
- Permissões
- Dados da escola
- Preferências

---

# Princípios do Projeto

O desenvolvimento seguirá os seguintes princípios:

- Simplicidade antes de complexidade.
- Código limpo e organizado.
- Arquitetura modular.
- Regras de negócio centralizadas.
- Documentação sempre atualizada.
- Evolução incremental.

---

# Documentação

Toda documentação oficial encontra-se na pasta `docs`.

Arquivos principais:

| Arquivo | Descrição |
|----------|-----------|
| README.md | Visão geral do projeto |
| ARCHITECTURE.md | Arquitetura da aplicação |
| DATABASE.md | Modelagem e estrutura do banco |
| MODULES.md | Documentação dos módulos |
| ROADMAP.md | Planejamento e evolução do sistema |

Esses documentos representam a fonte oficial de informação do projeto.

Sempre que houver alteração estrutural, a documentação correspondente deverá ser atualizada antes ou junto da implementação.

---

# Objetivo da Documentação

A documentação existe para que qualquer desenvolvedor ou IA consiga compreender a arquitetura, o funcionamento e a organização do projeto sem depender do histórico das conversas.

Toda decisão permanente deve estar documentada.