import React, { useEffect, useRef, useState } from "react";
import './style.css'
import api from "../../../utils/api";
import dots from "../../../img/dots.png"
import { useLocation, useNavigate } from "react-router-dom";
import ModalTemplate from "../ModalTemplate";

interface ITriggerList {
    id: number
    campaign_name: string
    template_name: string
    status: string
    type_trigger: string
    time_trigger: string
}
export function TriggerList() {

    const location = useLocation()
    const botId = location.state.botId;
    const profilePic = location.state.urlLogo;

    const [modal, setModal] = useState<boolean>(false)
    const [modalObject, setModalObject] = useState<any>()
    const [triggerList, setTriggerList] = useState<ITriggerList[]>([])
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);



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
        api.get(`https://webhooks.inbot.com.br/inbot-adm-back/v1/gateway/whatsapp/trigger-bot/${botId}`)
            .then(resp => {
                console.log(resp.data.data)
                setTriggerList(resp.data.data)
            })
    }, []);

    const changeStatus = (id: number) => {
        const triggerId = triggerList[id].id;
        api.put(`/whatsapp/trigger/${triggerId}`)
            .then(resp => console.log(resp))
            .catch(error => console.log(error))
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
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    <img src={profilePic} width={100} height={100} alt='logo da empresa' style={{ marginBottom: "-30px" }} />
                </div>
                <div style={{ width: "100%", borderBottom: "1px solid #000", marginBottom: "30px", display: "flex", flexDirection: "row" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width: "90%" }}>Log de Disparos</h1>
                </div>
                <table>
                    <thead>
                        <tr className="cells" style={{ backgroundColor: "#010043" }}>
                            <th className="cells">Nome</th>
                            <th className="cells">Template</th>
                            <th className="cells">Tipo de disparo</th>
                            <th className="cells">Data disparo</th>
                            <th className="cells">Status</th>
                            <th className="cells">Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {triggerList.map((trigger, index) => (
                            <tr
                                key={index}
                                style={{ border: '1px solid #0171BD', backgroundColor: hoveredRow === index ? '#F9F9F9' : 'white' }}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <td><span>{trigger.campaign_name}</span></td>
                                <td><span>{trigger.template_name}</span></td>
                                <td><span>{trigger.type_trigger}</span></td>
                                <td><span>{trigger.time_trigger ? (new Date(trigger.time_trigger)).toLocaleString() : "--"}</span></td>
                                <td><div id="statusCells" style={{ borderRadius: "20px", backgroundColor: statusBackgroundColor(trigger.status), padding: "7px" }}><span style={{ fontSize: "12px", fontWeight: "bolder", color: statusColor(trigger.status) }}>{statusName(trigger.status)}</span></div></td>
                                <td><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                            </tr>
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
                                    onMouseLeave={handleMouseLeave}> <td onClick={() => changeStatus(selectedRow)}>Cancelar disparo</td></tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div>
                {modal && (
                    <div onClick={() => setModal(prevState => !prevState)}>
                        <ModalTemplate modalTemplate={modalObject} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default TriggerList;