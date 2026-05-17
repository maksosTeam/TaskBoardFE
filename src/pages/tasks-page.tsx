import { useEffect, useState } from 'react';
import '../styles/tasks-page/table-component.css';
import '../styles/project-page.css'
import axios from "axios";
import { getTaskPriorityColor, calculateTimeLeft } from '../utils.ts';
import {useNavigate} from "react-router-dom";
import {TaskSidebar} from "../components/board-page/task-sidebar.tsx";
import {declinateTaskWord} from '../utils.ts'
import { Calendar, AlertCircle, Clock, ArrowRight, Layers, Archive, Inbox } from 'lucide-react';

export interface Contributor {
    userName: string;
    imagePath: string;
}

export interface Status {
    id: number;
    name: string;
    boardId: number;
    order: number;
    isDone: boolean;
    isRejected: boolean;
}

export interface Task {
    id: number;
    parentId: number | null;
    projectId: number;
    boardId: number;
    projectItemNumber: number;
    businessId: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    startDate: string;
    expectedEndDate: string;
    priority: number;
    priorityText: string;
    itemTypeId: number;
    statusId: number;
    isArchived: boolean;
    contributors: Contributor[];
    author: string;
    status: Status;
}

export const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');

    const fetchTasks = async () => {
        try {
            const response = await axios.get<Task[]>('/api/item/get-current-user-items', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            setTasks(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
            setError('Не удалось загрузить задачи');
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Задачи"
        fetchTasks();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}.${month}`;
    };

    const handleRowClick = (projectId: number, boardId: number) => {
        navigate(`/home/project/${projectId}/boards/${boardId}`);
    };

    const countTasksByStatus = (tasks: Task[]) => {
        return tasks.reduce((acc, task) => {
            if (task.status.isDone) {
                acc.done++;
            } else if (task.status.name.toLowerCase().includes('в работе')) {
                acc.inProgress++;
            } else {
                acc.inQueue++;
            }
            return acc;
        }, { total: tasks.length, inProgress: 0, inQueue: 0, done: 0 });
    };

    const getTasksCountText = (tasks: Task[]) => {
        const counts = countTasksByStatus(tasks);
        const taskWord = declinateTaskWord(counts.total);

        return `${counts.total} ${taskWord}`;
    };

    const filteredTasks = tasks.filter(task =>
        activeTab === 'all' ? !task.isArchived : task.isArchived
    );

    if (loading) {
        return (
            <div className="tasks-page">
                <div className="loading-skeleton-tasks">
                    <div className="skeleton-header"></div>
                    <div className="skeleton-table"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tasks-page">
                <div className="error-message-tasks">
                    <AlertCircle size={24} />
                    <p>{error}</p>
                    <button onClick={fetchTasks} className="retry-button">Повторить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-page">
            <div className="tasks-header">
                <h1 className="tasks-title">Мои задачи</h1>
                <div className="tasks-stats-cards">
                    <div className="stat-card">
                        <div className="stat-value">{countTasksByStatus(filteredTasks).total}</div>
                        <div className="stat-label">Всего задач</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{countTasksByStatus(filteredTasks).inProgress}</div>
                        <div className="stat-label">В работе</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{countTasksByStatus(filteredTasks).inQueue}</div>
                        <div className="stat-label">В очереди</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{countTasksByStatus(filteredTasks).done}</div>
                        <div className="stat-label">Выполнено</div>
                    </div>
                </div>
            </div>

            <div className="tasks-controls">
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'all' ? 'active-tab' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <Inbox size={16} />
                        Активные
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'archived' ? 'active-tab' : ''}`}
                        onClick={() => setActiveTab('archived')}
                    >
                        <Archive size={16} />
                        Архив
                    </button>
                </div>
                <div className="tasks-count-badge">
                    {getTasksCountText(filteredTasks)}
                </div>
            </div>

            <div className="table-container">
                {filteredTasks.length === 0 ? (
                    <div className="empty-tasks-state">
                        <Layers size={48} strokeWidth={1.5} />
                        <p>Нет задач в этом разделе</p>
                    </div>
                ) : (
                    <table className="task-table">
                        <thead>
                        <tr>
                            <th>Задача</th>
                            <th>Статус</th>
                            <th>Приоритет</th>
                            <th>Дедлайн</th>
                            <th>Прогресс</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTasks.map((task) => {
                            const timeLeft = calculateTimeLeft(task.startDate, task.expectedEndDate);

                            return (
                                <tr
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="task-row"
                                >
                                    <td>
                                        <div className="task-title-wrapper">
                                            <div className="task-title">{task.title}</div>
                                            {task.description && (
                                                <div className="task-description-preview">
                                                    {task.description.substring(0, 60)}...
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                            <span
                                                className="task-status-badge"
                                                style={{
                                                    background: task.status.isDone
                                                        ? 'rgba(75, 206, 151, 0.2)'
                                                        : 'rgba(87, 157, 255, 0.2)',
                                                    color: task.status.isDone ? '#4BCE97' : '#579DFF'
                                                }}
                                            >
                                                {task.status.name}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                className="task-priority-badge"
                                                style={{ color: getTaskPriorityColor(task.priorityText) }}
                                            >
                                                {task.priorityText}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="task-deadline">
                                            <Calendar size={12} />
                                            {formatDate(task.expectedEndDate)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="timeleft-tracker-wrapper">
                                            <div className="tracker-bar">
                                                <div
                                                    className="tracker-fill"
                                                    style={{
                                                        width: `${timeLeft.percentage}%`,
                                                        background: timeLeft.isOverdue
                                                            ? '#FF4757'
                                                            : timeLeft.percentage > 80
                                                                ? '#F5CD47'
                                                                : '#4BCE97'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="timeleft-info">
                                                <Clock size={10} />
                                                <span
                                                    className="timeleft-text"
                                                    style={{ color: timeLeft.isOverdue ? '#FF4757' : '#9FADBC' }}
                                                >
                                                        {timeLeft.text}
                                                    </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="tasks-table-go-board"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(task.projectId, task.boardId);
                                            }}
                                        >
                                            Доска
                                            <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}

                {selectedTask && (
                    <TaskSidebar task={selectedTask} onClose={() => setSelectedTask(null)} onTasksChange={fetchTasks}/>
                )}
            </div>
        </div>
    );
};