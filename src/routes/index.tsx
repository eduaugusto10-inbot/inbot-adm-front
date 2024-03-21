import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages" 
import ChangeDeleteNumber from "../pages/ChangeNumber"
import { CreateTemplateConfig } from "../pages/Template/Create/Configure"
import { CreateTemplate } from "../pages/Template/Create/CreateTemplate"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            {<Route path='/change' element={<ChangeDeleteNumber />} />}
            <Route path='/create-template' element={<CreateTemplateConfig />} />
            <Route path='/create-template2' element={<CreateTemplate />} />
            <Route path='/' element={<AllPhones />} />
        </Routes>
    </BrowserRouter>

)

export default Router