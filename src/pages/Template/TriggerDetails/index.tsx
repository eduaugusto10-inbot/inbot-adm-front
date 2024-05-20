import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { adjustTime, mask } from "../../../utils/utils";
import { Filters, ICustomer } from "../../types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import './style.css'

export function TriggerDetails() {
    ChartJS.register(ArcElement, Tooltip, Legend);

    const location = useLocation()
    const triggerId = location.state.triggerId;
    const profilePic = location.state.urlLogo;
    const [customerStatus, setCustomerStatus] = useState<ICustomer[]>([])
    const [waiting, setWaiting] = useState<number>(0)
    const [send, setSend] = useState<number>(0)
    const [erro, setErro] = useState<number>(0)
    const [filters, setFilters] = useState<Filters>({
        telefone: '',
        variable_1: '',
        variable_2: '',
        variable_3: '',
        variable_4: '',
        variable_5: '',
        variable_6: '',
        variable_7: '',
        variable_8: '',
        variable_9: '',
        status: {
            aguardando: true,
            enviado: true,
            erro: true,
        }
    });

    const dataPie = {
        labels: ["Aguardando", "Enviado", "Erro"],
        datasets: [
            {
                label: 'Quantidade',
                data: [waiting, send, erro],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };


    useEffect(() => {
        api.get(`/whats-customer/${triggerId}`)
            .then(resp => {
                setCustomerStatus(resp.data.data)
                let aguardando = 0;
                let erro = 0;
                let enviado = 0;
                for (let i = 0; i < resp.data.data.length; i++) {
                    if (resp.data.data[i].status === "enviado") {
                        enviado++;
                    } else if (resp.data.data[i].status === "erro") {
                        erro++;
                    } else {
                        aguardando++;
                    }
                }
                setWaiting(aguardando);
                setErro(erro);
                setSend(enviado);
            })
            .catch(error => console.log(error))
    }, [])
    const handleTelefoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, telefone: (event.target.value) });
    };
    const handleVariable1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_1: event.target.value });
    };
    const handleVariable2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_2: event.target.value });
    };
    const handleVariable3Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_3: event.target.value });
    };
    const handleVariable4Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_4: event.target.value });
    };
    const handleVariable5Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_5: event.target.value });
    };
    const handleVariable6Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_6: event.target.value });
    };
    const handleVariable7Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_7: event.target.value });
    };
    const handleVariable8Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, variable_8: event.target.value });
    };
    const handleStatusChange = (statusKey: keyof Filters['status']) => {
        setFilters({
            ...filters,
            status: {
                ...filters.status,
                [statusKey]: !filters.status[statusKey],
            },
        });
    };
    const filteredCustomers = customerStatus.filter(customer => {
        if (filters.telefone !== '' && !(customer.phone).includes(filters.telefone)) {
            return false;
        }
        if (customer.variable_1 !== null && filters.variable_1 !== '' && !customer.variable_1.toLowerCase().includes(filters.variable_1.toLowerCase())) {
            return false;
        }
        if (customer.variable_2 !== null && filters.variable_2 !== '' && !customer.variable_2.toLowerCase().includes(filters.variable_2.toLowerCase())) {
            return false;
        }
        if (customer.variable_3 !== null && filters.variable_3 !== '' && !customer.variable_3.toLowerCase().includes(filters.variable_3.toLowerCase())) {
            return false;
        }
        if (customer.variable_4 !== null && filters.variable_4 !== '' && !customer.variable_4.toLowerCase().includes(filters.variable_4.toLowerCase())) {
            return false;
        }
        if (customer.variable_5 !== null && filters.variable_5 !== '' && !customer.variable_5.toLowerCase().includes(filters.variable_5.toLowerCase())) {
            return false;
        }
        if (customer.variable_6 !== null && filters.variable_6 !== '' && !customer.variable_6.toLowerCase().includes(filters.variable_6.toLowerCase())) {
            return false;
        }
        if (customer.variable_7 !== null && filters.variable_7 !== '' && !customer.variable_7.toLowerCase().includes(filters.variable_7.toLowerCase())) {
            return false;
        }
        if (customer.variable_8 !== null && filters.variable_8 !== '' && !customer.variable_8.toLowerCase().includes(filters.variable_8.toLowerCase())) {
            return false;
        }
        if (customer.variable_9 !== null && filters.variable_9 !== '' && !customer.variable_9.toLowerCase().includes(filters.variable_9.toLowerCase())) {
            return false;
        }
        if (
            (filters.status.aguardando && customer.status === 'aguardando') ||
            (filters.status.enviado && customer.status === 'enviado') ||
            (filters.status.erro && customer.status === 'erro')
        ) {
            return true;
        }
        return false;
    });
    return (
        <div>
            <ToastContainer />
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%", padding: "20px 0px 0px 20px" }}>
                    <img src={profilePic} width={60} height={60} alt='logo da empresa' style={{ marginBottom: "-30px" }} />
                </div>
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "90%", marginLeft:"40px" }} className="title_2024">Detalhes da Campanha</h1>
                <hr className="hr_color" />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <div style={{ width: "250px", backgroundColor: "#F0F0F0", height: "300px", border: "1px solid #ccc", margin: "20px", borderRadius: "20px" }}>
                        <span style={{ fontWeight: "bolder", color: "#002080" }}>Resumo do Disparo</span>
                        <Pie data={dataPie} />
                    </div>
                    <div style={{ fontWeight: "bolder", backgroundColor: "#F0F0F0", border: "1px solid #ccc", height: "250px", margin: "20px", borderRadius: "20px" }}>
                        <span style={{ color: "#002080" }}>Filtros</span>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <div style={{ display: "flex", flexDirection: "column", margin: "10px" }}>
                                <span style={{ color: "#002080" }}>Status</span>
                                <div style={{ display: "flex", flexDirection: "column", margin: "10px", textAlign: "left" }}>
                                    <div><input type="checkbox" onChange={() => handleStatusChange('aguardando')} checked={filters.status.aguardando} /><span style={{ marginLeft: "5px", fontWeight: "normal" }}>Aguardando</span></div>
                                    <div><input type="checkbox" onChange={() => handleStatusChange('enviado')} checked={filters.status.enviado} /><span style={{ marginLeft: "5px", fontWeight: "normal" }}>Enviado</span></div>
                                    <div><input type="checkbox" onChange={() => handleStatusChange('erro')} checked={filters.status.erro} /><span style={{ marginLeft: "5px", fontWeight: "normal" }}>Erro</span></div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", margin: "10px", textAlign: "left" }}>
                                <span style={{ color: "#002080" }}>Telefone</span><input className="input-filters" type="text" value={filters.telefone} onChange={handleTelefoneChange} placeholder="Digite o telefone..." />
                                <span style={{ color: "#002080" }}>Variável 1</span><input className="input-filters" type="text" value={filters.variable_1} onChange={handleVariable1Change} placeholder="Digite valor..." />
                                <span style={{ color: "#002080" }}>Variável 2</span><input className="input-filters" type="text" value={filters.variable_2} onChange={handleVariable2Change} placeholder="Digite valor..." />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", margin: "10px", textAlign: "left" }}>
                                <span style={{ color: "#002080" }}>Variável 3</span><input className="input-filters" type="text" value={filters.variable_3} onChange={handleVariable3Change} placeholder="Digite valor..." />
                                <span style={{ color: "#002080" }}>Variável 4</span><input className="input-filters" type="text" value={filters.variable_4} onChange={handleVariable4Change} placeholder="Digite valor..." />
                                <span style={{ color: "#002080" }}>Variável 5</span><input className="input-filters" type="text" value={filters.variable_5} onChange={handleVariable5Change} placeholder="Digite valor..." />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", margin: "10px", textAlign: "left" }}>
                                <span style={{ color: "#002080" }}>Variável 6</span><input className="input-filters" type="text" value={filters.variable_6} onChange={handleVariable6Change} placeholder="Digite valor..." />
                                <span style={{ color: "#002080" }}>Variável 7</span><input className="input-filters" type="text" value={filters.variable_7} onChange={handleVariable7Change} placeholder="Digite valor..." />
                                <span style={{ color: "#002080" }}>Variável 8</span><input className="input-filters" type="text" value={filters.variable_8} onChange={handleVariable8Change} placeholder="Digite valor..." />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{display:"flex",flexDirection:"column"}}>
                <table>
                    <thead>
                        <tr className="cells" style={{ backgroundColor: "#010043", fontSize: "12px" }}>
                            <th className="cells">Telefone</th>
                            {filteredCustomers[0]?.variable_1!==null &&<th className="cells">Var. 1</th>}
                            {filteredCustomers[0]?.variable_2!==null &&<th className="cells">Var. 2</th>}
                            {filteredCustomers[0]?.variable_3!==null &&<th className="cells">Var. 3</th>}
                            {filteredCustomers[0]?.variable_4!==null &&<th className="cells">Var. 4</th>}
                            {filteredCustomers[0]?.variable_5!==null &&<th className="cells">Var. 5</th>}
                            {filteredCustomers[0]?.variable_6!==null &&<th className="cells">Var. 6</th>}
                            {filteredCustomers[0]?.variable_7!==null &&<th className="cells">Var. 7</th>}
                            {filteredCustomers[0]?.variable_8!==null &&<th className="cells">Var. 8</th>}
                            {filteredCustomers[0]?.variable_9!==null &&<th className="cells">Var. 9</th>}
                            <th className="cells">Status</th>
                            <th className="cells">Horário do criação</th>
                            <th className="cells">Horário do envio</th>
                            <th className="cells">Log</th>
                        </tr>
                    </thead>
                    {filteredCustomers.map(customer => (
                        <tr>
                            <td><span style={{ fontSize: "12px" }}>{mask(customer.phone)}</span></td>
                            {customer.variable_1!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_1}</span></td>}
                            {customer.variable_2!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_2}</span></td>}
                            {customer.variable_3!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_3}</span></td>}
                            {customer.variable_4!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_4}</span></td>}
                            {customer.variable_5!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_5}</span></td>}
                            {customer.variable_6!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_6}</span></td>}
                            {customer.variable_7!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_7}</span></td>}
                            {customer.variable_8!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_8}</span></td>}
                            {customer.variable_9!==null &&<td><span style={{ fontSize: "12px" }}>{customer.variable_9}</span></td>}
                            <td><span style={{ fontSize: "12px" }}>{customer.status}</span></td>
                            <td><span style={{ fontSize: "12px" }}>{adjustTime(customer.data_criacao)}</span></td>
                            <td><span style={{ fontSize: "12px" }}>{customer.data_disparo ? adjustTime(customer.data_disparo) : "----"}</span></td>
                            <td><span style={{ fontSize: "12px" }}> -- </span></td>
                        </tr>
                    ))}
                </table>
                </div>
            </div>
        </div>
    )
}

export default TriggerDetails;