import { useState, useEffect } from "react";
import axios from "axios";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import '../../styles/project-page/project-settings-form.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";

interface UserProject {
    id: number;
    userId: number;
    projectId: number;
    privilege: number;
    roleId: number;
    project: null;
    role: {
        id: number;
        role: string;
    };
}

interface ProjectData {
    id: number;
    key: string;
    name: string;
    description: string;
    isPrivate: boolean;
    startDate: string;
    updateDate: string;
    expectedEndDate: string;
    head: string;
    priority: number;
    status: string;
    userProjects: UserProject[];
}

interface Props {
    project: ProjectData;
    onUpdate: (updated: ProjectData) => void;
}

export const ProjectSettingsForm = ({ project, onUpdate }: Props) => {
    const [form, setForm] = useState<ProjectData>(project);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (field: keyof ProjectData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/project/change-params`, {
                ...form,
                updateDate: formatISO(new Date()),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            onUpdate(form);
            setSuccess(true);
        } catch (err) {
            setError("Ошибка при сохранении изменений.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/project/delete/${project.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            navigate('/home');
        } catch (err) {
            setError("Не удалось удалить проект.");
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (typeof form.startDate === "string") {
            setForm((prev) => ({
                ...prev,
                startDate: new Date(prev.startDate) as any,
                expectedEndDate: new Date(prev.expectedEndDate) as any,
            }));
        }
    }, []);

    return (
        <div className="project-settings-form-container">
            <h3 className="project-settings-title">Настройки проекта</h3>

            <form className="project-settings-form" onSubmit={handleSubmit}>

                {/* Ряд: Название + Ключ */}
                <div className="project-settings-grid-row">
                    <div className="project-form-field">
                        <label htmlFor="project-name">Название проекта</label>
                        <input
                            id="project-name"
                            value={form.name}
                            onChange={e => handleChange("name", e.target.value)}
                            placeholder="Введите название"
                            required
                        />
                    </div>

                    <div className="project-form-field">
                        <label htmlFor="project-key">Ключ проекта</label>
                        <input
                            id="project-key"
                            value={form.key}
                            onChange={e => handleChange("key", e.target.value)}
                            placeholder="Например, PRJ"
                            required
                        />
                    </div>
                </div>

                {/* Описание */}
                <div className="project-form-field">
                    <label htmlFor="project-desc">Описание</label>
                    <textarea
                        id="project-desc"
                        rows={4}
                        value={form.description}
                        onChange={e => handleChange("description", e.target.value)}
                        placeholder="Краткое описание целей и задач проекта..."
                    />
                </div>

                {/* Ряд: Даты начала и окончания */}
                <div className="project-settings-grid-row">
                    <div className="project-form-field">
                        <label>Дата начала</label>
                        <DatePicker
                            selected={form.startDate instanceof Date ? form.startDate : new Date(form.startDate)}
                            onChange={(date: Date) => handleChange("startDate", date)}
                            dateFormat="dd.MM.yyyy"
                            locale={ru}
                            placeholderText="Выберите дату"
                            className="project-settings-datepicker-input"
                        />
                    </div>

                    <div className="project-form-field">
                        <label>Дата окончания</label>
                        <DatePicker
                            selected={form.expectedEndDate instanceof Date ? form.expectedEndDate : new Date(form.expectedEndDate)}
                            onChange={(date: Date) => handleChange("expectedEndDate", date)}
                            dateFormat="dd.MM.yyyy"
                            locale={ru}
                            placeholderText="Выберите дату"
                            className="project-settings-datepicker-input"
                        />
                    </div>
                </div>

                {/* Селектор Статуса */}
                <div className="project-form-field">
                    <label htmlFor="project-status">Текущий статус</label>
                    <div className="select-wrapper">
                        <select
                            id="project-status"
                            className="project-settings-select"
                            value={form.priority}
                            onChange={e => handleChange("priority", Number(e.target.value))}
                        >
                            <option value={0}>Не активен</option>
                            <option value={1}>В работе</option>
                            <option value={2}>Завершён</option>
                        </select>
                    </div>
                </div>

                {/* Переключатель приватности */}
                <div className="project-settings-switch-container">
                    <div className="switch-text">
                        <span>Приватный проект</span>
                        <p>Ограничить доступ к проекту только для участников</p>
                    </div>
                    <label className="project-custom-switch">
                        <input
                            type="checkbox"
                            checked={form.isPrivate}
                            onChange={e => handleChange("isPrivate", e.target.checked)}
                        />
                        <span className="project-custom-slider" />
                    </label>
                </div>

                {/* Блок уведомлений об операциях */}
                {success && <div className="project-status-message msg-success">Изменения успешно сохранены!</div>}
                {error && <div className="project-status-message msg-error">{error}</div>}

                {/* Кнопки управления */}
                <div className="project-settings-actions-zone">
                    <button
                        type="button"
                        className="btn-destructive-outline"
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={deleting}
                    >
                        Удалить проект
                    </button>
                    <button
                        type="submit"
                        className="btn-accent-primary"
                        disabled={loading}
                    >
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </button>
                </div>
            </form>

            {/* Модальное окно подтверждения */}
            {showConfirmDelete && (
                <div className="project-settings-modal-overlay">
                    <div className="project-settings-modal">
                        <h4>Удаление проекта</h4>
                        <p>Вы уверены, что хотите безвозвратно удалить проект <strong>{project.name}</strong>? Это действие нельзя будет отменить.</p>
                        <div className="project-settings-modal-buttons">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="btn-modal-cancel"
                                disabled={deleting}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-modal-confirm-delete"
                                disabled={deleting}
                            >
                                {deleting ? "Удаление..." : "Да, удалить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};