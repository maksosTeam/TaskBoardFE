import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser } from "../store/userSlice";
import '../styles/user-settings-page.css';
import defaultAvatar from '../assets/user-avatar.webp';
import { rebuildFilePath } from "../utils.ts";
import {
    User,
    Lock,
    Globe,
    Palette,
    HelpCircle,
    LogOut,
    ChevronRight,
    Camera,
    X,
    Check,
    Shield,
    Mail,
    AlertCircle
} from 'lucide-react';

export const UserSettings = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);

    const changePasswordRequest = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordError("Пароли не совпадают");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Пароль должен содержать минимум 6 символов");
            return;
        }

        setPasswordError("");
        setChangingPassword(true);

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
            setConfirmPassword("");
        } catch (error: any) {
            console.log("Ошибка при отправке запроса: " + error.message);
            setPasswordError("Неверный текущий пароль");
        } finally {
            setChangingPassword(false);
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
        setConfirmPassword("");
        setPasswordError("");
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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
        setUploading(true);

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
            setSelectedFile(null);
        } catch (error) {
            console.error("Ошибка при загрузке аватара:", error);
            alert("Ошибка при загрузке аватара");
        } finally {
            setUploading(false);
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
            <div className="settings-header">
                <h1 className="settings-main-title">Настройки аккаунта</h1>
                <p className="settings-subtitle">Управление профилем и безопасностью</p>
            </div>

            {/* Карточка профиля */}
            <div className="settings-profile-card">
                <div className="profile-card-left">
                    <div className="avatar-container">
                        <img
                            className='user-settings-avatar'
                            src={preview || rebuildFilePath(user?.imagePath, 0) || defaultAvatar}
                            alt="Аватар пользователя"
                        />
                        <label htmlFor="avatar-upload" className="avatar-upload-overlay">
                            <Camera size={16} />
                        </label>
                    </div>
                    <div className="profile-meta-info">
                        <h3>{user?.username || 'Пользователь'}</h3>
                        <div className="profile-email">
                            <Mail size={14} />
                            <p>{user?.email || 'email@example.com'}</p>
                        </div>
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
                            <Camera size={14} />
                            Изменить фото
                        </label>
                    ) : (
                        <div className="avatar-action-buttons">
                            <button className="btn-primary-sm" onClick={uploadAvatar} disabled={uploading}>
                                {uploading ? "Загрузка..." : <><Check size={14} /> Сохранить</>}
                            </button>
                            <button className="btn-ghost-sm" onClick={resetAvatarSelection}>
                                <X size={14} /> Отмена
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Секция безопасности */}
            <div className="settings-group-box">
                <div className="settings-group-header">
                    <Shield size={18} />
                    <span>Безопасность</span>
                </div>

                {isPasswordEditing ? (
                    <div className="password-edit-form">
                        <div className="settings-input-group">
                            <label>Текущий пароль</label>
                            <input
                                type="password"
                                autoComplete="off"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Введите текущий пароль"
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
                        <div className="settings-input-group">
                            <label>Подтверждение пароля</label>
                            <input
                                type="password"
                                autoComplete="off"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите новый пароль"
                            />
                        </div>
                        {passwordError && (
                            <div className="password-error">
                                <AlertCircle size={14} />
                                {passwordError}
                            </div>
                        )}
                        <div className="form-action-row">
                            <button className="btn-ghost" onClick={handlePasswordCancel}>Отмена</button>
                            <button className="btn-primary" onClick={changePasswordRequest} disabled={changingPassword}>
                                {changingPassword ? "Сохранение..." : "Обновить пароль"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button type="button" className="settings-row-item" onClick={() => setIsPasswordEditing(true)}>
                        <div className="row-item-icon">
                            <Lock size={18} />
                        </div>
                        <div className="row-item-text">
                            <span>Изменить пароль</span>
                            <p>Обновление пароля для безопасности аккаунта</p>
                        </div>
                        <ChevronRight size={18} className="settings-go-arrow" />
                    </button>
                )}
            </div>

            {/* Секция настроек интерфейса */}
            <div className="settings-group-box">
                <div className="settings-group-header">
                    <Palette size={18} />
                    <span>Внешний вид</span>
                </div>

                <button type="button" className="settings-row-item">
                    <div className="row-item-icon">
                        <Globe size={18} />
                    </div>
                    <div className="row-item-text">
                        <span>Язык интерфейса</span>
                        <p>Русский</p>
                    </div>
                    <div className="settings-go-arrow">
                        <ChevronRight size={18} />
                    </div>
                </button>

                <button type="button" className="settings-row-item disabled">
                    <div className="row-item-icon">
                        <Palette size={18} />
                    </div>
                    <div className="row-item-text">
                        <span>Тема оформления</span>
                        <p>Темная (по умолчанию)</p>
                    </div>
                    <span className="badge-coming-soon">Скоро</span>
                </button>
            </div>

            {/* Секция помощи */}
            <div className="settings-group-box">
                <div className="settings-group-header">
                    <HelpCircle size={18} />
                    <span>Помощь</span>
                </div>

                <button type="button" className="settings-row-item">
                    <div className="row-item-icon">
                        <HelpCircle size={18} />
                    </div>
                    <div className="row-item-text">
                        <span>Частые вопросы (FAQ)</span>
                        <p>Помощь и руководство по взаимодействию с сервисом</p>
                    </div>
                    <div className="settings-go-arrow">
                        <ChevronRight size={18} />
                    </div>
                </button>
            </div>

            {/* Кнопка выхода */}
            <button type="button" className="user-settings-logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
                Выйти из аккаунта
            </button>
        </div>
    );
};