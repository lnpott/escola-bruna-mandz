/**
 * api/test-notify.js
 * Rota temporária para testar o envio de e-mail de notificação.
 * REMOVER após confirmar que o e-mail está chegando corretamente.
 */

import { notifyNewOrder } from './notify-new-order.js';

export default async function handler(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (req.headers['x-admin-password'] !== adminPassword) {
        return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const fakeOrder = {
        id: 'TEST-001',
        created_at: new Date().toISOString(),
        customer_name: 'João Teste',
        customer_email: 'joao@teste.com',
        customer_phone: '(31) 99999-9999',
        method: 'pix',
        total: 69.90,
        earned_xp: 70,
        items: [
            { name: 'Camisa Rock', quantity: 1, variant: 'G' },
            { name: 'Palheta Personalizada', quantity: 2, variant: null },
        ],
    };

    try {
        await notifyNewOrder(fakeOrder);
        return res.status(200).json({ ok: true, message: 'E-mail de teste disparado. Verifique a caixa de entrada.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
