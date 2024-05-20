import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import api from "../../../utils/api";
import dots from "../../../img/dots.png"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { errorCancelTrigger, successCancelTrigger, waitingMessage } from "../../../Components/Toastify";
import { adjustTime, adjustTimeWithout3Hour } from "../../../utils/utils";
import { Filters, ITriggerList } from "../../types";
import loupe from '../../../img/loupe.png'

export function TriggerList() {

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    
    const location = useLocation()
    var botId = searchParams.get('bot_id') ?? "0";

    const [triggerList, setTriggerList] = useState<ITriggerList[]>([])
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [filtro, setFiltro] = useState<string>('');
    const menuRef = useRef<HTMLDivElement>(null);
    const [profilePic, setProfilePic] = useState<string>("")
    const [filters, setFilters] = useState<Filters>({
        telefone: '',
        variable_1: '',
        variable_2: '',
        variable_3: '',
        variable_4: '',
        variable_5: '',
        variable_6: '',
        variable_7: '',
        variable_8: '',
        variable_9: '',
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

    const dadosFiltrados = triggerList.filter(trigger =>
        trigger.campaign_name.toLowerCase().includes(filtro.toLowerCase()) ||
        trigger.template_name.toLowerCase().includes(filtro.toLowerCase())
      );

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
        <div>
            <ToastContainer />
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <img src={profilePic} width={100} height={100} alt='logo da empresa' style={{ marginBottom: "-30px" }} />
                </div>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "90%" }} className="title_2024">Gerenciar Campanhas</h1>
                <hr className="hr_color2024" />
                <div style={{margin:"20px"}}>
                    <input onChange={handleFiltroChange} value={filtro} type="text" style={{borderRight:"none", width:"300px", borderRadius:"20px 0px 0px 20px", paddingLeft:"20px"}} placeholder="Buscar por nome ou template"/>
                    <button style={{borderLeft:"none", borderRadius:"0px 20px 20px 0px", width:"50px"}}>
                        <img src={loupe} alt="" width={20} height={20}/>
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", margin: "10px" }}>
                                <span style={{ color: "#002080" }}>Status</span>
                                <div style={{ display: "flex", flexDirection: "column", margin: "10px", textAlign: "left" }}>
                                    <div><input type="checkbox" onChange={() => handleStatusChange('aguardando')} checked={filters.status.aguardando} /><span style={{ marginLeft: "5px", fontWeight: "normal" }}>Aguardando</span></div>
                                    <div><input type="checkbox" onChange={() => handleStatusChange('enviado')} checked={filters.status.enviado} /><span style={{ marginLeft: "5px", fontWeight: "normal" }}>Enviado</span></div>
                                    <div><input type="checkbox" onChange={() => handleStatusChange('erro')} checked={filters.status.erro} /><span style={{ marginLeft: "5px", fontWeight: "normal" }}>Erro</span></div>
                                </div>
                            </div>
                <div className="table-container">
                <table className="table-2024 fixed-header-table">
                    <thead>
                        <tr className="cells">
                            <th className="cells">Nome</th>
                            <th className="cells">Template</th>
                            <th className="cells">Data criação</th>
                            <th className="cells">Data de envio</th>
                            <th className="cells">Status</th>
                            <th className="cells">Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dadosFiltrados.map((trigger, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    key={index}
                                    style={{ border: '1px solid #0171BD', backgroundColor: hoveredRow === index ? '#F9F9F9' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <td><span>{trigger.campaign_name}</span></td>
                                    <td><span>{trigger.template_name}</span></td>
                                    {/* <td><span>{trigger.type_trigger}</span></td> */}
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
                            padding: '5px',
                            backgroundColor: '#fff',
                        }}
                    ><li className="blue-text dropdown-show no-bullets">
                                {statusNameView(selectedRow)==="aguardando" && (
                                <ul style={{ cursor: "pointer", borderBottom: "1px solid #000", backgroundColor: hoveredRow === selectedRow ? '#f0f0f0' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(selectedRow)}
                                    onMouseLeave={handleMouseLeave}> <td onClick={() => changeStatus(selectedRow)}>Cancelar disparo</td>
                                </ul>
                            )}
                                <ul style={{ cursor: "pointer", borderBottom: "1px solid #000", backgroundColor: hoveredRow === selectedRow ? '#f0f0f0' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(selectedRow)}
                                    onMouseLeave={handleMouseLeave}> <td onClick={() => detailedTrigger(selectedRow)}>Detalhes</td>
                                </ul>
                        </li>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TriggerList;