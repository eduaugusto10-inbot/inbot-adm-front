import { useEffect, useState } from 'react';
import { ICustomerData, IPayload, defaultCustomerData } from '../types';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { ToastContainer } from "react-toastify";
import { successMessageChange, errorMessage, successMessageImg, errorMessageImg } from '../../Components/Toastify'
import { mask } from '../../utils/utils';

export function ChangeDeleteNumber() {
  
    const history = useNavigate();
    const location = useLocation()
    const [customerData, setCustomerData] = useState<ICustomerData>(defaultCustomerData);
    const [profilePic, setProfilePic] = useState<string>('');

    function BackToHome() {
        history("/#/?token=123");
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
        api.put(`/whats/${location.state.phoneNumber}`, customerData)
            .then(res => {
                successMessageChange();
                setTimeout(() => history("/#/?token=123"), 2000)
            })
            .catch(error => {
                errorMessage()
            })
    }
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
                setTimeout(() => history("/"), 2000)
            })
            .catch(error => {
                errorMessageImg();
            })
    }

    return (
        <div>
            <ToastContainer />
            <form onSubmit={handleFormSubmit}>
                <div className='input-forms'>
                    <div className='div-img'>
                        <img src={profilePic} width={200} height={200} alt='logo da empresa' style={{ margin: "7px", border: "1px solid #000", padding: "7px" }} />
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
                            style={{ margin: "7px" }}>Enviar imagem</button>
                    </div>
                    <div className='left-side'>
                        <fieldset>
                            <legend>Configurações Inbot</legend>
                            <div className='forms'>
                                <label>Número do telefone*</label>
                                <input
                                    maxLength={18}
                                    className='input'
                                    type="text"
                                    placeholder="Número telefone"
                                    name="number"
                                    value={mask(customerData.number)}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className='forms'>
                                <label>Nome do cliente*</label>
                                <input
                                    className='input'
                                    type="text"
                                    placeholder="Nome do cliente"
                                    name="client"
                                    value={customerData.client}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className='forms'>
                                <label>Observação</label>
                                <input
                                    className='input'
                                    type="text"
                                    placeholder="observação"
                                    name="observation"
                                    value={customerData.observation}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='forms'>
                                <label>Bot ID*</label>
                                <input
                                    className='input'
                                    type="number"
                                    placeholder="Enter bot ID"
                                    name="botId"
                                    value={customerData.botId}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className='forms'>
                                <label>Gateway*</label>
                                <select
                                    name="webhook"
                                    value={customerData.webhook}
                                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(event)}
                                >
                                    <option value="">Escolha uma opção</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/test/api/v1/smarters/bot">Desenvolvimento</option>
                                    <option value="https://integration-cluster-v9-2.inbot.com.br/api/v1/smarters/bot">Produção</option>
                                </select>
                            </div>
                            <div className='forms'>
                                <label>Bot Server Type*</label>
                                <select
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
                        </fieldset>
                    </div>
                    <div className='rigth-side'>
                        <fieldset>
                            <legend>Configurações Smarters</legend>
                            <div className='forms'>
                                <label>Página de internet</label>
                                <input
                                    className='input'
                                    type="text"
                                    placeholder="Página de internet"
                                    name="websites"
                                    value={customerData.websites}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='forms'>
                                <label>E-mail</label>
                                <input
                                    className='input'
                                    type="email"
                                    placeholder="E-mail"
                                    name="email"
                                    value={customerData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='forms'>
                                <label>Descrição</label>
                                <input
                                    className='input'
                                    type="text"
                                    placeholder="descrição"
                                    name="description"
                                    value={customerData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className='forms'>
                                <label>Endereço</label>
                                <textarea
                                    placeholder="Endereço"
                                    name="address"
                                    value={customerData.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className='forms'>
                                <label>Vertical*</label>
                                <select
                                    name="vertical"
                                    value={customerData.vertical}
                                    onChange={handleInputChange}
                                >
                                    <option value="UNDEFINED">Undefined</option>
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
                                </select>
                            </div>
                            <div className='forms'>
                                <label>Access Token*</label>
                                <input
                                    className='input'
                                    type="text"
                                    placeholder="Access token"
                                    name="accessToken"
                                    value={customerData.accessToken}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div>
                    <button onClick={BackToHome} className='button-cancel'>Voltar</button>
                    {/*<button className='button'>Deletar</button>*/}
                    <button type="submit" className='button-save'>Salvar</button>
                </div>
            </form>
        </div>
    );
}

export default ChangeDeleteNumber;
