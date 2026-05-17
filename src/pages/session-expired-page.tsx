import { useNavigate } from "react-router-dom";
import { LogOut, AlertCircle, ArrowRight } from "lucide-react";
import "../styles/session-expired.css";

export const SessionExpiredPage = () => {
    const navigate = useNavigate();

    return (
        <div className="session-expired-container">
            <div className="session-expired-card">
                <div className="session-expired-icon">
                    <AlertCircle size={64} strokeWidth={1.5} />
                </div>
                <h2>Сессия истекла</h2>
                <p className="session-expired-subtext">Авторизуйтесь, чтобы продолжить работу.</p>
                <button onClick={() => navigate("/login")} className="session-expired-button">
                    <LogOut size={18} />
                    На страницу авторизации
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};