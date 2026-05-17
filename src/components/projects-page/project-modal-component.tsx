import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/project-page/project-modal.css";
import { ru } from 'date-fns/locale';

type Project = {
    key: string;
    name: string;
    description: string;
    isPrivate: boolean;
    startDate: Date | null;
    expectedEndDate: Date | null;
    priority: number;
};

type Props = {
    onClose: () => void;
    onCreated: () => void;
};

const ProjectModalComponent: React.FC<Props> = ({ onClose, onCreated }) => {
    const [form, setForm] = useState<Project>({
        key: "",
        name: "",
        description: "",
        isPrivate: false,
        startDate: null,
        expectedEndDate: null,
        priority: 1,
    });

    // Функция валидации формы
    const isFormValid = useMemo(() => {
        // Проверка обязательных полей (отмечены звездочкой)
        const isNameValid = form.name.trim().length > 0;
        const isStartDateValid = form.startDate !== null;
        const isEndDateValid = form.expectedEndDate !== null;

        // Проверка, что дата начала не позже даты окончания
        let isDateRangeValid = true;
        if (form.startDate && form.expectedEndDate) {
            isDateRangeValid = form.startDate <= form.expectedEndDate;
        }

        return isNameValid && isStartDateValid && isEndDateValid && isDateRangeValid;
    }, [form.name, form.startDate, form.expectedEndDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({ ...prev, [name]: checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Дополнительная проверка перед отправкой
        if (!isFormValid) {
            console.error("Форма заполнена неверно");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const fullForm = {
                ...form,
                startDate: form.startDate ? form.startDate.toISOString() : "",
                expectedEndDate: form.expectedEndDate ? form.expectedEndDate.toISOString() : "",
            };

            const response = await fetch("/api/project/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "text/plain",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(fullForm),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            onCreated();
            onClose();
        } catch (err) {
            console.error("Ошибка при создании проекта:", err);
        }
    };

    return (
        <div className="project-modal-backdrop" onClick={onClose}>
            {/* Остановка всплытия, чтобы клик внутри модалки не закрывал её */}
            <div className="project-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Создать проект</h2>

                <form onSubmit={handleSubmit} className="project-modal-form">
                    <div className="form-element-group">
                        <label htmlFor="name">
                            Название проекта <span className="required-star">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            placeholder="Введите название"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className={form.name.trim() === "" && form.name !== "" ? "error-input" : ""}
                        />
                    </div>

                    <div className="form-element-group">
                        <label htmlFor="description">Описание</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Добавьте краткое описание проекта..."
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-element-group">
                        <label>Сроки проведения <span className="required-star">*</span></label>
                        <div className="project-modal-data-sect">
                            <div className="datepicker-wrapper">
                                <DatePicker
                                    selected={form.startDate}
                                    onChange={(date) => setForm((prev) => ({ ...prev, startDate: date }))}
                                    dateFormat="dd.MM.yyyy"
                                    locale={ru}
                                    placeholderText="Дата начала"
                                    className={`datepicker-input ${!form.startDate && form.startDate !== null ? "error-input" : ""}`}
                                />
                            </div>
                            <span className="date-separator"></span>
                            <div className="datepicker-wrapper">
                                <DatePicker
                                    selected={form.expectedEndDate}
                                    onChange={(date) => setForm((prev) => ({ ...prev, expectedEndDate: date }))}
                                    dateFormat="dd.MM.yyyy"
                                    locale={ru}
                                    placeholderText="Дата окончания"
                                    className={`datepicker-input ${!form.expectedEndDate && form.expectedEndDate !== null ? "error-input" : ""}`}
                                />
                            </div>
                        </div>
                        {form.startDate && form.expectedEndDate && form.startDate > form.expectedEndDate && (
                            <span className="error-message">Дата начала не может быть позже даты окончания</span>
                        )}
                    </div>

                    <div className="switch-container">
                        <div className="switch-text-block">
                            <span className="switch-title">Приватный проект</span>
                            <span className="switch-subtitle">Доступ только по приглашениям</span>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={form.isPrivate}
                                onChange={handleChange}
                            />
                            <span className="slider" />
                        </label>
                    </div>

                    <div className="modal-buttons">
                        <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
                        <button
                            type="submit"
                            className={`btn-submit ${!isFormValid ? "btn-disabled" : ""}`}
                            disabled={!isFormValid}
                        >
                            Создать проект
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModalComponent;