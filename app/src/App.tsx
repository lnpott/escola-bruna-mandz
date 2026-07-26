import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, useCallback, useRef } from 'react';
import Students from '@/pages/Students';
import StudentDetail from '@/pages/StudentDetail';
import Teachers from '@/pages/Teachers';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Enrollments from '@/pages/Enrollments';
import Financial from '@/pages/Financial';
import Admin from '@/pages/Admin';
import Store from '@/pages/Store';
import StorageManager from '@/pages/StorageManager';
import Login from '@/pages/Login';
import { isAuthenticated, logout } from '@/services/api';
import { Analytics } from '@vercel/analytics/react';
import { IconHouse, IconDashboard, IconAcademic, IconCalendar, IconWallet, IconUsers, IconStore, IconLogout, IconCheckCircle, IconXCircle, IconBookOpen, IconMusic } from '@/components/Icons';
import './styles/global.css';

// ═══════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════

interface ToastMessage {
    id: number;
    text: string;
    type: 'success' | 'error';
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface AppContextType {
    showToast: (text: string, type?: 'success' | 'error') => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AppContext = createContext<AppContextType>({
    showToast: () => {},
    confirm: () => Promise.resolve(false),
});

export const useApp = () => useContext(AppContext);

// ═══════════════════════════════════════════════════════════════════
//  APP PROVIDER — Toast + Confirm global state
// ═══════════════════════════════════════════════════════════════════

function AppProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const ToastIcon = ({ type }: { type: 'success' | 'error' }) =>
        type === 'success' ? <IconCheckCircle size={16} /> : <IconXCircle size={16} />;
    const [confirmState, setConfirmState] = useState<{
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);
    const nextIdRef = useRef(0);

    const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
        const id = ++nextIdRef.current;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise(resolve => {
            setConfirmState({ options, resolve });
        });
    }, []);

    const handleConfirm = useCallback((value: boolean) => {
        if (confirmState) {
            confirmState.resolve(value);
            setConfirmState(null);
        }
    }, [confirmState]);

    return (
        <AppContext.Provider value={{ showToast, confirm }}>
            {children}
            {/* ── Global Toast Container ── */}
            <div className="toast-container" aria-live="polite" role="status">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}
                        onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                    >
                        <span className="toast-icon"><ToastIcon type={t.type} /></span>
                        <span className="toast-text">{t.text}</span>
                    </div>
                ))}
            </div>
            {/* ── Global Confirm Modal ── */}
            {confirmState && (
                <div className="modal-overlay" onClick={() => handleConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                    <div className="confirm-modal bezel-shell" onClick={e => e.stopPropagation()}>
                        <div className="bezel-core">
                            <h3 id="confirm-title" className="confirm-title">{confirmState.options.title}</h3>
                            <p className="confirm-message">{confirmState.options.message}</p>
                            <div className="confirm-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleConfirm(false)}
                                >
                                    {confirmState.options.cancelText || 'Cancelar'}
                                </button>
                                <button
                                    className={confirmState.options.danger ? 'btn-danger' : 'btn-primary'}
                                    onClick={() => handleConfirm(true)}
                                >
                                    {confirmState.options.confirmText || 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppContext.Provider>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  AUTH GUARD
// ═══════════════════════════════════════════════════════════════════

function AuthGuard({ children }: { children: React.ReactNode }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}



// ═══════════════════════════════════════════════════════════════════
//  TOPBAR — Navegação global fixa
// ═══════════════════════════════════════════════════════════════════

function TopBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tabs = [
        { path: '/', label: 'Início', icon: 'House' },
        { path: '/dashboard', label: 'Dashboard', icon: 'Dashboard' },
        { path: '/academico', label: 'Acadêmico', icon: 'Academic' },
        { path: '/agenda', label: 'Agenda', icon: 'Calendar' },
        { path: '/financeiro', label: 'Financeiro', icon: 'Wallet' },
        { path: '/admin', label: 'Admin', icon: 'Users' },
        { path: '/loja', label: 'Loja', icon: 'Store' },
    ];

    const iconMap: Record<string, React.ReactNode> = {
        House: <IconHouse />,
        Dashboard: <IconDashboard />,
        Academic: <IconAcademic />,
        Calendar: <IconCalendar />,
        Wallet: <IconWallet />,
        Users: <IconUsers />,
        Store: <IconStore />,
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        if (path === '/academico') return location.pathname.startsWith('/academico');
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="topbar">
                <div className="topbar-inner">
                    <Link to="/" className="topbar-brand" title="Início" onClick={() => setMobileMenuOpen(false)}>
                        <IconMusic size={20} /> <span>Escola Bruna Mandz</span>
                    </Link>
                    
                    <nav className="topbar-nav">
                        {tabs.map(tab => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`topbar-link ${isActive(tab.path) ? 'active' : ''}`}
                            >
                                <span className="topbar-link-icon">{iconMap[tab.icon]}</span>
                                <span className="topbar-link-label">{tab.label}</span>
                            </Link>
                        ))}
                    </nav>
                    
                    <button className="topbar-logout" onClick={handleLogout} title="Sair">
                        <span className="topbar-link-icon"><IconLogout /></span>
                        <span className="topbar-link-label">Sair</span>
                    </button>

                    <button 
                        className={`topbar-hamburger ${mobileMenuOpen ? 'is-open' : ''}`} 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu Principal"
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>
                </div>
            </header>

            <div className={`mobile-nav-modal ${mobileMenuOpen ? 'is-open' : ''}`}>
                {tabs.map(tab => (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        className={`topbar-link ${isActive(tab.path) ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="topbar-link-icon">{iconMap[tab.icon]}</span>
                        <span className="topbar-link-label">{tab.label}</span>
                    </Link>
                ))}
                <button className="topbar-logout" onClick={handleLogout} title="Sair">
                    <span className="topbar-link-icon"><IconLogout /></span>
                    <span className="topbar-link-label">Sair</span>
                </button>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  BREADCRUMBS
// ═══════════════════════════════════════════════════════════════════

function Breadcrumbs() {
    const location = useLocation();

    const crumbs: { label: string; path?: string }[] = [];
    crumbs.push({ label: 'Início', path: '/' });

    if (location.pathname.startsWith('/dashboard')) {
        crumbs.push({ label: 'Dashboard' });
    } else if (location.pathname.startsWith('/academico')) {
        crumbs.push({ label: 'Acadêmico', path: '/academico' });
        if (location.pathname === '/academico/professores') {
            crumbs.push({ label: 'Professores' });
        } else if (location.pathname === '/academico/turmas') {
            crumbs.push({ label: 'Matrículas' });
        } else if (location.pathname.startsWith('/academico/aluno/')) {
            crumbs.push({ label: 'Alunos', path: '/academico' });
            crumbs.push({ label: 'Detalhes do Aluno' });
        } else {
            crumbs.push({ label: 'Alunos' });
        }
    } else if (location.pathname.startsWith('/agenda')) {
        crumbs.push({ label: 'Agenda' });
    } else if (location.pathname.startsWith('/financeiro')) {
        crumbs.push({ label: 'Financeiro' });
    } else if (location.pathname.startsWith('/admin')) {
        if (location.pathname === '/admin/storage') {
            crumbs.push({ label: 'Admin', path: '/admin' });
            crumbs.push({ label: 'Gerenciador de Imagens' });
        } else {
            crumbs.push({ label: 'Admin' });
        }
    } else if (location.pathname.startsWith('/loja')) {
        crumbs.push({ label: 'Loja' });
    }

    if (crumbs.length <= 1) return null;

    return (
        <nav className="breadcrumbs" aria-label="Navegação">
            {crumbs.map((crumb, i) => (
                <span key={i} className="breadcrumb-item">
                    {i > 0 && <span className="breadcrumb-sep">›</span>}
                    {crumb.path ? (
                        <Link to={crumb.path} className="breadcrumb-link">{crumb.label}</Link>
                    ) : (
                        <span className="breadcrumb-current">{crumb.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  APP LAYOUT — Envolve todas as páginas autenticadas
// ═══════════════════════════════════════════════════════════════════

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app-layout">
            <TopBar />
            <main className="app-main">
                <Breadcrumbs />
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  HOME — Grade de módulos
// ═══════════════════════════════════════════════════════════════════

function ModuleCard({ icon, title, description, to }: { icon: React.ReactNode; title: string; description: string; to: string }) {
    return (
        <Link to={to} className="module-card">
            <div className="module-icon">{icon}</div>
            <h2>{title}</h2>
            <p>{description}</p>
        </Link>
    );
}

function Home() {
    return (            <div className="app-container">
            <div className="app-header">
                <h1>ERP Educacional</h1>
                <p className="app-subtitle">Escola Bruna Mandz</p>
            </div>
            <div className="module-grid">
                <ModuleCard icon={<IconDashboard size={40} />} title="Dashboard" description="Indicadores em tempo real da escola" to="/dashboard" />
                <ModuleCard icon={<IconAcademic size={40} />} title="Acadêmico" description="Alunos, professores e matrículas" to="/academico" />
                <ModuleCard icon={<IconCalendar size={40} />} title="Agenda" description="Aulas, eventos e conflitos de horário" to="/agenda" />
                <ModuleCard icon={<IconWallet size={40} />} title="Financeiro" description="Contas a receber/pagar, fluxo de caixa" to="/financeiro" />
                <ModuleCard icon={<IconUsers size={40} />} title="Administração" description="Usuários, perfis e permissões" to="/admin" />
                <ModuleCard icon={<IconStore size={40} />} title="Loja" description="Produtos e pedidos da loja" to="/loja" />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  ACADEMIC SUB-NAV
// ═══════════════════════════════════════════════════════════════════

function AcademicSubNav() {
    const location = useLocation();
    const isStudents = location.pathname === '/academico' || location.pathname === '/academico/alunos';
    const isTeachers = location.pathname === '/academico/professores';
    const isTurmas = location.pathname === '/academico/turmas';

    return (
        <div className="sub-nav">
            <Link to="/academico" className={`sub-nav-link ${isStudents ? 'active' : ''}`}><IconUsers size={14} /> Alunos</Link>
            <Link to="/academico/professores" className={`sub-nav-link ${isTeachers ? 'active' : ''}`}><IconAcademic size={14} /> Professores</Link>
            <Link to="/academico/turmas" className={`sub-nav-link ${isTurmas ? 'active' : ''}`}><IconBookOpen size={14} /> Matrículas</Link>
        </div>
    );
}

function AcademicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AcademicSubNav />
            {children}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
    return (
        <BrowserRouter basename="/app">
            <Analytics />
            <AppProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<AuthGuard><AppLayout><Home /></AppLayout></AuthGuard>} />
                    <Route path="/dashboard" element={<AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>} />
                    <Route path="/academico" element={<AuthGuard><AppLayout><AcademicLayout><Students /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/academico/aluno/:id" element={<AuthGuard><AppLayout><AcademicLayout><StudentDetail /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/academico/professores" element={<AuthGuard><AppLayout><AcademicLayout><Teachers /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/academico/turmas" element={<AuthGuard><AppLayout><AcademicLayout><Enrollments /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/agenda" element={<AuthGuard><AppLayout><Agenda /></AppLayout></AuthGuard>} />
                    <Route path="/financeiro" element={<AuthGuard><AppLayout><Financial /></AppLayout></AuthGuard>} />
                    <Route path="/admin" element={<AuthGuard><AppLayout><Admin /></AppLayout></AuthGuard>} />
                    <Route path="/admin/storage" element={<AuthGuard><AppLayout><StorageManager /></AppLayout></AuthGuard>} />
                    <Route path="/loja" element={<AuthGuard><AppLayout><Store /></AppLayout></AuthGuard>} />
                    <Route path="*" element={
                        <AuthGuard>
                            <AppLayout>
                                <div className="app-container">
                                    <h1>Em construção 🚧</h1>
                                    <p>Este módulo será implementado em breve.</p>
                                    <Link to="/">Voltar ao início</Link>
                                </div>
                            </AppLayout>
                        </AuthGuard>
                    } />
                </Routes>
            </AppProvider>
        </BrowserRouter>
    );
}
