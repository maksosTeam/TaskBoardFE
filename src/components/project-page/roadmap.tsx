import { useEffect, useState } from "react";
import axios from "axios";
import { Map } from "lucide-react";

interface RoadmapProps {
    projectId: number;
}

interface ItemModel {
    id: number;
    title: string;
    itemTypeId: number;
    statusId: number;
    priority: number;
    startDate?: string;
    endDate?: string;
}

export const Roadmap = ({ projectId }: RoadmapProps) => {
    const [epics, setEpics] = useState<ItemModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchEpics = async () => {
            try {
                const token = localStorage.getItem("token");
                // Используем эндпоинт из твоего контроллера
                const response = await axios.get(
                    `/item/get-items-by/${projectId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Фильтруем только Эпики (itemTypeId === 2 согласно комментариям бэка)
                const projectEpics = response.data.filter((item: ItemModel) => item.itemTypeId === 2);
                setEpics(projectEpics);
            } catch (error) {
                console.error("Ошибка при получении эпиков:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEpics();
    }, [projectId]);

    if (loading) return <div className="analytics-loading">Загрузка дорожной карты...</div>;

    return (
        <div className="custom-chart-container">
            <div className="burndown-header">
                <div>
                    <h2 className="burndown-title">Дорожная карта (Roadmap)</h2>
                    <p className="burndown-subtitle">Глобальные эпики проекта</p>
                </div>
                <div className="header-icon-wrapper">
                    <Map size={24} color="#64748b" />
                </div>
            </div>

            <div className="roadmap-list">
                {epics.length === 0 ? (
                    <div className="empty-state">Нет активных эпиков в этом проекте</div>
                ) : (
                    epics.map(epic => (
                        <div key={epic.id} className="roadmap-epic-card">
                            <div className="epic-info">
                                <span className="epic-badge">EPIC-{epic.id}</span>
                                <h3 className="epic-title">{epic.title}</h3>
                            </div>
                            <div className="epic-dates">
                                {epic.startDate && epic.endDate
                                    ? `${new Date(epic.startDate).toLocaleDateString('ru-RU')} — ${new Date(epic.endDate).toLocaleDateString('ru-RU')}`
                                    : 'Даты не заданы'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
