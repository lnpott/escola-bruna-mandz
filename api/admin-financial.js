/**
 * api/admin-financial.js
 * API financeira/acadêmica consolidada para o painel admin.
 * Roteamento interno por query string: ?resource=students|teachers|enrollments|
 * tuitions|payments|expenses|investments|teacher_payments|lessons|attendance|
 * summary|dashboard
 *
 * Protegido por header 'x-admin-password'.
 *
 * Consolida os endpoints em 1 único arquivo (Vercel Function) para respeitar
 * o limite de 12 Serverless Functions do Vercel Hobby plan. A lógica de cada
 * recurso vive em módulos separados sob api/_lib/financial/ — este arquivo é
 * só o router + tratamento de erro central.
 *
 * ── Refatoração (jul/2026) ───────────────────────────────────────────────
 * Este arquivo tinha ~1300 linhas com todos os handlers inline. Foi dividido
 * em módulos por recurso para facilitar manutenção e testes, sem mudar o
 * contrato HTTP (mesmas rotas, mesmos payloads). Ver painel_registro.md.
 */

import { getSupabase } from './_lib/supabase.js';
import { auth, classifyError } from './_lib/financial/helpers.js';

import { handleStudents } from './_lib/financial/students.js';
import { handleTeachers } from './_lib/financial/teachers.js';
import { handleEnrollments } from './_lib/financial/enrollments.js';
import { handleTuitions } from './_lib/financial/tuitions.js';
import { handlePayments } from './_lib/financial/payments.js';
import { handleExpenses } from './_lib/financial/expenses.js';
import { handleInvestments } from './_lib/financial/investments.js';
import { handleTeacherPayments } from './_lib/financial/teacherPayments.js';
import { handleLessons } from './_lib/financial/lessons.js';
import { handleAttendance } from './_lib/financial/attendance.js';
import { handleSummary } from './_lib/financial/summary.js';
import { handleDashboard } from './_lib/financial/dashboard.js';

const RESOURCES = {
    dashboard: handleDashboard,
    students: handleStudents,
    teachers: handleTeachers,
    enrollments: handleEnrollments,
    tuitions: handleTuitions,
    payments: handlePayments,
    expenses: handleExpenses,
    investments: handleInvestments,
    teacher_payments: handleTeacherPayments,
    lessons: handleLessons,
    attendance: handleAttendance,
    summary: handleSummary,
};

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        console.error('Supabase não configurado:', err.message);
        return res.status(500).json({ error: 'Supabase não configurado.' });
    }

    const { resource } = req.query;
    const resourceHandler = RESOURCES[resource];

    if (!resourceHandler) {
        return res.status(400).json({
            error: `Parâmetro ?resource= inválido ou ausente. Use: ${Object.keys(RESOURCES).join(', ')}.`,
        });
    }

    try {
        return await resourceHandler(req, res, supabase);
    } catch (err) {
        const classified = classifyError(err);
        console.error(`[${classified.errorCode}] ${err.stack || err.message}`);
        return res.status(classified.statusCode).json({
            error: classified.friendlyMessage,
            code: classified.errorCode,
        });
    }
}
