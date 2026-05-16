import { useState, useEffect } from "react";
import { ProjectTableComponent } from "../components/projects-page/project-table-component.tsx";
import {SearchIcon} from "lucide-react";
import '../styles/project-page/projects-page.css';

export const ProjectsPage = () => {
    const [search, setSearch] = useState("");
    useEffect(() => {
        document.title = 'Проекты'
    }, []);

    return (
        <div>
            <div className="search-container" >
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="project-search-input"
                />
                <SearchIcon className="search-icon" size={18} />
            </div>
            <ProjectTableComponent search={search} />
        </div>
    );
};
