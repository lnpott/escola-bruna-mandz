/**
 * api/_lib/financial/helpers.js
 * Funções puras compartilhadas por todos os handlers de admin-financial.
 * Extraídas para: (1) reduzir admin-financial.js a um router fino,
 * (2) permitir testes unitários sem precisar de um Supabase real.
 */

export const DEFAULT_PAGE_LIMIT = 200;
export const MAX_PAGE_LIMIT = 1000;

export function genId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function parsePagination(req) {
    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    return { limit, offset };
}

export function monthRange(month, year) {
    const m = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    return {
        dateStart: `${year}-${m}-01`,
        dateEnd:   `${year}-${m}-${lastDay}`,
        tzStart:   `${year}-${m}-01T00:00:00.000Z`,
        tzEnd:     `${year}-${m}-${lastDay}T23:59:59.999Z`,
    };
}

/**
 * Converte valor para número float de forma segura.
 * Previne NaN no banco de dados quando input inválido é recebido.
 */
export function safeFloat(value, fallback = 0, min = -Infinity) {
    if (value === undefined || value === null) return fallback;
    const num = parseFloat(value);
    if (isNaN(num)) return fallback;
    if (num < min) return fallback;
    return num;
}

/**
 * Converte valor para inteiro de forma segura.
 * Previne NaN no banco de dados quando input inválido é recebido.
 */
export function safeInt(value, fallback = 0, min = -Infinity) {
    if (value === undefined || value === null) return fallback;
    const num = parseInt(value, 10);
    if (isNaN(num)) return fallback;
    if (num < min) return fallback;
    return num;
}

/**
 * Resolve o timestamp de paid_at baseado na mudança do campo paid.
 * Se marcado como pago sem data, define paid_at = agora.
 * Se desmarcado (paid = false), limpa paid_at.
 */
export function resolvePaidTimestamp(upd, paid) {
    if (paid === true && !upd.paid_at) {
        upd.paid_at = new Date().toISOString();
    }
    if (paid === false) {
        upd.paid_at = null;
    }
}

/**
 * Normaliza uma string de referência mensal para o formato "YYYY-MM-DD" (date).
 * - "YYYY-MM" → "YYYY-MM-01" (completa com o primeiro dia do mês)
 * - "YYYY-MM-DD" → mantém como está
 * - Outro formato → retorna null para forçar erro 400 na validação
 */
export function normalizeMonthDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
    return null;
}

/**
 * Normaliza campos de texto opcionais em um objeto: se o valor for uma string
 * vazia (""), substitui por null. Isso previne erros de CHECK constraint no
 * banco quando o frontend envia string vazia em vez de omitir o campo.
 */
export function normalizeOptionalFields(obj, fields) {
    for (const field of fields) {
        if (obj[field] === '' || obj[field] === undefined) {
            obj[field] = null;
        }
    }
    return obj;
}

/**
 * Valida CPF com base nos dígitos verificadores.
 * Retorna null se válido, ou uma string de erro se inválido.
 * Aceita CPF com ou sem máscara (só dígitos são considerados).
 */
export function validateCPF(value) {
    if (!value) return null; // campo opcional, não validar se vazio
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) {
        return 'CPF deve ter 11 dígitos.';
    }
    if (/^(\d)\1{10}$/.test(digits)) {
        return 'CPF inválido (dígitos repetidos).';
    }
    // Valida 1º dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
    let rem = (sum * 10) % 11;
    if (rem === 10) rem = 0;
    if (rem !== parseInt(digits[9], 10)) {
        return 'CPF inválido (dígito verificador incorreto).';
    }
    // Valida 2º dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
    rem = (sum * 10) % 11;
    if (rem === 10) rem = 0;
    if (rem !== parseInt(digits[10], 10)) {
        return 'CPF inválido (dígito verificador incorreto).';
    }
    return null;
}

/**
 * Classifica um erro lançado (normalmente do Supabase/Postgres) em um código
 * HTTP e um código de erro amigável. O err.message NÃO é incluído na resposta
 * ao cliente para evitar vazamento de informação — apenas no console.error do
 * servidor (stack trace completo).
 */
export function classifyError(err) {
    const mapping = {
        '23505': { statusCode: 409, errorCode: 'ERR_DB_UNIQUE_VIOLATION',     friendlyMessage: 'Conflito: este registro já existe.' },
        '23503': { statusCode: 409, errorCode: 'ERR_DB_FK_VIOLATION',        friendlyMessage: 'Operação não permitida: existem registros vinculados a este item.' },
        '23514': { statusCode: 400, errorCode: 'ERR_DB_CHECK_VIOLATION',     friendlyMessage: 'Dados inválidos: um ou mais campos não passaram na validação.' },
        '23502': { statusCode: 400, errorCode: 'ERR_DB_NOT_NULL_VIOLATION',  friendlyMessage: 'Um campo obrigatório está ausente ou vazio.' },
    };
    const mapped = mapping[err.code];
    if (mapped) return mapped;
    return { statusCode: 500, errorCode: 'ERR_INTERNAL', friendlyMessage: 'Erro interno do servidor.' };
}

/**
 * Middleware de autenticação simples via header x-admin-password.
 * Retorna false e já escreve a resposta de erro se a auth falhar.
 */
export function auth(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
        return false;
    }
    if (req.headers['x-admin-password'] !== adminPassword) {
        res.status(401).json({ error: 'Senha incorreta.' });
        return false;
    }
    return true;
}
