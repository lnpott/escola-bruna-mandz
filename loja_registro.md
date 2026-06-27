# 🛍️ Registro de Implementação — Loja Oficial Bruna Mandz

> Documento vivo. Atualizado a cada etapa da implementação.
> Última atualização: 27/06/2026 — 18:02

---

## 🎯 Objetivo Geral

Transformar a seção "Brindes & Identidade" em uma **Loja Oficial funcional** com:
- Sistema de carrinho completo
- Checkout via PIX (com QR Code) e Cartão (com formulário)
- Catálogo expandido de produtos
- Plataforma pronta para integrar Mercado Pago / Stripe
- Visual premium integrado ao design dark do site

---

## 📊 Status Geral

| Etapa | Arquivo | Status |
|---|---|---|
| 1 | `store/products.js` — Catálogo expandido | ✅ Concluído |
| 2 | `store/cart.js` — Funções de carrinho avançadas | ✅ Concluído |
| 3 | `store/payment-config.js` — Config + chave PIX | ✅ Concluído |
| 4 | `store/checkout-modal.js` — Fluxo de checkout (NOVO) | ✅ Concluído |
| 5 | `store/store.js` — Redesign visual da loja | ✅ Concluído |
| 6 | `store/store-style.css` — CSS premium | ✅ Concluído |
| 7 | `index.html` — Renomear seção + novos modais + redesign | ✅ Concluído |
| 8 | `api/create-payment.js` — Hooks de integração | ✅ Concluído |

---

## ✅ ETAPA 1 — `store/products.js`

### O que foi feito
- Expandido de **3 para 7 produtos**
- Adicionados campos: `category`, `badge`, `badgeColor`, `variants` (tamanhos)
- Produtos adicionados:
  - Camiseta Oficial (adulto, tamanhos P/M/G/GG)
  - Camiseta Infantil (tamanhos 2 ao 12)
  - Caneca Oficial
  - Kit Palhetas Personalizadas (6 unidades)
  - Bloco de Composição Musical
  - Mochila Oficial
  - Kit Aluno Bruna Mandz (combo completo)

### Testado
- [ ] Verificar se produtos aparecem na loja no browser

### Observações
> Imagens temporariamente usando `brindes.jpg` e `LOGOPRETO.png` como placeholder.
> Substituir pelas fotos reais de cada produto quando disponíveis.

---

## ✅ ETAPA 2 — `store/cart.js`

### O que foi feito
- Adicionado `removeFromCart(productId, variant)` — remove item do carrinho
- Adicionado `updateQuantity(productId, qty, variant)` — altera quantidade de item
- Adicionado `cartItemCount()` — conta total de itens para o badge do nav
- Campo `variant` (tamanho) agora é chave de unicidade no carrinho
- `createLocalOrder` aceita objeto `customer` (nome, e-mail, telefone)
- Compatibilidade total mantida com API anterior

### Testado
- [ ] Adicionar produto com tamanho ao carrinho
- [ ] Remover produto do carrinho
- [ ] Alterar quantidade
- [ ] Criar pedido com dados do cliente

---

## ✅ ETAPA 3 — `store/payment-config.js`

### O que foi feito
- Adicionado `pixKey: '21997600704'` (placeholder — substituir pela chave real)
- Adicionado `pixName` e `pixCity` para o QR Code e modal
- Adicionados campos `mercadoPagoPublicKey` e `stripePublicKey` com comentários

### Testado
- [ ] Verificar se config é importada corretamente nos outros módulos

---

## ✅ ETAPA 4 — `store/checkout-modal.js` (NOVO)

### O que foi feito
- Módulo novo criado com fluxo completo:
  - `openCheckoutFlow(method)` — ponto de entrada público
  - `submitCustomerForm()` — valida dados e cria pedido local
  - `openPixModal()` — QR Code via api.qrserver.com + botão copiar chave
  - `openCardModal()` — formatação automática de número, validade e CVV
  - `openSuccessModal()` — exibe ID do pedido e XP ganho
  - `closeCheckoutModals()` — fecha todos os modais
- Comentários de integração Mercado Pago e Stripe inseridos
- Funções exportadas para `window` para uso inline no HTML

### Testado
- [ ] Fluxo completo PIX: cliente → QR Code → sucesso
- [ ] Fluxo completo Cartão: cliente → formulário → sucesso
- [ ] Validação de campos obrigatórios
- [ ] Formatação automática do número do cartão

---

## ✅ ETAPA 5 — `store/store.js`

### O que foi feito
- `renderProducts()` redesenhado:
  - Cards premium com imagem, badge, categoria, XP, estoque e preço
  - Seletor de tamanho funcional por produto
  - Animação de "Adicionado!" no botão
  - Tab de filtro por categoria (Todos / Roupas / Acessórios / Kits)
