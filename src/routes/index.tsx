import { Routes, Route, HashRouter } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages"
import ChangeDeleteNumber from "../pages/ChangeNumber"
import CreateTemplateAccordion from "../pages/Template/Create/TemplateAccordeon"
import ListAll from "../pages/Template/List/ListAll"
import Accordion from "../pages/Template/TriggerAccordion"
import TriggerList from "../pages/Template/TriggerList"

const Router = () => (
    <HashRouter>
        <Routes>
            <Route path='/add' element={<AddNumber />} />
            <Route path='/change' element={<ChangeDeleteNumber />} />
            <Route path='/template-create' element={<CreateTemplateAccordion />} />
            <Route path='/template-list' element={<ListAll />} />
            <Route path='/trigger-list' element={<TriggerList />} />
            <Route path='/template-trigger' element={<Accordion />} />
            <Route path='/' element={<AllPhones />} />
        </Routes>
    </HashRouter>

)

export default Router