import { useState, useEffect } from "react";
import axios from "axios";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import '../../styles/project-page/project-settings-form.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {ru} from "date-fns/locale";

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
            navigate('/home'); // переход на главную
        } catch (err) {
            setError("Не удалось удалить проект.");
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (typeof form.startDate === "string") {
            setForm((prev) => ({
                ...prev,
                startDate: new Date(prev.startDate),
                expectedEndDate: new Date(prev.expectedEndDate),
            }));
        }
    }, []);

    return (
        <div className="project-settings-form-container">
            <h3>Настройки проекта</h3>
            <form className="project-settings-form" onSubmit={handleSubmit}>
                <label>
                    Название
                    <input
                        value={form.name}
                        onChange={e => handleChange("name", e.target.value)}
                    />
                </label>

                <label>
                    Ключ проекта
                    <input
                        value={form.key}
                        onChange={e => handleChange("key", e.target.value)}
                    />
                </label>

                <label>
                    Описание
                    <textarea
                        value={form.description}
                        onChange={e => handleChange("description", e.target.value)}
                    />
                </label>
                <div className="project-settings-data-sect">
                <label>
                    Начало
                    <DatePicker
                        selected={form.startDate instanceof Date ? form.startDate : new Date(form.startDate)}
                        onChange={(date: Date) => handleChange("startDate", date)}
                        dateFormat="dd.MM.yyyy"
                        locale={ru}
                        placeholderText="Дата начала"
                        className="project-settings-datepicker-input"
                    />
                </label>

                <label>
                    Окончание
                    <DatePicker
                        selected={form.expectedEndDate instanceof Date ? form.expectedEndDate : new Date(form.expectedEndDate)}
                        onChange={(date: Date) => handleChange("expectedEndDate", date)}
                        dateFormat="dd.MM.yyyy"
                        locale={ru}
                        placeholderText="Дата окончания"
                        className="project-settings-datepicker-input"
                    />
                </label>
                </div>
                <div className="project-settings-switch-container">
                    <span>Приватный:</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="isPrivate"
                            checked={form.isPrivate}
                            onChange={e => handleChange("isPrivate", e.target.checked)}
                        />
                        <span className="slider" />
                    </label>
                </div>

                <label className="project-settings-select-label">
                    Статус
                    <select
                        className="project-settings-select"
                        value={form.priority}
                        onChange={e => handleChange("priority", Number(e.target.value))}
                    >
                        <option value={0}>Не активен</option>
                        <option value={1}>В работе</option>
                        <option value={2}>Завершён</option>
                    </select>
                </label>

                <button className="project-settings-submit-btn" type="submit" disabled={loading}>
                    {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>

                <button
                    type="button"
                    className="project-settings-delete-btn"
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={deleting}
                >
                    Удалить проект
                </button>

                {success && <p className="success">Изменения сохранены!</p>}
                {error && <p className="error">{error}</p>}
            </form>

            {showConfirmDelete && (
                <div className="project-settings-modal-overlay">
                    <div className="project-settings-modal">
                        <p>Вы уверены, что хотите удалить проект {project.name}?</p>
                        <div className="modal-buttons">
                            <button
                                onClick={handleDelete}
                                className="project-settings-confirm-delete-btn"
                                disabled={deleting}
                            >
                                {deleting ? "Удаление..." : "Удалить"}
                            </button>
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="project-settings-cancel-delete-btn"
                                disabled={deleting}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
