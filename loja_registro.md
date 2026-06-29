# 🛍️ Registro de Implementação — Loja Oficial Bruna Mandz

> Documento vivo. Atualizado a cada etapa da implementação.
> Última atualização: 29/06/2026 — (Etapa 21)

---

## 🚦 Próximos Passos Imediatos (o que falta AGORA)

1. **Sobrescrever os arquivos da Etapa 21** no repositório: `painel-x9k2f.html`,
   `api/update-order-status.js` (novo), `store/checkout-modal.js`
2. **Apagar os arquivos órfãos removidos** nesta etapa (se ainda existirem no
   seu repositório local): `api/payment-provider.js`, `api/env.example`,
   pasta `src/`, e o arquivo `correcao-404-public.zip` na raiz
3. **Commit + push** das mudanças
4. **Testar o painel `/painel-x9k2f.html`**: KPIs aparecem corretos, trocar
   o status de um pedido funciona, busca e filtro funcionam, exportar CSV
   gera arquivo correto, e testar também no celular (modo responsivo)
5. Decidir com a Bruna se a **Fase B** (auto-refresh + notificação por
   e-mail + detalhe expandido) é a próxima prioridade, ou se outra coisa é
   mais urgente
6. Decidir o que fazer com o **site antigo na Netlify** (verificar se ainda
   está no ar e desativar, para não haver duas versões diferentes do site)

Detalhe completo de cada item nas Etapas 20 e 21 abaixo.

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
| 11 | Investigação "teclado não funciona" pós-migração Vercel (hipótese de ordem de scripts) | ⚠️ Não era a causa real — ver Etapa 12 |
| 12 | **Causa real**: `audio.js`/`game.js`/imagens davam 404 (faltava pasta `public/`) | ✅ Corrigido |
| 13 | `game.js`: erro de sintaxe (`export` inválido em script clássico) | ✅ Corrigido |
| 14 | Checkout PIX: causa real do erro "live credentials" esclarecida (PIX não tem sandbox) | ✅ Causa esclarecida |
| 15 | Plano de teste PIX de ponta a ponta + produto temporário de R$1 | ✅ Executado — erro encontrado, ver Etapa 16 |
| 16 | Erro persistente "live credentials" — causa real: API errada selecionada no MP | ✅ Resolvido (era "API Orders" em vez de "API Pagamentos") |
| 17 | **Incidente**: arquivos sobrescritos por outra ferramenta + Reescrita completa do checkout (overlay de tela cheia, fechamento controlado) | ✅ Reescrito — aguardando teste |
| 18 | **Correções Payment Brick** + **SW cache fix** + **Plano estratégico da loja** + **Catálogo definitivo 13 produtos** | ✅ Concluído |
| 19 | **Catálogo real** — 7 produtos com imagens definitivas, produto de teste removido | ✅ Concluído |
| 20 | **Plano do Painel Admin** — diagnóstico do estado atual + roadmap completo de melhorias | ✅ Planejado |
| 21 | **Pesquisa integração MP** — decisão documentada + **Fase B implementada** (auto-refresh, notificação e-mail, detalhe de itens, botão "Verificar no MP") | ✅ Concluído |
| 21 | **Fase A do Painel implementada**: KPIs, ação de status inline, filtro, busca, export CSV, mobile responsivo | ✅ Concluído — aguardando teste |

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

## ✅ ETAPA 11 — Investigação: "teclado não está ok" após migração para Vercel

Relato: depois da migração para a Vercel, o teclado (piano/teclado físico)
parou de funcionar como antes.

### Investigação feita
- Comparado `audio.js`, `game.js` e `index.html` entre a versão testada
  nesta sessão e o estado atual do GitHub → **idênticos**, nenhuma mudança
  de conteúdo nesses arquivos desde a Etapa 9
- Checado `vercel.json` em busca de CSP ou headers que pudessem bloquear o
  domínio externo de samples de áudio (`tonejs.github.io`) → nenhum header
  configurado
- Revisada a lógica de `audio.js`/`game.js` → sem bugs de mapeamento de tecla
  introduzidos nesta sessão

