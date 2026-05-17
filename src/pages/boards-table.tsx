import { useEffect, useState } from "react";
import { MoreVertical, Plus, Calendar, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/board-table.css";

interface Board {
    id: number;
    projectId: number;
    projectName: string;
    name: string;
    description: string;
    createdAt: string;
    itemsCount: number;
}

export const BoardsTable = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchBoards = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/board/current`, {
                method: "GET",
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            const data = await response.json() as Board[];
            setBoards(data);
            setError(null);
        } catch (err: any) {
            console.error("Ошибка при загрузке досок:", err);
            setError(err.message || "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleRowClick = (projectId: number, boardId: number) => {
        navigate(`/home/project/${projectId}/boards/${boardId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}.${month}`;
    };

    if (loading) {
        return (
            <div className="board-table-wrapper">
                <table className="board-table">
                    <thead>
                    <tr>
                        <th>Наименование</th>
                        <th>Описание</th>
                        <th>Проект</th>
                        <th>Количество задач</th>
                        <th>Дата создания</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        );
    }

    if (error) {
        return (
            <div className="board-table-wrapper">
                <div className="error-message">
                    ⚠️ {error}
                </div>
                <button
                    className="create-board-button"
                    onClick={fetchBoards}
                >
                    Повторить попытку
                </button>
            </div>
        );
    }

    if (boards.length === 0) {
        return (
            <div className="board-table-wrapper">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Layers size={48} strokeWidth={1.5} />
                    </div>
                    <p>Нет созданных досок</p>
                    <button
                        className="create-board-button"
                        onClick={() => navigate("/home/projects")}
                        style={{ marginTop: "20px" }}
                    >
                        <Plus size={18} />
                        Перейти к проектам
                    </button>
                </div>
            </div>
        );
    }

    return (

        <div className="board-table-wrapper">

            <table className="board-table">
                <thead>
                <tr>
                    <th>Наименование</th>
                    <th>Описание</th>
                    <th>Проект</th>
                    <th>Задачи</th>
                    <th>Дата</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {boards.map((board) => (
                    <tr
                        key={board.id}
                        onClick={() => handleRowClick(board.projectId, board.id)}
                        className="board-row"
                    >
                        <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Layers size={16} color="#579DFF" />
                                {board.name}
                            </div>
                        </td>
                        <td title={board.description}>
                            {board.description || "—"}
                        </td>
                        <td>{board.projectName}</td>
                        <td>
                                <span style={{
                                    background: "rgba(75, 206, 151, 0.15)",
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    fontWeight: "bold"
                                }}>
                                    {board.itemsCount}
                                </span>
                        </td>
                        <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Calendar size={12} color="#9FADBC" />
                                {formatDate(board.createdAt)}
                            </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                            <div className="board-item-menu-btn">
                                <MoreVertical size={16} />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};