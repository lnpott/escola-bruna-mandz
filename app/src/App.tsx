import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Students from '@/pages/Students';
import Teachers from '@/pages/Teachers';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Enrollments from '@/pages/Enrollments';
import Financial from '@/pages/Financial';
import Login from '@/pages/Login';
import { isAuthenticated, logout } from '@/services/api';
import './styles/global.css';

// ── Auth Guard ───────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

// ── Logout Button ────────────────────────────────────────────────

function LogoutButton() {
    const handleLogout = () => {
        logout();
        window.location.href = '/app/login';
    };
    return (
        <button
            onClick={handleLogout}
            className="legacy-link"
            style={{ cursor: 'pointer', borderColor: '#dc2626', color: '#fca5a5' }}
        >
            Sair
        </button>
    );
}

// ── Module Card ──────────────────────────────────────────────────

function ModuleCard({ icon, title, description, to }: { icon: string; title: string; description: string; to: string }) {
    return (
        <Link to={to} className="module-card">
            <div className="module-icon">{icon}</div>
            <h2>{title}</h2>
            <p>{description}</p>
        </Link>
    );
}

// ── Home ─────────────────────────────────────────────────────────

function Home() {
    return (
        <div className="app-container">
            <div className="app-header">
                <h1>ERP Educacional</h1>
                <p className="app-subtitle">Escola Bruna Mandz</p>
                <div className="header-links" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <a href="../painel-x9k2f.html" className="legacy-link">
                        ← Painel Clássico
                    </a>
                    <LogoutButton />
                </div>
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

// ── Academic Sub-nav ─────────────────────────────────────────────

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

// ── Layouts ──────────────────────────────────────────────────────

function AcademicLayout() {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>🎓 Módulo Acadêmico</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/" className="legacy-link">← Voltar</Link>
                    <LogoutButton />
                </div>
            </div>
            <AcademicSubNav />
            <Students />
        </div>
    );
}

function TeachersLayout() {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>🎓 Módulo Acadêmico</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/" className="legacy-link">← Voltar</Link>
                    <LogoutButton />
                </div>
            </div>
            <AcademicSubNav />
            <Teachers />
        </div>
    );
}

function DashboardLayout() {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', maxWidth: 1200, margin: '0 auto' }}>
                <Link to="/" className="legacy-link">← Voltar ao início</Link>
                <LogoutButton />
            </div>
            <Dashboard />
        </>
    );
}

// ── App ──────────────────────────────────────────────────────────

export default function App() {
    return (
        <BrowserRouter basename="/app">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
                <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>} />
                <Route path="/academico" element={<AuthGuard><AcademicLayout /></AuthGuard>} />
                <Route path="/academico/professores" element={<AuthGuard><TeachersLayout /></AuthGuard>} />
                <Route path="/academico/turmas" element={<AuthGuard><Enrollments /></AuthGuard>} />
                <Route path="/agenda" element={<AuthGuard><Agenda /></AuthGuard>} />
                <Route path="/financeiro" element={<AuthGuard><Financial /></AuthGuard>} />
                <Route path="*" element={
                    <AuthGuard>
                        <div className="app-container">
                            <h1>Em construção 🚧</h1>
                            <p>Este módulo será implementado em breve.</p>
                            <Link to="/">Voltar ao início</Link>
                        </div>
                    </AuthGuard>
                } />
            </Routes>
        </BrowserRouter>
    );
}
