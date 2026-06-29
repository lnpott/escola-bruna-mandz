/**
 * api/verify-mp-payment.js
 * Consulta o status real de um pagamento diretamente na API do Mercado Pago.
 * Usado pelo painel admin quando há dúvida sobre o status de um pedido
 * (ex: pedido "Pendente" no Supabase mas cliente afirma ter pago).
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD
 *   MERCADO_PAGO_ACCESS_TOKEN
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
    }

    const providedPassword = req.headers['x-admin-password'];
    if (providedPassword !== adminPassword) {
        return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { mpPaymentId } = req.query;
    if (!mpPaymentId) {
        return res.status(400).json({ error: 'mpPaymentId é obrigatório.' });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
        return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado.' });
    }

    try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (mpRes.status === 404) {
            return res.status(404).json({ error: 'Pagamento não encontrado no Mercado Pago.' });
        }
        if (!mpRes.ok) {
            return res.status(502).json({ error: 'Erro ao consultar o Mercado Pago.' });
        }

        const data = await mpRes.json();

        // Retorna só o que é relevante para o painel
        return res.status(200).json({
            mpPaymentId:    data.id,
            status:         data.status,
            statusDetail:   data.status_detail,
            amount:         data.transaction_amount,
            method:         data.payment_method_id,
            dateCreated:    data.date_created,
            dateApproved:   data.date_approved,
            payerEmail:     data.payer?.email,
        });
    } catch (err) {
        console.error('verify-mp-payment: erro:', err.message);
        return res.status(500).json({ error: 'Erro interno.', details: err.message });
    }
}
