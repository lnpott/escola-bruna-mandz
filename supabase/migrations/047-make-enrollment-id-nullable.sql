-- Migration 047 — Torna enrollment_id opcional em lessons
-- Motivo: o modal de Nova Aula agora permite criar aulas informando
-- student_id, teacher_id e instrument diretamente, sem depender de
-- um enrollment (vínculo) existente.

alter table if exists public.lessons
    alter column enrollment_id drop not null;
