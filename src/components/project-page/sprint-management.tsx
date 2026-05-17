import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    fetchSprintsByBoard,
    createSprint,
    updateSprint,
    deleteSprint,
    Sprint,
} from "../../store/sprintSlice";
import { formatDateToDayMonthSafe } from "../../utils";
import { Calendar, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import "../../styles/project-page/sprint-management.css";

interface SprintManagementProps {
    projectId: number;
    boards?: Array<{ id: number; name: string }>;
}

export const SprintManagement = ({
                                     projectId,
                                     boards = [],
                                 }: SprintManagementProps) => {
    const dispatch = useAppDispatch();
    const { byBoard, status } = useAppSelector((s) => s.sprints);
    const [selectedBoardId, setSelectedBoardId] = useState<number | null>(
        boards.length > 0 ? boards[0].id : null
    );
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    const sprints = selectedBoardId ? byBoard[selectedBoardId] || [] : [];
    const sprintsList = Array.isArray(sprints) ? sprints : [];

    // ✅ Загружаем спринты только при выборе доски
    useEffect(() => {
        if (selectedBoardId) {
            dispatch(fetchSprintsByBoard(selectedBoardId));
        }
    }, [selectedBoardId, dispatch]);

    const handleCreate = async () => {
        if (!selectedBoardId || !formData.name || !formData.startDate || !formData.endDate) {
            alert("Пожалуйста, заполните все поля");
            return;
        }

        // ✅ Отправляем запрос на создание
        const result = await dispatch(
            createSprint({
                boardId: selectedBoardId,
                sprint: {
                    boardId: selectedBoardId,
                    name: formData.name,
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                } as Omit<Sprint, "id">,
            })
        );

        // ✅ Проверяем успешность
        if (createSprint.fulfilled.match(result)) {
            // 🎉 Спринт уже добавлен в Redux state через extraReducer!
            // Не нужно вызывать fetchSprintsByBoard
            console.log("Спринт успешно создан и добавлен в состояние");
        } else {
            console.error("Ошибка при создании спринта:", result.error);
            alert("Не удалось создать спринт");
        }

        // Очищаем форму
        setFormData({ name: "", startDate: "", endDate: "" });
        setIsCreating(false);
    };

    const handleEdit = (sprint: Sprint) => {
        setEditingId(sprint.id);
        setFormData({
            name: sprint.name,
            startDate: sprint.startDate.split("T")[0],
            endDate: sprint.endDate.split("T")[0],
        });
    };

    const handleUpdate = async () => {
        if (!editingId || !formData.name || !formData.startDate || !formData.endDate) {
            alert("Пожалуйста, заполните все поля");
            return;
        }

        const sprintToUpdate = sprintsList.find((s) => s.id === editingId);
        if (!sprintToUpdate) return;

        const result = await dispatch(
            updateSprint({
                ...sprintToUpdate,
                name: formData.name,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            })
        );

        // ✅ Проверяем успешность
        if (updateSprint.fulfilled.match(result)) {
            // 🎉 Спринт уже обновлен в Redux state через extraReducer!
            console.log("Спринт успешно обновлен");
        } else {
            console.error("Ошибка при обновлении спринта:", result.error);
            alert("Не удалось обновить спринт");
        }

        setFormData({ name: "", startDate: "", endDate: "" });
        setEditingId(null);
    };

    const handleDelete = async (sprintId: number | undefined) => {
        if (!sprintId) {
            console.error("Sprint ID is undefined");
            return;
        }

        if (!window.confirm("Вы уверены, что хотите удалить спринт?")) {
            return;
        }

        if (!selectedBoardId) return;

        const result = await dispatch(
            deleteSprint({ boardId: selectedBoardId, sprintId })
        );

        // ✅ Проверяем успешность
        if (deleteSprint.fulfilled.match(result)) {
            // 🎉 Спринт уже удален из Redux state через extraReducer!
            console.log("Спринт успешно удален");
        } else {
            console.error("Ошибка при удалении спринта:", result.error);
            alert("Не удалось удалить спринт");
        }
    };

    const cancelEdit = () => {
        setFormData({ name: "", startDate: "", endDate: "" });
        setEditingId(null);
        setIsCreating(false);
    };

    return (
        <div className="sm-container">
            {/* Board Selector */}
            {boards.length > 0 && (
                <div className="sm-board-selector">
                    <label className="sm-selector-label">Выберите доску:</label>
                    <select
                        value={selectedBoardId || ""}
                        onChange={(e) => setSelectedBoardId(Number(e.target.value))}
                        className="sm-selector"
                    >
                        {boards.map((board) => (
                            <option key={board.id} value={board.id}>
                                {board.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Sprints List */}
            <div className="sm-sprints-list">
                <div className="sm-list-header">
                    <h3 className="sm-list-title">Спринты</h3>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="sm-create-btn"
                        disabled={isCreating || editingId !== null || status === "loading"}
                    >
                        <Plus size={16} />
                        Новый спринт
                    </button>
                </div>

                {/* Loading State */}
                {status === "loading" && (
                    <div className="sm-loading">
                        <div className="sm-spinner" />
                        <p>Загрузка спринтов...</p>
                    </div>
                )}

                {/* Create/Edit Form */}
                {(isCreating || editingId !== null) && (
                    <div className="sm-form">
                        <div className="sm-form-group">
                            <label className="sm-form-label">Название спринта</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Например: Sprint 1"
                                className="sm-form-input"
                            />
                        </div>

                        <div className="sm-form-row">
                            <div className="sm-form-group">
                                <label className="sm-form-label">Дата начала</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startDate: e.target.value })
                                    }
                                    className="sm-form-input"
                                />
                            </div>
                            <div className="sm-form-group">
                                <label className="sm-form-label">Дата окончания</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endDate: e.target.value })
                                    }
                                    className="sm-form-input"
                                />
                            </div>
                        </div>

                        <div className="sm-form-actions">
                            <button
                                onClick={editingId !== null ? handleUpdate : handleCreate}
                                className="sm-btn-primary"
                                disabled={status === "loading"}
                            >
                                <Check size={16} />
                                {editingId !== null ? "Обновить" : "Создать"}
                            </button>
                            <button onClick={cancelEdit} className="sm-btn-secondary">
                                <X size={16} />
                                Отмена
                            </button>
                        </div>
                    </div>
                )}

                {/* Sprints Cards */}
                {status === "loading" && sprintsList.length === 0 ? null : sprintsList.length === 0 ? (
                    <div className="sm-empty">
                        <p>Спринты не найдены</p>
                        {!isCreating && editingId === null && status !== "loading" && (
                            <p className="sm-empty-hint">Создайте первый спринт</p>
                        )}
                    </div>
                ) : (
                    <div className="sm-cards">
                        {sprintsList.map((sprint) => (
                            <div key={sprint.id} className="sm-card">
                                <div className="sm-card-header">
                                    <h4 className="sm-card-title">{sprint.name}</h4>
                                    <div className="sm-card-actions">
                                        <button
                                            onClick={() => handleEdit(sprint)}
                                            className="sm-card-btn sm-card-btn-edit"
                                            title="Редактировать"
                                            disabled={isCreating || editingId !== null}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sprint.id)}
                                            className="sm-card-btn sm-card-btn-delete"
                                            title="Удалить"
                                            disabled={isCreating || editingId !== null}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="sm-card-dates">
                                    <div className="sm-date-item">
                                        <Calendar size={14} className="sm-date-icon" />
                                        <span className="sm-date-label">Начало:</span>
                                        <span className="sm-date-value">
                                            {formatDateToDayMonthSafe(sprint.startDate)}
                                        </span>
                                    </div>
                                    <div className="sm-date-item">
                                        <Calendar size={14} className="sm-date-icon" />
                                        <span className="sm-date-label">Окончание:</span>
                                        <span className="sm-date-value">
                                            {formatDateToDayMonthSafe(sprint.endDate)}
                                        </span>
                                    </div>
                                </div>

                                {sprint.items && sprint.items.length > 0 && (
                                    <div className="sm-card-items">
                                        <div className="sm-items-label">
                                            Задач: {sprint.items.length}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};