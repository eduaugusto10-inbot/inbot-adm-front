import { ChangeEvent,  useEffect, useState } from 'react';
import api from '../utils/api';
import { ICustomerData } from './types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import loupe from "../img/loupe.png"
export function AllPhones() {

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('token') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    
    const history = useNavigate();
    const [customerData, setCustomerData] = useState<ICustomerData[]>([])
    const [checkActivated, setCheckActivated] = useState<boolean>(true)
    const [checkDesactivated, setCheckDesactivated] = useState<boolean>(false)
    const [filtro, setFiltro] = useState<string>('')
    const [checkDesenvolvimento, setCheckDesenvolvimento] = useState(true);
    const [checkHomologacao, setCheckHomologacao] = useState(true);
    const [checkProducao, setCheckProducao] = useState(true);
    function AddNewPhone() {
        history("/add");
    }
    function Change(phoneNumber: string) {
        history("/change", { state: { phoneNumber } });
    }

    useEffect(() => {
        api.get('/whats')
            .then(res => {
                setCustomerData(res.data)
            })
            .catch(error => console.log(error))
    }, [])

    const filteredCustomers = customerData.filter(customer => {
        const isActiveFilterValid = 
            (checkActivated && customer.activated) || 
            (checkDesactivated && !customer.activated);
    
        const isEnvironmentFilterValid = 
            (checkDesenvolvimento && customer.botServerType === 'dev') ||
            (checkHomologacao && customer.botServerType === 'staging') ||
            (checkProducao && customer.botServerType === 'production');
    
        if (filtro.trim() === '') return isActiveFilterValid && isEnvironmentFilterValid;
    
        const filtroNumero = Number(filtro);
        if (!isNaN(filtroNumero)) {
            return isActiveFilterValid && isEnvironmentFilterValid && (
                (customer.botId !== undefined && customer.botId.toString().includes(filtro)) ||
                (customer.number !== undefined && customer.number.toString().includes(filtro))
            );
        }
    
        return isActiveFilterValid && isEnvironmentFilterValid && 
            (customer.client?.toLowerCase() ?? '').includes(filtro.toLowerCase());
    });
    
    
    
    const clearFiltro = () => {
        setFiltro("");
    };
    const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value);
      };

    return (
        <div className='column-align' style={{width:"100vw", margin:"10px 0px", alignItems:"center"}}>
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">Gestão de Números WhatsApp</h1>
            <div className="column-align" style={{width:"97%",alignItems:"center"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
            </div>
            <div className='row-align' style={{ width:"90%", justifyContent:"space-between" }}>
                <div>
                <div style={{ margin: "20px 20px 20px 0px", display: "flex", alignItems: "center", position: "relative" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
  <input
    onChange={handleFiltroChange}
    value={filtro || ""}
    type="text"
    style={{
      borderRight: "none",
      width: "300px",
      borderRadius: "20px",
      paddingLeft: "20px",
      paddingRight: "40px",
    }}
    placeholder="Pesquisar ..."
  />
  {filtro && (
    <button
      onClick={clearFiltro}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "16px",
        color: "#888",
      }}
    >
      ✖
    </button>
  )}
</div>
</div>

                    <div style={{ alignContent: "center", color: "#004488", textAlign: 'left'}}>
                        <span><strong>Exibir números: </strong></span>
                        <input type="checkbox" style={{margin:"0px 5px 0px 10px"}} checked={checkActivated} onChange={(e) => setCheckActivated(e.target.checked)}/><span>Ativos</span>
                        <input type="checkbox" style={{margin:"0px 5px 0px 10px"}} checked={checkDesactivated} onChange={(e) => setCheckDesactivated(e.target.checked)}/><span>Inativos</span>
                    </div>
                    <div style={{ alignContent: "center", color: "#004488"}}>                                                
                        <div style={{ alignContent: "center", color: "#004488", marginBottom:'15px' }}>
        <span><strong>Servidor: </strong></span>
        <input type="checkbox" style={{ margin: "0px 5px 0px 10px" }} checked={checkDesenvolvimento} onChange={(e) => setCheckDesenvolvimento(e.target.checked)}/>
        <span>Desenvolvimento</span>
        <input type="checkbox" style={{ margin: "0px 5px 0px 10px" }} checked={checkHomologacao} onChange={(e) => setCheckHomologacao(e.target.checked)}/>
        <span>Homologação</span>
        <input type="checkbox" style={{ margin: "0px 5px 0px 10px" }} checked={checkProducao} onChange={(e) => setCheckProducao(e.target.checked)}/>
        <span>Produção</span>
                    </div>
                    </div>
                </div>
                <button onClick={AddNewPhone} className='button-blue' style={{margin:"20px 0px"}}>Adicionar</button>
            </div>
            <table className="table-2024 fixed-header-table" style={{textAlign:"left", width:"90%"}}>
                <thead>
                    <tr className="cells table-2024 border-bottom-zero">
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Bot ID</th>
                        <th>Servidor</th>
                        <th>Observação</th>
                        <th>Origem</th>
                        <th>Status</th>
                        <th>Gerenciar</th>
                    </tr>
                </thead>
                <tbody>
                    {customerData && filteredCustomers.map((data, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                            <td><PhoneInput
                                    defaultCountry="br"
                                    value={data.number}
                                    disabled
                                    className="custom-phone-input"
                                    /></td>
                            <td>{data.client}</td>
                            <td>{data.botId}</td>
                            <td>{data.botServerType}</td>
                            <td>{data.observation}</td>
                            <td>{data.origin}</td>
                            <td><span style={{fontWeight: "bolder", color: data.activated ? "green" : "red"}}>{data.activated ? "Ativo" : "Inativo"}</span></td>
                            <td><button onClick={() => Change(data.number)} className='button-blue'>Alterar</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllPhones;