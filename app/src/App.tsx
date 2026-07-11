import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Students from '@/pages/Students';
import Teachers from '@/pages/Teachers';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Enrollments from '@/pages/Enrollments';
import Financial from '@/pages/Financial';
import './styles/global.css';

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
    return (
        <div className="app-container">
            <div className="app-header">
                <h1>ERP Educacional</h1>
                <p className="app-subtitle">Escola Bruna Mandz</p>
                <div className="header-links">
                    <a href="../painel-x9k2f.html" className="legacy-link">
                        ← Painel Clássico
                    </a>
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

function AcademicLayout() {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>🎓 Módulo Acadêmico</h1>
                <Link to="/" className="legacy-link">← Voltar</Link>
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
                <Link to="/" className="legacy-link">← Voltar</Link>
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
            </div>
            <Dashboard />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DashboardLayout />} />
                <Route path="/academico" element={<AcademicLayout />} />
                <Route path="/academico/professores" element={<TeachersLayout />} />
                <Route path="/academico/turmas" element={<Enrollments />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/financeiro" element={<Financial />} />
                <Route path="*" element={
                    <div className="app-container">
                        <h1>Em construção 🚧</h1>
                        <p>Este módulo será implementado em breve.</p>
                        <Link to="/">Voltar ao início</Link>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}
