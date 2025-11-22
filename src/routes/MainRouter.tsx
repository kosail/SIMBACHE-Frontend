import {createBrowserRouter, createRoutesFromElements, Route} from "react-router-dom";
import LandingPage from "../pages/public/LandingPage.tsx";
import Contact from "../pages/public/landingPages/Contact.tsx";

const MainRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path={'/'} element={<LandingPage />}>
            <Route path={'contact'} element={<Contact />} />
        </Route>
    )
);

export default MainRouter;