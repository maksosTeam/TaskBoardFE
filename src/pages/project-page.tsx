import { ProjectTasksState } from "../components/project-page/project-tasks-state.tsx";
import { ProjectContributorsComponent } from "../components/project-page/project-contributors-component.tsx";
import { ProjectDocumentsComponent } from "../components/project-page/project-documents-component.tsx";
import { ProjectSettingsForm } from "../components/project-page/project-settings-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateToDayMonth } from '../utils.ts'
import '../styles/project-page.css'
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { fetchBoardsByProject } from "../store/boardSlice.ts";
import { Analitycs } from "../components/project-page/analitycs.tsx";
import { Calendar, Users, Lock, ArrowRight, Plus } from 'lucide-react'; // Добавлены иконки

type Board = {
    id: number;
    name: string;
};
type TabType = "overview" | "docs" | "settings" | "analytics";

export const ProjectPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const projectIdNumber = projectId ? Number(projectId) : 0;
    const [project, setProject] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>("overview");
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
            const response = await axios.get(`/api/project/get/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
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
            const response = await axios.get(`/api/auth/current`, {
                headers: { Authorization: `Bearer ${token}` }
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
            <div className="pp-loading">
                <div className="pp-spinner" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="pp-error-container">
                <div className="pp-error">
                    <h2>Такой страницы не существует</h2>
                    <p>Проект с указанным ID не найден или у вас нет к нему доступа</p>
                    <button onClick={() => navigate('/home')} className="pp-error-button">
                        Вернуться на главную
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='pp-container'>
            {/* Header */}
            <header className="pp-header">
                <div className="pp-title-wrapper">
                    <h1 className="pp-title">{project.name}</h1>
                    <span className="pp-badge">{project.status || 'В работе'}</span>
                </div>
                <p className="pp-id-subtitle">ID: {project.key}</p>
            </header>

            {/* Navigation Tabs */}
            <nav className="pp-tabs" aria-label="Навигация по проекту">
                {(["overview", "docs", "settings", "analytics"] as const).map((tab) => {
                    const labels: Record<TabType, string> = {
                        overview: "Обзор",
                        docs: "Документация",
                        settings: "Настройки",
                        analytics: "Аналитика"
                    };
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pp-tab-btn ${activeTab === tab ? "active" : ""}`}
                            type="button"
                        >
                            {labels[tab]}
                        </button>
                    );
                })}
            </nav>

            {/* Tab Content */}
            {activeTab === "overview" ? (
                <div className="pp-overview-content">

                    {/* Description (если есть) */}
                    {project.description && (
                        <div className="pp-description">
                            <p>{project.description}</p>
                        </div>
                    )}

                    {/* Project Info Card (4 columns) */}
                    <div className="pp-card pp-info-grid">
                        <div className="pp-info-item">
                            <p className="pp-info-label">ID проекта</p>
                            <p className="pp-info-value">{project.key}</p>
                        </div>
                        <div className="pp-info-item">
                            <p className="pp-info-label">
                                <Calendar size={14} /> Период
                            </p>
                            <p className="pp-info-value">
                                {formatDateToDayMonth(project.startDate)} — {formatDateToDayMonth(project.expectedEndDate)}
                            </p>
                        </div>
                        <div className="pp-info-item">
                            <p className="pp-info-label">
                                <Lock size={14} /> Публичный
                            </p>
                            <p className="pp-info-value">{project.isPrivate ? "Нет" : "Да"}</p>
                        </div>
                        <div className="pp-info-item">
                            <p className="pp-info-label">Менеджер</p>
                            <p className="pp-info-value">{project.head || 'Не назначен'}</p>
                        </div>
                    </div>

                    {/* Contributors Section */}
                    <div className="pp-card pp-contributors-section">
                        <div className="pp-section-header">
                            <h2 className="pp-section-title">
                                <Users size={20} className="text-blue" />
                                Участники
                            </h2>
                            <button className="pp-action-sm-btn">
                                <Plus size={16} /> Добавить участника
                            </button>
                        </div>
                        {/* Обертка для твоего компонента участников */}
                        <div className="pp-contributors-wrapper">
                            <ProjectContributorsComponent projectId={projectIdNumber} />
                        </div>
                    </div>

                    {/* Task Status Overview */}
                    <div className="pp-tasks-section">
                        <h2 className="pp-section-title-standalone">Обзор состояния задач</h2>
                        {/* Компонент с состояниями. Стили для него заданы ниже в CSS */}
                        <ProjectTasksState projectId={projectIdNumber} />
                    </div>

                    {/* Big Navigation Button */}
                    <div className="pp-action-container">
                        <button onClick={handleBoardsNavigation} className="pp-action-lg-btn">
                            Перейти к доскам проекта
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            ) : activeTab === "docs" ? (
                <ProjectDocumentsComponent projectId={projectIdNumber} />
            ) : activeTab === "settings" && project ? (
                <ProjectSettingsForm project={project} onUpdate={fetchProject} />
            ) : activeTab === "analytics" && project ? (
                <Analitycs projectId={project.id} />
            ) : null}
        </div>
    );
};