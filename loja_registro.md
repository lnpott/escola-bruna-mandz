# 🛍️ Registro de Implementação — Loja Oficial Bruna Mandz

> Documento vivo. Atualizado a cada etapa da implementação.
> Última atualização: 27/06/2026 — 23:10

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
| 3 | `store/payment-config.js` — Config + chave PIX | ✅ Concluído (revisado na Etapa 9) |
| 4 | `store/checkout-modal.js` — Fluxo de checkout (NOVO) | ✅ Concluído (reescrito na Etapa 9) |
| 5 | `store/store.js` — Redesign visual da loja | ✅ Concluído (pequeno ajuste na Etapa 9) |
| 6 | `store/store-style.css` — CSS premium | ✅ Concluído |
| 7 | `index.html` — Renomear seção + novos modais + redesign | ✅ Concluído (ajustado na Etapa 9) |
| 8 | `api/create-payment.js` — Hooks de integração | ⚠️ Substituído pela Etapa 9 (integração real) |
| 9 | **Integração real Mercado Pago + Supabase + Admin seguro + Deploy Vercel** | ✅ Concluído (faltam só as chaves) |
| 10 | Correção de erro de deploy (`vercel.json` runtime inválido) | ✅ Corrigido |

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

## ✅ ETAPA 9 — Integração real Mercado Pago + Supabase + Admin seguro + Deploy Vercel

> Esta etapa começou com uma **auditoria do código real do GitHub** (não só deste
> registro), porque o objetivo passou a ser: deixar o sistema pronto para
> cobrar de verdade, faltando só colar as chaves do Mercado Pago.

### 🔍 Problemas encontrados na auditoria (antes de qualquer mudança)

1. **Pedidos só existiam no `localStorage` do navegador do cliente.** O painel
   `admin/admin.html` lia o mesmo `localStorage`, então a Bruna nunca veria os
   pedidos reais — só quem comprou via o próprio navegador.
2. **O formulário de cartão coletava número, validade e CVV reais e não
   processava nada** — só validava formato e fingia sucesso. Isso é proibido
   pelas regras de segurança de cartão (PCI-DSS): dados de cartão não podem
   passar pelo nosso servidor sem tokenização no navegador.
3. **A chave PIX (`21997600704`, WhatsApp da escola) estava hardcoded e
   pública no código-fonte do GitHub.**
4. **`api/create-payment.js`, `api/payment-provider.js` e `api/webhook.js`**
   estavam escritos no formato de rota de servidor (Next.js-like), que **não
   funciona** num deploy puramente estático do Vite — eram só protótipos
   desconectados, nunca chamados pelo front-end.
5. Texto "Compra segura. Pedidos registrados localmente..." era exibido ao
   cliente, dando falsa sensação de segurança.
6. **Bug de ID duplicado**: `id="store-cart-badge"` existia duas vezes no
   `index.html` (menu + carrinho lateral), então o badge da loja nunca era
   atualizado pelo JS (sempre pegava o primeiro elemento).
7. Painel admin acessível por link visível no menu (`admin/admin.html`), sem
   nenhuma autenticação.
8. Encontrado `siteId` de um projeto Netlify (`.netlify/state.json`) já
   vinculado a este repositório — sinal de que o projeto já foi publicado por
   lá em algum momento. Vale verificar se esse site antigo ainda está no ar.

### 🏗️ Nova arquitetura implementada

```
Cliente compra → Front chama /api/create-payment (Vercel Function)
                      ↓
              Mercado Pago cria o pagamento (PIX real ou Card Brick)
                      ↓
              Pedido salvo no Supabase (tabela orders, status: pending)
                      ↓
Mercado Pago aprova → webhook → /api/webhook → atualiza status no Supabase
                      ↓
Admin (/painel-x9k2f.html, protegido por senha) → lê pedidos reais do Supabase
```

### O que foi feito

**Banco de dados (Supabase):**
- Criado `supabase/schema.sql` com a tabela `orders` (status, método, dados do
  cliente, itens, total, IDs do Mercado Pago) + índices + RLS habilitado sem
  política pública (só a Service Role Key do backend acessa)

