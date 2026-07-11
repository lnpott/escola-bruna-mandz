import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Students from '@/pages/Students';
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
                <ModuleCard
                    icon="🎓"
                    title="Acadêmico"
                    description="Alunos, turmas, matrículas, frequência e mais"
                    to="/academico"
                />
                <ModuleCard
                    icon="💰"
                    title="Financeiro"
                    description="Contas a receber/pagar, fluxo de caixa, relatórios"
                    to="/financeiro"
                />
                <ModuleCard
                    icon="📅"
                    title="Agenda"
                    description="Aulas, eventos, conflitos de horário"
                    to="/agenda"
                />
                <ModuleCard
                    icon="📊"
                    title="Dashboard"
                    description="Indicadores em tempo real da escola"
                    to="/dashboard"
                />
                <ModuleCard
                    icon="👥"
                    title="Administração"
                    description="Usuários, perfis, permissões e auditoria"
                    to="/admin"
                />
            </div>
        </div>
    );
}

function AcademicLayout() {
    return (
        <div className="app-container">
            <div className="app-header" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h1>🎓 Módulo Acadêmico</h1>
                    <Link to="/" className="legacy-link">← Voltar</Link>
                </div>
                <div className="sub-nav">
                    <Link to="/academico" className="sub-nav-link active">📋 Alunos</Link>
                    <Link to="/academico/professores" className="sub-nav-link">👨‍🏫 Professores</Link>
                    <Link to="/academico/turmas" className="sub-nav-link">📚 Turmas</Link>
                </div>
            </div>
            <Students />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/academico" element={<AcademicLayout />} />
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
