// GanttChart.tsx
import React, { useEffect, useState } from 'react';
import Chart from 'react-google-charts';
import '../../styles/GanttChart.css';

interface Assignee {
    userName: string;
    imagePath: string;
}

interface Task {
    id: string;
    parent: string | null;
    name: string;
    start: string;
    end: string;
    status: string;
    assignee: Assignee[];
}

interface GanttChartProps {
    projectId: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`/api/analytics/gantt-chart/${projectId}`, {
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных');
                }

                const data: Task[] = await response.json();
                setTasks(data);
            } catch (err) {
                setError((err as Error).message);
            }
        };

        fetchTasks();
    }, [projectId]);

    if (error) {
        return <div className="error">Ошибка: {error}</div>;
    }

    if (!tasks.length) {
        return <div className="loading">Загрузка...</div>;
    }

    // Преобразование данных для диаграммы Ганта
    const chartData = [
        [
            { type: 'string', label: 'Task ID' },
            { type: 'string', label: 'Task Name' },
            { type: 'string', label: 'Resource' },
            { type: 'date', label: 'Start Date' },
            { type: 'date', label: 'End Date' },
            { type: 'number', label: 'Duration' },
            { type: 'number', label: 'Percent Complete' },
            { type: 'string', label: 'Dependencies' },
        ],
        ...tasks.map((task) => [
            task.id,
            task.name,
            task.assignee.map((a) => a.userName).join(', '),
            new Date(task.start),
            new Date(task.end),
            null, // Длительность вычисляется автоматически
            task.status === 'На исполнении' ? 50 : task.status === 'В очереди' ? 0 : 100, // Пример процента выполнения
            task.parent || null,
        ]),
    ];

    return (
        <div className="gantt-chart-container">
            <Chart
                chartType="Gantt"
                width="100%"
                height={`${tasks.length * 50 + 50}px`}
                data={chartData}
                options={{
                    height: tasks.length * 50 + 50,
                    gantt: {
                        trackHeight: 40,
                        labelStyle: {
                            fontName: 'Arial',
                            fontSize: 14,
                            color: '#ffffff',
                        },
                        barCornerRadius: 4,
                        criticalPathEnabled: false,
                        arrow: {
                            angle: 100,
                            width: 2,
                            color: '#ffffff',
                            radius: 0,
                        },
                    },
                    backgroundColor: '#1e1e1e',
                }}
            />
        </div>
    );
};
