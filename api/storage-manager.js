/**
 * api/storage-manager.js
 * Gerenciamento de arquivos no Supabase Storage (bucket product-images).
 * Protegido pela mesma senha do painel admin via header 'x-admin-password'.
 *
 * GET   /api/storage-manager                         → Lista imagens, detecta órfãs, mostra uso
 * DELETE /api/storage-manager?filePath=products/X.jpg  → Exclui imagem
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { getSupabase } from './_lib/supabase.js';

const BUCKET = 'product-images';
const FOLDER = 'products';

function auth(req, res) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
        return false;
    }
    if (req.headers['x-admin-password'] !== adminPassword) {
        res.status(401).json({ error: 'Senha incorreta.' });
        return false;
    }
    return true;
}

/**
 * Extrai o nome do arquivo de uma URL pública do Supabase Storage.
 * Ex: https://xxx.supabase.co/storage/v1/object/public/product-images/products/camiseta-123.jpg
 * → "products/camiseta-123.jpg"
 */
function extractFilePathFromUrl(url) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        // Path: /storage/v1/object/public/product-images/products/filename
        const bucketIndex = pathParts.indexOf(BUCKET);
        if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
            return pathParts.slice(bucketIndex + 1).join('/');
        }
    } catch {
        // Not a valid URL
    }
    return null;
}

/**
 * Calcula o tamanho total (bytes) de uma lista de arquivos
 */
function calculateTotalSize(files) {
    return files.reduce((sum, f) => sum + (f.metadata?.size || f.size || 0), 0);
}

/**
 * Formata bytes humanamente
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default async function handler(req, res) {
    if (!auth(req, res)) return;

    let supabase;
    try {
        supabase = getSupabase();
    } catch (err) {
        console.error('[storage-manager] Supabase não configurado:', err);
        return res.status(500).json({ error: 'Supabase não configurado.' });
    }

    // ── DELETE: excluir uma imagem ────────────────────────────────────
    if (req.method === 'DELETE') {
        const filePath = req.query?.filePath;
        if (!filePath) {
            return res.status(400).json({ error: 'filePath é obrigatório.' });
        }

        try {
            const { error } = await supabase.storage
                .from(BUCKET)
                .remove([filePath]);

            if (error) throw new Error(error.message);

            return res.status(200).json({ success: true, message: 'Imagem excluída.' });
        } catch (err) {
            console.error('[storage-manager] Erro ao excluir:', err);
            return res.status(500).json({ error: 'Erro ao excluir imagem.' });
        }
    }

    // ── GET: listar imagens + detectar órfãs + uso ────────────────────
    if (req.method === 'GET') {
        try {
            // 1. Listar todos os arquivos no bucket
            const { data: files, error: listError } = await supabase.storage
                .from(BUCKET)
                .list(FOLDER, { limit: 500, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });

            if (listError) throw new Error(listError.message);

            // 2. Buscar todos os produtos para comparar imagens
            const { data: products, error: prodError } = await supabase
                .from('products')
                .select('id, name, image');

            if (prodError) throw new Error(prodError.message);

            // 3. Extrair todos os file paths das imagens dos produtos
            const usedFilePaths = new Set();
            for (const p of products) {
                if (p.image) {
                    const fp = extractFilePathFromUrl(p.image);
                    if (fp) usedFilePaths.add(fp);
                }
            }

            // 4. Montar lista de imagens com status de órfã
            const baseUrl = supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl.replace(/\/$/, '');

            const images = (files || []).map((file) => {
                const filePath = `${FOLDER}/${file.name}`;
                const isOrphan = !usedFilePaths.has(filePath);
                const productLinks = products.filter(p => {
                    const fp = extractFilePathFromUrl(p.image);
                    return fp === filePath;
                });

                return {
                    name: file.name,
                    filePath,
                    url: `${baseUrl}/${filePath}`,
                    size: file.metadata?.size || file.size || 0,
                    createdAt: file.created_at,
                    updatedAt: file.updated_at,
                    isOrphan,
                    linkedTo: productLinks.map(p => ({ id: p.id, name: p.name })),
                };
            });

            // 5. Calcular estatísticas
            const orphanedImages = images.filter(i => i.isOrphan);
            const totalSize = calculateTotalSize(files || []);
            const orphanedSize = calculateTotalSize(orphanedImages);

            return res.status(200).json({
                success: true,
                stats: {
                    totalImages: images.length,
                    totalSize,
                    totalSizeFormatted: formatBytes(totalSize),
                    orphanedCount: orphanedImages.length,
                    orphanedSize,
                    orphanedSizeFormatted: formatBytes(orphanedSize),
                    linkedCount: images.length - orphanedImages.length,
                },
                images,
            });
        } catch (err) {
            console.error('[storage-manager] Erro ao listar:', err);
            return res.status(500).json({ error: 'Erro ao listar imagens.' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
}
