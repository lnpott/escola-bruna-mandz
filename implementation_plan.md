# Refatoração Modular do Painel (Separation of Concerns)

O sistema atual (`painel-x9k2f.html`) é um monólito de +4500 linhas que mistura as lógicas de gestão acadêmica e comercial. Com base no princípio de *Separation of Concerns*, vamos dividir o sistema em domínios específicos.

## User Review Required

> [!WARNING]
> Esta refatoração dividirá completamente o `painel-x9k2f.html` em novas páginas e arquivos JS separados. O antigo arquivo será mantido como backup inicial, mas o roteamento do sistema será alterado. Isso afetará as URLs de acesso e a estrutura das APIs.

> [!CAUTION]
> As políticas de RLS (Row Level Security) propostas exigirão que os usuários tenham um `role` ou `perfil` definido no Supabase (ex: `academic_admin`, `commercial_admin`, `teacher`). Por favor, confirme como os papéis dos usuários estão estruturados atualmente na tabela `auth.users` ou em uma tabela de `profiles`.

## Open Questions

1. Como os papéis de usuário (roles) estão sendo controlados atualmente? Temos uma tabela `profiles` associada aos usuários autenticados, ou devemos basear as restrições de RLS no campo de metadados do `auth.users`?
2. A página inicial (Central de Roteamento) deve estar na raiz `/index.html` substituindo o acesso atual, ou `/admin/index.html`?
3. Podemos remover completamente as operações da loja/pedidos da API `admin-financial.js` e focar em APIs separadas (`api/admin-academic.js` e `api/admin-commercial.js`)?

## Proposed Changes

### 1. Estrutura de Diretórios Sugerida

A estrutura será reorganizada para isolar os domínios:

```text
/
├── index.html                 # Roteador de Contexto (Landing page do Admin)
├── academic/
│   ├── index.html             # UI do Painel Acadêmico (Alunos, Professores, Agenda)
│   └── js/main.js             # Lógica e chamadas de API do módulo acadêmico
├── commercial/
│   ├── index.html             # UI do Painel Comercial (Loja, Pedidos, Financeiro)
│   └── js/main.js             # Lógica e chamadas de API do módulo comercial
├── api/
│   ├── admin-academic.js      # Endpoints: students, teachers, lessons, attendance
│   └── admin-commercial.js    # Endpoints: products, orders, financials
└── supabase/
    └── migrations/
        └── 048-rls-separation.sql # Novas regras de segurança (RLS)
```

### 2. Fragmentação de Interface

- **Painel Acadêmico (`/academic/index.html`)**: Conterá exclusivamente os modais, tabelas e lógicas referentes a **Alunos**, **Professores**, e **Agenda**.
- **Painel Comercial (`/commercial/index.html`)**: Conterá **Pedidos**, **Produtos**, e **Financeiro / Mensalidades**.
- **Navegação Central (`/index.html`)**: Uma tela inicial simples onde o usuário, após o login, verá dois cards grandes ("Módulo Acadêmico" e "Módulo Comercial"). A exibição desses cards pode ser condicionada ao perfil do usuário.

### 3. Segurança (RLS Supabase)

Será criado o arquivo `048-rls-separation.sql` com políticas RLS para reforçar a segurança diretamente no banco. 

*Exemplo técnico da implementação:*
```sql
-- Habilitar RLS nas tabelas chave
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Política Acadêmica: Apenas admins acadêmicos ou professores podem ver alunos/agenda
CREATE POLICY "academic_access" ON public.students
FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('academic_admin', 'super_admin', 'teacher')
);

-- Política Comercial: Apenas admins comerciais podem ver financeiro
CREATE POLICY "commercial_access" ON public.financial_transactions
FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('commercial_admin', 'super_admin')
);
```
*(Nota: As políticas exatas serão ajustadas conforme a resposta sobre a gestão de roles).*

## Verification Plan

### Manual Verification
1. Acessar a nova rota `/index.html` e verificar se a Landing Page de seleção de módulo é exibida corretamente.
2. Entrar no **Módulo Acadêmico** e garantir que as funções de Cadastrar Aluno, Cadastrar Professor e Nova Aula funcionam via a nova API `admin-academic.js`.
3. Entrar no **Módulo Comercial** e garantir que Loja, Pedidos e Financeiro operam corretamente isolados.
4. Testar o acesso direto ao banco usando chaves JWT com perfis diferentes para validar o bloqueio do RLS.
