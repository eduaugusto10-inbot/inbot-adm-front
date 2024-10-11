import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ICustomerData } from './types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mask } from '../utils/utils';

export function AllPhones() {

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('token') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    
    const history = useNavigate();
    const [customerData, setCustomerData] = useState<ICustomerData[]>([])
    const [checkActivated, setCheckActivated] = useState<boolean>(true)
    const [checkDesactivated, setCheckDesactivated] = useState<boolean>(false)

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
        if (checkActivated && customer.activated){
            return true;
        }
        if (checkDesactivated && !customer.activated){
            return true;
        }
    })

    return (
        <div className='column-align' style={{width:"100vw", margin:"10px 0px", alignItems:"center"}}>
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">Gestão de Números WhatsApp</h1>
            <div className="column-align" style={{width:"97%",alignItems:"center"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
            </div>
            <div className='row-align' style={{ width:"90%", justifyContent:"space-between" }}>
                <div style={{ alignContent: "center", color: "#004488"}}>
                    <span><strong>Exibir números: </strong></span>
                    <input type="checkbox" style={{margin:"0px 5px 0px 10px"}} checked={checkActivated} onChange={(e) => setCheckActivated(e.target.checked)}/><span>Ativos</span>
                    <input type="checkbox" style={{margin:"0px 5px 0px 10px"}} checked={checkDesactivated} onChange={(e) => setCheckDesactivated(e.target.checked)}/><span>Inativos</span>
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
                        <th>Status</th>
                        <th>Gerenciar</th>
                    </tr>
                </thead>
                <tbody>
                    {customerData && filteredCustomers.map((data, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                            <td>{mask(data.number)}</td>
                            <td>{data.client}</td>
                            <td>{data.botId}</td>
                            <td>{data.botServerType}</td>
                            <td>{data.observation}</td>
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