### Causa raiz mais provável (corrigida)
Na Etapa 9, o script do SDK do Mercado Pago foi adicionado **antes** de
`audio.js`/`game.js`, sem `defer`:
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
<script src="audio.js"></script>
<script src="game.js"></script>
```
Como é um script síncrono de um domínio externo, ele podia atrasar ou, em
condições de rede ruins, interferir na ordem de carregamento dos scripts do
piano.

### Correções aplicadas (cobrindo múltiplos cenários possíveis)
1. `index.html` — `audio.js` e `game.js` movidos para **antes** do SDK do
   Mercado Pago; SDK do MP agora carrega com `defer`
2. `store/checkout-modal.js` — `closeModal()` agora tira o foco
   (`blur()`) de qualquer campo dentro do modal antes de escondê-lo. Sem
   isso, se o foco ficasse "preso" num input do checkout, o handler de
   teclado físico do piano (`audio.js`) continuaria ignorando teclas mesmo
   com o modal já fechado
3. `store/checkout-modal.js` — clicar fora do modal de **cartão**
   (overlay) agora também destrói o Card Payment Brick do Mercado Pago.
   Antes, só fechar pelo botão "Cancelar" fazia isso — clicar fora deixava
   o iframe do Brick "vivo" escondido, podendo reter foco de teclado
4. Confirmado que nenhum input do checkout tem `readonly`/`disabled`
   acidental

### Observação
Não foi possível reproduzir o sintoma exato fora do navegador do usuário,
então as correções acima cobrem as causas mais prováveis identificadas na
auditoria do código. Se o problema persistir após estas correções, será
necessário saber especificamente: (a) o piano na tela não emite som ao
tocar, (b) o teclado físico do computador (teclas A,W,S,E...) não aciona o
piano, ou (c) o som soa diferente do esperado — cada um aponta para uma
causa diferente e mais específica.

### Status
- [x] Testado pelo usuário com console do navegador aberto — **causa real
  diferente da hipótese acima**, encontrada e corrigida na **Etapa 12**

---

## ✅ ETAPA 12 — Causa real encontrada: `audio.js`/`game.js` e imagens davam 404 em produção

Com o console do navegador, o usuário trouxe o erro exato:
```
audio.js:1   Failed to load resource: 404
game.js:1    Failed to load resource: 404
brindes.jpg:1  Failed to load resource: 404
LOGOPRETO.png:1  Failed to load resource: 404
favicon.ico:1  Failed to load resource: 404
(índice):925 Uncaught ReferenceError: startGame is not defined
```

### Causa raiz real (confirmada, não só hipótese)
O Vite só copia para o build de produção (`dist/`) arquivos que estão:
(a) dentro de uma pasta `public/`, ou (b) referenciados como atributo
processável no HTML/CSS (`<img src="...">`, `<link href="...">`).

`audio.js`, `game.js`, `manifest.json` e `service-worker.js` estavam soltos
na raiz do projeto, carregados via `<script src="audio.js">` — isso só
funciona no modo `vite dev` (que serve a pasta toda), não no build de
produção. O mesmo valia para `brindes.jpg`/`LOGOPRETO.png` quando
referenciados como string dinâmica em JS (`store/products.js` e uma string
de template no `index.html`) — caminhos assim não são reescritos pelo Vite.

**Isso não foi causado pela Etapa 9** — é um problema estrutural que já
existia antes, só nunca tinha aparecido porque o site nunca tinha sido
servido via `vite build` de verdade em produção (o Netlify antigo
provavelmente servia os arquivos brutos sem build).

A Etapa 11 (script do Mercado Pago antes do audio.js, foco preso em modal)
não era a causa real — mas as correções de robustez aplicadas lá continuam
válidas e foram mantidas.

### Correção aplicada
- Criada a pasta `public/` (copiada para a raiz do site em qualquer build
  Vite, sem hash, sem transformação)
- Movidos para `public/`: `audio.js`, `game.js`, `manifest.json`,
  `service-worker.js`
- Copiados para `public/` (mantidos também na raiz do projeto, pois ainda
  são usados por `<img>` processado pelo Vite): `brindes.jpg`,
  `LOGOPRETO.png`, `LOGOPRETOPQNO.png`
- `store/products.js` — caminhos de imagem corrigidos de `'../brindes.jpg'`
  para `'/brindes.jpg'` (agora aponta para `public/`)
- `index.html`:
  - `<script src="audio.js">` → `<script src="/audio.js">`
  - `<script src="game.js">` → `<script src="/game.js">`
  - `<link rel="manifest" href="manifest.json">` → `href="/manifest.json"`
  - Adicionado `<link rel="icon" type="image/png" href="/LOGOPRETO.png">`
    (resolve o 404 de `favicon.ico`, que não existia antes)
  - String JS dinâmica `'<img src="LOGOPRETO.png">'` → `'<img src="/LOGOPRETO.png">'`

### Validações feitas
- ✅ `npm run build` confirma que todos os 7 arquivos passam a existir em
  `dist/` na raiz, sem hash (testado com `ls` após build)
- ✅ Confirmado que os caminhos absolutos sobrevivem ao bundle do
  `store.js`/`products.js` (`grep` no JS final)
- ✅ ESLint e `node --check` sem erros em `store/products.js`

### Status
- [x] Testado pelo usuário — 404s resolvidos e o site carrega corretamente.
  Dois novos problemas apareceram no teste de checkout real, tratados nas
  Etapas 13 e 14 a seguir

---

## ✅ ETAPA 13 — `game.js`: `Uncaught SyntaxError: Unexpected token 'export'`

Durante o teste de checkout, o console mostrou:
```
game.js:321 Uncaught SyntaxError: Unexpected token 'export'
```

### Causa
O arquivo `public/game.js` (carregado via `<script src="/game.js">`, **sem**
`type="module"`) tinha uma linha adicionada em algum momento fora desta
sessão:
```js
export { startGame, stopGame, demonstrateSequence, handleKeyClick };
```
A sintaxe `export` só é válida em scripts do tipo `module`. Em um script
clássico, isso é um erro de sintaxe que **impede o arquivo inteiro de
executar** — ou seja, nenhuma função do jogo do piano (`startGame`,
`handleKeyClick`, etc.) chegava a ser definida, o que também explica por que
o botão "Iniciar jogo" não funcionava.

Foi encontrada também uma duplicação: `document.addEventListener('DOMContentLoaded',
initPianoKeyboard)` estava presente tanto em `audio.js` (onde a função é
definida — correto) quanto em `game.js` (onde a função não existe, e que
além disso registraria os listeners de teclado do piano duas vezes).

### Correção aplicada
- `public/game.js` — removida a linha `export { ... }`
- `public/game.js` — removida a chamada duplicada de
  `initPianoKeyboard` (mantida apenas em `audio.js`)

### Validação
- ✅ `node --check public/game.js` confirma sintaxe válida

---

## ✅ ETAPA 14 — Checkout PIX: `Unauthorized use of live credentials` (causa real esclarecida)

Ao testar o checkout PIX, o Mercado Pago retornou:
```
error: 'unauthorized'
message: 'Unauthorized use of live credentials'
status: 401
```

### Causa real (confirmada na documentação oficial do Mercado Pago)
A hipótese inicial (usar o "Usuário de teste" para simular o PIX) estava
**errada** — confirmado via documentação oficial: **pagamentos PIX não podem
ser realizados com credenciais de teste no Mercado Pago**. O ambiente de
sandbox de usuário de teste serve para simular **cartão de crédito/débito**,
não PIX.

A forma oficial de testar PIX é usar as **credenciais de produção** mesmo
(que já estão configuradas), com dois cuidados:
1. Usar no formulário de checkout um **e-mail diferente** do e-mail de login
   da conta Mercado Pago do vendedor (evita bloqueio de "autopagamento")
2. Usar um **valor baixo** para o teste (ex: R$ 1,00), já que é uma
   transação real de dinheiro real

### Status
- [x] Causa raiz identificada e confirmada via documentação oficial
- [ ] Executar o teste seguindo o plano da Etapa 15

---

## ⏳ ETAPA 15 — Plano de teste PIX de ponta a ponta

### Pré-requisitos (configurar antes de testar)
- [ ] Webhook configurado no painel do Mercado Pago:
  `https://escola-bruna-mandz.vercel.app/api/webhook` (evento "Pagamentos")
- [ ] `MP_WEBHOOK_URL` configurada na Vercel com a mesma URL (opcional, mas
  recomendado para manter consistência)
