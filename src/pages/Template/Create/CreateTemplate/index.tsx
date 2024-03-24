import React, { ChangeEvent, useState } from "react";
import '../index.css'
import Alert from "../../../../Components/Alert"
import whatsappBackground from '../../../../img/background.jpeg';
import minus from '../../../../img/minus.png';
import { IButton, IFooter, IHeader, IObject, ITemplate, IVariables, templateValue } from "../../../types";
import api from "../../../../utils/api";
import { ToastContainer } from "react-toastify";
import { errorMessageHeader, waitingMessage, errorMessageFooter, errorMessageBody, erroMessageQuickReply } from '../../../../Components/Toastify'
import { useNavigate } from "react-router-dom";

export function CreateTemplate() {
    const [template, setTemplate] = useState<ITemplate>(templateValue)
    const [rodape, setRodape] = useState<boolean>(false);
    const [headers, setHeader] = useState<IHeader>();
    const [typeOfHeader, setTypeOfHeader] = useState<string>("")
    const [buttons, setButtons] = useState<IButton[]>([])
    const [variables, setVariables] = useState<IVariables[]>([])
    const [midia, setMidia] = useState<string>();
    const [typeOfButtons, setTypeOfButtons] = useState<string>('without')

    const history = useNavigate();
    function BackToHome() {
        history("/template/list");
    }

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
    const headerRadio = (e: any) => {
        setTypeOfHeader(e.target.value)
        setHeader(prevState => ({ ...prevState, parameters: [{ type: e.target.value }] }))
        setTemplate(prevState => ({
            ...prevState,
            header: "",
        }));
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

    const handleDeleteItem = (id: number) => {
        setButtons(buttons.filter(button => button.id !== id));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setTemplate(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

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

    const quickReplyRadio = (e: any) => {
        setTypeOfButtons(e.target.value)
    }

    interface ButtonQR {
        type: string;
        parameters: { type: string; text: string }[];
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
        const templateString = localStorage.getItem("template")
        const configTemplate = templateString ? JSON.parse(templateString) : null
        components.push(body);
        payload["components"] = components;
        payload["category"] = configTemplate.type;
        payload["name"] = configTemplate.name;
        payload["language"] = configTemplate.language;
        // api.post('/whats/template', payload)
        //     .then(resp => {
        //         successCreateTemplate()
        //         setTimeout(() => history("/template/list"), 3000)
        //     })
        //     .catch(err => {
        //         errorMessage()
        //     })

    }

    return (
        <div className="container" style={{ color: "#FFF", width: "100wv" }}>
            <ToastContainer />
            <div className="input left" style={{ backgroundColor: "#010042", padding: "20px", width: "50wv" }}>
                <span className="bolder">Cabeçalho</span>
                <span style={{ fontSize: "12px", marginBottom: "20px" }}>O cabeçalho pode conter texto destacado, imagem, video ou documento</span>
                <div className="radio row-align">
                    <div className="row-align" onChange={headerRadio}><input type="radio" value="text" name="header" /><span className="padding-5">Texto</span></div>
                    <div className="row-align" onChange={headerRadio}><input type="radio" value="image" name="header" /><span className="padding-5">Imagem</span></div>
                    <div className="row-align" onChange={headerRadio}><input type="radio" value="document" name="header" /><span className="padding-5">Documento</span></div>
                    <div className="row-align" onChange={headerRadio}><input type="radio" value="video" name="header" /><span className="padding-5">Video</span></div>
                    <div className="row-align" onChange={headerRadio}><input type="radio" value="sheader" name="header" /><span className="padding-5">Sem cabeçalho</span></div>
                </div>
                {typeOfHeader === "text" &&
                    <div className="container-configure">
                        <span>Texto do Cabeçalho</span>
                        <input type="text"
                            maxLength={60}
                            name="header"
                            value={template.header}
                            onChange={handleInputChange}
                        />
                        <div style={{ width: "100%", textAlign: "end" }}>
                            <span>{template.header.length}/60</span>
                        </div>
                        <Alert message="No cabeçalho você poderá inserir no máximo uma variável,
                    para inserir a variável será necessário colocar duas chaves conforme exemplo <strong>{{texto exemplo da variavel}}</strong>,
                    para aprovação do seu template será necessário escrever um texto exemplo que será enviado na sua variavel."/>
                    </div>
                }
                {typeOfHeader === "image" &&
                    <div className="container-configure">
                        <span>Texto do Cabeçalho</span>
                        <input type="file"
                            accept="image"
                            name="header"
                            onChange={handleImageUpload}
                        />
                    </div>

                }
                {typeOfHeader === "document" &&
                    <div className="container-configure">
                        <span>Texto do Cabeçalho</span>
                        <input type="file"
                            accept="file"
                            name="header"
                            onChange={handleInputChange}
                        />
                    </div>

                }
                {typeOfHeader === "video" &&
                    <div className="container-configure">
                        <span>Texto do Cabeçalho</span>
                        <input type="file"
                            accept="video"
                            name="header"
                            onChange={handleInputChange}
                        />
                    </div>

                }
                <div style={{ width: "100%", border: "1px solid #0171BD", marginTop: "12px" }}></div>
                <span className="bolder" style={{ marginTop: "20px" }}>Corpo da Mensagem</span>
                <span style={{ fontSize: "12px" }}>Este é o principal conteúdo de texto no seu template.</span>
                <span style={{ marginTop: "20px" }}>Corpo da mensagem</span>
                <textarea
                    maxLength={1024}
                    name="body"
                    value={template.body}
                    onChange={handleInputChange}
                    style={{ width: "100%" }}
                />
                <div style={{ width: "100%", textAlign: "end" }}>
                    <span>{template.body.length}/1024</span>
                </div>
                <span>Variáveis</span>
                <div>
                    <button onClick={handleAddVariable} style={{ backgroundColor: "#FFF", color: "#0171BD", border: "1px solid #0171BD", margin: "3px", width: "30px" }}>+</button>
                </div>
                {variables.map((variable, index) => (
                    <div>
                        <span>{index + 1}.  </span> <input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} /><img src={minus} alt="minus" width={20} height={20} style={{ cursor: "pointer" }} onClick={() => handleDeleteVariables(variable.id)} />
                    </div>

                ))
                }
                <div style={{ width: "100%", border: "1px solid #0171BD", marginTop: "12px" }}></div>
                <span className="bolder" style={{ marginTop: "20px" }}>Rodapé</span>
                <span style={{ fontSize: "12px", marginBottom: "20px" }}>Sua mensagem pode conter um rodapé como texto.</span>
                <div className="radio row-align">
                    <div className="row-align" onChange={rodapeRadio}><input type="radio" name="Texto" value="srodape" /><span className="padding-5">Texto</span></div>
                    <div className="row-align" onChange={rodapeRadio}><input type="radio" name="Texto" value="rodape" /><span className="padding-5">Sem rodapé</span></div>
                </div>
                {!rodape && <div>
                    <input type="text"
                        maxLength={60}
                        style={{ width: "100%" }}
                        name="footer"
                        value={template.footer}
                        onChange={handleInputChange}
                    />
                    <div style={{ width: "100%", textAlign: "end" }}>
                        <span>{template.footer.length}/60</span>
                    </div>
                </div>
                }
                <Alert message="No rodapé você não poderá inserir variável." />
                <div style={{ width: "100%", border: "1px solid #0171BD", marginTop: "12px" }}></div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="bolder" style={{ marginTop: "20px" }}>Botão</span>
                        <span style={{ fontSize: "12px", marginBottom: "20px" }}>Sua mensagem pode ter até 3 botões que pertencem a um desses tipos</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", marginTop: "40px", marginLeft: "100px" }}>
                        <button style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }} onClick={handleAddButton}>Adicionar</button>
                    </div>
                </div>
                <div style={{ height: "290px", width: "50%" }}>
                    <div className="radio row-align">
                        <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="quickReply" name="quickReply" /><span className="padding-5">Resposta rápida</span></div>
                        <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="cta" name="quickReply" /><span className="padding-5">CTA</span></div>
                        <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="without" name="quickReply" /><span className="padding-5">Nenhum</span></div>
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
                                    <span className="bolder" style={{ marginTop: " 13px" }}>Texto do botão</span>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div>
                                            <input
                                                value={button.text}
                                                onChange={handleAddButtonText}
                                                maxLength={20}
                                                name={button.id.toString()}
                                                style={{ width: "300px" }} />
                                        </div>
                                        <img src={minus} alt="minus" width={20} height={20} onClick={() => handleDeleteItem(button.id)} style={{ cursor: "pointer" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end" }}>
                    <button onClick={BackToHome} style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }} >Cancelar</button>
                    <button style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }} onClick={createPayload}>Salvar</button>
                </div>
            </div>
            <div className="image-container rigth fixed" style={{ position: "fixed", color: "#000", alignContent: "end", textAlign: "end", right: "100px", bottom: "0px" }}>
                <img src={whatsappBackground} alt="Logo" width={350} height={600} />
                <div className="overlay-text">
                    <div className="texts">
                        {typeOfHeader === "text" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{template.header}</label>}
                        {typeOfHeader === "image" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={midia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "document" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={midia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "video" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><video width="160" height="120" controls><source src={midia} type="video/mp4" /></video></label>}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {handleChangeText(template.body)}</label>}
                        {<label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize:"12px" }}>{template.footer}</label>}
                        <div className="quickReply-texts">
                            {buttons.length > 0 && (<div className="quick-reply"><label >{buttons[0].text}</label></div>)}
                            {buttons.length > 1 && (<div className="quick-reply"><label >{buttons[1].text}</label></div>)}
                            {buttons.length > 2 && (<div className="quick-reply"><label >{buttons[2].text}</label></div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default CreateTemplate;