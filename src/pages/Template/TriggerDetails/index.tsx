import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { adjustTime, mask } from "../../../utils/utils";
import { ICustomer } from "../../types";

export function TriggerDetails() {

    const location = useLocation()
    const triggerId = location.state.triggerId;
    const profilePic = location.state.urlLogo;
    const [customerStatus, setCustomerStatus] = useState<ICustomer[]>([])

    useEffect(() => {
        api.get(`/whats-customer/${triggerId}`)
            .then(resp => setCustomerStatus(resp.data.data))
            .catch(error => console.log(error))
    },[])

    return (
        <div>
            <ToastContainer />
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <img src={profilePic} width={100} height={100} alt='logo da empresa' style={{ marginBottom: "-30px" }} />
                </div>
                <div style={{ width: "100%", borderBottom: "1px solid #000", marginBottom: "30px", display: "flex", flexDirection: "row" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width: "90%" }}>Log de Disparos</h1>
                </div>
                <table>
                    <thead>
                        <tr className="cells" style={{ backgroundColor: "#010043" }}>
                            <th className="cells">Telefone</th>
                            <th className="cells">Var. 1</th>
                            <th className="cells">Var. 2</th>
                            <th className="cells">Var. 3</th>
                            <th className="cells">Var. 4</th>
                            <th className="cells">Var. 5</th>
                            <th className="cells">Var. 6</th>
                            <th className="cells">Var. 7</th>
                            <th className="cells">Var. 8</th>
                            <th className="cells">Var. 9</th>
                            <th className="cells">Status</th>
                            <th className="cells">Horário do criação</th>
                            <th className="cells">Horário do envio</th>
                            <th className="cells">Log</th>
                        </tr>
                    </thead>
                    {customerStatus.map(customer=>(
                    <tr>
                        <td><span>{mask(customer.phone)}</span></td>
                        <td><span>{customer.variable_1}</span></td>
                        <td><span>{customer.variable_2}</span></td>
                        <td><span>{customer.variable_3}</span></td>
                        <td><span>{customer.variable_4}</span></td>
                        <td><span>{customer.variable_5}</span></td>
                        <td><span>{customer.variable_6}</span></td>
                        <td><span>{customer.variable_7}</span></td>
                        <td><span>{customer.variable_8}</span></td>
                        <td><span>{customer.variable_9}</span></td>
                        <td><span>{customer.status}</span></td>
                        <td><span>{adjustTime(customer.data_criacao)}</span></td>
                        <td><span>{customer.data_disparo ? adjustTime(customer.data_disparo): "----"}</span></td>
                        <td><span> -- </span></td>
                    </tr>
                    ))}
                </table>
            </div>
        </div>
    )
}

export default TriggerDetails;