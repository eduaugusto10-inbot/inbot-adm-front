import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { read, utils } from "xlsx";
import { errorSheets } from "../../../Components/Toastify";
import api from "../../../utils/api";
import { ToastContainer } from "react-toastify";
import './index.css'
import Alert from "../../../Components/Alert";
interface President {
    Name: string;
    Index: number;
}

interface AccordionState {
    config: boolean;
    recebidores: boolean;
    disparo: boolean;
    revisar: boolean;
}

export function Accordion() {

    const location = useLocation()
    const templateName = location.state.templateName

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
                    botId: "403",
                    templateId: templateName,
                    senderPhone: "5511953188171",
                    dataClient: [
                        {
                            receiverPhone: `${customer[0]}`,
                            variables: [] as string[]
                        }
                    ]
                };
                for (let i = 1; i < 9; i++) {
                    if (customer[i]) {
                        params.dataClient[0].variables.push(customer[i].toString());
                    }
                }
                console.log(params)
                api.post('/whats/template/send', params)
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
        const value = e.target.value === "imediato"
        setMode(!value)
    }

    return (
        <div style={{display:"flex", flexDirection:"column", alignItems: "center", marginBottom: "50px"}}>
            <ToastContainer />
            <h1 style={{fontSize:"23px", fontWeight:"bolder", color:"#324d69"}}>Disparo do Template</h1>
            <div style={{width:"110%", border: "1px solid #000", marginBottom:"30px"}}></div>
            <div className="config-template">
                <div className="header-accordion" style={{borderRadius:"20px 20px 0px 0px"}} onClick={() => toggleAccordion('config')}>1. Configuração</div>
                {accordionState.config &&
                    <div className="body line" style={{ display: "flex", justifyContent: "space-around", flexDirection: "row", alignContent: "center" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Nome</span>
                            <input className="input-values" type="text" />
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
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
                            <input
                                className="input-values"
                                type="number"
                                value={clientNumber}
                                onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                            />
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
                            <input type="date" name="" id="" className="input-values" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <span className="span-title">Horário</span>
                            <input type="time" name="" id="" className="input-values" />
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
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }}>Cancelar</button>
                        <button style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }}>Salvar</button>
                    </div>

                </div>}
            </div>
        </div >
    );
}

export default Accordion;