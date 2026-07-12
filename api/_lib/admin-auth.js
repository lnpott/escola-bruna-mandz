/**
 * api/_lib/admin-auth.js
 * Verifica o header x-admin-password em todas as rotas do painel admin.
 */

export function checkAdminAuth(req, res) {
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
