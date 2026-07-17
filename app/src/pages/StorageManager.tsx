import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/App';
import {
    fetchStorageFiles,
    deleteStorageFile,
    cleanOrphanedFiles,
} from '@/services/api';
import type { StorageFile, StorageStats } from '@/services/api';
import '@/styles/admin.css';

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(iso?: string): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

// ═══════════════════════════════════════════════════════════════════
//  STORAGE MANAGER PAGE
// ═══════════════════════════════════════════════════════════════════

export default function StorageManager() {
    const { showToast, confirm } = useApp();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [images, setImages] = useState<StorageFile[]>([]);
    const [filter, setFilter] = useState<'all' | 'orphan' | 'linked'>('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchStorageFiles();
            setStats(data.stats);
            setImages(data.images);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar imagens.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Filter ───────────────────────────────────────────────
    const filteredImages = images.filter(img => {
        if (filter === 'orphan') return img.isOrphan;
        if (filter === 'linked') return !img.isOrphan;
        return true;
    });

    // ── Delete single image ─────────────────────────────────
    const handleDelete = async (file: StorageFile) => {
        const confirmed = await confirm({
            title: 'Excluir Imagem',
            message: `Deseja excluir "${file.name}"?\n\nEsta ação é irreversível.${
                file.linkedTo.length > 0
                    ? `\n\n⚠️ Esta imagem está vinculada ao produto "${file.linkedTo[0].name}". Excluí-la pode quebrar a imagem do produto.`
                    : ''
            }`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            danger: true,
        });
        if (!confirmed) return;

        setDeleting(file.filePath);
        try {
            await deleteStorageFile(file.filePath);
            showToast('Imagem excluída.');
            load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao excluir.', 'error');
        } finally {
            setDeleting(null);
        }
    };

    // ── Clean all orphans ───────────────────────────────────
    const handleCleanOrphans = async () => {
        const orphanFiles = images.filter(i => i.isOrphan);

        if (orphanFiles.length === 0) {
            showToast('Nenhuma imagem órfã encontrada.');
            return;
        }

        const confirmed = await confirm({
            title: 'Limpar Imagens Órfãs',
            message: `Deseja excluir ${orphanFiles.length} imagem(ns) órfã(s) (${formatBytes(orphanFiles.reduce((s, f) => s + f.size, 0))})?`,
            confirmText: 'Limpar Tudo',
            cancelText: 'Cancelar',
            danger: true,
        });
        if (!confirmed) return;

        setDeleting('__all__');
        try {
            const result = await cleanOrphanedFiles(orphanFiles.map(f => f.filePath));
            showToast(`${result.deleted} imagem(ns) órfã(s) excluída(s).`);
            load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao limpar.', 'error');
        } finally {
            setDeleting(null);
        }
    };

    // ── Render ───────────────────────────────────────────────
    return (
        <div className="admin-container">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>🖼️ Gerenciador de Imagens</h1>
                    <span className="admin-header-badge">Supabase Storage</span>
                </div>
                <div className="admin-header-actions">
                    <button
                        className="admin-refresh-btn"
                        onClick={load}
                        disabled={loading}
                    >
                        ↻ Atualizar
                    </button>
                </div>
            </div>

            {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}

            {loading && !stats && (
                <div className="loading">Carregando imagens...</div>
            )}

            {stats && (
                <>
                    {/* ── Stats Cards ────────────────────────────────── */}
                    <div className="admin-overview-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                        <div className="admin-card" style={{ '--card-accent': '#3b82f6' } as React.CSSProperties}>
                            <div className="admin-card-icon">🖼️</div>
                            <div className="admin-card-body">
                                <div className="admin-card-label">Total de Imagens</div>
                                <div className="admin-card-value">{stats.totalImages}</div>
                                <div className="admin-card-subtitle">{stats.totalSizeFormatted}</div>
                            </div>
                        </div>
                        <div className="admin-card" style={{ '--card-accent': '#22c55e' } as React.CSSProperties}>
                            <div className="admin-card-icon">✅</div>
                            <div className="admin-card-body">
                                <div className="admin-card-label">Vinculadas</div>
                                <div className="admin-card-value">{stats.linkedCount}</div>
                                <div className="admin-card-subtitle">Em uso por produtos</div>
                            </div>
                        </div>
                        <div className="admin-card" style={{ '--card-accent': stats.orphanedCount > 0 ? '#ef4444' : '#71717a' } as React.CSSProperties}>
                            <div className="admin-card-icon">🗑️</div>
                            <div className="admin-card-body">
                                <div className="admin-card-label">Órfãs</div>
                                <div className="admin-card-value">{stats.orphanedCount}</div>
                                <div className="admin-card-subtitle">{stats.orphanedSizeFormatted}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Toolbar ────────────────────────────────────── */}
                    <div className="admin-storage-toolbar">
                        <div className="admin-storage-filters">
                            {(['all', 'orphan', 'linked'] as const).map(f => (
                                <button
                                    key={f}
                                    className={`admin-storage-filter-btn ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'all' ? '📋 Todas' : f === 'orphan' ? '🗑️ Órfãs' : '✅ Vinculadas'}
                                </button>
                            ))}
                        </div>
                        {stats.orphanedCount > 0 && (
                            <button
                                className="admin-btn-danger"
                                onClick={handleCleanOrphans}
                                disabled={deleting === '__all__'}
                            >
                                {deleting === '__all__' ? '🧹 Limpando...' : `🧹 Limpar ${stats.orphanedCount} Órfãs`}
                            </button>
                        )}
                    </div>

                    {/* ── Image Grid ─────────────────────────────────── */}
                    {filteredImages.length === 0 ? (
                        <div className="empty-state">
                            {filter === 'orphan'
                                ? 'Nenhuma imagem órfã encontrada. 🎉'
                                : filter === 'linked'
                                    ? 'Nenhuma imagem vinculada.'
                                    : 'Nenhuma imagem encontrada no Storage.'}
                        </div>
                    ) : (
                        <div className="admin-storage-grid">
                            {filteredImages.map(img => (
                                <div
                                    key={img.filePath}
                                    className={`admin-storage-card ${img.isOrphan ? 'orphan' : ''}`}
                                >
                                    <div className="admin-storage-thumb-wrap">
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="admin-storage-thumb"
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" x="50" text-anchor="middle" dominant-baseline="central" font-size="30">🖼️</text></svg>';
                                            }}
                                        />
                                        {img.isOrphan && (
                                            <span className="admin-storage-badge orphan">Órfã</span>
                                        )}
                                        {deleting === img.filePath && (
                                            <div className="admin-storage-deleting-overlay">
                                                <span>Excluindo...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-storage-info">
                                        <div className="admin-storage-name" title={img.name}>
                                            {img.name}
                                        </div>
                                        <div className="admin-storage-meta">
                                            <span>{formatBytes(img.size)}</span>
                                            <span>{formatDate(img.createdAt)}</span>
                                        </div>
                                        {img.linkedTo.length > 0 && (
                                            <div className="admin-storage-links">
                                                {img.linkedTo.map(p => (
                                                    <span key={p.id} className="admin-storage-product-link" title={p.name}>
                                                        📦 {p.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-storage-actions">
                                        <a
                                            href={img.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="admin-storage-btn"
                                            title="Abrir em nova aba"
                                        >
                                            🔗
                                        </a>
                                        <button
                                            className="admin-storage-btn danger"
                                            onClick={() => handleDelete(img)}
                                            disabled={deleting === img.filePath}
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
