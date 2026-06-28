// api/_lib/supabase.js
//
// Cliente Supabase usado SOMENTE no backend (Vercel Functions).
// Usa a Service Role Key — nunca exponha essa chave no frontend.
//
// Variáveis de ambiente necessárias (configurar na Vercel):
//   SUPABASE_URL              → URL do projeto (Project Settings > API)
//   SUPABASE_SERVICE_ROLE_KEY → Service Role Key (Project Settings > API > service_role)

import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabase() {
    if (_client) return _client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            'Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.'
        );
    }

    _client = createClient(url, key, {
        auth: { persistSession: false },
    });
    return _client;
}
