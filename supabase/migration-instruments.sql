-- Adiciona coluna instruments à tabela students
ALTER TABLE students ADD COLUMN IF NOT EXISTS instruments text DEFAULT '';
