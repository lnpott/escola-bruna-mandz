/**
 * api/_lib/admin/shared.js
 * Helpers usados por vários resources da API financeira do painel.
 */

export function genId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