- [ ] Redeploy feito após configurar (`git commit --allow-empty` + push, para
  garantir que pega as variáveis mais recentes)

### O que foi preparado nesta etapa
- `store/products.js` — adicionado um produto temporário
  `🧪 TESTE — Não comprar (R$ 1,00)` (id: `teste-pagamento-1real`), com preço
  de R$ 1,00, para validar o fluxo sem arriscar alterar o preço de um produto
  real e esquecer de revertê-lo depois
  - **⚠️ Lembrar de remover este produto do catálogo depois que o teste
    for concluído com sucesso**

### Passo a passo do teste
1. Acessar o site, ir até a Loja Oficial, encontrar o produto de teste
2. Adicionar ao carrinho e finalizar com **PIX**
3. No formulário, usar um **e-mail diferente** do e-mail de login da conta
   Mercado Pago (ex: um e-mail secundário, ou um Gmail qualquer que não seja
   o da conta vendedora)
4. Confirmar que aparece um QR Code real (gerado pelo Mercado Pago)
5. Pagar o R$ 1,00 de verdade (app do banco, escaneando o QR Code)
6. Confirmar que o status muda automaticamente para "Aprovado" — tanto na
   tela do site (polling em `/api/order-status`) quanto no painel
   `/painel-x9k2f.html`

### Status
- [x] Teste executado — deu erro `Unauthorized use of live credentials`,
  investigado e tratado na Etapa 16
- [ ] Remover o produto temporário `teste-pagamento-1real` de
  `store/products.js` após o teste ser concluído com sucesso

---

## ⏳ ETAPA 16 — Investigação do erro persistente em PIX + causa provável encontrada

Mesmo seguindo o procedimento da Etapa 14 (e-mail diferente do vendedor),
o erro `Unauthorized use of live credentials` persistiu no teste real.

### Investigação feita
- Pesquisada documentação oficial e relatos de outros desenvolvedores com o
  mesmo erro (`code: 7`) usando o SDK Node do Mercado Pago
- Encontrado que o **exemplo oficial do SDK** sempre inclui um campo
  `requestOptions: { idempotencyKey: '...' }` na chamada `payment.create()`,
  que estava ausente no nosso código
- Encontrada documentação indicando que, para receber pagamentos via Pix,
  **a conta Mercado Pago vendedora precisa ter uma chave Pix cadastrada e
  ativa** dentro do próprio Mercado Pago (não é sobre o código)
- Confirmado com o usuário: **a conta Mercado Pago da escola ainda não tem
  nenhuma chave Pix cadastrada** — esta é a causa mais provável do erro

### Correção/melhoria aplicada no código
- `api/create-payment.js` — adicionado `requestOptions: { idempotencyKey }`
  único por pedido (`{order.id}-pix` / `{order.id}-card`) em ambas as
  chamadas `payment.create()`. Isso é uma boa prática de qualquer forma
  (evita criar pagamentos duplicados em caso de reenvio de requisição),
  mesmo que não seja a causa raiz confirmada deste erro específico

### Ação necessária (fora do código, na conta Mercado Pago)
- [ ] Cadastrar uma chave Pix ativa na conta Mercado Pago vendedora
  (app ou site do Mercado Pago → "Minhas chaves Pix")
- [ ] Repetir o teste do produto temporário de R$ 1,00 após cadastrar a chave

### Observação sobre certeza do diagnóstico
Diferente de outras correções deste registro (que foram confirmadas via
logs/testes), esta causa (chave Pix ausente) ainda não foi confirmada como
definitiva — é a explicação mais consistente encontrada na documentação e
relatos de terceiros, mas só será confirmada após o próximo teste real.

### Status
- [x] Credenciais de teste conseguidas via re-seleção da API correta
  ("API Pagamentos" em vez de "API Orders") — resolveu o erro de autorização
- [x] Causa real confirmada: a aplicação no Mercado Pago estava configurada
  para a API errada

---

## 🔄 ETAPA 17 — Incidente: arquivos sobrescritos por outra ferramenta + Reescrita completa da loja

### O que aconteceu
Entre as Etapas 15 e 16, **outra ferramenta de IA (fora desta conversa)**
sobrescreveu `store/store.js` e `store/checkout-modal.js` no repositório
(commits "GPT reparo" e "delete produts" no histórico do Git). A nova versão:
- Não importava `PRODUCTS` de `products.js` — **nenhum produto era
  renderizado na tela**, daí "os itens sumiram"
- Usava uma classe `Store` com chave de `localStorage` diferente
  (`"cart"` em vez de `bruna_cart`), incompatível com `cart.js`
- Chamava `openCheckoutFlow(cart, customer)` com assinatura diferente da
  implementada, e enviava payload incompatível para `/api/create-payment`
  (`{ amount, payment_method }` em vez de `{ order, method }`)
- Referenciava IDs de HTML que não existiam (`#modal-payment-method`,
  `#card-container`, `#modal-success`)
- `store/cart.js`, `index.html` e `store/store-style.css` **não foram
  afetados** — continuavam exatamente como nesta sessão os deixou

Isso também explica o bug relatado pelo usuário: clicar fora durante o
pagamento fechava tudo e travava — comportamento dos modais antigos
empilhados (clique no overlay fecha o modal específico), que ficou ainda
mais frágil com o JS incompatível por trás.

### Decisão tomada
Em vez de só restaurar os arquivos quebrados, foi feita uma **reescrita
completa e definitiva do checkout**, incorporando o pedido do usuário:
"a loja ainda faz parte do site principal" → o checkout deveria se isolar
completamente do site **a partir do momento em que o usuário decide pagar**
(a vitrine de produtos continua normal na página).

### O que foi reescrito

**`index.html`** — os 4 modais empilhados (`#modal-checkout-customer`,
`#modal-checkout-pix`, `#modal-checkout-card`, `#modal-checkout-success`)
foram substituídos por **um único overlay de tela cheia**
(`#checkout-overlay`) com 4 `<section>` internas (`customer`/`pix`/`card`/
`success`), mostradas uma por vez via JS. Inclui um bloco de confirmação
(`#checkout-close-confirm`) para quando há pagamento em andamento.

