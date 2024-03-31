import React, { ChangeEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { read, utils } from "xlsx";
import { errorMessage, errorSheets, successCreateTrigger, waitingMessage } from "../../../Components/Toastify";
import api from "../../../utils/api";
import { ToastContainer } from "react-toastify";
import './index.css'
import Alert from "../../../Components/Alert";
import { ITemplate, IVariables, templateValue } from "../../types";
import minus from '../../../img/minus.png';

interface AccordionState {
    config: boolean;
    recebidores: boolean;
    disparo: boolean;
    revisar: boolean;
}

export function Accordion() {

    const location = useLocation()
    const templateName = location.state.templateName
    const history = useNavigate();
    function BackToList() {
        history("/template/list")
    }

    const [accordionState, setAccordionState] = useState<AccordionState>({
        config: true,
        recebidores: false,
        disparo: false,
        revisar: false
    });
    const [fileData, setFileData] = useState<any[][]>([]);
    const [clientNumber, setClientNumber] = useState<number | ''>('');
    const [typeClient, setTypeClients] = useState<boolean>(false);
    const [mode, setMode] = useState<boolean>(false);
    const [triggerMode, setTriggerMode] = useState<string>("")
    const [campaignName, setCampaignName] = useState<string>("")
    const [dates, setDate] = useState<string>("")
    const [hours, setHours] = useState<string>("")
    const [variables, setVariables] = useState<IVariables[]>([])
    const [template, setTemplate] = useState<ITemplate>(templateValue)

    const toggleAccordion = (key: keyof AccordionState) => {
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target?.result as string;
            const wb = read(bstr, { type: 'binary' });

            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            const data = utils.sheet_to_json(ws, { header: 1 }) as any[][];
            setFileData(data);
        };

        reader.readAsBinaryString(file);
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
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = {
            botId: "403",
            templateId: templateName,
            senderPhone: "5511953188171",
            dataClient: [
                {
                    receiverPhone: `${clientNumber}`
                }
            ]
        }
        await api.post('/whats/template/send', params)
            .then(resp => console.log(resp))
            .catch(error => console.log(error))
    };

    const handleSubmitListDataFile = async (dataTemplate: any) => {
        let count = 0;
        let sheets = false;
        for (let i = 1; i < dataTemplate.length; i++) {
            if (dataTemplate[i].length > 0 && isNaN(dataTemplate[i][0])) {
                console.log(dataTemplate[i][0])
                sheets = true;
            }
        }
        if (sheets) {
            errorSheets()
            return;
        }
        for (const customer of dataTemplate) {
            if (count > 0 && customer.length > 0) {
                const params = {
                    campaignId: "403",
                    phone: `${customer[0]}`,
                    status:"aguardando",
                    variable_1: customer[1],
                    variable_2: customer[2],
                    variable_3: customer[3],
                    variable_4: customer[4],
                    variable_5: customer[5],
                    variable_6: customer[6],
                    variable_7: customer[7],
                    variable_8: customer[8],
                    variable_9: customer[9]
                };
                console.log(params)
                api.post('/whats-customer', params)
                    .then(resp => console.log(resp.data))
                    .catch(error => console.log(error));
            }
            count++;
        }
    };

    const signInClients = (e: any) => {
        const value = e.target.value === "unico"
        setTypeClients(!value)
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

    const createTrigger = () => {
        waitingMessage();
        handleSubmitListDataFile(fileData)
        const data = {
            "campaignName": campaignName,
            "templateName": templateName,
            "typeTrigger": triggerMode,
            "timeTrigger": `${dates} ${hours}`,
            "status": "aguardando",
            "botId": 1,
            "phoneTrigger": "5511999113863"
        }

        api.post('/whatsapp/trigger', data)
            .then(resp => {
                successCreateTrigger()
                console.log(resp)
            })
            .catch(err => {
                errorMessage();
                console.log(err)
            })
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "50px" }}>
            <ToastContainer />
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69" }}>Disparo do Template</h1>
            <div style={{ width: "110%", border: "1px solid #000", marginBottom: "30px" }}></div>
            <div className="config-template">
                <div className="header-accordion" style={{ borderRadius: "20px 20px 0px 0px" }} onClick={() => toggleAccordion('config')}>1. Configuração</div>
                {accordionState.config &&
                    <div className="body line" style={{ display: "flex", justifyContent: "space-around", flexDirection: "row", alignContent: "center" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Nome</span>
                            <input className="input-values" type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Template </span>
                            <input type="text" value={templateName} className="input-values" disabled />
                        </div>
                    </div>}
            </div>
            <div className="config-recebidores" style={{ maxHeight: "600px" }}>
                <div className="header-accordion" onClick={() => toggleAccordion('recebidores')}>2. Cadastro dos Clientes</div>
                {accordionState.recebidores && <div className="body">
                    <div>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                            <span style={{ fontSize: "16px" }}>Clientes</span>
                            <span style={{ fontSize: "11px", fontStyle: "italic" }}>Adicione clientes que receberão os templates, poderá fazer upload de uma planilha ou inserir um número manualmente.</span>
                        </div>
                        <input type="radio" name="clientes" value="unico" onChange={signInClients} className="input-spaces" /><span>Único</span>
                        <input type="radio" name="clientes" value="multiplos" onChange={signInClients} className="input-spaces" /><span>Múltiplos</span>
                    </div>
                    {!typeClient &&
                        <div>
                            <span className="span-title">Telefone </span>
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <span>Variáveis</span>
                            <div>
                                <button onClick={handleAddVariable} style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "70px", height: "30px", marginRight: "5px" }}>Adicionar</button>
                            </div>

                            {variables.map((variable, index) => (
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                    <span className="span-title">{index + 1}.  </span> <input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} className="input-values" /><img src={minus} alt="minus" width={20} height={20} style={{ cursor: "pointer" }} onClick={() => handleDeleteVariables(variable.id)} />
                                </div>

                            ))
                            }
                            <Alert message={"Você deverá preencher as variáveis para que não ocorra erro no envio"} />
                        </div>}
                    {typeClient &&
                        <div>
                            <input type="file" onChange={handleFileUpload} style={{ backgroundColor: "#0D5388", color: "#FFF", borderRadius: "20px" }} />
                            <div style={{ maxHeight: "400px", overflowY: 'auto', marginBottom: "10px" }}>
                                <table style={{ margin: "20px" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#0D5388', fontSize: "12px" }}>
                                            {fileData.length > 0 && fileData[0].map((cell, index) => (
                                                <th key={index}>{cell}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody style={{ backgroundColor: '#F9F9F9', fontSize: "12px" }}>
                                        {fileData.length > 0 && fileData.slice(1).map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>}
                </div>}
            </div>
            <div className="modo-disparo">
                <div className="header-accordion" onClick={() => toggleAccordion('disparo')}>3. Modo de Disparo</div>
                {accordionState.disparo && <div className="body">
                    <div className="line">
                        <input type="radio" name="disparo" value="imediato" onChange={handleMode} className="input-spaces" /><span>Imediato</span>
                        <input type="radio" name="disparo" value="agendado" onChange={handleMode} className="input-spaces" /><span>Agendado</span>
                    </div>
                    {mode && <div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Data</span>
                            <input type="date" onChange={e => setDate((e.target as HTMLInputElement).value)} className="input-values" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Horário</span>
                            <input type="time" onChange={e => setHours((e.target as HTMLInputElement).value)} className="input-values" />
                        </div>
                    </div>}
                    {!mode && <div>
                        <Alert message="Neste modo, após salvar a campanha, o disparo começará a ser realizado, não podendo ser cancelado." />
                    </div>}
                </div>}
            </div>
            <div className="revisar">
                <div className="header-accordion" onClick={() => toggleAccordion('revisar')}>4. Resumo e salvar</div>
                {accordionState.revisar && <div className="body">
                    <span style={{ fontSize: "20px" }}>Resumo</span>
                    <span>Template: {templateName}</span>
                    <span>Telefone do disparo: {templateName}</span>
                    <span>Data e hora do disparo: {templateName}</span>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "100%" }}>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={BackToList}>Cancelar</button>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} onClick={createTrigger}>Salvar</button>
                    </div>

                </div>}
            </div>
        </div >
    );
}

export default Accordion;