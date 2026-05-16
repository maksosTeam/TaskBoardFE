import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/invite-redirect-page.css";

export const InviteRedirectPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [projectName, setProjectName] = useState<string | null>(null);

    useEffect(() => {
        const fetchInviteData = async () => {
            try {
                const response = await axios.get(`/api/project/invite/${token}`);
                const { projectId, name } = response.data;
                setProjectId(projectId);
                setProjectName(name);
                const authToken = localStorage.getItem("token");

                await axios.post(
                    `/api/project/invite/${token}/join`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                navigate(`/home/project/${projectId}`);
            } catch (err: any) {
                console.error("Ошибка при обработке приглашения", err);
                setError(true);
                if (err.response?.data?.projectId) {
                    setProjectId(err.response.data.projectId);
                }
            }
        };

        if (token) {
            fetchInviteData();
        }
    }, [token, navigate]);

    if (error && projectId) {
        return (
            <div className="invite-error-container">
                <div className="invite-card">
                    <p>Вы уже вступили в проект {projectName}!</p>
                    <button className="invite-button" onClick={() => navigate(`/home/project/${projectId}`)}>
                        Перейти к проекту
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="invite-loader">
        <p>Обработка приглашения...</p>
        </div>
    );
};
