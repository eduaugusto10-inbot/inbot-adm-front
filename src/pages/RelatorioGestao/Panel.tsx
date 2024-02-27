import api from '../../utils/api';
import React, { useState, useEffect } from 'react';
import ListProjects from "../RelatorioGestao"
import './panel.css';
import { useNavigate } from 'react-router-dom';

const Panel = () => {
  // Use States
  const [useAPI, setUseApi] = useState([]);

  const [ativo, setAtivo] = useState(true);
  const [inativo, setInativo] = useState(false);

  const [simAssinante, setSimAssinante] = useState(true);
  const [naoAssinante, setNaoAssinante] = useState(false);

  const [contratoStart, setContratoStart] = useState(true);
  const [contratoLite, setContratoLite] = useState(true);
  const [contratoBusiness, setContratoBusiness] = useState(true);
  const [contratoEnterprise, setContratoEnterprise] = useState(true);
  const [contratoOutro, setContratoOutro] = useState(false);

  const [projetoId, setProjetoId] = useState(true); // Radio
  const [query, setQuery] = useState("");

  const [searchParams, setSearchParams] = useState([]);


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
  function statusBot(objStatus: any) {
    if (ativo && !inativo) {
      objStatus = objStatus.filter((item: any) => item.bot_active === "1");
    }
    if (!ativo && inativo) {
      objStatus = objStatus.filter((item: any) => item.bot_active === "0");
    }
    if (!ativo && !inativo) {
      objStatus = [];
    }
    return objStatus;
  }

  function subscribers(objSub: any) {
    if (simAssinante && !naoAssinante) {
      objSub = objSub.filter((item: any) => item.bot_customer_paid === "1");
    }
    if (!simAssinante && naoAssinante) {
      objSub = objSub.filter((item: any) => item.bot_customer_paid === "0");
    }
    if (!simAssinante && !naoAssinante) {
      objSub = [];
    }
    return objSub;
  }

  function contractStatus(objStatus: any) {
    if (!contratoStart) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Start");
    }
    if (!contratoLite) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Lite");
    }
    if (!contratoOutro) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Outro");
    }
    if (!contratoBusiness) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Business");
    }
    if (!contratoEnterprise) {
      objStatus = objStatus.filter((item: any) => item.bot_customer_contract_type !== "Enterprise");
    }
    return objStatus;
  }

  function newQuery(obj: any) {
    const regex = new RegExp(query, "gi");
    if (projetoId)
      obj = obj.filter((item: any) => item.bot_project_name.match(regex)); // Procurando Nome
    else obj = obj.filter((item: any) => item.bot_id.toString().match(regex)); // Procurando Id
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
            <input
                id="project-radio"
                type="radio"
                name="search-radio"
                checked={projetoId}
                onChange={() => {
                    setProjetoId(true);
                    search();
                }} /><label>Nome do Projeto</label>
            <input
                id="bot-id-radio"
                type="radio"
                name="search-radio"
                checked={!projetoId}
                onChange={(event) => {
                    setProjetoId(false);
                    search();
                }} /><label>Bot ID</label>
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
                    setAtivo((event.target as HTMLInputElement).checked);
                    search();
                  }}
                  checked={ativo} />
                <label>Ativo</label>
              </div>
              <div>
                <input 
                  type="checkbox" 
                  id="bot-disable" 
                  onChange={(event) => {
                    setInativo((event.target as HTMLInputElement).checked);
                    search();
                  }} 
                  checked={inativo}
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
                    setSimAssinante((event.target as HTMLInputElement).checked);
                    search();
                  }} 
                  checked={simAssinante}/>
                <label>Sim</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="non-subscriber" 
                onChange={(event) => {
                  setNaoAssinante((event.target as HTMLInputElement).checked);
                  search();
                }} 
                checked={naoAssinante}/>
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
                  setContratoStart((event.target as HTMLInputElement).checked);
                  search();
                }} 
                checked = {contratoStart}/>
                <label>Start</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-lite" 
                onChange={(event) => {
                  setContratoLite((event.target as HTMLInputElement).checked);
                  search();
                }}  
                checked = {contratoLite}/>
                <label>Lite</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-business" 
                onChange={(event) => {
                  setContratoBusiness((event.target as HTMLInputElement).checked);
                  search();
                }}  
                checked = {contratoBusiness}/>
                <label>Business</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-enterprise" 
                onChange={(event) => {
                  setContratoEnterprise((event.target as HTMLInputElement).checked);
                  search();
                }}  
                checked = {contratoEnterprise}/>
                <label>Enterprise</label>
              </div>
              <div>
                <input 
                type="checkbox" 
                id="contract-outro" 
                onChange={(event) => {
                  setContratoOutro((event.target as HTMLInputElement).checked);
                  search();
                }}  
                checked = {contratoOutro}/>
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
    </body>
    <ListProjects search={searchParams} /></>
  )
}

export default Panel