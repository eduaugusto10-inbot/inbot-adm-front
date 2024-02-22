import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './index.css';

function monthByName(monthID: number) {
    let date = new Date();
    let sumDate = date.getMonth() - monthID;
    date.setDate(15);
    date.setMonth(sumDate);
    const month = date.toLocaleString("default", {
      month: "2-digit",
      year: "2-digit",
    });
    return month;
}

const DynamicList = ({ bots }) => {
    const columnNames = ["Nome do Projeto", "Bot ID", "Tipo de Contrato", "Indicador", monthByName(3), monthByName(2), monthByName(1), monthByName(0)];
    const labels = [
        "Quantidade de atendimentos total (bot)",
        "Quantidade de atendimentos via whatsapp",
        "Quantidade de atendimentos inchat (humano)",
        "Quantidade de IDK",
        "Quantidade de fichas criadas e aprovadas",
        "Quantidade de Tokens do ChatGPT utilizados",
        "Custo com Tokens do ChatGPT (dólar)"
    ];

    const theKeys = [
        "total",
        "whatsapp",
        "inchat",
        "idk",
        "fichas",
        "chatgpt",
        "dolarcost"
    ];

    return (
        <div>
            {bots.map((bot: any, botIndex: any) => (
                <table key={botIndex}>
                    <thead>
                        <tr>
                            {columnNames.map((name, index) => (
                                <th key={index} style={{backgroundColor: "#EE7923", color: "#fff"}}>{name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {labels.map((label, labelIndex) => (
                            <tr key={labelIndex} style={{ backgroundColor: labelIndex % 2 === 0 ? '#FDFDFD' : '#EEEEEE' }}>
                                <td>{bot.bot_project_name}</td>
                                <td>{bot.bot_id}</td>
                                <td>{bot.bot_customer_contract_type ?? "--"}</td>
                                <td>{label}</td>
                                <td>{bot.months[0][theKeys[labelIndex]] ?? "ERROR"}</td>
                                <td>{bot.months[1][theKeys[labelIndex]] ?? "ERROR"}</td>
                                <td>{bot.months[2][theKeys[labelIndex]] ?? "ERROR"}</td>
                                <td>{bot.months[3][theKeys[labelIndex]] ?? "ERROR"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
        </div>
    );
};

export function ListProjects() {
    const [useAPI, setUseApi] = useState([]);
    useEffect(() => {
        api.get('/report')
            .then(res => {
                console.log(res.data);
                setUseApi(res.data);
            })
            .catch(error => console.log(error));
    }, []);
    
    return (
        <div className="container">
            <DynamicList bots={useAPI} />
        </div>
    );
}

export default ListProjects;
