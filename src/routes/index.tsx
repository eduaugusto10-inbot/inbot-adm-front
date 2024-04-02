import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages"
import ChangeDeleteNumber from "../pages/ChangeNumber"
import CreateTemplateAccordion from "../pages/Template/Create/TemplateAccordeon"
import ListAll from "../pages/Template/List/ListAll"
import Accordion from "../pages/Template/TriggerAccordion"

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<AllPhones />} />
            <Route path='add' element={<AddNumber />} />
            <Route path='change' element={<ChangeDeleteNumber />} />
            <Route path='template'>
                <Route path='create-config' element={<CreateTemplateAccordion />} />
                <Route path='list' element={<ListAll />} />
                <Route path='trigger' element={<Accordion />} />
            </Route>
        </Routes>
    </BrowserRouter>

)

export default Router