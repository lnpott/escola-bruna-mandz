# 🛍️ Registro de Implementação — Loja Oficial Bruna Mandz

> Documento vivo. Atualizado a cada etapa da implementação.
> Última atualização: 01/07/2026 — (Etapa 29)

---

## ✅ ETAPA 27 — Organização estrutural do repositório

### O que foi feito
- Reorganização dos arquivos soltos da raiz em pastas mais coerentes:
  - `public/brand` para logos e branding
  - `public/media` para imagens e vídeos do site
  - `public/merch` para assets de produtos/merchandising
  - `public/products` para imagens de produtos
  - `docs` para documentos de apoio e configuração
- Ajuste dos caminhos usados no HTML para refletir a nova estrutura de pastas.
- Remoção de arquivos e pastas redundantes/obsoletos que não fazem mais parte do fluxo principal da loja.
- Validação final confirmada com `npm run build`, que concluíu com sucesso.

### Status
- [x] Estrutura do projeto mais limpa e organizada
- [x] Links de assets corrigidos
- [x] Build de produção validada

---

## ✅ ETAPA 28 — Correção de imagens dos produtos na loja e no painel

### O que foi feito
- Identificou-se que os produtos estavam sendo renderizados com caminhos antigos de imagem, como `Chaveiro.png`, `Pulseira.png` e `TSHIRT_PRO.png`, o que causava 404s no navegador.
- Implementou-se a normalização de imagens de produtos tanto na API da loja quanto na API do painel admin.
- Qualquer valor antigo ou incompleto agora é convertido para o caminho correto em `public/merch`.
- Atualizou-se o seed do Supabase para persistir os caminhos corretos dos produtos.
- Validação confirmada com `npm run build`, que concluiu com sucesso.

### Status
- [x] Imagens de produtos corrigidas na loja
- [x] Imagens de produtos corrigidas no painel admin
- [x] Build de produção validada

---

## � ETAPA 29 — Planejamento: Sistema de Gestão de Produtos com Upload de Imagens

### Contexto
O painel admin atual (Fases A e B) permite apenas **editar campos de texto** dos 7 produtos
existentes. Não é possível:
- Adicionar novos produtos
- Deletar produtos
- Fazer upload de imagens (apenas digitar caminhos)
- Fazer crop/redimensionamento de imagens
- Editar reward XP

Identificada a necessidade de implementar a **Fase C: Gestão Completa de Produtos**.

### Estado Atual vs. Necessário

| Funcionalidade | Status | Complexidade |
|---|---|---|
| Editar nome/preço/estoque | ✅ Funciona | Baixa |
| Editar categoria, badge, caminho de imagem | ✅ Funciona (texto) | Baixa |
| **Adicionar produtos novos** | ❌ Impossível | Alta |
| **Deletar produtos** | ❌ Impossível | Média |
| **Upload de imagem real** | ❌ Só aceita caminho em texto | Alta |
| **Crop/redimensionamento** | ❌ Não existe | Média |
| **Color picker para badge** | ❌ Só texto hex | Baixa |
| **Editar variants (tamanhos)** | ❌ Não tem UI | Alta |
| **Editar reward_xp** | ❌ Campo oculto | Baixa |

### Solução Proposta: Arquitetura em 3 Camadas

```
1️⃣ FRONTEND (painel-x9k2f.html)
   ├─ Input file + preview 72x72
   ├─ Modal overlay com Cropper.js
   │  └─ Zoom, rotate, move, crop (canvas-based)
   └─ Compressão JPEG 80% antes de enviar
         ↓
2️⃣ BACKEND (api/upload-image.js — NOVO)
   ├─ Validação: tipo (JPEG/PNG/WebP), tamanho (<2MB)
   ├─ Sanitização de nome arquivo
   ├─ Upload multipart → Supabase Storage
   └─ Retorna URL pública assinada
         ↓
3️⃣ DATABASE (Supabase)
   ├─ Bucket: `product-images` (público, com CORS)
   └─ Campo `image` na tabela `products` = URL
```

### Tecnologias Selecionadas

**Para crop de imagens:**
- **Cropper.js** (35KB, CDN) — https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js
  - ✅ Zoom, rotate, move, crop
  - ✅ Export para canvas (compressão automática)
  - ✅ Mobile responsivo
  - ✅ Sem dependências externas

