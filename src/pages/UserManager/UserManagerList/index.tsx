import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import api from "../../../utils/api";
import './style.css'
import { adjustTimeWithout3Hour, checkDigitNine, isCellPhone, mask } from "../../../utils/utils";
import { AccordionUserManager, IFilterBtn } from "../../types";
import { months, years } from "../../../utils/textAux";
import { read, utils } from "xlsx";
import {dateExcelConverter} from '../../../utils/utils'
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import useModal from "../../../Components/Modal/useModal";
import Modal from "../../../Components/Modal";
import chevron from "../../../img/right-chevron.png";
import  {validatedUser}  from "../../../utils/validateUser";
import trash from '../../../img/trash-solid.svg'
import pencil from '../../../img/pencil.svg'
import { ToastContainer } from "react-toastify";
import { successMessageDefault, errorMessageDefault, waitingMessage} from "../../../Components/Toastify";
import inbotApi from "../../../utils/apiInbot";
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
const [updateIndex, setUpdateIndex] = useState<number>(9999)
const [deleteIndex, setDeleteIndex] = useState<string>('')
const [hashIdSelected, setHashIdSelected] = useState<string>("")
const [text, setText] = useState<string>("")
const [warning, setWarning] = useState<boolean>(true)
const [checkActivated, setCheckActivated] = useState<boolean>(false)
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
const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false)
const [advancedFilters, setAdvancedFilters] = useState<Array<{column: string, value: string}>>([])
const modalRef = useRef<HTMLDivElement>(null);
const isSearching = useRef<boolean>(false);
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
        setText("Escolha uma opção para continuar.")
        toggle();
    } else if (wichButton === "Sucesso") {
        setTextToModal("Salvo com sucesso!")
        setButtonA("Fechar")
        setText("Clique no botão para continuar")
        setButtonB("NaoExibir")
    } else if (wichButton === "Alterar") {
        setTextToModal("Deseja confirmar alterações?")
        setButtonA("Fechar")
        setButtonB("Sim")
        setWarning(false)
        setText("")
        toggle()
    } else if (wichButton === "Deletar") {
        setTextToModal("Deseja deletar o usuário?")
        setButtonA("Deletar")
        setButtonB("Fechar")
        setText("Esta ação não poderá ser desfeita.")
        toggle()
    }
}

    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month, 0).getDate();
    };

  useEffect(() => {
    const getData = async () => {
    if (!searchButton) return;
    
    if (isSearching.current) return;
    isSearching.current = true;
    
    const qtyDaysInit = getDaysInMonth(initDate.year, initDate.month)
    const qtyDaysFinal = getDaysInMonth(finalDate.year, finalDate.month)
    const finalDay = qtyDaysFinal < finalDate.day ? qtyDaysFinal : finalDate.day
    const initDay = qtyDaysFinal < initDate.day ? qtyDaysInit : initDate.day
    
    const resp:any = await inbotApi.get(`/customfields`)
        setCustomFields(resp)
    const initialDate = `${initDate.year}-${String(initDate.month).padStart(2, '0')}-${String(initDay).padStart(2, '0')}`;
    const lastDate = `${finalDate.year}-${String(finalDate.month).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
    inbotApi.get(`/customermanager?initialDate=${initialDate}&finalDate=${lastDate}&limit=1000`)
    .then((resp:any) => {
        setCustomers(resp)
        setQtyCustomer(resp.length)
        setLoadFinished(true)
        setSearchButton(false)
        isSearching.current = false;
    })
    .catch(error => {
        console.error(error);
        setLoadFinished(true)
        setSearchButton(false)
        isSearching.current = false;
    })
}
getData()
},[searchButton])

  useEffect(() => {
    const getData = async () => {
    const qtyDaysInit = getDaysInMonth(initDate.year, initDate.month)
    const qtyDaysFinal = getDaysInMonth(finalDate.year, finalDate.month)
    const finalDay = qtyDaysFinal < finalDate.day ? qtyDaysFinal : finalDate.day
    const initDay = qtyDaysFinal < initDate.day ? qtyDaysInit : initDate.day
    inbotApi.setBotId(Number(botId));
    const resp:any = await inbotApi.get(`/customfields`)
    setCustomFields(resp)
    const initialDate = `${initDate.year}-${String(initDate.month).padStart(2, '0')}-${String(initDay).padStart(2, '0')}`;
    const lastDate = `${finalDate.year}-${String(finalDate.month).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
    inbotApi.get(`/customermanager?initialDate=${initialDate}&finalDate=${lastDate}&limit=1000`)
    .then((resp:any) => {
        setCustomers(resp)
        setQtyCustomer(resp.length)
    })
    .catch(error => {
        console.error(error);
    })
}
getData()
},[])

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
    await axios.request(config)
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
                if(customFields[colIndex - 3]?.type === "data"){
                    return dateExcelConverter(value)
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

      const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number, fieldName: string) => {
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
        setEditedValues([])
      };

      const updateCustomer = async(index: number) => {
        waitingMessage()
        let customerEdited = handleSort(customers)[index];
        const VALUES: string[] = ['name','phone','email','activated']
        
        // Create a copy of the customer's custom fields
        const updatedCustomFields = [...customerEdited.customFields];
        
        for (const elementName of Object.keys(editedValues[0] || {})){
            if(VALUES.includes(elementName)){
                customerEdited[elementName] = editedValues[0][elementName];
            } else {
                // Find and update the custom field
                const customFieldIndex = updatedCustomFields.findIndex(
                    cf => cf.customFieldId === elementName
                );
                
                if(customFieldIndex !== -1) {
                    updatedCustomFields[customFieldIndex].value = editedValues[0][elementName];
                } else {
                    // If the custom field doesn't exist yet, add it
                    updatedCustomFields.push({
                        customFieldId: elementName,
                        value: editedValues[0][elementName]
                    });
                }
            }
        }
        
        // Update the customer's custom fields
        customerEdited.customFields = updatedCustomFields;
        
        // Format the data according to the required structure
        const requestData = {
            name: customerEdited.name,
            phone: customerEdited.phone,
            email: customerEdited.email,
            customFields: updatedCustomFields.map(field => ({
                customFieldId: Number(field.customFieldId || field.id),
                value: field.value
            }))
        };
        
        customerEdited.botId = botId;
        inbotApi.setBotId(Number(botId));
        await inbotApi.patch(`/customerManager/customerId/${customerEdited.id}`, requestData)
        .then(() => {
            setEditedValues([])
            handleSave(index)
            setSearchButton(previous => !previous)
            successMessageDefault("Usuário atualizado com sucesso")
        })
        .catch((error:any) => {
            errorMessageDefault("Erro ao atualizar o usuário")
            console.log(error);
        });
        
      }

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

    const openModal = (text: string) => {
        handleButtonName(text)
    }
    const openUpdateModal = (text: string, index: number) => {
        setUpdateIndex(index)
        handleButtonName(text)
    }
    const openDeletarModal = (text: string, index: string) => {
        setDeleteIndex(index)
        handleButtonName(text)
    }
    const handleButtonClick = (buttonId: string) => {
        if (buttonId === "Salvar") {
            createJson()
        } else if (buttonId === "Fechar") {
            toggle()
        } else if (buttonId === "Sim") {
            updateCustomer(updateIndex);
            toggle();
        } else if (buttonId === "Deletar") {
            deleteCustomer(deleteIndex);
            toggle();
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
        await Promise.all(jsonData.map(async (element: any) => {
            await saveCustomer(element);
        }));
        handleButtonName("Sucesso")
        setLoading(false)
    }
    const nameAndValue = (value: any ,field: any) => {
        let resp = '';
        if(value && value.length > 0){
            for(let data of value){
                if(field === data.id){
                    resp = data.value;
                }
                if(field === data.customFieldId){
                    resp = data.value;
                }
            }
        }
        if (resp === '') {
            for (let data of value) {
              if (data.hasOwnProperty(field)) {
                resp = data[field];
                break;
              }
            }
          }
        return resp;
    }
     
    const handleInitSort = (value: string, orderBy: string, isCustomFields: boolean) => {
        setSortType(value)
        setOrderSort(orderBy)
        setIsCustomFields(isCustomFields)
    }
    const handleSort = (outrosDadosFiltrados: any) => {
        let filteredItems = outrosDadosFiltrados.filter((item: any) => {
            // Filtro básico
            const basicFilterValid = filterSelected === "" || 
                (item[`${filterSelected}`] && item[`${filterSelected}`].toString().toLowerCase().includes(filterSelectedValue.toLowerCase()));
            
            // Filtro por status (ativo/inativo)
            const statusFilterValid = !checkActivated || item.activated === 1;
            
            // Filtros avançados
            let advancedFiltersValid = true;
            if (advancedFilters.length > 0) {
                advancedFiltersValid = advancedFilters.every(filter => {
                    if (filter.column === "" || filter.value === "") return true;
                    
                    // Verificar se é um campo customizado
                    if (customFields.some((cf: any) => cf.id === filter.column)) {
                        return getCustomFieldValue(item, filter.column).toLowerCase().includes(filter.value.toLowerCase());
                    }
                    
                    // Campo padrão
                    return item[filter.column] && item[filter.column].toString().toLowerCase().includes(filter.value.toLowerCase());
                });
            }
            
            return basicFilterValid && statusFilterValid && advancedFiltersValid;
        });
    
        if (checkActivated) {
            filteredItems = filteredItems.filter((item: any) => item.activated === 1);
        }
    
        const sortedItems = [...filteredItems];
    
        if (sortType === "") {
            return sortedItems;
        }
    
        if (sortOrder === "asc") {
            sortedItems.sort((a, b) => {
                let valorA = a[sortType] !== undefined && a[sortType] !== null ? a[sortType] : 'Z';
                let valorB = b[sortType] !== undefined && b[sortType] !== null ? b[sortType] : 'Z';
                if (isCustomFields) {
                    valorA = getCustomFieldValue(a, sortType);
                    valorB = getCustomFieldValue(b, sortType);
                }
                return valorA.localeCompare(valorB);
            });
        } else if (sortOrder === "desc") {
            sortedItems.sort((a, b) => {
                let valorA = a[sortType] !== undefined && a[sortType] !== null ? a[sortType] : 'Z';
                let valorB = b[sortType] !== undefined && b[sortType] !== null ? b[sortType] : 'Z';
                if (isCustomFields) {
                    valorA = getCustomFieldValue(a, sortType);
                    valorB = getCustomFieldValue(b, sortType);
                }
                return valorB.localeCompare(valorA);
            });
        }
        return sortedItems;
    };
    

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
    const showNameAndValue = (customer: any, fields: any, hasCustomField: boolean) => {
        let value = "";
        if(!hasCustomField){
            value = nameAndValue(customer, fields.id);
        }else {
            value = nameAndValue(customer.customFields, fields.id);
        }
        return value === "null" ? ' ' : value;
    }
    const hasShowNameAndValue = (customer: any, fields: any, hasCustomField: boolean) => {
        if(!customer || customer.length === 0) return false;
        
        // For custom fields, check if the field exists in editedValues
        if(hasCustomField) {
            return customer[0] && fields.id in customer[0];
        }
        
        // For standard fields
        if(customer[0]) {
            return fields in customer[0];
        }
        
        return false;
    }
    const deleteCustomer = async (customerId:string) => {
        waitingMessage()
        inbotApi.delete(`/customerManager/customerId/${customerId}`)
        .then(()=> {
            successMessageDefault("Usuário deletado com sucesso")
            setSearchButton(previous => !previous)
        })
    }

    // Função para adicionar um novo filtro avançado
    const addAdvancedFilter = () => {
        setAdvancedFilters([...advancedFilters, {column: "", value: ""}]);
    };

    // Função para remover um filtro avançado
    const removeAdvancedFilter = (index: number) => {
        const newFilters = [...advancedFilters];
        newFilters.splice(index, 1);
        setAdvancedFilters(newFilters);
    };

    // Função para atualizar um filtro avançado
    const updateAdvancedFilter = (index: number, field: 'column' | 'value', value: string) => {
        const newFilters = [...advancedFilters];
        newFilters[index][field] = value;
        setAdvancedFilters(newFilters);
    };

    // Função para limpar todos os filtros avançados
    const clearAdvancedFilters = () => {
        setAdvancedFilters([]);
    };

    // Função para obter todas as colunas disponíveis (padrão + customizadas)
    const getAllColumns = () => {
        const standardColumns = [
            {id: "id", label: "ID"},
            {id: "phone", label: "Telefone"},
            {id: "name", label: "Nome"},
            {id: "email", label: "E-mail"},
            {id: "createdAt", label: "Data Cadastro"},
            {id: "activated", label: "Status"}
        ];
        
        const customFieldColumns = customFields.map((field: any) => ({
            id: field.id,
            label: field.customName
        }));
        
        return [...standardColumns, ...customFieldColumns];
    };

  return (
    <div className="column-align" style={{width:"100vw", height:"100vh",backgroundColor:"#ebebeb", padding:"10px 10px 0px 0px", alignItems:"center"}}>
        <ToastContainer />
        <Modal buttonA={buttonA} buttonB={buttonB} text={text} isOpen={isOpen} modalRef={modalRef} toggle={toggle} question={textToModal} warning={warning} onButtonClick={handleButtonClick}></Modal>
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
                <div className="column-align" style={{ padding:"20px", overflowX:'auto', overflowY:"auto", maxHeight:"100vh" }}>
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
            <div className="column-align" style={{ padding:"20px", overflowX:'auto', overflowY:"auto", maxHeight:"100vh" }}>
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
                <button className="button-save" style={{ backgroundColor: loading ? "#c3c3c3" : "#5ed12c" }} onClick={() => openModal("Salvar")}>{loading ? <div className="in_loader"></div> : "Salvar"}</button>
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
                    if (!isSearching.current) {
                        setSearchButton(true)
                        setLoadFinished(false)
                    }
                }} 
                    disabled={!loadFinished}>{loadFinished ? "Buscar" : <div className="in_loader"></div>}</button>
            </div>
            <div className="row-align">
                <div className="column-align left-align" style={{marginLeft:"20px"}}>
                    <span className="color-text-label">Filtrar por campo:</span>
                    <select onChange={e => setFilterSelected(e.target.value)} name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px", marginLeft:"0px"}}>
                        <option value="">Escolha uma opção</option>
                        <option value="phone">Telefone</option>
                        <option value="name">Nome</option>
                        <option value="email">E-mail</option>
                        {customFields.map((customField: any) => (
                            <option key={customField.id} value={customField.id}>{customField.customName}</option>
                        ))}
                    </select>
                    <div className="row-align" style={{alignContent:"center"}}>
                        <span className="color-text-label">Exibir somente usuários ativos:</span>
                        <input
                            onChange={(e) => setCheckActivated(e.target.checked)}
                            style={{ marginLeft: "10px", marginTop:"2px" }}
                            type="checkbox"
                        />
                    </div>
                </div>
                <div className="column-align left-align" style={{marginLeft:"50px"}}>
                    <span className="color-text-label" style={{marginLeft:"10px"}}>Conteúdo do campo:</span>
                    <input onChange={e => setFilterSelectedValue(e.target.value)} name="" id="" className="input-values" style={{border:"none", height:"30px", width:"300px"}}/>
                </div>
            </div>
            
            {/* Botão para mostrar/ocultar filtros avançados */}
            <div className="row-align" style={{justifyContent: "flex-end", margin: "10px 20px"}}>
                <button 
                    className="button-blue" 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    style={{width: "auto", padding: "5px 15px"}}
                >
                    {showAdvancedFilters ? "Ocultar filtros avançados" : "Mostrar filtros avançados"}
                </button>
            </div>
            
            {/* Seção de filtros avançados */}
            {showAdvancedFilters && (
                <div className="column-align" style={{margin: "10px 20px", border: "1px solid #ddd", padding: "15px", borderRadius: "10px", backgroundColor: "#f9f9f9"}}>
                    <div className="row-align" style={{justifyContent: "space-between", width: "100%", marginBottom: "10px"}}>
                        <span className="color-text-label" style={{fontWeight: "bold", fontSize: "16px"}}>Filtros Avançados</span>
                        <div>
                            <button 
                                className="button-blue" 
                                onClick={addAdvancedFilter}
                                style={{marginRight: "10px", padding: "5px 10px"}}
                            >
                                Adicionar filtro
                            </button>
                            {advancedFilters.length > 0 && (
                                <button 
                                    className="button-cancel" 
                                    onClick={clearAdvancedFilters}
                                    style={{padding: "5px 10px"}}
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {advancedFilters.length === 0 ? (
                        <div style={{margin: "10px 0", color: "#666"}}>
                            Nenhum filtro avançado adicionado. Clique em "Adicionar filtro" para começar.
                        </div>
                    ) : (
                        advancedFilters.map((filter, index) => (
                            <div key={index} className="row-align" style={{margin: "10px 0", width: "100%", alignItems: "center"}}>
                                <select 
                                    value={filter.column} 
                                    onChange={(e) => updateAdvancedFilter(index, 'column', e.target.value)}
                                    className="input-values"
                                    style={{width: "250px", marginRight: "10px"}}
                                >
                                    <option value="">Selecione uma coluna</option>
                                    {getAllColumns().map(column => (
                                        <option key={column.id} value={column.id}>{column.label}</option>
                                    ))}
                                </select>
                                <input 
                                    type="text" 
                                    value={filter.value} 
                                    onChange={(e) => updateAdvancedFilter(index, 'value', e.target.value)}
                                    placeholder="Valor do filtro"
                                    className="input-values"
                                    style={{width: "300px", marginRight: "10px"}}
                                />
                                <button 
                                    onClick={() => removeAdvancedFilter(index)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        color: "#d9534f",
                                        fontSize: "18px"
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
            
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
                    <div className="column-align" style={{ padding:"20px", overflowX:'auto', overflowY:"auto", maxHeight:"100vh" }}>
            <table className="table-2024 fixed-header-table" style={{ minWidth: "90%",flexShrink: "0" }} ref={tableRef}>
                <thead>
                <tr className="cells table-2024 border-bottom-zero font-size-12">
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>ID</span> <div><div className="triangle-up" onClick={()=>handleInitSort("phone","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("phone","desc",false)}></div></div></div></th>
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>Telefone</span> <div><div className="triangle-up" onClick={()=>handleInitSort("phone","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("phone","desc",false)}></div></div></div></th>
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>Nome</span> <div><div className="triangle-up" onClick={()=>handleInitSort("name","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("name","desc",false)}></div></div></div></th>
                    <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>E-mail</span> <div><div className="triangle-up" onClick={()=>handleInitSort("name","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("name","desc",false)}></div></div></div></th>
                    {customFields.map((fields:any, key:any)=>(
                        <th key={key} className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>{fields.customName}</span> <div><div className="triangle-up" onClick={()=>handleInitSort(fields.id,"asc",true)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort(fields.id,"desc",true)}></div></div></div></th>
                    ))}     
                        <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span style={{padding:"0px 15px"}}>Data Cadastro</span> <div><div className="triangle-up" onClick={()=>handleInitSort("createdAt","asc",false)}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("createdAt","desc",false)}></div></div></div></th>
                        <th className="cells">Status</th>
                        <th className="cells">Gerenciar</th>
                    </tr>
                </thead>
                <tbody>
                    
                {handleSort(customers).map((customer: any, index: number) => (
                    <tr key={customer.id}
                    style={{ border: '1px solid #0171BD', backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                        <td className="border-gray"><span className="font-size-12">{customer.id}</span></td>
                        <td className="border-gray"><span className="font-size-12">{editMode[index] ? <input type="text" className="input-values" style={{width:"95%"}} value={editMode[index] && hasShowNameAndValue(editedValues, 'phone', false) ? editedValues[0]?.phone : customer.phone} onChange={(e) => handleChange(e, 0, 'phone')}/> : mask(customer.phone)}</span></td>
                        <td className="cells border-gray"><span className="font-size-12">{editMode[index] ? <input type="text" className="input-values" style={{width:"95%"}} value={editMode[index] && hasShowNameAndValue(editedValues, 'name', false) ? editedValues[0]?.name : customer.name} onChange={(e) => handleChange(e, 0, 'name')}/> : customer.name}</span></td>
                        <td className="cells border-gray"><span className="font-size-12">{editMode[index] ? <input type="text" className="input-values" style={{width:"95%"}} value={editMode[index] && hasShowNameAndValue(editedValues, 'email', false) ? editedValues[0]?.email : customer.email} onChange={(e) => handleChange(e, 0, 'email')}/> : customer.email}</span></td>
                        {customFields.map((fields:any, key:any)=>(
                        <td className="border-gray" key={key}><span className="font-size-12">{editMode[index] ? <input type="text" className="input-values" style={{width:"95%"}} value={editMode[index] && editedValues[0] && editedValues[0][fields.id] !== undefined ? editedValues[0][fields.id] : showNameAndValue(customer, fields, true)} onChange={(e) => handleChange(e, 0, fields.id)}/> :  showNameAndValue(customer, fields, true)}</span></td>
                    ))}     
                        <td className="border-gray"><span style={{fontSize:"12px"}}>{adjustTimeWithout3Hour(customer.createdAt)}</span></td>
                        <td className="cells border-gray"><span  className="font-size-12">{editMode[index] ? <select  className="input-values" style={{width:"80px"}} value={editMode[index] && editedValues[0]?.activated ? editedValues[0]?.activated : customer.activated} onChange={(e) => handleChange(e, 0, 'activated')}><option value='1'>Ativo</option><option value='0'>Inativo</option></select> : <div id="statusCells"><span style={{fontWeight: "bolder",color: customer.activated ? "green" : "red"}}>{customer.activated ? "Ativo" : "Inativo"}</span></div>}</span></td>
                        <td className="border-gray">
                    {editMode[index] ? (
                        <div className="row-align" style={{justifyContent:"center"}}>               
                            <button className="button-save" style={{fontSize:"12px", width: "60px"}} onClick={() =>openUpdateModal("Alterar",index)}>Salvar</button>
                            <button className="button-cancel" style={{fontSize:"12px", width:"60px"}} onClick={() => handleSave(index)}>Cancelar</button>
                        </div>
                    ) : (
                        <div>
                            { <span onClick={() => toggleEditMode(index)}><img src={pencil} width={15} height={15} style={{cursor:"pointer"}}/></span> }
                            <span style={{border:"none", marginLeft:"10px"}} onClick={() => openDeletarModal("Deletar",customer.id)}><img src={trash} width={15} height={15} style={{cursor:"pointer"}}/></span>
                        </div>
                    )}
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