import { useEffect, useState, useRef } from "react";
import { Task } from "../../pages/board-page";
import { formatDateToDayMonth } from "../../utils.ts";
import { Paperclip, SendHorizontal, X } from "lucide-react";
import "../../styles/board-page/task-sidebar.css";
import { getTaskPriorityColor } from "../../utils.ts";
import { rebuildFilePath } from "../../utils.ts";

interface TaskSidebarProps {
    task: Task;
    onClose: () => void;
}

interface Comment {
    id: number;
    authorId: number;
    itemId: number;
    text: string;
    createdAt: string;
    name: string;
    attachments: {
        id: number;
        authorId: number;
        commentId: number;
        filePath: string;
        uploadedAt: string;
    }[];
}

export const formatDateToDayMonthYear = (isoDate: string): string => {
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) {
            throw new Error("Невалидная дата");
        }
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
    } catch (error) {
        console.error("Ошибка при форматировании даты:", error);
        return "Невалидная дата";
    }
};

const CommentItem = ({ comment }: { comment: Comment }) => {
    return (
        <div className="comment-item">
            <div className="comment-header">
                <span className="comment-author">{comment.name}</span>
                <span className="comment-date">{formatDateToDayMonth(comment.createdAt)}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
            {comment.attachments.length > 0 && (
                <div className="comment-attachments">
                    {comment.attachments.map((att) => (
                        <a
                            key={att.id}
                            href={rebuildFilePath(att.filePath, 2)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="comment-attachment-link"
                        >
                            <Paperclip size={14} /> Attachment
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TaskSidebar = ({ task, onClose }: TaskSidebarProps) => {
    const [visible, setVisible] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isSending, setIsSending] = useState(false);

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 10);
        fetchComments();
        return () => clearTimeout(timer);
    }, [task.id]);

    const fetchComments = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/item/${task.id}/comments`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            setComments(data);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token || !commentText.trim()) return;
        setIsSending(true);
        const formData = new FormData();
        formData.append('itemId', String(task.id));
        formData.append('text', commentText);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            const response = await fetch('/api/item/comment', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                setCommentText('');
                setAttachment(null);
                fetchComments();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onClose(), 300); // Ожидание анимации
    };

    const isBug = task.itemTypeId === 3;
    const priorityColor = getTaskPriorityColor(task.priority);

    return (
        <div className={`task-sidebar ${visible ? "open" : ""}`}>
            {/* Затемненный фон */}
            <div className="task-sidebar-overlay" onClick={handleClose} />

            {/* Панель сайдбара */}
            <div className="task-sidebar-panel">

                {/* Шапка */}
                <div className="sidebar-header">
                    <div className="sidebar-title-wrapper">
            <span className="sidebar-assignee">
              {task?.contributors?.[0]?.userName || 'Исполнитель не назначен'}
            </span>
                        <h2 className="sidebar-title">{task.title}</h2>
                    </div>
                    <button className="sidebar-close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Тело (Скроллится) */}
                <div className="sidebar-body">
                    <div className="sidebar-props">
                        <div className="prop-row">
                            <span className="prop-label">Автор</span>
                            <span className="prop-value">{task.author.split("@~")[0]}</span>
                        </div>
                        <div className="prop-row">
                            <span className="prop-label">Иcполнитель</span>
                            <span className="prop-value">{task?.contributors.map(x => x.split("@~")[0]).join(", ") || 'Отсутствует'}</span>
                        </div>
                        <div className="prop-row">
                            <span className="prop-label">Создано</span>
                            <span className="prop-value">{formatDateToDayMonthYear(task.startDate)}</span>
                        </div>
                        <div className="prop-row">
                            <span className="prop-label">Дедлайн</span>
                            <span className="prop-value">{formatDateToDayMonthYear(task.expectedEndDate)}</span>
                        </div>
                        <div className="prop-row">
                            <span className="prop-label">Приоритет</span>
                            <div className="prop-value">
                <span
                    className="prop-badge priority"
                    style={{ backgroundColor: priorityColor, borderColor: priorityColor }}
                >
                  {task.priorityText}
                </span>
                            </div>
                        </div>
                        {isBug && (
                            <div className="prop-row">
                                <span className="prop-label">Task Type</span>
                                <div className="prop-value">
                                    <span className="prop-badge bug">BUG</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="section-title">Description</h3>
                        <p className="sidebar-desc-box">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    <div>
                        <h3 className="section-title">Comments</h3>
                        <div className="comments-list">
                            {comments.length > 0 ? (
                                comments.map((c) => <CommentItem key={c.id} comment={c} />)
                            ) : (
                                <div style={{ color: '#9FADBC', fontSize: '0.875rem' }}>No comments yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Подвал (Фиксированный) */}
                <div className="sidebar-footer">
                    {attachment && (
                        <div className="attachment-preview">
                            <span>{attachment.name}</span>
                            <button
                                type="button"
                                className="remove-attachment-btn"
                                onClick={() => setAttachment(null)}
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <div className="comment-input-wrapper">
                            <button
                                type="button"
                                className="comment-attach-btn"
                                onClick={handleAttachClick}
                            >
                                <Paperclip size={18} />
                            </button>
                            <input
                                className="comment-input"
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="comment-send-btn"
                                disabled={!commentText.trim() || isSending}
                                title={!commentText.trim() ? "Enter comment text" : ""}
                            >
                                {isSending ? (
                                    <div className="task-sidebar-spinner" />
                                ) : (
                                    <SendHorizontal size={18} />
                                )}
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="comment-file-input"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            style={{ display: "none" }}
                        />
                    </form>
                </div>

            </div>
        </div>
    );
};