**Para armazenamento:**
- **Supabase Storage** (já integrado no projeto)
  - ✅ CDN automático
  - ✅ RLS policies para segurança
  - ✅ URLs públicas assinadas opcionais

**Para compressão:**
- **Canvas API nativa** (sem biblioteca)
  - `toDataURL('image/jpeg', 0.8)` reduz 50-70% do tamanho

### Fluxo de Implementação Proposto

#### Fase C1 — Upload de Imagens (PRÓXIMA)
| Arquivo | O que fazer | Tempo |
|---|---|---|
| `api/upload-image.js` | Novo endpoint, validação + Supabase Storage | 30min |
| `painel-x9k2f.html` | Adicionar Cropper.js + modal de crop + input file | 45min |
| `supabase/schema.sql` | Criar bucket `product-images` com policies CORS | 15min |
| Testes | Upload, crop, feedback UX, erro handling | 30min |

#### Fase C2 — CRUD de Produtos (depois de C1)
| Arquivo | O que fazer | Tempo |
|---|---|---|
| `api/admin-products.js` | Adicionar POST (criar) e DELETE (remover) | 30min |
| `painel-x9k2f.html` | Botão "Novo Produto" + form + confirmação | 1h |
| `painel-x9k2f.html` | Botão "Deletar" com modal de confirmação | 30min |
| Testes | Criar, editar, deletar completo | 45min |

#### Fase C3 — Campos Adicionais (depois de C2)
| Arquivo | O que fazer | Tempo |
|---|---|---|
| `painel-x9k2f.html` | Color picker para badge color | 20min |
| `painel-x9k2f.html` | Editor de reward_xp | 15min |
| `painel-x9k2f.html` | Variant editor (tamanhos/opcões) | 1h |
| `api/admin-products.js` | Validação de variants JSON | 20min |
| Testes | Todas as combinações | 30min |

### Requisitos Técnicos

**Supabase Storage:**
- Bucket: `product-images`
- Acesso público (read), admin autenticado (write/delete)
- CORS habilitado para `*.vercel.app`

**Arquivo `.env` (nova variável):**
```env
SUPABASE_STORAGE_BUCKET=product-images
```

**Segurança:**
- ✅ Validar tipo MIME (não apenas extensão)
- ✅ Validar tamanho (<2MB)
- ✅ Sanitizar nome arquivo (remover caracteres especiais)
- ✅ Usar RLS policies do Supabase para autorização
- ✅ CORS restrictivo no bucket

### Decisões a Confirmar com Usuário

1. **Crop obrigatório ou opcional?**
   - Sim: garante proporções iguais, menos armazenamento
   - Não: mais rápido, aceita qualquer imagem

2. **Deletar produtos do painel?**
   - Sim: CRUD completo
   - Não: apenas marcar como inativo (safer)

3. **Quando começar Fase C?**
   - Imediato (C1 + C2 esta semana)
   - Postergar (manter edição de campos por enquanto)

### Checklist de Implementação

- [ ] Confirmar decisões acima com usuário
- [ ] Criar bucket no Supabase e configurar CORS
- [ ] Implementar `api/upload-image.js`
- [ ] Integrar Cropper.js no painel
- [ ] Testar upload completo local
- [ ] Implementar POST/DELETE em `api/admin-products.js`
- [ ] Testar CRUD no painel
- [ ] Deploy na Vercel
- [ ] Testar em produção
- [ ] Atualizar documentação em `docs/PUBLICACAO.md`

### Status
- [ ] Planejamento concluído
- [ ] Aguardando confirmação de requisitos
- [ ] Pendente: implementação de Fase C1

A loja está no ar, testada de ponta a ponta (PIX, Cartão, painel admin com
Fases A e B completas). O que falta agora é refinamento e itens não
bloqueantes:

1. ✅ Confirmada remoção definitiva dos arquivos órfãos:
   `api/payment-provider.js`, `api/env.example`, `api/test-notify.js`
   Verificação feita no workspace: não existem mais no repositório e não há
   referências ativas pendentes para esses nomes.
