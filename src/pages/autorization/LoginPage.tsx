import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/autorization/login-page.css';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'АВТОРИЗАЦИЯ';
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const url = '/api/auth/login';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);
                throw new Error(
                    errorData.message ||
                    errorData.errors?.join(', ') ||
                    'Ошибка входа. Проверьте данные.'
                );
            }
            const data = await response.json();
            localStorage.setItem('token', data.token);
            console.log(data);
            navigate('/home');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Сбой системной аутентификации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>С возвращением</h1>
                    <p>Введите учетные данные для доступа к системе</p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="auth-form-group">
                        <label htmlFor="email">Электронная почта</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">Пароль доступа</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button type="button" className="forgot-password">
                            Восстановить доступ
                        </button>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Аутентификация...' : 'Инициировать вход'}
                    </button>

                    <div className="signup-link">
                        <p>Отсутствует учетная запись?</p>
                        <button
                            type="button"
                            className="auth-navigate-btn"
                            onClick={() => navigate('/register')}
                        >
                            Создать аккаунт
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};