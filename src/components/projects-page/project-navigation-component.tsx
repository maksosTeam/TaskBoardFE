import {useNavigate} from "react-router-dom";
import '../../styles/project-page/project-navigation.css'

export const ProjectNavigationComponent = () => {
    const navigate = useNavigate();

    return (
        <div className="project-navigation-component">
            <button onClick={() => navigate("/home/projects")}>Обзор</button>
            <button onClick={() => navigate("/project/boards")}>Доски</button>
            <button onClick={() => navigate("/project/tasks")}>Задачи</button>
            <button onClick={() => navigate("/project/docs")}>Документация</button>
        </div>
    );
};
