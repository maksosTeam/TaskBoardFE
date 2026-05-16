import { useEffect, useState } from 'react';
import '../styles/tasks-page/table-component.css';
import '../styles/project-page.css'
import axios from "axios";
import { getTaskPriorityColor, calculateTimeLeft } from '../utils.ts';
import {useNavigate} from "react-router-dom";
import {TaskSidebar} from "../components/board-page/task-sidebar.tsx";
import {declinateTaskWord} from '../utils.ts'
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
        return date.toLocaleDateString();
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

        return `${counts.total} ${taskWord}: ${counts.inProgress} в работе, ${counts.inQueue} в очереди, ${counts.done} выполнено`;
    };

    const filteredTasks = tasks.filter(task =>
        activeTab === 'all' ? !task.isArchived : task.isArchived
    );

    if (loading) {
        return <div className="loading-message">Загрузка задач...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }


    return (
        <div style={{  backgroundColor: "#141F29"}}>
            <h2>Мои задачи</h2>
            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'all' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Все задачи
                </button>
                <button
                    className={`tab-button ${activeTab === 'archived' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('archived')}
                >
                    Архивные
                </button>
            </div>
            <div className="sprint-info-component">
                <p>{getTasksCountText(filteredTasks)}</p>
            </div>
            <div className="table-container">
                <table className="task-table">
                    <thead>
                    <tr>
                        <th style={{textAlign: 'left'}}>Задача</th>
                        <th style={{width: "120px"}}>Статус</th>
                        <th style={{width: "100px"}}>Приоритет</th>
                        <th style={{width: "100px"}}>Дедлайн</th>
                        <th style={{width: "150px"}}>Осталось</th>
                        <th style={{width: "150px"}}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTasks.map((task) => {
                        const timeLeft = calculateTimeLeft(task.startDate, task.expectedEndDate);

                        return (
                            <tr key={task.id}
                                onClick={() => setSelectedTask(task)}
                                style={{ cursor: "pointer" }}
                                className="task-row">
                                <td>
                                    <div className="task-title">{task.title}</div>
                                </td>
                                <td>
                                    <div className="tasks-status-badge" style={{backgroundColor: '#122B45'}}>
                                        {task.status.name}
                                    </div>
                                </td>
                                <td>
                                <span style={{color: getTaskPriorityColor(task.priorityText)}}>
                                    {task.priorityText}
                                </span>
                                </td>
                                <td style={{color: timeLeft.isOverdue ? '#c15050' : '#80ADDB'}}>
                                    {formatDate(task.expectedEndDate)}
                                </td>
                                <td>
                                    <div className="timeleft-tracker-wrapper">
                                        {/* Прогресс-бар с процентом выполнения */}
                                        <div className="tracker-bar">
                                            <div
                                                className="tracker-fill"
                                                style={{
                                                    width: `${timeLeft.percentage}%`,
                                                }}
                                            ></div>
                                        </div>

                                        {/* Блок с текстовой информацией */}
                                        <div className="timeleft-info">
                                        <span
                                            className="timeleft-text"
                                            style={{color: timeLeft.isOverdue ? '#c15050' : '#80ADDB'}}
                                        >
        {timeLeft.text}
      </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className='tasks-table-go-board'
                                        onClick={() => handleRowClick(task.projectId, task.boardId)}
                                    >Перейти на доску</button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                {selectedTask && (
                    <TaskSidebar task={selectedTask} onClose={() => setSelectedTask(null)} onTasksChange={fetchTasks}/>
                )}
            </div>
        </div>
    )
}
