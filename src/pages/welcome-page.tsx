import { useNavigate } from "react-router-dom";
import {useState} from "react";
import LetterGlitch from "../blocks/Backgrounds/LetterGlitch/LetterGlitch";
import ShinyText from '../blocks/TextAnimations/ShinyText/ShinyText.tsx';
import "../styles/welcome-page.css";

export const WelcomePage = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleNavigation = (path: string) => {
        setIsExiting(true);
        setTimeout(() => navigate(path), 300); // Ждем завершения анимации
    };

    return (
        <div className={`welcome-container ${isExiting ? 'exiting' : ''}`}>
            <div className="background-glow">
                <LetterGlitch
                    glitchSpeed={50}
                    centerVignette={true}
                    outerVignette={false}
                    smooth={true}
                />
            </div>

            <div className="welcome-content">
                <h1 className="welcome-title">
                    Добро пожаловать в <ShinyText text="Boardly" disabled={false} speed={3}/>
                </h1>
                <p className="welcome-subtitle">
                    Эффективное управление задачами для команд разработки
                </p>

                <div className="welcome-buttons">
                    <button className="welcome-btn" onClick={() => handleNavigation("/login")}>
                        Войти
                    </button>
                    <button className="welcome-btn welcome-btn-outline" onClick={() => handleNavigation("/register")}>
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    );
};