**`store/store-style.css`** — adicionado CSS do novo overlay
(`.checkout-overlay`, `.checkout-overlay-inner`, `.checkout-close-btn`,
`.checkout-step`, `.checkout-close-confirm*`). Nada do CSS anterior foi
removido (as classes antigas de modal continuam no arquivo, sem uso, sem
problema).

**`store/checkout-modal.js`** — reescrito do zero:
- `openCheckoutFlow(method)` abre o overlay já na etapa "customer"
- Etapas trocam dentro do mesmo overlay via `showStep()`, sem fechar/abrir
  elementos diferentes
- **Fechamento controlado**: só o botão X (`#checkout-close-btn") aciona
  `closeCheckoutOverlay()`. Se `_paymentInProgress` for `true` (PIX
  aguardando confirmação, ou Brick de cartão montado), mostra a confirmação
  "Tem certeza que quer cancelar?" em vez de fechar direto
- **Nenhum clique fora fecha o overlay** — elimina o bug relatado
- Mantida toda a lógica de integração já validada (payload correto para
  `/api/create-payment`, polling de status do PIX, Card Payment Brick)

**`store/store.js`** — confirmado que a versão desta sessão (que renderiza
produtos via `PRODUCTS` e carrinho via `cart.js`) está correta; foi apenas
re-aplicada para sobrescrever a versão quebrada que estava no GitHub.

### Validações feitas
- ✅ Sintaxe (`node --check`) de todos os arquivos da loja
- ✅ ESLint sem erros
- ✅ Prettier aplicado
- ✅ Todos os IDs referenciados pelo JS existem no HTML (checagem automatizada)
- ✅ `npm run build` gera o site corretamente, incluindo `painel-x9k2f.html`
- ✅ CSS com chaves balanceadas

### ⚠️ Recomendação para evitar que isso se repita
Se outra ferramenta de IA (ChatGPT, Copilot, etc.) for usada no mesmo
repositório, recomenda-se: (1) sempre informar a essa ferramenta o contexto
de que existe uma integração real com Mercado Pago + Supabase já
funcionando, para evitar reescritas que ignorem os contratos entre arquivos
(payload de API, IDs de HTML, chaves de localStorage); ou (2) preferir
pedir mudanças incrementais em vez de reescritas completas de arquivo.

### Status
- [ ] Fazer commit/push e testar a loja completa no navegador: produtos
  aparecem, carrinho funciona, checkout abre em tela cheia, X fecha
  corretamente, clicar fora não fecha mais nada

---

---

## ✅ ETAPA 18 — Correções do Payment Brick + Plano Estratégico + Catálogo Definitivo

### 18.1 — Correções técnicas aplicadas (commit `445b885` e `fa84a9f`)

#### `store/checkout-modal.js`
- **`bankTransfer: ['pix']` → `bankTransfer: 'all'`** — o array com `'pix'` causava erro
  422 na API do Mercado Pago. O valor aceito é a string `'all'`
- **`ticket: 'none'` e `mercadoPago: 'none'` removidos** — conforme documentação oficial
  do MP, para desabilitar um método basta omitir a chave; usar `'none'` era inválido
- **`_currentEarnedXp` removido** — variável de módulo declarada mas nunca lida (código
  morto). O `earnedXp` já circula corretamente por parâmetro em toda a cadeia de callbacks

#### `public/service-worker.js`
- **`/ecommerce.js` removido da lista de ASSETS** — arquivo legado que não existe em
  `/public/` e não é carregado pelo HTML. Causava `Failed to execute 'addAll' on 'Cache'`
  no install do SW, que travava o service worker silenciosamente
- **Cache bumped para `bruna-mandz-v4`** — força reinstalação do SW no navegador dos
  visitantes existentes

#### Resultado após correções
- Payment Brick carregou sem erro 422 ✅
- QR Code PIX gerado com sucesso após inserir tokens de produção ✅
- Erros restantes no console são externos/inofensivos:
  - `cdn.tailwindcss.com` — aviso de CDN em produção (ver item 18.3)
  - `AudioContext` — Tone.js inicializando antes de interação (comportamento normal)
  - SVG width/height — bug interno do SDK do MP ao renderizar o QR Code, não é código nosso

---

### 18.2 — Plano estratégico da loja (fonte de verdade para decisões futuras)

A loja **não existe para ser a principal fonte de receita do site**. Seu papel é:

1. **Sinal de credibilidade ("trust signal")** — uma escola com identidade visual
   coerente, merch com design e checkout funcional transmite seriedade e estrutura
   profissional. Pais e alunos em potencial percebem isso subconscientemente
2. **Portfólio para campanhas pagas** — quando a Bruna rodar anúncios no Instagram
   ou Google, o destino do clique precisa reforçar a qualidade percebida no criativo.
   Uma loja bem feita converte visitantes em interessados em matrícula
3. **Loop de pertencimento** — alunos usando o merch e postando nas redes é publicidade
   orgânica e autêntica, muito mais eficaz que anúncio pago

#### O que a loja deve ter obrigatoriamente
- **Fotos reais** dos produtos, preferencialmente com alunos usando/segurando os itens
- **Depoimentos com nome e foto** — não citações anônimas
- **Checkout sem surpresas** — todos os custos visíveis antes do pagamento (frete, taxas)
- **Ícones de segurança** visíveis no momento do pagamento (Mercado Pago, PIX, cadeado SSL)
- **Política de entrega e troca** clara e acessível antes do checkout

#### Roadmap de melhorias (em ordem de prioridade)
| Prazo | Ação |
|---|---|
| Curto (técnico) | Migrar Tailwind do CDN para build local (elimina aviso do console e melhora performance) |
| Curto (técnico) | Adicionar ícones de pagamento seguro visíveis no checkout |
| Curto (técnico) | Garantir carregamento < 3 segundos no mobile |
| Médio (conteúdo) | Substituir placeholders pelas fotos reais dos produtos (em andamento — ver 18.3) |
| Médio (conteúdo) | Seção de depoimentos de alunos na página da loja |
| Médio (conteúdo) | Política de entrega e troca visível |
| Estratégico | Seção "Nossa história" / "Quem é a Bruna Mandz" — humaniza a marca |
| Estratégico | Integrar feed do Instagram com fotos de alunos diretamente no site |
| Estratégico | Usar a loja como proof of concept nas campanhas pagas: "escola com estrutura e identidade própria" |

---

### 18.3 — Catálogo definitivo de produtos (13 itens)

Imagens sendo criadas pela Bruna Mandz em paralelo. Assim que as imagens estiverem
prontas, substituir os placeholders em `store/products.js`.

| # | Produto | Categoria | Variantes esperadas | Status imagem |
|---|---|---|---|---|
| 1 | Pulseira | Acessórios | Única | ⏳ Em criação |
| 2 | Palheta | Acessórios | Única | ⏳ Em criação |
| 3 | Chaveiro | Acessórios | Única | ⏳ Em criação |
| 4 | Adesivo Vinil | Acessórios | Única | ⏳ Em criação |
| 5 | Bloco de anotações | Papelaria | Única | ⏳ Em criação |
| 6 | Caneta | Papelaria | Única | ⏳ Em criação |
| 7 | Copo térmico | Acessórios | Única | ⏳ Em criação |
| 8 | Cordão para crachá | Acessórios | Única | ⏳ Em criação |
| 9 | Sacochila | Bolsas | Única | ⏳ Em criação |
| 10 | Marca-página | Papelaria | Única | ⏳ Em criação |
| 11 | Camisa Clássica | Roupas | P / M / G / GG | ⏳ Em criação |
| 12 | Camisa Minimalista | Roupas | P / M / G / GG | ⏳ Em criação |
| 13 | Camisa Rock | Roupas | P / M / G / GG | ⏳ Em criação |

#### Próximo passo quando as imagens estiverem prontas
1. Nomear os arquivos de imagem de forma padronizada (ex: `pulseira.jpg`,
   `camisa-classica.jpg`) e colocar em `public/`
2. Atualizar `store/products.js` com os 13 produtos, apontando para os novos
   caminhos de imagem e os preços definidos pela Bruna
3. Definir categorias de filtro na loja (sugestão: Roupas / Acessórios / Papelaria / Bolsas)
4. Tirar foto de cada produto sendo usado por um aluno (para as fotos secundárias dos cards)

### Status
- [x] Correções do Payment Brick aplicadas e enviadas ao GitHub
- [x] Service Worker corrigido
- [x] Plano estratégico documentado
- [x] Catálogo de 13 produtos registrado
- [ ] Imagens dos produtos sendo criadas (em andamento)
- [ ] Atualizar `store/products.js` com os 13 produtos e imagens reais
- [ ] Testar checkout com cartão (PIX já validado em produção)


---

## ✅ ETAPA 19 — Catálogo real com imagens definitivas

### O que foi feito
- `store/products.js` reescrito com os **7 produtos reais** aprovados:
  Pulseira, Palheta, Chaveiro, Copo Térmico, Camisa Clássica, Camisa Minimalista, Camisa Rock
- Imagens reais adicionadas ao repositório em `public/`:
  `Pulseira.png`, `Paleta.png`, `Chaveiro.png`, `Copo.png`,
  `TSHIRT_PREMIUN.png`, `TSHIRT_PRO.png`, `TSHIRT_ROCK.png`
- Todos os produtos-placeholder (caneca, mochila, kit, bloco) **removidos**
- Produto de teste `teste-pagamento-1real` **removido**
- Camisas com variante de tamanho (P/M/G/GG); demais sem variante

### Pendente
- [ ] Confirmar preços reais com a Bruna (valores atuais são estimativas):
  Pulseira R$19,90 | Palheta R$9,90 | Chaveiro R$14,90 | Copo R$59,90 | Camisas R$69,90

---

## 📋 ETAPA 20 — Plano do Painel Administrativo

### 20.1 — Diagnóstico do estado atual

O painel (`painel-x9k2f.html`) existe e funciona, mas está na **fase 0**: faz apenas
uma coisa — listar pedidos numa tabela. Não há nenhuma ação possível sobre eles.

#### O que já existe e funciona
- Tela de login com senha via header `x-admin-password` (variável `ADMIN_PASSWORD` na Vercel)
- Tabela de pedidos buscada do Supabase (até 200 registros, ordenados por data)
- Colunas: ID, Data, Cliente, Método, Total, Status (com pill colorida), XP
- Botão "Atualizar" para recarregar manualmente
- URL escondida (`/painel-x9k2f.html`) com `noindex, nofollow`

#### O que NÃO existe e precisa ser construído
- **Nenhuma ação sobre pedidos** — não dá para mudar status, cancelar, reembolsar
- **Nenhum resumo ou KPI** — sem totais, sem receita do dia/mês, sem contagem por status
- **Nenhuma gestão de estoque** — estoques estão fixos em `products.js`, não há como
  atualizar pelo painel
- **Nenhuma gestão de produtos** — preços, nomes e imagens só mudam editando o código
- **Nenhum filtro ou busca** — com muitos pedidos, fica impossível encontrar um específico
- **Nenhuma exportação** — sem como gerar relatório ou lista para Excel/WhatsApp
- **Nenhuma notificação** — a Bruna não sabe que chegou um pedido novo sem abrir o painel

---

### 20.2 — Referências de melhores práticas

Com base em pesquisa de mercado (2025–2026):

**Dashboard como nerve center** — Um painel admin eficaz consolida pedidos, estoque,
pagamentos e analytics numa visão única. O que separa um painel eficaz de um estático é
a atualização em tempo real: dados ao vivo permitem decisões rápidas em vez de snapshots
desatualizados.

**Princípio das 4 perspectivas simultâneas** — Mostre resumo do pedido, disponibilidade
de estoque e opções de ação ao mesmo tempo, com badges coloridas para destacar exceções.
Quando quem gerencia consegue fazer tudo sem navegar por múltiplas telas, elimina cliques
desnecessários e tempo de decisão.

**Ações diretas na tabela** — O gestor deve conseguir mudar o status de um pedido,
marcar como enviado ou emitir reembolso diretamente da lista, sem abrir outra tela.

**Mobile-first para admin** — Em 2025, painéis admin precisam funcionar no celular.
A Bruna precisa conseguir ver e agir sobre um pedido novo pelo celular, não só pelo
computador.

**Exportação de dados** — Exportação CSV/Excel para dados de pedidos é considerada
funcionalidade padrão em painéis admin modernos. Essencial para controle financeiro e
prestação de contas.

---

### 20.3 — Roadmap de melhorias (priorizado)

As melhorias estão divididas em 3 fases, da mais simples à mais completa.
Cada fase entrega valor imediato e independe da seguinte para funcionar.

#### 🟥 FASE A — Ações essenciais (implementar primeiro)
*O painel passa de "visualizador" para "ferramenta de trabalho"*

| Item | O que faz | Complexidade |
|---|---|---|
| **A1** | Cards de KPI no topo: total de pedidos, receita do dia, receita do mês, pedidos pendentes | Baixa |
| **A2** | Botão de ação por pedido: mudar status (Pendente → Aprovado → Enviado → Cancelado) | Média |
| **A3** | Filtro por status (Todos / Pendente / Aprovado / Cancelado) | Baixa |
| **A4** | Campo de busca por nome do cliente ou ID do pedido | Baixa |
| **A5** | Exportar lista atual como CSV (para abrir no Excel ou Google Sheets) | Média |

**Nova API necessária:** `api/update-order-status.js` — recebe `{ orderId, newStatus }`,
valida senha admin, atualiza no Supabase e retorna o pedido atualizado.

---

#### 🟧 FASE B — Visibilidade proativa (depois da Fase A)
*A Bruna não precisa mais abrir o painel para saber o que está acontecendo*

| Item | O que faz | Complexidade |
|---|---|---|
| **B1** | Auto-refresh do painel a cada 60 segundos (sem precisar clicar "Atualizar") | Baixa |
| **B2** | Notificação por e-mail quando chega um pedido novo (via Resend ou SendGrid) | Média |
| **B3** | Detalhe expandido do pedido: mostrar os itens comprados (campo `items` do Supabase) | Média |
| **B4** | Indicador visual de "pedido novo" (highlight na linha por X minutos após entrada) | Baixa |

**Nova API necessária:** `api/notify-new-order.js` — chamada pelo webhook do MP quando
`status = approved`, dispara e-mail para o endereço configurado em `NOTIFY_EMAIL`.

---

#### 🟨 FASE C — Gestão de produtos e estoque (fase futura)
*Elimina a necessidade de editar código para mudar preço ou estoque*

| Item | O que faz | Complexidade |
|---|---|---|
| **C1** | Aba "Produtos" — lista os 7 produtos com estoque atual e preço | Alta |
| **C2** | Editar estoque diretamente pelo painel (campo numérico inline) | Alta |
| **C3** | Editar preço pelo painel | Alta |
| **C4** | Ativar/desativar produto (campo `active`) sem editar código | Média |

**Pré-requisito:** mover `products.js` do arquivo estático para uma tabela `products`
no Supabase, com as mesmas colunas que o objeto atual (`id`, `name`, `price`, `stock`,
`active`, `image`, etc.). O `store/store.js` passaria a buscar produtos via API em vez
de importar o arquivo JS.

---

### 20.4 — O que NÃO fazer (armadilhas comuns)

- **Não construir tudo de uma vez** — a Fase A já transforma o painel numa ferramenta
  real. Fases B e C podem esperar até a loja ter volume de pedidos que justifique.
- **Não adicionar autenticação complexa agora** — a senha simples via header é adequada
  para o volume atual. JWT/OAuth só fazem sentido quando houver múltiplos operadores.
- **Não exibir dados sensíveis desnecessariamente** — telefone e e-mail do cliente devem
  aparecer só quando necessário (ex: ao expandir o detalhe de um pedido), não na tabela
  principal que fica aberta na tela.
- **Não quebrar o mobile** — qualquer melhoria visual deve ser testada no celular antes
  de ir ao ar. O painel atual não é responsivo e isso precisa mudar na Fase A.

---

### 20.5 — Status e próximos passos

- [x] Diagnóstico do estado atual documentado
- [x] Referências de melhores práticas pesquisadas e aplicadas ao contexto
- [x] Roadmap de 3 fases definido e priorizado
- [x] **Fase A implementada** — ver Etapa 21
- [ ] Confirmar com a Bruna quais itens da Fase A têm prioridade máxima
- [ ] Definir se a notificação por e-mail (Fase B2) é urgente — se sim, pode ser
      antecipada para a Fase A

---

## ✅ ETAPA 21 — Implementação da Fase A (painel administrativo)

Implementados todos os 5 itens da Fase A definidos na Etapa 20.3.

### O que foi feito

**Nova API: `api/update-order-status.js`**
- Recebe `{ orderId, status }`, protegido pela mesma senha admin
  (`x-admin-password`)
- Valida que `status` é um dos 5 valores aceitos pela tabela `orders`
  (`pending`, `approved`, `rejected`, `cancelled`, `refunded`)
- Atualiza no Supabase via `update().eq('id', orderId)`, retorna o pedido
  atualizado para o painel refletir a mudança sem precisar recarregar tudo

**`painel-x9k2f.html` — reescrito com todas as features da Fase A:**
- **A1 — KPIs**: 4 cards no topo (Receita Hoje, Receita do Mês, Pedidos
  Pendentes, Total de Pedidos). Receita considera só pedidos com
  `status: 'approved'`; comparação de data feita por ano/mês/dia, não por
  string, para evitar bugs de fuso horário
- **A2 — Ação por pedido**: `<select>` de status em cada linha da tabela,
  ao trocar chama `update-order-status` e atualiza a linha + os KPIs sem
  recarregar a página inteira
- **A3 — Filtro por status** e **A4 — busca por nome/e-mail/ID**: ambos
  client-side, combináveis entre si (busca dentro do status filtrado)
- **A5 — Exportar CSV**: gera CSV com BOM UTF-8 (para acentos abrirem
  corretamente no Excel), separador `;`, exporta a lista **já filtrada**
  (respeita os filtros ativos no momento do clique)
- **Responsividade mobile** (requisito da Etapa 20.4): abaixo de 720px, a
  tabela vira uma lista de cards (`<tr>` como card, `<td>` com
  `data-label` exibido via `::before`); KPIs em grid 2 colunas; toolbar e
  filtros em coluna única

### Validações feitas
- ✅ `node --check` em `update-order-status.js` e no `<script>` extraído do painel
- ✅ ESLint sem erros em `update-order-status.js`
- ✅ CSS do painel com chaves balanceadas (48/48)
- ✅ Lógica de KPI testada com dados simulados (receita hoje/mês, contagem
  de pendentes — todos os valores calculados corretamente)
- ✅ Lógica de filtro + busca testada isoladamente, incluindo combinação
  dos dois filtros simultâneos
- ✅ Escaping de aspas no CSV testado (nomes com aspas duplas não quebram
  o arquivo)
- ✅ Todos os IDs referenciados pelo JS existem no HTML (checagem
  automatizada, tanto no `index.html` quanto no próprio painel)
- ✅ `npm run build` gera o painel corretamente (23.79 kB)
- ✅ Prettier aplicado

### Limpeza adicional feita nesta sessão
Durante a sincronização com o estado mais recente do repositório, foram
encontrados e removidos arquivos órfãos que não afetavam o funcionamento,
mas deixavam o projeto mais difícil de manter:
- `api/payment-provider.js` e `api/env.example` — mocks antigos
  desconectados, reintroduzidos por engano (provavelmente extração de um
  zip antigo). O `.env.example` correto já existe na raiz do projeto
- `src/main.js` e `src/global-bridge.js` — arquivos órfãos com imports
  quebrados (`./audio.js`/`./game.js`, que vivem em `public/`, não em
  `src/`); nunca foram referenciados pelo `index.html`, então não
  quebravam nada, mas eram código morto e confuso
- `correcao-404-public.zip` — zip de uma entrega antiga, comitado por
  engano na raiz do repositório

Também foi reaplicada uma pequena melhoria de robustez perdida durante a
sincronização: a detecção de PIX no `checkout-modal.js` agora checa tanto
`selectedPaymentMethod === 'bank_transfer'` quanto
`formData.payment_method_id === 'pix'`, reduzindo o risco de depender de
um único nome de campo do SDK do Mercado Pago.

### Status
- [ ] Fazer commit/push e testar o painel no navegador e no celular
- [ ] Confirmar que mudar o status de um pedido reflete corretamente
- [ ] Confirmar que o CSV abre certo no Excel/Google Sheets (acentos OK)
- [ ] Decidir com a Bruna se a Fase B (notificação por e-mail) é prioridade
  antes de avançar para a Fase C (gestão de produtos)

---

---

## ✅ ETAPA 21 — Pesquisa de integração MP + Implementação da Fase B

### 21.1 — Decisão sobre integração direta com a API do Mercado Pago

**Pergunta:** vale a pena buscar pedidos direto da API do MP em vez do Supabase no painel admin?

**Resposta: não. Manter arquitetura atual.**

A API do MP (`GET /v1/payments/search`) retorna dados financeiros da transação —
valor, status, método. Ela **não sabe** o nome do produto, tamanho, XP ganho nem
dados completos do cliente — essas informações ficam no Supabase porque foram
gravadas pelo `create-payment.js` no momento da compra. Buscar só do MP perderia
todos esses dados; cruzar os dois aumentaria complexidade sem ganho real.

A arquitetura atual (MP → webhook → Supabase → painel) já é o padrão oficial
recomendado pelo MP para e-commerces. O webhook já está implementado e fecha o ciclo.

**O que foi adicionado da API do MP:** botão "Verificar no MP" por pedido —
consulta `GET /v1/payments/{mp_payment_id}` para checar o status real quando houver
dúvida (ex: pedido "Pendente" no Supabase mas cliente diz que pagou). Agrega valor
sem quebrar a arquitetura.

---

### 21.2 — Fase B implementada

#### Itens implementados

| Item | Descrição | Arquivo |
|---|---|---|
| **B1** | Auto-refresh a cada 60s com contador regressivo visível | `painel-x9k2f.html` |
| **B2** | Notificação por e-mail quando chega pedido novo (via Resend) | `api/notify-new-order.js` + `api/webhook.js` |
| **B3** | Detalhe expandido: linha clicável mostra itens, tamanho, XP | `painel-x9k2f.html` |
| **B4** | Highlight visual em pedidos novos (últimos 5 minutos) | `painel-x9k2f.html` |
| **B+** | Botão "Verificar no MP" — consulta status real na API do MP | `api/verify-mp-payment.js` + `painel-x9k2f.html` |

#### Nova variável de ambiente necessária na Vercel
- `RESEND_API_KEY` — chave da API do Resend (resend.com, plano gratuito cobre até
  3.000 e-mails/mês). Criar conta, gerar a chave e adicionar na Vercel.
- `NOTIFY_EMAIL` — endereço de e-mail que vai receber as notificações de pedido novo
  (ex: o e-mail da Bruna)

#### Como ativar as notificações
1. Criar conta gratuita em resend.com
2. Gerar API Key em resend.com/api-keys
3. Adicionar `RESEND_API_KEY` e `NOTIFY_EMAIL` nas variáveis de ambiente da Vercel
4. Fazer redeploy (ou aguardar o deploy automático do push)

### Status
- [x] Decisão sobre integração MP documentada
- [x] Auto-refresh com contador (B1)
- [x] Notificação por e-mail via Resend (B2)
- [x] Detalhe expandido de itens (B3)
- [x] Highlight de pedidos novos (B4)
- [x] Botão "Verificar no MP" (B+)
- [ ] Configurar RESEND_API_KEY e NOTIFY_EMAIL na Vercel

## ✅ ETAPA 23 — Auditoria completa de `api/` e `store/` + correções

### Contexto
Enquanto se aguardam os dados de acesso da conta Mercado Pago da Bruna para
o teste real de ponta a ponta (Etapa anterior), foi feita uma auditoria
completa de todos os arquivos de `api/` e `store/` (enviados via zip),
revisando cada um por bugs, falhas de segurança e inconsistências.

### 🔴 Bug encontrado e corrigido: notificação por e-mail duplicada

**Causa:** o Mercado Pago reenvia o mesmo webhook várias vezes (comportamento
oficial documentado, não é falha). O `webhook.js` notificava por e-mail toda
vez que recebia `status === 'approved'`, sem checar se o pedido **já estava**
aprovado antes — resultando em múltiplos e-mails para o mesmo pedido.

**Agravante identificado:** no fluxo de **Cartão**, o `create-payment.js` já
grava `status: 'approved'` no Supabase no momento da aprovação síncrona.
Segundos depois, o webhook do MP confirma o mesmo pagamento — e, sem a
correção, isso por si só já disparava um segundo e-mail, mesmo sem nenhum
reenvio do MP.

**Correção aplicada em `api/webhook.js`:**
- Antes de atualizar o pedido, busca o status **atual** no Supabase
- Só notifica por e-mail na **transição** para `approved` (nunca se o pedido
  já estava aprovado antes desta chamada)
- Adicionado filtro de tipo de notificação (`type !== 'payment'` é ignorado
  com `200 OK`, evitando retries inúteis do MP para eventos como
  `merchant_order`)
- Passou a usar o helper compartilhado `getSupabase()` (`api/_lib/supabase.js`)
  em vez de instanciar um client Supabase próprio — elimina duplicação de código

### 🟡 Melhoria aplicada: risco de colisão de ID de pedido

**Causa:** `store/cart.js` gerava o ID do pedido com
`` `BM-${Date.now().toString().slice(-6)}` `` — usando só os últimos 6
dígitos do timestamp em milissegundos, que se repetem a cada ~16,6 minutos.
Em caso de colisão, o `upsert` por `id` no Supabase sobrescreveria
silenciosamente um pedido anterior.

**Correção aplicada:** nova função `generateOrderId()` combina timestamp +
sufixo aleatório (ex: `BM-66107551-998R`), eliminando o risco de colisão.

### 🟢 Verificado e confirmado correto (sem alterações necessárias)
- `api/order-status.js`, `api/update-order-status.js`,
  `api/verify-mp-payment.js`, `api/admin-orders.js`, `api/config.js`,
  `api/_lib/supabase.js` — todos com proteção de senha adequada onde
  necessário, sem dados sensíveis expostos
- `api/test-notify.js` — **já está protegido** por `x-admin-password`
  (correção de uma suposição anterior incorreta deste registro)
- `store/checkout-modal.js`, `store/payment-config.js`, `store/products.js`,
  `store/store.js` — fluxo de checkout único (overlay) consistente com a
  Etapa 17, Payment Brick configurado corretamente

### ⏳ Pendências de hardening identificadas (não bloqueantes, fazer depois)
- `api/webhook.js` não valida a assinatura `x-signature` enviada pelo
  Mercado Pago — qualquer POST externo com um `paymentId` válido é
  processado. Risco parcialmente mitigado hoje porque o pagamento é sempre
  buscado de novo na API real do MP antes de confiar nos dados
- Confirmado que o zip auditado ainda continha os arquivos órfãos da
  Etapa 22 (`api/payment-provider.js`, `api/env.example`,
  `api/test-notify.js`) — indica que a limpeza da Etapa 22 precisa ser
  revisada/confirmada no repositório real

### Validações feitas
- ✅ `node --check` em `webhook.js` e `cart.js` corrigidos
- ✅ Teste manual da função `generateOrderId()` — IDs únicos confirmados
  mesmo em chamadas no mesmo milissegundo

### Status
- [x] `api/webhook.js` corrigido
- [x] `store/cart.js` corrigido
- [x] Commit e push feitos pelo usuário
- [ ] Confirmar que o deploy na Vercel passa limpo com as correções
- [ ] Reconfirmar se os arquivos órfãos da Etapa 22 foram de fato removidos
  do repositório
- [ ] Validação de assinatura do webhook (`x-signature`) — pendência de
  hardening futuro
- [ ] Seguir com o teste real de ponta a ponta assim que os dados da conta
  Mercado Pago da Bruna estiverem disponíveis


## 🔮 Próximos Passos (o que falta para ir ao ar de verdade)

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

## 🚦 Próximos Passos Imediatos (o que falta AGORA)

1. Continuar o roteiro de teste do painel `/painel-x9k2f.html`: filtro por
   status, busca, exportar CSV, auto-refresh, detalhe expandido, highlight
   de pedido novo, botão "Verificar no MP", visualização mobile
2. Confirmar remoção dos arquivos órfãos ainda pendentes:
   `api/payment-provider.js`, `api/env.example`
3. Assim que tiver os dados de acesso da conta Mercado Pago da Bruna:
   testar o fluxo real de ponta a ponta (PIX de R$1) e confirmar que o
   e-mail de notificação chega **uma única vez**, sem duplicidade
4. Planejar a Fase C ampliada do painel admin (gestão de produtos: editar
   preço, adicionar/remover produto, sinalizar Novo/Descontinuado/Em Falta)
   — ver detalhes na Etapa 24
5. Confirmar preços reais dos 7 produtos com a Bruna
6. Decidir o que fazer com o site antigo na Netlify, se ainda não foi
   finalizado

Detalhe completo de cada item nas Etapas 20 a 25 abaixo.

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



### Investigação
Auditado novamente o `api/update-order-status.js` — confirmado correto
desde a Etapa 23, exige `POST`. A causa real estava no **front-end do
painel** (`painel-x9k2f.html`), na função `updateOrderStatus()`, com **dois
problemas de contrato** com a API:

1. **Método errado**: chamava com `method: 'PATCH'`, mas a API só aceita
   `POST` → causa direta do erro 405
2. **Campo errado no corpo**: enviava `{ orderId, newStatus: status }`, mas
   a API espera `{ orderId, status }` — problema que ficaria escondido até
   ser revelado pela correção do método

Mesmo padrão de causa já visto na Etapa 17: painel e API escritos/ajustados
em momentos diferentes, sem contrato sincronizado.

### Correção aplicada em `painel-x9k2f.html`
- `updateOrderStatus()`: `method: 'PATCH'` → `'POST'`
- Corpo: `{ orderId, newStatus: status }` → `{ orderId, status }`
- Corrigido também o `favicon.ico 404` (cosmético): adicionado
  `<link rel="icon" type="image/png" href="/LOGOPRETO.png">` no `<head>`

### Validações feitas
- ✅ JavaScript embutido extraído e validado com `node --check`
- ✅ Confirmado que `fetchOrders`, `verifyMpPayment`, exportação CSV e
  auto-refresh não têm o mesmo problema de contrato — só esta função
  estava afetada

### Status
- [x] Bug identificado e corrigido
- [x] Commit/push da correção
- [x] Retestado: troca de status funcionando sem erro 405
- [ ] Continuar o roteiro de teste do painel a partir do item onde parou:
  filtro por status, busca, exportar CSV, auto-refresh, detalhe expandido,
  highlight de pedido novo, botão "Verificar no MP", visualização mobile