/**
 * api/_lib/admin-auth.js
 * Verifica o header x-admin-password em todas as rotas do painel admin.
 * Também valida o Origin da requisição para proteção contra CSRF.
 */

const ALLOWED_ORIGINS = [
    'https://escola-bruna-mandz.vercel.app',
    // domínios de preview do Vercel
    /^https:\/\/escola-bruna-mandz-[a-z0-9-]+-lnpotts-projects\.vercel\.app$/,
];

function isOriginAllowed(origin) {
    if (!origin) return false; // ausência de Origin bloqueia
    return ALLOWED_ORIGINS.some((allowed) =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    );
}

export function checkAdminAuth(req, res) {
    // ── Validação de Origin (CSRF) ──────────────────────────────────
    // Em desenvolvimento local (NODE_ENV !== 'production') a checagem é
    // relaxada para permitir Vite dev server e testes automatizados.
    if (process.env.NODE_ENV === 'production') {
        const origin = req.headers['origin'] || req.headers['referer'] || '';
        const normalizedOrigin = origin.replace(/\/$/, '').split('/').slice(0, 3).join('/');
        if (!isOriginAllowed(normalizedOrigin)) {
            res.status(403).json({ error: 'Origem não permitida.' });
            return false;
        }
    }

    // ── Senha admin ─────────────────────────────────────────────────
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
        return false;
    }
    const provided = req.headers['x-admin-password'];
    if (provided !== adminPassword) {
        res.status(401).json({ error: 'Senha incorreta.' });
        return false;
    }
    return true;
}
