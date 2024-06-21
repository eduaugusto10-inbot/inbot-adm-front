import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import api from "../../../utils/api";
import { waitingMessage, successCreateTrigger } from "../../../Components/Toastify";

interface SavedValue {
    nomeCampo: string;
    tipo: string;
    status: string;
  }

export function Configuration(){

    const [nomeCampo, setNomeCampo] = useState('');
    const [tipo, setTipo] = useState('');
    const [status, setStatus] = useState('');
    const [savedValues, setSavedValues] = useState<SavedValue[]>([]);
    const [customFields, setCustomFields] = useState([])
    const [buttonSaveStatus, setButtonSaveStatus] = useState<boolean>(false)
    useEffect(() => {
        api.get(`/customfields/403`, {
            headers: { 
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3RfaWQiOjQwMywiaWF0IjoxNzE1Nzk0ODYwfQ.hoGj0zCeUZQIbaCVT5gF8pjVJsaEeMAGXLM6565Rh1w'
          }})
        .then(resp => {
            console.log(resp.data.data)
            setCustomFields(resp.data.data)
        })
    },[])
    const handleSave = () => {
        waitingMessage()
        setSavedValues([...savedValues, { nomeCampo, tipo, status }]);
        setNomeCampo('');
        setTipo('');
        setStatus('');
        setButtonSaveStatus(false);
        successCreateTrigger()
      };

      useEffect(()=>{
        if (nomeCampo === '' || tipo === '' || status === '') {
            setButtonSaveStatus(false);
        } else {
            setButtonSaveStatus(true);
        }
      },[tipo,nomeCampo,status])
      
      const checkEnableButton = (value:string,shield:string) => {
        console.log(shield)
        if(shield==="type") setTipo(value)
        if(shield==="nameField") setNomeCampo(value)
        if(shield==="status") setStatus(value)
      }

    return(
        <div style={{width:"100%",backgroundColor:"#ebebeb", padding:"10px 100px 100px 100px"}}>
            <ToastContainer />
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69" }} className="title_2024">Gestão de Usuários - Configuração BD</h1>
            <hr className="hr_color" />
            <div className="config-template" style={{width:"100%"}}>
                <div className="header-accordion gradient-background" style={{width:"100%", borderRadius: "20px" }} onClick={() => ""}>Configurações dos Campos</div>      
                <div>
                <div>
                    <div style={{display:"flex", flexDirection:"column", alignContent:"center", alignItems:"center"}}>
      <table className="table-2024" style={{ margin: '20px' }}>
        <thead>
          <tr>
            <th className="cells" style={{ padding: '0px 50px 0px', borderRight: '1px solid #aaa' }}>Nome do Campo</th>
            <th className="cells">Tipo</th>
            <th className="cells">Status</th>
            <th className="cells">Gerenciar</th>
          </tr>
        </thead>
        <tbody>
        {customFields.map((customField:any, index) => (
            <tr key={index}>
                <td style={{ border: '1px solid #aaa' }}>{customField?.customName}</td>
                <td style={{ border: '1px solid #aaa' }}>{customField?.type}</td>
                <td style={{ border: '1px solid #aaa' }}>{customField?.status ?? "Ativo"}</td>
            </tr>
        ))}
        {savedValues.map((savedValue, index) => (
            <tr key={index}>
                <td style={{ border: '1px solid #aaa' }}>{savedValue.nomeCampo}</td>
                <td style={{ border: '1px solid #aaa' }}>{savedValue.tipo}</td>
                <td style={{ border: '1px solid #aaa' }}>{savedValue.status}</td>
            </tr>
        ))}
          <tr>
            <td style={{ border: '1px solid #aaa', padding: '0px', margin: '0px' }} className="cells">
              <input type="text" style={{ width: '90%', border: 'none' }} value={nomeCampo} onChange={(e) => checkEnableButton(e.target.value, "nameField")} />
            </td>
            <td style={{ border: '1px solid #aaa' }}>
              <select value={tipo} onChange={(e) => checkEnableButton(e.target.value, "type")} style={{ width: '90%', border: 'none' }}>
                <option value="">--</option>
                <option value="Texto">Texto</option>
                <option value="Número">Número</option>
                <option value="Data">Data</option>
                <option value="Data e horário">Data e horário</option>
                <option value="Horário">Horário</option>
              </select>
            </td>
            <td style={{ border: '1px solid #aaa' }}>
              <select value={status} onChange={(e) => checkEnableButton(e.target.value,"status")} style={{ width: '90%', border: 'none' }}>
              <option value="">--</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </td>
            <td style={{ border: '1px solid #aaa' }}>
              <button onClick={handleSave} disabled={!buttonSaveStatus}>Save</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
                    <div style={{ flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end" }}>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={() => ""}>Cancelar</button>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={() => ""}>Salvar</button>
                    </div>                 
                </div>
            </div>
        </div>
    )
}

export default Configuration;