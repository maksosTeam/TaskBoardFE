import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { CalendarDays } from "lucide-react";

interface GanttChartProps {
    projectId: number;
}

interface ItemModel {
    id: number;
    title: string;
    itemTypeId: number;
    startDate?: string;
    endDate?: string;
}

export const GanttChart = ({ projectId }: GanttChartProps) => {
    const [items, setItems] = useState<ItemModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `/item/get-items-by/${projectId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Исключаем эпики для детализированного Ганта, оставляем Tasks (1) и Bugs (3)
                const tasksAndBugs = response.data.filter((i: ItemModel) => i.itemTypeId !== 2 && i.startDate && i.endDate);
                setItems(tasksAndBugs);
            } catch (error) {
                console.error("Ошибка при получении данных для Ганта:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [projectId]);

    const { minDate, maxDate, totalDuration } = useMemo(() => {
        if (items.length === 0) return { minDate: 0, maxDate: 0, totalDuration: 0 };

        const starts = items.map(i => new Date(i.startDate!).getTime());
        const ends = items.map(i => new Date(i.endDate!).getTime());

        const min = Math.min(...starts);
        const max = Math.max(...ends);

        // Добавляем буфер в пару дней по краям для красоты
        const buffer = 2 * 24 * 60 * 60 * 1000;
        return {
            minDate: min - buffer,
            maxDate: max + buffer,
            totalDuration: (max + buffer) - (min - buffer)
        };
    }, [items]);

    const getTaskStyle = (startDate: string, endDate: string, typeId: number) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        const leftPercent = ((start - minDate) / totalDuration) * 100;
        const widthPercent = ((end - start) / totalDuration) * 100;

        return {
            left: `${leftPercent}%`,
            width: `${Math.max(widthPercent, 1)}%`, // Минимум 1% ширины
            backgroundColor: typeId === 3 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)' // Баги красные, таски синие
        };
    };

    if (loading) return <div className="analytics-loading">Загрузка диаграммы Ганта...</div>;

    return (
        <div className="custom-chart-container gantt-container">
            <div className="burndown-header">
                <div>
                    <h2 className="burndown-title">Диаграмма Ганта</h2>
                    <p className="burndown-subtitle">Распределение задач во времени</p>
                </div>
                <div className="header-icon-wrapper">
                    <CalendarDays size={24} color="#64748b" />
                </div>
            </div>


            <div className="gantt-wrapper">
                {items.length === 0 ? (
                    <div className="empty-state">Нет задач с заданными датами для отображения</div>
                ) : (
                    <div className="gantt-chart-area">
                        {/* Рисуем задачи */}
                        {items.map(item => (
                            <div key={item.id} className="gantt-row">
                                <div className="gantt-task-label">
                                    <span className="task-id">#{item.id}</span> {item.title}
                                </div>
                                <div className="gantt-timeline">
                                    <div
                                        className="gantt-bar"
                                        style={getTaskStyle(item.startDate!, item.endDate!, item.itemTypeId)}
                                        title={`${item.title} \nТип: ${item.itemTypeId === 3 ? 'Bug' : 'Task'}`}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
