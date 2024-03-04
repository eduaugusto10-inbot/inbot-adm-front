import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages" 
import ChangeDeleteNumber from "../pages/ChangeNumber"
import { CreateTemplate } from "../pages/Template/Create"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            {<Route path='/change' element={<ChangeDeleteNumber />} />}
            <Route path='/create-template' element={<CreateTemplate />} />
            <Route path='/' element={<AllPhones />} />
        </Routes>
    </BrowserRouter>

)

export default Router