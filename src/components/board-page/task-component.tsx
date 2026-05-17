import { Calendar, Tag, Paperclip } from 'lucide-react';
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

    // Если это баг — принудительно ставим красный цвет, иначе берем системный цвет приоритета
    const priorityColor = isBug ? '#F87168' : getTaskPriorityColor(task.priority);

    const priorityKey = task.priority || 'medium';
    const priority = priorityConfig[priorityKey] || priorityConfig.medium;

    const getDueDateStatus = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: 'overdue', label: 'Просрочено' };
        if (diffDays === 0) return { color: 'today', label: 'Сегодня' };
        if (diffDays <= 3) return { color: 'soon', label: `${diffDays} дн.` };
        return { color: 'normal', label: formatDateToDayMonth(dueDate) };
    };

    const dueDateStatus = task.expectedEndDate ? getDueDateStatus(task.expectedEndDate) : null;
    const subtasks = (task as any).subtasks || { completed: 0, total: 0 };

    return (
        <div onClick={() => onCardClick?.(task)} className="task-card">
            {/* Боковой брутальный маркер */}
            <div
                className="task-priority-bar"
                style={{ backgroundColor: priorityColor }}
            />

            <div className="task-header">
                <h3 className="task-title" title={task.title}>
                    {task.title}
                </h3>
                <span className={`task-priority-badge task-priority-${priorityKey}`}>
                    {isBug ? 'Bug' : priority.label}
                </span>
            </div>

            {task.description && (
                <p className="task-description">
                    {task.description.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description}
                </p>
            )}

            {(task as any).tags && (task as any).tags.length > 0 && (
                <div className="task-tags">
                    {(task as any).tags.map((tag: string, idx: number) => (
                        <div key={idx} className="task-tag">
                            <Tag />
                            {tag}
                        </div>
                    ))}
                </div>
            )}

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
                    {dueDateStatus && (
                        <div className={`task-date-info task-date-${dueDateStatus.color}`}>
                            <Calendar />
                            <span>{dueDateStatus.label}</span>
                        </div>
                    )}

                    {(task as any).attachments && (task as any).attachments > 0 && (
                        <div className="task-attachments">
                            <Paperclip />
                            <span>{(task as any).attachments}</span>
                        </div>
                    )}
                </div>

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
                        <div className="task-avatar-fallback" title="Исполнитель не назначен">
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