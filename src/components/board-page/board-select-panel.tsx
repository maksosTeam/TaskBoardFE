import { useSelector } from "react-redux";
import { ChevronLeft } from "lucide-react";
import { RootState } from "../../store";
import "../../styles/board-page/board-select-panel.css";
import { useParams, useNavigate } from "react-router-dom";
import { CreateBoardModal } from "../create-board-modal-component";
import { useState, useEffect } from "react";
import { fetchBoardsByProject } from "../../store/boardSlice.ts";
import { useAppDispatch } from "../../store/hooks.ts";

export const BoardSelectPanel = () => {
    const [showModal, setShowModal] = useState(false);
    const { projectId, boardId } = useParams<{ projectId: string; boardId?: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const boards = useSelector((state: RootState) =>
        state.boards.byProject[projectId] ?? []
    );

    const user = useSelector((state: RootState) => state.user.user);
    const project = useSelector((state: RootState) =>
        state.projects.items.find((p) => p.id === Number(projectId))
    );

    const isProjectHead = user?.username === project?.head;

    const selectedBoardId = boardId ? parseInt(boardId, 10) : null;

    const refreshBoards = () => dispatch(fetchBoardsByProject(projectId));

    useEffect(() => {
        if (projectId) {
            dispatch(fetchBoardsByProject(projectId));
        }
    }, [projectId, dispatch]);

    const handleBoardClick = (boardId: number) => {
        navigate(`/home/project/${projectId}/boards/${boardId}`);
    };

    return (
        <div className="board-select-panel-container">
            <div className="board-select-buttons">
                <button
                    onClick={() => navigate(`/home/project/${projectId}`)}
                    style={{ background: 'none', border: 'none', padding: 0, marginLeft: '-3px' }}
                >
                    <ChevronLeft size={50} color="#fff" />
                </button>

                {isProjectHead && (
                    <button className='panel-create-board-button' onClick={() => setShowModal(true)}>
                        Добавить доску
                    </button>
                )}
            </div>

            <div className="select-boards">
                {boards.map((board) => (
                    <div
                        key={board.id}
                        className={`board-item ${board.id === selectedBoardId ? "selected" : ""}`}
                        onClick={() => handleBoardClick(board.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <p>{board.name}</p>
                        <span>{board.itemsCount} задач</span>
                    </div>
                ))}
            </div>

            {showModal && (
                <CreateBoardModal
                    projectId={projectId}
                    onCreated={refreshBoards}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};