2. Encerrar qualquer referência antiga ao **Netlify** e concentrar a publicação
   da loja na **Vercel**, definindo o domínio/URL da nova versão como foco
3. Confirmar os preços reais dos 7 produtos do catálogo com a Bruna
4. Planejar a **Fase C** do painel (gestão de produtos direto pelo painel,
   sem editar código) quando fizer sentido priorizar
5. Hardening pendente: validação de assinatura `x-signature` no webhook
6. Decidir se a Bruna quer notificação por e-mail também para pedidos via
   PIX que ficam pendentes por muito tempo (hoje só notifica quando aprovado)
7. Decidir o que fazer com `api/test-notify.js` — já é seguro (protegido
   por senha), mas pode ser removido se não houver mais utilidade

Detalhe completo de cada item nas Etapas 20 a 25 abaixo, e na seção
"Próximos Passos" mais ao final do documento.

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
| 21 | **Fase A do Painel implementada**: KPIs, ação de status inline, filtro, busca, export CSV, mobile responsivo | ✅ Concluído e testado |
| 22 | **Pesquisa integração MP** — decisão documentada + **Fase B implementada** (auto-refresh, notificação e-mail, detalhe de itens, botão "Verificar no MP") | ✅ Concluído e testado |
| 23 | Auditoria completa de `api/` e `store/` — bug de e-mail duplicado e risco de colisão de ID corrigidos | ✅ Corrigido |
| 24 | **Roteiro de teste completo do painel confirmado pelo usuário** (filtro, busca, CSV, auto-refresh, detalhe expandido, "Verificar no MP", mobile) | ✅ Testado e aprovado |
| 25 | **Bug no painel**: troca de status retornava erro 405 — corrigido `painel-x9k2f.html` | ✅ Concluído |
| 26 | **Resiliência da loja e hardening do painel** — fallback local, normalização de produtos, validação de webhook | ✅ Concluído |
| 27 | **Organização estrutural do repositório** — limpeza de pastas, remoção de arquivos órfãos | ✅ Concluído |
| 28 | **Correção de imagens dos produtos na loja e no painel** — normalização de caminhos, seed do Supabase | ✅ Concluído |
| 29 | **Planejamento: Fase C do Painel — Gestão de Produtos com Upload de Imagens** — arquitetura, tecnologias, requisitos | ⏳ Em Planejamento |

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
8. Encontrado histórico de uma publicação antiga na Netlify, mas a estratégia
   atual é encerrar essa referência e concentrar a implantação da loja na
   Vercel.

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
- [x] Novo commit/push com a correção — deploy passou sem erro
- [x] Variáveis de ambiente configuradas com valores reais na Vercel

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
   (`blur()`) de qualquer campo dentro do modal antes de escondê-lo
3. `store/checkout-modal.js` — clicar fora do modal de **cartão**
   (overlay) agora também destrói o Card Payment Brick do Mercado Pago
4. Confirmado que nenhum input do checkout tem `readonly`/`disabled`
   acidental

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
produção.

### Correção aplicada
- Criada a pasta `public/`
- Movidos para `public/`: `audio.js`, `game.js`, `manifest.json`,
  `service-worker.js`
- Copiados para `public/`: `brindes.jpg`, `LOGOPRETO.png`, `LOGOPRETOPQNO.png`
- `store/products.js` — caminhos de imagem corrigidos para `/brindes.jpg`
- `index.html`: caminhos absolutos em todos os scripts e assets

### Status
- [x] Testado pelo usuário — 404s resolvidos e o site carrega corretamente

---

## ✅ ETAPA 13 — `game.js`: `Uncaught SyntaxError: Unexpected token 'export'`

### Causa
`public/game.js` tinha `export { startGame, stopGame, demonstrateSequence, handleKeyClick }`
— sintaxe inválida em script clássico (sem `type="module"`), impedindo todo o arquivo
de executar.

### Correção aplicada
- `public/game.js` — removida a linha `export { ... }`
- `public/game.js` — removida chamada duplicada de `initPianoKeyboard`

### Validação
- ✅ `node --check public/game.js` confirma sintaxe válida

---

## ✅ ETAPA 14 — Checkout PIX: `Unauthorized use of live credentials` (causa real esclarecida)

