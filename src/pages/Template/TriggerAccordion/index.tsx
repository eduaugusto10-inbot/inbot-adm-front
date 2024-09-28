import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { read, utils } from "xlsx";
import { errorCampaingEmpty, errorDuplicatedPhone, errorEmptyVariable, errorPhoneEmpty, errorTriggerMode, successCreateTrigger, waitingMessage, errorNoRecipient, errorMidiaEmpty, errorMessagePayload } from "../../../Components/Toastify";
import api from "../../../utils/api";
import attached from '../../../img/attachment.png'
import { ToastContainer } from "react-toastify";
import './index.css'
import Alert from "../../../Components/Alert";
import { AccordionState, IListVariables, ITemplateList, IVariables } from "../../types";
import { mask } from "../../../utils/utils";
import Modal from "../../../Components/Modal";
import useModal from "../../../Components/Modal/useModal";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import chevron from '../../../img/right-chevron.png'
import info from "../../../img/circle-info-solid.svg"
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

export function Accordion() {

    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";
    

    const history = useNavigate();
    useEffect(() => {
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }
        api.get(`/whats-botid/${botId}`)
            .then(resp => {
                setPhone(resp.data.number)
            }).catch(error => history(`/template-warning-no-whats?bot_id=${botId}`))
    }, []);
    function BackToList() {
        history(`/trigger-list?bot_id=${botId}`);
    }

    const [accordionState, setAccordionState] = useState<AccordionState>({
        config: true,
        recebidores: false,
        disparo: false,
        revisar: false
    });
    const [fileData, setFileData] = useState<any[][]>([]);
    const [clientNumber, setClientNumber] = useState<number | ''>('');
    const [typeClient, setTypeClients] = useState<boolean>();
    const [mode, setMode] = useState<boolean>(false);
    const [showType, setShowType] = useState<boolean>(false)
    const [triggerMode, setTriggerMode] = useState<string>("imediato")
    const [campaignName, setCampaignName] = useState<string>("")
    const [dates, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [hours, setHours] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const [variables, setVariables] = useState<IVariables[]>([])
    const [listVariables, setListVariables] = useState<IListVariables[]>([])
    const [triggerNames, setTriggerNames] = useState<any>([])
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [payload1, setPayload1] = useState<string>()
    const [typeClientValue, setTypeClientValue] = useState<boolean>(false)
    const [payload2, setPayload2] = useState<string>()
    const [payload3, setPayload3] = useState<string>()
    const [templateNameSelect, setTemplateNameSelect] = useState<string>("Edta")
    const [urlMidia, setURLMidia] = useState<string>("");
    const [templates, setTemplates] = useState<ITemplateList[]>([])
    const [qtButtons, setQtButtons] = useState<number>(0)
    const [titleButton1, setTitleButton1] = useState<string>("")
    const [bodyText, setBodyText] = useState<string>("")
    const [typeOfHeader, setTypeOfHeader] = useState<string>("")
    const [footerText, setFooterText] = useState<string>("")
    const [headerText, setHeaderText] = useState<string>("")
    const [titleButton2, setTitleButton2] = useState<string>("")
    const [titleButton3, setTitleButton3] = useState<string>("")
    const [headerTable, setHeaderTable] = useState<any>()
    const [headerConfig, setHeaderConfig] = useState<string | null>()
    const [variableQty, setVariableQty] = useState<number>(0)
    const [blockAddNumber, setBlockAddNumber] = useState<boolean>(false)
    const [phone, setPhone] = useState("")
    const [templateName, setTemplateName] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');
    const [createTriggerMenu, setCreateTriggerMenu] = useState(false)
    useEffect(() => {
        api.get(`/whatsapp/trigger-bot/${botId}`)
            .then(resp => setTriggerNames(resp.data))
            .catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }

        api.get(`/whats-botid/${botId}`)
            .then(resp => {
                const token = resp.data.accessToken;
                setPhone(resp.data.number)              
                api.get('https://whatsapp.smarters.io/api/v1/messageTemplates', { headers: { 'Authorization': token } })
                    .then(resp => {
                        setTemplates(resp.data.data.messageTemplates)
                        setCreateTriggerMenu(true)
                    })
            })
            
    }, []);

    useEffect(() => {
        loadNewTemplate(location?.state?.templateID)
    }, [createTriggerMenu])
    
    const toggleAccordion = (key: keyof AccordionState) => {
        setAccordionState({
            config: false,
            recebidores: false,
            disparo: false,
            revisar: false
        })
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const addCustomerToSendTemplate = () => {
        let emptyVariable = false;
        let duplicatedPhone = false;
        if(clientNumber===""){
            errorPhoneEmpty()
            return;
        }
        const itemsToCheck = ["document", "image", "video"];
        const hasItem = itemsToCheck.some(item => headerConfig?.includes(item));
        console.log(hasItem)
        if(urlMidia==="" && hasItem) {
            errorMidiaEmpty()
            return;
        }
        variables.forEach(variable => {
            if (variable?.text === "") {
                emptyVariable = true;
            }
        });
        listVariables.forEach(variable =>{
            if(variable.phone===clientNumber){
                duplicatedPhone = true;
            }
        })
        if(emptyVariable){
            errorEmptyVariable();
            return;
        }
        if(duplicatedPhone){
            errorDuplicatedPhone();
            return;
        }
        setListVariables(prevState => [
            ...prevState,
            {
                phone: clientNumber,
                variable_1: variables[0]?.text,
                variable_2: variables[1]?.text,
                variable_3: variables[2]?.text,
                variable_4: variables[3]?.text,
                variable_5: variables[4]?.text,
                variable_6: variables[5]?.text,
                variable_7: variables[6]?.text,
                variable_8: variables[7]?.text,
                variable_9: variables[8]?.text,
                media_url: urlMidia,
                payload_1: payload1,
                payload_2: payload2,
                payload_3: payload3,
                title_button_1: titleButton1,
                title_button_2: titleButton2,
                title_button_3: titleButton3,
            }
        ]);
        setClientNumber("");
        setVariables([]);
    };

    const formatDateComplete = (date: string) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const year = d.getFullYear();
      
        return `${day}/${month}/${year}`;
      };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file) {
            setFileName(file.name);
          }

        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target?.result as string;
            const wb = read(bstr, { type: 'binary' });

            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            const data = utils.sheet_to_json(ws, { header: 1,raw: false, rawNumbers: false }) as any[][];
            const dataFile: any = [];
            const dataHeader: any = [];
            data.slice(0).forEach((values: any, index: number) => {
                if(values.length > 0 && index < 1) {
                    dataHeader.push(values)
                }
            })
            data.slice(1).forEach((values, linha) => { 
                const wrongFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{2}$/;
                if (values.length > 0) {
                    values.forEach((cell, coluna) => { 
                        if(cell.length > 0){
                            if(coluna===0){
                                values[coluna] = cell.replace(/\s+/g, '');
                            } else if(wrongFormatRegex.test(cell)) {
                                values[coluna] = formatDateComplete(cell)
                            }
                             else {
                                values[coluna] = cell.toString().trim();
                            }
                        }
                    });
                    dataFile.push(values);
                }
            });
            setHeaderTable(dataHeader)
            setFileData(dataFile);
            console.log(dataFile)
        };

        reader.readAsBinaryString(file);
    };

    const handleSubmitListDataFile = async (dataTemplate: any, campaignId: string) => {
        for (const customer of dataTemplate) {
            if (customer.length > 0) { // count > 0 && 
                const params = {
                    campaignId: `${campaignId}`,
                    phone: `${customer[0]}`,
                    status: "aguardando",
                    variable_1: customer[1],
                    variable_2: customer[2],
                    variable_3: customer[3],
                    variable_4: customer[4],
                    variable_5: customer[5],
                    variable_6: customer[6],
                    variable_7: customer[7],
                    variable_8: customer[8],
                    variable_9: customer[9],
                    media_url: customer[10],
                    type_media: headerConfig,
                    payload_1: payload1,
                    payload_2: payload2,
                    payload_3: payload3,
                    title_button_1: titleButton1,
                    title_button_2: titleButton2,
                    title_button_3: titleButton3,
                };
                api.post('/whats-customer', params)
                    .catch(error => console.log(error));
            }
            // count++;
        }
    };
    const handleSubmitManualListData = async (campaignId: string) => {
        for (let i = 0; i < listVariables.length; i++) {
            const params = {
                campaignId: `${campaignId}`,
                phone: `${listVariables[i].phone}`,
                status: "aguardando",
                variable_1: listVariables[i]?.variable_1,
                variable_2: listVariables[i]?.variable_2,
                variable_3: listVariables[i]?.variable_3,
                variable_4: listVariables[i]?.variable_4,
                variable_5: listVariables[i]?.variable_5,
                variable_6: listVariables[i]?.variable_6,
                variable_7: listVariables[i]?.variable_7,
                variable_8: listVariables[i]?.variable_8,
                variable_9: listVariables[i]?.variable_9,
                media_url: listVariables[i].media_url,
                type_media: headerConfig,
                payload_1: payload1,
                payload_2: payload2,
                payload_3: payload3,
                title_button_1: titleButton1,
                title_button_2: titleButton2,
                title_button_3: titleButton3,
            };
            api.post('/whats-customer', params)
                .catch(error => console.log(error));
        }
    };

    const signInClients = (e: any) => {
        setTypeClients(e)
        setShowType(true)
        setListVariables([])
        setFileData([])
    }
    const handleMode = (e: any) => {
        const value = e.target.value === "imediato";
        setTriggerMode(e.target.value)
        setMode(!value)
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
    const handleAddVariable = (id: number) => {
        if (variables.length < 8) {
            const newVariables: IVariables = {
                id: id,
                value: `${variables.length + 1}`,
                text: ""
            };
            setVariables(prevVariables => [...prevVariables, newVariables]);
        }
    };

    const encontrarMaiorNumero = (texto: string): number => {
        const regex = /{{.*?(\d+).*?}}/g;
        const numeros: number[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(texto)) !== null) {
            if (match[1]) {
                numeros.push(parseInt(match[1]));
            }
        }

        if (numeros.length > 0) {
            return Math.max(...numeros);
        } else {
            return 0;
        }
    };
    const hasMedia = (headerElement: any) => {
        let headerType = null;
        headerElement.forEach((element: any) => {
            if (element.type === "header") {
                switch (element.parameters[0].type) {
                    case "video":
                        headerType = "video";
                        break;
                    case "text":
                        headerType = "text";
                        break;
                    case "image":
                        headerType = "image";
                        break;
                    case "document":
                        headerType = "document";
                        break;
                    default:
                        break;
                }
            }
        });
        return headerType;
    }
    const hasManyButtons = (headerElement: any) => {
        let buttons = 0;
        headerElement.forEach((element: any) => {
            console.log(element)
            if (element.type === "button") {
                if (element.parameters[0].type === "quickReply") {
                    buttons = element.parameters.length;
                    if(buttons > 0) setTitleButton1(element.parameters[0].text)
                    if(buttons > 1) setTitleButton2(element.parameters[1].text)
                    if(buttons > 2) setTitleButton3(element.parameters[2].text)
                }
            }
            if(element.type === "body") {
                setBodyText(element.parameters[0].text)
            }
            if(element.type === "header") {
                setHeaderText(element.parameters[0]?.text)
                setTypeOfHeader(element.parameters[0].type)
            }
            if(element.type === "footer") {
                setFooterText(element.parameters[0].text)
            }
        });
        return buttons;
    }

    const openModal = (e:any) => {
        if(templateName==="") {
            loadNewTemplate(e)
        } else {
            handleButtonName("Select")
        }
        setTemplateNameSelect(e)

    }
    
    const openModalChangeCustomersType = (e:any) => {
        const value = e.target.value === "unico"
        setTypeClientValue(!value)
        if(showType === false || (listVariables.length === 0 && fileData.length === 0)) {
            signInClients(!value)
        } else {            
            handleButtonName("ChangeCustomersContacts")
        }
    }
    
    const loadNewTemplate = (e:any) =>{
        setVariables([])
        setMode(false)
        setPayload1(undefined)
        setPayload2(undefined)
        setPayload3(undefined)
        setURLMidia("")
        setTriggerMode("imediato")
        setFileData([])
        setListVariables([])
        setFileName("")
        console.log(templates)
        templates.forEach((template: ITemplateList) => {
            console.log(e)
            if(template.ID===e){
                setTemplateName(template.name);   
                template.components.forEach((element: any) => {
                    if (element.type === "body"){
                        setVariableQty(encontrarMaiorNumero(element.parameters[0].text))
                    }                    
                });
                console.log(templateName)
                setQtButtons(hasManyButtons(template.components))
                setHeaderConfig(hasMedia(template.components))
                return;
            }
        })
    }

    const handleCampaignName = (e: string) => {
        if (triggerNames !== undefined) {
            setErrorMessage("");
            for (let i = 0; i < triggerNames?.data.length; i++) {
                if (triggerNames.data[i].campaign_name === e) {
                    setErrorMessage("O nome da campanha já existe!");
                }
            }
        }
        setCampaignName(e);
    }

    useEffect(() => {
        if (fileInputRef.current) {
           setFileName(fileInputRef.current.value);
       }
     }, [fileName]);
     
    const createTrigger = () => {
        if((listVariables.length === 0 && !typeClient) || (fileData.length === 0 && typeClient)){
            errorNoRecipient()
            return;
        }
        if (campaignName.length === 0) {
            errorCampaingEmpty()
            return;
        }
        if (triggerMode.length === 0) {
            errorTriggerMode()
            return;
        }
        waitingMessage();
        const data = {
            "campaignName": campaignName,
            "templateName": templateName,
            "typeTrigger": triggerMode,
            "timeTrigger": triggerMode === "agendado" ? `${dates} ${hours}` : null,
            "status": "aguardando",
            // "status": "criando",
            "botId": botId,
            "phoneTrigger": phone
        }

        api.post('/whatsapp/trigger', data)
            .then(resp => {
                if (typeClient) {
                    handleSubmitListDataFile(fileData, resp.data.data.insertId)
                } else {
                    handleSubmitManualListData(resp.data.data.insertId)
                }
                successCreateTrigger()
                // api.put(`/whatsapp/trigger-status/${resp.data.data.insertId}?status=aguardando`)
                setTimeout(() => BackToList(), 3000)
            })
            .catch(err => {
                console.log(err)
            })
    }
    if (variableQty > 0 && (variables.length < variableQty)) {
        for (let i = 0; i < variableQty; i++) {
            handleAddVariable(i)
        }
    }
    const modalRef = useRef<HTMLDivElement>(null);
    const { isOpen, toggle } = useModal();
    const [buttonA, setButtonA] = useState<string>("")
    const [buttonB, setButtonB] = useState<string>("")
    const [textToModal, setTextToModal] = useState<string>("")

    const handleButtonName = (wichButton: string) => {
        if (wichButton === "Salvar") {
            setButtonA("Fechar")
            setButtonB("Salvar")
            setTextToModal("Você deseja salvar?")
        } else if (wichButton === "Cancelar") {
            setButtonA("Sim")
            setButtonB("Não")
            setTextToModal("Deseja cancelar a Campanha?")
        } else if (wichButton ==="warningFile") {
            setTextToModal("Verifique o padrão do telefone")
            setButtonB("OK")
            setButtonA("NaoExibir")
        } else if (wichButton === "ChangeCustomersContacts") {
            setButtonA("Não")
            setButtonB("Alterar")
            setTextToModal("Deseja alterar a opção?")
        } else if (wichButton === "Select") {
            setButtonA("Não")
            setButtonB("Alterar")
            setTextToModal("Deseja alterar o template?")
        }
        toggle();
    }
    const validatedPayload = () => {
        if(qtButtons > 0 && (payload1 === undefined || payload1.length === 0)){
            errorMessagePayload()
            return;
        }
        if(qtButtons > 1 && (payload2 === undefined || payload2.length === 0)){
            errorMessagePayload()
            return;
        }
        if(qtButtons > 2 && (payload3 === undefined || payload3.length === 0)){
            errorMessagePayload()
            return;
        }
        if((listVariables.length === 0 && !typeClient) || (fileData.length === 0 && typeClient)){
            errorNoRecipient()
            return;
        }
        if (campaignName.length === 0) {
            errorCampaingEmpty()
            return;
        }
        if (triggerMode.length === 0) {
            errorTriggerMode()
            return;
        }
        handleButtonName("Salvar")
    }
    const handleButtonClick = (buttonId: string) => {
        if (buttonId === "Salvar") {
            createTrigger()
        } else if (buttonId === "Fechar") {
            toggle()
        } else if (buttonId === "Voltar") {
            toggle();
            BackToList();
        } else if (buttonId === "Sim") {
            toggle();
            BackToList();
        } else if (buttonId === "Não") {
            toggle();
        } else if (buttonId === "OK") {
            toggle();
            fileInputRef.current?.click()
        } else if (textToModal === "Deseja alterar a opção?" && buttonId === "Alterar") {
            signInClients(typeClientValue)
            toggle();
        } else if (buttonId === "Alterar") {
            loadNewTemplate(templateNameSelect)
            toggle();
        }
    };

    const sheetsVariables = () => {
        let total = 0;
        if(fileData[0]===undefined){
            return total -1;
        }
        fileData[0].forEach((value) => {
            if (value !== "") total++;
        });
        return total -1;
    };
    
    function formatDate(dateString: string): string {
        const [year, month, day] = dateString.split('-').map(Number);
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
      }

      function checkNumber(phone: number) {
        setClientNumber(phone)
        setBlockAddNumber(phone.toString().length >= 12)          
      }

      function openModalWarningFile(){
        
      }
    return (
        <div className="container-trigger width-95-perc" style={{ padding:"10px 0px"}}>
            <Modal buttonA={buttonA} buttonB={buttonB} isOpen={isOpen} modalRef={modalRef} toggle={toggle} question={textToModal} onButtonClick={handleButtonClick}></Modal>
            <ToastContainer />
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width:"100%" }} className="title_2024">Criar Campanha</h1>
            <div className="hr_color" style={{width:"100%", marginTop:"15px"}}></div>
            <br/>
            <div>
                <div className={`accordion_head ${accordionState.config ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('config')}>1. Configuração
                <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.config ?"-90deg" : "90deg"}} /></div>
                </div>
                {accordionState.config &&
                <div className="body-no-background" style={{width:"100%"}}>
                <div className="accordeon-new" style={{width:"90%", textAlign:"right"}}>
                    <div className="body line" style={{ display: "flex", justifyContent: "space-around", flexDirection: "row", alignContent: "center", backgroundColor: "#FFF" }}>
                        <div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span className="span-title" style={{width:"100%", justifyContent:"left", marginLeft:"12px"}}>Nome da campanha</span>
                                <input className="input-values" type="text" value={campaignName} onChange={e => handleCampaignName(e.target.value)} />
                            </div>
                            {errorMessage && <p style={{ color: 'red', fontSize: "10px", fontWeight: "bolder" }}>{errorMessage}</p>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="span-title" style={{width:"100%", justifyContent:"left", marginLeft:"12px"}}>Selecionar template </span>
                            <select value={templateName} className="input-values" onChange={ e => openModal(e.target.value)}>
                                <option value="">{templateName ?? "--"}</option>
                                {templates.map((template, key) => (
                                    <option key={key} value={template.ID}>{template.name}</option>
                                ))}
                            </select>
                        </div>
                        </div>
                        <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('recebidores')}>Próximo</button>
                    </div>
                </div>}
            </div>
            <div className="config-recebidores" style={{ maxHeight: "1080px", maxWidth:'900px' }}>
                <div className={`accordion_head ${accordionState.recebidores ? "accordion_head_opened" : ""}`} onClick={() => toggleAccordion('recebidores')}>2. Cadastro dos Contatos da Campanha 
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.recebidores ?"-90deg" : "90deg"}} /></div></div>
                {accordionState.recebidores && 
                <div className="body-no-background" style={{width:"100%"}}>
                <div  className="accordeon-new" style={{width:"90%", padding:"0px 15px"}}>
                    <div style={{ width: "100%", display:"flex", flexDirection:"column", textAlign: "left" }}>
                            <span style={{ fontSize: "14px", paddingTop:"14px" }}>Adicione os contatos que receberão as mensagens. Você pode importar uma lista ou adicionar manualmente.</span>
                        <div style={{marginTop:"17px", marginBottom:"12px", flexDirection:"column"}}>
                            <div style={{marginBottom:"-7px"}}>
                                <input 
                                    type="radio" 
                                    name="clientes" 
                                    value="unico" 
                                    onChange={openModalChangeCustomersType} 
                                    className="input-spaces" 
                                    checked={typeClient === false} 
                                />
                                <span className="blue-text"><strong>Cadastrar Contato Individualmente:</strong></span>
                            </div>
                            <span style={{ fontSize: "11px", fontStyle: "italic", marginLeft:"25px" }}> "Selecione esta opção se deseja adicionar contatos um a um manualmente para esta campanha."</span>
                            {!typeClient && showType &&
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop:"20px" }}>
                            <div className="row-align">
                            <div className="column-align">
                            <div style={{ display: "flex", flexDirection: "row",alignItems: "center" }}>
                                <span className="span-title" style={{paddingBottom: blockAddNumber ? "0px" : '19px' }}>Telefone </span>
                                <div className="column-align">
                                <PhoneInput
                                    defaultCountry="br"
                                    value={clientNumber.toString()}
                                    onChange={(event) => {
                                        checkNumber(parseInt(event.replace(/\D/g, "")))                                        
                                    }}
                                    inputStyle={{
                                        width: "212px",
                                        height: "30px",
                                        border: blockAddNumber ? "1px solid #A8A8A8" : "1px solid red",
                                        marginLeft: "5px",
                                        padding: "5px",
                                        borderRadius: "8px",
                                        alignItems: "center",
                                    }}
                                />
                                {!blockAddNumber ?
                                <span style={{paddingLeft:"50px", color:'red', fontSize:'11px'}}>Telefone inválido</span> : ''}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                            {variables.length > 0 &&                                                             
                                <div style={{textAlign:"left"}}>                                        
                                    {variables.map((variable, index) => (
                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", margin: "10px" }}>
                                            <span className="span-title">Variáveis {index + 1}</span><input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} className="input-values" />
                                            <a style={{alignContent:"center"}}  data-tooltip-id="no-emoji" data-tooltip-html="Você deverá preencher a variáveL para que não ocorra erro no envio">
                                                <img src={info} width={15} height={15} alt="alerta"/>
                                            </a>
                                        <Tooltip id="no-emoji" />
                                        </div>

                                    ))
                                    }
                                </div>}
                                {headerConfig !== "text" && headerConfig !== null &&
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", margin: "10px" }}>
                                        <span className="span-title">Link {headerConfig === "document" ? "documento" : headerConfig === "image" ? "imagem" : "video"}</span>
                                        <input className="input-values" value={urlMidia.replace(/\s+/g, '')} onChange={e => setURLMidia(e.target.value.replace(/\s+/g, ''))} />
                                    </div>
                                }
                                {qtButtons > 0 &&
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", margin: "10px" }}>
                                        <span className="span-title" style={{width: "auto", marginLeft:"10px", justifyContent:"flex-start"}}>Título botão: {titleButton1}</span>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", marginLeft: "-4px" }}>
                                        <span className="span-title">Payload 1</span>
                                        <input className="input-values" value={payload1} onChange={e => setPayload1(e.target.value)} />
                                        <a style={{alignContent:"center"}} data-tooltip-id="no-emoji" data-tooltip-html="Payload não podem ser iguais!">
                                            <img src={info} width={15} height={15} alt="alerta" />
                                        </a>
                                            <Tooltip id="no-emoji" />
                                    </div>
                                    </div>
                                }
                                {qtButtons > 1 &&
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", margin: "10px" }}>
                                            <span className="span-title" style={{width: "auto", marginLeft:"10px", justifyContent:"flex-start"}}>Título botão: {titleButton2} </span>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", marginLeft: "-4px" }}>
                                        <span className="span-title">Payload 2</span>
                                        <input className="input-values" value={payload2} onChange={e => setPayload2(e.target.value)} />
                                        <a style={{alignContent:"center"}}  data-tooltip-id="no-emoji" data-tooltip-html="Payload não podem ser iguais!">
                                                <img src={info} width={15} height={15} alt="alerta"/>
                                            </a>
                                            <Tooltip id="no-emoji" />
                                    </div>
                                    </div>
                                }
                                {qtButtons > 2 &&
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", margin: "10px" }}>
                                        <span className="span-title" style={{width: "auto", marginLeft:"10px", justifyContent:"flex-start"}}>Título botão: {titleButton3} </span>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", marginLeft: "-4px" }}>
                                        <span className="span-title">Payload</span>
                                        <input className="input-values" value={payload3} onChange={e => setPayload3(e.target.value)} />
                                        <a style={{alignContent:"center"}}  data-tooltip-id="no-emoji" data-tooltip-html="Payload não podem ser iguais!">
                                                <img src={info} width={15} height={15} alt="alerta"/>
                                            </a>
                                        <Tooltip id="no-emoji"/>
                                    </div>
                                    </div>
                                }
                                <div style={{width:"100%", textAlign:"end", paddingRight:"10px", paddingBottom:"20px"}}>
                                    <button onClick={addCustomerToSendTemplate} style={{ width: "150px",  marginRight: "20px" }} className={blockAddNumber ? "button-blue": "button-disabled"} disabled={!blockAddNumber}>Adicionar contato</button>
                                </div>
                            </div>
                            </div>
                                                            <div style={{width:"100%"}}>
            <div style={{width: "100%", alignItems: "center", display: "flex", flexDirection: "column"}}>
                <div style={{width:"200px", border:"1px solid #C4C4C4", padding:"20px 0px", borderRadius:"7px", marginBottom:"10px"}}>
                    <div className="texts" style={{fontSize:"10px"}}>
                        {typeOfHeader === "text" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{headerText}</label>}
                        {typeOfHeader === "image" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={urlMidia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "document" && <div className="column-align" style={{padding:"10px"}}><label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={attached} style={{ maxWidth: '100%', maxHeight: '200px', border:"1px solid #c3c3c3", borderRadius:"8px"}} alt="" /></label></div>}
                        {typeOfHeader === "video" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><video width="160" height="120" controls><source src={urlMidia} type="video/mp4" /></video></label>}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {bodyText.length > 256 ? bodyText.slice(0,256)+"...veja mais" : bodyText}</label>}
                        {<label className="footer font-size-12" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{footerText}</label>}
                        {qtButtons > 0 && <div className="quickReply-texts">
                            {qtButtons > 0 && (<div className="quick-reply"><label >{titleButton1}</label></div>)}
                            {qtButtons > 1 && (<div className="quick-reply"><label >{titleButton2}</label></div>)}
                            {qtButtons > 2 && (<div className="quick-reply"><label >{titleButton3}</label></div>)}
                        </div>}
                        {/* {typeOfButtons === "cta" && <div className="quickReply-texts">
                            {buttonsCTA.length > 0 && (<div className="quick-reply"><label >{buttonsCTA[0].text}</label></div>)}
                            {buttonsCTA.length > 1 && (<div className="quick-reply"><label >{buttonsCTA[1].text}</label></div>)}
                        </div>} */}
                    </div>
                </div>
            </div>
                                                            </div>
                                                            </div>
                            <div style={{ maxHeight: "500px", overflowY: 'auto', marginBottom: "10px", display: "flex", flexDirection:"column", alignItems: "center", padding:"10px 0px" }}>
                                <table className="table-2024 fixed-header-table" style={{backgroundColor:"#FFF", width:"97%", padding:"10px"}}>
                                    <thead>
                                        <tr  className="cells table-2024 border-bottom-zero">
                                            <th  className="cells" style={{fontSize:"10px"}}><div style={{background:"#FFF",  borderRadius:"6px"}}>Telefone</div></th>
                                            {variables.length>0 && <th  className="cells" style={{fontSize:"10px"}}>Variável 1</th>}
                                            {variables.length>1 && <th  className="cells" style={{fontSize:"10px"}}>Variável 2</th>}
                                            {variables.length>2 && <th  className="cells" style={{fontSize:"10px"}}>Variável 3</th>}
                                            {variables.length>3 && <th  className="cells" style={{fontSize:"10px"}}>Variável 4</th>}
                                            {variables.length>4 && <th  className="cells" style={{fontSize:"10px"}}>Variável 5</th>}
                                            {variables.length>5 && <th  className="cells" style={{fontSize:"10px"}}>Variável 6</th>}
                                            {variables.length>6 && <th  className="cells" style={{fontSize:"10px"}}>Variável 7</th>}
                                            {variables.length>7 && <th  className="cells" style={{fontSize:"10px"}}>Variável 8</th>}
                                            {headerConfig !== "text" && headerConfig !== null &&<th  className="cells" style={{fontSize:"10px"}}>Link midia</th>}
                                        </tr>
                                    </thead>
                                    <tbody style={{ backgroundColor: '#F9F9F9', fontSize: "12px" }}>
                                        {listVariables.length > 0 && listVariables.map((unicVariable, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <th>{unicVariable.phone}</th>
                                                {variables.length>0 && <th>{unicVariable.variable_1}</th>}
                                                {variables.length>1 && <th>{unicVariable.variable_2}</th>}
                                                {variables.length>2 && <th>{unicVariable.variable_3}</th>}
                                                {variables.length>3 && <th>{unicVariable.variable_4}</th>}
                                                {variables.length>4 && <th>{unicVariable.variable_5}</th>}
                                                {variables.length>5 && <th>{unicVariable.variable_6}</th>}
                                                {variables.length>6 && <th>{unicVariable.variable_7}</th>}
                                                {variables.length>7 && <th>{unicVariable.variable_8}</th>}
                                                {headerConfig !== "text" && headerConfig !== null &&<th>{unicVariable.media_url} OI</th>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>}
                        </div>
                        <div style={{marginBottom:"17px",display:"flex", flexDirection:"column"}}>
                            <div>
                                <input 
                                    type="radio" 
                                    name="clientes" 
                                    value="multiplos" 
                                    onChange={openModalChangeCustomersType} 
                                    className="input-spaces" 
                                    checked={typeClient === true}                                    
                                />
                                <span className="blue-text"><strong>Upload de Planilha de Contatos:</strong></span>
                                <a href="/files/Modelo.xlsx" download="Modelo - Planilha Contatos para Campanhas.xlsx">
                                  <button className="button-blue" style={{marginLeft:"12px", width:"120px"}}>Planilha exemplo</button>
                                </a>
                            </div>
                            <span style={{ fontSize: "11px", fontStyle: "italic", marginLeft:"25px" }}> "Escolha esta opção para fazer upload de uma planilha com vários contatos de uma só vez para esta campanha."</span>
                        </div>
                    </div>                
                    {typeClient && showType &&
                        <div>                            
                            <input 
                                type="file" 
                                onChange={handleFileUpload} 
                                style={{ backgroundColor: "#0D5388", color: "#FFF", borderRadius: "20px", display:"none" }} 
                                ref={fileInputRef}
                                
                            /><div className="row-align">
                                <div className="column-align">{qtButtons > 0 &&
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", margin: "10px" }}>
                                        <span className="span-title" style={{width: "auto", marginLeft:"10px", justifyContent:"flex-start"}}>Título botão: {titleButton1} </span>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", marginLeft: "-4px" }}>
                                    <span className="span-title">Payload 1</span>
                                    <input className="input-values" value={payload1} onChange={e => setPayload1(e.target.value)} />
                                    <a style={{alignContent:"center"}} data-tooltip-id="no-emoji" data-tooltip-html="Payload não podem ser iguais!">
                                            <img src={info} width={15} height={15} alt="alerta" />
                                        </a>
                                        <Tooltip id="no-emoji" />
                                </div>
                                </div>
                            }
                            {qtButtons > 1 &&
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", margin: "10px" }}>
                                        <span className="span-title" style={{width: "auto", marginLeft:"10px", justifyContent:"flex-start"}}>Título botão: {titleButton2} </span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", marginLeft: "-4px" }}>
                                    <span className="span-title">Payload 2</span>
                                    <input className="input-values" value={payload2} onChange={e => setPayload2(e.target.value)} />
                                    <a style={{alignContent:"center"}}  data-tooltip-id="no-emoji" data-tooltip-html="Payload não podem ser iguais!">
                                            <img src={info} width={15} height={15} alt="alerta"/>
                                        </a>
                                        <Tooltip id="no-emoji" />
                                </div>
                                </div>
                            }
                            {qtButtons > 2 &&
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", margin: "10px" }}>
                                <span className="span-title" style={{width: "auto", marginLeft:"10px", justifyContent:"flex-start"}}>Título botão: {titleButton3} </span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "left", marginLeft: "-4px" }}>
                                    <span className="span-title">Payload</span>
                                    <input className="input-values" value={payload3} onChange={e => setPayload3(e.target.value)} />
                                    <a style={{alignContent:"center"}}  data-tooltip-id="no-emoji" data-tooltip-html="Payload não podem ser iguais!">
                                            <img src={info} width={15} height={15} alt="alerta"/>
                                        </a>
                                    <Tooltip id="no-emoji" />
                                </div>
                                </div>
                            }
                            </div>
                            <div style={{width:"100%"}}>
            <div style={{width: "100%", alignItems: "center", display: "flex", flexDirection: "column"}}>
                <div style={{width:"200px", border:"1px solid #C4C4C4", padding:"20px 0px", borderRadius:"7px", marginBottom:"10px"}}>
                    <div className="texts" style={{fontSize:"10px"}}>
                        {typeOfHeader === "text" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{headerText}</label>}
                        {typeOfHeader === "image" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={urlMidia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "document" && <div className="column-align" style={{padding:"10px"}}><label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={attached} style={{ maxWidth: '100%', maxHeight: '200px', border:"1px solid #c3c3c3", borderRadius:"8px"}} alt="" /></label></div>}
                        {typeOfHeader === "video" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><video width="160" height="120" controls><source src={urlMidia} type="video/mp4" /></video></label>}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {bodyText.length > 256 ? bodyText.slice(0,256)+"...veja mais" : bodyText}</label>}
                        {<label className="footer font-size-12" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{footerText}</label>}
                        {qtButtons > 0 && <div className="quickReply-texts">
                            {qtButtons > 0 && (<div className="quick-reply"><label >{titleButton1}</label></div>)}
                            {qtButtons > 1 && (<div className="quick-reply"><label >{titleButton2}</label></div>)}
                            {qtButtons > 2 && (<div className="quick-reply"><label >{titleButton3}</label></div>)}
                        </div>}
                        {/* {typeOfButtons === "cta" && <div className="quickReply-texts">
                            {buttonsCTA.length > 0 && (<div className="quick-reply"><label >{buttonsCTA[0].text}</label></div>)}
                            {buttonsCTA.length > 1 && (<div className="quick-reply"><label >{buttonsCTA[1].text}</label></div>)}
                        </div>} */}
                    </div>
                </div>
            </div>
                                                            </div>
                                                            </div>
                            <input type="text" value={fileName} disabled style={{width:"300px", borderRadius:"8px"}}/>
                            <button type="button" style={{width:"120px", marginLeft:"7px"}} onClick={() => handleButtonName("warningFile")} className="button-blue">Escolher arquivo</button>
                            <div style={{ maxHeight: "500px", maxWidth:"900px", overflowY: 'auto', marginBottom: "10px", flexDirection:"column", alignItems: "center", padding:"10px 0px" }}>
                                <table className="table-2024 fixed-header-table" style={{backgroundColor:"#FFF", width:"97%", padding:"10px"}}>
                                    <thead>
                                        <tr className="font-size-12">
                                            {headerTable && headerTable.length > 0 && headerTable[0].map((cell: any, index: number) => (
                                                <th key={index}>{cell}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="font-size-12" style={{ backgroundColor: '#F9F9F9'}}>
                                        {fileData.length > 0 && fileData.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} style={{color: cellIndex===0 && /^\d+$/.test(cell)===false ? "red" : ""}}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {sheetsVariables()===variables.length ? "Planilha correta" : `Planilha com erro, o template precisa de ${variables.length} variável(is) e sua planilha possui ${sheetsVariables()=== -1 ? 0 : sheetsVariables() }`}
                            </div>
                        </div>}
                    <div style={{width:"100%", textAlign:"right"}}>
                        <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('disparo')}>Próximo</button>
                    </div>
                    </div>
                </div>}
            </div>
            <div className="modo-disparo">
                <div className={`accordion_head ${accordionState.disparo ? "accordion_head_opened" : ""}`} onClick={() => toggleAccordion('disparo')}>3. Modo de Disparo
                <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.disparo ?"-90deg" : "90deg"}} /></div>
                </div>
                {accordionState.disparo && 
                <div className="body-no-background" style={{width:"100%"}}>
                <div className="accordeon-new">
                    <div className="body" style={{ backgroundColor: "#FFF"}}>
                        <div className="line">
                            <input type="radio" name="disparo" value="imediato" onChange={handleMode} className="input-spaces" checked={mode === false} /><span>Imediato</span>
                            <input type="radio" name="disparo" value="agendado" onChange={handleMode} className="input-spaces" checked={mode === true} /><span>Agendado</span>
                        </div>
                        {mode && <div style={{ display: "flex", flexDirection: "row" }}>
                            <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                <span className="span-title">Data</span>
                                <input 
                                    type="date" 
                                    min={new Date().toISOString().slice(0, 10)}
                                    value={dates} onChange={e => setDate((e.target as HTMLInputElement).value)} 
                                    className="input-values" 
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                                <span className="span-title">Horário</span>
                                <input 
                                    type="time" 
                                    min={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    value={hours} onChange={e => setHours((e.target as HTMLInputElement).value)} 
                                    className="input-values" 
                                />
                            </div>
                        </div>}
                        {!mode && <div>
                            <Alert message="Neste modo, após salvar a campanha, o disparo começará a ser realizado, não podendo ser cancelado." />
                        </div>}
                    </div>
                    <div style={{width:"100%", textAlign:"right"}}>
                        <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('revisar')}>Próximo</button>
                    </div>
                </div>
                </div>}
            </div>
            <div className="revisar">
                <div className={`accordion_head ${accordionState.revisar ? "accordion_head_opened" : ""}`} onClick={() => toggleAccordion('revisar')}>4. Resumo e salvar
                <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.revisar ?"-90deg" : "90deg"}} /></div>
                </div>
                    {accordionState.revisar && 
                    <div className="body-no-background" style={{width:"100%"}}>
                        <div className="accordeon-new" style={{padding:"0px 15px 15px 10px"}}>
                            <div style={{ justifyContent: "center"}}>
                                <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "90%" }}>
                                    <span className="span-title-resume">Template: {templateName}</span>
                                    <span className="span-title-resume">Telefone do disparo: {mask(phone)}</span>
                                    <span className="span-title-resume">Data e hora do disparo: {triggerMode==="imediato" ? "imediato" : `agendado dia ${formatDate(dates)} às ${hours}`}</span>
                                    <span className="span-title-resume">Quantidade de disparos: {typeClient === false ? listVariables.length : fileData.length > 0 ? fileData.length : "0"}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "100%" }}>
                                    <button className="button-cancel" onClick={() => handleButtonName("Cancelar")}>Cancelar</button>
                                    <button className="button-save" onClick={() => validatedPayload()}>Salvar</button>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div >
    );
}

export default Accordion;