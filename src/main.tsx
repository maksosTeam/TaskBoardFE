import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'
import './styles/fonts.css';

import {BoardPage} from "./pages/board-page.tsx";
import {MainPage} from "./pages/main-page.tsx";
import {TasksPage} from "./pages/tasks-page.tsx";
import {LoginPage} from "./pages/autorization/LoginPage.tsx";
import {RegisterPage} from "./pages/autorization/RegisterPage.tsx";
import {ProjectsPage} from "./pages/projects-page.tsx";
import {BoardsTable} from "./pages/boards-table.tsx";
import {WelcomePage} from "./pages/welcome-page.tsx";
import {SessionExpiredPage} from "./pages/session-expired-page.tsx";

import {UserSettings} from "./pages/user-settings-page.tsx";
import {ProjectPage} from "./pages/project-page";
import { Provider } from 'react-redux';
import { store } from './store';

import { InviteRedirectPage } from "./pages/invite-redirect-page.tsx";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Provider store={store}>
        <Routes>
            <Route index element={<Navigate to="welcome" />} />
            <Route path='welcome' element={<WelcomePage/>} />
            <Route path='login' element={<LoginPage/>} />
            <Route path='register' element={<RegisterPage/>} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />


            <Route path='/home' element={<MainPage/>}>
                <Route index element={<Navigate to="projects" />} />
                <Route path="project/:projectId" element={<ProjectPage />} />
                <Route path='project/:projectId/boards/:boardId?' element={<BoardPage/>} />
                <Route path='projects' element={<ProjectsPage/>} />
                <Route path='boards' element={<BoardsTable />} />
                <Route path='tasks' element={<TasksPage />} />
                <Route path='settings' element={<UserSettings/>} />
            </Route>

            <Route path="/project/invite/:token" element={<InviteRedirectPage />} />
        </Routes>
        </Provider>
    </BrowserRouter>
)
