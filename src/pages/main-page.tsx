import { SidebarComponent } from "../components/sidebar/sidebar-component";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser } from "../store/userSlice";
import { fetchProjects } from "../store/projectSlice";
import "../styles/main-page.css";

export const MainPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);

    useEffect(() => {
        dispatch(fetchCurrentUser())
            .unwrap()
            .then(() => {
                dispatch(fetchProjects());
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/session-expired");
            });
    }, [dispatch, navigate]);

    return (
        <div className="main-page-root">
            <div className="main-page">
                <SidebarComponent user={user} />
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
