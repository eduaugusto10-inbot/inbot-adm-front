import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ICustomerData } from './types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mask } from '../utils/utils';

export function AllPhones() {

    const [searchParams, setSearchParams] = useSearchParams();
    console.log(searchParams)
    if (searchParams.get('token') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    
    const history = useNavigate();
    const [customerData, setCustomerData] = useState<ICustomerData[]>([])

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



    return (
        <div style={{margin:"10px 0px"}}>
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">Gestão de Números WhatsApp</h1>
            <div className="column-align" style={{alignItems:"center"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
            </div>
            <div className='row-align' style={{ width:"100%" }}>
                <button onClick={AddNewPhone} className='button-blue' style={{margin:"20px 0px"}}>Adicionar</button>
            </div>
            <table className="table-2024 fixed-header-table" style={{textAlign:"left"}}>
                <thead>
                    <tr className="cells table-2024 border-bottom-zero">
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Bot ID</th>
                        <th>Servidor</th>
                        <th>Observação</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {customerData && customerData.map((data, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                            <td>{mask(data.number)}</td>
                            <td>{data.client}</td>
                            <td>{data.botId}</td>
                            <td>{data.botServerType}</td>
                            <td>{data.observation}</td>
                            <td><button onClick={() => Change(data.number)} className='button-blue'>Alterar</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllPhones;