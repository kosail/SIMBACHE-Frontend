import {createBrowserRouter, createRoutesFromElements, Route} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.tsx";
import SecureContainer from "../pages/secure/SecureContainer.tsx";
import Login from "../pages/Login.tsx";

const MainRouter = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path={'/'} element={<Login />} />
            <Route path={'/login'} element={<Login />} />

            {/* Protected routes */}
            <Route path={'secure'} element={<ProtectedRoute />}>
                <Route path={'home'} element={<SecureContainer />} />
            </Route>
        </>
    )
);

export default MainRouter;