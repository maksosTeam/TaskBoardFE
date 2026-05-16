import { useNavigate } from "react-router-dom";
import "../styles/session-expired.css";

export const SessionExpiredPage = () => {
    const navigate = useNavigate();

    return (
        <div className="session-expired-container">
            <div className="session-expired-card">
                <h2>Ваша сессия истекла</h2>
                <p>Авторизуйтесь, чтобы продолжить работу.</p>
                <button onClick={() => navigate("/login")} className="session-expired-button">
                    На страницу авторизации
                </button>
            </div>
        </div>
    );
};
