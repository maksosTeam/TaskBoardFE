import { Calendar, AlertCircle, Tag, Paperclip } from 'lucide-react';
import '../../styles/board-page/task-component.css';
import { formatDateToDayMonth, getTaskPriorityColor, rebuildFilePath } from '../../utils.ts';
import { Task } from '../../pages/board-page';
import defaultAvatar from '../../assets/user-avatar.webp';

interface TaskComponentProps {
    task: Task;
    onCardClick?: (task: Task) => void;
}

const priorityConfig: Record<string, { label: string }> = {
    low: { label: 'Low' },
    medium: { label: 'Medium' },
    high: { label: 'High' },
    urgent: { label: 'Urgent' },
};

export const TaskComponent = ({ task, onCardClick }: TaskComponentProps) => {
    const isBug = task.itemTypeId === 3;
    const priorityColor = getTaskPriorityColor(task.priority);

    // Определяем конфиг приоритета на основе текста
    const priorityKey = task.priority || 'medium';
    const priority = priorityConfig[priorityKey] || priorityConfig.medium;

    const getDueDateStatus = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: 'overdue', label: 'Просрочена' };
        if (diffDays === 0) return { color: 'today', label: 'Сегодня' };
        if (diffDays <= 3) return { color: 'soon', label: `${diffDays} дн.` };
        return { color: 'normal', label: formatDateToDayMonth(dueDate) };
    };

    const dueDateStatus = task.expectedEndDate ? getDueDateStatus(task.expectedEndDate) : null;

    // Подсчёт сабтасков (если есть в задаче)
    const subtasks = (task as any).subtasks || { completed: 0, total: 0 };

    return (
        <div
            onClick={() => onCardClick?.(task)}
            className="task-card"
        >
            {/* Цветная полоска приоритета/бага сверху */}
            <div
                className="task-priority-bar"
                style={{ backgroundColor: isBug ? '#F87168' : priorityColor }}
            />

            <div className="task-header">
                <h3 className="task-title" title={task.title}>
                    {task.title}
                </h3>

                {/* Бейдж приоритета */}
                <span
                    className={`task-priority-badge task-priority-${priorityKey}`}
                >
                    {priority.label}
                </span>
            </div>

            {/* Описание (если есть) */}
            {task.description && (
                <p className="task-description">
                    {task.description.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description}
                </p>
            )}

            {/* Теги (если есть) */}
            {(task as any).tags && (task as any).tags.length > 0 && (
                <div className="task-tags">
                    {(task as any).tags.map((tag: string, idx: number) => (
                        <div key={idx} className="task-tag">
                            <Tag className="size-3" />
                            {tag}
                        </div>
                    ))}
                </div>
            )}

            {/* Прогресс сабтасков (если есть) */}
            {subtasks.total > 0 && (
                <div className="task-subtasks">
                    <div className="task-subtasks-header">
                        <span className="task-subtasks-label">Подзадачи</span>
                        <span className="task-subtasks-count">
                            {subtasks.completed}/{subtasks.total}
                        </span>
                    </div>
                    <div className="task-progress-bar">
                        <div
                            className="task-progress-fill"
                            style={{ width: `${(subtasks.completed / subtasks.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="task-footer">
                <div className="task-footer-left">
                    {/* Дата с визуальным статусом */}
                    {dueDateStatus && (
                        <div className={`task-date-info task-date-${dueDateStatus.color}`}>
                            <Calendar className="size-3" />
                            <span>{dueDateStatus.label}</span>
                        </div>
                    )}

                    {/* Вложения (если есть) */}
                    {(task as any).attachments && (task as any).attachments > 0 && (
                        <div className="task-attachments">
                            <Paperclip className="size-3" />
                            <span>{(task as any).attachments}</span>
                        </div>
                    )}
                </div>

                {/* Аватарки исполнителей */}
                <div className="task-avatars">
                    {task?.contributors?.length > 0 ? (
                        task.contributors.slice(0, 3).map((user, idx) => (
                            <div key={idx} className="task-avatar" title={user.userName}>
                                <img
                                    src={user.imagePath ? rebuildFilePath(user.imagePath, 0) : defaultAvatar}
                                    alt={user.userName || 'Аватар'}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="task-avatar-fallback" title="Нет исполнителя">
                            ?
                        </div>
                    )}
                    {task.contributors?.length > 3 && (
                        <div className="task-avatar-more">
                            +{task.contributors.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};