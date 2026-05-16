import { useEffect, useState } from 'react';
import '../../styles/project-page/project-contributors-component.css';
import defaultAvatar from "../../assets/user-avatar.webp";
import { Send, X, MoreVertical, Save } from 'lucide-react';
import {rebuildFilePath} from "../../utils.ts";

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
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        if (projectId) {
            fetch(`/api/project/get-users-in-project/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            })
                .then(response => response.json())
                .then(data => setUsers(data))
                .catch(error => console.error('Ошибка при получении участников:', error));
        }
    }, [projectId, token]);

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
            })
            .catch(err => {
                console.error(err);
                setShakeError(true);
                setTimeout(() => setShakeError(false), 500);
            });
    };

    const changeRole = async (userId: number) => {
        try {
            const res = await fetch('/api/project/set-user-role', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    projectId,
                    role: { role: newRole }
                })
            });

            if (!res.ok) throw new Error("Ошибка при изменении роли");

            setEditingUserId(null);
            setNewRole('');
            // Обновить список
            const refreshed = await fetch(`/api/project/get-users-in-project/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await refreshed.json();
            setUsers(data);
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
                        <img className="user-avatar" src={rebuildFilePath(user.imagePath, 0) || defaultAvatar} alt="avatar" />
                        <div className="user-info">
                            <div className="user-name">{user.username} ({user.email})</div>
                            <div className="user-role">{user.role || ''}</div>
                        </div>

                        {user.role !== "Создатель" &&  (<div className="project-user-actions">
                            <button onClick={() => setEditingUserId(user.id)}>
                                <MoreVertical size={20} />
                            </button>

                            {editingUserId === user.id && (
                                <div className="project-user-edit-role-popup">
                                    <input
                                        type="text"
                                        placeholder="Введите роль"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                    />
                                    <button onClick={() => changeRole(user.id)}>
                                        <Save size={20}/>
                                    </button>
                                    <button onClick={() => setEditingUserId(null)}>
                                        <X size={22}/>
                                    </button>
                                </div>
                            )}
                        </div>)}
                    </li>
                ))}
            </ul>

            {inviteOpen && !inviteSent && (
                <div className={`invite-form`}>
                    <div className={`invite-form-input ${shakeError ? 'shake' : ''}`}>
                        <input
                            type="email"
                            placeholder="Email (участник должен быть зарегистрирован на платформе)"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <button className="invite-form-sent-btn" onClick={sendInvite} title="Отправить"><Send size={17} /></button>
                    </div>
                    <button onClick={() => setInviteOpen(false)} title="Отменить"><X size={20} /></button>
                </div>
            )}

            {!inviteOpen && !inviteSent && (
                <button className="add-user-button" onClick={() => setInviteOpen(true)}>
                    Добавить участника
                </button>
            )}

            {inviteSent && (
                <div className="invite-message">
                    Ссылка <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> была отправлена на указанный адрес
                    <button className="close-invite-message" onClick={resetInvite}><X size={16} /></button>
                </div>
            )}
        </div>
    );
};
