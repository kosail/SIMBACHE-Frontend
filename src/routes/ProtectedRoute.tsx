import useAuth from "../hooks/useAuth.ts";
import {Navigate, Outlet, useLocation} from "react-router-dom";

export default function ProtectedRoute() {
    const { loginData } = useAuth();
    const location = useLocation();

    if (!loginData) return <Navigate to={"/login"} replace state={{ from: location.pathname + location.search }} />;

    return <Outlet />;
}