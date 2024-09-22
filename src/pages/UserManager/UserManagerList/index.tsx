import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import api from "../../../utils/api";
import './style.css'
import { adjustTimeWithout3Hour, checkDigitNine, isCellPhone, mask } from "../../../utils/utils";
import { AccordionUserManager, IFilterBtn } from "../../types";
import { months, years } from "../../../utils/textAux";
import { read, utils } from "xlsx";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import useModal from "../../../Components/Modal/useModal";
import Modal from "../../../Components/Modal";
import chevron from "../../../img/right-chevron.png"
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
const [loading, setLoading] = useState<boolean>(false)
const fileInputRef = useRef<HTMLInputElement>(null);
const [fileData, setFileData] = useState<any[][]>([]);
const [filterSelectedValue, setFilterSelectedValue] = useState("")
const [searchButton, setSearchButton] = useState<boolean>(false)
const [sortType, setSortType] = useState<string>("")
const [sortOrder, setOrderSort] = useState<string>("")
const [loadFinished, setLoadFinished] = useState(true)
const [filterSelected, setFilterSelected] = useState("")
const [isCustomFields, setIsCustomFields] = useState(false)
const [changeDateFilter, setChangeDateFilter] = useState<boolean>(false)
const [filtro, setFiltro] = useState<string>('');
const modalRef = useRef<HTMLDivElement>(null);
const [initDate, setInitDate] = useState({
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear()
})
const [finalDate, setFinalDate] = useState({
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear()
})
const tableRef = useRef(null);
const [accordionState, setAccordionState] = useState<AccordionUserManager>({
    new: false,
    base: false
});
const { isOpen, toggle } = useModal();
const [accordionTable, setAccordionTable] = useState<Boolean>(false)
const [textToModal, setTextToModal] = useState<string>("")
const [buttonA, setButtonA] = useState<string>("")
const [buttonB, setButtonB] = useState<string>("")
const [filtersBtn, setFiltersBtn] = useState<IFilterBtn>({
    status: {
        todos: true,
        ativos: true,
        inativos: true,
    }
});

const handleButtonName = (wichButton: string) => {
    if (wichButton === "Salvar") {
        setButtonA("Fechar")
        setButtonB("Salvar")
        setTextToModal("Você deseja salvar?")
        toggle();
    } else if (wichButton === "Sucesso") {
        setTextToModal("Salvo com sucesso!")
        setButtonA("Fechar")
        setButtonB("NaoExibir")
    }
}

const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
};

  useEffect(() => {
    const qtyDaysInit = getDaysInMonth(initDate.year, initDate.month)
    const qtyDaysFinal = getDaysInMonth(finalDate.year, finalDate.month)
    const finalDay = qtyDaysFinal < finalDate.day ? qtyDaysFinal : finalDate.day
    const initDay = qtyDaysFinal < initDate.day ? qtyDaysInit : initDate.day
    setSearchButton(false)
    api.get(`/customfields-parameters/${botId}`)
    .then(resp => {
        setCustomFields(resp.data.data)
    })
    api.get(`/customer-parameters/${botId}?initialDate=${initDate.year}-${initDate.month}-${initDay}&finalDate=${finalDate.year}-${finalDate.month}-${finalDay}`)
    .then(resp => {
        setCustomers(resp.data.data)
        setQtyCustomer(resp.data.data.length)
        setLoadFinished(true)
    })
  },[searchButton])

