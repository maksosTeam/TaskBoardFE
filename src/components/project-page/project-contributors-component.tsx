import { useEffect, useState } from 'react';
import '../../styles/project-page/project-contributors-component.css';
import defaultAvatar from "../../assets/user-avatar.webp";
import { Send, X, MoreVertical, Save, UserPlus, User, Check } from 'lucide-react';
import { rebuildFilePath } from "../../utils.ts";

interface User {
    id: number;
    username: string;
    imagePath: string;
    email: string;
    role: string;
}

interface ProjectContributorsProps {
    projectId: number;
}

export const ProjectContributorsComponent = ({ projectId }: ProjectContributorsProps) => {
    const [users, setUsers] = useState<User[] | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [inviteSent, setInviteSent] = useState(false);
    const [url, setUrl] = useState('');
    const [shakeError, setShakeError] = useState(false);
    const token = localStorage.getItem('token');
    const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<{ id: number; role: string } | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchUsers();
        }
    }, [projectId, token]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`/api/project/get-users-in-project/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка при получении участников:', error);
        }
    };

    const sendInvite = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
            return;
        }

        fetch('/api/project/send-invite', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'text/plain',
            },
            body: JSON.stringify({ email, projectId }),
        })
            .then(res => res.ok ? res.text() : Promise.reject('Ошибка отправки'))
            .then(link => {
                setInviteSent(true);
                setInviteOpen(false);
                setEmail('');
                setUrl(link);
                setTimeout(() => {
                    setInviteSent(false);
                    setUrl('');
                }, 5000);
            })
            .catch(err => {
                console.error(err);
                setShakeError(true);
                setTimeout(() => setShakeError(false), 500);
            });
    };

    const changeRole = async () => {
        if (!editingUser) return;

        try {
            const res = await fetch('/api/project/set-user-role', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: editingUser.id,
                    projectId,
                    role: { role: editingUser.role }
                })
            });

            if (!res.ok) throw new Error("Ошибка при изменении роли");

            setEditingUser(null);
            setMenuOpenFor(null);
            await fetchUsers();
        } catch (error) {
            console.error("Ошибка смены роли:", error);
        }
    };

    const resetInvite = () => {
        setInviteSent(false);
        setUrl('');
    };

    return (
        <div className="project-users-container">
            <ul className="user-list">
                {users?.map(user => (
                    <li key={user.id} className="user-item">
                        <img
                            className="user-avatar"
                            src={rebuildFilePath(user.imagePath, 0) || defaultAvatar}
                            alt={user.username}
                        />
                        <div className="user-info">
                            <div className="user-name">{user.username}</div>
                            <div className="user-email">{user.email}</div>
                            <div className="user-role">
                                {user.role || 'Участник'}
                            </div>
                        </div>

                        {user.role !== "Создатель" && (
                            <div className="project-user-actions">
                                <button
                                    className="user-menu-btn"
                                    onClick={() => setMenuOpenFor(menuOpenFor === user.id ? null : user.id)}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {menuOpenFor === user.id && (
                                    <div className="user-menu-popup">
                                        <button
                                            className="user-menu-item"
                                            onClick={() => {
                                                setEditingUser({ id: user.id, role: user.role });
                                                setMenuOpenFor(null);
                                            }}
                                        >
                                            <Save size={14} />
                                            Изменить роль
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {editingUser && editingUser.id === user.id && (
                            <div className="user-edit-overlay">
                                <div className="user-edit-popup">
                                    <h4>Изменение роли</h4>
                                    <input
                                        type="text"
                                        placeholder="Введите новую роль"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            role: e.target.value
                                        })}
                                        autoFocus
                                    />
                                    <div className="user-edit-actions">
                                        <button className="save-btn" onClick={changeRole}>
                                            <Check size={16} />
                                            Сохранить
                                        </button>
                                        <button className="cancel-btn" onClick={() => {
                                            setEditingUser(null);
                                        }}>
                                            <X size={16} />
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {inviteOpen && !inviteSent && (
                <div className="invite-form">
                    <div className={`invite-form-input ${shakeError ? 'shake' : ''}`}>
                        <input
                            type="email"
                            placeholder="Email участника (должен быть зарегистрирован)"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendInvite()}
                        />
                        <button className="invite-form-sent-btn-1" onClick={sendInvite} title="Отправить">
                            <Send size={14} />
                        </button>
                    </div>
                    <button className="invite-cancel-btn" onClick={() => setInviteOpen(false)} title="Отменить">
                        <X size={18} />
                    </button>
                </div>
            )}

            {!inviteOpen && !inviteSent && (
                <button className="add-user-button" onClick={() => setInviteOpen(true)}>
                    <UserPlus size={16} />
                    Добавить участника
                </button>
            )}

            {inviteSent && (
                <div className="invite-message">
                    <span>Ссылка <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> была отправлена на указанный адрес</span>
                    <button className="close-invite-message" onClick={resetInvite}>
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};