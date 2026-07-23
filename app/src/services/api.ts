import type { Student, Teacher, StudentsResponse, TeachersResponse, DashboardData, Lesson, Enrollment, LessonsResponse, EnrollmentsResponse, Payment, Expense, Investment, TeacherPayment, FinancialSummary, PaymentsResponse, ExpensesResponse, InvestmentsResponse, TeacherPaymentsResponse } from '@/types';

export const API_BASE = '/api/admin-financial';

// ── Auth ──────────────────────────────────────────────────────────
/**
 * Verifica se a senha admin está armazenada na sessão.
 */
export function isAuthenticated(): boolean {
    return !!sessionStorage.getItem('admin_password');
}

/**
 * Testa uma senha contra a API. Se retornar true, a senha é válida.
 */
export async function verifyPassword(password: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}?resource=students&limit=1`, {
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': password,
            },
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Salva a senha na sessão e retorna true se for válida.
 */
export async function login(password: string): Promise<boolean> {
    const valid = await verifyPassword(password);
    if (valid) {
        sessionStorage.setItem('admin_password', password);
    }
    return valid;
}

/**
 * Remove a senha da sessão (logout).
 */
export function logout(): void {
    sessionStorage.removeItem('admin_password');
}

async function request<T>(
    resource: string,
    options: RequestInit = {}
): Promise<T> {
    // Get password from session storage (set by login flow)
    const password = sessionStorage.getItem('admin_password');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (password) {
        headers['x-admin-password'] = password;
    }

    const url = `${API_BASE}?resource=${resource}`;
    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Se senha inválida/expirada, invalida a sessão local para evitar “loop” de 401.
        if (response.status === 401) {
            sessionStorage.removeItem('admin_password');
        }

        const errorBody = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        const message =
            errorBody?.error ||
            (response.status === 401 ? 'Senha admin inválida ou expirada. Faça login novamente.' : `HTTP ${response.status}`);

        throw new Error(message);
    }

    return response.json();
}

// ── Students ────────────────────────────────────────────────────

export async function fetchStudents(): Promise<Student[]> {
    const data = await request<StudentsResponse>('students');
    return data.students;
}

export async function createStudent(
    student: Omit<Student, 'id' | 'created_at' | 'updated_at'>
): Promise<Student> {
    const data = await request<{ student: Student }>('students', {
        method: 'POST',
        body: JSON.stringify(student),
    });
    return data.student;
}

export async function updateStudent(
    id: string,
    updates: Partial<Student>
): Promise<Student> {
    const data = await request<{ student: Student }>('students', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.student;
}

// ── Dashboard ─────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardData['dashboard']> {
    const data = await request<DashboardData>('dashboard');
    return data.dashboard;
}

// ── Student by ID ──────────────────────────────────────────────

export async function fetchStudentById(id: string): Promise<Student | null> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=students&id=${encodeURIComponent(id)}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        if (response.status === 404) return null;
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: StudentsResponse = await response.json();
    return data.students?.[0] || null;
}

// ── Teachers ───────────────────────────────────────────────────

export async function fetchTeachers(): Promise<Teacher[]> {
    const data = await request<TeachersResponse>('teachers');
    return data.teachers;
}

export async function createTeacher(
    teacher: Omit<Teacher, 'id' | 'active' | 'created_at' | 'updated_at'>
): Promise<Teacher> {
    const data = await request<{ teacher: Teacher }>('teachers', {
        method: 'POST',
        body: JSON.stringify(teacher),
    });
    return data.teacher;
}

export async function updateTeacher(
    id: string,
    updates: Partial<Teacher>
): Promise<Teacher> {
    const data = await request<{ teacher: Teacher }>('teachers', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.teacher;
}

export async function deleteTeacher(id: string): Promise<void> {
    await request(`teachers&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

