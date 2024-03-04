import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../Smarters/AddNumber"
import AllPhones from "../Smarters"
import ChangeDeleteNumber from "../Smarters/ChangeDeleteNumber"
import Panel from "../pages/RelatorioGestao/Panel"
import Oauth from "../pages/OAuth/Oauth"
import OauthSuccess from "../pages/OAuth/OauthSuccess"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            <Route path='/list' element={<Panel />} />
            <Route path='/oauth' element={<Oauth />} />
            <Route path='/oauthsuccess' element={<OauthSuccess />} />
            <Route path='/' element={<AllPhones />} />
            <Route path='/change' element={<ChangeDeleteNumber />} />
        </Routes>
    </BrowserRouter>

)

export default Router