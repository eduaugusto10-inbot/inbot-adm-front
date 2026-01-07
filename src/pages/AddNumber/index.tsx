import { useState } from 'react';
import { AccordionStateWhats, ICustomerData, defaultCustomerData } from '../types';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ToastContainer, toast } from "react-toastify";
import { successMessageChange, errorMessageDefault } from '../../Components/Toastify'
import chevron from "../../img/right-chevron.png";
import { PhoneInput } from 'react-international-phone';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// Estado para os campos de "Outros"
type OtherConfig = {
    name: string;
    app_id: string;
    secret_id: string;
    client_id: string;
    bot_server_type: string;
    bot_id: string;
    bot_token: string;
    bot_phone: string;
    project_id: string;
    region: string;
    key_secret: string;
    access_key: string;
    url_chat: string;
    platform_name: string;
    url_webhook: string;
    url_inchat: string;
};

export function AddNumber() {
    const history = useNavigate();
    function BackToHome() {
        history("/?token=123&bot_id=123&url_base_api=1234");
    }
    const [newNumber, setNewNumber] = useState<ICustomerData>(defaultCustomerData);
    const [loading, setLoading] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
    const [accordionState, setAccordionState] = useState<AccordionStateWhats>({
        integration: true,
        inbot: false,
        smarters: false,
        finish: false
    });

    // Nova escolha de tipo: "Smarters" ou "Outros"
    const [integrationType, setIntegrationType] = useState<'smarters' | 'outros'>('smarters');

    const [otherConfig, setOtherConfig] = useState<OtherConfig>({
        name: '',
        app_id: '',
        secret_id: '',
        client_id: '',
        bot_server_type: '',
        bot_id: '',
        bot_token: '',
        bot_phone: '',
        project_id: '',
        region: '',
        key_secret: '',
        access_key: '',
        url_chat: '',
        platform_name: '',
        url_webhook: '',
        url_inchat: '',
    });

    const handleOtherInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setOtherConfig(prev => ({ ...prev, [name]: value }));
    };
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let { name, value } = event.target;
        if (name === 'number') {
            value = value.replace(/\D/g, '');
        }
        
        // Limpar o erro do campo quando o usuário começar a digitar
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
        
        // Se o campo for server (Servidor), definir os valores corretos
        if (name === 'server') {
            let serverUrl = '';
            let inchatUrl = '';
            
            switch(value) {
                case 'Principal':
                    serverUrl = 'in.bot';
                    inchatUrl = 'https://proxy1.in.bot/api';
                    break;
                case 'OEC':
                    serverUrl = 'oec.in.bot';
                    inchatUrl = 'https://oec.in.bot/node/api';
                    break;
                case 'FS':
                    serverUrl = 'fs.in.bot';
                    inchatUrl = 'https://fs.in.bot/node/api';
                    break;
                case 'Tecban':
                    serverUrl = 'tecban-chat.in.bot';
                    inchatUrl = 'https://tecban-chat.in.bot/node/api';
                    break;
                default:
                    serverUrl = 'in.bot';
                    inchatUrl = 'https://proxy1.in.bot/api';
            }
            
            setNewNumber(prevState => ({
                ...prevState,
                server: value,
                url_server: serverUrl,
                url_inchat: inchatUrl
            }));
            
            return;
        }
        
        setNewNumber(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const toggleAccordion = (key: keyof AccordionStateWhats) => {
        setAccordionState({
            integration: false,
            inbot: false,
            smarters: false,
            finish: false
        })
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        // Validação dos campos obrigatórios (condicional por tipo de integração)
        const requiredFields: { [key: string]: string } = {
            client: "Cliente",
            botId: "Bot ID",
            webhook: "Gateway",
            botServerType: "Ambiente Bot Server",
            server: "Servidor"
        };

        // Campos exclusivos do fluxo Smarters
        if (integrationType === 'smarters') {
            requiredFields.number = "Telefone";
            requiredFields.description = "Descrição";
            requiredFields.accessToken = "Access token";
            requiredFields.about = "Sobre";
            requiredFields.profile_pic = "Link da imagem";
            requiredFields.origin = "Origem do cadastro";
        }
        
        let hasError = false;
        const newFieldErrors: {[key: string]: boolean} = {};
        let firstErrorField = '';
        const missingFields: string[] = [];
        
        // Verificar cada campo obrigatório
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!newNumber[field as keyof ICustomerData]) {
                newFieldErrors[field] = true;
                hasError = true;
                missingFields.push(label);
                
                // Guardar o primeiro campo com erro para rolar até ele
                if (!firstErrorField) {
                    firstErrorField = field;
                }
                
                // Abrir o accordion correspondente ao campo com erro
                if (field === 'description' || field === 'accessToken') {
                    setAccordionState({
                        integration: false,
                        inbot: false,
                        smarters: true,
                        finish: false
                    });
                } else {
                    setAccordionState({
                        integration: false,
                        inbot: true,
                        smarters: false,
                        finish: false
                    });
                }
            }
        }
        
        // Atualizar o estado de erros dos campos
        setFieldErrors(newFieldErrors);
        
        // Se houver erro, não continua com o envio do formulário
        if (hasError) {
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
            
            // Rolar até o primeiro campo com erro após um pequeno delay para garantir que o accordion esteja aberto
            setTimeout(() => {
                let errorElement;
                
                if (firstErrorField === 'number') {
                    errorElement = document.getElementById('phone-input-container');
                } else {
                    errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                }
                
                if (errorElement) {
                    (errorElement as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }
        
        setLoading(true)
        const data={
            number: newNumber.number.replace(/\D/g, ''),
            client: newNumber.client,
            botId: newNumber.botId,
            webhook: newNumber.webhook,
            botServerType: newNumber.botServerType,
            url_server: newNumber.url_server,
            url_inchat: newNumber.url_inchat,
            server: newNumber.server,
            broker: integrationType,
            accessToken: newNumber.accessToken,
            description: newNumber.description,
            botToken: newNumber.botToken,
            address: newNumber.address,
            email: newNumber.email,
            vertical: newNumber.vertical,
            websites: newNumber.websites,
            about: newNumber.about,
            ...(integrationType === 'smarters' ? { observation: newNumber.observation } : {}),
            ...(integrationType === 'smarters' ? { profile_pic: newNumber.profile_pic } : {})
            ,...(integrationType === 'smarters' ? { origin: newNumber.origin } : {})
        }
        api.post('/whats', data)
            .then(res => {
                successMessageChange();
                setLoading(false)
                setTimeout(() => history("/?token=123&bot_id=403"), 2000)
            })
            .catch(error => {
                console.log(error.response.data.name)
                setLoading(false)
                errorMessageDefault(error.response.data.name);
            })
    };

    // Função para obter o estilo do campo com base no estado de erro
    const getInputStyle = (fieldName: string) => {
        const baseStyle = {width:"350px"};
        return fieldErrors[fieldName] 
            ? {...baseStyle, border: "1px solid red", backgroundColor: "#fff0f0"} 
            : baseStyle;
    };

    return (
        <div className="container-trigger width-95-perc" style={{ padding:"10px 0px"}}>
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width:"100%" }} className="title_2024">Cadastrar Número WhatsApp</h1>
            <div className="hr_color" style={{width:"100%", marginTop:"15px"}}></div>
            <br/>
            <form onSubmit={handleFormSubmit}>
                <ToastContainer limit={3} />
                <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.integration ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('integration')}>
                        1. Tipo de integração
                        <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.integration ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.integration &&
                    <div className="column accordeon-new" style={{width:"800px"}} >
                        <div className="row-align" style={{ textAlign: "left", backgroundColor: "#FFF", width: "100%" }}>
                            <div className="input" style={{ justifyContent: "center"}}>
                                {/* Escolha do tipo de integração: Smarters ou Outros (movido para o acordeão 1) */}
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                        Tipo de integração
                                    </span>
                                    <label style={{ marginLeft: "10px" }}>
                                        <input
                                            type="radio"
                                            name="integrationType"
                                            checked={integrationType === 'smarters'}
                                            onChange={() => setIntegrationType('smarters')}
                                        /> Smarters
                                    </label>
                                    <label style={{ marginLeft: "20px" }}>
                                        <input
                                            type="radio"
                                            name="integrationType"
                                            checked={integrationType === 'outros'}
                                            onChange={() => setIntegrationType('outros')}
                                        /> Outros
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div style={{width:"100%", textAlign:"right", marginTop:"20px"}}> 
                            <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('inbot')}>Próximo</button>
                        </div>
                    </div>}
                </div>
                <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.inbot ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('inbot')}>2. Configurações na InBot
                        <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.inbot ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.inbot &&
                    <div className="column accordeon-new" style={{width:"800px"}} >
                        <div className="row-align" style={{ textAlign: "left", backgroundColor: "#FFF", width: "100%" }}>
                            <div className="input" style={{ justifyContent: "center"}}>
                                <div className="row-align" style={{ margin: "10px" }} id="phone-input-container">
                                    <span className="span-title" style={{ justifyContent:"flex-start" }}>Telefone*</span>
                                    <PhoneInput
                                        defaultCountry="br"
                                        value={newNumber.number}
                                        onChange={(phone: string) => {
                                            // Limpar o erro do campo quando o usuário começar a digitar
                                            if (fieldErrors['number']) {
                                                setFieldErrors(prev => ({
                                                    ...prev,
                                                    number: false
                                                }));
                                            }
                                            setNewNumber(prevState => ({ ...prevState, number: phone }));
                                        }}
                                        inputStyle={{
                                            width: "305px",
                                            height: "30px",
                                            border: fieldErrors['number'] ? "1px solid red" : "1px solid #A8A8A8",
                                            backgroundColor: fieldErrors['number'] ? "#fff0f0" : "white",
                                            marginLeft: "5px",
                                            padding: "5px",
                                            borderRadius: "8px",
                                            alignItems: "center",
                                        }}
                                    />                                  
                                </div>
                                <div className="row-align" style={{ margin: "10px", textAlign: "left" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Cliente*</span>
                                    <input 
                                        type="text"
                                        placeholder="Nome do cliente"
                                        name="client"
                                        value={newNumber.client}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        style={getInputStyle('client')}
                                        required
                                    />
                                </div>
                                {integrationType === 'smarters' && (
                                    <div className="row-align" style={{ margin: "10px" }}>
                                        <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Observação</span>
                                        <input 
                                            type="text"
                                            placeholder="Observação"
                                            name="observation"
                                            value={newNumber.observation}
                                            onChange={handleInputChange}
                                            className="input-values"
                                            style={getInputStyle('observation')}
                                        />
                                    </div>
                                )}
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Bot ID*</span>
                                    <input 
                                        type="number"
                                        placeholder="Enter bot ID"
                                        name="botId"
                                        value={newNumber.botId}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={getInputStyle('botId')}
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Gateway*</span>
                                    <select
                                    className="input-values"
                                    style={getInputStyle('webhook')}
                                    name="webhook"
                                    value={newNumber.webhook}
                                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(event)}
                                >
                                    <option value="">Escolha uma opção</option>
                                    <option value="https://integration-cluster-v9.inbot.com.br/api/v2/webhook/received">Produção + chat cliente</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/test/api/v1/smarters/bot">Desenvolvimento + inchat</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/api/v1/smarters/bot">Produção + inchat</option>
                                </select>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Ambiente Bot Server*</span>
                                    <select
                                        className="input-values"
                                        style={getInputStyle('botServerType')}
                                        name="botServerType"
                                        value={newNumber.botServerType}
                                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(event)}
                                    >
                                    <option value="">Escolha uma opção</option>
                                    <option value="dev">Desenvolvimento</option>
                                    <option value="staging">Homologação</option>
                                    <option value="production">Produção</option>
                                </select>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Servidor*</span>
                                    <select 
                                        name="server"
                                        value={newNumber.server}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={getInputStyle('server')}
                                    >
                                        <option value="">Selecione uma opção</option>
                                        <option value="Principal">Principal</option>
                                        <option value="Tecban">Tecban</option>
                                        <option value="FS">FS</option>
                                        <option value="OEC">OEC</option>
                                    </select>
                                </div>
                                {integrationType === 'smarters' && (
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Origem do cadastro*</span>
                                    <select 
                                        name="origin"
                                        value={newNumber.origin}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={getInputStyle('origin')}
                                    >
                                        <option value="">Selecione uma origem</option>
                                        <option value="Número do cliente">Número do cliente</option>
                                        <option value="Inbot - Chip">Inbot - Chip</option>
                                        <option value="Inbot - New Wave">Inbot - New Wave</option>
                                    </select>
                                </div>
                                )}
                            </div>
                            {integrationType === 'smarters' && (
                                <div className="card_2024 column-align" style={{ width: "340px", textAlign: "left", marginLeft: "20px" }}>
                                    <div className="row-align" style={{ height:"50px"}}>
                                        <div style={{ display: "flex", flexDirection: "column", minHeight: "200px" }}>
                                            <div className='div-img'>
                                                <img src={newNumber.profile_pic} width={200} height={200} alt='logo da empresa' style={{ margin: "7px", padding: "7px" }} />
                                                <label>Insira o link da imagem(640x640)*
                                                    <span data-tooltip-id="tooltip-profile_pic" data-tooltip-content="URL da nova imagem de perfil." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                                </label>
                                                <Tooltip id="tooltip-profile_pic" place="top" />
                                                <input
                                                    type="text"
                                                    name='profile_pic'
                                                    onChange={handleInputChange}
                                                    style={fieldErrors['profile_pic'] ? { margin: "7px", border: "1px solid red", backgroundColor: "#fff0f0" } : { margin: "7px" }}
                                                    value={newNumber.profile_pic}
                                                    className="input-values"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
                            <div style={{width:"100%", textAlign:"right", marginTop:"20px"}}> 
                                <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('smarters')}>Próximo</button>
                            </div>
                        </div>}
                </div>
            <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.smarters ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('smarters')}>
                    3. Configurações na Smarters
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.smarters ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.smarters &&
                    <div className="column accordeon-new" style={{width:"800px"}} >
                        <div className="row-align" style={{ textAlign: "left", backgroundColor: "#FFF", width: "100%" }}>
                            <div className="input" style={{ justifyContent: "center"}}>


                                {/* Conteúdo quando "Smarters" */}
                                {integrationType === 'smarters' && (
                                    <>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                Sobre*
                                                <span data-tooltip-id="tooltip-about" data-tooltip-content="Texto resumido dizendo sobre o que é o negócio." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-about" place="top" />
                                            <input 
                                                type="text"
                                                placeholder="Sobre o cliente ou número"
                                                name="about"
                                                value={newNumber.about}
                                                onChange={handleInputChange}
                                                className="input-values"
                                                required
                                                style={getInputStyle('about')}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                Página da internet
                                                <span data-tooltip-id="tooltip-websites" data-tooltip-content="Websites do negócio." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-websites" place="top" />
                                            <input 
                                                type="text"
                                                placeholder="Página de internet"
                                                name="websites"
                                                value={newNumber.websites}
                                                onChange={handleInputChange}
                                                className="input-values"
                                                style={getInputStyle('websites')}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px", textAlign: "left" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                E-mail
                                                <span data-tooltip-id="tooltip-email" data-tooltip-content="Email para contato." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-email" place="top" />
                                            <input 
                                                type="email"
                                                placeholder="E-mail"
                                                name="email"
                                                value={newNumber.email}
                                                onChange={handleInputChange}
                                                className="input-values"
                                                style={getInputStyle('email')}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                Descrição
                                                <span data-tooltip-id="tooltip-description" data-tooltip-content="Descrição do negócio." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-description" place="top" />
                                            <input 
                                                type="text"
                                                placeholder="Descrição"
                                                name="description"
                                                value={newNumber.description}
                                                onChange={handleInputChange}
                                                className="input-values"
                                                required
                                                style={getInputStyle('description')}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                Endereço
                                                <span data-tooltip-id="tooltip-address" data-tooltip-content="Endereço oficial do negócio." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-address" place="top" />
                                            <textarea 
                                                placeholder="Endereço"
                                                name="address"
                                                value={newNumber.address}
                                                onChange={handleInputChange}
                                                className="textarea-values"
                                                style={getInputStyle('address')}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                Vertical
                                                <span data-tooltip-id="tooltip-vertical" data-tooltip-content="Vertente do negócio." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-vertical" place="top" />
                                            <select
                                                name="vertical"
                                                value={newNumber.vertical}
                                                onChange={handleInputChange}
                                                className="input-values"
                                                style={{width:"350px"}}
                                            >
                                                <option value="OTHER">Other</option>
                                                <option value="AUTO">Auto</option>
                                                <option value="BEAUTY">Beauty</option>
                                                <option value="APPAREL">Apparel</option>
                                                <option value="EDU">Edu</option>
                                                <option value="ENTERTAIN">Entertain</option>
                                                <option value="EVENT_PLAN">Event Plan</option>
                                                <option value="FINANCE">Finance</option>
                                                <option value="GROCERY">Grocery</option>
                                                <option value="GOVT">Govt</option>
                                                <option value="HOTEL">Hotel</option>
                                                <option value="HEALTH">Health</option>
                                                <option value="NONPROFIT">Nonprofit</option>
                                                <option value="PROF_SERVICES">Prof Services</option>
                                                <option value="RETAIL">Retail</option>
                                                <option value="TRAVEL">Travel</option>
                                                <option value="RESTAURANT">Restaurant</option>
                                                <option value="NOT_A_BIZ">Not a Biz</option>
                                                <option value="ALCOHOL">Alcohol</option>
                                                <option value="ONLINE_GAMBLING">Online Gambling</option>
                                                <option value="PHYSICAL_GAMBLING">Physical Gambling</option>
                                                <option value="OTC_DRUGS">Otc Drugs</option>
                                            </select>
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>
                                                Access token*
                                                <span data-tooltip-id="tooltip-accessToken" data-tooltip-content="Token de acesso da integração." style={{marginLeft: '5px', cursor: 'pointer'}}>🛈</span>
                                            </span>
                                            <Tooltip id="tooltip-accessToken" place="top" />
                                            <textarea 
                                                placeholder="Access token"
                                                name="accessToken"
                                                value={newNumber.accessToken}
                                                onChange={handleInputChange}
                                                className="textarea-values"
                                                style={fieldErrors['accessToken'] ? { border: "1px solid red", backgroundColor: "#fff0f0" } : {}}
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Conteúdo quando "Outros" */}
                                {integrationType === 'outros' && (
                                    <>
                                        {/* Campo 'name' removido do fluxo Outros */}
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>app_id*</span>
                                            <input
                                                type="text"
                                                name="app_id"
                                                value={otherConfig.app_id}
                                                onChange={handleOtherInputChange}
                                                className="input-values"
                                                style={{width:"350px"}}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>secret_id*</span>
                                            <input
                                                type="text"
                                                name="secret_id"
                                                value={otherConfig.secret_id}
                                                onChange={handleOtherInputChange}
                                                className="input-values"
                                                style={{width:"350px"}}
                                            />
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>client_id*</span>
                                            <input
                                                type="text"
                                                name="client_id"
                                                value={otherConfig.client_id}
                                                onChange={handleOtherInputChange}
                                                className="input-values"
                                                style={{width:"350px"}}
                                            />
                                        </div>
                                        {/* bot_server_type removido (duplicado com Bot Server em InBot) */}
                                        {/* bot_id removido (duplicado com Bot ID em InBot) */}
                                        {/* Campo 'bot_token' removido do fluxo Outros */}
                                        {/* bot_phone removido (duplicado com Telefone em InBot) */}

                                        {/* Campos opcionais */}
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>project_id</span>
                                            <input type="text" name="project_id" value={otherConfig.project_id} onChange={handleOtherInputChange} className="input-values" style={{width:"350px"}}/>
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>region</span>
                                            <input type="text" name="region" value={otherConfig.region} onChange={handleOtherInputChange} className="input-values" style={{width:"350px"}}/>
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>key_secret</span>
                                            <input type="text" name="key_secret" value={otherConfig.key_secret} onChange={handleOtherInputChange} className="input-values" style={{width:"350px"}}/>
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>access_key</span>
                                            <input type="text" name="access_key" value={otherConfig.access_key} onChange={handleOtherInputChange} className="input-values" style={{width:"350px"}}/>
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>url_chat</span>
                                            <input type="text" name="url_chat" value={otherConfig.url_chat} onChange={handleOtherInputChange} className="input-values" style={{width:"350px"}}/>
                                        </div>
                                        <div className="row-align" style={{ margin: "10px" }}>
                                            <span className="span-title" style={{ justifyContent:"flex-start" }}>platform_name</span>
                                            <input type="text" name="platform_name" value={otherConfig.platform_name} onChange={handleOtherInputChange} className="input-values" style={{width:"350px"}}/>
                                        </div>
                                        {/* url_webhook removido (duplicado com Gateway em InBot) */}
                                        {/* url_inchat removido (definido pelo Servidor em InBot) */}
                                    </>
                                )}
                            </div>
                            </div>
                            <div style={{width:"100%", textAlign:"right", marginTop:"20px"}}> 
                                <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('finish')}>Próximo</button>
                            </div>
                        </div>}
                </div>
                <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.finish ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('finish')}>4. Finalizar
                        <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.finish ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.finish &&
                        <div className="body-no-background" style={{width:"100%"}}>
                        <div className="accordeon-new" style={{padding:"0px 15px 15px 10px"}}>
                            <div style={{ justifyContent: "center"}}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "100%" }}>
                                    <button onClick={BackToHome} className='button-cancel'>Voltar</button>
                                    <button type="submit" className='button-save' style={{backgroundColor: loading ? "#c3c3c3" : "#5ed12c"}} disabled={loading}>{loading ? <div className="in_loader"></div> : "Salvar"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </form>
        </div>
    );
}

export default AddNumber;