export async function deleteStudent(id: string): Promise<void> {
    await request(`students&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

// ── Agenda / Lessons ──────────────────────────────────────────────

export async function fetchLessons(params: {
    date_from?: string;
    date_to?: string;
    date?: string;
    student_id?: string;
    teacher_id?: string;
    status?: string;
    limit?: number;
}): Promise<Lesson[]> {
    const searchParams = new URLSearchParams({ resource: 'lessons' });
    if (params.date_from) searchParams.set('date_from', params.date_from);
    if (params.date_to) searchParams.set('date_to', params.date_to);
    if (params.date) searchParams.set('date', params.date);
    if (params.student_id) searchParams.set('student_id', params.student_id);
    if (params.teacher_id) searchParams.set('teacher_id', params.teacher_id);
    if (params.status) searchParams.set('status', params.status);
    if (params.limit) searchParams.set('limit', String(params.limit));

    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?${searchParams.toString()}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: LessonsResponse = await response.json();
    return data.lessons;
}

export async function createLesson(
    lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at' | 'end_time'> & { duration_minutes: number }
): Promise<Lesson> {
    const data = await request<{ lesson: Lesson }>('lessons', {
        method: 'POST',
        body: JSON.stringify(lesson),
    });
    return data.lesson;
}

export async function updateLesson(
    id: string,
    updates: Partial<Lesson>
): Promise<Lesson> {
    const data = await request<{ lesson: Lesson }>('lessons', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.lesson;
}

export async function deleteLesson(id: string): Promise<void> {
    await request(`lessons&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

// ── Enrollments ──────────────────────────────────────────────────

export async function fetchEnrollments(params?: {
    status?: string;
}): Promise<Enrollment[]> {
    const searchParams = new URLSearchParams({ resource: 'enrollments' });
    if (params?.status) searchParams.set('status', params.status);

    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?${searchParams.toString()}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: EnrollmentsResponse = await response.json();
    return data.enrollments;
}

export async function createEnrollment(
    enrollment: Omit<Enrollment, 'id' | 'created_at' | 'updated_at' | 'students' | 'teachers'>
): Promise<Enrollment> {
    const data = await request<{ enrollment: Enrollment }>('enrollments', {
        method: 'POST',
        body: JSON.stringify(enrollment),
    });
    return data.enrollment;
}

export async function updateEnrollment(
    id: string,
    updates: Partial<Enrollment>
): Promise<Enrollment> {
    const data = await request<{ enrollment: Enrollment }>('enrollments', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.enrollment;
}

/**
 * Exclui um vínculo (enrollment).
 * @param cancelTuitions Se true, também cancela mensalidades pendentes/atrasadas do vínculo.
 */
export async function deleteEnrollment(id: string, cancelTuitions?: boolean): Promise<{
    success: boolean;
    cancelled_tuitions: number;
    message: string;
}> {
    let resource = `enrollments&id=${encodeURIComponent(id)}`;
    if (cancelTuitions) resource += '&cancel_tuitions=true';
    return request(resource, {
        method: 'DELETE',
    });
}

// ── Financial Summary ───────────────────────────────────────────────

export async function fetchFinancialSummary(month: number, year: number): Promise<FinancialSummary['summary']> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=summary&month=${month}&year=${year}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: FinancialSummary = await response.json();
    return data.summary;
}

// ── Payments (Receitas Avulsas) ──────────────────────────────────────

export async function fetchPayments(month: number, year: number, category?: string): Promise<Payment[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    let url = `${API_BASE}?resource=payments&month=${month}&year=${year}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: PaymentsResponse = await response.json();
    return data.payments;
}

export async function createPayment(
    payment: { student_id?: string; description: string; amount: number; payment_method: string; paid_at: string; category: string }
): Promise<Payment> {
    const data = await request<{ payment: Payment }>('payments', {
        method: 'POST',
        body: JSON.stringify(payment),
    });
    return data.payment;
}

// ── Expenses (Custos) ───────────────────────────────────────────────

export async function fetchExpenses(month: number, year: number, paid?: boolean): Promise<Expense[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    let url = `${API_BASE}?resource=expenses&month=${month}&year=${year}`;
    if (paid !== undefined) url += `&paid=${paid}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: ExpensesResponse = await response.json();
    return data.expenses;
}

export async function createExpense(
    expense: { description: string; amount: number; category: string; due_date: string; paid?: boolean; expense_type?: string }
): Promise<Expense> {
    const data = await request<{ expense: Expense }>('expenses', {
        method: 'POST',
        body: JSON.stringify(expense),
    });
    return data.expense;
}

export async function updateExpense(
    id: string,
    updates: Partial<Expense>
): Promise<Expense> {
    const data = await request<{ expense: Expense }>('expenses', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.expense;
}

// ── Investments ─────────────────────────────────────────────────────

export async function fetchInvestments(month: number, year: number): Promise<Investment[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=investments&month=${month}&year=${year}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: InvestmentsResponse = await response.json();
    return data.investments;
}

export async function createInvestment(
    investment: { description: string; amount: number; category: string; purchased_at: string; notes?: string }
): Promise<Investment> {
    const data = await request<{ investment: Investment }>('investments', {
        method: 'POST',
        body: JSON.stringify(investment),
    });
    return data.investment;
}

// ── Attendance (Presença) ──────────────────────────────────────

export async function fetchAttendanceByLesson(lessonId: string): Promise<{
    id: string;
    lesson_id: string;
    student_id: string;
    status: string;
    late_minutes: number;
    notes?: string;
    recorded_at: string;
}[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=attendance&lesson_id=${encodeURIComponent(lessonId)}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.attendance || [];
}

export async function fetchAttendanceByStudent(studentId: string): Promise<{
    id: string;
    lesson_id: string;
    student_id: string;
    status: string;
    late_minutes: number;
    notes?: string;
    recorded_at: string;
}[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=attendance&student_id=${encodeURIComponent(studentId)}&limit=500`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.attendance || [];
}

export async function upsertAttendance(
    lesson_id: string,
    student_id: string,
    status: string,
    late_minutes?: number,
    notes?: string
): Promise<any> {
    const data = await request<any>('attendance', {
        method: 'POST',
        body: JSON.stringify({ lesson_id, student_id, status, late_minutes: late_minutes || 0, notes }),
    });
    return data.attendance;
}

// ── Teacher Payments (Pagamentos a Professores) ─────────────────────

// ── Generate Lessons from Enrollment ────────────────────────────

export async function generateLessonsFromEnrollment(
    enrollmentId: string,
    weeks: number = 4
): Promise<{
    created: number;
    skipped: number;
    enrollment: string;
    weeks: number;
    message: string;
}> {
    return request<any>('enrollments', {
        method: 'POST',
        body: JSON.stringify({ action: 'generate_lessons', id: enrollmentId, weeks }),
    });
}

// ── Financial Report (detailed) ─────────────────────────────────────

export async function fetchFinancialReport(params: {
    month?: number;
    year?: number;
    date_from?: string;
    date_to?: string;
}): Promise<import('@/types').FinancialReport> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const searchParams = new URLSearchParams({ resource: 'financial_report' });
    if (params.month) searchParams.set('month', String(params.month));
    if (params.year) searchParams.set('year', String(params.year));
    if (params.date_from) searchParams.set('date_from', params.date_from);
    if (params.date_to) searchParams.set('date_to', params.date_to);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
}

export async function fetchTeacherPayments(month: number, year: number, paid?: boolean): Promise<TeacherPayment[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    let url = `${API_BASE}?resource=teacher_payments&month=${month}&year=${year}`;
    if (paid !== undefined) url += `&paid=${paid}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: TeacherPaymentsResponse = await response.json();
    return data.teacher_payments;
}

// ── Monthly Trend (last N months) ────────────────────────────────

export async function fetchMonthlyTrend(monthsBack: number = 6): Promise<{
    month: number;
    year: number;
    label: string;
    revenue: number;
    outgoings: number;
    balance: number;
    pending_tuitions: number;
}[]> {
    const now = new Date();
    const months = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }
    const results = await Promise.all(months.map(async ({ month, year }) => {
        try {
            const summary = await fetchFinancialSummary(month, year);
            return {
                month,
                year,
                label: `${String(month).padStart(2, '0')}/${year}`,
                revenue: summary.revenue,
                outgoings: summary.outgoings,
                balance: summary.balance,
                pending_tuitions: summary.pending_tuitions,
            };
        } catch {
            return {
                month,
                year,
                label: `${String(month).padStart(2, '0')}/${year}`,
                revenue: 0,
                outgoings: 0,
                balance: 0,
                pending_tuitions: 0,
            };
        }
    }));
    return results;
}



// ── Student Detail helpers ────────────────────────────────────────

export async function fetchLessonsByStudent(studentId: string): Promise<Lesson[]> {
    return fetchLessons({ student_id: studentId, limit: 200 });
}

export async function fetchEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=enrollments&student_id=${encodeURIComponent(studentId)}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: EnrollmentsResponse = await response.json();
    return data.enrollments;
}

export async function fetchTuitionsByStudent(studentId: string): Promise<{
    id: string;
    student_id: string;
    enrollment_id?: string;
    reference_month: string;
    amount: number;
    due_date: string;
    status: string;
    paid_at?: string;
    students?: { name: string } | null;
    enrollments?: { instrument?: string } | null;
}[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=tuitions&student_id=${encodeURIComponent(studentId)}&limit=100`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.tuitions || [];
}

export async function fetchPaymentsByStudent(studentId: string): Promise<Payment[]> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=payments&student_id=${encodeURIComponent(studentId)}&limit=100`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    const data: PaymentsResponse = await response.json();
    return data.payments;
}

// ── Store / Products ────────────────────────────────────────────────

const ADMIN_PRODUCTS_BASE = '/api/admin-products';
const UPLOAD_IMAGE_BASE = '/api/upload-image';
const ADMIN_ORDERS_BASE = '/api/admin-orders';
const UPDATE_ORDER_STATUS_BASE = '/api/update-order-status';

async function storeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (password) headers['x-admin-password'] = password;

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        if (response.status === 401) {
            sessionStorage.removeItem('admin_password');
        }
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
}

