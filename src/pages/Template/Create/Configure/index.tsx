import React, { useState } from "react";
import '../index.css'
import alert from '../../../../img/help.png'
import strings from '../../strings.json'
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { emptyMessage } from '../../../../Components/Toastify'

export function CreateTemplateConfig() {
    const [templateName, setTemplateName] = useState<string>("")
    const [templateType, setTemplateType] = useState<string>("")

    const history = useNavigate();
    function NextStep() {
        history("/template/create");
    }
    function BackToList() {
        history("/template/list")
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

    const handleSaveConfig = () => {
        if (!templateName || !templateType) {
            emptyMessage()
            return;
        }
        const template = {
            name: templateName,
            type: templateType,
            language: "pt_BR",
            botId: 403
        }
        localStorage.removeItem("template");
        localStorage.setItem("template", JSON.stringify(template));
        NextStep();
    }
    return (
        <div style={{ border: "1px solid #d6d6d6", padding: "50px", backgroundColor: "#010042", color: "#FFF" }}>
            <ToastContainer />
            <h3 style={{ marginBottom: "30px" }}>Configurações do Template</h3>
            <div style={{ display: "flex", flexDirection: "row", textAlign: "left" }}>
                <div className="input">
                    <span className="bolder">Nome do template*</span>
                    <input type="text"
                        className="input-template"
                        maxLength={512}
                        name="templateName"
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value.trim().toLowerCase())}
                    />
                    <span className="bolder">Idioma*</span>
                    <select className="input-template">
                        <option value={"pb-BR"}>pt-BR</option>
                    </select>
                    <span className="bolder">Categoria*</span>
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
                <button onClick={BackToList} style={{ backgroundColor: "#FFF", color: "#0171BD", border: "1px solid #0171BD", margin: "5px" }}>Cancelar</button>
                <button style={{ width: "100px", backgroundColor: "#0171BD", color: "#FFF", border: "1px solid #FFF", margin: "5px" }} onClick={handleSaveConfig}>Próximo</button>
            </div>
        </div>
    )
}

export default CreateTemplateConfig;