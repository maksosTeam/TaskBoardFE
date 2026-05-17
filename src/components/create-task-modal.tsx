import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
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

const PRIORITIES = [
    { value: 0, label: 'Очень низкий', color: '#64748B', emoji: '😌' },
    { value: 1, label: 'Низкий', color: '#4ADE80', emoji: '📝' },
    { value: 2, label: 'Средний', color: '#60A5FA', emoji: '⚡' },
    { value: 3, label: 'Высокий', color: '#FB923C', emoji: '🔥' },
    { value: 4, label: 'Критический', color: '#F87171', emoji: '🚨' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
                                                                    projectId,
                                                                    boardId,
                                                                    statusId,
                                                                    isOpen,
                                                                    onClose,
                                                                    onTaskCreated
                                                                }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        expectedEndDate: today,
        priority: 2,
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [titleLength, setTitleLength] = useState(0);
    const [aiLoadingTitle, setAiLoadingTitle] = useState(false);
    const [aiLoadingDescription, setAiLoadingDescription] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                description: '',
                expectedEndDate: today,
                priority: 2,
            });
            setError(null);
            setTitleLength(0);
        }
    }, [isOpen, today]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Пожалуйста, введите название задачи');
            return;
        }

        if (formData.title.length > 100) {
            setError('Название не должно превышать 100 символов');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        const payload = {
            item: {
                id: 0,
                parentId: null,
                projectId: Number(projectId),
                projectItemNumber: 0,
                businessId: "",
                title: formData.title.trim(),
                description: formData.description.trim(),
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

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Ошибка при создании задачи');
            }

            onTaskCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при создании задачи');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'title') {
            if (value.length <= 100) {
                setFormData((prev) => ({ ...prev, [name]: value }));
                setTitleLength(value.length);
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePrioritySelect = (priority: number) => {
        setFormData((prev) => ({ ...prev, priority }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    const handleAiImprove = async (
        field: 'title' | 'description',
        mode: 'paraphrase' | 'elaborate' = 'paraphrase'
    ) => {
        const fieldName = field === 'title' ? 'название' : 'описание';
        const text = field === 'title' ? formData.title : formData.description;

        if (!text.trim()) {
            setError(`Пожалуйста, введите ${fieldName} перед использованием AI`);
            return;
        }

        const setLoading = field === 'title' ? setAiLoadingTitle : setAiLoadingDescription;
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/ai/create?text=${encodeURIComponent(text)}&mode=${mode}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Ошибка при обработке текста: ${response.status}`);
            }

            const result = await response.text();
            setFormData((prev) => ({ ...prev, [field]: result }));

            if (field === 'title') {
                setTitleLength(result.length);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при обработке текста AI');
        } finally {
            setLoading(false);
        }
    };

    const getCharCounterClass = () => {
        if (titleLength >= 90) return 'danger';
        if (titleLength >= 70) return 'warning';
        return '';
    };

    if (!isOpen) return null;

    const selectedPriority = PRIORITIES.find(p => p.value === formData.priority);

    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="task-modal-header">
                    <h2 className="task-modal-title">Создать задачу</h2>
                    <button className="task-modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="task-modal-form" onKeyDown={handleKeyDown}>
                    <div className="task-form-group">
                        <label className="task-form-label">
                            Название <span>*</span>
                        </label>
                        <div className="task-input-wrapper">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="task-form-input"
                                placeholder="Например: Реализовать авторизацию"
                                autoFocus
                            />
                            {formData.title.length > 5 && (
                                <div className="ai-buttons-group">
                                    <button
                                        type="button"
                                        onClick={() => handleAiImprove('title', 'paraphrase')}
                                        disabled={aiLoadingTitle || isSubmitting}
                                        className="ai-btn ai-btn-paraphrase"
                                        title="Перефразировать текст"
                                    >
                                        <Sparkles size={16} />
                                        {aiLoadingTitle ? 'Обработка...' : 'Переф.'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAiImprove('title', 'elaborate')}
                                        disabled={aiLoadingTitle || isSubmitting}
                                        className="ai-btn ai-btn-elaborate"
                                        title="Расписать подробнее"
                                    >
                                        <Sparkles size={16} />
                                        {aiLoadingTitle ? 'Обработка...' : 'Расписать'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`char-counter ${getCharCounterClass()}`}>
                            {titleLength}/100 символов
                        </div>
                    </div>

                    <div className="task-form-group">
                        <label className="task-form-label">Описание</label>
                        <div className="task-input-wrapper">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="task-form-textarea"
                                placeholder="Опишите детали задачи..."
                            />
                            {formData.description.length > 15 && (
                                <div className="ai-buttons-group">
                                    <button
                                        type="button"
                                        onClick={() => handleAiImprove('description', 'paraphrase')}
                                        disabled={aiLoadingDescription || isSubmitting}
                                        className="ai-btn ai-btn-paraphrase"
                                        title="Перефразировать текст"
                                    >
                                        <Sparkles size={16} />
                                        {aiLoadingDescription ? 'Обработка...' : 'Переф.'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAiImprove('description', 'elaborate')}
                                        disabled={aiLoadingDescription || isSubmitting}
                                        className="ai-btn ai-btn-elaborate"
                                        title="Расписать подробнее"
                                    >
                                        <Sparkles size={16} />
                                        {aiLoadingDescription ? 'Обработка...' : 'Расписать'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="task-form-group">
                        <label className="task-form-label">Дедлайн</label>
                        <div className="date-input-wrapper">
                            <input
                                type="date"
                                name="expectedEndDate"
                                value={formData.expectedEndDate}
                                onChange={handleChange}
                                required
                                className="task-form-input"
                                min={today}
                            />
                        </div>
                    </div>

                    <div className="task-form-group">
                        <label className="task-form-label">Приоритет</label>
                        <div className="priority-buttons">
                            {PRIORITIES.map((priority) => (
                                <button
                                    key={priority.value}
                                    type="button"
                                    data-priority={priority.value}
                                    className={`priority-btn ${formData.priority === priority.value ? 'active' : ''}`}
                                    onClick={() => handlePrioritySelect(priority.value)}
                                >{priority.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="task-form-error">{error}</div>}

                    <div className="task-form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="task-form-btn task-btn-cancel"
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.title.trim()}
                            className="task-form-btn task-btn-submit"
                        >
                            {isSubmitting ? 'Создание...' : 'Создать задачу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};