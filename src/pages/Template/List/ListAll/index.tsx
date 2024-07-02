import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import './style.css'
import api from "../../../../utils/api";
import { ITemplateList } from "../../../types";
import dots from "../../../../img/dots.png"
import { useNavigate } from "react-router-dom";
import ModalTemplate from "../../ModalTemplate";
import { useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { errorMessage, successMessageDeleteTemplate, waitingMessage } from "../../../../Components/Toastify";
import loupe from '../../../../img/loupe.png'

export function ListAll() {
    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";

    const [modal, setModal] = useState<boolean>(false)
    const [modalObject, setModalObject] = useState<any>()
    const [templates, setTemplates] = useState<ITemplateList[]>([])
    const [phone, setPhone] = useState<string>("")
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredRowMenu, setHoveredRowMenu] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [profilePic, setProfilePic] = useState<string>("")
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filtro, setFiltro] = useState<string>('');
    const [token, setToken] = useState<string>('')
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        }
        api.get(`/whats-botid/${botId}`)
            .then(resp => {
                setPhone(resp.data.number)
                setToken(resp.data.accessToken)
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
    const handleMouseEnterMenu = (index: number) => {
        setHoveredRowMenu(index);
    };

    const handleMouseLeave = () => {
        setHoveredRow(null);
    };
    const handleMouseLeaveMenu = () => {
        setHoveredRowMenu(null);
    };

    const history = useNavigate();
    function SendTemplate(name: string, variableQuantity: number, qtButtons: number, headerConfig: string | null, templateID: string) {
        console.log(headerConfig)
        history(`/template-trigger?bot_id=${botId}`, { state: { templateName: name, variableQuantity: variableQuantity, urlLogo: profilePic, phone: phone, headerConfig: headerConfig, qtButtons: qtButtons, templateID: templateID } });
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

        while ((match = regex.exec(texto)) !== null) {
            if (match[1]) {
                numeros.push(parseInt(match[1]));
            }
        }

        if (numeros.length > 0) {
            return Math.max(...numeros);
        } else {
            return -1;
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
                SendTemplate(templates[id].name, encontrarMaiorNumero(element.parameters[0].text), hasManyButtons(templates[id].components), hasMedia(templates[id].components), templates[id].ID)
        });
    }
    const deleteTemplate = (id: number) => {
        setMenuOpen(false);
        waitingMessage()
        api.delete(`https://whatsapp.smarters.io/api/v1/messageTemplates/${templates[id].name}`, { headers: { 'Authorization': token } })
            .then(res => {
                successMessageDeleteTemplate()
                api.get('https://whatsapp.smarters.io/api/v1/messageTemplates', { headers: { 'Authorization': token } })
                .then(resp => {
                    setTemplates(resp.data.data.messageTemplates)
                })
            })
            .catch(error => {
                errorMessage()
                console.log(error)
            })
    }
    const duplicaTemplate = (id: number) => {
        setMenuOpen(false);
        let variableQuantity = 0;
        let bodyText = "";
        templates[id].components.forEach((element: any) => {
            if (element.type === "body"){
                variableQuantity = encontrarMaiorNumero(element.parameters[0].text);
                bodyText = element.parameters[0].text;
            }
        });
        history(`/template-create?bot_id=${botId}`, { 
            state: { 
                duplicated: true,
                variableQuantity: variableQuantity, 
                urlLogo: profilePic, 
                phone: phone, 
                headerConfig: hasMedia(templates[id].components), 
                qtButtons: hasManyButtons(templates[id].components),
                bodyText: bodyText
            } 
        });
    }

    const dadosFiltrados = templates.filter(template =>
        template.name.toLowerCase().includes(filtro.toLowerCase())
      );

      const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value);
      };

    return (
        <div style={{width:"95%", padding:"10px 0px"}}>
            <ToastContainer />
            <div>
                <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                    {isLoading ? (<div className="spinner-container">
                        <div className="spinner"></div>
                    </div>)
                        : <img onLoad={handleImageLoad} src={profilePic} width={60} height={60} alt='logo da empresa' style={{ marginBottom: "-30px" }} />}
                </div>
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">Gerenciar Templates</h1>
                <div className="hr_color" style={{width:"100%", marginTop:"15px"}}></div>
                <div style={{margin:"20px"}}>
                    <input onChange={handleFiltroChange} value={filtro} type="text" style={{borderRight:"none", width:"300px", borderRadius:"20px 0px 0px 20px", paddingLeft:"20px"}} placeholder="Buscar por nome ou template"/>
                    <button style={{borderLeft:"none", borderRadius:"0px 20px 20px 0px", width:"50px"}}>
                        <img src={loupe} alt="" width={20} height={20}/>
                    </button>
                </div>
                <div>
                <table className="table-2024 fixed-header-table" style={{textAlign:"left"}}>
                    <thead>
                        <tr className="cells table-2024 border-bottom-zero">
                            {/* <th className="cells" style={{borderRight:"1px solid #aaa"}}>ID do template</th> */}
                            <th className="cells">Nome do template</th>
                            <th className="cells" style={{textAlign:"center"}}>Status</th>
                            <th className="cells" style={{textAlign:"center"}}>Categoria</th>
                            <th className="cells" style={{textAlign:"center"}}>Idioma</th>
                            <th className="cells" style={{textAlign:"center"}}>Menu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dadosFiltrados.map((template, index) => (
                            <tr
                                key={index}
                                style={{ border: '1px solid #0171BD', backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {/* <td className="cells"><span style={{ color: "blue", fontSize: "12px" }}>{template.ID}</span></td> */}
                                <td><span>{template.name}</span></td>
                                <td style={{textAlign:"center"}}><div style={{ borderRadius: "20px", padding: "7px" }}><span style={{ color: template.status === "APPROVED" ? "green" : template.status === "PENDING" ? "yellow" : "red" }}>{template.status === "APPROVED" ? "Aprovado" : template.status === "PENDING" ? "Pendente" : "Rejeitado"}</span></div></td>
                                <td style={{textAlign:"center"}}><span>{template.category.toLowerCase()}</span></td>
                                <td style={{textAlign:"center"}}><span>{template.language}</span></td>
                                <td style={{textAlign:"center"}}><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
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
                            backgroundColor: '#fff',
                            borderRadius:"20px"
                        }}
                    ><ul className="blue-text no-bullets">
                                <li key={1} className="menu-line" style={{backgroundColor: hoveredRowMenu === 1 ? '#e4e4e4' : 'white', borderTopRightRadius:"20px", borderTopLeftRadius:"20px" }}
                                    onMouseEnter={() => handleMouseEnterMenu(1)}
                                    onMouseLeave={handleMouseLeaveMenu}><td onClick={() => sendtemplate(selectedRow)}>Criar campanha</td></li>
                                <li key={2} className="menu-line" style={{ backgroundColor: hoveredRowMenu === 2 ? '#e4e4e4' : 'white'}}
                                    onMouseEnter={() => handleMouseEnterMenu(2)}
                                    onMouseLeave={handleMouseLeaveMenu}> <td onClick={() => loadTemplate(selectedRow)}>Visualizar</td></li>
                                <li key={3} className="menu-line" style={{ backgroundColor: hoveredRowMenu === 3 ? '#e4e4e4' : 'white'}}
                                    onMouseEnter={() => handleMouseEnterMenu(3)}
                                    onMouseLeave={handleMouseLeaveMenu}><td onClick={() => duplicaTemplate(selectedRow)}>Duplicar</td></li>
                                <li key={4} className="menu-line" style={{ backgroundColor: hoveredRowMenu === 4 ? '#e4e4e4' : 'white', borderBottom:"none", borderBottomRightRadius:"20px", borderBottomLeftRadius:"20px"}}
                                    onMouseEnter={() => handleMouseEnterMenu(4)}
                                    onMouseLeave={handleMouseLeaveMenu}><td onClick={() => deleteTemplate(selectedRow)}>Deletar</td></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListAll;