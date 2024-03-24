import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages"
import ChangeDeleteNumber from "../pages/ChangeNumber"
import { CreateTemplateConfig } from "../pages/Template/Create/Configure"
import { CreateTemplate } from "../pages/Template/Create/CreateTemplate"
import ListAll from "../pages/Template/List/ListAll"
import SendTemplate from "../pages/Template/Send"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            {<Route path='/change' element={<ChangeDeleteNumber />} />}
            <Route path='/template/create-config' element={<CreateTemplateConfig />} />
            <Route path='/template/create' element={<CreateTemplate />} />
            <Route path='/template/list' element={<ListAll />} />
            <Route path='/template/send' element={<SendTemplate />} />
            <Route path='/' element={<AllPhones />} />
        </Routes>
    </BrowserRouter>

)

export default Router