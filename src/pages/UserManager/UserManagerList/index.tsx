import React, { useEffect, useRef, useState } from "react";
import api from "../../../utils/api";
import './style.css'
import { adjustTime, adjustTimeWithout3Hour, mask } from "../../../utils/utils";
import { AccordionStateCreate } from "../../types";
import { months, years } from "../../../utils/textAux";
import { read, utils } from "xlsx";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { useSearchParams } from "react-router-dom";

export function UserManagerList() {

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";
    const now = new Date();
const [customers, setCustomers] = useState<any>([])
const [customFields, setCustomFields] = useState<any>([])
const [qtyCustomer, setQtyCustomer] = useState<number>(0)
const [editMode, setEditMode] = useState<Array<boolean>>(Array(customers.length).fill(false));
const [editedValues, setEditedValues] = useState<Array<any>>(Array(customers.length).fill({}));
const [fileName, setFileName] = useState('');
const [showValues, setShowValues] = useState<Boolean>(false)
const fileInputRef = useRef<HTMLInputElement>(null);
const [fileData, setFileData] = useState<any[][]>([]);
const [searchButton, setSearchButton] = useState<boolean>(false)
const [savedValues, setSavedValues] = useState([]);
const [loadFinished, setLoadFinished] = useState(true)
const [initDate, setInitDate] = useState({
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear()
})
const [finalDate, setFinalDate] = useState({
    day: now.getDate() + 1,
    month: now.getMonth() + 1,
    year: now.getFullYear()
})
const tableRef = useRef(null);
const [accordionState, setAccordionState] = useState<AccordionStateCreate>({
    config: true,
    header: false,
    body: false,
    footer: false,
    botao: false
});
  useEffect(() => {
    setSearchButton(false)
    api.get(`/customfields-parameters/${botId}`)
    .then(resp => {
        setCustomFields(resp.data.data)
    })
    api.get(`/customer-parameters/${botId}?initialDate=${initDate.year}-${initDate.month}-${initDate.day}&finalDate=${finalDate.year}-${finalDate.month}-${finalDate.day}`)
    .then(resp => {
        setCustomers(resp.data.data)
        setQtyCustomer(resp.data.data.length)
        setLoadFinished(true)
    })
  },[searchButton])

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

        const data = utils.sheet_to_json(ws, { header: 1 }) as any[][];
        setFileData(data);
    };

    reader.readAsBinaryString(file);
};

  useEffect(() => {
     if (fileInputRef.current) {
        setFileName(fileInputRef.current.value);
    }
  }, [fileName]);

     function qtyCustomerCounter(value:number){
       return value === 0 ? `${value} resultado encontrado` : 
              value > 1 ? `${value} resultados encontrados` : `${value} nenhum resultado encontrado`;
    }
  
    const toggleEditMode = (index: number) => {
        setEditMode(prevEditMode => {
          const newEditMode = [...prevEditMode];
          newEditMode[index] = !newEditMode[index];
          return newEditMode;
        });
      };

      const showXlsValues = () => {
       console.log(showValues)
        setShowValues(preState => !preState)
      }
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, fieldName: string) => {
        const newValue = event.target.value;
        setEditedValues(prevValues => {
          const newValues = [...prevValues];
          newValues[index] = { ...newValues[index], [fieldName]: newValue };
          return newValues;
        });
      };

      const handleSave = (index: number) => {
        setEditMode(prevEditMode => {
          const newEditMode = [...prevEditMode];
          newEditMode[index] = false;
          return newEditMode;
        });
      };

      const toggleAccordion = (key: keyof AccordionStateCreate) => {
        setAccordionState({
            config: false,
            header: false,
            body: false,
            footer: false,
            botao: false
        })
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const nameAndValue = (value: any ,field: any) => {
        let resp = '';
        for(let data of value){
            if(field === data.id){
                resp = data.value;
            }
        }
        return resp;
    }
  return (
    <div style={{backgroundColor:"#ebebeb", padding:"10px 100px 100px 100px"}}>
        <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width:"100%" }} className="title_2024">Gestão de Usuários</h1>
        <hr className="hr_color" />
        <div className="config-template" style={{width:"100%"}}>
        <div className="header-accordion gradient-background" style={{width:"100%", borderRadius: "20px" }} onClick={() => toggleAccordion('config')}>Adicionar Usuários</div>      
        <div>
            <input type="radio" id="addUsersType"/><span>Cadastrar usuários individualmente</span>
            <input type="radio" id="addUsersType"/><span>Upload de planilha de usuários</span>
            <button className="button-blue">Download</button>
            <div>
                <table className="table-2024" style={{margin:"20px"}}>
                    <thead>
                    <tr className="table-2024" style={{borderBottom: "0px"}}>
                        <th className="cells" style={{padding:"0px 50px 0px", borderRight:"1px solid #aaa"}}>Telefone</th>
                        <th className="cells">Nome</th>
                        {customFields.map((fields:any)=>(
                            <th className="cells">{fields.customName}</th>
                        ))}
                        <th className="cells">Status</th>
                        <th className="cells">Gerenciar</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding:"0px", margin:"0px"}} className="cells border-gray"><input type="text" style={{width:"90%", border:"none"}} /></td>
                            <td style={{ padding:"5px", margin:"0px"}} className="cells border-gray"><input type="text"  style={{width:"90%", border:"none"}}/></td>
                            {customFields.map(()=>(
                                <td className="cells border-gray" style={{ padding:"0px", margin:"0px"}}><input type="text"  style={{width:"90%", border:"none"}} /></td>
                            ))}
                            <td className="border-gray">
                                <select name="" id=""  style={{width:"90%", border:"none"}}>
                                    <option value="">Ativo</option>    
                                    <option value="">Inativo</option>    
                                </select></td>
                            <td className="border-gray">
                            <button onClick={() => handleSave(0)}>Save</button>
                    </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div> 
                <span className="color-text-label">Selecione o arquivo:</span>
                <div>
                    <input
                        type="file"
                        id="myFile"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <input type="text" value={fileName} disabled/>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="button-blue">Anexar</button>
                    <button type="button" onClick={showXlsValues} className="button-blue">Carregar</button>
            <div>
                <table className="table-2024" style={{margin:"20px"}}>
                    <thead>
                    <tr className="table-2024"  style={{borderBottom: "0px"}}>
                        <th className="cells" style={{padding:"0px 50px 0px", borderRight:"1px solid #aaa"}}>Telefone</th>
                        <th className="cells">Nome</th>
                        {customFields.map((fields:any)=>(
                            <th className="cells">{fields.customName}</th>
                        ))}
                        <th className="cells">Status</th>
                        <th className="cells">Gerenciar</th>
                    </tr>
                    </thead>
                    {showValues && <tbody style={{ backgroundColor: '#F9F9F9', fontSize: "12px" }}>
                        {fileData.length > 0 && fileData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} >
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}  className="border-gray"><span style={{fontSize: "12px" }}>{cell}</span></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>}
                </table>
            </div>
        </div>
            </div>
            <div style={{ flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end" }}>
                <button className="button-cancel" onClick={() => ""}>Cancelar</button>
                <button className="button-save" onClick={() => ""}>Salvar</button>
            </div>
        </div>
        <div className="header-accordion gradient-background" style={{width:"100%", borderRadius: "20px" }} onClick={() => toggleAccordion('config')}>Base de Usuários</div>                  
        <div style={{margin:"10px 20px", textAlign:"left"}}>
            <span className="color-text-label">Data de cadastro</span>
            <select value={initDate.day} onChange={e => setInitDate(prevState => ({...prevState,day: Number(e.target.value) }))} className="input-values litle-input" >
                {[...Array(31).keys()].map(i => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
                ))}
            </select>
            <select value={initDate.month} onChange={e => setInitDate(prevState => ({...prevState,month: Number(e.target.value) }))} className="input-values litle-input" >
                {months.map((month,key) =>(
                    <option value={key+1}>{month}</option>
                ))}
            </select>
            <select value={initDate.year} onChange={e => setInitDate(prevState => ({...prevState,year: Number(e.target.value) }))} className="input-values litle-input" >
                {years.map(year=>(
                    <option value={year}>{year}</option>
                ))}
            </select>
            <span>Até</span>
            <select value={finalDate.day} onChange={e => setFinalDate(prevState => ({...prevState,day: Number(e.target.value) }))} className="input-values litle-input">
                {[...Array(31).keys()].map(i => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
                ))}
            </select>
            <select value={finalDate.month} onChange={e => setFinalDate(prevState => ({...prevState,month: Number(e.target.value) }))} className="input-values litle-input" >
                {months.map((month,key) =>(
                    <option value={key+1}>{month}</option>
                ))}
            </select>
            <select value={finalDate.year} onChange={e => setFinalDate(prevState => ({...prevState,year: Number(e.target.value) }))} className="input-values litle-input" >
                {years.map(year=>(
                    <option value={year}>{year}</option>
                ))}
            </select>
            <button className="button-blue" onClick={() => {
                    setSearchButton(true)
                    setLoadFinished(false)
                }} 
                disabled={!loadFinished}>{loadFinished ? "Buscar" : <div className="in_loader"></div>}</button>
        </div>
        <div className="row-align" style={{marginBottom:"30px"}}>
            <span className="color-text-label" style={{padding:"0px 50px 0px 20px"}}>Status:</span>
            <div className="border_gradient" style={{marginRight:"10px"}} onClick={()=>""}><span className="number_button_gradient" style={{width: "80px",height:"25px",fontSize:"14px", borderRadius: "15px"}}>Todos</span></div>
            <div className="border_gradient" style={{marginRight:"10px"}} onClick={()=>""}><span className="number_button_gradient" style={{width: "80px",height:"25px",fontSize:"14px", borderRadius: "15px"}}>Ativos</span></div>
            <div className="border_gradient" onClick={()=>""}><span className="number_button_gradient" style={{width: "80px",height:"25px",fontSize:"14px", borderRadius: "15px"}}>Inativos</span></div>
        </div>
        <div className="row-align">
            <div className="column-align left-align" style={{marginLeft:"20px"}}>
                <span className="color-text-label">Filtrar por campo:</span>
                <select name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px"}}>
                    <option value="Escolha uma opção">Escolha uma opção</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Nome">Nome</option>
                    <option value="E-mail">E-mail</option>
                    {customFields.map((customField: any) => (
                        <option value={customField.id}>{customField.customName}</option>
                    ))}
                </select>
            </div>
            <div className="column-align left-align" style={{marginLeft:"50px"}}>
                <span className="color-text-label" style={{marginLeft:"10px"}}>Conteúdo do campo:</span>
                <input name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px"}}/>
            </div>
        </div>
        <hr className="hr_color" />
        <span className="color-text-label">{qtyCustomerCounter(qtyCustomer)}</span><span style={{fontSize:"12px", paddingLeft:"20px"}}>Ordenar por</span>
        <select name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px"}}>
            <option value="Escolha uma opção">Escolha uma opção</option>
            <option value="Telefone">Telefone</option>
            <option value="Nome">Nome</option>
            <option value="E-mail">E-mail</option>
            {customFields.map((customField: any) => (
                <option value="">{customField.customName}</option>
            ))}
        </select>
        <DownloadTableExcel
                    filename="users table"
                    sheet="users"
                    currentTableRef={tableRef.current}
                >

                   <button className="button-blue" style={{width:"150px"}}> Exportar excel </button>

                </DownloadTableExcel>
        <table className="table-2024 fixed-header-table" style={{marginTop:"20px"}} ref={tableRef}>
            <thead>
            <tr className="table-2024 border-bottom-zero">
                <th className="cells" style={{padding:"0px 50px 0px", borderRight:"1px solid #aaa"}}>Telefone</th>
                <th className="cells">Nome</th>
                {customFields.map((fields:any, key:any)=>(
                    <th key={key} className="cells">{fields.customName}</th>
                ))}
                <th className="cells">Data Cadastro</th>
                {/* <th className="cells">Status</th> */}
                <th className="cells">Gerenciar</th>
            </tr>
            </thead>
            <tbody>
                
            {customers.map((customer: any, index: number) => (
                <tr key={customer.id}
                style={{ border: '1px solid #0171BD', backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                    <td className="border-gray"><span style={{fontSize: "12px" }}>{editMode[index] ? <input type="text" value={editedValues[index]?.phone ?? customer.phone} onChange={(e) => handleChange(e, index, 'phone')}/> : mask(editedValues[index]?.phone ?? customer.phone)}</span></td>
                    <td className="cells border-gray"><span style={{fontSize: "12px" }}>{editMode[index] ? <input type="text" value={editedValues[index]?.name ?? customer.name} onChange={(e) => handleChange(e, index, 'name')}/> : editedValues[index]?.name ?? customer.name}</span></td>
                    {customFields.map((fields:any, key:any)=>(
                    <td className="border-gray" key={key}><span style={{fontSize: "12px" }}>{nameAndValue(customer.customFields, fields.id) ?? '--'}</span></td>
                ))}                    
                    <td className="border-gray"><span style={{fontSize:"12px"}}>{adjustTimeWithout3Hour(customer.createdAt)}</span></td>
                    <td className="border-gray">
                {editMode[index] ? (
                  <button onClick={() => handleSave(index)}>Save</button>
                ) : (
                  <button onClick={() => toggleEditMode(index)}>✎</button>
                )}
              </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    
  );
};

export default UserManagerList;