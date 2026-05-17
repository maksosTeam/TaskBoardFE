import { useState, useEffect } from "react";
import axios from "axios";
import { History } from "lucide-react";

export const ProjectHistoryLog = ({ projectId }: { projectId: number }) => {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`/api/analytics/history/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchHistory();
    }, [projectId]);

    return (
        <div className="custom-chart-container history-container">
            <div className="burndown-header">
                <div>
                    <h2 className="burndown-title">История проекта</h2>
                    <p className="burndown-subtitle">Лог изменений по проекту</p>
                </div>
                <div className="header-icon-wrapper">
                    <History size={24} color="#64748b" />
                </div>
            </div>

            <div className="history-timeline">
                {history.length === 0 ? (
                    <div className="empty-state">История пуста</div>
                ) : (
                    history.map((entry, idx) => (
                        <div key={idx} className="history-item">
                            <div className="history-dot"></div>
                            <div className="history-content">
                                {/* Замени поля на реальные из TaskHistoryModel */}
                                <div className="history-date">{new Date(entry.createdAt).toLocaleString()}</div>
                                <div className="history-action">{entry.action || entry.description}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
