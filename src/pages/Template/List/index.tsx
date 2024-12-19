import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import './style.css'
import api from "../../../utils/api";
import { ITemplateList } from "../../types";
import dots from "../../../img/dots.png"
import { useNavigate } from "react-router-dom";
import ModalTemplate from "../ModalTemplate";
import { useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { errorMessage, successMessageDeleteTemplate, waitingMessage } from "../../../Components/Toastify";
import loupe from '../../../img/loupe.png'
import  {validatedUser}  from "../../../utils/validateUser";

export function ListAll() {
    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('bot_id') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    var botId = searchParams.get('bot_id') ?? "0";
    const history = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const logged = await validatedUser(searchParams.get('bot_id'), searchParams.get('token')) ?? false;               
                if (!logged) {
                    history(`/template-warning-no-whats?bot_id=${botId}`);
                    return;
                }
    
                const resp = await api.get(`/whats-botid/${botId}`);
                setPhone(resp.data.number);
                setToken(resp.data.accessToken);
    
                const token = resp.data.accessToken;
                const templatesResp = await api.get('https://whatsapp.smarters.io/api/v1/messageTemplates', {
                    headers: { 'Authorization': token }
                });
                setTemplates(templatesResp.data.data.messageTemplates);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
    
        if (searchParams.get('bot_id') === null) {
            window.location.href = "https://in.bot/inbot-admin";
        } else {
            fetchData();
        }
    }, []);
    
    const [modal, setModal] = useState<boolean>(false)
    const [modalObject, setModalObject] = useState<any>()
    const [templates, setTemplates] = useState<ITemplateList[]>([])
    const [phone, setPhone] = useState<string>("")
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [headerText, setHeaderText] = useState("")
    const [loading, setLoading] = useState<boolean>(true)
    const [hoveredRowMenu, setHoveredRowMenu] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [filtro, setFiltro] = useState<string>('');
    const [token, setToken] = useState<string>('')
    const [sortType, setSortType] = useState<string>("")
    const [sortOrder, setOrderSort] = useState<string>("")
    const [buttonsDuplicated, setButtonsDuplicated] = useState<any>()
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
    const handleMouseEnterMenu = (index: number) => {
        setHoveredRowMenu(index);
    };

    const handleMouseLeave = () => {
        setHoveredRow(null);
    };
    const handleMouseLeaveMenu = () => {
        setHoveredRowMenu(null);
    };
    
    function SendTemplate(name: string, variableQuantity: number, qtButtons: number, headerConfig: string | null, templateID: string) {
        history(`/template-trigger?bot_id=${botId}&token=${searchParams.get("token")}`, { state: { templateName: name, variableQuantity: variableQuantity, urlLogo: "", phone: phone, headerConfig: headerConfig, qtButtons: qtButtons, templateID: templateID } });
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
                        setHeaderText(element.parameters[0].text)
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
    const hasHeaderText = (headerElement: any) => {
        let headerText = null;
        headerElement.forEach((element: any) => {
            if (element.type === "header") {
                switch (element.parameters[0].type) {
                    case "text":
                        headerText = element.parameters[0].text
                        break;
                    default:
                        break;
                }
            }
        });
        return headerText;
    }
    const hasFooterText = (headerElement: any) => {
        let footerText = null;
        headerElement.forEach((element: any) => {
            if (element.type === "footer") {
                switch (element.parameters[0].type) {
                    case "text":
                        footerText = element.parameters[0].text
                        break;
                    default:
                        break;
                }
            }
        });
        return footerText;
    }
    const hasFooter = (headerElement: any) => {
        let footer = "srodape";
        headerElement.forEach((element: any) => {
            if (element.type === "footer") {
                switch (element.parameters[0].type) {
                    case "text":
                        footer = "rodape"
                        break;
                    default:
                        break;
                }
            }
        });
        return footer;
    }

    const findButton = (obj: any, type: string) => {
        let response = []
        for (let index = 0; index < obj.length; index++) {
            if (obj[index].type === type) {
                response.push(obj[index].parameters);
            }
        }
        return response[0];
    }

    const hasManyButtons = (headerElement: any) => {
        let buttons = 0;
        headerElement.forEach((element: any) => {
            if (element.type === "button") {
                setButtonsDuplicated(element.parameters)
                if (element.parameters[0].type === "quickReply") {
                    buttons = element.parameters.length;
                }
            }
        });
        return buttons;
    }

    const sendtemplate = (id: number) => {
        const sortTemplates = handleSort(dadosFiltrados);
        sortTemplates[id].components.forEach((element: any) => {
            if (element.type === "body")
                SendTemplate(sortTemplates[id].name, encontrarMaiorNumero(element.parameters[0].text), hasManyButtons(sortTemplates[id].components), hasMedia(sortTemplates[id].components), sortTemplates[id].ID)
        });
    }
    const deleteTemplate = (id: number) => {
        const sortTemplates = handleSort(dadosFiltrados);
        setMenuOpen(false);
        waitingMessage()
        api.delete(`https://whatsapp.smarters.io/api/v1/messageTemplates/${sortTemplates[id].name}`, { headers: { 'Authorization': token } })
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
        const sortTemplates = handleSort(dadosFiltrados);
        setMenuOpen(false);
        let variableQuantity = 0;
        let bodyText = "";
        sortTemplates[id].components.forEach((element: any) => {
            if (element.type === "body"){
                variableQuantity = encontrarMaiorNumero(element.parameters[0].text);
                bodyText = element.parameters[0].text;
            }
        });
        const buttonsTexts = findButton(sortTemplates[id].components, "button")
        history(`/template-create?bot_id=${botId}&token=${searchParams.get("token")}`, { 
            state: { 
                duplicated: true,
                variableQuantity: variableQuantity, 
                urlLogo: "", 
                phone: phone, 
                category:sortTemplates[id].category,
                headerConfig: hasMedia(sortTemplates[id].components), 
                qtButtons: hasManyButtons(sortTemplates[id].components),
                buttons: buttonsDuplicated,
                bodyText: bodyText,
                buttonsContent: buttonsTexts,
                headerText: hasHeaderText(sortTemplates[id].components),
                footerText: hasFooterText(sortTemplates[id].components),
                rodapeConfig: hasFooter(sortTemplates[id].components)
            } 
        });
    }

    const dadosFiltrados = templates.filter(template =>
        template.name.toLowerCase().includes(filtro.toLowerCase())
      );

      const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value);
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

    return (
        <div style={{width:"95%", padding:"10px 0px"}}>
            <ToastContainer />
            <div>
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">Gerenciar Templates</h1>
                <div className="column-align" style={{alignItems:"center"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
                </div>
                <div style={{margin:"20px", display:"flex"}}>
                    <input onChange={handleFiltroChange} value={filtro} type="text" style={{borderRight:"none", width:"300px", borderRadius:"20px 0px 0px 20px", paddingLeft:"20px"}} placeholder="Buscar por nome ou template"/>
                    <button style={{borderLeft:"none", borderRadius:"0px 20px 20px 0px", width:"50px"}}>
                        <img src={loupe} alt="" width={20} height={20}/>
                    </button>
                </div>
                <div>
                {loading && 
                    <div className="modal-overlay" style={{width:"100%", height:"100%", display:"flex", flexDirection:"column"}}>
                        <div className="in_loader" style={{width:"50px", height:"50px"}}></div>
                        <h4>Carregando</h4>
                    </div>}
                    <div className="row-align" style={{margin: "20px"}}>
                        <span>Whatsapp</span>
                        <div className="switch switch-off" style={{margin:"0px 10px"}} onClick={() => history(`/template-list-teams?bot_id=${botId}&token=${searchParams.get("token")}`)}>
                            <div className="slider slider-off" />
                        </div>
                        <span>Teams</span>
                    </div>
                {!loading && <div>
                    <table className="table-2024 fixed-header-table" style={{textAlign:"left"}}>
                        <thead>
                            <tr className="cells table-2024 border-bottom-zero">
                                <th className="cells" style={{width:"100px"}}><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Nome do template</span> <div><div className="triangle-up" onClick={()=>handleInitSort("name","asc")}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("name","desc")}></div></div></div></th>
                                <th className="cells" style={{textAlign:"center"}}><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Status</span> <div><div className="triangle-up" onClick={()=>handleInitSort("status","asc")}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("status","desc")}></div></div></div></th>
                                <th className="cells" style={{textAlign:"center"}}><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Categoria</span> <div><div className="triangle-up" onClick={()=>handleInitSort("category","asc")}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("category","desc")}></div></div></div></th>
                                <th className="cells" style={{textAlign:"center"}}><div className="row-align" style={{justifyContent: "space-between", alignItems:"center"}}><span></span><span>Idioma</span> <div><div className="triangle-up" onClick={()=>handleInitSort("language","asc")}></div><div className="triangle-down" style={{marginTop:"2px"}}  onClick={()=>handleInitSort("language","desc")}></div></div></div></th>
                                <th className="cells" style={{textAlign:"center"}}>Menu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {handleSort(dadosFiltrados).map((template, index) => (
                                <tr
                                    key={index}
                                    style={{ border: '1px solid #0171BD', backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <td style={{width:"100px"}}><span>{template.name}</span></td>
                                    <td style={{textAlign:"center"}}><div style={{ borderRadius: "20px", padding: "7px" }}><span style={{ color: template.status === "APPROVED" ? "green" : template.status === "PENDING" ? "orange" : "red" }}><strong>{template.status === "APPROVED" ? "Aprovado" : template.status === "PENDING" ? "Pendente" : "Rejeitado"}</strong></span></div></td>
                                    <td style={{textAlign:"center"}}><span>{template.category.toLowerCase()}</span></td>
                                    <td style={{textAlign:"center"}}><span>{template.language}</span></td>
                                    <td style={{textAlign:"center"}}><span onClick={(e) => handleOptionClick(index, e)}><img src={dots} width={20} alt="menu" style={{ cursor: "pointer" }} /></span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
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