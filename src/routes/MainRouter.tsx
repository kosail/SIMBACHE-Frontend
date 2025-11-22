import {createBrowserRouter, createRoutesFromElements, Route} from "react-router-dom";
import RootLayout from "../pages/RootLayout.tsx";
import Login from "../pages/Login.tsx";
import Home from "../pages/Home.tsx";
import Potholes from "../pages/Potholes.tsx";
import Settings from "../pages/Settings.tsx";

const MainRouter = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path={'/'} element={<Login />} />

            {/* Protected routes */}
            <Route path={'secure'} element={<RootLayout />}>
                <Route path={'home'} element={<Home />} />
                <Route path={'potholes'} element={<Potholes />} />
                <Route path={'settings'} element={<Settings />} />
            </Route>
        </>
    )
);

export default MainRouter;