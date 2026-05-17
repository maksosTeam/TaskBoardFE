import '../../styles/sidebar-component.css'
import defaultAvatar from "../../assets/user-avatar.webp";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { rebuildFilePath } from "../../utils.ts";
// Импортируем нужные иконки
import { FolderKanban, Kanban, ListTodo, User } from 'lucide-react';

interface SidebarComponentProps {
    user?: {
        imagePath?: string;
        username?: string;
    };
}

// Переводим список навигации в массив объектов с компонентами иконок
const navigation_List = [
    { title: "Проекты", path: "projects", icon: FolderKanban },
    { title: "Доски", path: "boards", icon: Kanban },
    { title: "Задачи", path: "tasks", icon: ListTodo },
    { title: "Настройки", path: "settings", icon: User },
] as const;

export const SidebarComponent = ({ user }: SidebarComponentProps) => {
    const navigate = useNavigate();
    const [activePath, setActivePath] = useState("projects");

    return (
        <div className='sidebar'>
            <button onClick={() => { navigate(`/home/settings`)}} className={`profile-info`}>
                <img className="profile-image" src={rebuildFilePath(user?.imagePath, 0) || defaultAvatar} alt="Ваш профиль" />
                <button type="button" className="profile-username" onClick={() => { navigate('/home/settings') }}>
                    {user?.username || ''}
                </button>
            </button>
            <div className="navigation">
                {navigation_List.map(({ title, path, icon: Icon }) => (
                    <button
                        key={path}
                        type="button"
                        onClick={() => {
                            navigate(`/home/${path}`);
                            setActivePath(path);
                        }}
                        className={`nav-link ${activePath === path ? 'active' : ''}`}
                    >
                        <Icon className="nav-icon" size={20} />
                        <span className="nav-text">{title}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}