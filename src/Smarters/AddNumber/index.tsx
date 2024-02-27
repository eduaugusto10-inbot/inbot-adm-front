import { useState } from 'react';
import { ICustomerData } from '../../types';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ToastContainer } from "react-toastify";
import { successMessageChange, errorMessage } from '../../Components/Toastify'


export function AddNumber() {

    const history = useNavigate();
    function BackToHome() {
        history("/");
    }
    const [newNumber, setNewNumber] = useState<ICustomerData>({
        number: '',
        client: '',
        description: '',
        accessToken: '',
        botId: 0,
        botToken: '',
        botServerType: '',
        address: '',
        email: '',
        vertical: '',
        websites: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setNewNumber(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        api.post('/whats', newNumber)
            .then(res => {
                console.log(res.status)
                successMessageChange();
                setTimeout(() => history("/"), 2000)
            })
            .catch(error => {
                errorMessage();
                console.log(error)
            })
    };

    return (
        <div>
            <ToastContainer />
            <form onSubmit={handleFormSubmit}>
                <div className='input-forms'>
                    <div className='left-side'>
                        <div className='forms'>
                            <label>Número do telefone</label>
                            <input
                                type="number"
                                placeholder="Número telefone"
                                name="number"
                                value={newNumber.number}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Nome do cliente</label>
                            <input
                                type="text"
                                placeholder="Nome do cliente"
                                name="client"
                                value={newNumber.client}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Observação</label>
                            <input
                                type="text"
                                placeholder="Descrição"
                                name="description"
                                value={newNumber.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Access Token</label>
                            <input
                                type="text"
                                placeholder="Access token"
                                name="accessToken"
                                value={newNumber.accessToken}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Bot ID</label>
                            <input
                                type="number"
                                placeholder="bot_id"
                                name="botId"
                                value={newNumber.botId}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Bot Token</label>
                            <input
                                type="text"
                                placeholder="bot token"
                                name="botToken"
                                value={newNumber.botToken}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className='rigth-side'>
                        <div className='forms'>
                            <label>Vertical</label>
                            <select
                                name="vertical"
                                value={newNumber.vertical}
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
                            <label>Endereço</label>
                            <textarea
                                placeholder="Endereço"
                                name="address"
                                value={newNumber.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Página de internet</label>
                            <input
                                type="text"
                                placeholder="Página de internet"
                                name="websites"
                                value={newNumber.websites}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>E-mail</label>
                            <input
                                type="text"
                                placeholder="E-mail"
                                name="email"
                                value={newNumber.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='forms'>
                            <label>Ambiente</label>
                            <select
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
                    </div>
                </div>
                <div>
                    <button onClick={BackToHome} className='button'>Voltar</button>
                    <button type="submit" className='button'>Salvar</button>
                </div>
            </form>
        </div>
    );
}

export default AddNumber;
