/**
 * tests/_helpers/supabase-mock.js
 *
 * Mock encadeável do Supabase para testes unitários dos handlers
 * financeiros. Suporta:
 * - Retorno estático por tabela: { tabela: { data, error } }
 * - Retorno em sequência: { tabela: [{ data, count, error }, { data, error }] }
 * - Registro de chamadas (._calls) para assertions
 *
 * Uso:
 *   import { makeSupabaseMock, makeRes } from './_helpers/supabase-mock.js';
 *
 *   const supabase = makeSupabaseMock({ students: { data: [...], error: null } });
 *   const req = { method: 'GET', query: {} };
 *   const res = makeRes();
 *   await handleStudents(req, res, supabase);
 */

/**
 * Cria um mock do cliente Supabase.
 * @param {Object} tableResults - Mapa de { nomeTabela: { data, error } }
 * @returns {Object} Mock com .from() e ._calls para assertions
 */
export function makeSupabaseMock(tableResults = {}) {
    const calls = { from: [] };
    const counters = {};

    function getResult(tableName) {
        const result = tableResults[tableName];
        if (Array.isArray(result)) {
            counters[tableName] = (counters[tableName] || 0);
            const idx = counters[tableName];
            counters[tableName]++;
            return result[idx] ?? result[result.length - 1] ?? { data: [], error: null };
        }
        return result ?? { data: [], error: null };
    }

    function makeChain(tableName) {
        const chain = {
            select: (...args) => {
                calls.select = calls.select || [];
                calls.select.push({ table: tableName, args });
                return chain;
            },
            order: () => chain,
            range: () => chain,
            eq: (...args) => {
                calls.eq = calls.eq || [];
                calls.eq.push({ table: tableName, args });
                return chain;
            },
            in: (...args) => {
                calls.in = calls.in || [];
                calls.in.push({ table: tableName, args });
                return chain;
            },
            gt: () => chain,
            gte: () => chain,
            lte: () => chain,
            insert: (rows) => {
                calls.insert = calls.insert || [];
                calls.insert.push({ table: tableName, rows });
                return chain;
            },
            update: (upd) => {
                calls.update = calls.update || [];
                calls.update.push({ table: tableName, upd });
                return chain;
            },
            delete: () => chain,
            single: () => chain,
            maybeSingle: () => chain,
            head: () => chain,
            then: (resolve) => {
                const result = getResult(tableName);
                return resolve(result);
            },
        };
        return chain;
    }

    return {
        from: (table) => {
            calls.from.push(table);
            return makeChain(table);
        },
        _calls: calls,
    };
}

/**
 * Cria um mock do objeto res (ServerResponse) com .status() e .json().
 * @returns {Object} Mock com statusCode, body, status(code), json(payload)
 */
export function makeRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
}
