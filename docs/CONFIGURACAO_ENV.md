# Configuração local e produção

## 1) Criar arquivo .env local
Copie este conteúdo para um arquivo chamado `.env` na raiz do projeto:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key_do_projeto
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_do_mp
MERCADO_PAGO_PUBLIC_KEY=seu_public_key_do_mp
ADMIN_PASSWORD=sua_senha_forte
MP_WEBHOOK_URL=https://seu-dominio.vercel.app/api/webhook
```

## 2) Supabase
- Crie o projeto no Supabase.
- Abra o SQL Editor e rode o conteúdo de [supabase/schema.sql](supabase/schema.sql).
- Copie a URL do projeto e a `service_role` key.

## 3) Mercado Pago
- Crie uma integração no Mercado Pago.
- Use credenciais de teste primeiro.
- Configure o webhook apontando para `https://seu-dominio.vercel.app/api/webhook`.

## 4) Vercel
- Conecte este repositório na Vercel.
- Em Project Settings > Environment Variables, adicione as mesmas chaves do `.env`.
- Faça o deploy.
- Valide `https://seu-dominio.vercel.app/api/config`.

## 5) Painel admin
- Acesse `/painel-x9k2f.html`.
- Use a senha configurada em `ADMIN_PASSWORD`.