const saveCustomer = async (data: any) => {
    let access = ""
    let token = ""
    const baseUrl = "https://api.inbot.com.br/user-manager/v1"
    await api.get(`/customer-manager/access-key/${botId}`)
        .then(resp => access = resp.data.key)
    await api.post(`/token`,{botId: botId}, {headers:{"x-api-key": access}})
        .then(resp => token = resp.data.token)
    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${baseUrl}/customer`,
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
    },
        data : data
    };
    await axios.request(config).then((response: any) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error:any) => {
        console.log(error);
    });

}

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

        let data = utils.sheet_to_json(ws, { header: 1 }) as any[][];
        const updatedData = data.map((row, rowIndex) => {
            return row.map((value, colIndex) => {
                if (colIndex === 0) {
                    return isCellPhone(value.toString().replace(/\s+/g, '')) ? 
                        checkDigitNine(value.toString().replace(/\s+/g, '')) : 
                        value.toString().replace(/\s+/g, '');
                }
                return value;
            });
        });

        setFileData(updatedData);
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

      const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, fieldName: string) => {
        const newValue = event.target.value;
        console.log("editedValues" + JSON.stringify(editedValues))
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

      const toggleAccordion = (key: keyof AccordionUserManager) => {
        setAccordionState({
            new: false,
            base: false
        })
        setAccordionState(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const openModal = () => {
        handleButtonName("Salvar")
    }
    const handleButtonClick = (buttonId: string) => {
        if (buttonId === "Salvar") {
            createJson()
        } else if (buttonId === "Fechar") {
            toggle()
        } 
    };
    const createJson = async () => {        
        setLoading(true)
        const headers = ['phone', 'name', 'email'];
        customFields.map((fields:any)=>(
            headers.push(fields.id)
        ))
        const jsonData: any = []
        fileData.slice(1).map((row, rowIndex) => {

          const obj: any = {};
          const customFields: any = []
          row.forEach((cell, columnIndex) => {
            obj['botId'] = botId;
            if(columnIndex < 3) {
                obj[headers[columnIndex]] = cell; 
            }
            if(columnIndex < 3) {
                obj[headers[columnIndex]] = cell; 
            }
            if(columnIndex > 2){
                customFields.push({id : headers[columnIndex], value: cell})
            }
          });
          obj["customFields"] = customFields
          if(obj?.name) {
            jsonData.push(obj)
          }
        });
        // toggle();
        await Promise.all(jsonData.map(async (element: any) => {
            await saveCustomer(element);
        }));
        handleButtonName("Sucesso")
        setLoading(false)
    }
    const nameAndValue = (value: any ,field: any) => {
        let resp = '';
        for(let data of value){
            if(field === data.id){
                resp = data.value;
            }
        }
        return resp;
    }
     
    const handleStatusChange = (statusKey: keyof IFilterBtn['status']) => {
        setFiltersBtn({
            ...filtersBtn,
            status: {
                ...filtersBtn.status,
                [statusKey]: !filtersBtn.status[statusKey],
            },
        });
        setChangeDateFilter(previous => !previous)
    };
    const handleInitSort = (value: string, orderBy: string, isCustomFields: boolean) => {
        setSortType(value)
        setOrderSort(orderBy)
        setIsCustomFields(isCustomFields)
    }
    const handleSort = (outrosDadosFiltrados: any) => {
        const filteredItems = outrosDadosFiltrados.filter((item: any) => {
            const value = item[`${filterSelected}`] || '';
            return value.toString().toLowerCase().includes(filterSelectedValue);
          });
            const sortedItems = [...filteredItems];
            if(sortType === ""){
                return sortedItems;
            }
            console.log(filterSelected)

            if (sortOrder === "asc") {
                sortedItems.sort((a, b) => {
                  let valorA = a[sortType] !== undefined && a[sortType] !== null ? a[sortType] : 'Z';
                  let valorB = b[sortType] !== undefined && b[sortType] !== null ? b[sortType] : 'Z';
                    if(isCustomFields){
                        valorA = getCustomFieldValue(a, sortType);
                        valorB = getCustomFieldValue(b, sortType);
                    }
                  return valorA.localeCompare(valorB);
                });
              } else if (sortOrder === "desc") {
                sortedItems.sort((a, b) => {
                  let valorA = a[sortType] !== undefined && a[sortType] !== null ? a[sortType] : 'Z';
                  let valorB = b[sortType] !== undefined && b[sortType] !== null ? b[sortType] : 'Z';
                  if(isCustomFields){
                        valorA = getCustomFieldValue(a, sortType);
                        valorB = getCustomFieldValue(b, sortType);
                  }
                  return valorB.localeCompare(valorA);
                });
            }
            return sortedItems
    }

    const getCustomFieldValue = (item: any, customFieldId: string) => {
        const customField = item.customFields.find((field: { id: string; }) => field.id === customFieldId);
        return customField ? customField.value : "";
    };

    const handleMode = () => {
        setAccordionTable(!accordionTable)
        setFileData([])
    }

    const resetCustomerTabel = () => {
        setFileData([]);
        setFileName("")
    }
    const showNameAndValue = (customer: any, fields: any) => {
        const value = nameAndValue(customer.customFields, fields.id);
        return !value || value === "null" ? '--' : value;
    }
    const deleteCustomer = (hashId:string) => {
        api.delete(`/customer/${hashId}`)
    }
  return (
    <div className="column-align" style={{width:"100vw", height:"100vh",backgroundColor:"#ebebeb", padding:"10px 10px 0px 0px", alignItems:"center"}}>
        <Modal buttonA={buttonA} buttonB={buttonB} isOpen={isOpen} modalRef={modalRef} toggle={toggle} question={textToModal} onButtonClick={handleButtonClick}></Modal>
        <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width:"100%" }} className="title_2024">Gestão de Usuários</h1>
        <div className="column-align" style={{alignItems:"center", width:"100%"}}>
            <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
        </div>
        <div className="config-template" style={{width:"95%"}}>
        <div className={`accordion_head ${accordionState.new ? "accordion_head_opened" : ""}`} style={{width:"100%", borderRadius: "20px" }} onClick={() => toggleAccordion('new')}>Adicionar Usuários
            <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.new ?"-90deg" : "90deg"}} /></div>
        </div>      
        {accordionState.new && 
        <div style={{marginTop:"15px"}}>
            <input type="radio" id="addUsersType" onChange={handleMode} checked={accordionTable === true} disabled/><span style={{padding:"9px"}}>Cadastrar usuários individualmente</span>
            <input type="radio" id="addUsersType" onChange={handleMode} checked={accordionTable === false}/><span style={{padding:"9px"}}>Upload de planilha de usuários</span>
            <button className="button-blue">Download</button>
            {accordionTable &&
                <div className="column-align" style={{ padding:"20px" }}>
                <table className="table-2024 fixed-header-table" style={{ minWidth: "90%",flexShrink: "0" }}> 
                    <thead>
                    <tr className="cells table-2024 border-bottom-zero font-size-12">
                        <th className="cells">Telefone</th>
                        <th className="cells">Nome</th>
                        <th className="cells">E-mail</th>
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
            </div>}
            {!accordionTable &&
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
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="button-blue" style={{margin:"9px"}}>Anexar</button>
            <div className="column-align" style={{ padding:"20px" }}>
                <table className="table-2024 fixed-header-table" style={{ minWidth: "90%",flexShrink: "0" }}>
                    <thead>
                    <tr className="cells table-2024 border-bottom-zero font-size-12">
                        <th className="cells" style={{padding:"0px 50px 0px", borderRight:"1px solid #aaa"}}>Telefone</th>
                        <th className="cells">Nome</th>
                        <th className="cells">E-mail</th>
                        {customFields.map((fields:any)=>(
                            <th className="cells">{fields.customName}</th>
                        ))}
                        <th className="cells">Status</th>
                        <th className="cells">Gerenciar</th>
                    </tr>
                    </thead>
                    <tbody className="font-size-12" style={{ backgroundColor: '#F9F9F9' }}>
                        {fileData.length > 0 && fileData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} >
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}  className="border-gray"><span className="font-size-12">{cell}</span></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
            <div style={{ flexDirection: "row", textAlign: "end", alignContent: "end", alignItems: "end" }}>
                <button className="button-cancel" onClick={() => resetCustomerTabel()}>Cancelar</button>
                <button className="button-save" style={{ backgroundColor: loading ? "#c3c3c3" : "#5ed12c" }} onClick={() => openModal()}>{loading ? <div className="in_loader"></div> : "Salvar"}</button>
            </div>
            </div>}
        </div>}
            <div className={`accordion_head ${accordionState.base ? "accordion_head_opened" : ""}`} style={{width:"100%", borderRadius: "20px" }} onClick={() => toggleAccordion('base')}>Base de Usuários
                <div className="accordion_chevron"><img src={chevron} alt="" style={{rotate: accordionState.new ?"-90deg" : "90deg"}} /></div>
            </div>                  
            {accordionState.base && 
            <div>
                <div style={{margin:"10px 20px", textAlign:"left"}}>
                <span className="color-text-label">Data de cadastro: </span>
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
                <span style={{ color: "#002080", fontWeight:"bolder", margin:"0px 10px 0px 10px" }}>até</span>
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
            {/* <div className="row-align" style={{marginBottom:"30px", alignItems:"center"}}>
                <span className="color-text-label" style={{padding:"0px 50px 0px 20px"}}>Status:</span>
                <div className={filtersBtn.status.todos ? "border_gradient" : "border_gradient-gray"} onClick={()=>""} style={{marginRight:"15px", cursor:"pointer", marginLeft:"20px"}}><div className={filtersBtn.status.todos ? "number_button_gradient" : "number_button_gradient-gray"} onClick={() => handleStatusChange('todos')}>Todos</div></div>
                <div className={filtersBtn.status.ativos ? "border_gradient" : "border_gradient-gray"} onClick={()=>""} style={{marginRight:"15px", cursor:"pointer"}}><div className={filtersBtn.status.ativos ? "number_button_gradient" : "number_button_gradient-gray"} onClick={() => handleStatusChange('ativos')}>Ativos</div></div>
                <div className={filtersBtn.status.inativos ? "border_gradient" : "border_gradient-gray"} onClick={()=>""} style={{marginRight:"15px", cursor:"pointer"}}><div className={filtersBtn.status.inativos ? "number_button_gradient" : "number_button_gradient-gray"} onClick={() => handleStatusChange('inativos')}>Inativos</div></div>
            </div> */}
            <div className="row-align">
                <div className="column-align left-align" style={{marginLeft:"20px"}}>
                    <span className="color-text-label">Filtrar por campo:</span>
                    <select onChange={e => setFilterSelected(e.target.value)} name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px", marginLeft:"0px"}}>
                        <option value="Escolha uma opção">Escolha uma opção</option>
                        <option value="phone">Telefone</option>
                        <option value="name">Nome</option>
                        <option value="email">E-mail</option>
                        {customFields.map((customField: any) => (
                            <option value={customField.id}>{customField.customName}</option>
                        ))}
                    </select>
                </div>
                <div className="column-align left-align" style={{marginLeft:"50px"}}>
                    <span className="color-text-label" style={{marginLeft:"10px"}}>Conteúdo do campo:</span>
                    <input onChange={e => setFilterSelectedValue(e.target.value)} name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px"}}/>
                </div>
            </div>
            <div className="column-align" style={{alignItems:"center"}}>
                <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
            </div>
            <div className="row-align" style={{justifyContent: "space-between", margin:"10px 20px 0px 30px"}}>
                <span className="color-text-label font-size-12">{qtyCustomerCounter(qtyCustomer)}</span>
                <DownloadTableExcel
                    filename="users table"
                    sheet="users"
                    currentTableRef={tableRef.current}>
                        <button className="button-blue" style={{width:"150px", margin:"1px"}}> Exportar excel </button>
                </DownloadTableExcel>
            </div>
                    <div className="column-align" style={{ padding:"20px" }}>
            <table className="table-2024 fixed-header-table" style={{ minWidth: "90%",flexShrink: "0" }} ref={tableRef}>
                <thead>
                <tr className="cells table-2024 border-bottom-zero font-size-12">
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>Telefone</span> <div><div className="triangle-up" onClick={()=>handleInitSort("phone","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("phone","desc",false)}></div></div></div></th>
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>Nome</span> <div><div className="triangle-up" onClick={()=>handleInitSort("name","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("name","desc",false)}></div></div></div></th>
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>E-mail</span> <div><div className="triangle-up" onClick={()=>handleInitSort("name","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("name","desc",false)}></div></div></div></th>
                    {customFields.map((fields:any, key:any)=>(
                        <th key={key} className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>{fields.customName}</span> <div><div className="triangle-up" onClick={()=>handleInitSort(fields.id,"asc",true)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort(fields.id,"desc",true)}></div></div></div></th>
                    ))}
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>Data Cadastro</span> <div><div className="triangle-up" onClick={()=>handleInitSort("createdAt","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("createdAt","desc",false)}></div></div></div></th>
                    {/* <th className="cells">Status</th> */}
                    <th className="cells">Gerenciar</th>
                </tr>
                </thead>
                <tbody>
                    
                {handleSort(customers).map((customer: any, index: number) => (
                    <tr key={customer.id}
                    style={{ border: '1px solid #0171BD', backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                        <td className="border-gray"><span className="font-size-12">{editMode[index] ? <input type="text" value={editedValues[index]?.phone ?? customer.phone} onChange={(e) => handleChange(e, index, 'phone')}/> : mask(editedValues[index]?.phone ?? customer.phone)}</span></td>
                        <td className="cells border-gray"><span className="font-size-12">{editMode[index] ? <input type="text" value={editedValues[index]?.name ?? customer.name} onChange={(e) => handleChange(e, index, 'name')}/> : editedValues[index]?.name ?? customer.name}</span></td>
                        <td className="cells border-gray"><span className="font-size-12">{editMode[index] ? <input type="text" value={editedValues[index]?.email ?? customer.email} onChange={(e) => handleChange(e, index, 'email')}/> : editedValues[index]?.email ?? customer.email}</span></td>
                        {customFields.map((fields:any, key:any)=>(
                        <td className="border-gray" key={key}><span className="font-size-12">{editMode[index] ? <input type="text" value={editedValues[index]?.email ?? customer.email} onChange={(e) => handleChange(e, index, showNameAndValue(customer, fields))}/> :  showNameAndValue(customer, fields)}</span></td>
                    ))}                    
                        <td className="border-gray"><span style={{fontSize:"12px"}}>{adjustTimeWithout3Hour(customer.createdAt)}</span></td>
                        <td className="border-gray">
                    {/* {editMode[index] ? (
                        <div>
                            <button className="button-save" onClick={() => handleSave(index)}>Save</button>
                            <button className="button-cancel" onClick={() => handleSave(index)}>Cancelar</button>
                        </div>
                    ) : (
                        <div>
                            { <button className="button-blue" onClick={() => toggleEditMode(index)} disabled>Alterar</button> }
                            <button className="button-cancel" onClick={() => deleteCustomer(customer.id)}>Deletar</button>
                        </div>
                    )} */}
                </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            </div>}
        </div>
    </div>
    
  );
};

export default UserManagerList;