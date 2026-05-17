import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { CheckCircle2, ListChecks } from "lucide-react";
import { ru } from "date-fns/locale";

interface CompletedTasksReportProps {
    projectId: number;
}

export const CompletedTasksReport = ({ projectId }: CompletedTasksReportProps) => {
    const [startDate, setStartDate] = useState<Date>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30); // По умолчанию за месяц
        return d;
    });
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [count, setCount] = useState<number>(0);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchCompletedData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const params = {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                };

                // Запускаем запросы параллельно
                const [countRes, tasksRes] = await Promise.all([
                    axios.get(`/api/analytics/get-completed-task-count-between-dates/${projectId}`, { params, headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`/api/analytics/get-completed-tasks-between-datees/${projectId}`, { params, headers: { Authorization: `Bearer ${token}` } })
                ]);

                setCount(countRes.data);
                setTasks(tasksRes.data);
            } catch (error) {
                console.error("Ошибка при получении выполненных задач:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedData();
    }, [projectId, startDate, endDate]);

    return (
        <div className="custom-chart-container completed-tasks-container">
            <div className="burndown-header">
                <div>
                    <h2 className="burndown-title">Выполненные задачи</h2>
                    <p className="burndown-subtitle">Продуктивность за выбранный период</p>
                </div>
                <div className="header-icon-wrapper">
                    <ListChecks size={24} color="#64748b" />
                </div>
            </div>

            <div className="date-pickers-row" style={{ marginBottom: "20px" }}>
                <div className="date-input-field">
                    <label>Начало периода</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date) => setStartDate(date)}
                        dateFormat="dd.MM.yyyy"
                        className="burndown-datepicker"
                        locale={ru}
                    />
                </div>
                <div className="date-input-field">
                    <label>Конец периода</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date: Date) => setEndDate(date)}
                        dateFormat="dd.MM.yyyy"
                        className="burndown-datepicker"
                        locale={ru}
                    />
                </div>
            </div>

            <div className="completed-stats-board">
                <div className="stat-card">
                    <span className="stat-value">{loading ? "..." : count}</span>
                    <span className="stat-label">Задач закрыто</span>
                </div>
            </div>


            <div className="completed-tasks-list">
                {tasks.length === 0 && !loading ? (
                    <div className="empty-state">В этом периоде нет завершенных задач</div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="completed-task-item">
                            <CheckCircle2 size={18} color="#22c55e" />
                            <span className="ct-id">#{task.id}</span>
                            <span className="ct-title">{task.title}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
