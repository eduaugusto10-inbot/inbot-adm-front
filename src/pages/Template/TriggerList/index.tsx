import React, { useEffect, useRef, useState } from "react";
import './style.css'
import api from "../../../utils/api";
import dots from "../../../img/dots.png"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { errorCancelTrigger, successCancelTrigger, waitingMessage } from "../../../Components/Toastify";
import { adjustTime } from "../../../utils/utils";
import { ITriggerList } from "../../types";

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
    const menuRef = useRef<HTMLDivElement>(null);
    const [profilePic, setProfilePic] = useState<string>("")

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

    return (
        <div style={{ margin: "40px" }}>
            <ToastContainer />
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <img src={profilePic} width={100} height={100} alt='logo da empresa' style={{ marginBottom: "-30px" }} />
                </div>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "90%" }} className="title_2024">Log de Disparos</h1>
                <hr className="hr_color2024" />
                <table>
                    <thead>
                        <tr className="cells" style={{ backgroundColor: "#010043" }}>
                            <th className="cells">Nome</th>
                            <th className="cells">Template</th>
                            <th className="cells">Tipo de disparo</th>
                            <th className="cells">Data criação</th>
                            <th className="cells">Data disparo</th>
                            <th className="cells">Status</th>
                            <th className="cells">Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {triggerList.map((trigger, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    key={index}
                                    style={{ border: '1px solid #0171BD', backgroundColor: hoveredRow === index ? '#F9F9F9' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <td><span>{trigger.campaign_name}</span></td>
                                    <td><span>{trigger.template_name}</span></td>
                                    <td><span>{trigger.type_trigger}</span></td>
                                    <td><span>{trigger.data_criacao ? adjustTime(trigger.data_criacao) : "--"}</span></td>
                                    <td><span>{trigger.time_trigger ? adjustTime(trigger.time_trigger) : "--"}</span></td>
                                    <td><div id="statusCells" style={{ borderRadius: "20px", backgroundColor: statusBackgroundColor(trigger.status), padding: "7px" }}><span style={{ fontSize: "12px", fontWeight: "bolder", color: statusColor(trigger.status) }}>{statusName(trigger.status)}</span></div></td>
                                    <td><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
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
                    ><table>
                            <tbody>
                                <tr style={{ cursor: "pointer", borderBottom: "1px solid #000", backgroundColor: hoveredRow === selectedRow ? '#F9F9F9' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(selectedRow)}
                                    onMouseLeave={handleMouseLeave}> <td onClick={() => changeStatus(selectedRow)}>Cancelar disparo</td>
                                </tr>
                                <tr style={{ cursor: "pointer", borderBottom: "1px solid #000", backgroundColor: hoveredRow === selectedRow ? '#F9F9F9' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(selectedRow)}
                                    onMouseLeave={handleMouseLeave}> <td onClick={() => detailedTrigger(selectedRow)}>Detalhes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TriggerList;