### Causa real
**Pagamentos PIX não podem ser realizados com credenciais de teste** — confirmado
via documentação oficial do Mercado Pago. O sandbox serve para cartão, não PIX.

A forma oficial de testar PIX é usar credenciais de produção com:
1. E-mail diferente do e-mail de login da conta MP vendedora
2. Valor baixo (ex: R$ 1,00)

### Status
- [x] Causa raiz identificada e confirmada via documentação oficial

---

## ⏳ ETAPA 15 — Plano de teste PIX de ponta a ponta

### O que foi preparado
- `store/products.js` — adicionado produto temporário `🧪 TESTE — Não comprar (R$ 1,00)`
  (id: `teste-pagamento-1real`) para validar o fluxo

### Status
- [x] Teste executado — deu erro `Unauthorized use of live credentials`,
  investigado e tratado na Etapa 16
- [x] Produto temporário `teste-pagamento-1real` removido do catálogo (Etapa 19)

---

## ✅ ETAPA 16 — Investigação do erro persistente em PIX + causa resolvida

### Causa real confirmada
A aplicação no Mercado Pago estava configurada para a **API Orders** em vez da
**API Pagamentos** — trocar para a API correta no painel do MP resolveu o erro.

### Correção aplicada no código
- `api/create-payment.js` — adicionado `requestOptions: { idempotencyKey }` único
  por pedido em ambas as chamadas `payment.create()` (boa prática, evita duplicatas)

### Status
- [x] Causa real confirmada e resolvida
- [x] Fluxo PIX validado em produção (Etapa 18)

---

## ✅ ETAPA 17 — Incidente: arquivos sobrescritos por outra ferramenta + Reescrita completa

### O que aconteceu
Outra ferramenta de IA sobrescreveu `store/store.js` e `store/checkout-modal.js`
com versões incompatíveis com a arquitetura real (payload errado, IDs de HTML
inexistentes, chave de localStorage diferente).

### Decisão tomada
Reescrita completa e definitiva do checkout: **overlay de tela cheia único**
(`#checkout-overlay`) com 4 seções internas, fechamento controlado (só botão X),
nenhum clique fora fecha o overlay.

### Validações feitas
- ✅ `node --check`, ESLint, Prettier, IDs checados, `npm run build` OK

### ⚠️ Recomendação
Se outra ferramenta de IA for usada no mesmo repositório, sempre informar o
contexto da integração real (Mercado Pago + Supabase) para evitar reescritas
que ignorem os contratos entre arquivos.

---

## ✅ ETAPA 18 — Correções do Payment Brick + Plano Estratégico + Catálogo Definitivo

### 18.1 — Correções técnicas aplicadas

#### `store/checkout-modal.js`
- `bankTransfer: ['pix']` → `bankTransfer: 'all'` (array causava erro 422)
- `ticket: 'none'` e `mercadoPago: 'none'` removidos (inválidos segundo docs do MP)
- `_currentEarnedXp` removido (variável declarada mas nunca lida)

#### `public/service-worker.js`
- `/ecommerce.js` removido da lista de ASSETS (arquivo inexistente travava o SW)
- Cache bumped para `bruna-mandz-v4`

### 18.2 — Plano estratégico da loja

A loja serve como **trust signal**, **portfólio para campanhas pagas** e
**loop de pertencimento** — não como principal fonte de receita.

#### Roadmap de melhorias
| Prazo | Ação |
|---|---|
| Curto (técnico) | Migrar Tailwind do CDN para build local |
| Curto (técnico) | Adicionar ícones de pagamento seguro no checkout |
| Médio (conteúdo) | Substituir placeholders por fotos reais dos produtos |
| Médio (conteúdo) | Seção de depoimentos de alunos |
| Médio (conteúdo) | Política de entrega e troca visível |
| Estratégico | Seção "Quem é a Bruna Mandz" |
| Estratégico | Feed do Instagram integrado ao site |

### 18.3 — Catálogo definitivo de produtos (13 itens planejados)
Ver Etapa 19 para o catálogo real implementado (7 produtos aprovados).

### Status
- [x] Correções do Payment Brick aplicadas
- [x] Service Worker corrigido
- [x] PIX validado em produção após correções

