# Banco de Dados

## Objetivo

Este documento define a estrutura do banco de dados da aplicação.

Ele é a referência oficial para criação de tabelas, relacionamentos, regras de integridade e evolução do banco.

Toda alteração na estrutura do banco deve ser documentada neste arquivo antes da implementação.

---

# Tecnologia

Banco de Dados: PostgreSQL

Plataforma: Supabase

---

# Convenções

## Nome das tabelas

Todas as tabelas devem utilizar:

- letras minúsculas
- snake_case
- nomes no plural

Exemplos:

```
students
teachers
enrollments
lessons
payments
products
sales
```

---

## Colunas

Todas as tabelas deverão utilizar snake_case.

Exemplo:

```
first_name
birth_date
created_at
updated_at
deleted_at
```

---

## Chave Primária

Todas as tabelas utilizarão:

```
id UUID
```

Gerado automaticamente pelo PostgreSQL.

---

## Auditoria

Sempre que aplicável, as tabelas possuirão:

```
created_at
updated_at
deleted_at
created_by
updated_by
```

---

# Módulos do Banco

O banco será dividido pelos mesmos módulos da aplicação.

```
students

teachers

schedule

finance

store

settings
```

---

# Estrutura Geral

```
students
│
└── enrollments
     │
     ├── lessons
     │      │
     │      └── attendance
     │
     ├── charges
     │      │
     │      └── payments
     │
     └── teachers

finance
│
├── expenses
├── financial_transactions
└── categories

store
│
├── products
├── stock
├── sales
└── sale_items
```

---

# Módulo Alunos

Responsável pelos dados acadêmicos.

Principais tabelas:

```
students

student_contacts

student_documents

enrollments
```

---

# Módulo Professores

Responsável pelos dados dos professores.

Principais tabelas:

```
teachers

teacher_availability

teacher_specialties
```

---

# Módulo Agenda

Responsável pelo calendário da escola.

Principais tabelas:

```
lessons

attendance

lesson_notes
```

---

# Módulo Financeiro

Responsável pelo controle financeiro.

Principais tabelas:

```
charges

payments

expenses

expense_categories

financial_transactions
```

A tabela `financial_transactions` será a fonte oficial para indicadores financeiros e fluxo de caixa.

---

# Módulo Loja

Responsável pelas vendas e estoque.

Principais tabelas:

```
categories

products

stock_movements

sales

sale_items
```

---

# Relacionamentos Principais

```
Student

↓

Enrollment

↓

Lesson

↓

Attendance
```

---

```
Student

↓

Enrollment

↓

Charge

↓

Payment
```

---

```
Teacher

↓

Lesson
```

---

```
Sale

↓

Sale Items

↓

Products
```

---

# Integridade

O banco deverá utilizar:

- Primary Keys
- Foreign Keys
- Constraints
- Índices
- Views
- Functions
- Triggers

Sempre que possível, regras críticas deverão permanecer no banco de dados.

---

# Exclusão de Registros

Registros históricos não deverão ser removidos.

Utilizar:

```
deleted_at
```

ou

```
active = false
```

A exclusão física será utilizada apenas quando realmente necessária.

---

# Views

As Views serão utilizadas para simplificar consultas e alimentar dashboards.

Exemplos:

```
vw_dashboard

vw_student_history

vw_financial_summary

vw_teacher_schedule

vw_store_sales
```

---

# Functions

Functions serão utilizadas para regras de negócio compartilhadas.

Exemplos:

- cálculo de mensalidade
- geração automática de cobranças
- atualização de estoque
- cálculo de fluxo de caixa

---

# Triggers

Triggers serão utilizadas apenas quando agregarem consistência ao banco.

Exemplos:

- atualizar `updated_at`
- registrar auditoria
- gerar movimentação financeira
- atualizar estoque após venda

---

# Segurança

O acesso aos dados será controlado por Row Level Security (RLS).

As permissões serão definidas conforme o perfil do usuário.

Perfis previstos:

- Administrador
- Secretaria
- Financeiro
- Professor

---

# Migrações

Toda alteração estrutural deverá ser realizada através de migrations.

Nenhuma alteração deverá ser feita diretamente em produção.

---

# Seeds

O projeto possuirá seeds para facilitar:

- desenvolvimento
- testes
- demonstrações

---

# Evolução do Banco

Novas tabelas deverão seguir os padrões definidos neste documento.

Sempre que um módulo for expandido, sua estrutura deverá ser documentada antes da implementação.

Este documento representa a referência oficial da estrutura do banco de dados do projeto.