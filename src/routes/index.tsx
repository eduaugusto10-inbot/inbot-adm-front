import { Routes, Route, HashRouter } from "react-router-dom"
import AddNumber from "../pages/AddNumber"
import AllPhones from "../pages"
import ChangeDeleteNumber from "../pages/ChangeNumber"
import CreateTemplateAccordion from "../pages/Template/Create"
import CreateTemplateTeams from "../pages/TemplateTeams/Create"
import ListAll from "../pages/Template/List"
import Accordion from "../pages/Template/TriggerAccordion"
import TriggerList from "../pages/Template/TriggerList"
import TriggerDetails from "../pages/Template/TriggerDetails"
import UserManagerList from "../pages/UserManager/UserManagerList"
import Configuration from "../pages/UserManager/Configuration"
import WarningNoWhats from "../pages/Template/WarningNoWhats"
import TeamsList from "../pages/TemplateTeams/List"
import TeamAccordion from '../pages/TemplateTeams/TriggerAccordion';
const Router = () => (
    <HashRouter>
        <Routes>
            {/* ROTAS PARA O WHATSAPP */}
            <Route path='/' element={<AllPhones />} />
            <Route path='/add' element={<AddNumber />} />
            <Route path='/change' element={<ChangeDeleteNumber />} />
            {/* ROTAS PARA CRIAR DISPARO ATIVO WHATSAPP */}
            <Route path='/template-create' element={<CreateTemplateAccordion />} />
            <Route path='/template-list' element={<ListAll />} />
            <Route path='/trigger-list' element={<TriggerList />} />
            <Route path='/template-trigger' element={<Accordion />} />
            <Route path="/trigger-details" element={<TriggerDetails />} />
            {/* ROTAS PARA GESTÃO DE USUARIO */}
            <Route path="/user-manager-list" element={<UserManagerList />} />
            <Route path="/user-manager-configuration" element={<Configuration />} />
            {/** ROTAS PARA O TEAMS */}
            <Route path='/template-create-teams' element={<CreateTemplateTeams />} />
            <Route path='/template-list-teams' element={<TeamsList />} />
            <Route path='/template-trigger-teams' element={<TeamAccordion />} />
            {/* ROTAS CASO NAO HOUVER CADASTRO EM NOSSO SISTEMA */}
            <Route path='/template-warning-no-whats' element={<WarningNoWhats />} />
        </Routes>
    </HashRouter>

)

export default Router