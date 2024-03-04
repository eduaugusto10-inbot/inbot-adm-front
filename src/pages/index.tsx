import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ICustomerData } from './types';
import { useNavigate } from 'react-router-dom';


export function AllPhones() {
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

    const truncateAccessToken = (accessToken: string): string => {
        return accessToken.substring(0, 2) + '...' + accessToken.substring(accessToken.length - 2);
    };

    return (
        <div>
            <button onClick={AddNewPhone} className='button'>Adicionar</button>
            <table>
                <thead>
                    <tr>
                        <th>Numero</th>
                        <th>Cliente</th>
                        <th>Bot ID</th>
                        <th>Servidor</th>
                        <th>Observação</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {customerData && customerData.map((data, index) => (
                        <tr key={index}  style={{ backgroundColor: index % 2 === 0 ? '#FDFDFD' : '#EEEEEE' }}>
                            <td>{data.number}</td>
                            <td>{data.client}</td>
                            <td>{data.botId}</td>
                            <td>{data.botServerType}</td>
                            <td>{data.observation}</td>
                            <td><button onClick={() => Change(data.number)} className='button'>Alterar</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllPhones;