import '../../styles/sidebar-component.css'
import defaultAvatar from "../../assets/user-avatar.webp";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { rebuildFilePath } from "../../utils.ts";
import { FolderKanban, Kanban, ListTodo, User, Menu, AlignHorizontalDistributeCenterIcon } from 'lucide-react';

interface SidebarComponentProps {
    user?: {
        imagePath?: string;
        username?: string;
    };
}

const navigation_List = [
    { title: "Проекты", path: "projects", icon: FolderKanban },
    { title: "Kanban доски", path: "boards", icon: Kanban },
    { title: "Спринты", path: "sprints", icon: AlignHorizontalDistributeCenterIcon },
    { title: "Задачи", path: "tasks", icon: ListTodo },
    { title: "Настройки", path: "settings", icon: User },
] as const;

export const SidebarComponent = ({ user }: SidebarComponentProps) => {
    const navigate = useNavigate();
    const [activePath, setActivePath] = useState("projects");
    const [isOpen, setIsOpen] = useState(true); // Состояние для открытия/закрытия

    // Функция для получения первых двух букв имени (для заглушки, как в дизайне)
    const getInitials = (name?: string) => {
        return name ? name.substring(0, 2).toUpperCase() : 'US';
    };

    return (
        <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

            {/* Logo / Header */}
            <div className="sidebar-header">
                <div className="logo-icon">
                    <span>T</span>
                </div>
                {isOpen && (
                    <div className="header-text">
                        <h1 className="app-title">TaskBoard</h1>
                        <p className="app-subtitle">Project Management</p>
                    </div>
                )}
                <button
                    className="toggle-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Toggle sidebar"
                >
                    <Menu size={16} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="navigation">
                {navigation_List.map(({ title, path, icon: Icon }) => {
                    const isActive = activePath === path;
                    return (
                        <button
                            key={path}
                            type="button"
                            onClick={() => {
                                navigate(`/home/${path}`);
                                setActivePath(path);
                            }}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="nav-icon" size={20} />
                            {isOpen && <span className="nav-text">{title}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* User Section */}
            {isOpen && (
                <div className="sidebar-footer">
                    <div className="user-profile" onClick={() => navigate('/home/settings')}>
                        {user?.imagePath ? (
                            <img
                                className="profile-image"
                                src={rebuildFilePath(user?.imagePath, 0) || defaultAvatar}
                                alt="Профиль"
                            />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                <span>{getInitials(user?.username)}</span>
                            </div>
                        )}
                        <div className="profile-info">
                            <p className="profile-username">{user?.username || 'Пользователь'}</p>
                            <p className="profile-role">Project Manager</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};