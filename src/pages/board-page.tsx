import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStatusesByBoard } from "../store/statusSlice";
import { RootState } from "../store";
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskComponent } from "../components/board-page/task-component";
import { SortableTask } from "../components/board-page/sortable-task";
import { TaskSidebar } from "../components/board-page/task-sidebar";
import { BoardSelectPanel } from "../components/board-page/board-select-panel";
import { SortButton } from "../components/board-page/sort-button";
import "../styles/board-page/board-page.css";
import { CreateTaskModal } from "../components/create-task-modal.tsx";
import { useParams } from "react-router-dom";
import { Plus, ListPlus } from 'lucide-react';

export interface Task {
    id: string;
    userName?: string;
    userAvatar?: string;
    title: string;
    description: string;
    startDate: string;
    expectedEndDate: string;
    category: string;
    priority: number;
    priorityText: string;
    businessId: number;
    itemTypeId: number;
    contributors: [Contributor];
    projectId: number;
}

interface Contributor {
    userName: string;
    imagePath: string;
}

interface BoardPageProps {
    tasks?: Task[];
    boardId: number;
}

export const LoadingColumn: React.FC = () => {
    return (
        <div className="loading-column">
            <div className="loading-column-header">
                <div className="loading-column-header-left">
                    <div className="loading-status-dot" />
                    <div className="loading-status-title" />
                    <div className="loading-status-count" />
                </div>
                <div className="loading-sort-button" />
            </div>

            <div className="loading-column-content">
                <div className="loading-add-button" />

                {[1, 2, 3].map((index) => (
                    <div key={index} className="loading-task-card">
                        <div className="loading-task-header">
                            <div className="loading-task-avatar" />
                            <div className="loading-task-user" />
                            <div className="loading-task-priority" />
                        </div>
                        <div className="loading-task-title short" />
                        <div className="loading-task-description" />
                        <div className="loading-task-description" />
                        <div className="loading-task-footer">
                            <div className="loading-task-date" />
                            <div className="loading-task-contributors">
                                <div className="loading-contributor" />
                                <div className="loading-contributor" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BoardPage = ({ tasks = [] }: BoardPageProps) => {
    const dispatch = useDispatch();
    const [taskList, setTaskList] = useState<Task[]>(tasks);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { projectId, boardId } = useParams<{ projectId: string; boardId?: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    const statuses = useSelector((state: RootState) => state.statuses.byBoard[boardId] || []);
    const statusesStatus = useSelector((state: RootState) => state.statuses.status);
    const [isCreatingStatus, setIsCreatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState({ name: '', isDone: false, isRejected: false });

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/item/board/${boardId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            const formattedTasks: Task[] = data.map((item: any) => ({
                id: item.id.toString(),
                author: item.author,
                title: item.title,
                description: item.description,
                startDate: item.startDate,
                expectedEndDate: item.expectedEndDate,
                category: item.status.name,
                priority: item.priority,
                priorityText: item.priorityText,
                contributors: item.contributors,
                businessId: item.businessId,
                itemTypeId: item.itemTypeId,
                projectId: item.projectId,
            }));
            setTaskList(formattedTasks);
        } catch (error) {
            console.error("Ошибка при загрузке задач:", error);
        }
    };

    const handleTaskCreated = () => {
        fetchTasks();
        setIsModalOpen(false);
    };

    useEffect(() => {
        document.title = "Доска";
        fetchTasks();
        dispatch(fetchStatusesByBoard(boardId));
    }, [dispatch, boardId]);

    const getTasksByCategory = (category: string) =>
        taskList.filter((task) => task.category === category);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    // ... (Ваш обработчик handleDragEnd без изменений, он логический)
    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const activeTask = taskList.find((t) => t.id === active.id);
        if (!activeTask) return;
        const isOverColumn = statuses.some((status) => status.name === over.id);
        const isOverTask = taskList.find((t) => t.id === over.id);
        const token = localStorage.getItem("token");
        const previousTaskList = [...taskList];

        if (isOverColumn) {
            const newStatus = statuses.find((status) => status.name === over.id);
            if (!newStatus) return;
            setTaskList((prev) => prev.map((task) => task.id === active.id ? { ...task, category: newStatus.name } : task));
            try {
                const response = await fetch(`/api/item/change-status/${activeTask.id}`, {
                    method: "POST",
                    headers: { accept: "*/*", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify(newStatus.id),
                });
                if (!response.ok) throw new Error("Ошибка при изменении статуса");
            } catch (error) {
                console.error(error);
                setTaskList(previousTaskList);
            }
        } else if (isOverTask) {
            if (activeTask.category !== isOverTask.category) {
                const newStatus = statuses.find((status) => status.name === isOverTask.category);
                if (!newStatus) return;
                setTaskList((prev) => prev.map((task) => task.id === active.id ? { ...task, category: isOverTask.category } : task));
                try {
                    const response = await fetch(`/api/item/change-status/${activeTask.id}`, {
                        method: "POST",
                        headers: { accept: "*/*", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                        body: JSON.stringify(newStatus.id),
                    });
                    if (!response.ok) throw new Error("Ошибка при изменении статуса");
                } catch (error) {
                    console.error(error);
                    setTaskList(previousTaskList);
                }
            } else {
                const tasksInCategory = getTasksByCategory(activeTask.category);
                const oldIndex = tasksInCategory.findIndex((t) => t.id === active.id);
                const newIndex = tasksInCategory.findIndex((t) => t.id === over.id);
                const newOrdered = arrayMove(tasksInCategory, oldIndex, newIndex);
                const updatedTasks = taskList.filter((t) => t.category !== activeTask.category);
                setTaskList([...updatedTasks, ...newOrdered]);
            }
        }
    };

    const activeTask = taskList.find((t) => t.id === activeId);

    // Кастомный компонент дроп-зоны с подсветкой (isOver)
    const DroppableColumn = ({ id, children }: { id: string; children: React.ReactNode }) => {
        const { setNodeRef, isOver } = useDroppable({ id });
        return (
            <div ref={setNodeRef} className={`droppable-area ${isOver ? 'is-over' : ''}`}>
                {children}
            </div>
        );
    };

    const handleCreateStatus = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/board/create-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: 0,
                name: newStatus.name,
                boardId: boardId,
                order: 0,
                isDone: newStatus.isDone,
                isRejected: newStatus.isRejected
            })
        });
        if (response.ok) {
            setIsCreatingStatus(false);
            setNewStatus({ name: '', isDone: false, isRejected: false });
        } else {
            alert("Ошибка при создании статуса");
        }
    }

    if (!boardId) {
        return (
            <div className="board-wrapper">
                <BoardSelectPanel />
                <div style={{ padding: '2rem', color: '#fff' }}>
                    <h2>Project {projectId}</h2>
                    <p style={{ color: '#9FADBC' }}>This project has no boards yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="board-wrapper">
            <BoardSelectPanel />

            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                sensors={sensors}
            >
                <div className="board-columns">
                    {statusesStatus === 'loading' ? (
                        <div className="loading-columns-container">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <LoadingColumn key={index} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {[...statuses]
                                .sort((a, b) => a.order - b.order)
                                .map((status) => {
                                    const tasks = getTasksByCategory(status.name);

                                    // Определение цвета точки статуса
                                    const statusDotClass = status.isDone
                                        ? 'done'
                                        : status.isRejected
                                            ? 'rejected'
                                            : 'default';

                                    return (
                                        <div className="board-column" key={status.name}>
                                            <div className="column-header">
                                                <div className="column-header-left">
                                                    <div className={`status-dot ${statusDotClass}`} />
                                                    <h1 className="status-title">{status.name}</h1>
                                                    <span className="status-count">{tasks.length}</span>
                                                </div>
                                                <SortButton
                                                    onSortChange={(sortType) => {
                                                        setTaskList((prev) => {
                                                            const currentTasks = prev.filter((task) => task.category === status.name);
                                                            const otherTasks = prev.filter((task) => task.category !== status.name);
                                                            const sorted = [...currentTasks].sort((b, a) => {
                                                                if (sortType === 'date') {
                                                                    return new Date(b.expectedEndDate).getTime() - new Date(a.expectedEndDate).getTime();
                                                                }
                                                                if (sortType === 'priority') return a.priority - b.priority;
                                                                return 0;
                                                            });
                                                            return [...otherTasks, ...sorted];
                                                        });
                                                    }}
                                                />
                                            </div>

                                            <DroppableColumn id={status.name}>
                                                <SortableContext
                                                    items={tasks.map((t) => t.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {!status.isDone && !status.isRejected && (
                                                        <button
                                                            className="column-add-task-btn"
                                                            onClick={() => {
                                                                setSelectedStatusId(status.id);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Plus size={14} />
                                                            Add Task
                                                        </button>
                                                    )}
                                                    {tasks.map((task) => (
                                                        <SortableTask
                                                            key={task.id}
                                                            task={task}
                                                            activeId={activeId}
                                                            onClick={() => setSelectedTask(task)}
                                                            onTasksChange={fetchTasks}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </DroppableColumn>
                                        </div>
                                    );
                                })}

                            {isCreatingStatus ? (
                                <div className="add-status-overlay">
                                    <div className="create-status-form">
                                        <h4>Добавить колонку</h4>
                                        <input
                                            type="text"
                                            placeholder="Название"
                                            value={newStatus.name}
                                            onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                                        />
                                        <div className="status-checkbox-group">
                                            <label className="status-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={newStatus.isDone}
                                                    onChange={(e) => setNewStatus({
                                                        ...newStatus,
                                                        isDone: e.target.checked,
                                                        isRejected: e.target.checked ? false : newStatus.isRejected
                                                    })}
                                                    disabled={newStatus.isRejected}
                                                />
                                                Для завершенных задач
                                            </label>
                                            <label className="status-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={newStatus.isRejected}
                                                    onChange={(e) => setNewStatus({
                                                        ...newStatus,
                                                        isRejected: e.target.checked,
                                                        isDone: e.target.checked ? false : newStatus.isDone
                                                    })}
                                                    disabled={newStatus.isDone}
                                                />
                                                Для отклоненных задач
                                            </label>
                                        </div>

                                        <div className="create-status-actions">
                                            <button className="btn-primary" onClick={handleCreateStatus}>Создать</button>
                                            <button className="btn-ghost" onClick={() => setIsCreatingStatus(false)}>Отменить</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setIsCreatingStatus(true)} className="add-column-button">
                                    <ListPlus size={28} />
                                </button>
                            )}

                            {isModalOpen && selectedStatusId !== null && (
                                <CreateTaskModal
                                    projectId={projectId}
                                    boardId={boardId}
                                    statusId={selectedStatusId}
                                    isOpen={isModalOpen}
                                    onClose={() => {
                                        setIsModalOpen(false);
                                        setSelectedStatusId(null);
                                    }}
                                    onTaskCreated={handleTaskCreated}
                                />
                            )}
                        </>
                    )}
                </div>

                {selectedTask && (
                    <TaskSidebar task={selectedTask} onClose={() => setSelectedTask(null)} onTasksChange={fetchTasks} />
                )}

                <DragOverlay>
                    {activeTask ? <TaskComponent task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};