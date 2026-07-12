/**
 * api/admin-financial.js
 * API financeira consolidada para o painel admin.
 * Roteamento interno por query string: ?resource=students|teachers|enrollments|tuitions|payments|expenses|investments|teacher_payments|summary
 *
 * Protegido por header 'x-admin-password'.
 *
 * Este arquivo é só um roteador fino — a lógica de cada resource vive em
 * api/_lib/admin/*.js. Continua sendo UM único arquivo em /api (uma única
 * Serverless Function) de propósito: o projeto está no plano Hobby da
 * Vercel, que tem limite de 12 Serverless Functions por deploy. Arquivos
 * dentro de api/_lib/ não contam como funções (mesma convenção já usada
 * por api/_lib/supabase.js), então a divisão em módulos abaixo organiza o
 * código sem aumentar a contagem de funções.
 *
 * ── Etapa 37 ──────────────────────────────────────────────────────────────
 * `tuitions` deixou de carregar dado pedagógico (teacher_id, instrument,
 * duration_minutes, classes_per_week). Esses campos agora vivem em
 * `enrollments`, referenciada por `tuitions.enrollment_id`.
 * Ver painel_registro.md — Etapa 37 para o histórico completo da decisão.
 *
 * ── Etapa 41 ──────────────────────────────────────────────────────────────
 * Refatoração estrutural: os 9 handlers que antes viviam neste arquivo
 * (706 linhas) foram extraídos para api/_lib/admin/*.js, um arquivo por
 * resource. Nenhuma lógica mudou, só a organização do código.
 * Ver painel_registro.md — Etapa 41.
 */

import { getSupabase } from './_lib/supabase.js';
import { checkAdminAuth } from './_lib/admin-auth.js';
import { handleStudents } from './_lib/admin/students.js';
import { handleTeachers } from './_lib/admin/teachers.js';
import { handleEnrollments } from './_lib/admin/enrollments.js';
import { handleTuitions } from './_lib/admin/tuitions.js';
import { handlePayments } from './_lib/admin/payments.js';
import { handleExpenses } from './_lib/admin/expenses.js';
import { handleInvestments } from './_lib/admin/investments.js';
import { handleTeacherPayments } from './_lib/admin/teacher-payments.js';
import { handleSummary } from './_lib/admin/summary.js';

export default async function handler(req, res) {
    if (!checkAdminAuth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        return res.status(500).json({ error: 'Supabase não configurado.', details: err.message });
    }

    const { resource } = req.query;

    try {
        switch (resource) {
            case 'students':         return await handleStudents(req, res, supabase);
            case 'teachers':         return await handleTeachers(req, res, supabase);
            case 'enrollments':      return await handleEnrollments(req, res, supabase);
            case 'tuitions':         return await handleTuitions(req, res, supabase);
            case 'payments':         return await handlePayments(req, res, supabase);
            case 'expenses':         return await handleExpenses(req, res, supabase);
            case 'investments':      return await handleInvestments(req, res, supabase);
            case 'teacher_payments': return await handleTeacherPayments(req, res, supabase);
            case 'summary':          return await handleSummary(req, res, supabase);

            default:
                return res.status(400).json({ error: 'Parâmetro ?resource= inválido ou ausente. Use: students, teachers, enrollments, tuitions, payments, expenses, investments, teacher_payments, summary.' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Erro interno.', details: err.message });
    }
}
