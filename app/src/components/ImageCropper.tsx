/**
 * app/src/components/ImageCropper.tsx
 *
 * Modal de corte de imagem com Canvas API.
 * Permite ao usuário selecionar uma região da imagem para cortar
 * antes do upload. Aspect ratio fixo em 4:3 (ideal para produtos).
 *
 * Suporta mouse e toque (touch events).
 *
 * Props:
 *   file: File — imagem selecionada
 *   onCrop: (croppedBlob: Blob) => void — chamado quando o usuário confirma o corte
 *   onCancel: () => void — chamado quando o usuário cancela
 */
import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
    file: File;
    onCrop: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

const ASPECT_RATIO = 4 / 3; // Largura / Altura

export default function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cancelledRef = useRef(false);

    // Estado da imagem
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Estado do crop (em pixels relativos ao container)
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });

    // Estado do drag
    const [dragging, setDragging] = useState<'move' | 'resize' | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropAtDragStart, setCropAtDragStart] = useState({ x: 0, y: 0, width: 100, height: 100 });

    // Dimensões reais da imagem
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    // Carregar imagem com cleanup no unmount
    useEffect(() => {
        cancelledRef.current = false;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (cancelledRef.current) return;
            const image = new Image();
            image.onload = () => {
                if (cancelledRef.current) return;
                setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
                setImg(image);
                setImageLoaded(true);
            };
            image.onerror = () => {
                // Erro ao carregar — apenas ignora
            };
            image.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);

        return () => {
            cancelledRef.current = true;
        };
    }, [file]);

    // Referência do container para calcular bounds atuais (sempre atualizados)
    const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const cropH = h * 0.85;
        const cropW = cropH * ASPECT_RATIO;
        const finalW = Math.min(cropW, w * 0.85);
        const finalH = finalW / ASPECT_RATIO;
        setCrop({
            x: (w - finalW) / 2,
            y: (h - finalH) / 2,
            width: finalW,
            height: finalH,
        });
    }, []);

    // Obter bounds atuais do container (sempre fresco)
    const getContainerSize = useCallback((): { width: number; height: number } => {
        if (!canvasRef.current) return { width: 0, height: 0 };
        const parent = canvasRef.current.parentElement;
        if (!parent) return { width: 0, height: 0 };
        const rect = parent.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
    }, []);

    // Desenhar no canvas
    useEffect(() => {
        if (!imageLoaded || !canvasRef.current || !img) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const cw = canvas.width;
        const ch = canvas.height;

        // Calcular área de desenho (cover — preenche o container)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = cw / ch;
        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (imgAspect > containerAspect) {
            drawH = ch;
            drawW = drawH * imgAspect;
            drawX = (cw - drawW) / 2;
            drawY = 0;
        } else {
            drawW = cw;
            drawH = cw / imgAspect;
            drawX = 0;
            drawY = (ch - drawH) / 2;
        }

        ctx.clearRect(0, 0, cw, ch);

        // Verificar se o crop está dentro dos limites do canvas
        const cropX = Math.max(0, Math.min(crop.x, cw - crop.width));
        const cropY = Math.max(0, Math.min(crop.y, ch - crop.height));
        const cropW = Math.min(crop.width, cw - cropX);
        const cropH = Math.min(crop.height, ch - cropY);

        // Se o crop area for muito pequena, desenha imagem completa
        if (cropW < 20 || cropH < 20) {
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Redimensione a área de corte', cw / 2, ch / 2);
            return;
        }

        try {
            // Capturar a região de crop do canvas
            const imageData = ctx.getImageData(cropX, cropY, cropW, cropH);

            // Limpar e desenhar fundo escuro
            ctx.clearRect(0, 0, cw, ch);
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, cw, ch);

            // Colocar a região cortada de volta
            ctx.putImageData(imageData, cropX, cropY);

            // Bordas da área de crop
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2;
            ctx.strokeRect(cropX, cropY, cropW, cropH);

            // Cantos
            const cornerSize = 12;
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(cropX - 3, cropY - 3, cornerSize, 4);
            ctx.fillRect(cropX - 3, cropY - 3, 4, cornerSize);
            ctx.fillRect(cropX + cropW - cornerSize + 3, cropY - 3, cornerSize, 4);
            ctx.fillRect(cropX + cropW - 1, cropY - 3, 4, cornerSize);
            ctx.fillRect(cropX - 3, cropY + cropH - 1, cornerSize, 4);
            ctx.fillRect(cropX - 3, cropY + cropH - cornerSize + 3, 4, cornerSize);
            ctx.fillRect(cropX + cropW - cornerSize + 3, cropY + cropH - 1, cornerSize, 4);
            ctx.fillRect(cropX + cropW - 1, cropY + cropH - cornerSize + 3, 4, cornerSize);

            // Instruções
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Arraste para mover · Bordas para redimensionar', 12, ch - 12);
        } catch {
            // Crop fora dos limites — o useEffect será re-executado no próximo render
        }
    }, [imageLoaded, img, crop]);

    // ── Obter coordenadas relativas ao canvas (mouse ou toque) ──
    const getPointerPos = (clientX: number, clientY: number): { x: number; y: number } | null => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    // ── Iniciar drag ──
    const handlePointerDown = (clientX: number, clientY: number) => {
        const pos = getPointerPos(clientX, clientY);
        if (!pos) return;

        const containerSize = getContainerSize();
        const mx = pos.x;
        const my = pos.y;

        // Verificar se clicou nos cantos (resize)
        const margin = 16;
        const near = (a: number, b: number) => Math.abs(a - b) < margin;

        const atLeft = near(mx, crop.x);
        const atRight = near(mx, crop.x + crop.width);
        const atTop = near(my, crop.y);
        const atBottom = near(my, crop.y + crop.height);

        if (atLeft || atRight || atTop || atBottom) {
            setDragging('resize');
            setDragStart({ x: mx, y: my });
            setCropAtDragStart({ ...crop });
            return;
        }

        // Verificar se clicou dentro da área de crop (move)
        if (mx >= crop.x && mx <= crop.x + crop.width &&
            my >= crop.y && my <= crop.y + crop.height) {
            setDragging('move');
            setDragStart({ x: mx, y: my });
            setCropAtDragStart({ ...crop });
        }
    };

    // ── Mover/redimensionar ──
    const handlePointerMove = (clientX: number, clientY: number) => {
        if (!dragging) return;
        const pos = getPointerPos(clientX, clientY);
        if (!pos) return;

        const containerSize = getContainerSize();
        const cw = containerSize.width;
        const ch = containerSize.height;
        const mx = pos.x;
        const my = pos.y;
        const dx = mx - dragStart.x;
        const dy = my - dragStart.y;

        if (dragging === 'move') {
            let nx = cropAtDragStart.x + dx;
            let ny = cropAtDragStart.y + dy;
            nx = Math.max(0, Math.min(nx, cw - cropAtDragStart.width));
            ny = Math.max(0, Math.min(ny, ch - cropAtDragStart.height));
            setCrop(prev => ({ ...prev, x: nx, y: ny }));
        } else if (dragging === 'resize') {
            let nw = cropAtDragStart.width + dx;
            let nh = nw / ASPECT_RATIO;

            if (nw < 80) { nw = 80; nh = nw / ASPECT_RATIO; }
            if (nh < 60) { nh = 60; nw = nh * ASPECT_RATIO; }

            if (cropAtDragStart.x + nw > cw) {
                nw = cw - cropAtDragStart.x;
                nh = nw / ASPECT_RATIO;
            }
            if (cropAtDragStart.y + nh > ch) {
                nh = ch - cropAtDragStart.y;
                nw = nh * ASPECT_RATIO;
            }

            setCrop(prev => ({ ...prev, width: nw, height: nh }));
        }
    };

    // ── Finalizar drag ──
    const handlePointerUp = () => {
        setDragging(null);
    };

    // ── Eventos de mouse ──
    const onMouseDown = (e: React.MouseEvent) => handlePointerDown(e.clientX, e.clientY);
    const onMouseMove = (e: React.MouseEvent) => { if (dragging) handlePointerMove(e.clientX, e.clientY); };
    const onMouseUp = () => handlePointerUp();

    // ── Eventos de toque ──
    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    // ── Cursor conforme ação ──
    const getCursor = (): string => {
        if (dragging === 'move') return 'grabbing';
        if (dragging === 'resize') return 'nwse-resize';
        return 'crosshair';
    };

    // ── Confirmar crop ──
    const handleConfirm = () => {
        if (!img || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const cw = canvas.width;
        const ch = canvas.height;

        // Calcular área de desenho (mesma lógica do useEffect)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = cw / ch;
        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (imgAspect > containerAspect) {
            drawH = ch;
            drawW = drawH * imgAspect;
            drawX = (cw - drawW) / 2;
            drawY = 0;
        } else {
            drawW = cw;
            drawH = cw / imgAspect;
            drawX = 0;
            drawY = (ch - drawH) / 2;
        }

        // Converter coordenadas do canvas para coordenadas da imagem original
        const scaleToNatural = img.naturalWidth / drawW;

        const srcX = (crop.x - drawX) * scaleToNatural;
        const srcY = (crop.y - drawY) * scaleToNatural;
        const srcW = crop.width * scaleToNatural;
        const srcH = crop.height * scaleToNatural;

        // Garantir que não ultrapasse os limites da imagem
        const clampedSrcX = Math.max(0, srcX);
        const clampedSrcY = Math.max(0, srcY);
        const clampedSrcW = Math.min(srcW, img.naturalWidth - clampedSrcX);
        const clampedSrcH = Math.min(srcH, img.naturalHeight - clampedSrcY);

        if (clampedSrcW < 10 || clampedSrcH < 10) return;

        // Criar canvas de saída com tamanho máximo de 800px
        const maxDim = 800;
        const outW = Math.min(clampedSrcW, maxDim);
        const outH = outW / ASPECT_RATIO;

        const outCanvas = document.createElement('canvas');
        outCanvas.width = outW;
        outCanvas.height = outH;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) return;

        outCtx.drawImage(img, clampedSrcX, clampedSrcY, clampedSrcW, clampedSrcH, 0, 0, outW, outH);

        outCanvas.toBlob((blob) => {
            if (blob) {
                onCrop(blob);
            }
        }, 'image/webp', 0.9);
    };

    return (
        <div className="crop-overlay" onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchEnd={onTouchEnd}>
            <div className="crop-modal">
                <div className="crop-header">
                    <h3>Cortar Imagem</h3>
                    <span className="crop-aspect-badge">4:3</span>
                </div>

                <div className="crop-preview" ref={containerRefCallback}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        style={{ cursor: getCursor(), touchAction: 'none' }}
                    />
                    {!imageLoaded && (
                        <div className="crop-loading">Carregando imagem...</div>
                    )}
                </div>

                <div className="crop-footer">
                    <div className="crop-info">
                        <span>Arraste para mover • Bordas para redimensionar</span>
                        <span className="crop-dimensions">
                            {naturalSize.width > 0 && `${naturalSize.width}×${naturalSize.height}px`}
                        </span>
                    </div>
                    <div className="crop-actions">
                        <button type="button" className="btn-secondary" onClick={onCancel}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleConfirm}
                            disabled={!imageLoaded}
                        >
                            {imageLoaded ? '✅ Aplicar Corte e Enviar' : 'Carregando...'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
