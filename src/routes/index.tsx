import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FunctionComponent } from 'react';
import AddNumber from "../Smarters/AddNumber";
import AllPhones from "../Smarters";
import ChangeDeleteNumber from "../Smarters/ChangeDeleteNumber";
import Panel from "../pages/RelatorioGestao/Panel";
import checkAuth from "../utils/cookie";

interface ProtectedRouteProps {
    element: FunctionComponent;
    path: string;
}

const ProtectedRoute: FunctionComponent<ProtectedRouteProps> = ({ element: Component, path, ...rest }) => {
    return <Component {...rest} />;
    /*if (checkAuth()) {
        return <Component {...rest} />;
    } else {
        window.location.replace("http://stackoverflow.com");
        return null;
    }
    */
}

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<ProtectedRoute element={AddNumber} path={""} />} />
            <Route path='/list' element={<ProtectedRoute element={Panel} path={""} />} />
            <Route path='/' element={<ProtectedRoute element={AllPhones} path={""} />} />
            <Route path='/change' element={<ProtectedRoute element={ChangeDeleteNumber} path={""} />} />
        </Routes>
    </BrowserRouter>
)

export default Router;