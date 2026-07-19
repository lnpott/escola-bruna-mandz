import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/App';
import {
    fetchAdminProducts,
    createAdminProduct,
    updateAdminProduct,
    fetchOrders,
    updateOrderStatus,
    uploadProductImage,
} from '@/services/api';
import type { Product, Order } from '@/types';
import ImageCropper from '@/components/ImageCropper';
import '@/styles/store.css';

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
}

function formatDateTime(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR');
}

const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: '⏳ Pendente',
    approved: '✅ Aprovado',
    cancelled: '❌ Cancelado',
    refunded: '💳 Reembolsado',
};

const ORDER_STATUS_OPTIONS = ['pending', 'approved', 'cancelled', 'refunded'];

const CATEGORY_LABELS: Record<string, string> = {
    roupas: '👕 Roupas',
    acessorios: '💍 Acessórios',
    kits: '🎁 Kits',
};

type StoreTab = 'products' | 'orders';

// ═══════════════════════════════════════════════════════════════════
//  STORE PAGE
// ═══════════════════════════════════════════════════════════════════

export default function Store() {
    const { showToast, confirm } = useApp();
    const [activeTab, setActiveTab] = useState<StoreTab>('products');

    // ── Products state ─────────────────────────────────────────
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [prodForm, setProdForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'roupas',
        badge: '',
        image: '',
        active: true,
    });

    // ── Orders state ───────────────────────────────────────────
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // ── Load products ──────────────────────────────────────────
    const loadProducts = useCallback(async () => {
        setProductsLoading(true);
        try {
            const data = await fetchAdminProducts();
            setProducts(data);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao carregar produtos.', 'error');
        } finally {
            setProductsLoading(false);
        }
    }, [showToast]);

    useEffect(() => { if (activeTab === 'products') loadProducts(); }, [activeTab, loadProducts]);

    // ── Load orders ────────────────────────────────────────────
    const loadOrders = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const data = await fetchOrders();
            setOrders(data);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao carregar pedidos.', 'error');
        } finally {
            setOrdersLoading(false);
        }
    }, [showToast]);

    useEffect(() => { if (activeTab === 'orders') loadOrders(); }, [activeTab, loadOrders]);

    // ── Filtered products ──────────────────────────────────────
    const filteredProducts = products.filter(p =>
        !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Product modal helpers ──────────────────────────────────
    const openCreateProduct = () => {
        setEditingProduct(null);
        setProdForm({ name: '', description: '', price: '', stock: '', category: 'roupas', badge: '', image: '', active: true });
        setShowProductModal(true);
    };

    const openEditProduct = (p: Product) => {
        setEditingProduct(p);
        setProdForm({
            name: p.name,
            description: p.description || '',
            price: String(p.price).replace('.', ','),
            stock: String(p.stock),
            category: p.category,
            badge: p.badge || '',
            image: p.image || '',
            active: p.active,
        });
        setShowProductModal(true);
    };

    // ── Image upload + crop state ─────────────────────────────
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Formato não permitido. Use JPEG, PNG ou WebP.', 'error');
            return;
        }

        // Validate file size (max 10MB before crop — upload-image.js already limits on server)
        if (file.size > 10 * 1024 * 1024) {
            showToast('Imagem muito grande. Máximo 10MB.', 'error');
            return;
        }

        // Show crop modal
        setCropFile(file);

        // Reset file input for re-selection
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCroppedImage = async (croppedBlob: Blob) => {
        // Criar File a partir do Blob cortado
        const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.webp`, {
            type: 'image/webp',
        });

        setUploadingImage(true);
        try {
            const url = await uploadProductImage(croppedFile);
            setProdForm(f => ({ ...f, image: url }));
            setCropFile(null); // Só fecha o modal após sucesso
            showToast('Imagem cortada e enviada com sucesso!');
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao enviar imagem.', 'error');
        } finally {
            setUploadingImage(false);
        }
    };

    // ── Save product ───────────────────────────────────────────
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(prodForm.price.replace(',', '.')) || 0;
        const stock = parseInt(prodForm.stock, 10) || 0;

        if (!prodForm.name.trim()) {
            showToast('Nome do produto é obrigatório.', 'error');
            return;
        }

        try {
            if (editingProduct) {
                await updateAdminProduct(editingProduct.id, {
                    name: prodForm.name.trim(),
                    description: prodForm.description.trim() || undefined,
                    price,
                    stock,
                    category: prodForm.category,
                    badge: prodForm.badge.trim() || undefined,
                    image: prodForm.image.trim() || undefined,
                    active: prodForm.active,
                });
                showToast('Produto atualizado!');
            } else {
                await createAdminProduct({
                    name: prodForm.name.trim(),
                    description: prodForm.description.trim() || undefined,
                    price,
                    stock,
                    category: prodForm.category,
                    badge: prodForm.badge.trim() || undefined,
                    image: prodForm.image.trim() || undefined,
                    active: true,
                });
                showToast('Produto criado!');
            }
            setShowProductModal(false);
            loadProducts();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao salvar produto.', 'error');
        }
    };

    // ── Toggle product active ──────────────────────────────────
    const handleToggleActive = async (p: Product) => {
        try {
            await updateAdminProduct(p.id, { active: !p.active });
            showToast(p.active ? 'Produto desativado.' : 'Produto ativado.');
            loadProducts();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao atualizar produto.', 'error');
        }
    };

    // ── Update order status ────────────────────────────────────
    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        const confirmed = await confirm({
            title: 'Alterar Status do Pedido',
            message: `Deseja alterar o status do pedido ${orderId} para "${newStatus}"?`,
            confirmText: 'Confirmar',
            danger: newStatus === 'cancelled' || newStatus === 'refunded',
        });
        if (!confirmed) return;
        try {
            await updateOrderStatus(orderId, newStatus);
            showToast(`Status atualizado para ${newStatus}.`);
            loadOrders();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Erro ao atualizar status.', 'error');
        }
    };

    // ── Parse order items ──────────────────────────────────────
    const parseItems = (items: any): { name: string; quantity: number; price: number }[] => {
        if (!items) return [];
        // Supabase retorna jsonb já parseado como objeto JS
        if (Array.isArray(items)) return items;
        // Fallback para string JSON (legado)
        if (typeof items === 'string') {
            try {
                const parsed = JSON.parse(items);
                if (Array.isArray(parsed)) return parsed;
            } catch { /* ignore */ }
        }
        return [];
    };

    // ══════════════════════════════════════════════════════════════
    //  RENDER
    // ══════════════════════════════════════════════════════════════

    return (
        <div className="store-container">
            {/* Header */}
            <div className="store-header">
                <h1>🛒 Loja</h1>
                <a href="/" target="_blank" rel="noopener noreferrer" className="store-link-out">
                    🔗 Ver vitrine pública
                </a>
            </div>

            {/* Sub-tabs */}
            <div className="store-sub-nav">
                <button
                    className={`store-sub-tab ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >📦 Produtos</button>
                <button
                    className={`store-sub-tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >📋 Pedidos ({orders.length})</button>
            </div>

            {/* ══════════════════════════════════════════════════════
                TAB: PRODUCTS
                ══════════════════════════════════════════════════════ */}
            {activeTab === 'products' && (
                <div className="store-tab-content">
                    <div className="store-toolbar">
                        <input
                            type="text"
                            className="store-search"
                            placeholder="🔍 Buscar produto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button className="store-btn-primary" onClick={openCreateProduct}>
                            ➕ Novo Produto
                        </button>
                    </div>

                    {productsLoading ? (
                        <div className="loading">Carregando produtos...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-state empty-state-sm">
                            {searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
                        </div>
                    ) : (
                        <div className="store-table-wrap">
                            <table className="store-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Preço</th>
                                        <th>Estoque</th>
                                        <th>Categoria</th>
                                        <th>Badge</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} className={!p.active ? 'store-row-inactive' : ''}>
                                            <td data-label="Produto">
                                                <div className="store-product-name">
                                                    {p.image && (
                                                        <img src={p.image} alt="" className="store-product-thumb" />
                                                    )}
                                                    <span>{p.name}</span>
                                                </div>
                                            </td>
                                            <td data-label="Preço" className="store-cell-currency">{formatCurrency(p.price)}</td>
                                            <td data-label="Estoque">
                                                <span className={`store-stock-pill ${p.stock <= 5 ? 'low' : 'ok'}`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td data-label="Categoria">
                                                <span className="store-pill">{CATEGORY_LABELS[p.category] || p.category}</span>
                                            </td>
                                            <td data-label="Badge">{p.badge || '—'}</td>
                                            <td data-label="Status">
                                                <span className={`store-status-pill ${p.active ? 'active' : 'inactive'}`}>
                                                    {p.active ? '✅ Ativo' : '⛔ Inativo'}
                                                </span>
                                            </td>
                                            <td data-label="Ações">
                                                <div className="store-actions">
                                                    <button className="store-btn-sm" onClick={() => openEditProduct(p)} title="Editar">✏️</button>
                                                    <button
                                                        className={`store-btn-sm ${p.active ? 'btn-warn' : 'btn-ok'}`}
                                                        onClick={() => handleToggleActive(p)}
                                                        title={p.active ? 'Desativar' : 'Ativar'}
                                                    >{p.active ? '⛔' : '✅'}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB: ORDERS
                ══════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
                <div className="store-tab-content">
                    {ordersLoading ? (
                        <div className="loading">Carregando pedidos...</div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state empty-state-sm">Nenhum pedido recebido.</div>
                    ) : (
                        <div className="store-table-wrap">
                            <table className="store-table">
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td data-label="Pedido">
                                                <strong>{o.id}</strong>
                                                <button
                                                    className="store-expand-btn"
                                                    onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                                >
                                                    {expandedOrder === o.id ? '▲' : '▼'}
                                                </button>
                                            </td>
                                            <td data-label="Cliente">
                                                <div>{o.customer_name}</div>
                                                <div className="store-sub-text">{o.customer_email}</div>
                                            </td>
                                            <td data-label="Total" className="store-cell-currency">{formatCurrency(o.total)}</td>
                                            <td data-label="Data">{formatDateTime(o.created_at)}</td>
                                            <td data-label="Status">
                                                <span className={`store-order-status ${o.status}`}>
                                                    {ORDER_STATUS_LABELS[o.status] || o.status}
                                                </span>
                                            </td>
                                            <td data-label="Ações">
                                                <select
                                                    className="store-status-select"
                                                    value={o.status}
                                                    onChange={e => handleUpdateStatus(o.id, e.target.value)}
                                                >
                                                    {ORDER_STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Expanded Order Details ───────────────── */}
                    {expandedOrder && (
                        <div className="store-order-detail">
                            <h3>📋 Detalhes do Pedido {expandedOrder}</h3>
                            {(() => {
                                const order = orders.find(o => o.id === expandedOrder);
                                if (!order) return <p>Pedido não encontrado.</p>;
                                const items = parseItems(order.items);
                                return (
                                    <div className="store-order-items">
                                        {items.length > 0 ? (
                                            <table className="store-table store-table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Qtd</th>
                                                        <th>Preço</th>
                                                        <th>Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td>{item.name}</td>
                                                            <td>{item.quantity}</td>
                                                            <td className="store-cell-currency">{formatCurrency(item.price)}</td>
                                                            <td className="store-cell-currency">{formatCurrency(item.price * item.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan={3}><strong>Total</strong></td>
                                                        <td className="store-cell-currency"><strong>{formatCurrency(order.total)}</strong></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        ) : (
                                            <p className="store-sub-text">Itens não disponíveis.</p>
                                        )}
                                        {order.method && (
                                            <div className="store-order-info">
                                                <strong>Pagamento:</strong> {order.method.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                PRODUCT MODAL
                ══════════════════════════════════════════════════════ */}
            {/* ── Image Crop Modal ───────────────────────────── */}
            {cropFile && (
                <ImageCropper
                    file={cropFile}
                    onCrop={handleCroppedImage}
                    onCancel={() => setCropFile(null)}
                />
            )}

            {showProductModal && (
                <div className="store-modal-overlay" onClick={() => setShowProductModal(false)} role="dialog" aria-modal="true" aria-label={editingProduct ? 'Editar produto' : 'Novo produto'}>
                    <div className="store-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
                        <form onSubmit={handleSaveProduct}>
                            <div className="store-form-group">
                                <label>Nome *</label>
                                <input type="text" value={prodForm.name}
                                    onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ex: Camiseta Premium" required />
                            </div>
                            <div className="store-form-group">
                                <label>Descrição</label>
                                <textarea value={prodForm.description}
                                    onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Descrição do produto..." rows={3} />
                            </div>
                            <div className="store-form-row">
                                <div className="store-form-group">
                                    <label>Preço (R$) *</label>
                                    <input type="text" value={prodForm.price}
                                        onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0,00" required />
                                </div>
                                <div className="store-form-group">
                                    <label>Estoque *</label>
                                    <input type="number" value={prodForm.stock}
                                        onChange={e => setProdForm(f => ({ ...f, stock: e.target.value }))}
                                        min={0} required />
                                </div>
                            </div>
                            <div className="store-form-row">
                                <div className="store-form-group">
                                    <label>Categoria *</label>
                                    <select value={prodForm.category}
                                        onChange={e => setProdForm(f => ({ ...f, category: e.target.value }))}>
                                        <option value="roupas">👕 Roupas</option>
                                        <option value="acessorios">💍 Acessórios</option>
                                        <option value="kits">🎁 Kits</option>
                                    </select>
                                </div>
                                <div className="store-form-group">
                                    <label>Badge</label>
                                    <input type="text" value={prodForm.badge}
                                        onChange={e => setProdForm(f => ({ ...f, badge: e.target.value }))}
                                        placeholder="Ex: Novo, Promoção" />
                                </div>
                            </div>
                            <div className="store-form-group">
                                <label>Imagem do Produto</label>
                                <div className="store-image-upload">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                        onChange={handleFileSelected}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="store-image-preview-row">
                                        {prodForm.image ? (
                                            <div className="store-image-preview">
                                                <img src={prodForm.image} alt="Preview" className="store-image-thumb" />
                                                <button
                                                    type="button"
                                                    className="store-btn-sm store-btn-remove"
                                                    onClick={() => setProdForm(f => ({ ...f, image: '' }))}
                                                    title="Remover imagem"
                                                >✕</button>
                                            </div>
                                        ) : (
                                            <div className="store-image-placeholder" onClick={() => fileInputRef.current?.click()}>
                                                🖼️ Clique para selecionar
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="store-btn-secondary"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                        >
                                            {uploadingImage ? '📤 Enviando...' : prodForm.image ? '🔄 Trocar' : '📤 Selecionar e Cortar'}
                                        </button>
                                    </div>
                                    <span className="store-form-hint">Formatos: JPEG, PNG, WebP. Máximo 2MB.</span>
                                </div>
                            </div>
                            {editingProduct && (
                                <label className="store-checkbox-label">
                                    <input type="checkbox" checked={prodForm.active}
                                        onChange={e => setProdForm(f => ({ ...f, active: e.target.checked }))} />
                                    Produto ativo (visível na vitrine)
                                </label>
                            )}
                            <div className="store-form-actions">
                                <button type="submit" className="store-btn-primary">
                                    {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                                </button>
                                <button type="button" className="store-btn-secondary" onClick={() => setShowProductModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
