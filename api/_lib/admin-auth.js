/**
 * api/_lib/admin-auth.js
 * Autenticação compartilhada por senha admin (header x-admin-password).
 * Usado por todos os endpoints protegidos do painel.
 */

export function checkAdminAuth(req, res) {
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
