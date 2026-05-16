import '../../styles/sidebar-component.css'
import defaultAvatar from "../../assets/user-avatar.webp";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {rebuildFilePath} from "../../utils.ts";

type NavigationItem = {
    [key: string]: string;
};

const navigation_List: NavigationItem = {
    "Проекты": "projects",
    "Доски": "boards",
    "Задачи": "tasks",
    "Настройки": "settings",
} as const

interface SidebarComponentProps {
    user?: {
        imagePath?: string;
        username?: string;
    };
}

export const SidebarComponent = ({ user }: SidebarComponentProps) => {
    const navigate = useNavigate();
    const [activePath, setActivePath] = useState("projects");

    return (
        <div className='sidebar'>
            <div className="profile-info">
                <img className="profile-image" src={rebuildFilePath(user?.imagePath, 0) || defaultAvatar} alt="Ваш профиль" />
                <button onClick={() => {navigate('/home/settings')}}>
                    {user?.username || ''}
                </button>
            </div>
            <div className="navigation">
                {Object.entries(navigation_List).map(([title, path]) => (
                    <button
                        key={path}
                        onClick={() => {
                            navigate(`/home/${path}`);
                            setActivePath(path);
                        }}
                        className={`nav-link ${activePath === path ? 'active' : ''}`}
                    >
                        {title}
                    </button>
                ))}
            </div>
        </div>
    )
}
