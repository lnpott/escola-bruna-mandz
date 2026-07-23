/**
 * app/src/utils/formatters.ts
 * Helpers para normalizar e exibir CPF, telefone e valores formatados.
 *
 * Regra: armazenar só dígitos, exibir com máscara.
 */

/** Remove tudo que não for dígito de uma string, limitando a N caracteres */
function onlyDigits(value: string, maxLen: number = 11): string {
    return value.replace(/\D/g, '').slice(0, maxLen);
}

/** Strips mask from CPF (XXX.XXX.XXX-XX → XXXXXXXXXXX) */
export function stripCPF(value: string): string {
    return onlyDigits(value, 11);
}

/** Strips mask from phone ((XX) XXXXX-XXXX → XXXXXXXXXXX) */
export function stripPhone(value: string): string {
    return onlyDigits(value, 11);
}

/** Formats 11 digits as CPF: XXX.XXX.XXX-XX */
export function formatCPF(value: string): string {
    const digits = onlyDigits(value, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.replace(/^(\d{3})(\d+)/, '$1.$2');
    if (digits.length <= 9) return digits.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
}

/** Formats 10/11 digits as Brazilian phone: (XX) XXXXX-XXXX */
export function formatPhone(value: string): string {
    const digits = onlyDigits(value, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 7) {
        return digits.replace(/^(\d{2})(\d+)/, '($1) $2');
    }
    if (digits.length <= 10) {
        return digits.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/** Input mask: applies CPF formatting on every keystroke */
export function maskCPF(value: string): string {
    return formatCPF(value);
}

/** Input mask: applies phone formatting on every keystroke */
export function maskPhone(value: string): string {
    return formatPhone(value);
}

/** Check if a value looks like raw digits (no mask chars) */
function isRawDigits(value: string): boolean {
    return /^\d{10,11}$/.test(value);
}

/** Formata para exibição, detectando automaticamente se já está sem máscara */
export function displayCPF(value?: string | null): string {
    if (!value) return '—';
    if (isRawDigits(value)) return formatCPF(value);
    // Already formatted or unknown — show as-is
    return value;
}

/** Formata telefone para exibição, detectando automaticamente se já está sem máscara */
export function displayPhone(value?: string | null): string {
    if (!value) return '—';
    if (isRawDigits(value)) return formatPhone(value);
    return value;
}

/**
 * Valida CPF verificando os dígitos verificadores.
 * Aceita CPF com ou sem máscara (strip é feito internamente).
 * Retorna { valid: boolean, message: string }.
 */
export function validateCPF(value?: string | null): { valid: boolean; message: string } {
    const digits = value ? onlyDigits(value, 11) : '';

    if (!digits) {
        return { valid: false, message: 'CPF não informado.' };
    }
    if (digits.length !== 11) {
        return { valid: false, message: 'CPF deve ter 11 dígitos.' };
    }

    // Rejeita sequências de dígitos repetidos (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(digits)) {
        return { valid: false, message: 'CPF inválido (dígitos repetidos).' };
    }

    // Valida 1º dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i], 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[9], 10)) {
        return { valid: false, message: 'CPF inválido (dígito verificador incorreto).' };
    }

    // Valida 2º dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(digits[i], 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[10], 10)) {
        return { valid: false, message: 'CPF inválido (dígito verificador incorreto).' };
    }

    return { valid: true, message: 'CPF válido.' };
}
