import mercadopago from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mp = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

const paymentClient = new mercadopago.Payment(mp);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.status(400).json({ error: "missing payment id" });
    }

    const payment = await paymentClient.get({
      id: paymentId
    });

    const status = payment.status;

    // atualiza pedido
    await supabase
      .from("orders")
      .update({
        status: status,
        mp_payment_id: paymentId
      })
      .eq("mp_payment_id", paymentId);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "webhook_failed"
    });
  }
}