**Backend (Vercel Functions, pasta `api/`):**
- `api/create-payment.js` — **reescrito do zero**: cria pagamento real
  (PIX via Payment API, Cartão via token do Brick) e salva/atualiza o pedido
  no Supabase. Sem as chaves do Mercado Pago configuradas, responde em
  "modo local" sem cobrar nada, para permitir testes
- `api/webhook.js` — **reescrito do zero**: recebe notificação do Mercado
  Pago, busca o pagamento de novo na API (nunca confia só no corpo da
  notificação) e atualiza o status do pedido no Supabase
- `api/admin-orders.js` (NOVO) — lista pedidos do Supabase, protegido por
  senha (header `x-admin-password`, comparado com `ADMIN_PASSWORD`)
- `api/order-status.js` (NOVO) — consulta pública só de status + total de UM
  pedido por ID, usada no polling do PIX (não expõe dados pessoais)
- `api/config.js` (NOVO) — expõe a Public Key do Mercado Pago ao front em
  runtime, sem hardcodar no código-fonte
- `api/_lib/supabase.js` (NOVO) — cliente Supabase compartilhado (Service
  Role Key, nunca exposta ao navegador)
- Removidos `api/payment-provider.js` e `api/env.example` (mocks
  desconectados do fluxo real)

**Front-end:**
- `store/payment-config.js` — reescrito sem nenhuma chave sensível;
  busca a Public Key via `/api/config`
- `store/checkout-modal.js` — **reescrito do zero**:
  - PIX: chama `/api/create-payment`, exibe QR Code real devolvido pelo
    Mercado Pago, faz polling em `/api/order-status` até aprovação
  - Cartão: renderiza o **Card Payment Brick oficial do Mercado Pago**
    (tokenização no navegador, sem coletar número/CVV no nosso servidor)
- `store/cart.js` — `createLocalOrder` virou `buildOrder` (monta o pedido sem
  persistir) + `applyStudentXp` (separado, só aplicado após pagamento
  confirmado, não antes)
- `index.html`:
  - Removidos os 2 links visíveis de admin (menu + carrinho lateral)
  - Corrigido ID duplicado `store-cart-badge` → `nav-cart-badge` no menu
  - Modal de cartão: formulário manual trocado por container do Brick
  - Modal PIX: chave fixa trocada por código copia-e-cola dinâmico + status
  - Textos de falsa segurança corrigidos
  - Adicionado script do SDK do Mercado Pago (`sdk.mercadopago.com/js/v2`)
- `store/store.js` — passa a sincronizar também o badge do menu (`nav-cart-badge`)

**Admin:**
- Removida a pasta `admin/` antiga (sem autenticação)
- Criado `painel-x9k2f.html` (NOVO) — rota escondida, tela de login por
  senha, busca pedidos via `/api/admin-orders`. Sessão da senha fica só em
  `sessionStorage` da aba (não persiste entre navegadores/dispositivos)

**Deploy / Build:**
- `vercel.json` (NOVO) — runtime `nodejs20.x` para todas as funções
- `vite.config.js` — adicionado `painel-x9k2f.html` como entry point extra
  (sem isso, o Vite não incluía o admin no build de produção)
- `package.json` — adicionadas dependências `mercadopago` e
  `@supabase/supabase-js`
- `.env.example` (NOVO, na raiz) — todas as variáveis necessárias documentadas
- `service-worker.js` — bump de cache (`v2` → `v3`), rotas `/api/*` nunca são
  servidas do cache, e versões antigas de cache são limpas automaticamente
- `eslint.config.js` — corrigido para reconhecer globals de browser e Node
  separadamente (erro pré-existente, não introduzido nesta etapa)
- `docs/PUBLICACAO.md` — checklist reescrito para a arquitetura real

### Validações feitas nesta etapa
- ✅ Sintaxe de todos os arquivos `.js` (`node --check`)
- ✅ ESLint sem erros em todos os arquivos novos/modificados
- ✅ Prettier aplicado (formatação consistente com o resto do projeto)
- ✅ `npm install` resolve sem conflito; confirmado que `Payment`,
  `MercadoPagoConfig` e `createClient` existem nas versões instaladas
- ✅ `npm run build` gera `dist/index.html` e `dist/painel-x9k2f.html`
  corretamente, com CSS/JS com hash
