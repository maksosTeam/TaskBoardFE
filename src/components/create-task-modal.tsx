import React, { useState } from 'react';
import '../styles/create-task-modal.css';

interface CreateTaskModalProps {
    projectId: string;
    boardId: string;
    statusId: number;
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
}

interface TaskFormData {
    title: string;
    description: string;
    expectedEndDate: string;
    priority: number;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({projectId, boardId, statusId, isOpen, onClose, onTaskCreated }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        expectedEndDate: today,
        priority: 2,
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const payload = {
            item: {
                id: 0,
                parentId: null,
                projectId: Number(projectId),
                projectItemNumber: 0,
                businessId: "",
                title: formData.title,
                description: formData.description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                startDate: new Date().toISOString(),
                expectedEndDate: new Date(formData.expectedEndDate).toISOString(),
                priority: formData.priority,
                itemTypeId: 1,
                statusId: statusId,
                isArchived: false,
                status: {
                    id: statusId,
                    name: "",
                    boardId: Number(boardId),
                    order: 0,
                    isDone: false,
                    isRejected: false
                },
            },
            boardId: Number(boardId),
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/item/create', {
                method: 'POST',
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            console.log(payload);

            if (!response.ok) {
                throw new Error('Ошибка при создании задачи');
            }

            onTaskCreated();
            onClose();
            setFormData({
                title: '',
                description: '',
                expectedEndDate: today,
                priority: 2,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="task-modal-overlay">
            <div className="task-modal-container">
                <h2 className="task-modal-title">Создать задачу</h2>
                <form onSubmit={handleSubmit} className="task-modal-form">
                    <div className="task-form-group">
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="task-form-input"
                            placeholder="Введите название задачи"
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="task-form-textarea"
                            placeholder="Введите описание задачи"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="expectedEndDate" className="task-form-label">
                            Дедлайн
                        </label>
                        <input
                            type="date"
                            id="expectedEndDate"
                            name="expectedEndDate"
                            value={formData.expectedEndDate}
                            onChange={handleChange}
                            required
                            className="task-form-input"
                        />
                    </div>

                    <div className="task-form-group">
                        <label htmlFor="priority" className="task-form-label">
                            Приоритет
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="task-form-select"
                        >
                            <option value={0}>Очень низкий</option>
                            <option value={1}>Низкий</option>
                            <option value={2}>Средний</option>
                            <option value={3}>Высокий</option>
                            <option value={4}>Критический</option>
                        </select>
                    </div>

                    {error && <p className="task-form-error">{error}</p>}

                    <div className="task-form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="task-form-btn task-btn-cancel"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="task-form-btn task-btn-submit"
                        >
                            {isSubmitting ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
