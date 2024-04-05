import React, { useEffect, useRef, useState } from "react";
import './style.css'
import api from "../../../../utils/api";
import { ITemplateList } from "../../../types";
import dots from "../../../../img/dots.png"
import { useNavigate } from "react-router-dom";
import ModalTemplate from "../../ModalTemplate";
import { useSearchParams } from "react-router-dom";

interface Row {
    id: number;
    nome: string;
}

export function ListAll() {
    const [searchParams, setSearchParams] = useSearchParams();
    var botId = searchParams.get('bot_id');

    const [modal, setModal] = useState<boolean>(false)
    const [modalObject, setModalObject] = useState<any>()
    const [templates, setTemplates] = useState<ITemplateList[]>([])
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [profilePic, setProfilePic] = useState<string>("")
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
    function CreateTemplate() {
        history("/template-create");
    }
    function SendTemplate(name: string, variableQuantity: number) {
        history("/template-trigger", { state: { templateName: name, variableQuantity: variableQuantity } });
    }

    useEffect(() => {
        api.get(`https://webhooks.inbot.com.br/inbot-adm-back/v1/gateway/whats-botid/${botId}`)
            .then(resp => {
                const token = resp.data.accessToken;
                api.get('https://whatsapp.smarters.io/api/v1/messageTemplates', { headers: { 'Authorization': token } })
                    .then(resp => setTemplates(resp.data.data.messageTemplates))
                api.get("https://whatsapp.smarters.io/api/v1/settings", { headers: { 'Authorization': token } })
                    .then(res => {
                        console.log(res)
                        setProfilePic(res.data.data.profile_pic)
                    })
                    .catch(error => console.log(error))
            })
    }, []);

    const loadTemplate = (id: number) => {
        setModalObject(templates[id])
        setModal(prevState => !prevState)
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

    const sendtemplate = (id: number) => {
        templates[id].components.forEach((element: any) => {
            if (element.type === "body")
                SendTemplate(templates[id].name, encontrarMaiorNumero(element.parameters[0].text))
        });
    }
    return (
        <div style={{ margin: "40px" }}>
            <div>
                <img src={profilePic} width={200} height={200} alt='logo da empresa' style={{ margin: "7px", border: "1px solid #000", padding: "7px" }} />
                <button onClick={CreateTemplate} style={{ margin: "10px", backgroundColor: "#010043", border: "1px solid #010043" }}>Novo Template</button>
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

export default ListAll;