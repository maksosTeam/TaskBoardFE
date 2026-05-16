import { useState, useEffect } from "react";
import axios from 'axios';
import '../../styles/project-page.css'

interface TasksState {
    boardsCount: number;
    newTasks: number;
    inWork: number;
    completed: number;
}

interface ProjectTasksStateProps {
    projectId: number;
}

export const ProjectTasksState: React.FC<ProjectTasksStateProps> = ({ projectId }) => {
    const [tasksState, setTasksState] = useState<TasksState>({
        boardsCount: 0,
        newTasks: 0,
        inWork: 0,
        completed: 0,
    });

    const fetchTasksStates = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get<TasksState>(`/api/project/get-tasks-state/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setTasksState(response.data);
        } catch (error) {
            console.log('Error fetching tasks state', error);
        }
    };

    useEffect(() => {
        fetchTasksStates();
    }, [projectId]);

    return (
        <div className="projects-tasks-state-container">
            <div className="task-state">
                <p>Кол-во досок</p>
                <b>{tasksState.boardsCount}</b>
            </div>
            <div className="task-state">
                <p>Новые</p>
                <b>{tasksState.newTasks}</b>
            </div>
            <div className="task-state">
                <p>В процессе</p>
                <b>{tasksState.inWork}</b>
            </div>
            <div className="task-state">
                <p>Выполнено</p>
                <b>{tasksState.completed}</b>
            </div>
        </div>
    );
};
