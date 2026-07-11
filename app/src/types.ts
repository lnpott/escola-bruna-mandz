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

// ── API responses ────────────────────────────────────────────────
export interface StudentsResponse {
    students: Student[];
}

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
