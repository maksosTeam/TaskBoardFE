import PaperClipIcon from '../../assets/paper-clip.svg';
import ClockIcon from '../../assets/clock.svg';
import '../../styles/board-page/task-component.css';
import { formatDateToDayMonth } from '../../utils.ts';
import { Task } from '../../pages/board-page';
import {getTaskPriorityColor} from "../../utils";
import {useEffect} from "react";
import {rebuildFilePath} from "../../utils.ts";
import defaultAvatar from '../../assets/user-avatar.webp';

interface TaskComponentProps {
    task: Task;
}

export const TaskComponent = ({ task }: TaskComponentProps) => {
    useEffect(() => {
        console.log(task.itemTypeId)
    }, []);

    return (
        <div className={`task ${task.itemTypeId === 3 ? 'task-bug' : ''}`}>
            <div className="task-first-sect">
                <div className="task-text-container">
                    <button onClick={() => {}} className="task-username">
                        {task?.contributors?.[0]?.userName || 'Не задан'}
                    </button>
                    <p className="task-text">{task.title}</p>
                </div>
                {task?.contributors?.[0] && (
                    <img
                        className="task-user-avatar"
                        src={
                            task.contributors[0].imagePath
                                ? rebuildFilePath(task.contributors[0].imagePath, 0)
                                : defaultAvatar
                        }
                        alt="Аватар профиля"
                    />
                )}
            </div>
            <div>
                <div className="task-time">
                    <img src={ClockIcon} alt="Дедлайн" />
                    <p>{formatDateToDayMonth(task.expectedEndDate)}</p>
                    <span
                        className="task-priority-dot"
                        style={{ backgroundColor: getTaskPriorityColor(task.priority) }}
                    ></span>
                </div>
            </div>
        </div>
    );
};
