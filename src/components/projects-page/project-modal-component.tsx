import { useState } from "react";
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="project-modal-backdrop">
            <div className="project-modal">
                <h2>Создать проект</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Название" value={form.name} onChange={handleChange} required />
                    <textarea name="description" placeholder="Описание" value={form.description} onChange={handleChange} />
                    <div className="project-modal-data-sect">
                        <DatePicker
                            selected={form.startDate}
                            onChange={(date) => setForm((prev) => ({ ...prev, startDate: date }))}
                            dateFormat="dd.MM.yyyy"
                            locale={ru}
                            placeholderText="Дата начала"
                            className="datepicker-input"
                        />
                        <p>—</p>
                        <DatePicker
                            selected={form.expectedEndDate}
                            onChange={(date) => setForm((prev) => ({ ...prev, expectedEndDate: date }))}
                            dateFormat="dd.MM.yyyy"
                            locale={ru}
                            placeholderText="Дата окончания"
                            className="datepicker-input"
                        />
                    </div>
                    <div className="switch-container">
                        <span>Приватный:</span>
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
                        <button type="submit">Создать</button>
                        <button type="button" onClick={onClose}>Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModalComponent;
