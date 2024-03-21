import React, { useState } from "react";
import '../index.css'
import alert from '../../../../img/help.png'
import { IQuickReply } from "../../../types";
import strings from '../../strings.json'
export function CreateTemplateConfig() {
    const [quickReplies, setQuickReplies] = useState<IQuickReply[]>([])
    const [templateName, setTemplateName] = useState<string>("")
    const [templateType, setTemplateType] = useState<string>("")
    const [buttons, setButtons] = useState(0)

    const handleAddItem = () => {
        const newQR = { type: "quickReply", text: "Botão" }
        if (buttons < 3) {
            setButtons(buttons + 1)
            setQuickReplies([...quickReplies, newQR]);
        }
    }

    const selectTemplate = (e: string) => {
        switch (e) {
            case "UTILITY":
                return strings.utilitario
            case "AUTHENTICATION":
                return strings.autenticacao
            case "MARKETING":
                return strings.marketing
            default:
                return "Escolha uma das opções de Categoria";
        }
    }
    return (
        <div style={{ border: "1px solid #d6d6d6", padding: "50px", backgroundColor: "#010042", color: "#FFF" }}>
            <h3 style={{ marginBottom: "30px" }}>Configurações do Template</h3>
            <div style={{ display: "flex", flexDirection: "row", textAlign: "left" }}>
                <div className="input">
                    <span className="bolder">Nome do template</span>
                    <input type="text"
                        className="input-template"
                        maxLength={512}
                        name="templateName"
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value.trim().replace(/[^a-zA-Z\s]/g, '').toLowerCase())}
                    />
                    <span className="bolder">Idioma</span>
                    <select className="input-template">
                        <option value={"pb-BR"}>pt-BR</option>
                    </select>
                    <span className="bolder">Categoria</span>
                    <select className="input-template" onChange={e => setTemplateType(e.target.value)}>
                        <option>---</option>
                        <option value={"AUTHENTICATION"}>Autenticação</option>
                        <option value={"UTILITY"}>Utilitário</option>
                        <option value={"MARKETING"}>Marketing</option>
                    </select>
                </div>
                <div style={{ width: "400px", display: "flex", flexDirection: "row", textAlign: "left", marginLeft: "20px", borderLeft: "2px solid #FFF", paddingLeft: "10px", background: "#0171BD" }}>
                    <div style={{ margin: "10px" }}>
                        <img src={alert} width={25} alt="alerta" />
                    </div>
                    <div style={{ width: "400px", display: "flex", flexDirection: "column" }}>
                        <span style={{ padding: "10px", fontSize: "20px" }} className="bolder">{templateType === "AUTHENTICATION" ? "Autenticação" : templateType === "UTILITY" ? "Utilitário" : templateType === "MARKETING" ? "Marketing" : "Início"}</span>
                        <span style={{ marginRight: "50px" }}>{selectTemplate(templateType)}</span>
                    </div>
                </div>
            </div>
            <div className="buttons-line" style={{ backgroundColor: "#0100" }}>
                <button style={{ backgroundColor: "#FFF", color: "#0171BD", border: "1px solid #0171BD", margin: "5px" }} onClick={handleAddItem}>Cancelar</button>
                <button style={{ width: "100px", backgroundColor: "#0171BD", color: "#FFF", border: "1px solid #FFF", margin: "5px" }} onClick={handleAddItem}>Próximo</button>
            </div>
        </div>
    )
}

export default CreateTemplateConfig;