// store/checkout-modal.js

let currentCart = null;
let currentCustomer = null;
let currentCartTotal = 0;

// ========================
// ABRIR CHECKOUT
// ========================
export function openCheckoutFlow(cart, customer) {
  currentCart = cart;
  currentCustomer = customer;
  currentCartTotal = cart.total;

  openMethodSelector();
}

// ========================
// PIX
// ========================
async function openPixModal() {
  const res = await fetch("/api/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: currentCart.items,
      amount: currentCartTotal,
      payment_method: "pix",
      customer: currentCustomer
    })
  });

  const data = await res.json();

  if (!data || !data.qr_code) {
    alert("Erro ao gerar PIX");
    return;
  }

  document.getElementById("pix-qrcode").src = data.qr_code;
  document.getElementById("pix-code").innerText = data.qr_code_text;

  startPixPolling(data.order_id);
}

// ========================
// CARTÃO (BRICK OFICIAL)
// ========================
async function openCardModal() {
  const mp = new MercadoPago(window.MP_PUBLIC_KEY);

  const bricksBuilder = mp.bricks();

  await bricksBuilder.create("cardPayment", "card-container", {
    initialization: {
      amount: currentCartTotal,
      payer: {
        email: currentCustomer.email
      }
    },

    callbacks: {
      onSubmit: async (cardFormData) => {
        try {
          const res = await fetch("/api/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: cardFormData.token,
              payment_method_id: cardFormData.payment_method_id,
              installments: cardFormData.installments || 1,
              amount: currentCartTotal,
              customer: currentCustomer
            })
          });

          const data = await res.json();

          if (data.status === "approved") {
            openSuccessModal(data.order_id);
          } else {
            alert("Pagamento recusado");
          }
        } catch (err) {
          console.error(err);
          alert("Erro no pagamento");
        }
      }
    }
  });
}

// ========================
// SUCCESS
// ========================
function openSuccessModal(orderId) {
  document.getElementById("success-order-id").innerText = orderId;
  document.getElementById("modal-success").classList.add("show");
}

// ========================
// UTIL
// ========================
function openMethodSelector() {
  document.getElementById("modal-payment-method").classList.add("show");
}

function startPixPolling(orderId) {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/order-status?id=${orderId}`);
    const data = await res.json();

    if (data.status === "approved") {
      clearInterval(interval);
      openSuccessModal(orderId);
    }
  }, 3000);
}