import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../Smarters/AddNumber"
import AllPhones from "../Smarters"
import ChangeDeleteNumber from "../Smarters/ChangeDeleteNumber"
import ListProjects from "../pages/RelatorioGestao"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            <Route path='/list' element={<ListProjects />} />
            <Route path='/' element={<AllPhones />} />
            {<Route path='/change' element={<ChangeDeleteNumber />} />}
        </Routes>
    </BrowserRouter>

)

export default Router