---

## ✅ ETAPA 19 — Catálogo real com imagens definitivas

### O que foi feito
- `store/products.js` reescrito com os **7 produtos reais** aprovados:
  Pulseira, Palheta, Chaveiro, Copo Térmico, Camisa Clássica, Camisa Minimalista, Camisa Rock
- Imagens reais adicionadas em `public/`:
  `Pulseira.png`, `Paleta.png`, `Chaveiro.png`, `Copo.png`,
  `TSHIRT_PREMIUN.png`, `TSHIRT_PRO.png`, `TSHIRT_ROCK.png`
- Produto de teste `teste-pagamento-1real` removido

### Pendente
- [ ] Confirmar preços reais com a Bruna:
  Pulseira R$19,90 | Palheta R$9,90 | Chaveiro R$14,90 | Copo R$59,90 | Camisas R$69,90

---

## 📋 ETAPA 20 — Plano do Painel Administrativo

### 20.1 — Diagnóstico do estado inicial

#### O que existia e funcionava
- Login com senha via `x-admin-password`
- Tabela de pedidos do Supabase (até 200 registros)
- URL escondida com `noindex, nofollow`

#### O que NÃO existia
- Nenhuma ação sobre pedidos, nenhum KPI, nenhuma gestão de estoque ou produtos,
  nenhum filtro/busca, nenhuma exportação, nenhuma notificação

### 20.2 — Roadmap de melhorias (3 fases)

#### 🟥 FASE A — Ações essenciais
| Item | O que faz | Complexidade |
|---|---|---|
| **A1** | KPIs: receita hoje/mês, pedidos pendentes, total | Baixa |
| **A2** | Trocar status por pedido direto na tabela | Média |
| **A3** | Filtro por status | Baixa |
| **A4** | Busca por nome/e-mail/ID | Baixa |
| **A5** | Exportar CSV filtrado | Média |

#### 🟧 FASE B — Visibilidade proativa
| Item | O que faz | Complexidade |
|---|---|---|
| **B1** | Auto-refresh a cada 60s com contador | Baixa |
| **B2** | Notificação por e-mail via Resend | Média |
| **B3** | Detalhe expandido com itens do pedido | Média |
| **B4** | Highlight de pedidos novos (últimos 5 min) | Baixa |

#### 🟨 FASE C — Gestão de produtos (fase futura)
| Item | O que faz | Complexidade |
|---|---|---|
| **C1** | Aba "Produtos" com lista, estoque e preço | Alta |
| **C2** | Editar estoque inline | Alta |
| **C3** | Editar preço | Alta |
| **C4** | Sinalizar Novo / Descontinuado / Em Falta | Média |
| **C5** | Adicionar produto novo | Alta |
| **C6** | Remover/desativar produto | Média |

**Pré-requisito Fase C:** mover `store/products.js` para tabela `products`
no Supabase com campo `status_flag` (`novo` | `descontinuado` | `em_falta` | `null`).
Criar `api/products.js` (público) e `api/admin-products.js` (protegido, CRUD completo).

### 20.3 — O que NÃO fazer
- Não construir tudo de uma vez — cada fase entrega valor independente
- Não adicionar autenticação complexa agora (senha simples é adequada)
- Não exibir dados sensíveis desnecessariamente na tabela principal
- Não quebrar o mobile — testar sempre no celular

### Status
- [x] Fase A implementada — ver Etapa 21
- [x] Fase B implementada — ver Etapa 22
- [ ] Fase C — planejar quando fizer sentido priorizar (ver requisitos em 20.2)

---

## ✅ ETAPA 21 — Implementação da Fase A (painel administrativo)

### O que foi feito

**Nova API: `api/update-order-status.js`**
- Recebe `{ orderId, status }`, protegido por senha admin
- Valida status contra lista de valores aceitos
- Retorna pedido atualizado sem recarregar tudo

**`painel-x9k2f.html` — Fase A completa:**
- **A1** — KPIs com cálculo correto por ano/mês/dia (não por string)
- **A2** — `<select>` de status inline por linha
- **A3/A4** — Filtro e busca client-side, combináveis
- **A5** — CSV com BOM UTF-8, separador `;`, exporta lista filtrada
- Mobile responsivo: tabela vira cards abaixo de 720px