- `renderCart()` redesenhado:
  - Itens com controle de quantidade (−/+) e botão remover (×)
  - Estado vazio estilizado com ícone
  - Botões PIX/Cartão desabilitados quando carrinho está vazio
- Checkout conectado ao `checkout-modal.js`
- Variante (tamanho) rastreada no carrinho

### Testado
- [ ] Cards renderizados corretamente
- [ ] Filtro por categoria funciona
- [ ] Carrinho atualiza ao adicionar/remover
- [ ] Botões PIX e Cartão abrem fluxo de checkout

---

## ✅ ETAPA 6 — `store/store-style.css`

### O que foi feito
- CSS completo redesenhado com visual dark premium:
  - Tabs de categoria com estado active
  - Product card com hover, badge, seletor de tamanho, preço, XP
  - Carrinho com linhas de item, controle qty, botão remover
  - Modais de checkout (overlay + box com animação scale)
  - Formulários com inputs dark e focus vermelho
  - Bloco QR Code PIX + chave copia-e-cola
  - Tela de sucesso com ícone verde e bloco de resumo

### Testado
- [ ] Visual integrado ao design do site (dark, zinc-950, vermelho)
- [ ] Responsivo em mobile

---

## ✅ ETAPA 7 — `index.html`

### O que foi feito

**Canvas (Mesa de Exploração):**
- Botão de filtro: `"Brindes e Identidade"` → `"🛍️ Loja"`
- Card merch atualizado:
  - Badge: `"Identidade Forte"` → `"🛍️ Loja Oficial"` (vermelho sólido)
  - Título: `"Brindes & Identidade"` → `"Loja Oficial"`
  - Texto: focado em compra online
  - Botão: `"Ver Catálogo de Itens"` → `"Ver a Loja"` (scroll para `#official-store`)
  - Footer: `"Merchandising Oficial"` → `"PIX & Cartão"`

**Seção `#official-store`:**
- Título: `"Merchandising Bruna Mandz"` → `"Loja Oficial Bruna Mandz"`
- Descrição atualizada: foco em PIX, cartão e XP
- Tabs de categoria adicionadas (Todos / Roupas / Acessórios / Kits)
- Carrinho lateral redesenhado com badge, ícone e botões melhorados
- Badge do nav movido para dentro do título do carrinho

**Modais de checkout (novos):**
- `#modal-checkout-customer` — Formulário de nome, e-mail, telefone + validação
- `#modal-checkout-pix` — QR Code + chave Pix + botão copiar + confirmação
- `#modal-checkout-card` — Formulário de cartão com 4 campos + aviso de segurança
- `#modal-checkout-success` — Confirmação com pedido, método, total e XP

**Scripts:**
- `store/store-style.css` importado no `<head>`
- `store/checkout-modal.js` importado como módulo antes de `store.js`

### Testado
- [ ] Filtro "Loja" aparece no canvas
- [ ] Card clicável leva à seção da loja
- [ ] Modais de checkout abrem e fecham corretamente
- [ ] Visual da seção da loja integrado ao restante do site

---

## ✅ ETAPA 8 — `api/create-payment.js`

### O que foi feito
- Modo local funcional como fallback (sem integração ativa)
- Documentação das variáveis de ambiente necessárias
- Bloco comentado completo para **Mercado Pago** (PIX + cartão)
- Bloco comentado completo para **Stripe** (cartão)
- Handler de erro e resposta JSON padronizado

### Testado
- [ ] Endpoint local responde corretamente

---

## 🔮 Próximos Passos (Pós-Implementação)

Quando estiver pronto para integrar pagamento de verdade:

1. **Mercado Pago**: criar conta, gerar `ACCESS_TOKEN` e `PUBLIC_KEY`, plugar em `payment-config.js` e `api/create-payment.js`
2. **PIX real**: usar SDK do MP para gerar QR Code dinâmico com valor e referência do pedido
3. **Cartão real**: usar Mercado Pago Checkout Bricks ou Stripe Elements no lugar do formulário atual
4. **Webhook**: configurar `api/webhook.js` para receber notificações de pagamento aprovado e atualizar status do pedido
5. **Backend**: hospedar `api/` em um servidor Node.js (Netlify Functions, Vercel, Railway) com as variáveis de ambiente seguras

---

## 📝 Notas Gerais

- A chave PIX usada como placeholder é `21997600704` (WhatsApp da escola)
- Todos os pedidos ficam salvos em `localStorage` com chave `bruna_orders` e aparecem no painel Admin (`admin/admin.html`)
- O sistema de XP é mantido: cada compra adiciona pontos ao aluno (`bruna_student_progress`)
