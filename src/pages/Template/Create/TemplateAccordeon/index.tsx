import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import alert from '../../../../img/help.png'
import { erroMessageQuickReply, errorMessageHeader, errorMessageFooter, errorMessageBody, waitingMessage, successCreateTemplate, errorMessage } from "../../../../Components/Toastify";
import strings from '../../strings.json'
import api from "../../../../utils/api";
import { ToastContainer } from "react-toastify";
import whatsappBackground from '../../../../img/background.jpeg';
import './index.css'
import minus from '../../../../img/minus.png';
import Alert from "../../../../Components/Alert";
import { IButton, IFooter, IHeader, IObject, ITemplate, IVariables, templateValue } from "../../../types";

interface AccordionStateCreate {
    config: boolean,
    header: boolean,
    body: boolean,
    footer: boolean,
    botao: boolean
}
interface ButtonQR {
    type: string;
    parameters: { type: string; text: string }[];
}

export function CreateTemplateAccordion() {

    const history = useNavigate();
    function BackToList() {
        history("/template/list")
    }

    const [templateName, setTemplateName] = useState<string>("")
    const [templateType, setTemplateType] = useState<string>("")
    const [accordionState, setAccordionState] = useState<AccordionStateCreate>({
        config: true,
        header: false,
        body: false,
        footer: false,
        botao: false
    });
    const [typeOfHeader, setTypeOfHeader] = useState<string>("")
    const [headers, setHeader] = useState<IHeader>();
    const [template, setTemplate] = useState<ITemplate>(templateValue)
    const [variables, setVariables] = useState<IVariables[]>([])
    const [rodape, setRodape] = useState<boolean>(false);
    const [buttons, setButtons] = useState<IButton[]>([])
    const [typeOfButtons, setTypeOfButtons] = useState<string>('without')

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

    const toggleAccordion = (key: keyof AccordionStateCreate) => {
        setAccordionState({
            config: false,
            header: false,
            body: false,
            footer: false,
            botao: false
        })
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const rodapeRadio = (e: any) => {
        const value = e.target.value === "srodape"
        setRodape(!value)
        let rodapeText = ""
        if (value) {
            rodapeText = ""
        }
        setTemplate(prevState => ({
            ...prevState,
            footer: rodapeText,
        }));
    }

    const handleAddVariable = () => {
        if (variables.length < 8) {
            const newVariables: IVariables = {
                id: Date.now(),
                value: `${variables.length + 1}`,
                text: ""
            };
            setVariables(prevVariables => [...prevVariables, newVariables]);
            setTemplate(prevState => ({
                ...prevState,
                "body": prevState.body + `{{${variables.length + 1}}}`,
            }));
        }
    };

    const handleDeleteItem = (id: number) => {
        setButtons(buttons.filter(button => button.id !== id));
    };

    const handleAddButton = () => {
        if (buttons.length < 3) {
            const newButtons: IButton = {
                id: Date.now(),
                value: `Button ${buttons.length + 1}`,
                text: ""
            };
            setButtons(prevButtons => [...prevButtons, newButtons]);
        }
    };

    const quickReplyRadio = (e: any) => {
        setTypeOfButtons(e.target.value)
    }

    const handleAddButtonText = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setButtons(prevButtons => {
            return prevButtons.map(button => {
                if (button.id.toString() === name) {
                    return { ...button, text: value };
                }
                return button;
            });
        });
    };

    const handleDeleteVariables = (id: number) => {
        let value: number = 99;
        for (let i = 0; i < variables.length; i++) {
            if (variables[i].id === id) {
                value = i + 1;
            }
        }
        const newBody = template.body.replace(`{{${value}}}`, '');

        const body = newBody.replace(/{{(\d+)}}/g, (match, p1) => {
            const num = parseInt(p1, 10);
            return `{{${num > value ? num - 1 : num}}}`;
        });
        setTemplate(prevState => ({
            ...prevState,
            "body": body,
        }));
        setVariables(variables.filter(variable => variable.id !== id));
    };

    const handleInputVariable = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setVariables(prevVariables => {
            return prevVariables.map(variable => {
                if (variable.id.toString() === name) {
                    return { ...variable, text: value };
                }
                return variable;
            });
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setTemplate(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const headerRadio = (e: any) => {
        setTypeOfHeader(e.target.value)
        setHeader(prevState => ({ ...prevState, parameters: [{ type: e.target.value }] }))
        setTemplate(prevState => ({
            ...prevState,
            header: "",
        }));
    }

    const handleChangeText = (text: string) => {
        return text.replace(/{{(\d+)}}/g, (match, p1) => {
            const indice = parseInt(p1, 10) - 1;
            if (indice >= 0 && indice < variables.length) {
                return variables[indice].text;
            } else {
                return match;
            }
        });
    }

    const createPayload = () => {
        if (headers === undefined) {
            errorMessageHeader()
            return;
        }
        console.log(template.footer === "")
        console.log(rodape === false)
        if (template.footer === "" && rodape === false) {
            errorMessageFooter()
            return;
        }
        if (template.body === "") {
            errorMessageBody()
            return;
        }
        waitingMessage();
        let footer: IFooter;
        let body: IObject;
        let header: IHeader;
        let buttonQR: ButtonQR;
        const payload: any = {};
        const components: any[] = [];
        if (typeOfButtons === "quickReply") {
            buttonQR = {
                type: "button",
                parameters: []
            }
            let errorQR = false;
            for (let index = 0; index < buttons.length; index++) {
                if (buttons[index].text !== "") {
                    buttonQR.parameters.push({ type: typeOfButtons, text: buttons[index].text })
                } else {
                    errorQR = true;
                }
            }
            if (errorQR) {
                erroMessageQuickReply()
                return;
            }
            components.push(buttonQR);
        }

        if (template.footer) {
            footer = {
                type: "footer",
                parameters: [{
                    type: "text",
                    text: template.footer,
                }]
            }
            components.push(footer);
        }
        console.log(headers)
        if (headers?.parameters?.[0].type !== "sheader") {
            header = {
                type: "header",
                parameters: [
                    {
                        type: headers?.parameters?.[0].type,
                        text: template.header
                    }
                ]
            }
            components.push(header);
        }
        body = {
            type: "body",
            parameters: [
                {
                    type: "text",
                    text: template.body,
                }
            ]
        }
        if (variables.length > 0) {
            body.parameters[0].example = [];
            for (let index = 0; index < variables.length; index++) {
                body.parameters[0].example.push(variables[index].text)
            }
        }
        components.push(body);
        payload["components"] = components;
        payload["category"] = templateType;
        payload["name"] = templateName;
        payload["language"] = "pt_BR";//configTemplate.language;
        console.log(payload)
        api.post('/whats/template', payload)
            .then(resp => {
                successCreateTemplate()
                setTimeout(() => history("/template/list"), 3000)
            })
            .catch(err => {
                errorMessage()
            })

    }

    return (
        <div style={{ width: "80vw" }}>
            <div >
                <ToastContainer />
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69" }}>Envio de Campanhas</h1>
                <div style={{ width: "110%", border: "1px solid #000", marginBottom: "30px" }}></div>
                <div className="config-template">
                    <div className="header-accordion" style={{ borderRadius: "20px 20px 0px 0px" }} onClick={() => toggleAccordion('config')}>1. Configuração</div>
                    {accordionState.config &&
                        <div style={{ display: "flex", flexDirection: "row", textAlign: "left", backgroundColor:"#f1f1f1", width:"800px" }}>
                            <div className="input" style={{justifyContent: "center"}}>
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <span className="span-title">Nome*</span>
                                    <input type="text"
                                        className="input-values"
                                        maxLength={512}
                                        name="templateName"
                                        value={templateName}
                                        onChange={e => setTemplateName(e.target.value.trim().toLowerCase())}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <span className="span-title">Categoria*</span>
                                    <select className="input-values" onChange={e => setTemplateType(e.target.value)}>
                                        <option>---</option>
                                        <option value={"AUTHENTICATION"}>Autenticação</option>
                                        <option value={"UTILITY"}>Utilitário</option>
                                        <option value={"MARKETING"}>Marketing</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ width: "340px", display: "flex", flexDirection: "row", textAlign: "left", marginLeft: "20px", borderLeft: "2px solid #FFF", paddingLeft: "10px", backgroundColor: "#DAE7F0" }}>
                                <div style={{ margin: "10px" }}>
                                    <img src={alert} width={25} alt="alerta" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", minHeight:"200px"}}>
                                    <span style={{ padding: "10px", fontSize: "16px" }} className="bolder">{templateType === "AUTHENTICATION" ? "Autenticação" : templateType === "UTILITY" ? "Utilitário" : templateType === "MARKETING" ? "Marketing" : "Início"}</span>
                                    <span style={{ marginRight: "50px", fontSize: "11px" }}>{selectTemplate(templateType)}</span>
                                </div>
                            </div>
                        </div>}
                </div>
                <div className="config-recebidores" style={{ maxHeight: "600px" }}>
                    <div className="header-accordion" onClick={() => toggleAccordion('header')}>2. Header</div>
                    {accordionState.header && <div className="body">
                        <div className="radio row-align">
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="text" name="header" /><span className="padding-5">Texto</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="image" name="header" /><span className="padding-5">Imagem</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="document" name="header" /><span className="padding-5">Documento</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="video" name="header" /><span className="padding-5">Video</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="sheader" name="header" /><span className="padding-5">Sem cabeçalho</span></div>
                        </div>
                        {typeOfHeader === "text" &&
                            <div className="container-configure">
                                <div>
                                    <div style={{ display: "flex", flexDirection: "initial", paddingLeft: "50px" }}>
                                        <span>Texto do Cabeçalho</span>
                                    </div>
                                    <input type="text"
                                        maxLength={60}
                                        name="header"
                                        value={template.header}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        style={{ width: "90%" }}
                                    />
                                    <div style={{ width: "92%", textAlign: "end" }}>
                                        <span>{template.header.length}/60</span>
                                    </div>
                                </div>
                                <Alert message="No cabeçalho você poderá inserir no máximo uma variável,
                    para inserir a variável será necessário colocar duas chaves conforme exemplo <strong>{{texto exemplo da variavel}}</strong>,
                    para aprovação do seu template será necessário escrever um texto exemplo que será enviado na sua variavel."/>
                            </div>
                        }
                        {typeOfHeader === "image" &&
                            <div className="container-configure">
                                <Alert message={"Você vai inserir a url da imagem no momento em que for disparar a mensagem."} />
                            </div>
                        }
                        {typeOfHeader === "document" &&
                            <div className="container-configure">
                                <Alert message={"Você vai inserir a url da documento no momento em que for disparar a mensagem."} />
                            </div>

                        }
                        {typeOfHeader === "video" &&
                            <div className="container-configure">
                                <Alert message={"Você vai inserir a url do video no momento em que for disparar a mensagem."} />
                            </div>

                        }
                    </div>}
                </div>
                <div className="modo-disparo">
                    <div className="header-accordion" onClick={() => toggleAccordion('body')}>3. Body</div>
                    {accordionState.body && <div className="body">
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", textAlign: "initial", paddingLeft: "20px" }}>
                            <span className="bolder">Corpo da Mensagem</span>
                            <span style={{ fontSize: "11px", marginBottom: "20px", fontStyle: "italic" }}>Este é o principal conteúdo de texto no seu template.</span>
                            <span>Corpo da mensagem</span>

                            <textarea
                                maxLength={1024}
                                name="body"
                                value={template.body}
                                onChange={handleInputChange}
                                style={{ width: "90%", borderRadius: "20px" }}
                            />

                            <div style={{ width: "87%", textAlign: "end" }}>
                                <span>{template.body.length}/1024</span>
                            </div>
                            <span>Variáveis</span>
                            <div>
                                <button onClick={handleAddVariable} style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }}>Adicionar</button>
                            </div>

                            {variables.map((variable, index) => (
                                <div style={{ display: "flex", flexDirection: "row",justifyContent: "center" }}>
                                    <span className="span-title">{index + 1}.  </span> <input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} className="input-values" /><img src={minus} alt="minus" width={20} height={20} style={{ cursor: "pointer" }} onClick={() => handleDeleteVariables(variable.id)} />
                                </div>

                            ))
                            }
                        </div>
                    </div>}
                </div>
                <div className="revisar">
                    <div className="header-accordion" onClick={() => toggleAccordion('footer')}>4. Footer</div>
                    {accordionState.footer && <div className="body">
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", textAlign: "initial", paddingLeft: "20px" }}>
                            <div className="radio row-align">
                                <div className="row-align" onChange={rodapeRadio}><input type="radio" name="Texto" value="srodape" /><span className="padding-5">Texto</span></div>
                                <div className="row-align" onChange={rodapeRadio}><input type="radio" name="Texto" value="rodape" /><span className="padding-5">Sem rodapé</span></div>
                            </div>

                            {!rodape && <div>
                                <input type="text"
                                    maxLength={60}
                                    style={{ width: "90%" }}
                                    name="footer"
                                    value={template.footer}
                                    onChange={handleInputChange}
                                    className="input-values"
                                />
                                <div style={{ width: "87%", textAlign: "end" }}>
                                    <span>{template.footer.length}/60</span>
                                </div>
                            </div>
                            }
                            <Alert message="No rodapé você não poderá inserir variável." />
                        </div>
                    </div>}
                </div>
                <div className="revisar">
                    <div className="header-accordion" onClick={() => toggleAccordion('botao')}>5. Botão</div>
                    {accordionState.botao && <div className="body">
                        <div style={{ width: "50%", marginBottom: "20px" }}>
                            <div className="radio row-align">
                                <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="quickReply" name="quickReply" /><span className="padding-5">Resposta rápida</span></div>
                                <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="cta" name="quickReply" /><span className="padding-5">CTA</span></div>
                                <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="without" name="quickReply" /><span className="padding-5">Nenhum</span></div>
                            </div>
                            {typeOfButtons !== "without" &&
                                <div>
                                    <div style={{ display: "flex", flexDirection: "row", marginLeft: "100px" }}>
                                        <button style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }} onClick={handleAddButton}>Adicionar</button>
                                    </div>
                                    {buttons.map((button, index) => (
                                        <div className="container-configure" key={button.id}>
                                            <div className="row-align">
                                                {/* <div>
                                    <span className="bolder" style={{ marginTop: " 13px" }}>Tipo do botão</span>
                                    <select style={{ width: "200px" }}>
                                        <option value={"quickReply"}>Resposta rápida</option>
                                        <option value={"staticURL"}>URL</option>
                                        <option value={"phoneNumber"}>Telefone</option>
                                    </select>
                                </div> */}
                                                <div style={{ marginLeft: "50px" }}>
                                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                                        <span className="span-title">Texto</span>
                                                        <input
                                                            value={button.text}
                                                            onChange={handleAddButtonText}
                                                            maxLength={20}
                                                            name={button.id.toString()}
                                                            className="input-values" />
                                                        <img src={minus} alt="minus" width={20} height={20} onClick={() => handleDeleteItem(button.id)} style={{ cursor: "pointer" }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }</div>
                    </div>}
                    <div style={{ display: "flex", flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end" }}>
                        <button onClick={BackToList} style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} >Cancelar</button>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={createPayload}>Salvar</button>
                    </div>
                </div>
            </div >
            <div className="image-container rigth fixed" style={{ position: "fixed", color: "#000", alignContent: "end", textAlign: "end", right: "20px", bottom: "0px" }}>
                <img src={whatsappBackground} alt="Logo" width={350} height={600} />
                <div className="overlay-text">
                    <div className="texts">
                        {typeOfHeader === "text" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{template.header}</label>}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {handleChangeText(template.body)}</label>}
                        {<label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize: "12px" }}>{template.footer}</label>}
                        <div className="quickReply-texts">
                            {buttons.length > 0 && (<div className="quick-reply"><label >{buttons[0].text}</label></div>)}
                            {buttons.length > 1 && (<div className="quick-reply"><label >{buttons[1].text}</label></div>)}
                            {buttons.length > 2 && (<div className="quick-reply"><label >{buttons[2].text}</label></div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateTemplateAccordion;