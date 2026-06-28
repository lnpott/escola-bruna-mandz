import mercadopago from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// =========================
// CONFIG MP
// =========================
const mp = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

const paymentClient = new mercadopago.Payment(mp);

// =========================
// SUPABASE
// =========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================
// HANDLER
// =========================
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      method,
      order,
      token,
      paymentMethodId,
      installments,
      customer
    } = req.body;

    // =========================
    // CRIAR PEDIDO BASE (sempre)
    // =========================
    const { data: createdOrder, error } = await supabase
      .from("orders")
      .insert([
        {
          status: "pending",
          payment_method: method,
          total: order.total,
          customer_name: customer?.name,
          customer_email: customer?.email,
          items: order.items
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // =========================
    // PIX FLOW
    // =========================
    if (method === "pix") {
      const payment = await paymentClient.create({
        body: {
          transaction_amount: Number(order.total),
          payment_method_id: "pix",
          description: `Pedido ${createdOrder.id}`,
          payer: {
            email: customer.email,
            first_name: customer.name
          }
        }
      });

      return res.status(200).json({
        order_id: createdOrder.id,
        status: payment.status,
        qr_code: payment.point_of_interaction.transaction_data.qr_code_base64,
        qr_code_text: payment.point_of_interaction.transaction_data.qr_code
      });
    }

    // =========================
    // CARTÃO FLOW (BRICK TOKEN)
    // =========================
    const payment = await paymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        token: token,
        payment_method_id: paymentMethodId,
        installments: installments || 1,
        description: `Pedido ${createdOrder.id}`,
        payer: {
          email: customer.email,
          first_name: customer.name
        }
      }
    });

    // =========================
    // UPDATE SUPABASE
    // =========================
    await supabase
      .from("orders")
      .update({
        mp_payment_id: payment.id,
        status: payment.status
      })
      .eq("id", createdOrder.id);

    return res.status(200).json({
      order_id: createdOrder.id,
      status: payment.status
    });

  } catch (err) {
    console.error("Payment error:", err);

    return res.status(500).json({
      error: "payment_failed",
      message: err.message
    });
  }
}