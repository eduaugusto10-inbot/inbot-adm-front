import React, { useState } from "react";
import api from "../../../utils/api";
import { useLocation } from "react-router-dom";
import axios from "axios";

export function SendTemplate() {
    const location = useLocation()
    const templateName = location.state.templateName
    const [clientNumber, setClientNumber] = useState<number | ''>('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = {
            botId: "403",
            templateId: templateName,
            senderPhone: "5511953188171",
            dataClient: [
                {
                    receiverPhone: `${clientNumber}`
                }
            ]
        }
        console.log(params)
        await api.post('/whats/template/send', params)
            .then(resp => console.log(resp))
            .catch(error => console.log(error))
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <span>Nome do template: </span>
                    <input type="text" value={templateName} disabled />
                </div>
                <div>
                    <span>Número do cliente: </span>
                    <input
                        type="number"
                        value={clientNumber}
                        onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                    />
                </div>
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default SendTemplate;