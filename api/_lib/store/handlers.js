/**
 * api/_lib/store/handlers.js
 *
 * Handlers compartilhados da Loja — extraídos do server-dev.js e dos
 * arquivos standalone em api/ (products.js, admin-products.js, etc.)
 * para eliminar duplicação de queries Supabase e lógica de resposta.
 *
 * Formato Vercel-style: (req, res, supabase)
 *   - req.method / req.query  → fornecidos pelo adaptador toVercelReq()
 *   - res.status(code).json() → fornecidos pelo adaptador toVercelRes()
 *
 * Reusados por:
 *   - server-dev.js (via toVercelReq/toVercelRes)
 *   - api/products.js (Vercel Function — produtos ativos)
 *   - api/admin-products.js (Vercel Function — GET todos os produtos)
 *   - api/admin-orders.js (Vercel Function — listar pedidos)
 *   - api/order-status.js (Vercel Function — status de 1 pedido)
 *
 * Segue o padrão estabelecido por api/_lib/financial/.
 */

import { normalizeProduct } from '../normalize-product.js';

// ═══════════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Lista todos os pedidos (mais recentes primeiro, limit 200).
 * Usado por: server-dev (handleOrders), api/admin-orders.js
 */
export async function handleListOrders(req, res, supabase) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

    if (error) {
        console.error('[store] Erro ao listar pedidos:', error);
        return res.status(500).json({ error: 'Erro ao carregar pedidos.' });
    }
    return res.status(200).json({ orders: data || [] });
}

// ═══════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Lista apenas produtos ativos, normalizados (camelCase).
 * Usado por: api/products.js (público, front-end da loja)
 */
export async function handleListPublicProducts(req, res, supabase) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }


    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or('active.eq.true,coming_soon.eq.true')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[store] Erro ao listar produtos públicos:', error);
        return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }

    const products = (data || []).map(normalizeProduct);
    return res.status(200).json({ products });
}

/**
 * Lista todos os produtos (ativos e inativos), sem normalização.
 * Usado por: server-dev (handleProducts, handleAdminProducts),
 *            api/admin-products.js (GET)
 */
export async function handleListAllProducts(req, res, supabase) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[store] Erro ao listar todos os produtos:', error);
        return res.status(500).json({ error: 'Erro ao carregar produtos.' });
    }
    return res.status(200).json({ products: data || [] });
}

// ═══════════════════════════════════════════════════════════════════
//  ORDER STATUS (público, sem auth)
// ═══════════════════════════════════════════════════════════════════

/**
 * Consulta status de UM pedido específico pelo ID.
 * Usado por: server-dev (handleOrderStatus), api/order-status.js
 *
 * Retorna apenas id, status, total — nunca dados pessoais do cliente.
 */
export async function handleOrderStatus(req, res, supabase) {
    const id = req.query?.id;
    if (!id) {
        return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
    }

    const { data, error } = await supabase
        .from('orders')
        .select('id, status, total')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('[store] Erro ao consultar status do pedido:', error);
        return res.status(500).json({ error: 'Erro ao consultar pedido.' });
    }
    if (!data) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    return res.status(200).json(data);
}

// ═══════════════════════════════════════════════════════════════════
//  CONFIG (público)
// ═══════════════════════════════════════════════════════════════════

/**
 * Retorna a chave pública do Mercado Pago para o front-end.
 * Usado por: server-dev (handleConfig)
 */
export async function handleConfig(req, res) {
    return res.status(200).json({
        mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || null,
    });
}