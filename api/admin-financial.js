/**
 * api/admin-financial.js
 * Roteador fino da API financeira do painel admin.
 * Lógica de cada resource em api/_lib/financial/*.js
 *
 * Continua sendo UMA única Serverless Function de propósito:
 * plano Hobby da Vercel tem limite de 12 funções por deploy.
 * Arquivos em api/_lib/ não contam como funções.
 *
 * ── Etapa 37 ──────────────────────────────────────────────────────────────
 * `tuitions` deixou de carregar dado pedagógico (teacher_id, instrument,
 * duration_minutes, classes_per_week). Esses campos agora vivem em
 * `enrollments`, referenciada por `tuitions.enrollment_id`.
 *
 * ── Etapa 42 ──────────────────────────────────────────────────────────────
 * Módulos internos migrados de api/_lib/admin/ para api/_lib/financial/,
 * que é mais completo (CRUD de investments, safeFloat/safeInt, testes).
 */

import { getSupabase }           from './_lib/supabase.js';
import { classifyError }          from './_lib/financial/helpers.js';
import { checkAdminAuth }        from './_lib/admin-auth.js';
import { handleStudents }        from './_lib/financial/students.js';
import { handleTeachers }        from './_lib/financial/teachers.js';
import { handleEnrollments }     from './_lib/financial/enrollments.js';
import { handleTuitions }        from './_lib/financial/tuitions.js';
import { handlePayments }        from './_lib/financial/payments.js';
import { handleExpenses }        from './_lib/financial/expenses.js';
import { handleInvestments }     from './_lib/financial/investments.js';
import { handleTeacherPayments } from './_lib/financial/teacherPayments.js';
import { handleSummary }         from './_lib/financial/summary.js';
import { handleDashboard }       from './_lib/financial/dashboard.js';
import { handleLessons }         from './_lib/financial/lessons.js';
import { handleAttendance }      from './_lib/financial/attendance.js';
import { handleFinancialReport } from './_lib/financial/report.js';
import { handleStorageManager } from './_lib/financial/storage.js';

export default async function handler(req, res) {
    if (!checkAdminAuth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        console.error('Supabase init error:', err);
        return res.status(500).json({ error: 'Supabase não configurado.' });
    }

    const { resource } = req.query;

    // Proteção contra req.body undefined em POST/PATCH (evita TypeError
    // se o frontend enviar Content-Type errado ou corpo vazio).
    if ((req.method === 'POST' || req.method === 'PATCH') && (!req.body || typeof req.body !== 'object')) {
        return res.status(400).json({ error: 'Corpo da requisição ausente ou inválido. Envie um JSON válido.' });
    }

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
            case 'dashboard':        return await handleDashboard(req, res, supabase);
            case 'lessons':          return await handleLessons(req, res, supabase);
            case 'attendance':       return await handleAttendance(req, res, supabase);
            case 'financial_report': return await handleFinancialReport(req, res, supabase);
            case 'storage_manager':  return await handleStorageManager(req, res, supabase);
            default:
                return res.status(400).json({
                    error: 'Parâmetro ?resource= inválido ou ausente. Use: students, teachers, enrollments, tuitions, payments, expenses, investments, teacher_payments, summary, dashboard, lessons, attendance.'
                });
        }
    } catch (err) {
        console.error(`[admin-financial] resource=${resource}`, err);
        const classified = classifyError(err);
        return res.status(classified.statusCode).json({
            error: classified.friendlyMessage,
            errorCode: classified.errorCode,
        });
    }
}
