-- Migration 045 — Adiciona colunas de CPF em alunos e professores
-- e atualiza schema da tabela teachers para refletir financial-schema.sql

alter table if exists public.students
    add column if not exists cpf text,
    add column if not exists guardian_cpf text;

alter table if exists public.teachers
    add column if not exists cpf text,
    add column if not exists email text,
    add column if not exists active boolean not null default true;

-- Converte days_of_week de text[] para text (se ainda estiver como array)
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'teachers'
          and column_name = 'days_of_week'
          and data_type = 'ARRAY'
    ) then
        alter table public.teachers
            alter column days_of_week type text
            using array_to_string(days_of_week, ', ');
    end if;
end
$$;
