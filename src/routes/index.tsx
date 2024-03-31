import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages"
import ChangeDeleteNumber from "../pages/ChangeNumber"
import CreateTemplateAccordion from "../pages/Template/Create/Accordeon"
import { CreateTemplate } from "../pages/Template/Create/CreateTemplate"
import ListAll from "../pages/Template/List/ListAll"
import SendTemplate from "../pages/Template/Send"
import Accordion from "../pages/Template/Accordion"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            {<Route path='/change' element={<ChangeDeleteNumber />} />}
            <Route path='/template/create-config' element={<CreateTemplateAccordion />} />
            <Route path='/template/create' element={<CreateTemplate />} />
            <Route path='/template/list' element={<ListAll />} />
            <Route path='/template/send' element={<SendTemplate />} />
            <Route path='/template/accordeon' element={<Accordion />} />
            <Route path='/' element={<AllPhones />} />
        </Routes>
    </BrowserRouter>

)

export default Router