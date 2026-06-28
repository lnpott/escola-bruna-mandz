# Checklist de publicação — Loja Oficial Bruna Mandz

## 1. Supabase
- [ ] Criar o projeto no Supabase (se ainda não existir)
- [ ] Rodar o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase
- [ ] Copiar `SUPABASE_URL` e a `service_role` key (Project Settings > API)

## 2. Mercado Pago
- [ ] Criar conta de desenvolvedor em mercadopago.com.br/developers
- [ ] Pegar as credenciais de TESTE primeiro (Access Token + Public Key)
- [ ] Testar o fluxo completo com as credenciais de teste
- [ ] Trocar para credenciais de PRODUÇÃO só quando o teste estiver 100% ok
- [ ] Configurar a URL de Webhook no painel do Mercado Pago: `https://seu-dominio.vercel.app/api/webhook`

## 3. Vercel
- [ ] Conectar o repositório do GitHub à Vercel
- [ ] Configurar todas as variáveis de `.env.example` em Project Settings > Environment Variables
- [ ] Fazer o primeiro deploy e confirmar que `/api/config` responde com a Public Key

## 4. Segurança
- [ ] Confirmar que `.env` nunca foi commitado (está no `.gitignore`)
- [ ] Definir uma `ADMIN_PASSWORD` forte e única
- [ ] Acessar `/painel-x9k2f.html` e confirmar que pede senha
- [ ] Testar uma compra PIX de ponta a ponta (com valor baixo) antes de divulgar a loja

## 5. Testes finais
- [ ] Carrinho: adicionar, remover, alterar quantidade
- [ ] Checkout PIX: QR Code real aparece, status muda para "Aprovado" após pagar
- [ ] Checkout Cartão: Brick do Mercado Pago carrega e processa
- [ ] Painel: pedido aparece com dados corretos após a compra

