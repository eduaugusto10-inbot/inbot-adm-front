import React, { ChangeEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { read, utils } from "xlsx";
import { errorCampaingEmpty, errorSheets, errorTriggerMode, waitingMessage } from "../../../Components/Toastify";
import api from "../../../utils/api";
import { ToastContainer } from "react-toastify";
import './index.css'
import Alert from "../../../Components/Alert";
import { IListVariables, ITemplate, IVariables, templateValue } from "../../types";

interface AccordionState {
    config: boolean;
    recebidores: boolean;
    disparo: boolean;
    revisar: boolean;
}

export function Accordion() {

    const location = useLocation()
    const templateName = location.state.templateName
    const variableQty = location.state.variableQuantity
    const history = useNavigate();
    function BackToList() {
        history("/template-list")
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
    const [listVariables, setListVariables] = useState<IListVariables[]>([])
    const [template, setTemplate] = useState<ITemplate>(templateValue)
    const [triggerNames, setTriggerNames] = useState<any>([])
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        api.get(`https://webhooks.inbot.com.br/inbot-adm-back/v1/gateway/whatsapp/trigger-bot/403`)
            .then(resp => setTriggerNames(resp.data))
            .catch(error => console.log(error))
    }, [])

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
            }
        ]);
        setClientNumber("")
        setVariables([])
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

    const handleSubmitListDataFile = async (dataTemplate: any, campaignId: string) => {
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
                variable_9: listVariables[i]?.variable_9
            };
            console.log(params)
            api.post('/whats-customer', params)
                .then(resp => console.log(resp.data))
                .catch(error => console.log(error));
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
    const handleAddVariable = (id: number) => {
        if (variables.length < 8) {
            const newVariables: IVariables = {
                id: id,
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
    const handleCampaignName = (e: string) => {
        if (triggerNames !== undefined) {
            for (let i = 0; i < triggerNames?.data.length; i++) {
                if (triggerNames.data[i].campaign_name === e) {
                    setErrorMessage("O nome da campanha já existe!");
                } else {
                    setErrorMessage("");
                }
            }
        }
        setCampaignName(e);
    }
    const createTrigger = () => {
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
            "botId": 403,
            "phoneTrigger": "5511953188171"
        }

        // api.post('/whatsapp/trigger', data)
        //     .then(resp => {
        //         if (typeClient) {
        //             handleSubmitListDataFile(fileData, resp.data.data.insertId)
        //         } else {
        //             handleSubmitManualListData(resp.data.data.insertId)
        //         }
        //         console.log(resp.data.data.insertId)
        //         successCreateTrigger()
        //         setTimeout(() => history("/template-list"), 3000)
        //     })
        //     .catch(err => {
        //         errorMessage();
        //         console.log(err)
        //     })
    }
    if (variables.length < variableQty) {
        for (let i = 0; i < variableQty; i++) {
            handleAddVariable(i)
        }
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "50px" }}>
            <ToastContainer />
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69" }}>Envio de Campanhas</h1>
            <div style={{ width: "110%", border: "1px solid #000", marginBottom: "30px" }}></div>
            <div className="config-template">
                <div className="header-accordion" style={{ borderRadius: "20px 20px 0px 0px" }} onClick={() => toggleAccordion('config')}>1. Configuração</div>
                {accordionState.config &&
                    <div className="body line" style={{ display: "flex", justifyContent: "space-around", flexDirection: "row", alignContent: "center" }}>
                        <div>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <span className="span-title">Nome</span>
                                <input className="input-values" type="text" value={campaignName} onChange={e => handleCampaignName(e.target.value)} />
                            </div>
                            {errorMessage && <p style={{ color: 'red', fontSize:"10px", fontWeight:"bolder" }}>{errorMessage}</p>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Template </span>
                            <input type="text" value={templateName} className="input-values" disabled />
                        </div>
                    </div>}
            </div>
            <div className="config-recebidores" style={{ maxHeight: "680px" }}>
                <div className="header-accordion" onClick={() => toggleAccordion('recebidores')}>2. Cadastro dos Clientes</div>
                {accordionState.recebidores && <div className="body">
                    <div style={{ width: "90%" }}>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "90%" }}>
                            <span style={{ fontSize: "16px" }}>Clientes</span>
                            <span style={{ fontSize: "11px", fontStyle: "italic" }}>Adicione clientes que receberão os templates, poderá fazer upload de uma planilha ou inserir um número manualmente.</span>
                        </div>
                        <input type="radio" name="clientes" value="unico" onChange={signInClients} className="input-spaces" /><span>Manual</span>
                        <input type="radio" name="clientes" value="multiplos" onChange={signInClients} className="input-spaces" /><span>Carregar planilha</span>
                    </div>
                    {!typeClient &&
                        <div style={{ display: "flex", flexDirection: "column", width: "90%" }}>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <span className="span-title">Telefone </span>
                                <input
                                    className="input-values"
                                    type="number"
                                    value={clientNumber}
                                    onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                                />
                            </div>
                            <span className="span-title" style={{ marginTop: "10px", height: "50px" }}>Variáveis</span>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gridTemplateRows: 'repeat(4, auto)',
                                gap: '10px'
                            }}>
                                {variables.map((variable, index) => (
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", margin: "10px" }}>
                                        <span className="span-title-variables" >{index + 1}.  </span> <input value={variable.text} type="text" name={variable.id.toString()} id="" onChange={handleInputVariable} className="input-values" />
                                    </div>

                                ))
                                }
                                <button onClick={addCustomerToSendTemplate} style={{ fontSize: "12px", backgroundColor: "#0171BD", border: "1px solid #FFF", width: "120px", height: "30px", marginRight: "5px" }}>Adicionar cliente</button>
                            </div>
                            <div style={{ maxHeight: "400px", overflowY: 'auto', marginBottom: "10px" }}>
                                <table style={{ margin: "20px" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#0D5388', fontSize: "12px" }}>
                                            <th>Telefone</th>
                                            <th>Variável 1</th>
                                            <th>Variável 2</th>
                                            <th>Variável 3</th>
                                            <th>Variável 4</th>
                                            <th>Variável 5</th>
                                            <th>Variável 6</th>
                                            <th>Variável 7</th>
                                            <th>Variável 8</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ backgroundColor: '#F9F9F9', fontSize: "12px" }}>
                                        {listVariables.length > 0 && listVariables.map((unicVariable, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <th>{unicVariable.phone}</th>
                                                <th>{unicVariable.variable_1}</th>
                                                <th>{unicVariable.variable_2}</th>
                                                <th>{unicVariable.variable_3}</th>
                                                <th>{unicVariable.variable_4}</th>
                                                <th>{unicVariable.variable_5}</th>
                                                <th>{unicVariable.variable_6}</th>
                                                <th>{unicVariable.variable_7}</th>
                                                <th>{unicVariable.variable_8}</th>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                    {mode && <div style={{ display: "flex", flexDirection: "row" }}>
                        <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
                            <span className="span-title">Data</span>
                            <input type="date" onChange={e => setDate((e.target as HTMLInputElement).value)} className="input-values" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
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
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "90%" }}>
                        <span>Template: {templateName}</span>
                        <span>Telefone do disparo: {templateName}</span>
                        <span>Data e hora do disparo: {triggerMode}</span>
                    </div>
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