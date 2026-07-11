import type { Student, StudentsResponse } from '@/types';

const API_BASE = '/api/admin-financial';

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
        const errorBody = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorBody.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// ── Students ────────────────────────────────────────────────────

export async function fetchStudents(): Promise<Student[]> {
    const data = await request<StudentsResponse>('students');
    return data.students;
}

export async function createStudent(
    student: Omit<Student, 'id' | 'active' | 'created_at' | 'updated_at'>
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

export async function deleteStudent(id: string): Promise<void> {
    await request(`students&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}
