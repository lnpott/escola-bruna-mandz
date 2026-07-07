# 🎵 Escola de Música Bruna Mandz

> Site oficial da Escola de Música Bruna Mandz — com Loja Oficial, Quiz Musical, Piano Virtual e muito mais.

---

## 🛍️ Loja Oficial Bruna Mandz

A loja foi transformada de uma simples seção "Brindes & Identidade" em uma **loja completa e funcional**, com checkout real via Mercado Pago (PIX + Cartão), painel administrativo protegido e banco de dados no Supabase.

### ✨ Funcionalidades

| Recurso | Status |
|---|---|
| Catálogo de 10+ produtos | ✅ Ativo |
| Carrinho de compras | ✅ Funcional |
| Checkout via PIX (QR Code real) | ✅ Integrado ao Mercado Pago |
| Checkout via Cartão (Payment Brick) | ✅ Integrado ao Mercado Pago |
| Sistema de XP (recompensa por compra) | ✅ Ativo |
| Painel Administrativo | ✅ Protegido por senha |
| Notificação por e-mail (pedidos aprovados) | ✅ Via Resend |
| Zoom nas imagens dos produtos (Lightbox) | ✅ Implementado |
| Badges selecionáveis (Novidade, Promoção, Limitado) | ✅ Implementado |
| Gestão de tamanhos por produto | ✅ Implementado |
| Auto-refresh no painel (60s) | ✅ Implementado |
| Exportação CSV de pedidos | ✅ Implementado |
| Filtro e busca no painel | ✅ Implementado |
| Backup automático diário | ✅ GitHub Actions |

---

## 🏗️ Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Cliente    │────▶│  Vercel (Front)  │────▶│  Mercado Pago   │
│  (Browser)  │     │  Vite + Tailwind │     │  (PIX / Cartão) │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Supabase (DB)   │
                    │  orders, products│
                    └──────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Painel Admin      │
                    │  /painel-x9k2f.html│
                    └──────────────────┘
```

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Front-end** | Vite, Tailwind CSS, Vanilla JS |
| **Back-end** | Vercel Functions (Node.js) |
| **Banco de dados** | Supabase (PostgreSQL) |
| **Pagamento** | Mercado Pago (PIX + Card Payment Brick) |
| **E-mail** | Resend API |
| **Hospedagem** | Vercel |
| **CI/CD** | GitHub Actions |

---

## 📁 Estrutura de APIs

| Endpoint | Função | Proteção |
|---|---|---|
| `/api/create-payment.js` | Cria pagamento (PIX / Cartão) | — |
| `/api/webhook.js` | Recebe notificações do Mercado Pago | `x-signature` (opcional) |
| `/api/order-status.js` | Consulta status público de pedido | — |
| `/api/config.js` | Expose Public Key do MP ao front | — |
| `/api/products.js` | Lista produtos do catálogo | — |
| `/api/admin-orders.js` | Lista todos os pedidos | `x-admin-password` |
| `/api/admin-products.js` | CRUD de produtos | `x-admin-password` |
| `/api/update-order-status.js` | Atualiza status de pedido | `x-admin-password` |
| `/api/verify-mp-payment.js` | Verifica status real no MP | `x-admin-password` |
| `/api/notify-new-order.js` | Envia e-mail de notificação | `x-admin-password` |
| `/api/upload-image.js` | Upload de imagens de produtos | `x-admin-password` |

---

## 🎮 Outras Funcionalidades do Site

| Recurso | Descrição |
|---|---|
| **Piano Virtual** | Teclado interativo com áudio Tone.js |
| **Quiz Musical** | Trivia com vídeo, tela de início e jogar novamente |
| **Mesa de Exploração** | Canvas interativo com filtros e cards clicáveis |
| **Service Worker** | Cache para assets, nunca para `/api/*` |

---

## 🔐 Segurança

- ✅ Painel admin com rota oculta (`/painel-x9k2f.html`) e senha (`ADMIN_PASSWORD`)
- ✅ RLS habilitado no Supabase sem políticas públicas
- ✅ Service Role Key do Supabase **nunca exposta** ao front-end
- ✅ Backup automático via **GitHub Actions Artifacts** (não commitado no repo)
- ✅ Dados de cartão **tokenizados** pelo Mercado Pago — nunca tocam nosso servidor
- ✅ Chaves PIX geradas dinamicamente pelo MP — nenhuma chave hardcoded

---

## 📋 Configuração de Variáveis de Ambiente

As seguintes variáveis são necessárias na Vercel:

```env
# Supabase
SUPABASE_URL=https://ljosqddzxreloizpynvf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>

# Mercado Pago
MP_ACCESS_TOKEN=<sua_access_token>
MP_PUBLIC_KEY=<sua_public_key>
MP_WEBHOOK_SECRET=<opcional_mas_recomendado>

# Admin
ADMIN_PASSWORD=<senha_do_painel>

# E-mail (Resend)
RESEND_API_KEY=<sua_api_key>
NOTIFY_EMAIL=<email_da_bruna>
```

---

## 📦 Instalação Local

```bash
# Clonar o repositório
git clone https://github.com/lnpott/escola-bruna-mandz.git

# Entrar na pasta
cd escola-bruna-mandz

# Instalar dependências
npm install

# Criar .env (copiar de .env.example)
cp .env.example .env
# Editar .env com suas chaves

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

---

## 🔄 Backup Automático

- **Frequência:** Diário às 05:00 UTC
- **Método:** GitHub Actions Artifact
- **Tabelas:** `products`, `orders`
- **Retenção:** 90 dias
- **Segurança:** Dados de clientes nunca aparecem no repositório público

---

## 📄 Documentação do Projeto

O desenvolvimento completo da loja está documentado em: [`loja_registro.md`](./loja_registro.md)

---

## 📊 Status do Projeto

- **Etapa atual:** 32 (Zoom nos Produtos + Badges + Tamanhos)
- **Próximos passos:** Ver seção "Próximos Passos" em `loja_registro.md`

---

> **Projeto desenvolvido para a Escola de Música Bruna Mandz** 🎶
