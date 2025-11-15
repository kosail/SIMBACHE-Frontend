import useAuth from "../hooks/auth/useAuth.ts";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {FeedbackUI} from "../components/feedback/FeedbackUI.tsx";
import {Container} from "@mui/material";

export default function RootLayout() {
    const { loginData } = useAuth();
    const location = useLocation();

    if (!loginData) return <Navigate to={"/"} replace state={{ from: location.pathname + location.search }} />;

    return (
        <Container maxWidth={false} disableGutters>
            <Outlet />
            <FeedbackUI />
        </Container>
    );
}