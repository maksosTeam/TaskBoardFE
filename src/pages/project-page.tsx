import { ProjectTasksState } from "../components/project-page/project-tasks-state.tsx";
import { ProjectContributorsComponent} from "../components/project-page/project-contributors-component.tsx";
import { ProjectDocumentsComponent } from "../components/project-page/project-documents-component.tsx";
import { ProjectSettingsForm } from "../components/project-page/project-settings-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateToDayMonth } from '../utils.ts'
import '../styles/project-page.css'
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { fetchBoardsByProject } from "../store/boardSlice.ts";

import {Analitycs} from "../components/project-page/analitycs.tsx";



type Board = {
    id: number;
    name: string;
};

export const ProjectPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const projectIdNumber = projectId ? Number(projectId) : 0;
    const [project, setProject] = useState<ProjectData | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "docs">("overview");
    const [error, setError] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    const dispatch = useAppDispatch();
    const { byProject } = useAppSelector((s) => s.boards);
    const boards: Board[] = byProject[projectIdNumber] || [];
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const fetchProject = async () => {
        if (!projectId) return;
        setIsLoading(true);
        setError(false);

        try {
            const response = await axios.get<ProjectData>(`/api/project/get/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setProject(response.data);
        } catch (error) {
            console.log('Error fetching project data', error);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = axios.get(`/api/auth/current`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserId(response.data.userId);
        } catch (_) {
            console.log('Error fetching current user', _);
        }
    }

    useEffect(() => {
        fetchCurrentUser();
        fetchProject();
        if (projectId) {
            dispatch(fetchBoardsByProject(projectIdNumber));
        }
    }, [dispatch, projectId, projectIdNumber]);

    const handleBoardsNavigation = () => {
        if (boards.length > 0) {
            navigate(`/home/project/${projectIdNumber}/boards/${boards[0].id}`);
        } else {
            navigate(`/home/project/${projectIdNumber}/boards`);
        }
    };

    if (isLoading) {
        return (
            <div className="project-page-loading">
                <div className="spinner" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="project-page-error-container">
                <div className="project-page-error">
                    <h2>Такой страницы не существует</h2>
                    <p>Проект с указанным ID не найден или у вас нет к нему доступа</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="project-page-error-button"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>

        );
    }

    return (
        <div className='project-page-main-container'>
            <div className='project-page-header'>
                <h2 className='project-title'>{project.name}</h2>
                <div className='tabs'>
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={activeTab === "overview" ? "active-tab" : ""}
                    >
                        Обзор
                    </button>
                    <button
                        onClick={() => setActiveTab("docs")}
                        className={activeTab === "docs" ? "active-tab" : ""}
                    >
                        Документация
                    </button>

                    <button
                        className={activeTab === "settings" ? "active-tab" : ""}
                        onClick={() => setActiveTab("settings")}
                    >
                        Настройки
                    </button>
                    <button
                        className={activeTab === "analytics" ? "active-tab" : ""}
                        onClick={() => setActiveTab("analytics")}
                    >
                        Аналитика
                    </button>
                </div>
            </div>

            <p className='project-status'>{project.status}</p>

            {activeTab === "overview" ? (
                <>
                    <div className='project-description-container'>
                        <p>{project.description}</p>
                    </div>
                    <div className='project-specificity-container'>
                        <div className='project-specificity-sect'>
                            <p>ID</p>
                            <p className='project-specificity-second'>{project.key}</p>
                        </div>
                        <div className='project-specificity-sect'>
                            <p>Дата</p>
                            <p className='project-specificity-second'>
                                {formatDateToDayMonth(project.startDate)} —
                                {formatDateToDayMonth(project.expectedEndDate)}
                            </p>
                        </div>
                        <div className='project-specificity-sect'>
                            <p>Публичный</p>
                            <p className='project-specificity-second'>{project.isPrivate ? "Да" : "Нет"}</p>
                        </div>
                        <div className='project-specificity-sect'>
                            <p>Руководитель</p>
                            <p className='project-specificity-second'>{project.head}</p>
                        </div>
                    </div>

                    <h2>Участники</h2>
                    <ProjectContributorsComponent projectId={projectIdNumber} />
                    <h3>Обзор состояния задач</h3>
                    <ProjectTasksState projectId={projectIdNumber} />
                    <button
                        onClick={handleBoardsNavigation}
                        className='project-to-boards-btn'
                    >
                        Перейти к доскам проекта
                    </button>
                </>
            ) : activeTab === "docs" ? (
                <ProjectDocumentsComponent projectId={projectIdNumber} />
            ) : activeTab === "settings" && project ? (
                <ProjectSettingsForm project={project} onUpdate={fetchProject} />
            ) : activeTab === "analytics" && project ? (
                <Analitycs projectId={project.id} /> ) : null}
        </div>
    );
};
