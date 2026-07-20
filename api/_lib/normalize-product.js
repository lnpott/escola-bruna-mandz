/**
 * api/_lib/normalize-product.js
 *
 * Funções compartilhadas de normalização de produtos.
 * Extraídas de api/products.js e api/admin-products.js (DRY).
 *
 * Uso:
 *   import { normalizeProductImage, normalizeVariants, normalizeProduct } from './_lib/normalize-product.js';
 */

// ─── Normalização de imagem ─────────────────────────────────────────────────

export function normalizeProductImage(image) {
    if (!image || typeof image !== 'string') return '/brand/LOGOPRETO.png';

    const value = image.trim();
    if (!value) return '/brand/LOGOPRETO.png';

    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    if (value.startsWith('/')) {
        if (value.startsWith('/merch/') || value.startsWith('/brand/') || value.startsWith('/media/') || value.startsWith('/products/')) {
            return value;
        }
        return `/merch/${value.replace(/^\/+/, '')}`;
    }

    const fileName = value.replace(/^.*[\\/]/, '');
    const knownMerchImages = [
        'Pulseira.png',
        'Paleta.png',
        'Chaveiro.png',
        'Copo.png',
        'TSHIRT_PREMIUN.png',
        'TSHIRT_PRO.png',
        'TSHIRT_ROCK.png',
    ];

    return knownMerchImages.includes(fileName) ? `/merch/${fileName}` : '/brand/LOGOPRETO.png';
}

// ─── Normalização de variantes (formato array → { sizes: [...] }) ────────────

export function normalizeVariants(variants) {
    if (!variants) return null;
    if (Array.isArray(variants)) {
        if (variants.length > 0 && typeof variants[0] === 'object' && variants[0] !== null) {
            // Array de objetos → pega o primeiro
            return variants[0];
        }
        // Array de strings → { sizes: [...] }
        return { sizes: variants };
    }
    return variants;
}

// ─── Normalização completa do produto (público, camelCase) ──────────────────

export function normalizeProduct(product) {
    return {
        id: product?.id || `product-${Math.random().toString(36).slice(2, 8)}`,
        name: product?.name || 'Produto sem nome',
        description: product?.description || 'Descrição em breve.',
        price: Number(product?.price || 0),
        stock: Number(product?.stock || 0),
        active: Boolean(product?.active ?? true),
        comingSoon: Boolean(product?.coming_soon ?? false),
        category: product?.category || 'acessorios',
        badge: product?.badge || null,
        badgeColor: product?.badge_color || null,
        image: normalizeProductImage(product?.image),
        variants: normalizeVariants(product?.variants),
    };
}
