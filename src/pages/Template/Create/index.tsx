import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import alert from '../../../img/help.png'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { erroMessageQuickReply, errorMessageHeader, errorMessageFooter, errorMessageBody, waitingMessage, successCreateTemplate, errorMessage } from "../../../Components/Toastify";
import strings from '../strings.json'
import api from "../../../utils/api";
import { ToastContainer } from "react-toastify";
import whatsappBackground from '../../../img/background_1.png';
import './index.css'
import minus from '../../../img/minus.png';
import Alert from "../../../Components/Alert";
import { AccordionStateCreate, ButtonQR, IButton, IFooter, IHeader, IObject, ITemplate, IVariables, templateValue } from "../../types";
import { mask } from "../../../utils/utils";
import useModal from "../../../Components/Modal/useModal";
import Modal from "../../../Components/Modal";

export function CreateTemplateAccordion() {

    const history = useNavigate();
    function BackToList() {
        history(`/template-list?bot_id=${botId}`)
    }

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";

    const [templateName, setTemplateName] = useState<string>("")
    const [templateType, setTemplateType] = useState<string>("")
    const [accordionState, setAccordionState] = useState<AccordionStateCreate>({
        config: true,
        header: false,
        body: false,
        footer: false,
        botao: false
    });
    const [typeOfHeader, setTypeOfHeader] = useState<string>("sheader")
    const [rodapeType, setRodapeType] = useState<string>("srodape")
    const [headers, setHeader] = useState<IHeader>();
    const [template, setTemplate] = useState<ITemplate>(templateValue)
    const [variables, setVariables] = useState<IVariables[]>([])
    const [rodape, setRodape] = useState<boolean>(true);
    const [buttons, setButtons] = useState<IButton[]>([])
    const [buttonsCTA, setButtonsCTA] = useState<IButton[]>([])
    const [typeOfButtons, setTypeOfButtons] = useState<string>('without')
    const [phone, setPhone] = useState<string>("")
    const [profilePic, setProfilePic] = useState<string>("")

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

    useEffect(() => {
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }
        api.get(`/whats-botid/${botId}`)
            .then(resp => {
                setPhone(resp.data.number)
                const token = resp.data.accessToken;
                api.get("https://whatsapp.smarters.io/api/v1/settings", { headers: { 'Authorization': token } })
                    .then(res => {
                        setProfilePic(res.data.data.profile_pic)
                        // handleImageLoad()
                    })
                    .catch(error => console.log(error))
            })
    }, []);

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
        setRodapeType(e.target.value);
        const value = e.target.value === "rodape"
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
        if (typeOfButtons !== "cta") {
            setButtons(buttons.filter(button => button.id !== id));
        }
        if (typeOfButtons === "cta") {
            setButtonsCTA(buttonsCTA.filter(button => button.id !== id));
        }
    };

    const handleAddButton = () => {
        if (typeOfButtons !== "cta") {
            if (buttons.length < 3) {
                const newButtons: IButton = {
                    id: Date.now(),
                    value: `Button ${buttons.length + 1}`,
                    text: ""
                };
                setButtons(prevButtons => [...prevButtons, newButtons]);
            }
        }
        if (typeOfButtons === "cta") {
            if (buttonsCTA.length < 2) {
                const newButtons: IButton = {
                    id: Date.now(),
                    value: `Button ${buttons.length + 1}`,
                    text: ""
                };
                setButtonsCTA(prevButtons => [...prevButtons, newButtons]);
            }
        };
    }
    const quickReplyRadio = (e: any) => {
        setTypeOfButtons(e.target.value)
    }

    const handleAddButtonText = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, buttonId: string) => {
        const { name, value } = e.target;
        if (typeOfButtons !== "cta") {
            setButtons(prevButtons => {
                return prevButtons.map(button => {
                    if (button.id.toString() === buttonId) {
                        return { ...button, text: value };
                    }
                    return button;
                });
            });
        }
        if (typeOfButtons === "cta") {
            setButtonsCTA(prevButtons => {
                return prevButtons.map(button => {
                    if (button.id.toString() === buttonId) {
                        if (value === "phoneNumber" || value === "staticURL")
                            return { ...button, type: value };
                        if (name === "url_phone")
                            return { ...button, url_phone: value };
                        else
                            return { ...button, text: value };
                    }
                    return button;
                });
            });
        }
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
        if (typeOfButtons === "cta") {
            buttonQR = {
                type: "button",
                parameters: []
            }
            let errorQR = false;
            for (let index = 0; index < buttonsCTA.length; index++) {
                if (buttonsCTA[index].text !== "") {
                    const url_phone = buttonsCTA[index].type === "staticURL" ? "url" : "phoneNumber"
                    buttonQR.parameters.push({ type: buttonsCTA[index].type, text: buttonsCTA[index].text, [url_phone]: buttonsCTA[index].url_phone })
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
        if (headers?.parameters?.[0].type === "text") {
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
        if (headers?.parameters?.[0].type === "image" ||
            headers?.parameters?.[0].type === "video" ||
            headers?.parameters?.[0].type === "document") {
            header = {
                type: "header",
                parameters: [
                    {
                        type: headers?.parameters?.[0].type,
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
        api.post(`/whats/template/${botId}`, payload)
            .then(resp => {
                successCreateTemplate()
                setTimeout(() => (`/template-list?bot_id=${botId}`), 3000)
            })
            .catch(err => {
                console.log("$s ERROR create template: %O", new Date(), err)
                errorMessage()
            })

    }
    const modalRef = useRef<HTMLDivElement>(null);
    const { isOpen, toggle } = useModal();
    const [buttonA, setButtonA] = useState<string>("")
    const [buttonB, setButtonB] = useState<string>("")
    const [textToModal, setTextToModal] = useState<string>("")
    const [midia, setMidia] = useState<string>();
    const handleButtonName = (wichButton: string) => {
        if (wichButton === "Salvar") {
            setButtonA("Fechar")
            setButtonB("Confirmar")
            setTextToModal("Tem certeza que deseja salvar")
        } else if (wichButton === "Cancelar") {
            setButtonA("Fechar")
            setButtonB("Voltar")
            setTextToModal("Tem certeza que deseja voltar")
        }
        toggle();
    }
    const removeAccentsAndCommas = (str: string) => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/,/g, '')
          .replace(/[~´`^"']/g, '');
      }
    const handleButtonClick = (buttonId: string) => {
        if (buttonId === "Confirmar") {
            createPayload()
        } else if (buttonId === "Fechar") {
            toggle()
        } else if (buttonId === "Voltar") {
            toggle();
            BackToList();
        }
    };
    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const imagemSelecionada = event.target.files?.[0];
        if (imagemSelecionada) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setMidia(dataUrl);
            };
            reader.readAsDataURL(imagemSelecionada);
        }
    };
    return (
        <div style={{ width: "80vw" }}>
            <div style={{width:"800px"}}>
                <Modal buttonA={buttonA} buttonB={buttonB} isOpen={isOpen} modalRef={modalRef} toggle={toggle} question={textToModal} onButtonClick={handleButtonClick}></Modal>
                <ToastContainer />
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <img src={profilePic} width={60} height={60} alt='logo da empresa' style={{ marginBottom: "-17px" }} />
                </div>
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", marginLeft:"65px" }} className="title_2024">Criar Template</h1>
                <hr className="hr_color"/>
                <div className="config-template">
                    <div className="header-accordion" style={{ borderRadius: "20px 20px 0px 0px" }} onClick={() => toggleAccordion('config')}>1. Configuração</div>
                    {accordionState.config &&
                        <div style={{ display: "flex", flexDirection: "row", textAlign: "left", backgroundColor: "#f1f1f1", width: "800px" }}>
                            <div className="input" style={{ justifyContent: "center" }}>
                                <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                    <span className="span-title">Nome</span>
                                    <input type="text"
                                        className="input-values"
                                        maxLength={512}
                                        name="templateName"
                                        value={templateName}
                                        onChange={e => setTemplateName(removeAccentsAndCommas(e.target.value).replace(/\s/g, '').toLowerCase())}
                                    />
                                    <a data-tooltip-id="my-tooltip-multiline" data-tooltip-html="Utilizar apenas letras, números e underline.<br /> Não utilizar espaços, acentuações e virgulas.<br />Exemplo correto: template_1">
                                        <img src={alert} width={20} height={20} alt="alerta" />
                                    </a>
                                    <Tooltip id="my-tooltip-multiline" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                    <span className="span-title">Categoria</span>
                                    <select className="input-values" value={templateType} onChange={e => setTemplateType(e.target.value)}>
                                        <option>---</option>
                                        <option value={"AUTHENTICATION"}>Autenticação</option>
                                        <option value={"UTILITY"}>Utilitário</option>
                                        <option value={"MARKETING"}>Marketing</option>
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "center" }}>Tel. Origem</span>
                                    <input type="text"
                                        className="input-values"
                                        value={mask(phone)}
                                        disabled
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                    <span className="span-title">Bot ID</span>
                                    <input type="text"
                                        className="input-values"
                                        value={botId ?? ""}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div style={{ width: "340px", display: "flex", flexDirection: "row", textAlign: "left", marginLeft: "20px", borderLeft: "2px solid #FFF", paddingLeft: "10px", backgroundColor: "#DAE7F0" }}>
                                <div style={{ margin: "10px" }}>
                                    <img src={alert} width={25} alt="alerta" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", minHeight: "200px" }}>
                                    <span style={{ padding: "10px", fontSize: "16px" }} className="bolder">{templateType === "AUTHENTICATION" ? "Autenticação" : templateType === "UTILITY" ? "Utilitário" : templateType === "MARKETING" ? "Marketing" : "Início"}</span>
                                    <span style={{ marginRight: "50px", fontSize: "11px" }}>{selectTemplate(templateType)}</span>
                                </div>
                            </div>
                        </div>}
                </div>
                <div className="config-recebidores" style={{ maxHeight: "600px" }}>
                    <div className="header-accordion" onClick={() => toggleAccordion('header')}>2. Cabeçalho</div>
                    {accordionState.header && <div className="body">
                        <div className="radio row-align">
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="text" name="header" checked={typeOfHeader === 'text'} /><span className="padding-5">Texto</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="image" name="header" checked={typeOfHeader === 'image'} /><span className="padding-5">Imagem</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="document" name="header" checked={typeOfHeader === 'document'} /><span className="padding-5">Documento</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="video" name="header" checked={typeOfHeader === 'video'} /><span className="padding-5">Video</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="sheader" name="header" checked={typeOfHeader === 'sheader'} /><span className="padding-5">Sem cabeçalho</span></div>
                        </div>
                        {typeOfHeader === "text" &&
                            <div className="container-configure">
                                <div style={{ width: "750px" }}>
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
                            </div>
                        }
                        {typeOfHeader === "image" &&
                            <div className="container-configure">
                                <input type="file"
                                    accept="image"
                                    name="header"
                                    onChange={handleImageUpload}
                                />
                                <Alert message={"Você vai inserir a url da imagem no momento em que for disparar a mensagem."} />
                            </div>

                        }
                        {typeOfHeader === "document" &&
                            <div className="container-configure">
                                <input type="file"
                                    accept="file"
                                    name="header"
                                />
                                <Alert message={"Você vai inserir a url da documento no momento em que for disparar a mensagem."} />
                            </div>

                        }
                        {typeOfHeader === "video" &&
                            <div className="container-configure">
                                <Alert message={"Você vai inserir a url do video no momento em que for disparar a mensagem. A visualização ao lado é simbolica."} />
                            </div>

                        }
                    </div>}
                </div>
                <div className="modo-disparo">
                    <div className="header-accordion" onClick={() => toggleAccordion('body')}>3. Corpo da Mensagem</div>
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
                            <span style={{ fontWeight: "bolder" }}>Variáveis</span>
                            <div>
                                <button onClick={handleAddVariable} style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }}>Adicionar</button>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)', // Duas colunas de largura igual
                                gridTemplateRows: 'repeat(4, auto)', // Quatro linhas com altura automática
                                gap: '10px' // Espaçamento entre as células
                            }}>
                                {variables.map((variable, index) => (
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                        <span className="span-title-variables">{index + 1}.  </span> <input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} className="input-values" /><img src={minus} alt="minus" width={20} height={20} style={{ cursor: "pointer", marginTop: "15px" }} onClick={() => handleDeleteVariables(variable.id)} />
                                    </div>

                                ))
                                }
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="revisar">
                    <div className="header-accordion" onClick={() => toggleAccordion('footer')}>4. Rodapé</div>
                    {accordionState.footer && <div className="body">
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", textAlign: "initial", paddingLeft: "20px" }}>
                            <div className="radio row-align">
                                <div className="row-align" onChange={rodapeRadio}><input type="radio" name="Texto" value="rodape" checked={rodapeType === 'rodape'} /><span className="padding-5">Texto</span></div>
                                <div className="row-align" onChange={rodapeRadio}><input type="radio" name="Texto" value="srodape" checked={rodapeType === 'srodape'}/><span className="padding-5">Sem rodapé</span></div>
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
                    <div className="header-accordion" onClick={() => toggleAccordion('botao')}>5. Botões</div>
                    {accordionState.botao && <div className="body">
                        <div style={{ width: "100%", marginBottom: "20px", paddingLeft: "20px" }}>
                            <div className="radio row-align">
                                <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="quickReply" name="quickReply" checked={typeOfButtons === 'quickReply'}/><span className="padding-5">Resposta rápida</span></div>
                                <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="cta" name="quickReply" checked={typeOfButtons === 'cta'} /><span className="padding-5">CTA</span></div>
                                <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="without" name="quickReply" checked={typeOfButtons === 'without'} /><span className="padding-5">Nenhum</span></div>
                            </div>
                            {typeOfButtons === "quickReply" &&
                                <div>
                                    <div style={{ display: "flex", flexDirection: "row", marginLeft: "100px" }}>
                                        <button style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }} onClick={handleAddButton}>Adicionar</button>
                                    </div>
                                    {buttons.map((button, index) => (
                                        <div className="container-configure" key={button.id}>
                                            <div className="row-align">
                                                <div style={{ marginLeft: "50px" }}>
                                                    <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                                        <span className="span-title">Texto</span>
                                                        <input
                                                            value={button.text}
                                                            onChange={e => handleAddButtonText(e, button.id.toString())}
                                                            maxLength={20}
                                                            name={button.id.toString()}
                                                            className="input-values" />
                                                        <img src={minus} alt="minus" width={20} height={20} onClick={() => handleDeleteItem(button.id)} style={{ cursor: "pointer", marginTop: "15px" }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                            {typeOfButtons === "cta" &&
                                <div style={{ width: "100%" }}>
                                    <div style={{ display: "flex", flexDirection: "row", marginLeft: "100px" }}>
                                        <button style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }} onClick={handleAddButton}>Adicionar</button>
                                    </div>
                                    {buttonsCTA.map((button, index) => (
                                        <div className="container-configure" style={{ width: "100%" }} key={button.id}>
                                            <div className="row-align">
                                                <div style={{ display: "flex", flexDirection: "row" }}>
                                                    <span className="span-title" style={{ marginTop: " 13px" }}>Tipo</span>
                                                    <select style={{ width: "100px" }} className="input-values" name={button.id.toString()} onChange={e => handleAddButtonText(e, button.id.toString())}>
                                                        <option>--</option>
                                                        <option value={"staticURL"}>URL</option>
                                                        <option value={"phoneNumber"}>Telefone</option>
                                                    </select>
                                                    <input type="text" className="input-values" name="text" onChange={e => handleAddButtonText(e, button.id.toString())} placeholder="Nome do botão" />
                                                    <input type="text" className="input-values" name="url_phone" onChange={e => handleAddButtonText(e, button.id.toString())} /><img src={minus} alt="minus" width={20} height={20} onClick={() => handleDeleteItem(button.id)} style={{ cursor: "pointer", marginTop: "15px" }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Alert message="No primeiro campo colocar o nome a ser exibido no botão, no segundo campo é o valor do campo. Exemplo: campo 1: Site campo 2: www.inbot.com.br, desta forma ao clicar no botão escrito Site o usuário será direcionado para o site da InBot." />
                                </div>
                            }</div>
                    </div>}
                    <div style={{ flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end" }}>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={() => handleButtonName("Cancelar")}>Cancelar</button>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={() => handleButtonName("Salvar")}>Salvar</button>
                    </div>
                </div>
            </div >
            <div className="image-container rigth fixed" style={{ position: "fixed", color: "#000", alignContent: "end", textAlign: "end", right: "20px", bottom: "0px" }}>
                <img src={whatsappBackground} alt="Logo" width={350} height={600} />
                <div className="overlay-text">
                    <div className="texts">
                        {typeOfHeader === "text" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{template.header}</label>}
                        {typeOfHeader === "image" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={midia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "document" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={midia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "video" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><video width="160" height="120" controls><source src={midia} type="video/mp4" /></video></label>}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {handleChangeText(template.body)}</label>}
                        {<label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize: "12px" }}>{template.footer}</label>}
                        {typeOfButtons !== "cta" && <div className="quickReply-texts">
                            {buttons.length > 0 && (<div className="quick-reply"><label >{buttons[0].text}</label></div>)}
                            {buttons.length > 1 && (<div className="quick-reply"><label >{buttons[1].text}</label></div>)}
                            {buttons.length > 2 && (<div className="quick-reply"><label >{buttons[2].text}</label></div>)}
                        </div>}
                        {typeOfButtons === "cta" && <div className="quickReply-texts">
                            {buttonsCTA.length > 0 && (<div className="quick-reply"><label >{buttonsCTA[0].text}</label></div>)}
                            {buttonsCTA.length > 1 && (<div className="quick-reply"><label >{buttonsCTA[1].text}</label></div>)}
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateTemplateAccordion;