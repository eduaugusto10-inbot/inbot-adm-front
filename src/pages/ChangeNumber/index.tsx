import { useEffect, useState } from 'react';
import { AccordionStateWhats, ICustomerData, defaultCustomerData } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ToastContainer } from "react-toastify";
import { successMessageChange, errorMessage, successMessageImg, errorMessageImg } from '../../Components/Toastify'
import { mask } from '../../utils/utils';
import chevron from "../../img/right-chevron.png";
import  {validatedUser}  from "../../utils/validateUser";
import { PhoneInput } from 'react-international-phone';

export function ChangeDeleteNumber() {
  
    const history = useNavigate();
    const location = useLocation()
    const [customerData, setCustomerData] = useState<ICustomerData>(defaultCustomerData);
    const [profilePic, setProfilePic] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false)
    const [accordionState, setAccordionState] = useState<AccordionStateWhats>({
        inbot: true,
        smarters: false,
        finish: false
    });
    function BackToHome() {
        history("/?token=123&bot_id=403");
    }
    useEffect(() => {
        api.get(`/whats/${location.state.phoneNumber}`)
            .then(res => {
                setCustomerData(res.data)
                setProfilePic(res.data.profile_pic)
            })
            .catch(error => console.log(error))
    }, [])

    const saveChanges = () => {
        setLoading(true)
        const data={
            number: customerData.number.replace(/\D/g, ''),
            client: customerData.client,
            observation: customerData.observation,
            botId: customerData.botId,
            webhook: customerData.webhook,
            botServerType: customerData.botServerType,
            url_bot_server: customerData.url_bot_server,
            origin: customerData.origin,
            accessToken: customerData.accessToken,
            activated: customerData.activated,
        }
        api.put(`/whats/${location.state.phoneNumber}`, data)
            .then(res => {
                successMessageChange();
                setLoading(false)
                setTimeout(() => history("/?token=123&bot_id=403"), 2000)
            })
            .catch(error => {
                setLoading(false)
                errorMessage()
            })
    }
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
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setCustomerData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        saveChanges();
    };

    const handleImage = (event: React.FormEvent) => {
        event.preventDefault();
        api.post('/whats/image', { "image": profilePic, "phoneNumber": customerData.number })
            .then(res => {
                successMessageImg();
                setTimeout(() => history("/?token=123&bot_id=403"), 2000)
            })
            .catch(error => {
                errorMessageImg();
            })
    }

    return (
        <div className="container-trigger width-95-perc" style={{ padding:"10px 0px"}}>
        <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width:"100%" }} className="title_2024">Alterar Número WhatsApp</h1>
        <div className="hr_color" style={{width:"100%", marginTop:"15px"}}></div>
        <br/>
            <ToastContainer />
            <form onSubmit={handleFormSubmit}>
            <ToastContainer />
            <div className="config-template column-align" style={{ alignItems:"center" }}>
                    <div className={`accordion_head ${accordionState.inbot ? "accordion_head_opened" : ""}`} style={{ borderRadius: "20px" }} onClick={() => toggleAccordion('inbot')}>1. Configurações na InBot
                    <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.inbot ?"-90deg" : "90deg"}} /></div>
                    </div>
                    {accordionState.inbot &&
                    <div className="column accordeon-new" style={{width:"800px"}} >
                        <div className="row-align" style={{ textAlign: "left", backgroundColor: "#FFF", width: "100%" }}>
                            <div className="input" style={{ justifyContent: "center"}}>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ justifyContent:"flex-start" }}>Telefone*</span>
                                    <PhoneInput
                                        defaultCountry="br"
                                        value={customerData.number}
                                        onChange={(phone: string) => setCustomerData(prevState => ({ ...prevState, number: phone }))}
                                        inputStyle={{
                                            width: "305px",
                                            height: "30px",
                                            border: "1px solid #A8A8A8",
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
                                        value={customerData.client}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        style={{width:"350px"}}
                                        required
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Observação</span>
                                    <input 
                                        type="text"
                                        placeholder="Observação"
                                        name="observation"
                                        value={customerData.observation}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        style={{width:"350px"}}
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Bot ID*</span>
                                    <input 
                                        type="number"
                                        placeholder="Enter bot ID"
                                        name="botId"
                                        value={customerData.botId}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={{width:"350px"}}
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Gateway*</span>
                                    <select
                                    className="input-values"
                                    style={{width:"350px"}}
                                    name="webhook"
                                    value={customerData.webhook}
                                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(event)}
                                >
                                    <option value="">Escolha uma opção</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/test/api/v1/smarters/bot">Desenvolvimento</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/api/v1/smarters/bot">Produção</option>
                                </select>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Bot Server*</span>
                                    <select
                                        className="input-values"
                                        style={{width:"350px"}}
                                        name="botServerType"
                                        value={customerData.botServerType}
                                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(event)}
                                    >
                                    <option value="">Escolha uma opção</option>
                                    <option value="dev">Desenvolvimento</option>
                                    <option value="staging">Homologação</option>
                                    <option value="production">Produção</option>
                                </select>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>URL do botserver*</span>
                                    <input 
                                        type="text"
                                        placeholder="Insira a URL do botserver"
                                        name="url_bot_server"
                                        value={customerData.url_bot_server}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={{width:"350px"}}
                                    />
                                    </div>
                                    <div style={{ fontSize: "10px", fontWeight: "bold", color: "#ff0000", marginLeft: "120px", marginTop: "-20px" }}>
                                        Padrão: https://in.bot/api/bot_gateway
                                    </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Status</span>
                                    <select name="activated" value={customerData.activated} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(event)} className="input-values" style={{width:"350px"}}>
                                        <option value="">--</option>
                                        <option value="1">Ativo</option>
                                        <option value="0">Inativo</option>
                                    </select>
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Origem do cadastro</span>
                                    <input 
                                        type="text"
                                        placeholder="Insira a origem"
                                        name="origin"
                                        value={customerData.origin}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={{width:"350px"}}
                                    />
                                </div>
                            </div>
                            <div className="card_2024 column-align" style={{ width: "340px", textAlign: "left", marginLeft: "20px" }}>
                                <div className="row-align" style={{ height:"50px"}}>
                                    <div style={{ display: "flex", flexDirection: "column", minHeight: "200px" }}>
                                    <div className='div-img'>
                        <img src={profilePic} width={200} height={200} alt='logo da empresa' style={{ margin: "7px", padding: "7px" }} />
                        <input
                            className='input'
                            type="text"
                            value={profilePic}
                            onChange={e => setProfilePic(e.target.value)}
                            style={{ margin: "7px" }}
                        />
                        <button
                            onClick={handleImage}
                            className='button-blue'
                            style={{ width:"100px", margin: "7px" }}>Enviar imagem</button>
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
                                        value={customerData.websites}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        style={{width:"350px" }}
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px", textAlign: "left" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>E-mail</span>
                                    <input 
                                        type="email"
                                        placeholder="E-mail"
                                        name="email"
                                        value={customerData.email}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        style={{width:"350px"}}
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Descrição</span>
                                    <input 
                                        type="text"
                                        placeholder="Descrição"
                                        name="description"
                                        value={customerData.description}
                                        onChange={handleInputChange}
                                        className="input-values"
                                        required
                                        style={{width:"350px"}}
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Endereço</span>
                                    <textarea 
                                        placeholder="Endereço"
                                        name="address"
                                        value={customerData.address}
                                        onChange={handleInputChange}
                                        className="textarea-values"
                                    />
                                </div>
                                <div className="row-align" style={{ margin: "10px" }}>
                                    <span className="span-title" style={{ textAlign: "left", justifyContent:"flex-start" }}>Vertical</span>
                                    <select
                                        name="vertical"
                                        value={customerData.vertical}
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
                                        value={customerData.accessToken}
                                        onChange={handleInputChange}
                                        className="textarea-values"
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
                                    <button type="submit" className='button-save' style={{backgroundColor: loading ? "#c3c3c3" : "#5ed12c"}} disabled={loading}>{loading ? <div className="in_loader"></div> :"Salvar"}</button>
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

export default ChangeDeleteNumber;
