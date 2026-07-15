📐 Layout Proposto — Navegação Global
Estrutura Atual (simplificada)
App.tsx
├── Login      → página isolada
├── Home       → grade de módulos (cards)
│   ├── Dashboard   → rota separada
│   ├── Acadêmico   → sub-rotas (Alunos, Professores, Matrículas)
│   ├── Agenda      → rota separada
│   ├── Financeiro  → rota separada
│   └── Admin       → rota separada
Problema: Cada módulo é uma rota diferente sem navegação persistente. Usuário precisa voltar ao Home toda vez.
Estrutura Proposta
App.tsx
├── Login → página isolada (sem mudanças)
├── AppLayout → layout global com:
│   ├── 🔝 TopBar fixa
│   │   ├── Logo + nome "Escola Bruna Mandz"
│   │   ├── Nav tabs: 📊Dashboard | 🎓Acadêmico | 📅Agenda | 💰Financeiro | 👥Admin
│   │   └── Botão Sair
│   ├── 📍 Breadcrumbs (ex: "Home > Acadêmico > Alunos")
│   └── 🍞 Toast container (global, qualquer página)
│       └── Página atual (Dashboard | Acadêmico | Agenda | Financeiro | Admin)
├── ConfirmModal → modal de confirmação global (substitui window.confirm())
────────────────────────────────────────────────────────────────────────────────
Código Proposto —  app/src/App.tsx 
// tsx
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useState, createContext, useContext, useCallback, useEffect } from 'react';
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
//  CONTEXTO GLOBAL — Toast + ConfirmModal
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
    onConfirm: () => void;
    danger?: boolean;
}
 
interface AppContextType {
    showToast: (text: string, type?: 'success' | 'error') => void;
    confirm: (options: ConfirmOptions) => void;
}
 
const AppContext = createContext<AppContextType>({
    showToast: () => {},
    confirm: () => {},
});
 
export const useApp = () => useContext(AppContext);
 
// ═══════════════════════════════════════════════════════════════════
//  TOAST GLOBAL
// ═══════════════════════════════════════════════════════════════════
 
function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    let nextId = 0;
 
    useEffect(() => {
        // Expõe showToast globalmente via contexto
        // (implementado abaixo no provider)
    }, []);
 
    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 8,
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    padding: '12px 20px', borderRadius: 10,
                    background: t.type === 'success' ? '#0a2e1a' : '#2a0a0a',
                    border: `1px solid ${t.type === 'success' ? '#22c55e' : '#dc2626'}`,
                    color: t.type === 'success' ? '#86efac' : '#fca5a5',
                    fontWeight: 600, fontSize: 13,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    animation: 'toastIn 0.25s ease-out',
                    cursor: 'pointer', minWidth: 200,
                }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
                    {t.text}
                </div>
            ))}
        </div>
    );
}
 
// ═══════════════════════════════════════════════════════════════════
//  CONFIRM MODAL GLOBAL
// ═══════════════════════════════════════════════════════════════════
 
function ConfirmModal({ options, onClose }: {
    options: ConfirmOptions | null;
    onClose: () => void;
}) {
    if (!options) return null;
 
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: 20, backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.15s ease-out',
        }} onClick={onClose}>
            <div style={{
                background: '#111115', border: '1px solid #2a2a36',
                borderRadius: 14, padding: 24, maxWidth: 400, width: '90%',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                animation: 'scaleIn 0.15s ease-out',
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#f0f0f3' }}>
                    {options.title}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#a0a0b0', lineHeight: 1.5 }}>
                    {options.message}
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button style={{
                        padding: '8px 16px', borderRadius: 8, border: '1px solid #3a3a48',
                        background: 'transparent', color: '#a0a0b0', cursor: 'pointer',
                        fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
                    }} onClick={onClose}>
                        {options.cancelText || 'Cancelar'}
                    </button>
                    <button style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none',
                        background: options.danger ? '#dc2626' : '#22c55e',
                        color: options.danger ? '#fff' : '#09090b',
                        cursor: 'pointer', fontWeight: 700, fontSize: 13,
                        transition: 'all 0.15s',
                    }} onClick={() => { options.onConfirm(); onClose(); }}>
                        {options.confirmText || options.danger ? 'Excluir' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
 
// ═══════════════════════════════════════════════════════════════════
//  TOPBAR DE NAVEGAÇÃO GLOBAL
// ═══════════════════════════════════════════════════════════════════
 
const NAV_ITEMS = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/academico', icon: '🎓', label: 'Acadêmico' },
    { path: '/agenda',    icon: '📅', label: 'Agenda' },
    { path: '/financeiro', icon: '💰', label: 'Financeiro' },
    { path: '/admin',     icon: '👥', label: 'Admin' },
];
 
