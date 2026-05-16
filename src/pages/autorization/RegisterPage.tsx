import { useState, useEffect } from 'react';
import '../../styles/autorization/login-page.css';
import axios, {AxiosResponse} from 'axios';
import {useNavigate} from "react-router-dom";

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response:AxiosResponse = await axios.post(`/api/auth/register`, {
                username: username,
                email: email,
                password: password,
            });

            if (!(response.status >= 200 && response.status < 300)) {
                setError('Произошла ошибка при регистрации.');
            }

            navigate('/login');
        } catch (e) {
            setError('Произошла ошибка при регистрации.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Регистрация</h1>

                {error && <p className="auth-error-message">{error}</p>}
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
                        <label htmlFor="text">Имя пользователя</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                    </div>


                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>

                    <div className="signup-link">
                        <p>Уже есть учетная запись?</p>
                        <button className={"auth-navigate-btn"} onClick={() => navigate('/login')}>Выполнить вход</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
