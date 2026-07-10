-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: lessons + attendance
-- Data:      2026-07-09
--
-- Objetivo:
--   Criar o módulo de Aulas (lessons) com data específica, permitindo ao usuário
--   vincular aluno + professor + aula na data e hora exata.
--
-- O que faz:
--   1. Cria tabela lessons (aula com data real)
--   2. Cria tabela attendance (presença do aluno na aula)
--   3. Migra dados dos enrollments atuais (day_of_week + class_time) para
--      lessons individuais (gera as aulas da semana de 13 a 19/07/2026)
--   4. Adiciona índices, triggers e RLS policies
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. TABELA: lessons (Aulas)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Representa uma aula real em data e hora específica.
-- Cada lesson vincula um enrollment (contrato pedagógico) a uma ocorrência real.
--
-- Para aulas recorrentes (ex: toda segunda), o usuário pode gerar várias lessons
-- de uma vez pela interface. Cada lesson é independente — pode ser remarcada,
-- cancelada, ou convertida em reposição individualmente.

create table if not exists public.lessons (
    id text primary key,                        -- LS-XXXXXX
    enrollment_id text not null references public.enrollments(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    teacher_id text references public.teachers(id) on delete set null,
    instrument text,                            -- Cópia do instrumento no momento da criação
    date date not null,                         -- Data real da aula (ex: 2026-07-15)
    start_time text not null,                   -- Horário de início (HH:MM)
    end_time text not null,                     -- Horário de término (HH:MM), calculado de start_time + duration_minutes
    duration_minutes integer not null default 60,
    lesson_type text not null default 'regular'
        constraint lessons_type_check
        check (lesson_type in ('regular', 'make_up', 'extra', 'trial')),
    status text not null default 'scheduled'
        constraint lessons_status_check
        check (status in ('scheduled', 'completed', 'cancelled', 'make_up')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Garante que não haja duas lessons do mesmo professor no mesmo horário
    constraint lessons_no_overlap
        unique (teacher_id, date, start_time)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ÍNDICES — lessons
-- ═══════════════════════════════════════════════════════════════════════════════

-- Dashboard "Aulas de Hoje": filtra por data + status
create index if not exists lessons_date_status_idx on public.lessons (date, status);

-- Agendamento: busca por enrollment
create index if not exists lessons_enrollment_id_idx on public.lessons (enrollment_id);

-- Listar aulas de um aluno
create index if not exists lessons_student_id_idx on public.lessons (student_id);

-- Listar aulas de um professor
create index if not exists lessons_teacher_id_idx on public.lessons (teacher_id);

-- Filtro por tipo de aula
create index if not exists lessons_type_idx on public.lessons (lesson_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TRIGGER — lessons updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
    before update on public.lessons
    for each row
    execute function public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. RLS — lessons
-- ═══════════════════════════════════════════════════════════════════════════════

alter table public.lessons enable row level security;

create policy "admin manage lessons"
    on public.lessons for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TABELA: attendance (Frequência / Presença)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Registro de presença do aluno em uma aula específica.
-- Permite marcar: presente, ausente, justificado, atrasado.

create table if not exists public.attendance (
    id text primary key,                        -- AT-XXXXXX
    lesson_id text not null references public.lessons(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    status text not null default 'present'
        constraint attendance_status_check
        check (status in ('present', 'absent', 'excused', 'late')),
    late_minutes integer not null default 0,    -- Quantos minutos de atraso (se status = 'late')
    notes text,
    recorded_at timestamptz not null default now(),
    recorded_by text,                           -- Quem registrou (futuro: user id)

    -- Um aluno só pode ter um registro de presença por aula
    constraint attendance_unique_student_lesson
        unique (lesson_id, student_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. ÍNDICES — attendance
-- ═══════════════════════════════════════════════════════════════════════════════

create index if not exists attendance_lesson_id_idx on public.attendance (lesson_id);
create index if not exists attendance_student_id_idx on public.attendance (student_id);
create index if not exists attendance_status_idx on public.attendance (status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. RLS — attendance
-- ═══════════════════════════════════════════════════════════════════════════════

alter table public.attendance enable row level security;

create policy "admin manage attendance"
    on public.attendance for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. MIGRAÇÃO DE DADOS: enrollments → lessons
-- ═══════════════════════════════════════════════════════════════════════════════
-- Gera aulas reais para a semana de 13/07/2026 (segunda) a 19/07/2026 (domingo)
-- baseadas no day_of_week + class_time dos enrollments ativos.
--
-- Roda apenas se a tabela lessons estiver vazia (primeira execução).
-- ═══════════════════════════════════════════════════════════════════════════════

do $$
declare
    -- Mapeamento dia da semana → data real na semana de 13/07/2026
    -- 13/07 = segunda, 14/07 = terça, ..., 19/07 = domingo
    day_dates text[] := array[
        '2026-07-13',   -- seg (índice 1 no array pg, mas vamos mapear pelo nome)
        '2026-07-14',   -- ter
        '2026-07-15',   -- qua
        '2026-07-16',   -- qui
        '2026-07-17',   -- sex
        '2026-07-18',   -- sab
        '2026-07-19'    -- dom
    ];
    day_index int;
    lesson_date text;
    end_time text;
    enr record;
    lesson_count int := 0;
begin
    -- Só executa se não houver lessons ainda
    if exists (select 1 from public.lessons limit 1) then
        raise notice 'Tabela lessons já possui dados. Pulando migração.';
        return;
    end if;

    for enr in
        select
            e.id as enrollment_id,
            e.student_id,
            e.teacher_id,
            e.instrument,
            e.day_of_week,
            e.class_time::text,
            e.duration_minutes,
            e.classes_per_week
        from public.enrollments e
        where e.status = 'active'
          and e.day_of_week is not null
          and e.class_time is not null
          and e.day_of_week in ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom')
    loop
        -- Mapeia day_of_week para índice no array day_dates
        day_index := case enr.day_of_week
            when 'seg' then 1
            when 'ter' then 2
            when 'qua' then 3
            when 'qui' then 4
            when 'sex' then 5
            when 'sab' then 6
            when 'dom' then 7
            else null
        end;

        if day_index is not null then
            lesson_date := day_dates[day_index];

            -- Calcula end_time = start_time + duration_minutes
            end_time := (
                select to_char(
                    (lesson_date || ' ' || enr.class_time)::timestamp
                        + (enr.duration_minutes || ' minutes')::interval,
                    'HH24:MI'
                )
            );

            begin
                insert into public.lessons (
                    id, enrollment_id, student_id, teacher_id, instrument,
                    date, start_time, end_time, duration_minutes,
                    lesson_type, status, notes
                ) values (
                    'LS-' || upper(substr(md5(random()::text), 1, 6)),
                    enr.enrollment_id,
                    enr.student_id,
                    enr.teacher_id,
                    enr.instrument,
                    lesson_date::date,
                    enr.class_time,
                    end_time,
                    enr.duration_minutes,
                    'regular',
                    'scheduled',
                    'Gerado automaticamente na migração (semana de 13/07/2026)'
                );
                lesson_count := lesson_count + 1;
            exception when unique_violation then
                -- Já existe aula deste professor neste horário — pula
                raise notice 'Conflito: % já tem aula em % às %', enr.teacher_id, lesson_date, enr.class_time;
            end;
        end if;
    end loop;

    raise notice 'Migração concluída: % lessons geradas.', lesson_count;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIM DA MIGRAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════════
