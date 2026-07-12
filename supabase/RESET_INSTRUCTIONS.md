# Como recriar o banco (schema limpo pós-refatoração)

Este projeto autoriza recriar o banco do zero — não há migração incremental
do schema antigo. Ordem de execução no SQL Editor do Supabase:

1. `supabase/schema.sql` — base da loja (products, orders, função `set_updated_at`)
2. `supabase/financial-schema.sql` — módulo acadêmico/financeiro (students,
   teachers, enrollments, tuitions, payments, expenses, investments,
   teacher_payments, lessons, attendance)
3. (Opcional) `supabase/seed-products.sql` / `supabase/seed-escola.sql` — dados de exemplo

## O que mudou nesta versão do financial-schema.sql

- **Removido**: `students.active` (boolean). Era redundante com `students.status`
  (7 estágios: lead→cancelled) e exigia lógica de sincronização dupla em cada
  escrita. Agora `status = 'active'` é a única forma de saber se um aluno está ativo.
- **Removidas**: as policies RLS `"admin manage X" ... to authenticated`. Elas nunca
  tinham efeito prático — o backend acessa o banco via `SUPABASE_SERVICE_ROLE_KEY`
  (que ignora RLS) e não existe nenhum login via Supabase Auth neste projeto (a
  autenticação do painel é por header `x-admin-password`). RLS continua habilitado
  em todas as tabelas — só não há mais policies mortas dando falsa sensação de
  controle de acesso por role.
- Tudo o resto do schema (IDs com prefixo, triggers `set_updated_at`, CHECK
  constraints, índices) já estava correto e foi mantido como estava.

## Não precisa rodar as migrations antigas

As migrations em `supabase/migrations/*.sql` (043, 045, 046, 047, 050) e os
arquivos soltos `migration-*.sql` na raiz de `supabase/` documentam o histórico
incremental de um banco que já existia. Como o banco será recriado do zero,
`financial-schema.sql` já nasce com tudo que essas migrations aplicavam —
não é necessário rodá-las. Mantidas apenas como registro histórico.

## Depois de recriar

- Confirme `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` (local) e nas
  env vars do projeto na Vercel.
- `ADMIN_PASSWORD` também precisa estar setado nos dois lugares — é o que
  autentica o painel (`x-admin-password` header), não tem relação com Supabase Auth.