### Limpeza adicional
- `api/payment-provider.js`, `api/env.example`, `src/main.js`,
  `src/global-bridge.js`, `correcao-404-public.zip` removidos

### Validações feitas
- ✅ `node --check`, ESLint, CSS balanceado, IDs checados, `npm run build` OK

### Status
- [x] Implementado, commitado e testado

---

## ✅ ETAPA 22 — Pesquisa integração MP + Implementação da Fase B

### 22.1 — Decisão sobre integração direta com a API do Mercado Pago

**Resposta: não. Manter arquitetura atual.**

A API do MP não sabe o nome do produto, tamanho, XP nem dados completos do
cliente — tudo isso está no Supabase. A arquitetura atual
(MP → webhook → Supabase → painel) já é o padrão oficial recomendado.

**O que foi adicionado:** botão "Verificar no MP" por pedido, para checar o
status real na API do MP quando houver dúvida — sem quebrar a arquitetura.

### 22.2 — Fase B implementada

| Item | Descrição | Arquivo |
|---|---|---|
| **B1** | Auto-refresh a cada 60s com contador regressivo | `painel-x9k2f.html` |
| **B2** | Notificação por e-mail (via Resend) quando pedido aprovado | `api/notify-new-order.js` + `api/webhook.js` |
| **B3** | Detalhe expandido: linha clicável mostra itens, tamanho, XP | `painel-x9k2f.html` |
| **B4** | Highlight visual em pedidos novos (últimos 5 min) | `painel-x9k2f.html` |
| **B+** | Botão "Verificar no MP" — consulta status real na API do MP | `api/verify-mp-payment.js` + `painel-x9k2f.html` |

#### Variáveis de ambiente necessárias na Vercel
- `RESEND_API_KEY` — chave da API do Resend (plano gratuito: 3.000 e-mails/mês)
- `NOTIFY_EMAIL` — e-mail da Bruna para receber notificações

### Status
- [x] Fase B implementada e testada
- [x] `RESEND_API_KEY` e `NOTIFY_EMAIL` configuradas e validadas via `api/test-notify`

---

## ✅ ETAPA 23 — Auditoria completa de `api/` e `store/` + correções

### Contexto
Auditoria completa de todos os arquivos de `api/` e `store/` (enviados via
zip) enquanto se aguardavam os dados de acesso da conta Mercado Pago da Bruna.

### 🔴 Bug corrigido: notificação por e-mail duplicada

**Causa:** o MP reenvia o mesmo webhook várias vezes. O `webhook.js` disparava
e-mail toda vez que recebia `status === 'approved'`, sem checar se o pedido
já estava aprovado. Agravante: no fluxo de Cartão, o `create-payment.js` já
marca o pedido como `approved` no Supabase — o webhook do MP chegava depois
e disparava um segundo e-mail.

**Correção em `api/webhook.js`:**
- Busca o status atual antes de atualizar
- Só notifica na transição para `approved`
- Filtra eventos que não são `payment` (responde 200 OK sem processar)
- Usa `getSupabase()` compartilhado em vez de instanciar client próprio

### 🟡 Melhoria: risco de colisão de ID de pedido

**Causa:** `store/cart.js` usava só os últimos 6 dígitos do timestamp
(repetem a cada ~16,6 min). Em colisão, o `upsert` sobrescreveria um pedido.

**Correção:** nova função `generateOrderId()` — timestamp + sufixo aleatório
(ex: `BM-66107551-998R`).

### 🟢 Verificado sem alterações
Todos os demais arquivos de `api/` e `store/` confirmados corretos.
`api/test-notify.js` já protegido por `x-admin-password`.

### ⏳ Hardening pendente (não bloqueante)
`api/webhook.js` não valida assinatura `x-signature` do MP. Risco mitigado
porque o pagamento é sempre confirmado diretamente na API do MP.

### Status
- [x] `api/webhook.js` corrigido e commitado
- [x] `store/cart.js` corrigido e commitado
- [x] Deploy na Vercel confirmado sem erro

---

## ✅ ETAPA 24 — Roteiro de teste completo do painel aprovado pelo usuário

