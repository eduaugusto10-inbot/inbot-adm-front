import api from '../../utils/api';
import React, { useState, useEffect } from 'react';
import ListProjects from "../RelatorioGestao"
import './panel.css';
import { useNavigate } from 'react-router-dom';

const Panel = () => {
  // Use States
  const [useAPI, setUseApi] = useState([]);

  const [query, setQuery] = useState("");

  const [searchParams, setSearchParams] = useState([]);

  const [checkBox, setCheckBox] = useState({
    ativo: true,
    inativo: false,
    simAssinante: true,
    naoAssinante: false,
    start: true,
    lite: true,
    business: true,
    enterprise: true,
    outro: false,
  })

  // Use Effect
  useEffect(() => {
    api.get('/report')
      .then(res => {
        setUseApi(res.data);
        setSearchParams(res.data);
      })
      .catch(error => console.log(error));
  }, []);

  // Use History
  const navigate = useNavigate();

  // Functions
  function checkBoxState(name: string, state: boolean) {
    setCheckBox({ ...checkBox, [name]: state });
  }

  function statusBot(objStatus: any) {
    if (checkBox.ativo && !checkBox.inativo) {
      objStatus = objStatus.filter((item: any) => item.bot_active === "1");
    }
    if (!checkBox.ativo && checkBox.inativo) {
      objStatus = objStatus.filter((item: any) => item.bot_active === "0");
    }
    if (!checkBox.ativo && !checkBox.inativo) {
      objStatus = [];
    }
    return objStatus;
  }

  function subscribers(objSub: any) {
    if (checkBox.simAssinante && !checkBox.naoAssinante) {
      objSub = objSub.filter((item: any) => item.bot_customer_paid === "1");
    }
    if (!checkBox.simAssinante && checkBox.naoAssinante) {
      objSub = objSub.filter((item: any) => item.bot_customer_paid === "0");
    }
    if (!checkBox.simAssinante && !checkBox.naoAssinante) {
      objSub = [];
    }
    return objSub;
  }

  function contractStatus(objStatus: any) {
    if (!checkBox.start) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Start");
    }
    if (!checkBox.lite) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Lite");
    }
    if (!checkBox.outro) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Outro");
    }
    if (!checkBox.business) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Business");
    }
    if (!checkBox.enterprise) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Enterprise");
    }
    return objStatus;
  }

  function newQuery(obj: any) {
    const regex = new RegExp(query, "gi");
    const filteredByName  = obj.filter((item: any) => item.bot_project_name.match(regex));

    if (filteredByName.length > 0) {
      return filteredByName;
    }
    
    obj = obj.filter((item: any) => item.bot_id.toString().match(regex));
    return obj;
  }

  function search() {
    let obj = useAPI;
    obj = statusBot(obj);
    obj = subscribers(obj);
    obj = contractStatus(obj);
    obj = newQuery(obj);
    setSearchParams(obj);
    console.log(obj)
  }

  // Return
  return (
    <><body>
      <div id="container">
        <b>
          <button onClick={() => navigate(-1)}>← VOLTAR</button>
        </b>
        <h2>Relatório - Gestão da Operação</h2>
        <div id="search-container">
          <fieldset>
            <legend>Procurar</legend>
            <input
              type="text"
              id="input-search"
              onKeyUp={(event) => {
                let target = event.target as HTMLInputElement;
                setQuery(target.value);
                search();
              }}
              placeholder="Digite o nome ou id" />
            <form>
        </form>
          </fieldset>
          <fieldset>
            <legend>Status do bot</legend>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="bot-enable"
                  onChange={(event) => {
                    checkBox.ativo = (event.target as HTMLInputElement).checked
                    checkBoxState("ativo",  checkBox.ativo)
                    search();
                  }} 
                  checked={checkBox.ativo}/>
                <label>Ativo</label>
              </div>
              <div>
                <input 
                  type="checkbox" 
                  id="bot-disable" 
                  onChange={(event) => {
                    checkBox.inativo = (event.target as HTMLInputElement).checked
                    checkBoxState("inativo",  checkBox.inativo)
                    search();
                  }} 
                  checked={checkBox.inativo}
                  />
                <label>Inativo</label>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>Assinante</legend>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="subscriber"
                  onChange={(event) => {
                    checkBox.simAssinante = (event.target as HTMLInputElement).checked
                    checkBoxState("simAssinante",  checkBox.simAssinante)
                    search();
                  }} 
                  checked={checkBox.simAssinante}/>
                <label>Sim</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="non-subscriber" 
                onChange={(event) => {
                    checkBox.naoAssinante = (event.target as HTMLInputElement).checked
                    checkBoxState("naoAssinante",  checkBox.naoAssinante)
                    search();
                  }} 
                  checked={checkBox.naoAssinante}/>
                <label>Não</label>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>Tipo de contrato</legend>
            <div>
              <div>
                <input 
                type="checkbox" 
                id="contract-start" 
                onChange={(event) => {
                    checkBox.start = (event.target as HTMLInputElement).checked
                    checkBoxState("start",  checkBox.start)
                    search();
                  }} 
                  checked={checkBox.start}/>
                <label>Start</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-lite" 
                onChange={(event) => {
                    checkBox.lite = (event.target as HTMLInputElement).checked
                    checkBoxState("lite",  checkBox.lite)
                    search();
                  }} 
                  checked={checkBox.lite}/>
                <label>Lite</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-business" 
                onChange={(event) => {
                    checkBox.business = (event.target as HTMLInputElement).checked
                    checkBoxState("business",  checkBox.business)
                    search();
                  }} 
                  checked={checkBox.business}/>
                <label>Business</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-enterprise" 
                onChange={(event) => {
                    checkBox.enterprise = (event.target as HTMLInputElement).checked
                    checkBoxState("enterprise",  checkBox.enterprise)
                    search();
                  }} 
                  checked={checkBox.enterprise}/>
                <label>Enterprise</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-outro" 
                onChange={(event) => {
                    checkBox.outro = (event.target as HTMLInputElement).checked
                    checkBoxState("outro",  checkBox.outro)
                    search();
                  }} 
                  checked={checkBox.outro}/>
                <label>Outro</label>
              </div>
            </div>
          </fieldset>
        </div>
        <div>
          <legend style={{fontSize: "12px"}}>Utilização do plano contratado</legend>
          <div style={{display: "flex", flexDirection: "row", fontSize: "12px"}}>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "yellow", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- 0 a 30%</label>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "blue", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- 31 a 70%</label>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "green", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- 71 a 100%</label>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "red", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- acima de 100%</label>
            </div>
          </div>
        </div>
      </div>
    <ListProjects search={searchParams} />
    </body>
    </>
  )
}

export default Panel