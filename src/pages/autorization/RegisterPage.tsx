import { useState, useEffect } from 'react';
import '../../styles/autorization/login-page.css';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from "react-router-dom";

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Регистрация';
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
                setError('Произошла ошибка при регистрации.');
                return;
            }

            navigate('/login');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Произошла ошибка при регистрации.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Создать аккаунт</h1>

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
                        <label htmlFor="username">Имя пользователя</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
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
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>

                    <div className="signup-link">
                        <p>Уже есть учетная запись?</p>
                        <button
                            type="button"
                            className="auth-navigate-btn"
                            onClick={() => navigate('/login')}
                        >
                            Выполнить вход
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};