### Contexto
Antes de concluir o roteiro de teste manual, foi feita auditoria técnica
adicional usando `raw.githubusercontent.com` (arquivo por arquivo), simulando
cada função isoladamente.

### ⚠️ Nota técnica
`codeload.github.com` (tarball) chegou a servir versão **desatualizada** do
repositório mesmo após commits recentes. Usar `raw.githubusercontent.com`
por arquivo resolveu. Lembrar disso em auditorias futuras.

### Validações isoladas feitas
- ✅ Contrato `verify-mp-payment.js` ↔ `painel-x9k2f.html` conferido
- ✅ Lógica de KPI testada com dados simulados
- ✅ Filtro + busca combinados testados
- ✅ CSV com aspas duplas no nome testado (escaping correto)
- ✅ Detecção de pedidos novos no auto-refresh testada
- ✅ `colspan="8"` confere com as 8 colunas do cabeçalho
- ✅ `npm run build` OK, ESLint OK

### Correção aplicada: `eslint.config.js`
`fetch` e `URL` adicionados aos globals do Node (`fetch: 'readonly'`,
`URL: 'readonly'`) — eram falsos positivos do linter, não bugs funcionais.

### Confirmação do usuário
Roteiro de teste manual completo aprovado: filtro por status, busca,
exportar CSV, auto-refresh, detalhe expandido, highlight, "Verificar no MP",
mobile — **tudo funcionando**.

### Status
- [x] Auditoria de código concluída
- [x] `eslint.config.js` corrigido
- [x] Roteiro de teste manual aprovado pelo usuário

---

## ✅ ETAPA 25 — Bug crítico corrigido: troca de status no painel (erro 405)

### Contexto
Durante o teste do painel (Etapa 24), ao trocar o status de um pedido de
"Pendente" para "Rejeitado", o console mostrou:
```
favicon.ico:1  Failed to load resource: 404
api/update-order-status:1  Failed to load resource: 405
```

### Investigação
`api/update-order-status.js` confirmado correto (exige `POST`). A causa
real estava em `painel-x9k2f.html`, na função `updateOrderStatus()`, com
**dois problemas de contrato** com a API:

1. **Método errado**: `method: 'PATCH'` em vez de `'POST'` → causa do 405
2. **Campo errado no corpo**: `{ orderId, newStatus: status }` em vez de
   `{ orderId, status }` — ficaria escondido até a correção do método

Mesmo padrão de causa da Etapa 17: painel e API escritos em momentos
diferentes, sem contrato sincronizado.

### Correção aplicada em `painel-x9k2f.html`
- `method: 'PATCH'` → `'POST'`
- `{ orderId, newStatus: status }` → `{ orderId, status }`
- Adicionado `<link rel="icon" type="image/png" href="/LOGOPRETO.png">`
  no `<head>` (resolve o `favicon.ico 404` cosmético)

### Validações feitas
- ✅ JavaScript embutido extraído e validado com `node --check`
- ✅ Demais funções do painel (`fetchOrders`, `verifyMpPayment`, CSV,
  auto-refresh) confirmadas sem o mesmo problema

### Status
- [x] Bug identificado e corrigido
- [x] Commit/push da correção
- [x] Retestado: troca de status funcionando sem erro 405

---

## ✅ ETAPA 26 — Resiliência da loja e hardening do painel

### Contexto
Durante a validação local da loja, o fluxo de produtos ficou vulnerável a respostas inválidas da API e a problemas na integração com o Supabase. O objetivo desta etapa foi garantir que a loja continuasse funcionando mesmo com falhas temporárias no backend.

### O que foi feito
- `store/store.js` passou a usar um catálogo local como fallback quando `/api/products` falha, retorna resposta não-JSON ou está indisponível.
- `api/products.js` passou a normalizar os dados retornados do Supabase e a responder de forma mais previsível em caso de erro.
- `api/admin-products.js` foi reforçado para aceitar campos adicionais do catálogo e retornar mensagens claras quando o ambiente do Supabase não estiver configurado.
- `api/webhook.js` passou a validar a assinatura `x-signature` quando a secret estiver disponível, usando o helper `api/_lib/webhook-signature.js`.
- `painel-x9k2f.html` recebeu melhorias de feedback para erros de API e passou a exibir uma experiência mais clara ao editar produtos.

