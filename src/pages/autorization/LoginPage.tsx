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
        document.title = 'Логин';
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
                    'Ошибка входа. Проверьте email или пароль.'
                );
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            console.log(data);
            navigate('/home');
        } catch (err: unknown) {
            setError('Произошла ошибка при входе.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Войти в свою учетную запись</h1>

                {error && <div className="auth-error-message">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="auth-form-group">
                        <label htmlFor="email">Адрес электронной почты</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="button" className="forgot-password">
                            Забыли пароль?
                        </button>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Вход'}
                    </button>

                    <div className="signup-link">
                        <p>У вас еще нет учетной записи?</p>
                        <button
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