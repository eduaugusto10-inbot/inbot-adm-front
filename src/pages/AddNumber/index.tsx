import { useState } from 'react';
import { AccordionStateWhats, ICustomerData, defaultCustomerData } from '../types';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ToastContainer, toast } from "react-toastify";
import { successMessageChange, errorMessageDefault } from '../../Components/Toastify'
import { mask } from '../../utils/utils';
import chevron from "../../img/right-chevron.png";
import  {validatedUser}  from "../../utils/validateUser";
import { PhoneInput } from 'react-international-phone';

export function AddNumber() {
   
    const history = useNavigate();
    function BackToHome() {
        history("/?token=123&bot_id=123");
    }
    const [newNumber, setNewNumber] = useState<ICustomerData>(defaultCustomerData);
    const [loading, setLoading] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
    const [accordionState, setAccordionState] = useState<AccordionStateWhats>({
        inbot: true,
        smarters: false,
        finish: false
    });
    
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
        
        // Validação dos campos obrigatórios
        const requiredFields: { [key: string]: string } = {
            number: "Telefone",
            client: "Cliente",
            botId: "Bot ID",
            webhook: "Gateway",
            botServerType: "Ambiente Bot Server",
            server: "Servidor",
            profile_pic: "Link da imagem",
            description: "Descrição",
            accessToken: "Access token",
            origin: "Origem do cadastro"
        };
        
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
                        inbot: false,
                        smarters: true,
                        finish: false
                    });
                } else {
                    setAccordionState({
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
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }
        
        setLoading(true)
        const data={
            number: newNumber.number.replace(/\D/g, ''),
            client: newNumber.client,
            observation: newNumber.observation,
            botId: newNumber.botId,
            webhook: newNumber.webhook,
            botServerType: newNumber.botServerType,
            url_server: newNumber.url_server,
            url_inchat: newNumber.url_inchat,
            server: newNumber.server,
            origin: newNumber.origin,
            accessToken: newNumber.accessToken,
            description: newNumber.description,
            botToken: newNumber.botToken,
            address: newNumber.address,
            email: newNumber.email,
            vertical: newNumber.vertical,
            websites: newNumber.websites,
            profile_pic: newNumber.profile_pic,
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
                    <div className={`accordion_head ${accordionState.inbot ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('inbot')}>1. Configurações na InBot
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
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/test/api/v1/smarters/bot">Desenvolvimento</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/api/v1/smarters/bot">Produção</option>
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
                            </div>
                            <div className="card_2024 column-align" style={{ width: "340px", textAlign: "left", marginLeft: "20px" }}>
                                <div className="row-align" style={{ height:"50px"}}>
                                    <div style={{ display: "flex", flexDirection: "column", minHeight: "200px" }}>
                                    <div className='div-img'>
                                    <img src={newNumber.profile_pic} width={200} height={200} alt='logo da empresa' style={{ margin: "7px", padding: "7px" }} />
                                    <label>Insira o link da imagem(640x640)*</label>
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
                            </div>
                            <div style={{width:"100%", textAlign:"right", marginTop:"20px"}}> 
                                <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('smarters')}>Próximo</button>
                            </div>
                        </div>}
                </div>
            <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.smarters ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('smarters')}>2. Configurações na Smarters
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.smarters ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.smarters &&
                    <div className="column accordeon-new" style={{width:"800px"}} >
                        <div className="row-align" style={{ textAlign: "left", backgroundColor: "#FFF", width: "100%" }}>
                            <div className="input" style={{ justifyContent: "center"}}>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ justifyContent:"flex-start" }}>Página da internet</span>
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
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>E-mail</span>
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
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Descrição</span>
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
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Endereço</span>
                                    <textarea 
                                        placeholder="Endereço"
                                        name="address"
                                        value={newNumber.address}
                                        onChange={handleInputChange}
                                        className="textarea-values"
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Vertical</span>
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
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Access token</span>
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
                            </div>
                            </div>
                            <div style={{width:"100%", textAlign:"right", marginTop:"20px"}}> 
                                <button style={{width:"80px", margin:"0px 30px 15px 0px"}} className="button-next" onClick={() => toggleAccordion('finish')}>Próximo</button>
                            </div>
                        </div>}
                </div>
                <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.finish ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('finish')}>3. Finalizar
                        <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.smarters ?"-90deg" : "90deg"}} /></div>
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