### Validações feitas
- ✅ `npm run build` executado com sucesso
- ✅ Endpoint de produtos validado localmente com dados do Supabase
- ✅ Fluxo da loja preservado mesmo quando a API não responde corretamente

### Status
- [x] Fallback local da loja implementado
- [x] Hardening das APIs de produtos e webhook concluído
- [x] Painel admin mais resiliente e com melhor feedback de erro

---

## 🔮 Próximos Passos (o que falta fazer)

### Melhorias previstas para a administração de produtos

1. Resolver o truncamento visual da lista de produtos no painel:
   - revisar o layout da aba de produtos em telas pequenas e médias;
   - limitar o tamanho do nome e da descrição sem cortar a legibilidade;
   - ajustar a altura das cards e permitir rolagem interna quando necessário.
2. Melhorar a experiência de edição de produtos:
   - adicionar campos de preço, estoque, categoria, badge e imagem com validação visual;
   - incluir feedback imediato de sucesso/erro após salvar;
   - permitir salvar por lote ou por card sem recarregar a página.
3. Implementar a Fase C do painel:
   - criar fluxo para ativar/desativar produtos;
   - adicionar produto novo diretamente no painel;
   - sinalizar status como `novo`, `em_falta`, `descontinuado` ou `ativo`.
4. Sincronizar o catálogo do painel com a loja em tempo real:
   - garantir que alterações em estoque/preço/visibilidade apareçam imediatamente na vitrine;
   - evitar inconsistências entre o catálogo local fallback e os dados do Supabase.
5. Melhorar a busca e filtragem de produtos no painel:
   - filtrar por categoria, estoque baixo e status;
   - ordenar por preço, estoque e data de criação.

### Checklist de integração do Mercado Pago (pronto para as credenciais)

1. Confirmar as variáveis de ambiente na Vercel:
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_PUBLIC_KEY`
   - `MP_WEBHOOK_SECRET`
   - `MP_WEBHOOK_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Validar o webhook no painel do Mercado Pago:
   - URL pública do endpoint `/api/webhook`
   - evento `payment`
   - assinatura habilitada se a secret for configurada
3. Validar o fluxo completo com credenciais reais:
   - PIX com valor de teste baixo
   - cartão com tokenização via Brick
   - atualização de status no Supabase
   - envio de e-mail de confirmação quando aprovado
4. Confirmar o comportamento de fallback:
   - sem credenciais, a loja continua operando em modo local;
   - com credenciais, o fluxo passa a cobrar de verdade sem necessidade de código novo.
5. Revisar logs e monitoramento após o primeiro pagamento real:
   - verificar se o webhook chega corretamente;
   - confirmar se o pedido entra no painel com o status correto.

Passo a passo de configuração inicial (Supabase, Mercado Pago, Vercel,
Webhook) está em `docs/PUBLICACAO.md` — concluído nas Etapas 9 a 16.

---

## ✅ ETAPA 27 — Limpeza e reorganização do repositório

### Contexto
A estrutura do projeto passou por muitas iterações e agora precisa de uma
organização mais clara para reduzir ruído, facilitar manutenção e evitar
arquivos órfãos ou duplicados.

### Plano adotado
- Inventariar a raiz do repositório e separar arquivos ativos de arquivos
  legados, duplicados ou sem uso confirmado.
- Preservar os pontos de entrada principais da loja: `index.html`,
  `painel-x9k2f.html`, `api/`, `store/`, `public/`, `supabase/` e `docs/`.
- Mover ou arquivar apenas itens que não tenham referência viva em HTML, JS,
  Vite, Vercel ou documentação.
- Atualizar paths e referências afetadas sem alterar o fluxo de checkout,
  painel admin ou rotas de API.
- Validar a build após cada lote de mudança antes de remover qualquer arquivo
  antigo.

### Status
- [x] Plano registrado para execução segura
- [x] Documento atualizado para acompanhar a próxima etapa de organização

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
- Nunca usar outra ferramenta de IA para reescrever arquivos deste projeto
  sem informar o contexto completo da integração — ver Etapa 17
