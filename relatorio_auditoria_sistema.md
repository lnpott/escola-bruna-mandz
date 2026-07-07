# Relatório de Auditoria do Sistema — Loja Oficial Bruna Mandz

> Data da auditoria: 2026-07-05 17:32 UTC-3
> Repositório: `lnpott/escola-bruna-mandz`
> Projeto Supabase: `Mandz` (ljosqddzxreloizpynvf)

---

## Resumo Executivo

A loja está **funcional e no ar**, com integração real Mercado Pago + Supabase + painel admin protegido. O backup automático está configurado corretamente. Porém, foram encontrados **problemas críticos no catálogo de produtos** e **ausência de pedidos aprovados** que precisam de atenção imediata.

| Área | Estado |
|---|---|
| Repositório GitHub | ✅ Estrutura OK, commits recentes |
| Supabase (DB) | ✅ Saúde OK, 2 tabelas, dados presentes |
| Backup Automático | ✅ Workflow configurado corretamente |
| Catálogo de Produtos | 🔴 **CRÍTICO: apenas 3 de 11 produtos ativos** |
| Pedidos | 🟡 18 pedidos, **zero aprovados** |
| Segurança | 🟡 Alertas médios (bucket público, funções SECURITY DEFINER) |
| Arquivos Órfãos | ✅ Todos removidos |

---

## 1. GitHub Repository

### Informações Gerais
- **Nome:** `lnpott/escola-bruna-mandz`
- **Descrição:** Escola de musica.
- **Visibilidade:** Público
- **Branch padrão:** `main`
- **Último commit:** `ab62b384` — "BUgs" (2026-07-04 21:08 UTC) — mensagem vaga
- **Issues abertas:** 0

### Branches
| Branch | SHA | Observação |
|---|---|---|
| `main` | `ab62b38` | Branch principal — em uso |
| `LOJA` | `801e99d` | Branch de desenvolvimento da loja |
| `QWEN` | `e61991b` | Branch alternativa |
| `VSCODER` | `93ce3b2` | Branch alternativa |
| `codex/implementar-o-plano-completo` | `df6c0eb` | Branch de feature |

### Últimos Commits (main)
| Commit | Autor | Data | Mensagem |
|---|---|---|---|
| `ab62b38` | lnpott | 04/07 | **"BUgs"** — mensagem vaga, modificou `service-worker.js` e `store-style.css` |
| `f44ad2d` | Claude | 04/07 | "docs: Etapa 31 — quiz musical com tela de início e vídeo oculto" |
| `913291d` | Claude | 04/07 | "feat: quiz com tela de início" |
| `a3fbdfd` | lnpott | 04/07 | "final" |
| `6df86f5` | lnpott | 04/07 | "GOOGLE PAINEL" |

### ⚠️ Observação sobre o último commit
O commit "BUgs" alterou apenas 2 arquivos (`service-worker.js` e `store-style.css`) com 1 adição e 6 deleções. A mensagem é vaga e não descreve a mudança. O conteúdo do `service-worker.js` está correto (`CACHE_NAME = 'bruna-mandz-v4'`), mas é recomendável usar mensagens de commit descritivas no futuro.

### Arquivos na pasta `api/`
Todos os endpoints esperados estão presentes e corretos:
- `api/_lib/supabase.js` — cliente compartilhado
- `api/admin-orders.js` — lista pedidos (protegido)
- `api/admin-products.js` — CRUD de produtos (protegido)
- `api/config.js` — expõe Public Key do MP ao front
- `api/create-payment.js` — cria pagamento real
- `api/notify-new-order.js` — notificação por e-mail (Resend)
- `api/order-status.js` — consulta pública de status
- `api/products.js` — catálogo público
- `api/update-order-status.js` — atualiza status de pedido
- `api/upload-image.js` — upload de imagens (formidable)
- `api/verify-mp-payment.js` — verifica status real no MP
- `api/webhook.js` — recebe notificações do MP

### Arquivos Órfãos (pendência da Etapa 32)
| Arquivo | Status no repositório | Resultado |
|---|---|---|
| `api/payment-provider.js` | **Não encontrado** | ✅ Removido |
| `api/env.example` | **Não encontrado** | ✅ Removido |
| `api/test-notify.js` | **Não encontrado** | ✅ Removido |

---

## 2. Supabase (Banco de Dados)

### Projeto
- **Nome:** Mandz
- **ID:** `ljosqddzxreloizpynvf`
- **Região:** us-west-2
- **Status:** `ACTIVE_HEALTHY` ✅
- **Postgres:** 17.6.1.127

### Tabelas

