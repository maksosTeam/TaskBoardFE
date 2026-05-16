import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
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
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchBoards = async () => {
        try {
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
        } catch (err: any) {
            console.error("Ошибка при загрузке досок:", err);
            setError(err.message || "Неизвестная ошибка");
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleRowClick = (projectId: number, boardId: number) => {
        navigate(`/home/project/${projectId}/boards/${boardId}`);
    };

    return (
        <div className="board-table-wrapper">
            {error && <p className="error">{error}</p>}
            <table className="board-table">
                <thead>
                <tr>
                    <th style={{ width: "252px" }}>Наименование</th>
                    <th style={{ width: "300px" }}>Описание</th>
                    <th style={{ width: "214px" }}>Проект</th>
                    <th style={{ width: "214px" }}>Количество задач</th>
                    <th style={{ width: "214px" }}>Дата создания</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {boards.map((board) => (
                    <tr
                        key={board.id}
                        onClick={() => handleRowClick(board.projectId, board.id)}
                        style={{ cursor: "pointer" }}
                        className="board-row"
                    >
                        <td>{board.name}</td>
                        <td style={{
                            maxWidth: "300px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {board.description}
                        </td>
                        <td>{board.projectName}</td>
                        <td>{board.itemsCount}</td>
                        <td>{new Date(board.createdAt).toLocaleDateString("ru-RU")}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                            <div className="board-item-menu-btn">
                                <MoreVertical />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
