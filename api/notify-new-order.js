/**
 * api/notify-new-order.js
 * Envia e-mail de notificação quando um pedido novo é aprovado.
 * Chamado internamente pelo webhook.js após confirmar pagamento aprovado.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   RESEND_API_KEY  → chave da API do Resend (resend.com — plano gratuito: 3.000 e-mails/mês)
 *   NOTIFY_EMAIL    → e-mail da Bruna que vai receber as notificações
 */

const money = (n) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

export async function notifyNewOrder(order) {
    const apiKey   = process.env.RESEND_API_KEY;
    const notifyTo = process.env.NOTIFY_EMAIL;

    if (!apiKey || !notifyTo) {
        console.warn('notify-new-order: RESEND_API_KEY ou NOTIFY_EMAIL não configurados — pulando notificação.');
        return;
    }

    const items = Array.isArray(order.items)
        ? order.items
              .map((i) => `• ${i.name || i.id}${i.quantity > 1 ? ` ×${i.quantity}` : ''}${i.variant ? ` (${i.variant})` : ''}`)
              .join('\n')
        : '—';

    const method = (order.method || '').toUpperCase() === 'BANK_TRANSFER' ? 'PIX' : (order.method || '').toUpperCase();

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#09090b;color:#e4e4e7;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#18181b;border:1px solid #27272a;border-radius:16px;padding:28px;">
    <h2 style="margin:0 0 4px;color:#fff;">🛍️ Novo pedido aprovado!</h2>
    <p style="color:#a1a1aa;font-size:13px;margin:0 0 24px;">Loja Oficial Bruna Mandz</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#a1a1aa;width:110px;">Pedido</td>    <td><strong>${order.id}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Cliente</td>   <td>${order.customer_name || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">E-mail</td>    <td>${order.customer_email || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Método</td>    <td>${method}</td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Total</td>     <td><strong style="color:#86efac;">${money(order.total)}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">XP gerado</td> <td>+${order.earned_xp || 0}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #27272a;margin:20px 0;">

    <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px;">Itens do pedido:</p>
    <pre style="font-family:system-ui,sans-serif;font-size:13px;color:#e4e4e7;margin:0;white-space:pre-wrap;">${items}</pre>

    <hr style="border:none;border-top:1px solid #27272a;margin:20px 0;">

    <p style="font-size:12px;color:#52525b;margin:0;">
      Acesse o painel para gerenciar este pedido.
    </p>
  </div>
</body>
</html>`;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: 'Loja Bruna Mandz <onboarding@resend.dev>',
                to:   [notifyTo],
                subject: `🛍️ Novo pedido: ${money(order.total)} — ${order.customer_name || 'Cliente'}`,
                html,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('notify-new-order: falha ao enviar e-mail:', err);
        } else {
            console.log('notify-new-order: e-mail enviado para', notifyTo);
        }
    } catch (err) {
        console.error('notify-new-order: erro inesperado:', err.message);
    }
}
