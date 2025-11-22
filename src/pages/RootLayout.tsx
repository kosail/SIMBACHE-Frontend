import useAuth from "../hooks/auth/useAuth.ts";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {FeedbackUI} from "../components/feedback/FeedbackUI.tsx";
import {Box, Container, Fade} from "@mui/material";
import Sidebar from "../components/layout/Sidebar.tsx";

export default function RootLayout() {
    const { loginData } = useAuth();
    const location = useLocation();
    const drawerWidth = 240;

    if (!loginData) return <Navigate to={"/"} replace state={{ from: location.pathname + location.search }} />;

    return (
        <Container maxWidth={false} disableGutters>
            <Sidebar drawerWidth={drawerWidth} />

            <Fade key={location.pathname} in={true} timeout={250}>
                <Box sx={{
                    flexGrow: 1,
                    ml: `${drawerWidth}px`,
                    width: `calc(100% - ${drawerWidth}px)`,
                }}>
                    <Outlet />
                </Box>
            </Fade>

            <FeedbackUI />
        </Container>
    );
}