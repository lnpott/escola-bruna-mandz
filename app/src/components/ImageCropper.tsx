/**
 * app/src/components/ImageCropper.tsx
 *
 * Modal de corte de imagem — reescrito (Etapa 96).
 *
 * Problemas corrigidos vs versão anterior:
 *  - Modal pequeno: agora ocupa 95vw × 95vh
 *  - Zoom não redesenhava: useEffect agora depende de [zoom] corretamente
 *  - Zoom via scroll estava invertido em alguns trackpads
 *  - Área de crop inicial agora deixa margem visível da imagem ao redor
 *  - Aspect ratio: 1:1 (quadrado) para se encaixar nos cards da vitrine (height:14rem, contain)
 *
 * Controles:
 *  - Scroll do mouse / pinch: zoom na imagem
 *  - Arraste dentro da área: move o recorte
 *  - Arraste nas bordas/cantos: redimensiona o recorte
 *  - Botões −/+/reset: zoom
 *  - ESC ou clique no overlay: cancela
 */
import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
    file: File;
    onCrop: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

// ─── Proporção da vitrine (height:14rem com object-fit:contain → quadrado é seguro) ──
const ASPECT_RATIO = 1; // 1:1
const MIN_CROP_PX  = 60;
const MIN_ZOOM     = 1;
const MAX_ZOOM     = 8;
const ZOOM_STEP    = 0.1;
const HANDLE_SIZE  = 14; // pixels de tolerância para detectar borda/canto

