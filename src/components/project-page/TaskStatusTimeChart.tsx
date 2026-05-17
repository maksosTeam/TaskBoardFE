import { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Clock, Search } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatusTimeData {
    [statusName: string]: number; // Предполагаем, что бэк возвращает словарь {"To Do": 12.5, "In Progress": 4.2}
}

export const TaskStatusTimeChart = () => {
    const [taskId, setTaskId] = useState<string>("");
    const [chartData, setChartData] = useState<StatusTimeData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTaskTime = async () => {
        if (!taskId) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/analytics/get-avg-time-in-statuses/${taskId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChartData(response.data);
        } catch (err: any) {
            setError(err.response?.data || "Ошибка при загрузке данных задачи");
            setChartData(null);
        } finally {
            setLoading(false);
        }
    };

    const data = {
        labels: chartData ? Object.keys(chartData) : [],
        datasets: [
            {
                label: "Время в статусе (часов/дней)",
                data: chartData ? Object.values(chartData) : [],
                backgroundColor: "rgba(168, 85, 247, 0.6)", // Фиолетовый акцент
                borderColor: "#a855f7",
                borderWidth: 1,
                borderRadius: 6,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#0f172a",
                titleColor: "#ffffff",
                bodyColor: "#94a3b8",
            }
        },
        scales: {
            y: {
                grid: { color: "rgba(255, 255, 255, 0.04)" },
                ticks: { color: "#64748b" }
            },
            x: {
                grid: { display: false },
                ticks: { color: "#64748b" }
            }
        }
    };

    return (
        <div className="custom-chart-container task-time-container">
            <div className="burndown-header">
                <div>
                    <h2 className="burndown-title">Время в статусах</h2>
                    <p className="burndown-subtitle">Анализ жизненного цикла конкретной задачи</p>
                </div>
                <div className="header-icon-wrapper">
                    <Clock size={24} color="#64748b" />
                </div>
            </div>

            <div className="task-search-row">
                <div className="search-input-wrapper">
                    <Search size={16} color="#64748b" />
                    <input
                        type="number"
                        placeholder="Введите ID задачи..."
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        className="task-search-input"
                    />
                </div>
                <button onClick={fetchTaskTime} className="burndown-toggle-button active">
                    Найти
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}


            <div className="bar-chart-wrapper">
                {loading ? (
                    <div className="analytics-loading">Загрузка...</div>
                ) : chartData ? (
                    <Bar data={data} options={options} />
                ) : (
                    <div className="empty-state">Введите ID задачи для отображения статистики</div>
                )}
            </div>
        </div>
    );
};
