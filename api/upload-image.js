/**
 * api/upload-image.js
 * Upload de imagens de produtos para Supabase Storage.
 * Protegido pela mesma senha do painel admin via header 'x-admin-password'.
 *
 * Comprime imagens automaticamente usando Sharp:
 *   - Redimensiona para no máximo 800px de largura (mantém proporção)
 *   - Converte para WebP com qualidade 80
 *   - Reduz drasticamente o tamanho dos arquivos em disco
 *
 * POST /api/upload-image
 *   Body: FormData com campo 'file' (File object)
 *   Headers: x-admin-password
 *
 * Response:
 *   { success: true, url: "https://...", fileName: "...", originalSize: 1234, compressedSize: 567 }
 *   { error: "..." }
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import sharp from 'sharp';
import { getSupabase } from './_lib/supabase.js';
import formidable from 'formidable';
import { promises as fs } from 'fs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (antes da compressão)
const MAX_DIMENSION = 800; // px — largura máxima
const WEBP_QUALITY = 80;

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

function validateImage(buffer, mimeType) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedMimes.includes(mimeType)) {
        throw new Error(`Tipo de imagem não permitido. Use JPEG, PNG, WebP, GIF ou AVIF.`);
    }

    const maxSize = MAX_FILE_SIZE;
    if (buffer.length > maxSize) {
        throw new Error(`Imagem muito grande. Máximo 10MB (atual: ${(buffer.length / 1024 / 1024).toFixed(2)}MB).`);
    }

    return true;
}

function sanitizeFileName(originalName) {
    if (!originalName) return `image-${Date.now()}.webp`;

    // Remove caracteres especiais, espaços e acentos
    const cleaned = originalName
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9.-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Remove extensão original (sempre salvaremos como .webp)
    const nameWithoutExt = cleaned.replace(/\.[a-z0-9]+$/, '');

    // Adiciona timestamp para evitar colisões
    const timestamp = Date.now();
    return `${nameWithoutExt}-${timestamp}.webp`;
}

/**
 * Comprime a imagem usando Sharp:
 * - Redimensiona para no máximo MAX_DIMENSION px de largura
 *   (withoutEnlargement=true evita ampliar imagens menores)
 * - Converte para WebP com qualidade WEBP_QUALITY
 * - Retorna o buffer comprimido
 */
async function compressImage(buffer) {
    return sharp(buffer)
        .resize({ width: MAX_DIMENSION, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toBuffer();
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    if (!auth(req, res)) return;

    try {
        const supabase = getSupabase();

        // Parse FormData
        const form = formidable({
            maxFileSize: MAX_FILE_SIZE,
            multiples: false,
        });

        const [, files] = await form.parse(req);
        const fileArray = files.file;

        if (!fileArray || fileArray.length === 0) {
            return res.status(400).json({ error: 'Arquivo não foi enviado.' });
        }

        const file = fileArray[0];

        // Ler o arquivo original
        const originalBuffer = await fs.readFile(file.filepath);
        const mimeType = file.mimetype || 'image/jpeg';
        const originalName = file.originalFilename || 'image';

        // Validar imagem
        validateImage(originalBuffer, mimeType);

        // Comprimir imagem (redimensionar + WebP)
        const compressedBuffer = await compressImage(originalBuffer);

        // Sanitizar nome (sempre .webp)
        const sanitizedName = sanitizeFileName(originalName);

        // Estatísticas de compressão
        const originalSize = originalBuffer.length;
        const compressedSize = compressedBuffer.length;
        const savingsPercent = originalSize > 0
            ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
            : '0.0';

        console.log(
            `[upload-image] "${originalName}" → "${sanitizedName}" ` +
            `${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB ` +
            `(${savingsPercent}% de economia)`
        );

        // Upload para Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(`products/${sanitizedName}`, compressedBuffer, {
                contentType: 'image/webp',
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
        }

        // Construir URL pública
        const {
            data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(`products/${sanitizedName}`);

        return res.status(200).json({
            success: true,
            url: publicUrl,
            fileName: sanitizedName,
            originalSize,
            compressedSize,
            savingsPercent: Number(savingsPercent),
        });
    } catch (err) {
        console.error('[upload-image] Erro:', err);
        return res.status(500).json({
            error: 'Erro ao fazer upload da imagem.',
        });
    }
}
