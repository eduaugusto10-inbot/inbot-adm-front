import React, { useEffect, useRef, useState } from "react";
import './style.css'
import api from "../../../../utils/api";
import { ITemplateList } from "../../../types";
import dots from "../../../../img/dots.png"
import { useNavigate } from "react-router-dom";
import ModalTemplate from "../../ModalTemplate";
import { useSearchParams } from "react-router-dom";

export function ListAll() {
    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";
    localStorage.setItem("botId", botId)

    const [modal, setModal] = useState<boolean>(false)
    const [modalObject, setModalObject] = useState<any>()
    const [templates, setTemplates] = useState<ITemplateList[]>([])
    const [phone, setPhone] = useState<string>("")
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [profilePic, setProfilePic] = useState<string>("")
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }
        api.get(`/gateway/whats-botid/${botId}`)
            .then(resp => {
                setPhone(resp.data.number)
                const token = resp.data.accessToken;
                api.get('https://whatsapp.smarters.io/api/v1/messageTemplates', { headers: { 'Authorization': token } })
                    .then(resp => {
                        setTemplates(resp.data.data.messageTemplates)
                    })
                api.get("https://whatsapp.smarters.io/api/v1/settings", { headers: { 'Authorization': token } })
                    .then(res => {
                        setProfilePic(res.data.data.profile_pic)
                        handleImageLoad()
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

    const handleImageLoad = () => {
        setIsLoading(false);
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
    function CreateTemplate() {
        history("/template-create", { state: { urlLogo: profilePic, phone: phone } });
    }
    function ListCampaign() {
        history("/trigger-list", { state: { urlLogo: profilePic, botId: botId } });
    }
    function SendTemplate(name: string, variableQuantity: number, qtButtons: number, headerConfig: string | null) {
        console.log(headerConfig)
        history("/template-trigger", { state: { templateName: name, variableQuantity: variableQuantity, urlLogo: profilePic, phone: phone, headerConfig: headerConfig, qtButtons: qtButtons } });
    }

    const loadTemplate = (id: number) => {
        setModalObject(templates[id])
        if (!modal) {
            setModal(prevState => !prevState)
        }
        setMenuOpen(false);
    }

    const encontrarMaiorNumero = (texto: string): number => {
        const regex = /{{.*?(\d+).*?}}/g;
        const numeros: number[] = [];
        let match: RegExpExecArray | null;

        // Encontra todas as ocorrências de números dentro das strings que correspondem ao padrão
        while ((match = regex.exec(texto)) !== null) {
            if (match[1]) {
                numeros.push(parseInt(match[1]));
            }
        }

        // Encontra o maior número na lista
        if (numeros.length > 0) {
            return Math.max(...numeros);
        } else {
            return -1; // Retorna -1 se não encontrar nenhum número
        }
    };

    const hasMedia = (headerElement: any) => {
        let headerType = null;
        headerElement.forEach((element: any) => {
            if (element.type === "header") {
                switch (element.parameters[0].type) {
                    case "video":
                        headerType = "video";
                        break;
                    case "text":
                        headerType = "text";
                        break;
                    case "image":
                        headerType = "image";
                        break;
                    case "document":
                        headerType = "document";
                        break;
                    default:
                        break;
                }
            }
        });
        return headerType;
    }
    const hasManyButtons = (headerElement: any) => {
        let buttons = 0;
        headerElement.forEach((element: any) => {
            if (element.type === "button") {
                if (element.parameters[0].type === "quickReply") {
                    buttons = element.parameters.length;
                }
            }
        });
        return buttons;
    }

    const sendtemplate = (id: number) => {
        templates[id].components.forEach((element: any) => {
            if (element.type === "body")
                SendTemplate(templates[id].name, encontrarMaiorNumero(element.parameters[0].text), hasManyButtons(templates[id].components), hasMedia(templates[id].components))
        });
    }
    return (
        <div style={{ margin: "40px" }}>
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    {isLoading ? (<div className="spinner-container">
                        <div className="spinner"></div>
                    </div>)
                    : <img onLoad={handleImageLoad} src={profilePic} width={100} height={100} alt='logo da empresa' style={{ marginBottom: "-30px" }} />}
                </div>
                <div style={{ width: "100%", borderBottom: "1px solid #000", marginBottom: "30px", display: "flex", flexDirection: "row" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#324d69", width: "90%" }}>Templates</h1>
                </div>
                    <button onClick={CreateTemplate} style={{ margin: "10px", backgroundColor: "#010043", border: "1px solid #010043", width: "180px", height: "30px", borderRadius: "5px" }}>Novo Template</button>
                    <button onClick={ListCampaign} style={{ margin: "10px", backgroundColor: "#010043", border: "1px solid #010043", width: "180px", height: "30px", borderRadius: "5px" }}>Campanhas</button>
                <table>
                    <thead>
                        <tr className="cells" style={{ backgroundColor: "#010043" }}>
                            <th className="cells"><span>ID do template</span></th>
                            <th className="cells">Nome do template</th>
                            <th className="cells">Status</th>
                            <th className="cells">Categoria</th>
                            <th className="cells">Idioma</th>
                            <th className="cells">Menu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map((template, index) => (
                            <tr
                                key={index}
                                style={{ border: '1px solid #0171BD', backgroundColor: hoveredRow === index ? '#F9F9F9' : 'white' }}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <td className="cells"><span style={{ color: "blue", fontSize: "12px" }}>{template.ID}</span></td>
                                <td><span>{template.name}</span></td>
                                <td><div style={{ borderRadius: "20px", backgroundColor: template.status === "APPROVED" ? "#F2FFED" : "#FFECEC", padding: "7px" }}><span style={{ fontSize: "12px", color: template.status === "APPROVED" ? "green" : "red", fontWeight: "bolder" }}>{template.status === "APPROVED" ? "Aprovado" : "Rejeitado"}</span></div></td>
                                <td><span>{template.category}</span></td>
                                <td><span>{template.language}</span></td>
                                <td><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    {modal && (
                        <div onClick={() => setModal(prevState => !prevState)}>
                            <ModalTemplate modalTemplate={modalObject} />
                        </div>
                    )}
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
                    ><table>
                            <tbody>
                                <tr style={{ cursor: "pointer", borderBottom: "1px solid #000", backgroundColor: hoveredRow === selectedRow ? '#F9F9F9' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(selectedRow)}
                                    onMouseLeave={handleMouseLeave}> <td onClick={() => loadTemplate(selectedRow)}>Visualizar template</td></tr>
                                <tr style={{ cursor: "pointer", borderBottom: "1px solid #000", backgroundColor: hoveredRow === selectedRow ? '#F9F9F9' : 'white' }}
                                    onMouseEnter={() => handleMouseEnter(selectedRow)}
                                    onMouseLeave={handleMouseLeave}><td onClick={() => sendtemplate(selectedRow)}>Enviar template</td></tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListAll;