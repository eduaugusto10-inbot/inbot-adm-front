import React, { useEffect, useState } from "react";
import './style.css'
import api from "../../../../utils/api";
import { ITemplateList } from "../../../types";
import dots from "../../../../img/dots.png"
import { useNavigate } from "react-router-dom";
import ModalTemplate from "../../ModalTemplate";

export function ListAll() {

    const [modal, setModal] = useState<boolean>(false)
    const [modalObject, setModalObject] = useState<any>()
    const [templates, setTemplates] = useState<ITemplateList[]>([])
    const history = useNavigate();
    function CreateTemplate() {
        history("/template/create-config");
    }
    function SendTemplate(name: string) {
        history("/template/send", { state: { templateName: name } });
    }

    useEffect(() => {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoIjoiN09LbGRDU3B5VnlnVXU4amlvd2xJWXVBRVpaV0RQVGlJQWtKa1FvPSIsImV4cCI6MTY4NDQzMjE3MCwiaXNzIjoic21hcnRlcnMifQ.cJqfC2odGVTJJFyfYQ2PtAVl0miACJt9c7djho5NVe0"
        // api.get('/listall', { params: { botId: 42 } })
        api.get('https://whatsapp.smarters.io/api/v1/messageTemplates', { headers: { 'Authorization': token } })
            .then(resp => setTemplates(resp.data.data.messageTemplates))
    }, []);

    const loadTemplate = (id: number) => {
        setModalObject(templates[id])
        setModal(prevState => !prevState)
    }

    const sendtemplate = (id: number) => {
        SendTemplate(templates[id].name)
    }
    return (
        <div style={{ margin: "40px" }}>
            {modal && (
                <div onClick={() => setModal(prevState => !prevState)}>
                    <ModalTemplate modalTemplate={modalObject} />
                </div>
            )}
            <div>
                <button onClick={CreateTemplate} style={{ margin: "10px", backgroundColor: "#010043", border: "1px solid #010043" }}>Novo Template</button>
                <table>
                    <thead>
                        <tr className="cells" style={{ backgroundColor: "#010043" }}>
                            <th className="cells">ID do template</th>
                            <th className="cells">Nome do template</th>
                            <th className="cells">Status</th>
                            <th className="cells">Categoria</th>
                            <th className="cells">Idioma</th>
                            <th className="cells">Visualizar</th>
                            <th className="cells">Enviar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map((template, index) => (
                            <tr key={index} style={{ border: '1px solid #0171BD' }}>
                                <td className="cells"><span style={{ color: "blue", fontSize: "12px" }}>{template.ID}</span></td>
                                <td><span>{template.name}</span></td>
                                <td><div style={{ borderRadius: "20px", backgroundColor: template.status === "APPROVED" ? "#F2FFED" : "#FFECEC", padding: "7px" }}><span style={{ fontSize: "12px", color: template.status === "APPROVED" ? "green" : "red", fontWeight: "bolder" }}>{template.status === "APPROVED" ? "Aprovado" : "Rejeitado"}</span></div></td>
                                <td><span>{template.category}</span></td>
                                <td><span>{template.language}</span></td>
                                <td><span><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} onClick={() => loadTemplate(index)} /></span></td>
                                <td><span><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} onClick={() => sendtemplate(index)} /></span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ListAll;