import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Line } from "react-chartjs-2";
import { ru } from "date-fns/locale";
import { Funnel } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import '../../styles/project-analytics.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const priorityLabels = ["Очень низкий", "Низкий", "Средний", "Высокий", "Критический"];

const intervalOptions = [
    { label: "Неделя", days: 7 },
    { label: "2 недели", days: 14 },
    { label: "Месяц", days: 30 },
    { label: "3 месяца", days: 90 },
    { label: "6 месяцев", days: 180 },
    { label: "Всё время", days: null }
];

interface BurndownChartProps {
    projectId: number;
}

interface DataItem {
    date: string;
    value: number;
}

export const BurndownChart = ({ projectId }: BurndownChartProps) => {
    const [priority, setPriority] = useState<number>(2);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
    });
    const [interval, setIntervalOption] = useState<typeof intervalOptions[0]>(intervalOptions[0]);
    const [data, setData] = useState<DataItem[]>([]);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    useEffect(() => {
        if (interval && startDate) {
            const newEndDate = new Date(startDate);
            if (interval.days !== null) {
                newEndDate.setDate(startDate.getDate() + interval.days);
            } else {
                newEndDate.setFullYear(startDate.getFullYear() + 10);
            }
            setEndDate(newEndDate);
        }
    }, [interval, startDate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `/api/analytics/burndown?ProjectId=${projectId}&Priority=${priority}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const raw = response.data.tasksCountByDate || {};

                const filteredData = Object.entries(raw)
                    .map(([date, value]) => ({
                        date: new Date(date),
                        value: value as number
                    }))
                    .filter(item => (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate))
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map(item => ({
                        date: item.date.toLocaleDateString("ru-RU"),
                        value: item.value
                    }));

                setData(filteredData);
            } catch (error) {
                console.error("Ошибка при получении данных диаграммы:", error);
            }
        };

        fetchData();
    }, [projectId, priority, startDate, endDate]);

    const chartData = {
        labels: data.map(item => item.date),
        datasets: [
            {
                label: "Оставшиеся задачи",
                data: data.map(item => item.value),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.06)",
                borderWidth: 3,
                pointBackgroundColor: "#3b82f6",
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false // Скрываем легенду, так как название графика уже есть в шапке
            },
            tooltip: {
                backgroundColor: "#0f172a",
                titleColor: "#ffffff",
                bodyColor: "#94a3b8",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "#64748b",
                    font: { size: 12, family: "Inter" }
                },
                grid: { display: false }
            },
            y: {
                ticks: {
                    color: "#64748b",
                    font: { size: 12, family: "Inter" },
                    callback: (value: any) => Number.isInteger(value) ? value : null
                },
                grid: { color: "rgba(255, 255, 255, 0.04)" }
            }
        }
    };

    return (
        <div className="burndown-container">
            <div className="burndown-header">
                <div>
                    <h2 className="burndown-title">Диаграмма сгорания задач</h2>
                    <p className="burndown-subtitle">Контроль динамики выполнения текущего спринта</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(prev => !prev)}
                    className={`burndown-toggle-button ${showFilters ? 'active' : ''}`}
                    title="Фильтры"
                >
                    <Funnel size={20} />
                    <span>Фильтры</span>
                </button>

                {/* Выпадающая панель фильтров (теперь жестко привязана к контейнеру) */}
                {showFilters && (
                    <div className="burndown-filters-dropdown">
                        <div className="burndown-filter-block">
                            <label className="filter-block-label">Приоритет задач</label>
                            <div className="burndown-button-group">
                                {priorityLabels.map((label, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setPriority(index)}
                                        className={`burndown-filter-btn ${priority === index ? 'active' : ''}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setPriority(99)}
                                    className={`burndown-filter-btn ${priority === 99 ? 'active' : ''}`}
                                >
                                    Любой
                                </button>
                            </div>
                        </div>

                        <div className="burndown-filter-block">
                            <label className="filter-block-label">Быстрый интервал</label>
                            <div className="burndown-button-group">
                                {intervalOptions.map(opt => (
                                    <button
                                        key={opt.label}
                                        type="button"
                                        onClick={() => setIntervalOption(opt)}
                                        className={`burndown-filter-btn ${interval?.label === opt.label ? 'active' : ''}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="burndown-custom-date-section">
                            <span className="custom-date-title">Произвольный период</span>
                            <div className="date-pickers-row">
                                <div className="date-input-field">
                                    <label>От</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="dd.MM.yyyy"
                                        className="burndown-datepicker"
                                        locale={ru}
                                    />
                                </div>
                                <div className="date-input-field">
                                    <label>До</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="dd.MM.yyyy"
                                        className="burndown-datepicker"
                                        locale={ru}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Обертка для фиксации высоты холста графика */}
            <div className="burndown-chart-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};