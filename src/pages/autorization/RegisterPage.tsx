import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from "react-router-dom";
import '../../styles/autorization/login-page.css';

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'РЕГИСТРАЦИЯ';
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response: AxiosResponse = await axios.post(`/api/auth/register`, {
                username: username,
                email: email,
                password: password,
            });

            if (!(response.status >= 200 && response.status < 300)) {
                setError('Произошла системная ошибка при регистрации.');
                return;
            }

            navigate('/login');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Сбой при создании учетной записи.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Регистрация</h1>
                    <p>Инициализация нового пользователя в системе</p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}

                <form onSubmit={handleRegister}>
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
                        <label htmlFor="username">Идентификатор (Имя)</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="user_id"
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
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Создание записи...' : 'Зарегистрировать'}
                    </button>

                    <div className="signup-link">
                        <p>Уже зарегистрированы?</p>
                        <button
                            type="button"
                            className="auth-navigate-btn"
                            onClick={() => navigate('/login')}
                        >
                            Выполнить авторизацию
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};