function TopBar() {
    const location = useLocation();
    const navigate = useNavigate();
 
    return (
        <header style={{
            background: '#111115', borderBottom: '1px solid #1e1e26',
            position: 'sticky', top: 0, zIndex: 100,
        }}>
            <div style={{
                maxWidth: 1200, margin: '0 auto',
                display: 'flex', alignItems: 'center',
                padding: '0 20px', height: 56, gap: 24,
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    fontSize: 16, fontWeight: 800, color: '#f0f0f3',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    🎵 <span style={{ color: '#a0a0b0', fontWeight: 400 }}>Bruna Mandz</span>
                </Link>
 
                {/* Navegação */}
                <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {NAV_ITEMS.map(item => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button key={item.path} onClick={() => navigate(item.path)} style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                background: isActive ? '#dc2626' : 'transparent',
                                color: isActive ? '#fff' : '#a0a0b0',
                                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                                transition: 'all 0.15s', whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <span style={{ fontSize: 14 }}>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
 
                {/* Logout */}
                <button onClick={() => { logout(); navigate('/login'); }} style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid #3a3a48',
                    background: 'transparent', color: '#fca5a5',
                    cursor: 'pointer', fontWeight: 600, fontSize: 12,
                    transition: 'all 0.15s',
                }}>
                    Sair
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
 
    const pathMap: Record<string, string> = {
        '/': 'Início',
        '/dashboard': 'Dashboard',
        '/academico': 'Acadêmico',
        '/academico/professores': 'Professores',
        '/academico/turmas': 'Matrículas',
        '/agenda': 'Agenda',
        '/financeiro': 'Financeiro',
        '/admin': 'Administração',
    };
 
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return null; // Home não mostra breadcrumb
 
    return (
        <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '12px 20px 0',
            display: 'flex', gap: 6, alignItems: 'center',
            fontSize: 12, color: '#6a6a7a',
        }}>
            <Link to="/" style={{ color: '#6a6a7a', textDecoration: 'none' }}>
                Início
            </Link>
            {paths.map((_, i) => {
                const path = '/' + paths.slice(0, i + 1).join('/');
                const label = pathMap[path] || paths[i];
                return (
                    <span key={path} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ color: '#3a3a48' }}>/</span>
                        <span style={{
                            color: i === paths.length - 1 ? '#f0f0f3' : '#a0a0b0',
                            fontWeight: i === paths.length - 1 ? 700 : 400,
                        }}>
                            {label}
                        </span>
                    </span>
                );
            })}
        </div>
    );
}
 
// ═══════════════════════════════════════════════════════════════════
//  AUTH GUARD
// ═══════════════════════════════════════════════════════════════════
 
function AuthGuard({ children }: { children: React.ReactNode }) {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return <>{children}</>;
}
 
// ═══════════════════════════════════════════════════════════════════
//  APP LAYOUT (com topbar + breadcrumbs + toasts)
// ═══════════════════════════════════════════════════════════════════
 
function AppLayout() {
    return (
        <>
            <TopBar />
            <Breadcrumbs />
            <main>
                {/** Páginas renderizadas pelas rotas aninhadas */}
            </main>
            <ToastContainer />
        </>
    );
}
 
// ═══════════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════════
 
export default function App() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);
    const toastIdRef = useRef(0);
 
    const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
        const id = ++toastIdRef.current;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);
 
    const confirm = useCallback((options: ConfirmOptions) => {
        setConfirmOpts(options);
    }, []);
 
    return (
        <AppContext.Provider value={{ showToast, confirm }}>
            <BrowserRouter basename="/app">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<AuthGuard><AppLayout><Home /></AppLayout></AuthGuard>} />
                    {/* ... demais rotas dentro do AppLayout ... */}
                </Routes>
                <ConfirmModal options={confirmOpts} onClose={() => setConfirmOpts(null)} />
            </BrowserRouter>
        </AppContext.Provider>
    );
}
────────────────────────────────────────────────────────────────────────────────
O que muda:
┌────────────┬───────────────────────────────────────────┬────────────────────────────────┐
│ Componente │ Antes                                     │ Depois                         │
├────────────┼───────────────────────────────────────────┼────────────────────────────────┤
│ Nav        │ Cada página tem ← Voltar no topo          │ TopBar fixa com todas as abas  │
│            │                                           │ visíveis                       │
│ Breadcrumb │ ❌ Não existe                             │ ✅ Mostra "Início > Acadêmico  │
│ s          │                                           │ > Alunos"                      │
│ Toast      │ 3 implementações diferentes (Agenda,      │ ✅ 1 componente global via     │
│            │ Financial, Students)                      │ contexto                       │
│ Confirmaçã │ window.confirm() (navegador)              │ ✅ Modal estilizado com        │
│ o          │                                           │ useApp().confirm()             │
│ Sair       │ Botão em cada página                      │ ✅ Único botão na TopBar       │
└────────────┴───────────────────────────────────────────┴────────────────────────────────┘
Quer que eu implemente essa proposta?