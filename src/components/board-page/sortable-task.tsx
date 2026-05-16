import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskComponent } from "./task-component";
import { Task } from "../../pages/board-page";
import { CSSProperties, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import defaultAvatar from "../../assets/user-avatar.webp"
import {rebuildFilePath} from "../../utils.ts";

import MenuIcon from '../../assets/menu.svg';
import '../../styles/board-page/sortable-task.css';

interface User {
    id: number;
    username: string;
    imagePath: string;
    email: string;
    role: string;
}

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
    } = useSortable({ id: task.id });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: task.id === activeId ? 0.3 : 1,
        position: "relative",
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [projectUsers, setProjectUsers] = useState<User[]>([]);

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
        } catch (error) {
            console.error(error);
            alert('Ошибка запроса');
        }
        setIsUserListOpen(false);
        setIsMenuOpen(false);
    };

    const markAsBug = async () => {
        try {
            const newItemTypeId = task.itemTypeId === 3 ? 1 : 3; // Если уже баг (3), ставим 1 (обычная задача)
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
            const modalElements = document.querySelectorAll(
                '.task-menu-modal, .confirm-modal, .user-list-modal'
            );

            let isClickInside = false;
            modalElements.forEach(modal => {
                if (modal.contains(event.target as Node)) {
                    isClickInside = true;
                }
            });

            if (!isClickInside) {
                setIsMenuOpen(false);
                setIsConfirmDeleteOpen(false);
                setIsUserListOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={setNodeRef} style={style} className="sortable-task">
            <div {...attributes} {...listeners} className="drag-handle" title="Переместить">
                <GripVertical size={14} color="#b6b6b6" />
            </div>

            <div className="task-menu-wrapper">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="task-menu-button"
                >
                    <img src={MenuIcon} alt="Меню" />
                </button>

                {isMenuOpen && (
                    <div className="task-menu-modal">
                        <button onClick={() => setIsConfirmDeleteOpen(true)}>Удалить задачу</button>
                        {!task?.contributors?.[0]?.userName && (<button
                            onClick={async () => {
                                await fetchProjectUsers();
                                setIsUserListOpen(true);
                            }}
                        >
                            Назначить исполнителя
                        </button>)}
                        <button>Заархивировать</button>
                        <button onClick={markAsBug}>
                            {task.itemTypeId === 3 ? 'Убрать отметку баг' : 'Отметить как баг'}
                        </button>
                    </div>
                )}
            </div>

            {isConfirmDeleteOpen && (
                <div className="confirm-modal">
                    <p>Вы уверены, что хотите удалить задачу?</p>
                    <button onClick={handleDeleteTask}>Да</button>
                    <button onClick={() => setIsConfirmDeleteOpen(false)}>Отмена</button>
                </div>
            )}

            {isUserListOpen && (
                <div className="user-list-modal">
                    <h4>Выберите исполнителя</h4>
                    <ul>
                        {projectUsers.map(user => (
                            <li key={user.id}>
                                <button onClick={() => handleAssignUser(user.id)}>
                                    <span>{user.username}</span>
                                    <img src={rebuildFilePath(user?.imagePath, 0) || defaultAvatar} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div onClick={onClick}>
                <TaskComponent task={task} />
            </div>
        </div>
    );
};
