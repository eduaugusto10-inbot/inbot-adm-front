import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import api from "../../../utils/api";
import dots from "../../../img/dots.png"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { errorCancelTrigger, successCancelTrigger, waitingMessage } from "../../../Components/Toastify";
import { adjustTime, adjustTimeWithout3Hour } from "../../../utils/utils";
import { Filters, ITriggerList, ITriggerListFilter } from "../../types";
import loupe from '../../../img/loupe.png'
import filter from '../../../img/filtro.png'
import { months, years } from "../../../utils/textAux";

export function TriggerList() {

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    
    const location = useLocation()
    var botId = searchParams.get('bot_id') ?? "0";

    const [triggerList, setTriggerList] = useState<ITriggerList[]>([])
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredRowMenu, setHoveredRowMenu] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [filtro, setFiltro] = useState<string>('');
    const [showFilter, setShowFilter] = useState<boolean>(true)
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const menuRef = useRef<HTMLDivElement>(null);
    const [sortType, setSortType] = useState<string>("")
    const [sortOrder, setOrderSort] = useState<string>("")
    const [profilePic, setProfilePic] = useState<string>("")
    const [filters, setFilters] = useState<ITriggerListFilter>({
        campaign_name: '',
        template_name: '',
        type_trigger: '',
        time_trigger: '',
        data_criacao: '',
        status: {
            aguardando: true,
            enviado: true,
            erro: true,
        }
    });
    
    useEffect(() => {
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }
        api.get(`/whats-botid/${botId}`)
            .then(resp => {
                const token = resp.data.accessToken;
                api.get("https://whatsapp.smarters.io/api/v1/settings", { headers: { 'Authorization': token } })
                    .then(res => {
                        setProfilePic(res.data.data.profile_pic)
                        // handleImageLoad()
                    })
                    .catch(error => console.log(error))
            })
    }, []);

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

    let dadosFiltrados = triggerList.filter(trigger => {
        
        if (trigger.template_name !== null && filtro !== '' && !trigger.template_name.toLowerCase().includes(filtro.toLowerCase()) 
        && (trigger.campaign_name !== null && filtro !== '' && !trigger.campaign_name.toLowerCase().includes(filtro.toLowerCase()))){
            return false;
        }
        if(startDate !== "" && trigger.data_criacao < startDate ){
            console.log(trigger.data_criacao+" "+startDate+" "+trigger.data_criacao >= startDate)
            return false;
        }
        if(endDate !== "" && trigger.data_criacao > endDate ){
            console.log(trigger.data_criacao+" "+startDate+" "+trigger.data_criacao >= startDate)
            return false;
        }
        if (
            (filters.status.aguardando && trigger.status === 'aguardando') ||
            (filters.status.enviado && trigger.status === 'enviado') ||
            (filters.status.erro && trigger.status === 'erro')
        ) {
            return true;
        }

            return false;
        });

        const handleInitSort = (value: string, orderBy: string) => {
            setSortType(value)
            setOrderSort(orderBy)
        }
        const handleSort = (outrosDadosFiltrados: any) => {

                const sortedItems = [...outrosDadosFiltrados];
                if(sortType === ""){
                    return sortedItems;
                }
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
                return sortedItems
        }

      const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value);
      };

    const handleOptionClick = (index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        event.stopPropagation();
        setSelectedRow(index);
        const rect = event.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
        setMenuOpen(true);
    };

    const handleMouseEnter = (index: number) => {
        setHoveredRow(index);
    };

    const handleMouseLeave = () => {
        setHoveredRow(null);
    };
    const handleMouseEnterMenu = (index: number) => {
        setHoveredRowMenu(index);
    };

    const handleMouseLeaveMenu = () => {
        setHoveredRowMenu(null);
    };

    const history = useNavigate();

    useEffect(() => {
        api.get(`/whatsapp/trigger-bot/${botId}`)
            .then(resp => {
                setTriggerList(resp.data.data)
            })
    }, []);

    function detailedTrigger(id: number) {
        const triggerId = triggerList[id].id;
        history("/trigger-details", { state: { triggerId: triggerId, urlLogo: profilePic } });
    }
    const changeStatus = (id: number) => {
        waitingMessage()
        const triggerId = triggerList[id].id;

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
        return triggerList[id].status;
    }
    function statusName(status: string) {
        switch (status) {
            case "enviado":
                return "Enviado"
            case "aguardando":
                return "Aguardando"
            default:
                return "Cancelado"
        }
    }
    function statusColor(status: string) {
        switch (status) {
            case "enviado":
                return "green"
            case "aguardando":
                return "yellow"
            default:
                return "red"
        }
    }

    function statusBackgroundColor(status: string) {
        switch (status) {
            case "enviado":
                return "#F2FFED"
            case "aguardando":
                return "#FFECEC"
            default:
                return "#FFECEC"
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
    };

    return (
        <div style={{width:"95%", padding:"10px 0px"}}>
            <ToastContainer />
            <div>
                <div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", minWidth:"100%" }}>
                        <img src={profilePic} width={60} height={60} alt='logo da empresa' style={{ marginBottom: "-30px" }} />
                    </div>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width:"100%" }} className="title_2024">Gerenciar Campanhas</h1>
                </div>
                <div className="hr_color" style={{width:"100%", marginTop:"15px"}}></div>
                <div className="row" style={{margin:"20px", display:"flex", justifyContent:"flex-end", alignItems:"end"}}>
                    <input onChange={handleFiltroChange} value={filtro} type="text" style={{borderRight:"none", width:"300px", borderRadius:"20px 0px 0px 20px", paddingLeft:"20px"}} placeholder="Buscar por nome ou template"/>
                    <button style={{borderLeft:"none", borderRadius:"0px 20px 20px 0px", width:"50px"}}>
                        <img src={loupe} alt="" width={20} height={20}/>
                    </button>
                </div>
                {showFilter && 
                <div className="column" style={{ margin: "20px", borderRadius: "20px" }}>
                <div style={{ display:"flex", flexDirection:"column", fontWeight: "bolder", margin: "20px", borderRadius: "20px" }}>
                <div style={{margin:"10px 20px", textAlign:"left"}}>
            <span style={{ color: "#002080", fontWeight:"bolder" }}>Data de criação: </span>
            <select name="" id="" className="input-values litle-input" >
                {[...Array(31).keys()].map(i => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
                ))}
            </select>
            <select name="" id="" className="input-values litle-input" >
                {months.map(month =>(
                    <option value="">{month}</option>
                ))}
            </select>
            <select name="" id="" className="input-values litle-input" >
                {years.map(year=>(
                    <option value="">{year}</option>
                ))}
            </select>
            <span style={{ color: "#002080", fontWeight:"bolder", margin:"0px 10px 0px 10px" }}>até</span>
            <select name="" id="" className="input-values litle-input" >
                {[...Array(31).keys()].map(i => (
                    <option key={i+1} value={(i+1).toString()}>{i+1}</option>
                ))}
            </select>
            <select name="" id="" className="input-values litle-input" >
                {months.map(month =>(
                    <option value="">{month}</option>
                ))}
            </select>
            <select name="" id="" className="input-values litle-input" >
                {years.map(year=>(
                    <option value="">{year}</option>
                ))}
            </select>
            <button className="button-blue">Buscar</button>
        </div>
                    <div style={{ display: "flex", flexDirection: "column", width:"100%", margin: "10px 0px 0px 20px" }}>
                        <div className="row-align" style={{marginBottom:"30px", alignItems:"center"}}>
                            <span style={{ color: "#002080", fontWeight:"bolder" }}>Status: </span>
                            <div className={filters.status.aguardando ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer", marginLeft:"20px"}} onClick={()=>""}><span className={filters.status.aguardando ? "number_button_gradient" : "number_button_gradient-gray"} style={{width: "100px",height:"30px",fontSize:"14px", borderRadius: "7px"}} onClick={() => handleStatusChange('aguardando')}>Aguardando</span></div>
                            <div className={filters.status.enviado ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer"}} onClick={()=>""}><span className={filters.status.enviado ? "number_button_gradient" : "number_button_gradient-gray"} style={{width: "100px",height:"30px",fontSize:"14px", borderRadius: "7px"}} onClick={() => handleStatusChange('enviado')}>Enviado</span></div>
                            <div className={filters.status.erro ? "border_gradient" : "border_gradient-gray"} style={{marginRight:"15px", cursor:"pointer"}} onClick={()=>""}><span className={filters.status.erro ? "number_button_gradient" : "number_button_gradient-gray"} style={{width: "100px",height:"30px",fontSize:"14px", borderRadius: "7px"}} onClick={() => handleStatusChange('erro')}>Erro</span></div>
                        </div>
                    </div>
                    </div>
                    {/* <div style={{width:"100%", textAlign:"end", margin:"0px 0px 20px -20px"}}>
                        <button className="button-blue" onClick={filterClear}>Fechar</button>
                    </div> */}
                </div>}
                <div>
                <table className="table-2024 fixed-header-table" style={{backgroundColor:"#FFF"}}>
                    <thead>
                        <tr className="cells table-2024 border-bottom-zero">
                            <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Nome</span> <div><div className="triangle-up" onClick={()=>handleInitSort("campaign_name","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("campaign_name","desc")}></div></div></div></th>
                            <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Template</span> <div><div className="triangle-up" onClick={()=>handleInitSort("template_name","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("template_name","desc")}></div></div></div></th>
                            <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Data criação</span> <div><div className="triangle-up" onClick={()=>handleInitSort("data_criacao","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("data_criacao","desc")}></div></div></div></th>
                            <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Data de envio</span> <div><div className="triangle-up" onClick={()=>handleInitSort("time_trigger","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("time-trigger","desc")}></div></div></div></th>
                            <th className="cells"><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Status</span> <div><div className="triangle-up" onClick={()=>handleInitSort("status","asc")}></div><div className="triangle-down" style={{marginTop:"4px"}}  onClick={()=>handleInitSort("status","desc")}></div></div></div></th>
                            <th className="cells">Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {handleSort(dadosFiltrados).map((trigger, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    key={index}
                                    style={{ border: '1px solid #0171BD', backgroundColor:  index % 2 === 0 ? '#ecebeb' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <td><span>{trigger.campaign_name}</span></td>
                                    <td><span>{trigger.template_name}</span></td>
                                    <td><span>{trigger.data_criacao ? adjustTime(trigger.data_criacao) : "--"}</span></td>
                                    <td><span>{trigger.time_trigger ? adjustTimeWithout3Hour(trigger.time_trigger) : "--"}</span></td>
                                    <td><div id="statusCells" style={{ borderRadius: "20px", backgroundColor: statusBackgroundColor(trigger.status), padding: "7px" }}><span style={{ fontSize: "12px", fontWeight: "bolder", color: statusColor(trigger.status) }}>{statusName(trigger.status)}</span></div></td>
                                    <td><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
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
                                    onMouseLeave={handleMouseLeaveMenu}> <td onClick={() => changeStatus(selectedRow)}>Cancelar disparo</td>
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