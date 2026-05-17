import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser } from "../store/userSlice";
import '../styles/user-settings-page.css';
import defaultAvatar from '../assets/user-avatar.webp';
import { rebuildFilePath } from "../utils.ts";

export const UserSettings = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);

    const changePasswordRequest = async () => {
        try {
            await axios.post(
                `/api/auth/change-password`,
                {
                    lastPassword: oldPassword,
                    newPassword: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "text/plain",
                        "Content-Type": "application/json",
                    },
                }
            );

            alert("Пароль успешно изменен!");
            setIsPasswordEditing(false);
            setOldPassword("");
            setNewPassword("");
        } catch (error: any) {
            console.log("Ошибка при отправке запроса: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem("token");
            navigate("/");
        } catch (error) {
            console.error("Ошибка при выходе:", error);
            alert("Произошла ошибка при выходе");
        }
    };

    const handlePasswordCancel = () => {
        setIsPasswordEditing(false);
        setOldPassword("");
        setNewPassword("");
    };

    const onFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const uploadAvatar = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        try {
            await axios.post('/api/user/set-avatar', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            dispatch(fetchCurrentUser());
            alert("Аватар успешно обновлен!");
            setPreview("");
        } catch (error) {
            console.error("Ошибка при загрузке аватара:", error);
            alert("Ошибка при загрузке аватара");
        }
    };

    const resetAvatarSelection = () => {
        setSelectedFile(null);
        setPreview("");
        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    useEffect(() => {
        document.title = 'Настройки';
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return (
        <div className="user-settings-container">
            <h2 className="settings-main-title">Аккаунт</h2>

            {/* Карточка профиля */}
            <div className="settings-profile-card">
                <div className="profile-card-left">
                    <img
                        className='user-settings-avatar'
                        src={preview || rebuildFilePath(user?.imagePath, 0) || defaultAvatar}
                        alt="Аватар пользователя"
                    />
                    <div className="profile-meta-info">
                        <h3>{user?.username || 'Пользователь'}</h3>
                        <p>{user?.email || 'email@example.com'}</p>
                    </div>
                </div>

                <div className="avatar-upload-controls">
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={onFileChange}
                        style={{ display: 'none' }}
                    />
                    {!preview ? (
                        <label htmlFor="avatar-upload" className="btn-secondary-sm">
                            Изменить фото
                        </label>
                    ) : (
                        <div className="avatar-action-buttons">
                            <button className="btn-primary-sm" onClick={uploadAvatar}>Сохранить</button>
                            <button className="btn-ghost-sm" onClick={resetAvatarSelection}>Отмена</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Секция безопасности */}
            <div className="settings-group-box">
                {isPasswordEditing ? (
                    <div className="password-edit-form">
                        <div className="settings-input-group">
                            <label>Старый пароль</label>
                            <input
                                type="password"
                                autoComplete="off"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="settings-input-group">
                            <label>Новый пароль</label>
                            <input
                                type="password"
                                autoComplete="off"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                            />
                        </div>
                        <div className="form-action-row">
                            <button className="btn-ghost" onClick={handlePasswordCancel}>Отмена</button>
                            <button className="btn-primary" onClick={changePasswordRequest}>Обновить пароль</button>
                        </div>
                    </div>
                ) : (
                    <button type="button" className="settings-row-item" onClick={() => setIsPasswordEditing(true)}>
                        <div className="row-item-text">
                            <span>Безопасность</span>
                            <p>Изменить текущий пароль учетной записи</p>
                        </div>
                        <div className="settings-go-arrow">&#8250;</div>
                    </button>
                )}
            </div>

            {/* Секция системных настроек */}
            <div className="settings-group-box">
                <button type="button" className="settings-row-item">
                    <div className="row-item-text">
                        <span>Язык интерфейса</span>
                        <p>Русский</p>
                    </div>
                    <div className="settings-go-arrow">&#8250;</div>
                </button>

                <button type="button" className="settings-row-item">
                    <div className="row-item-text">
                        <span>Тема оформления</span>
                        <p>Темная (по умолчанию)</p>
                    </div>
                    <span className="badge-coming-soon">Скоро</span>
                </button>

                <button type="button" className="settings-row-item">
                    <div className="row-item-text">
                        <span>Частые вопросы (FAQ)</span>
                        <p>Помощь и руководство по взаимодействию с сервисом</p>
                    </div>
                    <div className="settings-go-arrow">&#8250;</div>
                </button>
            </div>

            <button type="button" className="user-settings-logout-btn" onClick={handleLogout}>
                Выйти из аккаунта
            </button>
        </div>
    );
};