import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import alert from "../../../img/help_blue.png"
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { errorMessageBody, successCreateTemplate, errorMessage, errorMessageConfig, errorVariableEmpty } from "../../../Components/Toastify";
import strings from '../strings.json'
import api from "../../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import './index.css'
import attached from '../../../img/attachment.png'
import Alert from "../../../Components/Alert";
import { AccordionStateCreateTeams, IButton, IHeader, ITemplateTeams, IVariables, PayloadTeams, templateValue } from "../../types";
import useModal from "../../../Components/Modal/useModal";
import Modal from "../../../Components/Modal";
import chevron from "../../../img/right-chevron.png"
import { validatedUser } from "../../../utils/validateUser";
export function CreateTemplateAccordion() {

    const history = useNavigate();
    function BackToList() {
        history(`/template-list?bot_id=${botId}&token=${searchParams.get("token")}&url_base_api=${searchParams.get('url_base_api')}`)
    }
    const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(true);
    const [isTeamsEnabled, setIsTeamsEnabled] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";

    const location = useLocation()
    useEffect(() => {
        const fetchData = async () => {
        const logged:any = await validatedUser(searchParams.get('bot_id'), searchParams.get("token"),searchParams.get('url_base_api')) ?? false;
        console.log(`Logged: ${JSON.stringify(logged)}`)
        if(!logged.logged){
            history(`/template-warning-no-whats?bot_id=${botId}`);
        }
        if(logged.channel === 'whats' ){
            history(`/template-create?bot_id=${botId}&token=${searchParams.get("token")}&url_base_api=${searchParams.get('url_base_api')}`)
        }
        if(logged.channel === 'teams' ){
            setIsWhatsAppEnabled(false)
        }

    }
    fetchData();
    }, []);
    const [templateName, setTemplateName] = useState<string>("")
    const [templateLanguage, setTemplateLanguage] = useState<string>("")
    const [showTemplate, setShowTempalte] = useState<boolean>(true)
    const [accordionState, setAccordionState] = useState<AccordionStateCreateTeams>({
        channelTrigger: true,
        config: false,
        header: false,
        body: false,
        botao: false
    });
    const [template, setTemplate] = useState<ITemplateTeams>(templateValue)
    const [variables, setVariables] = useState<IVariables[]>([])
    const [text, setText] = useState<string>("")
    const [buttons, setButtons] = useState<IButton[]>([])
    const [phone, setPhone] = useState<string>("")
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');
    const [hasHeader, setHasHeader] = useState<boolean>(false)
    const [hasButtons, setHasButtons] = useState<boolean>(false)
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
    const [imageSize, setImageSize] = useState<string>('medium')
    
    useEffect(() => {
        if(location?.state?.duplicated) {
            location.state.duplicated = false
            setTemplate(prevState => ({
                ...prevState,
                "body": location?.state?.bodyText,
                "header" : location?.state?.headerText,
            }));
            const totalVariable = location.state.variableQuantity;
            setTemplateLanguage(location?.state?.language)
            for(let i=0;i<totalVariable;i++) {
                if (variables.length < 8) {
                    const newVariables: IVariables = {
                        id: Date.now()+i,
                        value: `${variables.length + 1}`,
                        text: ""
                    };
                    setVariables(prevVariables => [...prevVariables, newVariables]);
                }
            } 
            const buttonsContent = location.state.buttonsContent;
            let countButtons = 0;
            let buttonsData:any = []
            location.state.buttonsContent.foreach((element:any) => {
                if (element.type === "quickReply") {
                    if (buttonsContent.length < 3) {
                        const newButtons: IButton = {
                            id: Date.now()+countButtons,
                            value: `Button ${countButtons + 1}`,
                            text: element.text
                        };
                        buttonsData = [...buttonsData, newButtons]                        
                    }
                }
                                countButtons++;
            })
            
            setButtons(buttonsData)
        }
    }, []);

    const toggleAccordion = (key: keyof AccordionStateCreateTeams) => {
        setAccordionState({
            channelTrigger: false, 
            config: false,
            header: false,
            body: false,
            botao: false
        })
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
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
    }
    const quickReplyRadio = () => {
        setHasButtons(!hasButtons)
    }

    const handleAddButtonText = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, buttonId: string) => {
        const { value } = e.target;
        setButtons(prevButtons => {
            return prevButtons.map(button => {
                if (button.id.toString() === buttonId) {
                    return { ...button, text: value.replace(/\p{Extended_Pictographic}/gu, '') };
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
        setHasHeader(!hasHeader)
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

    const validatedPayload = () => {
        // Validação dos campos obrigatórios
        const requiredFields: { [key: string]: string } = {
            templateName: "Nome do template",
            templateLanguage: "Idioma"
        };
        
        let hasError = false;
        let firstErrorField = '';
        const missingFields: string[] = [];
        
        // Verificar cada campo obrigatório
        for (const [field, label] of Object.entries(requiredFields)) {
            let value = '';
            if (field === 'templateName') value = templateName;
            if (field === 'templateLanguage') value = templateLanguage;

            if (!value) {
                hasError = true;
                missingFields.push(label);
                
                // Guardar o primeiro campo com erro para definir o accordion
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            }
        }

        // Verificar o corpo da mensagem
        if (template.body === "") {
            hasError = true;
            missingFields.push("Corpo da mensagem");
            if (!firstErrorField) {
                firstErrorField = 'body';
            }
        }

        // Verificar o cabeçalho se estiver habilitado
        if (hasHeader && !template.header) {
            hasError = true;
            missingFields.push("Cabeçalho");
            if (!firstErrorField) {
                firstErrorField = 'header';
            }
        }

        // Verificar botões se estiverem habilitados
        if (hasButtons && buttons.length === 0) {
            hasError = true;
            missingFields.push("Botões");
            if (!firstErrorField) {
                firstErrorField = 'buttons';
            }
        }

        // Verificar variáveis
        if (variables.length > 0) {
            for (const variable of variables) {
                if (variable.text.length === 0) {
                    hasError = true;
                    missingFields.push("Variáveis");
                    break;
                }
            }
        }

        // Se houver erro, não continua com o envio do formulário
        if (hasError) {
            // Abrir o accordion correspondente ao primeiro campo com erro
            if (firstErrorField === 'templateName' || firstErrorField === 'templateLanguage') {
                setAccordionState({
                    channelTrigger: false,
                    config: true,
                    header: false,
                    body: false,
                    botao: false
                });
            } else if (firstErrorField === 'header') {
                setAccordionState({
                    channelTrigger: false,
                    config: false,
                    header: true,
                    body: false,
                    botao: false
                });
            } else if (firstErrorField === 'body') {
                setAccordionState({
                    channelTrigger: false,
                    config: false,
                    header: false,
                    body: true,
                    botao: false
                });
            } else if (firstErrorField === 'buttons') {
                setAccordionState({
                    channelTrigger: false,
                    config: false,
                    header: false,
                    body: false,
                    botao: true
                });
            }
            
            // Mostrar toasts com um pequeno atraso entre eles
            if (missingFields.length > 3) {
                // Se houver mais de 3 campos faltando, mostrar uma mensagem genérica
                toast.error(`Preencha todos os campos obrigatórios (${missingFields.length} campos faltando)`, {
                    theme: "colored"
                });
            } else {
                // Mostrar mensagens específicas para cada campo faltando (até 3)
                missingFields.forEach((field, index) => {
                    setTimeout(() => {
                        toast.error(`O campo ${field} é obrigatório`, {
                            theme: "colored"
                        });
                    }, index * 300); // 300ms de atraso entre cada toast
                });
            }
            
            return false;
        }

        return true;
    };

    const createPayload = () => {
        // Validar os campos obrigatórios antes de criar o payload
        if (!validatedPayload()) {
            return;
        }
        
        const payload:PayloadTeams  = {
            templateName: templateName,
            message: template.body,
            hasButton: buttons.length,
            hasHeader: +hasHeader,
            hasVariable: variables.length,
            language: templateLanguage,
            status: 'APPROVED',
            buttons: [],
            imageSize: hasHeader ? imageSize : undefined
        }
        if(buttons.length > 0){
            buttons.forEach(element => {
                payload.buttons.push({title: element.text})
            })
        }
        api.post(`/teams/template/botid/${botId}`, payload)
            .then(() => {
                successCreateTemplate()
                setTimeout(() => BackToList(), 3000)
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
            setButtonB("Salvar")
            setTextToModal("Você deseja salvar?")
            setText("Esta ação não poderá ser alterada.")
        } else if (wichButton === "Cancelar") {
            setButtonA("Cancelar")
            setButtonB("Voltar")
            setTextToModal("Deseja cancelar o template?")
            setText("Esta ação não poderá ser alterada.")
        }
        toggle();
    }
    const removeAccentsAndCommas = (str: string) => {
        // Primeiro remove acentuações
        let result = str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
          
        // Depois mantém apenas letras, números e underline
        result = result.replace(/[^a-zA-Z0-9_]/g, '');
        
        return result.toLowerCase();
    }
    const handleButtonClick = (buttonId: string) => {
        if (buttonId === "Salvar") {
            createPayload()
        } else if (buttonId === "Voltar") {
            toggle()
        } else if (buttonId === "Cancelar") {
            toggle();
            BackToList();
        } else if(buttonId === "Fechar") {
            toggle();
        }
    };
    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const imagemSelecionada = event.target.files?.[0];
        if (imagemSelecionada) {
            setFileName(imagemSelecionada.name)
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setMidia(dataUrl);
                
                // Adicione esta linha para definir template.header com o fileName quando uma imagem é carregada
                setTemplate(prevState => ({
                    ...prevState,
                    "header": imagemSelecionada.name
                }));
            };
            reader.readAsDataURL(imagemSelecionada);
        }
    };
    return (
        <div className="column-align width-95-perc" style={{ alignItems:"center", padding:"10px 0px" }}>
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width:"100%" }} className="title_2024">Criar Template</h1>
                <div className="column-align" style={{alignItems:"center", width:"100%"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
                </div>
                <br/>
            <div style={{width:"100vw"}}>
                <Modal buttonA={buttonA} text={text} warning={false} buttonB={buttonB} isOpen={isOpen} modalRef={modalRef} toggle={toggle} question={textToModal} onButtonClick={handleButtonClick}></Modal>
                <ToastContainer />            
                <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.channelTrigger ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('channelTrigger')}>1. Canal de Disparo
                        <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.channelTrigger ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.channelTrigger && 
                <div className="body-no-background" style={{width:"100%"}}>
                <div className="accordeon-new" style={{width:"802px"}}>
                    <div className="body" style={{ backgroundColor: "#FFF"}}>
                        <div className="line" style={{marginTop:"17px"}}>
                            <input type="radio" disabled={!isWhatsAppEnabled} name="disparo" value="" onChange={() => history(`/template-create?bot_id=${botId}&token=${searchParams.get("token")}&url_base_api=${searchParams.get('url_base_api')}`)} className="input-spaces" checked={false} /><span>WhatsApp</span>
                            <input type="radio" disabled={!isTeamsEnabled} name="disparo" value=""  className="input-spaces" checked={true} /><span>Teams</span>
                        </div>
                    </div>
                    <div style={{width:"100%", textAlign:"right"}}>
                        <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('config')}>Próximo</button>
                    </div>
                </div>
                </div>}
                    <div className={`accordion_head ${accordionState.config ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('config')}>1. Configuração
                        <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.config ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.config &&
                    <div className="column accordeon-new" style={{width:"800px"}} >
                        <div className="row-align" style={{ textAlign: "left", backgroundColor: "#FFF", width: "100%" }}>
                            <div className="input" style={{ justifyContent: "center"}}>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ justifyContent:"flex-start" }}>Nome</span>
                                    <input type="text"
                                        className="input-values"
                                        maxLength={512}
                                        name="templateName"
                                        value={templateName}
                                        style={{width:"350px" }}
                                        onChange={e => setTemplateName(removeAccentsAndCommas(e.target.value))}
                                    />
                                    <a data-tooltip-id="my-tooltip-multiline" data-tooltip-html="Utilizar apenas letras, números e underline.<br /> Não utilizar espaços, acentuações e virgulas.<br />Exemplo correto: template_1">
                                        <img src={alert} width={20} height={20} alt="alerta" />
                                    </a>
                                    <Tooltip id="my-tooltip-multiline" />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ justifyContent:"flex-start" }}>Idioma</span>
                                    <select className="input-values" style={{width:"350px"}} value={templateLanguage} onChange={e => setTemplateLanguage(e.target.value)}>
                                        <option value="">---</option>
                                        <option value={"es_ES"}>Espanhol</option>
                                        <option value={"en_EN"}>Inglês</option>
                                        <option value={"pt_BR"}>Português - Brasil</option>
                                        <option value={"pt_PT"}>Português - Portugal</option>
                                    </select>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Bot ID</span>
                                    <input type="text"
                                        className="input-values"
                                        value={botId ?? ""}
                                        disabled
                                        style={{width:"350px"}}
                                    />
                                </div>
                            </div>
                            </div>
                            <div style={{width:"100%", textAlign:"right", marginTop:"20px"}}> 
                                <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('header')}>Próximo</button>
                            </div>
                        </div>}
                </div>
                <div className="config-recebidores" style={{ maxHeight: "95%", display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.header ? "accordion_head_opened" : ""}`} onClick={() => toggleAccordion('header')}>2. Cabeçalho
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.header ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.header && 
                    <div className="body accordeon-new" style={{ backgroundColor: "#FFF"}}>
                        <div className="radio row-align ">
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="image" name="header" checked={hasHeader} /><span className="padding-5">Imagem</span></div>
                            <div className="row-align" onChange={headerRadio}><input type="radio" value="sheader" name="header" checked={!hasHeader} /><span className="padding-5">Sem cabeçalho</span></div>
                        </div>                        
                        {hasHeader &&
                            <div className="container-configure">
                                <div className="row-align" style={{ width:"100%", alignItems:"center", alignContent:"center"}}>
                                    <input
                                        type="file"
                                        accept="image"
                                        name="header"
                                        id="myFile" 
                                        onChange={handleImageUpload} 
                                        ref={fileInputRef}                                  
                                        style={{ display: 'none' }}
                                    />
                                    <input type="text" value={fileName} style={{width:"100%", borderRadius:"7px", border:"1px solid #d8d8d8"}} disabled/>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="button-blue" style={{marginLeft:"10px"}}>Anexar</button>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ justifyContent:"flex-start" }}>Tamanho da imagem</span>
                                    <select className="input-values" style={{width:"350px"}} value={imageSize} onChange={e => setImageSize(e.target.value)}>
                                        <option value="small">Pequena</option>
                                        <option value="medium">Média</option>
                                        <option value="large">Grande</option>
                                    </select>
                                </div>
                                <Alert message={"Você vai inserir a url da imagem no momento em que for disparar a mensagem."} />
                            </div>

                        }
                        <div style={{width:"100%", textAlign:"right"}}>
                            <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('body')}>Próximo</button>
                        </div>
                    </div>}
                </div>
                <div className="modo-disparo column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.body ? "accordion_head_opened" : ""}`} onClick={() => toggleAccordion('body')}>3. Corpo da Mensagem
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.body ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.body && <div className="body accordeon-new" style={{ backgroundColor: "#FFF"}}>
                        <div className="column-align" style={{ width: "100%", textAlign: "initial", paddingLeft: "20px", backgroundColor: "#FFF" }}>
                            <span className="title-blue bolder" style={{marginTop:"10px"}}>Corpo da Mensagem</span>
                            <span style={{ fontSize: "11px", marginBottom: "20px", fontStyle: "italic" }}>Este é o principal conteúdo de texto no seu template.</span>
                             <textarea
                                maxLength={1024}
                                name="body"
                                value={template.body}
                                onChange={handleInputChange}
                                style={{ width: "90%", borderRadius: "8px", padding:"9px" }}
                            />

                            <div style={{ width: "87%", textAlign: "end" }}>
                                <span>{template.body.length}/1024</span>
                            </div>
                            <span style={{ fontWeight: "bolder" }}>Variáveis</span>
                            <div>
                                <button onClick={handleAddVariable} className="button-next">Adicionar</button>
                            </div> 
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)', // Duas colunas de largura igual
                                gridTemplateRows: 'repeat(4, auto)', // Quatro linhas com altura automática
                                gap: '10px', // Espaçamento entre as células
                                marginTop:"10px"
                            }}>
                                {variables.map((variable, index) => (
                                    <div style={{ display: "flex", flexDirection: "row", alignItems:"center" }}>
                                        <span className="span-title-variables">{index + 1}.  </span> <input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} className="input-values" style={{height:"26px"}} /><div className="minus-delete" onClick={() => handleDeleteVariables(variable.id)}>-</div>
                                    </div>

                                ))
                                }
                            </div>
                        </div>
                        <div style={{width:"100%", textAlign:"right", marginTop:"10px"}}>
                            <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('botao')}>Próximo</button>
                        </div>                        
                    </div>}
                </div>
                <div className="revisar" style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.botao ? "accordion_head_opened" : ""}`} onClick={() => toggleAccordion('botao')}>4. Botões
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.botao ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.botao && <div className="body accordeon-new" style={{backgroundColor: "#FFF"}}>
                        <div style={{ width: "100%", marginBottom: "20px", paddingLeft: "20px", backgroundColor: "#FFF" }}>
                            <div style={{ display:"flex", flexDirection:"column",alignItems:"center", paddingLeft:"-20px", backgroundColor: "#FFF"}}>
                                <div className="radio" style={{ display:"flex", flexDirection:"row"}}>
                                    <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="quickReply" name="quickReply" checked={hasButtons}/><span className="padding-5">Resposta rápida</span></div>
                                    <div className="row-align" onChange={quickReplyRadio}><input type="radio" value="without" name="quickReply" checked={!hasButtons} /><span className="padding-5">Nenhum</span></div>
                                </div>
                            </div>
                            {hasButtons &&
                                <div>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <button className="button-next" onClick={handleAddButton}>Adicionar</button>
                                    </div>
                                    {buttons.map((button, index) => (
                                        <div className="container-configure" key={button.id}>
                                            <div className="row-align" style={{ marginTop:"10px"}}>
                                                <div>
                                                    <div style={{ display: "flex", flexDirection: "row", alignItems:"center" }}>
                                                        <span className="span-title" style={{ width:"70px", justifyContent:"flex-start" }}>Texto
                                                        <a data-tooltip-id="no-emoji" data-tooltip-html="Não utilizar emojis.">
                                                            <img src={alert} width={15} height={15} alt="alerta" style={{marginBottom:"15px"}} />
                                                        </a></span>
                                                        <Tooltip id="no-emoji" />
                                                        <input
                                                            value={button.text}
                                                            onChange={e => handleAddButtonText(e, button.id.toString())}
                                                            maxLength={20}
                                                            name={button.id.toString()}
                                                            className="input-values" style={{ height:"26px"}}/>
                                                            <div className="minus-delete" onClick={() => handleDeleteItem(button.id)}>-</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                           </div>
                    <div style={{ width:"100%", flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end", padding:"15px" }}>
                        <button className="button-cancel" onClick={() => handleButtonName("Cancelar")}>Cancelar</button>
                        <button className="button-save" onClick={() => createPayload()}>Salvar</button>
                    </div>
                    </div>}
                </div>
            </div >
            {showTemplate && 
            <div className="image-container rigth fixed"  style={{ position: "fixed", color: "#000", alignContent: "end", textAlign: "end", right: "20px", bottom: "0px" }}>
                <button  style={{width:"150px", height:"40px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={()=> setShowTempalte(!showTemplate)}>Exibir template</button>
            </div>}
            {!showTemplate &&
            <div onClick={()=> setShowTempalte(!showTemplate)} className="image-container rigth fixed" style={{ position: "fixed", color: "#000", alignContent: "end", textAlign: "end", right: "120px", bottom: "0px", width:"400px", height:"400px", backgroundColor:"#d5d5d5" }}>
                <div className="overlay-text column-align" style={{left:"50%", backgroundColor:"#fafafa", width:"90%", height:"90%"}}>
                    <div className="texts">
                        {hasHeader && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', display:"flex", flexDirection:"column" }}>
                            <img src={midia} style={{ maxWidth: '100%', maxHeight: imageSize === 'small' ? '100px' : imageSize === 'large' ? '280px' : '180px' }} alt="" />
                        </label>}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {handleChangeText(template.body).length > 256 ? handleChangeText(template.body).slice(0,256)+"...veja mais" : handleChangeText(template.body)}</label>}
                        {hasButtons && <div className="quickReply-texts">
                            {buttons.length > 0 && (<div className="quick-reply-teams"><label >{buttons[0].text}</label></div>)}
                            {buttons.length > 1 && (<div className="quick-reply-teams"><label >{buttons[1].text}</label></div>)}
                            {buttons.length > 2 && (<div className="quick-reply-teams"><label >{buttons[2].text}</label></div>)}
                        </div>}
                    </div>
                </div>
            </div>}
        </div>
    );
}

export default CreateTemplateAccordion;
