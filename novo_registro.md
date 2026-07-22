# 📝 Registro de Implementações — Módulo Financeiro & Pedagógico

## 🟢 Etapa 47 — Preservação Atômica de ID no Upsert de Frequência (`api/_lib/financial/attendance.js`)

**Data:** 22/07/2026

### O que foi feito:
- Refatorado o método `POST` do manipulador de presença/frequência (`handleAttendance`).
- Corrigida a corrida de concorrência onde duas requisições paralelas sem registro prévio geravam IDs distintos e sobrescreviam o ID existente no Postgres ao disparar `upsert`.
- Agora o `id` da payload é mantido ou reutilizado do registro preexistente (`existingRecord?.data?.id || genId('AT')`), tornando a atribuição/preservação de ID atômica e consistente sob a restrição de unicidade `(lesson_id, student_id)`.
- Testes automatizados executados via `npm test` validando 100% de sucesso.