- ✅ Simulação de chamada a `create-payment.js` e `admin-orders.js` sem
  variáveis de ambiente reais — comportamento de fallback confirmado
- ✅ Todos os IDs referenciados pelo JS existem no HTML (checagem automatizada)

### Testado no navegador (pendente — você precisa fazer)
- [ ] Rodar `npm install` e `npm run dev` localmente
- [ ] Testar fluxo PIX em modo local (sem chaves) — deve mostrar aviso de modo teste
- [ ] Criar projeto Supabase e rodar `supabase/schema.sql`
- [ ] Criar credenciais de TESTE no Mercado Pago e testar PIX/Cartão de verdade
- [ ] Configurar variáveis de ambiente na Vercel e fazer o primeiro deploy
- [ ] Acessar `/painel-x9k2f.html` e confirmar que pede senha e mostra pedidos

---

## ✅ ETAPA 10 — Correção de erro real de deploy na Vercel

Após o primeiro push para o GitHub e o primeiro deploy na Vercel (com
variáveis de ambiente ainda como placeholder `"0"`), o deploy **falhou**.

### 🔴 Erro encontrado (confirmado via API da Vercel)
```
errorCode: "invalid_function_runtime"
errorMessage: "Function Runtimes must have a valid version,
               for example `now-php@1.0.0`."
errorStep: "buildStep"
```

### Causa raiz
O `vercel.json` desta sessão (Etapa 9) usava:
```json
"functions": {
    "api/create-payment.js": { "runtime": "nodejs20.x" }
}
```
A propriedade `runtime` dentro de `functions` no `vercel.json` é destinada a
runtimes **não-Node** (PHP, Bun, runtimes customizados), no formato
`nome@versão` (ex: `vercel-php@0.5.2`). Para Node.js — que já é o runtime
padrão da Vercel — essa propriedade não deve ser usada dessa forma; o jeito
certo de fixar a versão do Node é via `engines.node` no `package.json`.

### Correção aplicada
- `vercel.json` — removida a propriedade `functions`/`runtime` por completo
  (Node.js volta a ser o runtime padrão, sem configuração extra necessária)
- `package.json` — adicionado `"engines": { "node": "22.x" }` para fixar a
  versão do Node usada nos builds e funções

### Status
- [ ] Fazer novo commit/push com a correção e confirmar que o deploy passa
- [ ] Depois do deploy OK, trocar as variáveis de ambiente "0" pelos valores
  reais (Supabase primeiro, Mercado Pago de teste depois)

---

A integração já está toda escrita — falta só configurar as contas e colar as chaves:

1. **Supabase**: criar o projeto (ou usar o já conectado) e rodar
   `supabase/schema.sql` no SQL Editor
2. **Mercado Pago**: criar conta de desenvolvedor, pegar credenciais de
   **teste** primeiro, testar o fluxo completo, só depois trocar para
   credenciais de **produção**
3. **Vercel**: conectar o repositório, configurar as variáveis de
   `.env.example`, fazer o deploy
4. **Webhook**: configurar a URL `https://seu-dominio.vercel.app/api/webhook`
   no painel do Mercado Pago
5. **Verificar o site antigo na Netlify** (`.netlify/state.json` indica que
   já existiu um deploy lá) — decidir se ele deve ser desativado para não
   haver duas versões diferentes do site no ar
6. **Fase futura (não crítica agora)**: editar produtos via painel admin
   (hoje os produtos continuam fixos em `store/products.js`, só os pedidos
   passaram a ser dinâmicos via Supabase)

Passo a passo detalhado de configuração está em `docs/PUBLICACAO.md`.

---

## 📝 Notas Gerais

- A chave PIX antiga (placeholder `21997600704`) foi **removida do código**.
  A cobrança PIX agora é gerada dinamicamente pelo Mercado Pago a cada
  pedido — nenhuma chave fica exposta no front-end
- Pedidos agora são a fonte de verdade no **Supabase** (tabela `orders`),
  não mais só no `localStorage` do cliente
- O sistema de XP é mantido, mas agora só é aplicado **após confirmação do
  pagamento** (antes era aplicado na hora de criar o pedido, mesmo sem pagar)
- O admin mudou de `admin/admin.html` (sem senha) para `painel-x9k2f.html`
  (com senha via `ADMIN_PASSWORD`)
