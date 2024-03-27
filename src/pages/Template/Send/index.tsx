import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useLocation } from "react-router-dom";
import { read, utils } from 'xlsx';
import { ToastContainer } from "react-toastify";
import { errorSheets } from "../../../Components/Toastify";

interface President {
    Name: string;
    Index: number;
}

export function SendTemplate() {
    const location = useLocation()
    const templateName = location.state.templateName
    const [clientNumber, setClientNumber] = useState<number | ''>('');
    const [fileData, setFileData] = useState<any[][]>([]);
    const [pres, setPres] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const f = await fetch("https://docs.google.com/spreadsheets/d/1TidzAIn4iNvlwgai4l8QcxhQSaUFd-iKLlgzCxiCh1g/edit?usp=sharing");
            const ab = await f.arrayBuffer();

            const wb = read(ab);

            const ws = wb.Sheets[wb.SheetNames[0]];
            const data: President[] = utils.sheet_to_json<President>(ws);

            setPres(data);
        })();
    }, []);

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
    // const handleSubmitList = async (dataTemplate: any) => {
    //     for (const customer of dataTemplate) {

    //         const indexLetters = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

    //         const params = {
    //             botId: "403",
    //             templateId: templateName,
    //             senderPhone: "5511953188171",
    //             dataClient: [
    //                 {
    //                     receiverPhone: `${customer.A}`,
    //                     variables: [] as string[]
    //                 }
    //             ]
    //         };
    //         for (let i = 0; i < 9; i++) {
    //             if (customer[indexLetters[i]]) {
    //                 params.dataClient[0].variables.push(customer[indexLetters[i]]);
    //             }
    //         }
    //         console.log(params)
    //         api.post('/whats/template/send', params)
    //             .then(resp => console.log(resp.data))
    //             .catch(error => console.log(error));
    //     }
    // };
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

    return (
        <div>
            <ToastContainer />
            <form onSubmit={handleSubmit}>
                <div>
                    <span>Nome do template: </span>
                    <input type="text" value={templateName} disabled />
                </div>
                <div>
                    <span>Número do cliente: </span>
                    <input
                        type="number"
                        value={clientNumber}
                        onChange={(event) => setClientNumber(event.target.valueAsNumber)}
                    />
                </div>
                <button type="submit">Enviar</button>
            </form>
            {/* <div>
                <table>
                    <thead>
                        <tr>
                            <th>Telefone</th>
                            <th>Variavel 1</th>
                            <th>Variavel 2</th>
                            <th>Variavel 3</th>
                            <th>Variavel 4</th>
                            <th>Variavel 5</th>
                            <th>Variavel 6</th>
                            <th>Variavel 7</th>
                            <th>Variavel 8</th>
                            <th>Variavel 9</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pres.map((row, index) => (
                            (index !== 0) &&
                            <tr key={index}>
                                <td>{row.A}</td>
                                <td>{row.B}</td>
                                <td>{row.C}</td>
                                <td>{row.D}</td>
                                <td>{row.E}</td>
                                <td>{row.F}</td>
                                <td>{row.G}</td>
                                <td>{row.H}</td>
                                <td>{row.I}</td>
                                <td>{row.J}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => handleSubmitList(pres)}>Enviar</button>
            </div> */}
            <div>
                <input type="file" onChange={handleFileUpload} />
                <table>
                    <thead>
                        <tr>
                            {fileData.length > 0 && fileData[0].map((cell, index) => (
                                <th key={index}>{cell}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
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
            <button onClick={() => handleSubmitListDataFile(fileData)}>Enviar</button>
        </div>
    );
};

export default SendTemplate;