export default function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
    const canvasRef      = useRef<HTMLCanvasElement>(null);
    const containerRef   = useRef<HTMLDivElement>(null);
    const cancelledRef   = useRef(false);
    const zoomShowTimer  = useRef<number | null>(null);

    const [img, setImg]               = useState<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [zoom, setZoom]             = useState(1);
    const [showZoomHint, setShowZoomHint] = useState(false);

    // Crop em coordenadas do canvas (px)
    const [crop, setCrop] = useState({ x: 0, y: 0, w: 200, h: 200 });

    // Drag state
    const dragRef = useRef<{
        mode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;
        startX: number;
        startY: number;
        startCrop: typeof crop;
    }>({ mode: null, startX: 0, startY: 0, startCrop: { x: 0, y: 0, w: 0, h: 0 } });

    // Dimensões reais da imagem
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

    // ── Carregar imagem ──────────────────────────────────────────
    useEffect(() => {
        cancelledRef.current = false;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (cancelledRef.current) return;
            const image = new Image();
            image.onload = () => {
                if (cancelledRef.current) return;
                setNaturalSize({ w: image.naturalWidth, h: image.naturalHeight });
                setImg(image);
                setImageLoaded(true);
            };
            image.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        return () => { cancelledRef.current = true; };
    }, [file]);

    // ── Inicializar crop quando imagem carrega ───────────────────
    useEffect(() => {
        if (!imageLoaded || !containerRef.current) return;
        const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
        // Crop inicial: 60% da menor dimensão do canvas, centralizado
        const size = Math.round(Math.min(cw, ch) * 0.60);
        setCrop({ x: (cw - size) / 2, y: (ch - size) / 2, w: size, h: size });
    }, [imageLoaded]);

    // ── ESC para cancelar ────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);

    // ── Desenhar canvas ──────────────────────────────────────────
    const draw = useCallback(() => {
        if (!canvasRef.current || !img || !imageLoaded) return;
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');
        if (!ctx) return;

        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        canvas.width  = rect.width;
        canvas.height = rect.height;
        const cw = canvas.width;
        const ch = canvas.height;

        // Calcular dimensões de desenho da imagem (object-fit: contain)
        const imgAR  = img.naturalWidth / img.naturalHeight;
        const canAR  = cw / ch;
        let drawW: number, drawH: number;
        if (imgAR > canAR) { drawW = cw; drawH = cw / imgAR; }
        else                { drawH = ch; drawW = ch * imgAR; }

        // Centro + zoom
        const cx = cw / 2;
        const cy = ch / 2;
        const zW = drawW * zoom;
        const zH = drawH * zoom;
        const zX = cx - zW / 2;
        const zY = cy - zH / 2;

        // Fundo escuro
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, cw, ch);

        // Imagem
        ctx.drawImage(img, zX, zY, zW, zH);

        // Overlay escuro fora do crop
        const { x, y, w, h } = crop;
        ctx.fillStyle = 'rgba(0,0,0,0.60)';
        ctx.fillRect(0, 0, cw, y);           // top
        ctx.fillRect(0, y + h, cw, ch);      // bottom
        ctx.fillRect(0, y, x, h);            // left
        ctx.fillRect(x + w, y, cw, h);       // right

        // Borda da área de crop
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        // Grade terços (rule of thirds)
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(x + w * i / 3, y); ctx.lineTo(x + w * i / 3, y + h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y + h * i / 3); ctx.lineTo(x + w, y + h * i / 3); ctx.stroke();
        }

        // Handles nos cantos e bordas
        const hS = HANDLE_SIZE;
        const handles = [
            [x, y], [x + w / 2 - hS / 2, y], [x + w - hS, y],               // top
            [x, y + h / 2 - hS / 2], [x + w - hS, y + h / 2 - hS / 2],      // mid
            [x, y + h - hS], [x + w / 2 - hS / 2, y + h - hS], [x + w - hS, y + h - hS], // bottom
        ];
        ctx.fillStyle = '#fff';
        handles.forEach(([hx, hy]) => {
            ctx.fillRect(hx, hy, hS, hS);
        });

        // Ícone de arrastar no centro da área de crop
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✥', x + w / 2, y + h / 2);

    }, [img, imageLoaded, zoom, crop]);

    useEffect(() => { draw(); }, [draw]);

    // ── Determinar handle clicado ────────────────────────────────
    const getHandle = (mx: number, my: number) => {
        const { x, y, w, h } = crop;
        const t = HANDLE_SIZE * 1.5; // tolerância maior
        const nearL = mx >= x - t        && mx <= x + t;
        const nearR = mx >= x + w - t    && mx <= x + w + t;
        const nearT = my >= y - t        && my <= y + t;
        const nearB = my >= y + h - t    && my <= y + h + t;
        const inX   = mx >= x            && mx <= x + w;
        const inY   = my >= y            && my <= y + h;

        if (nearL && nearT) return 'nw';
        if (nearR && nearT) return 'ne';
        if (nearL && nearB) return 'sw';
        if (nearR && nearB) return 'se';
        if (nearT && inX)   return 'n';
        if (nearB && inX)   return 's';
        if (nearL && inY)   return 'w';
        if (nearR && inY)   return 'e';
        if (inX && inY)     return 'move';
        return null;
    };

    const getCursor = useCallback((mx: number, my: number) => {
        const h = getHandle(mx, my);
        if (!h) return 'default';
        if (h === 'move') return 'grab';
        if (h === 'nw' || h === 'se') return 'nwse-resize';
        if (h === 'ne' || h === 'sw') return 'nesw-resize';
        if (h === 'n'  || h === 's')  return 'ns-resize';
        if (h === 'e'  || h === 'w')  return 'ew-resize';
        return 'default';
    }, [crop]); // eslint-disable-line

    // ── Obter pos relativa ao canvas ─────────────────────────────
    const getPos = (clientX: number, clientY: number) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const r = canvasRef.current.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
    };

    const canvasDims = () => {
        if (!canvasRef.current) return { cw: 0, ch: 0 };
        return { cw: canvasRef.current.width, ch: canvasRef.current.height };
    };

    // ── Pointer down ─────────────────────────────────────────────
    const onPointerDown = (clientX: number, clientY: number) => {
        const pos  = getPos(clientX, clientY);
        const mode = getHandle(pos.x, pos.y);
        if (!mode) return;
        dragRef.current = { mode, startX: pos.x, startY: pos.y, startCrop: { ...crop } };
    };

    // ── Pointer move ─────────────────────────────────────────────
    const onPointerMove = (clientX: number, clientY: number) => {
        const { mode } = dragRef.current;

        // Cursor dinâmico
        if (!mode && canvasRef.current) {
            const pos = getPos(clientX, clientY);
            canvasRef.current.style.cursor = getCursor(pos.x, pos.y);
            return;
        }
        if (!mode) return;

        const pos = getPos(clientX, clientY);
        const dx  = pos.x - dragRef.current.startX;
        const dy  = pos.y - dragRef.current.startY;
        const sc  = dragRef.current.startCrop;
        const { cw, ch } = canvasDims();

        setCrop(prev => {
            let { x, y, w, h } = sc;

            if (mode === 'move') {
                x = Math.max(0, Math.min(sc.x + dx, cw - sc.w));
                y = Math.max(0, Math.min(sc.y + dy, ch - sc.h));
                return { x, y, w, h };
            }

            // Resize mantendo aspect ratio 1:1
            if (mode === 'se' || mode === 'e' || mode === 's') {
                w = Math.max(MIN_CROP_PX, sc.w + dx);
                h = w / ASPECT_RATIO;
            } else if (mode === 'nw' || mode === 'n' || mode === 'w') {
                w = Math.max(MIN_CROP_PX, sc.w - dx);
                h = w / ASPECT_RATIO;
                x = sc.x + sc.w - w;
                y = sc.y + sc.h - h;
            } else if (mode === 'ne') {
                w = Math.max(MIN_CROP_PX, sc.w + dx);
                h = w / ASPECT_RATIO;
                y = sc.y + sc.h - h;
            } else if (mode === 'sw') {
                w = Math.max(MIN_CROP_PX, sc.w - dx);
                h = w / ASPECT_RATIO;
                x = sc.x + sc.w - w;
            }

            // Clamp para não sair do canvas
            if (x < 0) { w += x; h = w / ASPECT_RATIO; x = 0; }
            if (y < 0) { h += y; w = h * ASPECT_RATIO; y = 0; }
            if (x + w > cw) { w = cw - x; h = w / ASPECT_RATIO; }
            if (y + h > ch) { h = ch - y; w = h * ASPECT_RATIO; }
            if (w < MIN_CROP_PX) return prev;

            return { x, y, w: Math.round(w), h: Math.round(h) };
        });
    };

    const onPointerUp = () => { dragRef.current.mode = null; };

    // ── Zoom via scroll ──────────────────────────────────────────
    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setZoom(z => parseFloat(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)).toFixed(2)));

        setShowZoomHint(true);
        if (zoomShowTimer.current) clearTimeout(zoomShowTimer.current);
        zoomShowTimer.current = window.setTimeout(() => setShowZoomHint(false), 1200);
    };

    // ── Zoom via botões ──────────────────────────────────────────
    const zoomIn    = () => setZoom(z => parseFloat(Math.min(MAX_ZOOM, z + ZOOM_STEP * 2).toFixed(2)));
    const zoomOut   = () => setZoom(z => parseFloat(Math.max(MIN_ZOOM, z - ZOOM_STEP * 2).toFixed(2)));
    const zoomReset = () => setZoom(1);
    const zoomPct   = Math.round(zoom * 100);

    // ── Confirmar crop ────────────────────────────────────────────
    const handleConfirm = () => {
        if (!img || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const cw = canvas.width;
        const ch = canvas.height;

        const imgAR = img.naturalWidth / img.naturalHeight;
        const canAR = cw / ch;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (imgAR > canAR) { drawW = cw; drawH = cw / imgAR; drawX = 0; drawY = (ch - drawH) / 2; }
        else               { drawH = ch; drawW = ch * imgAR; drawX = (cw - drawW) / 2; drawY = 0; }

        const cx = cw / 2, cy = ch / 2;
        const zW = drawW * zoom, zH = drawH * zoom;
        const zX = cx - zW / 2, zY = cy - zH / 2;

        // Coordenadas na imagem natural
        const scale = img.naturalWidth / zW;
        const srcX  = Math.max(0, (crop.x - zX) * scale);
        const srcY  = Math.max(0, (crop.y - zY) * scale);
        const srcW  = Math.min(crop.w * scale, img.naturalWidth  - srcX);
        const srcH  = Math.min(crop.h * scale, img.naturalHeight - srcY);

        if (srcW < 10 || srcH < 10) return;

        const outSize = Math.min(srcW, 800);
        const out = document.createElement('canvas');
        out.width  = outSize;
        out.height = Math.round(outSize / ASPECT_RATIO);
        const outCtx = out.getContext('2d');
        if (!outCtx) return;
        outCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, out.width, out.height);
        out.toBlob(blob => { if (blob) onCrop(blob); }, 'image/webp', 0.92);
    };

    return (
        <div
            className="crop-overlay"
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchEnd={onPointerUp}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className="crop-modal" onClick={e => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className="crop-header">
                    <div className="crop-header-left">
                        <h3>Cortar Imagem</h3>
                        {naturalSize.w > 0 && (
                            <span className="crop-nat-size">{naturalSize.w}×{naturalSize.h}px</span>
                        )}
                    </div>
                    <div className="crop-header-right">
                        <span className="crop-aspect-badge">1:1</span>
                        <button type="button" className="crop-close-btn" onClick={onCancel} title="Cancelar (ESC)">✕</button>
                    </div>
                </div>

                {/* ── Canvas ── */}
                <div
                    className="crop-canvas-wrap"
                    ref={containerRef}
                    onMouseMove={e => onPointerMove(e.clientX, e.clientY)}
                    onTouchMove={e => { e.preventDefault(); onPointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
                >
                    <canvas
                        ref={canvasRef}
                        className="crop-canvas"
                        onMouseDown={e => onPointerDown(e.clientX, e.clientY)}
                        onTouchStart={e => { if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY); }}
                        onWheel={onWheel}
                        style={{ touchAction: 'none' }}
                    />
                    {!imageLoaded && (
                        <div className="crop-loading">
                            <span className="crop-loading-spinner" />
                            Carregando imagem...
                        </div>
                    )}
                    {showZoomHint && (
                        <div className="crop-zoom-indicator">{zoomPct}%</div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="crop-footer">
                    <div className="crop-hint">
                        <span>🖱 Scroll = zoom &nbsp;·&nbsp; Arraste a área = mover &nbsp;·&nbsp; Bordas/cantos = redimensionar</span>
                    </div>
                    <div className="crop-footer-row">
                        <div className="crop-zoom-controls">
                            <button type="button" className="crop-zoom-btn" onClick={zoomOut}
                                disabled={zoom <= MIN_ZOOM || !imageLoaded} title="Reduzir zoom">−</button>
                            <button type="button" className="crop-zoom-btn crop-zoom-pct" onClick={zoomReset}
                                disabled={zoom === 1 || !imageLoaded} title="Resetar zoom">{zoomPct}%</button>
                            <button type="button" className="crop-zoom-btn" onClick={zoomIn}
                                disabled={zoom >= MAX_ZOOM || !imageLoaded} title="Aumentar zoom">+</button>
                        </div>
                        <div className="crop-actions">
                            <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                            <button type="button" className="btn-primary" onClick={handleConfirm}
                                disabled={!imageLoaded}>
                                {imageLoaded ? 'Aplicar Corte e Enviar' : 'Carregando...'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
