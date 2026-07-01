/**
 * api/upload-image.js
 * Upload de imagens de produtos para Supabase Storage.
 * Protegido pela mesma senha do painel admin via header 'x-admin-password'.
 *
 * POST /api/upload-image
 *   Body: FormData com campo 'file' (File object)
 *   Headers: x-admin-password
 *
 * Response:
 *   { success: true, url: "https://..." }
 *   { error: "..." }
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *   ADMIN_PASSWORD
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { getSupabase } from './_lib/supabase.js';
import formidable from 'formidable';
import { promises as fs } from 'fs';

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
    // Validar tipo MIME
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(mimeType)) {
        throw new Error(`Tipo de imagem não permitido. Use JPEG, PNG ou WebP.`);
    }

    // Validar tamanho (<2MB)
    const maxSize = 2 * 1024 * 1024;
    if (buffer.length > maxSize) {
        throw new Error(`Imagem muito grande. Máximo 2MB (atual: ${(buffer.length / 1024 / 1024).toFixed(2)}MB).`);
    }

    return true;
}

function sanitizeFileName(originalName) {
    if (!originalName) return `image-${Date.now()}.jpg`;

    // Remove caracteres especiais, espaços e acentos
    const cleaned = originalName
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-z0-9.-]/g, '-') // substitui caracteres inválidos por hífen
        .replace(/-+/g, '-') // remove hífens múltiplos
        .replace(/^-+|-+$/g, ''); // remove hífens nas pontas

    // Garante extensão válida
    const ext = originalName.split('.').pop().toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];
    const finalExt = validExts.includes(ext) ? ext : 'jpg';

    // Adiciona timestamp para evitar colisões
    const timestamp = Date.now();
    return `${cleaned}-${timestamp}.${finalExt}`;
}

export default async function handler(req, res) {
    // Apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    // Autenticação
    if (!auth(req, res)) return;

    try {
        const supabase = getSupabase();

        // Parse FormData usando formidable
        const form = formidable({ 
            maxFileSize: 2 * 1024 * 1024, // 2MB
            multiples: false 
        });

        const [, files] = await form.parse(req);
        const fileArray = files.file;
        
        if (!fileArray || fileArray.length === 0) {
            return res.status(400).json({ error: 'Arquivo não foi enviado.' });
        }

        const file = fileArray[0];

        // Ler o arquivo
        const buffer = await fs.readFile(file.filepath);
        const mimeType = file.mimetype || 'image/jpeg';
        const originalName = file.originalFilename || 'image';

        // Validar imagem
        validateImage(buffer, mimeType);

        // Sanitizar nome
        const sanitizedName = sanitizeFileName(originalName);

        // Upload para Supabase Storage
        const { error } = await supabase.storage
            .from('product-images')
            .upload(`products/${sanitizedName}`, buffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            throw new Error(`Erro ao fazer upload: ${error.message}`);
        }

        // Construir URL pública
        const {
            data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(`products/${sanitizedName}`);

        return res.status(200).json({
            success: true,
            url: publicUrl,
            fileName: sanitizedName,
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({
            error: err.message || 'Erro ao fazer upload da imagem.',
        });
    }
}
