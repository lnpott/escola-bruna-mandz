# Arquitetura do Sistema

## Objetivo

Este documento descreve a arquitetura técnica do sistema Escola Bruna Mandz.

O objetivo é definir como a aplicação será organizada para facilitar desenvolvimento, manutenção e evolução.

---

# Visão Geral

O sistema será uma aplicação web acessada através de um painel administrativo.

Arquitetura principal:

```
Usuário

↓

Frontend Web

↓

Supabase

↓

PostgreSQL
```

---

# Tecnologias

## Frontend

Tecnologias utilizadas:

- React
- TypeScript
- Vite

Responsabilidades:

- Interface do usuário.
- Navegação.
- Componentes visuais.
- Interação com o sistema.

---

## Backend

O sistema utilizará Supabase como plataforma backend.

Responsabilidades:

- Banco de dados.
- Autenticação.
- Controle de acesso.
- Armazenamento de arquivos.

---

## Banco de Dados

Tecnologia:

- PostgreSQL

Responsabilidades:

- Armazenamento dos dados.
- Relacionamentos.
- Consultas.
- Integridade das informações.

---

# Estrutura da Aplicação

A aplicação será organizada por módulos de negócio.

Estrutura prevista:

```
src/

├── components/

├── features/

│   ├── dashboard/

│   ├── students/

│   ├── teachers/

│   ├── schedule/

│   ├── finance/

│   └── store/

├── pages/

├── services/

├── hooks/

├── lib/

├── types/

└── utils/
```

---

# Organização por Módulo

Cada módulo deve concentrar seus próprios arquivos relacionados.

Exemplo:

```
features/students/

components/

pages/

services/

hooks/

types/
```

O objetivo é manter cada área do sistema organizada e independente.

---

# Comunicação com o Banco

A aplicação utilizará o Supabase para comunicação com o banco de dados.

Fluxo:

```
Componente

↓

Service

↓

Supabase Client

↓

Banco PostgreSQL
```

---

# Serviços

Os Services serão responsáveis por concentrar a comunicação com o banco.

Exemplos:

```
studentsService

teachersService

scheduleService

financeService

storeService
```

Responsabilidades:

- Buscar dados.
- Criar registros.
- Atualizar registros.
- Remover registros quando permitido.

---

# Componentes

Os componentes serão divididos em:

## Componentes específicos

Pertencem a um módulo.

Exemplo:

```
features/students/components
```

---

## Componentes compartilhados

Utilizados por várias áreas.

Exemplo:

```
components/ui
```

---

# Autenticação

A autenticação será realizada utilizando Supabase Auth.

Responsabilidades:

- Login.
- Controle de sessão.
- Identificação do usuário.

As regras de permissão serão definidas conforme os perfis de acesso do sistema.

---

# Controle de Acesso

O sistema possuirá controle de acesso baseado em usuários e permissões.

Detalhamento:

A definir em `BUSINESS_RULES.md`.

---

# Ambiente

## Desenvolvimento

Ambiente utilizado para criação e testes locais.

---

## Produção

Ambiente utilizado pela escola.

---

# Deploy

O sistema será hospedado utilizando:

- Vercel para aplicação web.
- Supabase para backend e banco de dados.

Fluxo:

```
Código

↓

GitHub

↓

Deploy

↓

Aplicação publicada
```

---

# Princípios Arquiteturais

## Organização

O código deve permanecer organizado por responsabilidade.

---

## Manutenção

Alterações devem evitar impacto desnecessário em outras áreas do sistema.

---

## Evolução

Novos módulos devem seguir a estrutura existente.

---

## Simplicidade

A solução mais simples que atende ao problema deve ser priorizada.

---

# Alterações de Arquitetura

Qualquer mudança significativa na arquitetura deve ser registrada neste documento antes de ser aplicada ao projeto.