/**
 * api/config.js
 * Devolve configurações públicas (não-secretas) para o front-end carregar em runtime.
 * Isso evita ter que hardcodar a Public Key do Mercado Pago no código-fonte —
 * ela fica só na variável de ambiente da Vercel, e o front busca aqui.
 *
 * A Public Key do Mercado Pago é segura para ser pública (é o próprio MP que
 * recomenda usá-la no navegador, diferente do Access Token que é secreto).
 *
 * VARIÁVEL DE AMBIENTE NECESSÁRIA:
 *   MERCADO_PAGO_PUBLIC_KEY
 */

export default async function handler(req, res) {
    return res.status(200).json({
        mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || null,
    });
}
