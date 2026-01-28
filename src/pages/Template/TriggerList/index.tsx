import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import api from "../../../utils/api";
import dots from "../../../img/dots.png"
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { errorCancelTrigger, successCancelTrigger, waitingMessage } from "../../../Components/Toastify";
import { adjustTime, adjustTimeWithout3Hour } from "../../../utils/utils";
import { Filters, ITriggerList, ITriggerListFilter } from "../../types";
import loupe from '../../../img/loupe.png'
import { months, years } from "../../../utils/textAux";
import  {validatedUser}  from "../../../utils/validateUser";
import whatsappIcon from '../../../img/whatsapp.png'
import teamsIcon from '../../../img/teams.png'
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DraggableComponent } from "../../../Components/Draggable";

export function TriggerList() {

    const [searchParams, setSearchParams] = useSearchParams();  
    var botId = searchParams.get('bot_id') ?? "0";
    const history = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            const logged:any = await validatedUser(searchParams.get('bot_id'), searchParams.get("token"),searchParams.get('url_base_api')) ?? false;
            console.log(`Logged: ${JSON.stringify(logged)}`)
            if(!logged.logged){
                history(`/template-warning-no-whats?bot_id=${botId}`);
            }
        }
        fetchData()
    }, []);
    const now = new Date();
    const [triggerList, setTriggerList] = useState<ITriggerList[]>([])
    const [hoveredRowMenu, setHoveredRowMenu] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true)
    const [hiddenVideo, setHiddenVideo] = useState<boolean>(false)
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [filtro, setFiltro] = useState<string>('');
    const [dataTreat, setDataTreat] = useState<any>([])
    const menuRef = useRef<HTMLDivElement>(null);
    const [sortType, setSortType] = useState<string>("data_criacao")
    const [sortOrder, setOrderSort] = useState<string>("desc")
    const [changeDateFilter, setChangeDateFilter] = useState<boolean>(false)
    const [initDate, setInitDate] = useState({
        day: 1,
        month: now.getMonth() + 1,
        year: 2025
    })
    const [finalDate, setFinalDate] = useState({
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
    })
    const [filters, setFilters] = useState<ITriggerListFilter>({
        campaign_name: '',
        template_name: '',
        category: '',
        type_trigger: '',
        time_trigger: '',
        data_criacao: '',
        status: {
            executado: true,
            entregue: true, 
            aguardando: true,
            enviado: true,
            erro: true,
            cancelado: true,
            criando: true,
        }
    });
    
    const [selectedChannel, setSelectedChannel] = useState<string>('todos');
    
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development' && searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }
    }, []);
    const showVideo = () =>{
        setHiddenVideo(!hiddenVideo)
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filtersByStatus = (triggersList:any) => {
        const dadosFiltrados = triggersList.filter((trigger: any) => { 
    
            if (trigger.template_name !== null && filtro !== '' && !trigger.template_name.toLowerCase().includes(filtro.toLowerCase()) 
            && (trigger.campaign_name !== null && filtro !== '' && !trigger.campaign_name.toLowerCase().includes(filtro.toLowerCase()))){
                return false;
            }

            if (selectedChannel !== 'todos' && trigger.channel !== selectedChannel) {
                return false;
            }
    
            if (
                (filters.status.aguardando && trigger.status === 'aguardando') ||
                (filters.status.enviado && trigger.status === 'enviado') ||
                (filters.status.executado && trigger.status === 'executado') ||
                (filters.status.entregue && trigger.status === 'entregue') ||
                (filters.status.erro && trigger.status === 'erro') ||
                (filters.status.cancelado && trigger.status === 'cancelado') ||
                (filters.status.criando && trigger.status === 'criando')
            ) {
                return true;
            }
    
            return false;
        });
    
        setDataTreat(filterByDate(dadosFiltrados))
    };

        const handleInitSort = (value: string, orderBy: string) => {
            setSortType(value)
            setOrderSort(orderBy)
        }
        const handleSort = (outrosDadosFiltrados: any) => {
            const sortedItems = [...outrosDadosFiltrados];
            if(sortType === ""){
                return sortedItems;
            }
            
            // Campos numéricos que precisam ser convertidos para número
            const numericalFields = ["total", "erro", "enviado", "engajado"];
            
            // Campos de data que precisam ser convertidos para Date
            const dateFields = ["data_criacao", "time_trigger"];
            
            if(numericalFields.includes(sortType)) {
                if (sortOrder === "asc") {
                    sortedItems.sort((a, b) => {
                        const valorA = a[sortType] !== undefined && a[sortType] !== null ? Number(a[sortType]) : 0;
                        const valorB = b[sortType] !== undefined && b[sortType] !== null ? Number(b[sortType]) : 0;
                        return valorA - valorB;
                    });
                } else if (sortOrder === "desc") {
                    sortedItems.sort((a, b) => {
                        const valorA = a[sortType] !== undefined && a[sortType] !== null ? Number(a[sortType]) : 0;
                        const valorB = b[sortType] !== undefined && b[sortType] !== null ? Number(b[sortType]) : 0;
                        return valorB - valorA;
                    });
                }
            } else if (sortType === "entregue") {
                if (sortOrder === "asc") {
                    sortedItems.sort((a, b) => {
                        const valorA = a.channel === 'whatsapp' ? 
                            (a.entregue !== undefined && a.entregue !== null ? Number(a.entregue) : 0) :
                            (Number(a.enviado || 0) + Number(a.entregue || 0));
                        const valorB = b.channel === 'whatsapp' ? 
                            (b.entregue !== undefined && b.entregue !== null ? Number(b.entregue) : 0) :
                            (Number(b.enviado || 0) + Number(b.entregue || 0));
                        return valorA - valorB;
                    });
                } else if (sortOrder === "desc") {
                    sortedItems.sort((a, b) => {
                        const valorA = a.channel === 'whatsapp' ? 
                            (a.entregue !== undefined && a.entregue !== null ? Number(a.entregue) : 0) :
                            (Number(a.enviado || 0) + Number(a.entregue || 0));
                        const valorB = b.channel === 'whatsapp' ? 
                            (b.entregue !== undefined && b.entregue !== null ? Number(b.entregue) : 0) :
                            (Number(b.enviado || 0) + Number(b.entregue || 0));
                        return valorB - valorA;
                    });
                }
            } else if (dateFields.includes(sortType)) {
                if (sortOrder === "asc") {
                    sortedItems.sort((a, b) => {
                        const dateA = a[sortType] !== undefined && a[sortType] !== null ? new Date(a[sortType]).getTime() : 0;
                        const dateB = b[sortType] !== undefined && b[sortType] !== null ? new Date(b[sortType]).getTime() : 0;
                        return dateA - dateB;
                    });
                } else if (sortOrder === "desc") {
                    sortedItems.sort((a, b) => {
                        const dateA = a[sortType] !== undefined && a[sortType] !== null ? new Date(a[sortType]).getTime() : 0;
                        const dateB = b[sortType] !== undefined && b[sortType] !== null ? new Date(b[sortType]).getTime() : 0;
                        return dateB - dateA;
                    });
                }
            } else {
                if (sortOrder === "asc") {
                    sortedItems.sort((a, b) => {
                        const valorA = a[sortType] !== undefined && a[sortType] !== null ? a[sortType] : 'Z';
                        const valorB = b[sortType] !== undefined && b[sortType] !== null ? b[sortType] : 'Z';
                        return valorA.localeCompare(valorB);
                    });
                } else if (sortOrder === "desc") {
                    sortedItems.sort((a, b) => {
                        const valorA = a[sortType] !== undefined && a[sortType] !== null ? a[sortType] : 'Z';
                        const valorB = b[sortType] !== undefined && b[sortType] !== null ? b[sortType] : 'Z';
                        return valorB.localeCompare(valorA);
                    });
                }                    
            }
            return sortedItems;
        }

        const filterByDate = (values: any) => {
            const dadosFiltrados = values.filter((trigger: any) => {
                const triggerDate = new Date(trigger.data_criacao);

                const dataInicial = new Date(initDate.year, initDate.month - 1, initDate.day,0,0,0);
                const dataFinal = new Date(finalDate.year, finalDate.month - 1, finalDate.day,23,59,59);
    
                return triggerDate >= dataInicial && triggerDate <= dataFinal;
            });
            return dadosFiltrados;
            
        };

      const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value);
        setChangeDateFilter(previous => !previous)
      };

    const handleOptionClick = (index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        event.stopPropagation();
        setSelectedRow(index);
        const rect = event.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
        setMenuOpen(true);
    };
    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }

    const handleMouseEnterMenu = (index: number) => {
        setHoveredRowMenu(index);
    };

    const handleMouseLeaveMenu = () => {
        setHoveredRowMenu(null);
    };

    useEffect(() => {
        setLoading(true)
        api.get(`/whatsapp/trigger-bot/${botId}`)
            .then(resp => {
                setTriggerList(resp.data.data)
                filtersByStatus(resp.data.data)
                setLoading(false)
            })
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            api.get(`/whatsapp/trigger-bot/${botId}`)
                .then(resp => {
                    setTriggerList(resp.data.data);
                    filtersByStatus(resp.data.data);
                })
                .catch(error => {
                    console.error("Erro ao buscar os dados:", error);
                });
        }, 15000);
        return () => clearInterval(intervalId);
    }, [botId, initDate, finalDate, filtro, filters, selectedChannel]);

    function detailedTrigger(id: number) {
        const sortTrigger = handleSort(dataTreat);
        const triggerId = sortTrigger[id].id;
        const triggerStatus = sortTrigger[id].status;
        history(`/trigger-details?bot_id=${botId}&token=${searchParams.get("token")}&url_base_api=${searchParams.get('url_base_api')}`, { state: { triggerId: triggerId, urlLogo: "", triggerStatus: triggerStatus } });
    }
    const changeStatus = (id: number) => {
        const sortTrigger = handleSort(dataTreat)
        waitingMessage()
        const triggerId = sortTrigger[id].id;

        api.put(`/whatsapp/trigger/${triggerId}`)
            .then(resp => {
                successCancelTrigger()
            })
            .catch(error => {
                errorCancelTrigger()
                console.log(error)
            })
    }
    const statusNameView = (id: number) => {
        const sortTrigger = handleSort(dataTreat);
        return sortTrigger[id].status;
    }
    function statusName(status: string) {
        switch (status) {
            case "enviado":
                return "Enviado"
            case "executado":
                return "Executado"
            case "aguardando":
                return "Aguardando"
            case "erro":
                return "Erro"
            case "criando":
                return "Criando"
            default:
                return "Cancelado"
        }
    }
    function statusColor(status: string) {
        switch (status) {
            case "enviado":
                return "blue"
            case "executado":
                return "green"
            case "aguardando":
                return "orange"
            case "cancelado":
                return "gray"
            case "criando":
                return "purple"
            default:
                return "red"
        }
    }

    const handleStatusChange = (statusKey: keyof Filters['status']) => {
        setFilters({
            ...filters,
            status: {
                ...filters.status,
                [statusKey]: !filters.status[statusKey],
            },
        });
        setChangeDateFilter(previous => !previous)
    };

    useEffect(() => {
        filtersByStatus(triggerList)
    },[changeDateFilter])

      const exportToExcel = () => {
        const processedData = handleSort(dataTreat).map((trigger: any) => ({
          'Nome da campanha': trigger.campaign_name,
          'Template': trigger.template_name,
          'Número de Origem': trigger.phone_trigger ?? '--',
          'Categoria': capitalizeFirstLetter(trigger.category?? '--'),
          'Data criação': trigger.data_criacao ? adjustTimeWithout3Hour(trigger.data_criacao) : "--",
          'Data envio': trigger.time_trigger ? adjustTimeWithout3Hour(trigger.time_trigger) : "--",
          'Status': trigger.status,
          'Canal': trigger.channel === "whatsapp" ? "Whatsapp" : trigger.channel === "teams" ? "Teams" : "Outro",
          'Total de disparos': trigger.total,
          'Erro': trigger.erro,
          'Enviado não entregue': statusName(trigger.status)=="Executado" && trigger.channel==='whatsapp' ? trigger.enviado : "0",
          'Entregue': trigger.entregue,
          'Engajamento': trigger.status === 'aguardando' ? 0 : trigger.engajado,
          'Usuário/Origem da Criação': trigger.triggerOrigin === 'MANUAL' ? (trigger.created_by || 'Manual') : capitalizeFirstLetter(trigger.triggerOrigin),
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Triggers");
    
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
        saveAs(dataBlob, "Disparo.xlsx");
      };

    return (
        <div style={{width:"95%", padding:"10px 0px"}}>
            <ToastContainer />
            <div>
                <div>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width:"100%" }} className="title_2024">Gerenciar Campanhas</h1>
                </div>
                <div className="column-align" style={{alignItems:"center"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
                    <div style={{textAlign:"end", width:"94%"}}>
                    <span style={{cursor:"pointer"}} onClick={()=> showVideo()}>Não sabe como criar template? <strong style={{color:"blue"}}>Assista nosso vídeo</strong></span>
                </div>
                </div>
                {hiddenVideo && (
                    <DraggableComponent urlVideo={"https://www.loom.com/embed/e5216eb8145c4eaaae86b3e76b5f6dd0?sid=b6e75c08-5db3-41b4-bb0a-c029504dd33a"} showVideo={showVideo}/>
                )}
                <div className="row" style={{margin:"20px", display:"flex", alignItems:"end"}}>
                    <input onChange={handleFiltroChange} value={filtro} type="text" style={{borderRight:"none", width:"300px", borderRadius:"20px 0px 0px 20px", paddingLeft:"20px"}} placeholder="Buscar por nome ou template"/>
                    <button style={{borderLeft:"none", borderRadius:"0px 20px 20px 0px", width:"50px"}}>
                        <img src={loupe} alt="" width={20} height={20}/>
                    </button>
                </div>
                <div className="column" style={{ margin: "20px", borderRadius: "20px" }}>
                <div style={{ display:"flex", flexDirection:"column", fontWeight: "bolder", borderRadius: "20px" }}>
            <div style={{margin:"10px 0px", textAlign:"left"}}>
            <span style={{ color: "#002080", fontWeight:"bolder" }}>Data de criação: </span>
            <select value={initDate.day} onChange={e => setInitDate(prevState => ({...prevState,day: Number(e.target.value) }))} className="input-values litle-input" >
                {[...Array(31).keys()].map(i => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
                ))}
            </select>
            <select value={initDate.month} onChange={e => setInitDate(prevState => ({...prevState,month: Number(e.target.value) }))} className="input-values litle-input" >
                {months.map((month, key) =>(
                    <option value={key+1}>{month}</option>
                ))}
            </select>
            <select value={initDate.year} onChange={e => setInitDate(prevState => ({...prevState,year: Number(e.target.value) }))} className="input-values litle-input" >
                {years.map(year=>(
                    <option value={year}>{year}</option>
                ))}
            </select>
            <span style={{ color: "#002080", fontWeight:"bolder", margin:"0px 10px 0px 10px" }}>até</span>
            <select value={finalDate.day} onChange={e => setFinalDate(prevState => ({...prevState,day: Number(e.target.value) }))} className="input-values litle-input" >
                {[...Array(31).keys()].map(i => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
                ))}
            </select>
            <select value={finalDate.month} onChange={e => setFinalDate(prevState => ({...prevState,month: Number(e.target.value) }))} className="input-values litle-input" >
                {months.map((month, key) =>(
                    <option value={key+1}>{month}</option>
                ))}
            </select>
            <select value={finalDate.year} onChange={e => setFinalDate(prevState => ({...prevState,year: Number(e.target.value) }))} className="input-values litle-input" >
                {years.map(year=>(
                    <option value={year}>{year}</option>
                ))}
            </select>
            <button onClick={()=>setChangeDateFilter(previous => !previous)} className="button-blue">Buscar</button>
        </div>
                    <div style={{ display: "flex", flexDirection: "column", width:"100%", margin: "10px 0px" }}>
                        <div className="row-align" style={{marginBottom:"30px", alignItems:"center"}}>
                            <span style={{ color: "#002080", fontWeight:"bolder" }}>Status: </span>
                            <div className={filters.status.aguardando ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer", marginLeft:"20px", fontSize:"13.6px"}} onClick={()=>""}><div className={filters.status.aguardando ? "number_button_gradient" : "number_button_gradient-gray"}  onClick={() => handleStatusChange('aguardando')}>Aguardando</div></div>
                            <div className={filters.status.executado ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer", fontSize:"13.6px"}} onClick={()=>""}><div className={filters.status.executado ? "number_button_gradient" : "number_button_gradient-gray"}  onClick={() => handleStatusChange('executado')}>Executado</div></div>
                            <div className={filters.status.erro ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer", fontSize:"13.6px"}} onClick={()=>""}><div className={filters.status.erro ? "number_button_gradient" : "number_button_gradient-gray"}  onClick={() => handleStatusChange('erro')}>Erro</div></div>
                            <div className={filters.status.cancelado ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer", fontSize:"13.6px"}} onClick={()=>""}><div className={filters.status.cancelado ? "number_button_gradient" : "number_button_gradient-gray"}  onClick={() => handleStatusChange('cancelado')}>Cancelado</div></div>
                            <div className={filters.status.criando ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer", fontSize:"13.6px"}} onClick={()=>""}><div className={filters.status.criando ? "number_button_gradient" : "number_button_gradient-gray"}  onClick={() => handleStatusChange('criando')}>Criando</div></div>
                        </div>
                        <div className="row-align" style={{marginBottom:"30px", alignItems:"center"}}>
                            <span style={{ color: "#002080", fontWeight:"bolder" }}>Canal: </span>
                            <select 
                                value={selectedChannel} 
                                onChange={(e) => {
                                    setSelectedChannel(e.target.value);
                                    setChangeDateFilter(previous => !previous);
                                }}
                                className="input-values"
                                style={{marginLeft:"20px", width:"150px"}}
                            >
                                <option value="todos">Todos</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="teams">Teams</option>
                            </select>
                        </div>
                    </div>
                    </div>
                </div>
                <div>
                <div className="row-align" style={{justifyContent: "space-between", margin:"10px 20px 0px 30px"}}>
                    <span style={{ color: "#002080", fontWeight:"bolder" }}>{dataTreat.length} resultados encontrados</span>
                        <button onClick={exportToExcel} className="button-blue" style={{width:"150px", margin:"1px"}}> Exportar excel </button>
                </div>
                {loading && 
                    <div className="modal-overlay" style={{width:"100%", height:"100%", display:"flex", flexDirection:"column"}}>
                        <div className="in_loader" style={{width:"50px", height:"50px"}}></div>
                        <h4>Carregando</h4>
                    </div>}
                {!loading && <div>
                    <table className="table-2024 fixed-header-table" style={{backgroundColor:"#FFF", marginTop:"12px"}}>
                        <thead>
                            <tr className="cells table-2024 border-bottom-zero">
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Nome</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("campaign_name","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("campaign_name","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Template</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("template_name","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("template_name","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Número de Origem</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("phone_trigger","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("phone_trigger","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Categoria</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("category","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("category","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Data criação</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("data_criacao","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("data_criacao","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Data de envio</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("time_trigger","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("time_trigger","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Status</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("status","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("status","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Canal</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("erro","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("erro","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Total de disparos</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("total","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("total","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Erro</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("erro","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("erro","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Enviado não entregue</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("total","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("total","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Entregue</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("entregue","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("entregue","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Engajamento</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("engajado","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("engajado","desc")}></div></div></div></th>
                                <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Usuário/Origem da Criação</span> <div style={{marginLeft:"10px"}}><div className="triangle-up" onClick={()=>handleInitSort("triggerOrigin","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("erro","desc")}></div></div></div></th>
                                <th className="cells">Opções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {handleSort(dataTreat).map((trigger: any, index: number) => (
                                <React.Fragment key={index}>
                                    <tr
                                        key={index}
                                        style={{ border: '1px solid #0171BD', backgroundColor:  index % 2 === 0 ? '#ecebeb' : 'white' }}
                                    >
                                        <td><span>{trigger.campaign_name}</span></td>
                                        <td><span>{trigger.template_name}</span></td>
                                        <td><span>{trigger.phone_trigger ?? '--'}</span></td>
                                        <td><span>{capitalizeFirstLetter(trigger.category?? '--')}</span></td>
                                        <td><span>{trigger.data_criacao ? adjustTimeWithout3Hour(trigger.data_criacao) : "--"}</span></td>
                                        <td><span>{trigger.time_trigger ? adjustTimeWithout3Hour(trigger.time_trigger) : "--"}</span></td>
                                        <td><div id="statusCells" style={{ borderRadius: "20px", padding: "7px" }}><span style={{ fontWeight: "bolder", color: statusColor(trigger.status) }}>{statusName(trigger.status)}</span></div></td>
                                        <td><img src={trigger.channel==='whatsapp' ? whatsappIcon : teamsIcon} alt={trigger.channel==='whatsapp' ? 'Whatsapp' : 'Teams'} width={20} style={{ margin: "10px" }} /></td>
                                        <td><span>{trigger.total}</span></td>
                                        <td><span>{trigger.erro}</span></td>
                                        <td><span>{statusName(trigger.status)=="Executado" && trigger.channel==='whatsapp' ? trigger.enviado : "0"}</span></td>
                                        <td><span>{trigger.channel==='whatsapp' ? trigger.entregue : parseInt(trigger.enviado) + parseInt(trigger.entregue) }</span></td>
                                        <td><span>{trigger.status === 'aguardando' ? 0 : trigger.engajado}</span></td>
                                        <td><span>{trigger.triggerOrigin === 'MANUAL' ? (trigger.created_by || 'Manual') : capitalizeFirstLetter(trigger.triggerOrigin)}</span></td>
                                        <td><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>}
                </div>
                {menuOpen && selectedRow !== null && (
                    <div
                        ref={menuRef}
                        style={{
                            position: 'absolute',
                            top: menuPosition.top,
                            left: menuPosition.left,
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            borderRadius:"20px"
                        }}
                    ><li className="blue-text no-bullets">
                                {statusNameView(selectedRow)==="aguardando" && (
                                <ul key={1} style={{ cursor: "pointer", borderBottom: "1px solid #DDD", backgroundColor: hoveredRowMenu === 1 ? '#ddd' : 'white', padding:"12px 16px", margin:"0px", borderTopRightRadius:"20px", borderTopLeftRadius:"20px" }}
                                    onMouseEnter={() => handleMouseEnterMenu(1)}
                                    onMouseLeave={handleMouseLeaveMenu}> <td onClick={() => changeStatus(selectedRow)}>Cancela disparo</td>
                                </ul>
                            )}
                                <ul key={2} style={{ cursor: "pointer",  backgroundColor: hoveredRowMenu === 2 ? '#ddd' : 'white', padding:"12px 16px", margin:"0", 
                                        borderRadius:  statusNameView(selectedRow)==="aguardando" ? "": "20px", borderBottomRightRadius:"20px", borderBottomLeftRadius:"20px" }}
                                    onMouseEnter={() => handleMouseEnterMenu(2)}
                                    onMouseLeave={handleMouseLeaveMenu}> <td onClick={() => detailedTrigger(selectedRow)}>Detalhes</td>
                                </ul>
                        </li>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TriggerList;