-- Migration 046 — Adiciona guardian_name e guardian_phone em students
-- Esses campos estavam sendo usados pela API e frontend, mas não haviam
-- sido adicionados formalmente ao schema ou em migrations anteriores.

alter table if exists public.students
    add column if not exists guardian_name text,
    add column if not exists guardian_phone text;
