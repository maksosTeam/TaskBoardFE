import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser } from "../store/userSlice";
import '../styles/user-settings-page.css';
import defaultAvatar from '../assets/user-avatar.webp';
import {rebuildFilePath} from "../utils.ts";

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
            const response = await axios.post(
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
        } catch (error) {
            console.log("Ошибка при отправке запроса: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(
                '/api/auth/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Очищаем токен и перенаправляем на главную
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


    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        // Создание превью для отображения
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Загрузка аватара на сервер
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

            // Обновляем данные пользователя после успешной загрузки
            dispatch(fetchCurrentUser());
            alert("Аватар успешно обновлен!");
            setPreview(""); // Сбрасываем превью
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
        <div className="user-settings">
            <h2>Аккаунт</h2>
            <div className="user-settings-pic-sect">
                    <img
                        className='user-settings-avatar'
                        src={preview || rebuildFilePath(user?.imagePath, 0) || defaultAvatar}
                        alt="Аватар пользователя"
                    />
                    <span>{user?.username || ''}</span>
                    <span>{user?.email || ''}</span>
            </div>
            <div className="settings-sect-2">
                <div className="avatar-upload-controls" >
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={onFileChange}
                        style={{ display: 'none' }}
                    />
                    {!preview && (<label htmlFor="avatar-upload" className="settings-sub-tab" style={{width:'660px'}}>
                        Выбрать фото профиля
                    </label>)}
                    {preview && (
                        <div className="settings-sub-tab-container">
                            <button onClick={uploadAvatar} >
                                Сохранить
                            </button>
                            <button onClick={resetAvatarSelection}>
                                Отмена
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-sect">
                {isPasswordEditing ? (
                    <div className="email-confirmation-container">
                        <div>
                            <p>Старый пароль:</p>
                            <input className="email-confirmation-input"
                                   type="password"
                                   autoComplete="off"
                                   value={oldPassword}
                                   onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <p>Новый пароль:</p>
                            <input className="email-confirmation-input"
                                   type="password"
                                   autoComplete="off"
                                   value={newPassword}
                                   onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="email-edit-actions">
                            <button onClick={changePasswordRequest}>Подтвердить</button>
                            <button onClick={handlePasswordCancel}>Отмена</button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="settings-sub-tab settings-sub-tab-password"
                        onClick={() => setIsPasswordEditing(true)}
                    >
                        <p>Пароль</p>
                        <div className="settings-go">&#8250;</div>
                    </button>
                )}
            </div>
            <div className="settings-sect-2">
                <button className="settings-sub-tab">
                    <div>
                        <span>Язык</span>
                        <p>Русский</p>
                    </div>
                    <div className="settings-go">&#8250;</div>
                </button>
                <button className="settings-sub-tab">
                    <div>
                        <span>Изменить тему оформления</span>
                        <p>Скоро</p>
                    </div>
                    <div className="settings-go">&#8250;</div>
                </button>
                <button className="settings-sub-tab">
                    <div>
                        <span>Частые вопросы</span>
                        <p>О взаимодейсвтии с сервисом</p>
                    </div>
                    <div className="settings-go">&#8250;</div>
                </button>
            </div>
            <button className="user-settings-logout" onClick={handleLogout}>Выйти</button>
        </div>
    );
};
