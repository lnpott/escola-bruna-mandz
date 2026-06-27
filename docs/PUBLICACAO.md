# Checklist de publicação — Escola Bruna Mandz 2.0

- Conferir `api/env.example` e criar variáveis reais no provedor de hospedagem.
- Nunca expor `PAYMENT_ACCESS_TOKEN` no frontend.
- Testar carrinho, checkout local e painel `/admin/admin.html`.
- Ativar HTTPS antes de usar webhooks reais.
- Trocar os mocks de `api/payment-provider.js` pelos SDKs Mercado Pago ou Stripe.
