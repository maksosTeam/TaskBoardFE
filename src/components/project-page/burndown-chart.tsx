import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Line } from "react-chartjs-2";
import {Funnel} from "lucide-react";
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
import '../../styles/project-analytics.css'
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

export const BurndownChart = ({ projectId }) => {
    const [priority, setPriority] = useState(2);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
    });
    const [interval, setInterval] = useState(intervalOptions[0]);
    const [data, setData] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (interval) {
            const newEndDate = new Date(startDate);
            if (interval.days !== null) {
                newEndDate.setDate(startDate.getDate() + interval.days);
            } else {
                // Для "Всё время" можно установить очень далекую дату или оставить как есть
                newEndDate.setFullYear(startDate.getFullYear() + 100);
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

                const raw = response.data.tasksCountByDate;

                const filteredData = Object.entries(raw)
                    .map(([date, value]) => ({
                        date: new Date(date),
                        value
                    }))
                    .filter(item => (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate))
                    .sort((a, b) => a.date - b.date)
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
                label: "Количество задач",
                data: data.map(item => item.value),
                borderColor: "#90acc7",
                backgroundColor: "rgba(102, 178, 255, 0.1)",
                tension: 0.4,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: "#7188a0",
                    font: { size: 14 }
                }
            },
            tooltip: {
                backgroundColor: "#1E2A38",
                titleColor: "#ffffff",
                bodyColor: "#ffffff"
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "#7188a0",
                    font: { size: 13 }
                },
                grid: {
                    display: false
                }
            },
            y: {
                ticks: {
                    color: "#7188a0",
                    font: { size: 13 },
                    callback: (value) => Number.isInteger(value) ? value : null
                },
                grid: {
                    color: "#2A415B"
                }
            }
        }
    };

    return (
        <div className="burndown-container">
            <div className="burndown-header">
                <h2 className="burndown-title">Диаграмма сгорания задач</h2>
                <button
                    onClick={() => setShowFilters(prev => !prev)}
                    className="burndown-toggle-button"
                >
                    <Funnel size={26} />
                </button>
            </div>

            {showFilters && (
                <div className="burndown-filters">
                    <div className="burndown-filter-block">
                        <label>Приоритет</label>
                        <div className="burndown-button-group">
                            {priorityLabels.map((label, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPriority(index)}
                                    className={`burndown-button ${priority === index ? 'active' : ''}`}
                                >
                                    {label}
                                </button>
                            ))}
                            <button
                                onClick={() => setPriority(99)}
                                className={`burndown-button ${priority === 99 ? 'active' : ''}`}
                            >
                                Любой
                            </button>
                        </div>
                    </div>

                    <div className="burndown-filter-block">
                        <label>Интервал</label>
                        <div className="burndown-button-group">
                            {intervalOptions.map(opt => (
                                <button
                                    key={opt.label}
                                    onClick={() => setInterval(opt)}
                                    className={`burndown-button ${interval?.label === opt.label ? 'active' : ''}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="burndown-filter-block-container">

                        <div className='burndown-label-user-date'>
                            Определено пользователем
                        </div>
                        <div>
                            <div className="burndown-filter-block">
                                <label>От: </label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="dd.MM.yyyy"
                                    className="burndown-datepicker"
                                />
                            </div>

                            <div className="burndown-filter-block">
                                <label>До: </label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="dd.MM.yyyy"
                                    className="burndown-datepicker"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            )}

            <Line data={chartData} options={options} />
        </div>
    );
};
