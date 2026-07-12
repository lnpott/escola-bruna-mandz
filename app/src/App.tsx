import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, useCallback, useRef } from 'react';
import Students from '@/pages/Students';
import Teachers from '@/pages/Teachers';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Enrollments from '@/pages/Enrollments';
import Financial from '@/pages/Financial';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import { isAuthenticated, logout } from '@/services/api';
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
            <div className="toast-container" aria-live="polite">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}
                        onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                    >
                        <span className="toast-icon">{t.type === 'error' ? '❌' : '✅'}</span>
                        <span className="toast-text">{t.text}</span>
                    </div>
                ))}
            </div>
            {/* ── Global Confirm Modal ── */}
            {confirmState && (
                <div className="modal-overlay" onClick={() => handleConfirm(false)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="confirm-title">{confirmState.options.title}</h3>
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tabs = [
        { path: '/', label: 'Início', icon: '🏠' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/academico', label: 'Acadêmico', icon: '🎓' },
        { path: '/agenda', label: 'Agenda', icon: '📅' },
        { path: '/financeiro', label: 'Financeiro', icon: '💰' },
        { path: '/admin', label: 'Admin', icon: '👥' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        if (path === '/academico') return location.pathname.startsWith('/academico');
        return location.pathname.startsWith(path);
    };

    return (
        <header className="topbar">
            <div className="topbar-inner">
                <Link to="/" className="topbar-brand" title="Início">
                    🎵 <span>Escola Bruna Mandz</span>
                </Link>
                <nav className="topbar-nav">
                    {tabs.map(tab => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={`topbar-link ${isActive(tab.path) ? 'active' : ''}`}
                        >
                            <span className="topbar-link-icon">{tab.icon}</span>
                            <span className="topbar-link-label">{tab.label}</span>
                        </Link>
                    ))}
                </nav>
                <button className="topbar-logout" onClick={handleLogout} title="Sair">
                    <span className="topbar-link-icon">🚪</span>
                    <span className="topbar-link-label">Sair</span>
                </button>
            </div>
        </header>
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
        } else {
            crumbs.push({ label: 'Alunos' });
        }
    } else if (location.pathname.startsWith('/agenda')) {
        crumbs.push({ label: 'Agenda' });
    } else if (location.pathname.startsWith('/financeiro')) {
        crumbs.push({ label: 'Financeiro' });
    } else if (location.pathname.startsWith('/admin')) {
        crumbs.push({ label: 'Admin' });
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

function ModuleCard({ icon, title, description, to }: { icon: string; title: string; description: string; to: string }) {
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
                <ModuleCard icon="📊" title="Dashboard" description="Indicadores em tempo real da escola" to="/dashboard" />
                <ModuleCard icon="🎓" title="Acadêmico" description="Alunos, professores e matrículas" to="/academico" />
                <ModuleCard icon="📅" title="Agenda" description="Aulas, eventos e conflitos de horário" to="/agenda" />
                <ModuleCard icon="💰" title="Financeiro" description="Contas a receber/pagar, fluxo de caixa" to="/financeiro" />
                <ModuleCard icon="👥" title="Administração" description="Usuários, perfis e permissões" to="/admin" />
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
            <Link to="/academico" className={`sub-nav-link ${isStudents ? 'active' : ''}`}>📋 Alunos</Link>
            <Link to="/academico/professores" className={`sub-nav-link ${isTeachers ? 'active' : ''}`}>👨‍🏫 Professores</Link>
            <Link to="/academico/turmas" className={`sub-nav-link ${isTurmas ? 'active' : ''}`}>📚 Matrículas</Link>
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
            <AppProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<AuthGuard><AppLayout><Home /></AppLayout></AuthGuard>} />
                    <Route path="/dashboard" element={<AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>} />
                    <Route path="/academico" element={<AuthGuard><AppLayout><AcademicLayout><Students /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/academico/professores" element={<AuthGuard><AppLayout><AcademicLayout><Teachers /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/academico/turmas" element={<AuthGuard><AppLayout><AcademicLayout><Enrollments /></AcademicLayout></AppLayout></AuthGuard>} />
                    <Route path="/agenda" element={<AuthGuard><AppLayout><Agenda /></AppLayout></AuthGuard>} />
                    <Route path="/financeiro" element={<AuthGuard><AppLayout><Financial /></AppLayout></AuthGuard>} />
                    <Route path="/admin" element={<AuthGuard><AppLayout><Admin /></AppLayout></AuthGuard>} />
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
