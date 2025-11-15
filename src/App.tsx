import {RouterProvider} from "react-router-dom";
import MainRouter from "./routes/MainRouter.tsx";

function App() {
    return (
        <RouterProvider router={MainRouter} />
    )
}

export default App