#### `public.orders` (18 registros)
| Coluna | Tipo | Observação |
|---|---|---|
| `id` | text | PK — formato `BM-XXXXXXXX-XXXX` |
| `created_at` | timestamptz | Data do pedido |
| `updated_at` | timestamptz | Última atualização |
| `status` | text | pending / cancelled / rejected / approved |
| `method` | text | pix / card / manual |
| `customer_name` | text | Nome do cliente |
| `customer_email` | text | E-mail do cliente |
| `customer_phone` | text | Telefone |
| `items` | jsonb | Itens do carrinho |
| `total` | numeric | Valor total |
| `mp_payment_id` | text | ID do pagamento no MP |
| `mp_status` | text | Status retornado pelo MP |
| `mp_status_detail` | text | Detalhe do status |
| `earned_xp` | integer | XP ganho (padrão: 0) |
| `customer_is_student` | boolean | É aluno? (padrão: false) |

#### `public.products` (11 registros)
| Coluna | Tipo | Observação |
|---|---|---|
| `id` | text | PK |
| `active` | boolean | **Determina se aparece na loja** |
| `name` | text | Nome do produto |
| `price` | numeric | Preço |
| `stock` | integer | Estoque |
| `category` | text | roupas / acessórios |
| `badge` | text | Novidade / Promoção / Limitado |
| `badge_color` | text | purple / green / orange |
| `image` | text | URL da imagem |
| `reward_xp` | integer | XP de recompensa |
| `variants` | jsonb | Tamanhos (JSON) |

---

## 3. Dados Críticos Encontrados

### 🔴 PROBLEMA 1: Catálogo Quase Invisível

De **11 produtos cadastrados**, apenas **3 estão ativos** (`active = true`). Isso significa que os clientes só veem 3 produtos na loja.

#### Produtos ATIVOS (visíveis na loja)
| Nome | Preço | Estoque | Categoria | Badge |
|---|---|---|---|---|
| Suporte de Baqueta | R$ 89,90 | 30 | acessórios | Limitado 🟠 |
| Camisa | R$ 89,90 | 50 | roupas | Novidade 🟣 |
| Camisa Oficial Padrão | R$ 89,90 | 50 | roupas | Promoção 🟢 |

#### Produtos INATIVOS (ocultos da loja)
| Nome | Preço | Estoque | Categoria | Badge |
|---|---|---|---|---|
| Chaveiro Bruna Mandz | R$ 14,90 | 100 | acessórios | — |
| Copo Térmico Bruna Mandz | R$ 59,90 | 30 | acessórios | Limitado 🟠 |
| Palheta Personalizada | R$ 9,90 | 150 | acessórios | — |
| Pulseira Bruna Mandz | R$ 19,90 | 80 | acessórios | Novidade 🟣 |
| Camisa Clássica | R$ 69,90 | 50 | roupas | Promoção 🟢 |
| Camisa Minimalista | R$ 69,90 | 50 | roupas | — |
| Camisa Rock | R$ 69,90 | 50 | roupas | Novidade 🟣 |
| TES | R$ 1,00 | 2 | roupas | Novidade 🟣 |

> **Ação recomendada:** Ativar os produtos reais (Chaveiro, Copo, Palheta, Pulseira, Camisa Clássica, Camisa Minimalista, Camisa Rock) e remover o produto de teste "TES".

---

### 🔴 PROBLEMA 2: Zero Pedidos Aprovados

Dos 18 pedidos no banco:

| Status | Quantidade | Percentual |
|---|---|---|
| **cancelled** | 7 | 39% |
| **pending** | 6 | 33% |
| **rejected** | 5 | 28% |
| **approved** | **0** | **0%** |

#### Análise dos pedidos recentes
- Muitos pedidos têm `method = 'manual'` — provavelmente criados via teste/admin
- Nomes de teste visíveis: "LUCAS NUNES POTT", "LUCAS NUNES POTT222", "1231", "VANESSA MARA"
- Produto de teste "TES" (R$ 1,00) ainda presente no banco

> **Possíveis causas:**
> 1. O webhook do Mercado Pago pode não estar atualizando o status corretamente
> 2. Nenhuma compra real foi finalizada com sucesso
> 3. Pedidos PIX expiraram (cancelados automaticamente)
> 4. Pagamentos de cartão foram rejeitados

---

## 4. Segurança (Supabase Advisors)

### Alertas de Segurança

