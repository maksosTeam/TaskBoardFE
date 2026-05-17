import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, useEffect, useState } from "react";
import { GripVertical, MoreVertical, Archive, Trash2, Bug, UserPlus, X } from "lucide-react";
import { TaskComponent } from "./task-component";
import { Task } from "../../pages/board-page";
import '../../styles/board-page/sortable-task.css';
import {rebuildFilePath} from "../../utils.ts";

interface SortableTaskProps {
    task: Task;
    activeId: string | null;
    onClick: () => void;
    onTasksChange: () => void;
}

export const SortableTask = ({ task, activeId, onClick, onTasksChange }: SortableTaskProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'task',
            task
        }
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [projectUsers, setProjectUsers] = useState<User[]>([]);
    const [isArchiving, setIsArchiving] = useState(false);

    const token = localStorage.getItem('token');

    const fetchProjectUsers = async () => {
        try {
            const response = await fetch(`/api/project/get-users-in-project/${task.projectId}`, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProjectUsers(data);
            } else {
                alert("Не удалось получить список пользователей проекта");
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка при получении пользователей");
        }
    };

    const handleDeleteTask = async () => {
        try {
            const response = await fetch(`/api/item/delete/${task.id}`, {
                method: 'DELETE',
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                onTasksChange();
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка запроса');
        }
        setIsConfirmDeleteOpen(false);
        setIsMenuOpen(false);
    };

    const handleArchiveTask = async () => {
        setIsArchiving(true);
        try {
            const response = await fetch(`/api/item/archive/${task.id}`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isArchived: true })
            });

            if (response.ok) {
                onTasksChange();
            } else {
                alert("Не удалось заархивировать задачу");
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка запроса');
        }
        setIsArchiving(false);
        setIsMenuOpen(false);
    };

    const handleAssignUser = async (userId: number) => {
        try {
            const response = await fetch(`/api/item/add-user-to-item/${task.id}`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: userId.toString(),
            });

            if (response.ok) {
                onTasksChange();
            } else {
                alert("Не удалось назначить исполнителя");
            }
            setIsUserListOpen(false);
            setIsMenuOpen(false);
        } catch (error) {
            console.error(error);
            alert('Ошибка запроса');
        }
    };

    const handleRemoveUser = async (userId: number) => {
        try {
            const response = await fetch(`/api/item/remove-user-from-item/${task.id}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: userId.toString(),
            });

            if (response.ok) {
                onTasksChange();
            } else {
                alert("Не удалось снять исполнителя");
            }
            setIsMenuOpen(false);
        } catch (error) {
            console.error(error);
            alert('Ошибка запроса');
        }
    };

    const markAsBug = async () => {
        try {
            const newItemTypeId = task.itemTypeId === 3 ? 1 : 3;
            const response = await fetch(`/api/item/change-itemType/${task.id}`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: newItemTypeId.toString(),
            });
            if (response.ok) {
                onTasksChange();
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка запроса');
        }
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const modalElements = document.querySelectorAll(
                '.task-menu, .confirm-modal-overlay, .user-list-modal'
            );

            let isClickInside = false;
            modalElements.forEach(modal => {
                if (modal.contains(target)) {
                    isClickInside = true;
                }
            });

            if (!isClickInside) {
                setIsMenuOpen(false);
                setIsUserListOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div ref={setNodeRef} style={style} className="sortable-task-wrapper">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="drag-handle" title="Переместить задачу">
                    <GripVertical size={16} />
                </div>

                {/* Menu Button */}
                <div className="task-menu-wrapper">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                            setIsUserListOpen(false);
                        }}
                        className="task-menu-button"
                        title="Действия"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {isMenuOpen && (
                        <div className="task-menu" onClick={e => e.stopPropagation()}>
                            {!task.contributors?.length && (
                                <button
                                    onClick={async () => {
                                        await fetchProjectUsers();
                                        setIsUserListOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <UserPlus size={14} />
                                    Назначить исполнителя
                                </button>
                            )}

                            {task.contributors?.length > 0 && (
                                <button
                                    onClick={() => handleRemoveUser(task.contributors[0].userId)}
                                    className="danger"
                                >
                                    <UserPlus size={14} />
                                    Снять исполнителя
                                </button>
                            )}

                            <button onClick={handleArchiveTask} disabled={isArchiving}>
                                <Archive size={14} />
                                {isArchiving ? "Архивация..." : "Заархивировать"}
                            </button>

                            <button onClick={markAsBug}>
                                <Bug size={14} />
                                {task.itemTypeId === 3 ? "Убрать отметку баг" : "Отметить как баг"}
                            </button>

                            <button onClick={() => setIsConfirmDeleteOpen(true)} className="danger">
                                <Trash2 size={14} />
                                Удалить задачу
                            </button>
                        </div>
                    )}

                    {isUserListOpen && (
                        <div className="user-list-modal" onClick={e => e.stopPropagation()}>
                            <div className="user-list-header">
                                <h4>Выбрать исполнителя</h4>
                                <button onClick={() => setIsUserListOpen(false)} className="close-btn">
                                    <X size={14} />
                                </button>
                            </div>
                            <ul>
                                {projectUsers.map(user => (
                                    <li key={user.userId}>
                                        <button onClick={() => handleAssignUser(user.userId)}>
                                            <img
                                                src={user.imagePath ? rebuildFilePath(user.imagePath, 0) : "./assets/images/user.png"}
                                                alt={user.userName}
                                            />
                                            <span>{user.userName}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Task Card */}
                <div onClick={onClick} className="task-click-area">
                    <TaskComponent task={task} onCardClick={onClick} />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isConfirmDeleteOpen && (
                <div className="confirm-modal-overlay" onClick={() => setIsConfirmDeleteOpen(false)}>
                    <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="confirm-modal-icon">
                            <Trash2 size={32} color="#F87168" />
                        </div>
                        <h3>Удалить задачу?</h3>
                        <p>Это действие нельзя отменить. Задача будет удалена безвозвратно.</p>
                        <div className="confirm-actions">
                            <button className="btn-secondary" onClick={() => setIsConfirmDeleteOpen(false)}>
                                Отмена
                            </button>
                            <button className="btn-danger" onClick={handleDeleteTask}>
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};