export async function fetchAdminProducts(): Promise<import('@/types').Product[]> {
    const data = await storeRequest<{ products: import('@/types').Product[] }>(ADMIN_PRODUCTS_BASE);
    return data.products;
}

export async function createAdminProduct(
    product: { name: string; description?: string; price: number; stock: number; category: string; active?: boolean; badge?: string; image?: string }
): Promise<import('@/types').Product> {
    const data = await storeRequest<{ product: import('@/types').Product }>(ADMIN_PRODUCTS_BASE, {
        method: 'POST',
        body: JSON.stringify(product),
    });
    return data.product;
}

/**
 * Faz upload de uma imagem de produto para o Supabase Storage.
 * Retorna a URL pública da imagem.
 */
export async function uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = {};
    if (password) headers['x-admin-password'] = password;

    const response = await fetch(UPLOAD_IMAGE_BASE, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        if (response.status === 401) {
            sessionStorage.removeItem('admin_password');
        }
        const err = await response.json().catch(() => ({ error: 'Erro ao fazer upload.' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.url;
}

export async function updateAdminProduct(
    id: string,
    updates: Partial<import('@/types').Product>
): Promise<import('@/types').Product> {
    const data = await storeRequest<{ product: import('@/types').Product }>(ADMIN_PRODUCTS_BASE, {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.product;
}

// ── Store / Orders ───────────────────────────────────────────────────

export async function fetchOrders(): Promise<import('@/types').Order[]> {
    const data = await storeRequest<{ orders: import('@/types').Order[] }>(ADMIN_ORDERS_BASE);
    return data.orders;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<import('@/types').Order> {
    const data = await storeRequest<{ order: import('@/types').Order }>(UPDATE_ORDER_STATUS_BASE, {
        method: 'POST',
        body: JSON.stringify({ orderId, status }),
    });
    return data.order;
}

// ── Storage Manager ────────────────────────────────────────────

const STORAGE_MANAGER_RESOURCE = 'storage_manager';

export interface StorageFile {
    name: string;
    filePath: string;
    url: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    isOrphan: boolean;
    linkedTo: { id: string; name: string }[];
}

export interface StorageStats {
    totalImages: number;
    totalSize: number;
    totalSizeFormatted: string;
    orphanedCount: number;
    orphanedSize: number;
    orphanedSizeFormatted: string;
    linkedCount: number;
}

export interface StorageManagerResponse {
    success: boolean;
    stats: StorageStats;
    images: StorageFile[];
}

/**
 * Lista todas as imagens no Storage com status de órfã.
 */
export async function fetchStorageFiles(): Promise<StorageManagerResponse> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const response = await fetch(`${API_BASE}?resource=${STORAGE_MANAGER_RESOURCE}`, { headers });
    if (!response.ok) {
        if (response.status === 401) sessionStorage.removeItem('admin_password');
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * Exclui uma imagem do Storage.
 */
export async function deleteStorageFile(filePath: string): Promise<void> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=${STORAGE_MANAGER_RESOURCE}&filePath=${encodeURIComponent(filePath)}`;
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) {
        if (response.status === 401) sessionStorage.removeItem('admin_password');
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
}

/**
 * Exclui múltiplas imagens órfãs de uma vez.
 */
export async function cleanOrphanedFiles(filePaths: string[]): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const fp of filePaths) {
        try {
            await deleteStorageFile(fp);
            deleted++;
        } catch {
            // Continua com a próxima
        }
    }
    return { deleted };
}

// ── Teacher Payments (Pagamentos a Professores) ─────────────────────

export async function createTeacherPayment(
    tp: { teacher_id: string; reference_month: string; amount: number; paid?: boolean; paid_at?: string; notes?: string }
): Promise<TeacherPayment> {
    const data = await request<{ teacher_payment: TeacherPayment }>('teacher_payments', {
        method: 'POST',
        body: JSON.stringify(tp),
    });
    return data.teacher_payment;
}

export async function updateTeacherPayment(
    id: string,
    updates: Partial<TeacherPayment>
): Promise<TeacherPayment> {
    const data = await request<{ teacher_payment: TeacherPayment }>('teacher_payments', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
    });
    return data.teacher_payment;
}

export async function deleteTeacherPayment(id: string): Promise<void> {
    await request(`teacher_payments&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

/**
 * Gera pagamentos a professores automaticamente para um mês/ano.
 * rate_per_class × aulas completadas no mês.
 */
export async function generateTeacherPayments(month: number, year: number): Promise<{
    generated: { teacher_id: string; teacher_name: string; completed_lessons: number; amount: number; payment_id: string }[];
    skipped: { teacher_id: string; teacher_name: string; reason: string }[];
    summary: { total_teachers: number; generated_count: number; skipped_count: number; total_amount: number };
}> {
    const password = sessionStorage.getItem('admin_password');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (password) headers['x-admin-password'] = password;

    const url = `${API_BASE}?resource=teacher_payments&action=generate&month=${month}&year=${year}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
}