| Nível | Problema | Detalhe | Impacto |
|---|---|---|---|
| ⚠️ WARN | Bucket público permite listagem | `product-images` tem política SELECT ampla que permite listar todos os arquivos | Médio — expõe nomes de arquivos |
| ⚠️ WARN | Função SECURITY DEFINER pública | `rls_auto_enable()` pode ser executada por usuários anônimos/autenticados | Médio — potencial elevação de privilégio |
| ⚠️ WARN | Search path mutável | `set_updated_at` não tem `search_path` fixo | Baixo — risco de hijacking |
| ℹ️ INFO | RLS sem políticas | `orders` e `products` têm RLS ativo mas sem políticas | Esperado — backend usa Service Role Key |

> **Nota:** Os alertas de RLS sem políticas são **intencionais** e documentados no registro (Etapa 9). O backend acessa o banco via Service Role Key, nunca pelo cliente direto.

---

## 5. Performance (Supabase Advisors)

| Nível | Problema | Detalhe |
|---|---|---|
| ℹ️ INFO | Índice não utilizado | `products_active_idx` nunca usado |
| ℹ️ INFO | Índice não utilizado | `products_category_idx` nunca usado |
| ℹ️ INFO | Índice não utilizado | `orders_status_idx` nunca usado |

> **Impacto:** Baixo. Tabelas pequenas (18 e 11 linhas). Índices não usados consomem espaço mínimo.

---

## 6. Backup Automático (GitHub Actions)

### Configuração
- **Workflow:** `.github/workflows/supabase-backup.yml`
- **Agendamento:** Diário às 05:00 UTC (`0 5 * * *`)
- **Método:** Artifact do GitHub (nunca commitado no repo) ✅
- **Retenção:** 90 dias
- **Script:** `backup-api.js` — validado, sem URLs hardcoded, falha explicitamente se faltam variáveis

### Estado
- ✅ Workflow configurado corretamente
- ⚠️ Não foi possível verificar execuções passadas via API (pode precisar de autenticação ou ainda não houve runs)
- ✅ Dados de clientes **nunca** aparecem no repositório público

---

## 7. Deploy (Vercel)

| Item | Valor | Estado |
|---|---|---|
| `vercel.json` | Vazio (apenas `$schema`) | ✅ OK — Node.js padrão |
| `package.json` | `engines.node: 22.x` | ✅ OK |
| Dependências | `mercadopago`, `@supabase/supabase-js`, `formidable` | ✅ Instaladas |

> O deploy parece estar funcionando (site acessível, pedidos chegando ao banco).

---

## 8. Checklist vs. Documentação (loja_registro.md)

| Pendência da Etapa 32 | Estado | Observação |
|---|---|---|
| Remover `api/payment-provider.js` | ✅ Concluído | Não existe no repo |
| Remover `api/env.example` | ✅ Concluído | Não existe no repo |
| Remover `api/test-notify.js` | ✅ Concluído | Não existe no repo |
| Desativar site antigo na Netlify | ⚠️ Não verificado | Precisa verificar manualmente |
| Confirmar preços reais dos 10 produtos | ⚠️ Pendente | Precisa da Bruna |
| Hardening: validar `x-signature` do webhook | ⚠️ Pendente | Não bloqueante, mas recomendado |
| Notificação por e-mail para PIX pendentes | ⚠️ Pendente | Decisão da Bruna |

---

## 9. Recomendações Prioritárias

### 1. 🔴 URGENTE: Ativar os produtos do catálogo
```sql
UPDATE products
SET active = true
WHERE name IN (
  'Chaveiro Bruna Mandz',
  'Copo Térmico Bruna Mandz',
  'Palheta Personalizada',
  'Pulseira Bruna Mandz',
  'Camisa Clássica',
  'Camisa Minimalista',
  'Camisa Rock'
);
```

### 2. 🔴 URGENTE: Remover produto de teste
```sql
DELETE FROM products WHERE name = 'TES';
```

### 3. 🟡 INVESTIGAR: Por que nenhum pedido foi aprovado
- Verificar se o webhook do Mercado Pago está configurado corretamente na conta
- Verificar se as variáveis de ambiente `MP_WEBHOOK_SECRET` e `MP_ACCESS_TOKEN` estão válidas
- Testar uma compra real de baixo valor (PIX de R$ 1,00) e acompanhar o status

### 4. 🟡 MELHORAR: Mensagens de commit
O commit "BUgs" não descreve a mudança. Usar mensagens descritivas ajuda no histórico e em auditorias futuras.

### 5. 🟡 SEGURANÇA: Revisar permissões do bucket
Restringir a política SELECT do bucket `product-images` para evitar listagem de todos os arquivos.

### 6. 🟢 MANUTENÇÃO: Verificar se o backup automático está rodando
Acessar GitHub → Actions → selecionar o workflow "Daily Supabase Backup" e confirmar que há runs recentes.

---

*Relatório gerado automaticamente em 05/07/2026.*
