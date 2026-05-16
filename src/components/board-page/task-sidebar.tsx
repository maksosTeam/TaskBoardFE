import { useEffect, useState } from "react";
import { Task } from "../../pages/board-page";
import { formatDateToDayMonth } from "../../utils.ts";
import { Paperclip, SendHorizontal } from "lucide-react";
import "../../styles/board-page/task-sidebar.css";
import { useRef } from "react";
import {getTaskPriorityColor} from "../../utils.ts";
import {rebuildFilePath} from "../../utils.ts";

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
                            className="comment-attachment"
                        >
                            <Paperclip size={14}/> Вложение
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
        setTimeout(() => onClose(), 300);
    };

    return (
        <div className={`task-sidebar ${visible ? "open" : ""}`}>
            <div className="task-sidebar-overlay" />
            <button className="close-button" onClick={handleClose}>×</button>

            <div className="task-sidebar-content">
                <p className='task-sidebar-username'>{task?.contributors?.[0]?.userName}</p>
                <h2 className='task-sidebar-title'>{task.title}</h2>

                <div className='task-sidebar-short-info-container'>
                    <div className='task-sidebar-short-info'><p>Создатель</p><p>{task.author}</p></div>
                    <div className='task-sidebar-short-info'><p>Исполнитель</p><p>{task?.contributors?.[0]?.userName || 'Не задан'}</p></div>
                    <div className='task-sidebar-short-info'><p>Дата создания</p><p>{formatDateToDayMonthYear(task.startDate)}</p></div>
                    <div className='task-sidebar-short-info'><p>Дедлайн</p><p>{formatDateToDayMonthYear(task.expectedEndDate)}</p></div>
                    <div className='task-sidebar-short-info'><p>Приоритет</p><p style={{backgroundColor: getTaskPriorityColor(task.priority)}} className='task-sidebar-priority'>{task.priorityText}</p></div>
                    {task.itemTypeId === 3 && (<div className='task-sidebar-short-info'><p>Тип задачи</p><p style={{backgroundColor: "#FF4D4F93", color: "white"}} className='task-sidebar-priority'>БАГ</p></div>)}
                    <h3 className='task-sidebar-desc-title'>Описание:</h3>
                    <p className='task-sidebar-description'>{task.description}</p>

                    <h3 className='task-sidebar-comm-title'>Комментарии</h3>

                    <div className="comments-list">
                        {comments.map((c) => (
                            <CommentItem key={c.id} comment={c} />
                        ))}
                    </div>
                </div>
            </div>
            {attachment && (
                <div className="comment-attachment-preview">
                    <span>{attachment.name}</span>
                    <button
                        type="button"
                        className="remove-attachment-btn"
                        onClick={() => setAttachment(null)}
                    >
                        ×
                    </button>
                </div>
            )}
            {/* Фиксированная форма */}
            <form onSubmit={handleCommentSubmit} className="comment-form">
                <div className="comment-input-wrapper">
                    <button
                        type="button"
                        className="comment-attach-btn"
                        onClick={handleAttachClick}
                    >
                        <Paperclip color={"rgba(255,255,255,0.48)"} size={19} />
                    </button>
                    <input
                        className="comment-input"
                        type="text"
                        placeholder="Комментарий..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="comment-send-btn"
                        disabled={!commentText.trim() || isSending}
                        title={!commentText.trim() ? "Введите текст комментария" : ""}
                    >
                        {isSending ? (
                            <span className="task-sidebar-spinner" />
                        ) : (
                            <SendHorizontal color={"#91ADC9"} size={20} />
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
    );
};
