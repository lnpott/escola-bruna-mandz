# Como recriar o banco (setup rápido de ambiente dev)

## Primeira vez (criar as tabelas)

Execute em ordem no SQL Editor do Supabase:

1. `supabase/schema.sql` — base da loja (products, orders, função `set_updated_at`)
2. `supabase/financial-schema.sql` — módulo acadêmico/financeiro

## Reset de dados (manutenção ou recriação frequente)

### Opção 1: CLI (recomendado)

```bash
npm run db:reset
```

Automatiza tudo via Supabase Management API. Lê os SQLs na ordem correta e
envia ao Supabase em chunks. Pré-requisito:
- `SUPABASE_ACCESS_TOKEN` no `.env` (gerar em https://app.supabase.com/account/tokens)

### Opção 2: SQL Editor manual

Execute **apenas** `supabase/reset-dev.sql` no SQL Editor do Supabase —
um único arquivo que:

1. **Limpa** todos os dados existentes (FK-safe order: filhos antes dos pais)
2. **Aplica** migrations pendentes: RLS deny anon (052), índice estoque baixo (054),
   limpeza de máscaras CPF/telefone (055)
3. **Carrega** seed completo com:
   - 6 professores (especialidades variadas)
   - 12 alunos (todos os 7 status do ciclo de vida)
   - 8 matrículas, 12 mensalidades, 10 aulas na semana corrente
   - Presenças, receitas avulsas, despesas, investimentos
   - Pagamentos a professores (mês corrente + anterior)

Idempotente — pode rodar múltiplas vezes sem duplicar dados.

> **Nota**: O schema das tabelas não é recriado no reset (usa `IF NOT EXISTS`).
> Para zerar o schema, execute `schema.sql` + `financial-schema.sql` novamente
> antes do reset.

## Seeds avulsos (opcionais)

- `supabase/seed-escola.sql` — dados mínimos (1 aluno, 1 professor)
- `supabase/seed-products.sql` — produtos da loja
- `supabase/seed-completo.sql` — seed completo (mesmo conteúdo do reset-dev.sql,
  sem a limpeza inicial nem as migrations)

## Migrações históricas

As migrations em `supabase/migrations/*.sql` (043–055) documentam o histórico
incremental de um banco que já existia. Com o schema consolidado em
`financial-schema.sql`, **não é necessário rodá-las individualmente**.
Mantidas apenas como registro histórico.

## Pós-setup

- Confirme `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` (local) e nas
  env vars da Vercel.
- `ADMIN_PASSWORD` também precisa estar setado nos dois lugares.
- Bucket `product-images` no Storage (criação manual).
