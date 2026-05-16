import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import axios from 'axios';
import '../../styles/roadmap.css'

// Интерфейсы для данных
interface Assignee {
    userName: string;
    imagePath: string;
}

interface Task {
    id: number;
    title: string;
    start: string;
    end: string;
    status: string;
    assignees: Assignee[];
}

interface RoadmapProps {
    projectId: number;
}

export const Roadmap: React.FC<RoadmapProps> = ({ projectId }) => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    // Функция для получения данных с API
    const fetchRoadmapData = async () => {
        try {
            const response = await axios.get<Task[]>(
                `/api/analytics/roadmap/${projectId}`,
                {
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIyIiwianRpIjoiODliNDk5NTEtNzg5Ni00MTA3LWI2NDMtODNhZTBiOTEyZWEyIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVVNFUiIsImV4cCI6MTc1MDQ4NTMzNiwiaXNzIjoiVGFza0JvYXJkIiwiYXVkIjoiVGFza0JvYXJkQXVkaWVuY2UifQ.18AUjQV-Y3UeupbHELTAWNhUbOieb5sxZq7Op2oQB-U`,
                    },
                }
            );

            const validTasks = response.data.filter(
                (task) => new Date(task.start) <= new Date(task.end)
            );

            // Формируем данные для react-google-charts
            const data = [
                [
                    { type: 'string', id: 'Task Name' },
                    { type: 'string', id: 'Resource' },
                    { type: 'date', id: 'Start' },
                    { type: 'date', id: 'End' },
                    { type: 'string', role: 'tooltip' }, // Колонка для всплывающей подсказки
                ],
                ...validTasks.map((task) => [
                    task.title,
                    task.status,
                    new Date(task.start),
                    new Date(task.end),
                    `Исполнители: ${task.assignees.map((a) => a.userName).join(', ')}\nСтатус: ${task.status}`,
                ]),
            ];

            setChartData(data);
            setLoading(false);
        } catch (err) {
            setError('Ошибка при загрузке данных');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmapData();
    }, [projectId]);

    if (loading) return <div className="roadmap-loading">Загрузка...</div>;
    if (error) return <div className="roadmap-error">{error}</div>;

    return (
        <div className="roadmap-container">
            <h2>Дорожная карта проекта</h2>
            <Chart
                chartType="Timeline"
                data={chartData}
                width="100%"
                height="400px"
                options={{
                    timeline: {
                        showRowLabels: true,
                        colorByRowLabel: true,
                    },
                    backgroundColor: '#1e1e2f',
                    hAxis: {
                        textStyle: { color: '#ffffff' },
                        gridlines: { color: '#3a3a5c' },
                    },
                    vAxis: {
                        textStyle: { color: '#ffffff' },
                    },
                    colors: ['#28a745', '#ffc107'], // Зеленый для "Готово", желтый для "В очереди"
                }}
            />
        </div>
    );
};
