import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/api';
import '@/styles/login.css';

export default function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Digite a senha de administrador.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const valid = await login(password);
            if (valid) {
                navigate('/');
            } else {
                setError('Senha incorreta.');
            }
        } catch {
            setError('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">🎵</div>
                <h1 className="login-title">ERP Educacional</h1>
                <p className="login-subtitle">Escola Bruna Mandz</p>
                <p className="login-hint">Acesso restrito — informe a senha de administrador.</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Senha"
                            autoFocus
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>


            </div>
        </div>
    );
}
