// ── Student lifecycle status ────────────────────────────────────
export type StudentStatus =
    | 'lead'
    | 'interested'
    | 'enrolled'
    | 'active'
    | 'suspended'
    | 'completed'
    | 'cancelled';

export type StudentSource =
    | ''
    | 'website'
    | 'indicacao'
    | 'social'
    | 'presencial'
    | 'outro';

// ── Student ──────────────────────────────────────────────────────
export interface Student {
    id: string;
    name: string;
    cpf?: string;
    email?: string;
    phone?: string;
    address?: string;
    instruments?: string;
    status: StudentStatus;
    source?: StudentSource;
    enrolled_at?: string;
    guardian_name?: string;
    guardian_cpf?: string;
    guardian_phone?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

// ── Dashboard ───────────────────────────────────────────────────
export interface DashboardData {
    dashboard: {
        financial: {
            revenue: number;
            outgoings: number;
            balance: number;
            pending_tuitions: number;
            overdue_students: number;
        };
        school: {
            active_students: number;
            active_teachers: number;
            today_classes: LessonBrief[];
            today_classes_count: number;
        };
        store: {
            pending_orders: number;
            recent_orders: OrderBrief[];
            low_stock_products: ProductBrief[];
        };
    };
}

export interface LessonBrief {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    lesson_type: string;
    status: string;
    students: { name: string };
    teachers: { name: string; specialty: string } | null;
    enrollments: { monthly_fee: number; day_of_week: string } | null;
}

export interface OrderBrief {
    id: string;
    customer_name: string;
    total: number;
    created_at: string;
    status: string;
}

export interface ProductBrief {
    id: string;
    name: string;
    stock: number;
    active: boolean;
}

// ── Teacher ──────────────────────────────────────────────────────
export interface Teacher {
    id: string;
    name: string;
    cpf?: string;
    email?: string;
    phone?: string;
    specialty?: string;
    rate_per_class: number;
    days_of_week: string[] | string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

// ── API responses ────────────────────────────────────────────────
export interface StudentsResponse {
    students: Student[];
}

export interface TeachersResponse {
    teachers: Teacher[];
}

export const DAY_LABELS: Record<string, string> = {
    seg: 'Seg',
    ter: 'Ter',
    qua: 'Qua',
    qui: 'Qui',
    sex: 'Sex',
    sab: 'Sáb',
    dom: 'Dom',
};

// ── Status display config ────────────────────────────────────────
export const STATUS_LABELS: Record<StudentStatus, string> = {
    lead: 'Lead',
    interested: 'Interessado',
    enrolled: 'Matriculado',
    active: 'Ativo',
    suspended: 'Trancado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
};

export const STATUS_CLASSES: Record<StudentStatus, string> = {
    lead: 'status-pending',
    interested: 'status-pending',
    enrolled: 'status-approved',
    active: 'status-approved',
    suspended: 'status-warn',
    completed: 'status-approved',
    cancelled: 'status-cancelled',
};

export const STATUS_ICONS: Record<StudentStatus, string> = {
    lead: '📋',
    interested: '🔍',
    enrolled: '📝',
    active: '✅',
    suspended: '⏸️',
    completed: '🎓',
    cancelled: '❌',
};

export const SOURCE_LABELS: Record<string, string> = {
    '': 'Não informado',
    website: '🌐 Site/Google',
    indicacao: '👥 Indicação',
    social: '📱 Redes Sociais',
    presencial: '🏫 Presencial',
    outro: '🔄 Outro',
};

// ── Lesson / Agenda ────────────────────────────────────────────────
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'make_up';
export type LessonType = 'regular' | 'make_up' | 'extra' | 'trial';

export interface Lesson {
    id: string;
    enrollment_id?: string;
    student_id: string;
    teacher_id?: string;
    instrument?: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    lesson_type: LessonType;
    status: LessonStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
    enrollments?: { monthly_fee: number; day_of_week: string } | null;
    students?: { name: string } | null;
    teachers?: { name: string; specialty: string } | null;
}

export interface LessonsResponse {
    lessons: Lesson[];
}

export interface Enrollment {
    id: string;
    student_id: string;
    teacher_id?: string;
    instrument?: string;
    day_of_week?: string;
    class_time?: string;
    duration_minutes: number;
    classes_per_week: number;
    monthly_fee: number;
    billing_type: 'weekly' | 'monthly' | 'full';
    total_amount?: number;
    installments: number;
    status: string;
    notes?: string;
    students?: { name: string } | null;
    teachers?: { name: string; specialty: string } | null;
}

export interface EnrollmentsResponse {
    enrollments: Enrollment[];
}

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
    scheduled: '📅 Agendada',
    completed: '✅ Realizada',
    cancelled: '❌ Cancelada',
    make_up: '🔄 Reposição',
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
    regular: 'Regular',
    make_up: 'Reposição',
    extra: 'Extra',
    trial: 'Experimental',
};

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ── Financial ────────────────────────────────────────────────────
export interface Payment {
    id: string;
    student_id?: string | null;
    description: string;
    amount: number;
    payment_method: string;
    paid_at: string;
    category: string;
    students?: { name: string } | null;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    due_date: string;
    paid: boolean;
    paid_at?: string | null;
    expense_type: string;
}

export interface Investment {
    id: string;
    description: string;
    amount: number;
    category: string;
    purchased_at: string;
    notes?: string | null;
}

export interface TeacherPayment {
    id: string;
    teacher_id: string;
    reference_month: string;
    amount: number;
    paid: boolean;
    paid_at?: string | null;
    notes?: string | null;
    teachers?: { name: string; specialty: string } | null;
}

export interface FinancialSummary {
    summary: {
        revenue: number;
        outgoings: number;
        balance: number;
        pending_tuitions: number;
        overdue_students: number;
        pending_teacher_payments: number;
    };
}

export interface PaymentsResponse {
    payments: Payment[];
}

export interface ExpensesResponse {
    expenses: Expense[];
}

export interface InvestmentsResponse {
    investments: Investment[];
}

export interface TeacherPaymentsResponse {
    teacher_payments: TeacherPayment[];
}

export const CATEGORY_LABELS: Record<string, string> = {
    material: 'Material',
    matricula: 'Matrícula',
    aula_extra: 'Aula Extra',
    outro: 'Outro',
    aluguel: 'Aluguel',
    luz: 'Energia/Luz',
    agua: 'Água',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    pix: 'PIX',
    card: 'Cartão',
    money: 'Dinheiro',
    other: 'Outro',
};

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
    fixed: 'Fixo',
    variable: 'Variável',
};

// ── Admin/store financial types (reused) ───────────────────────────
export interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: string;
    created_at: string;
    items?: string;
    shipping_address?: string;
    payment_method?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    active: boolean;
    sizes?: string;
    badge?: string;
    created_at: string;
}
