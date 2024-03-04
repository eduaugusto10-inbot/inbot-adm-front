import React, { useState } from "react";
import './index.css'
import whatsappBackground from '../../../img/background.jpg';
import { IQuickReply, ITemplate, templateValue } from "../../types";

export function CreateTemplate() {
    const [template, setTemplate] = useState<ITemplate>(templateValue)
    const [quickReplies, setQuickReplies] = useState<IQuickReply[]>([])
    const [templateName, setTemplateName] = useState<string>("")
    const [buttons, setButtons] = useState(0)

    const handleSaveTemplate = () => {
        if (quickReplies.length > 0) {
            setTemplate(prevState => ({
                ...prevState,                
                parameters: quickReplies
            }));
        }
    const templateJSON = {
        name: templateName,
        category: "MARKETING",
        language: "pt-BR",
        components: template
    }
    console.log(templateJSON)
}
const handleAddItem = () => {
    const newQR = { type: "quickReply", text: "Botão" }
    if (buttons < 3) {
        setButtons(buttons + 1)
        setQuickReplies([...quickReplies, newQR]);
    }
}

const handleDeleteItem = () => {
    const index = buttons - 1;
    if (buttons > 0) {
        setButtons(buttons - 1)
        const novaLista = [...quickReplies];
        novaLista.splice(index, 1);
        setQuickReplies(novaLista);
    } else {
        setQuickReplies([])
    }
};
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setTemplate(prevState => ({
        ...prevState,
        [name]: value,
    }));
};
const handleQuickReplyChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = event.target;
    const novaLista = quickReplies.map((reply, i) => {
        if (i === index) {
            return { ...reply, text: value };
        }
        return reply;
    });
    setQuickReplies(novaLista);
};


return (
    <div className="container">
        <div className="input">
            <span>Nome do template</span>
            <input type="text"
                maxLength={512}
                name="templateName"
                value={templateName}
                onChange={e => setTemplateName(e.target.value.trim().replace(/[^a-zA-Z\s]/g, '').toLowerCase())}
            />
            <span>Header</span>
            <span>{60 - template.header.length}/60</span>
            <input type="text"
                maxLength={60}
                name="header"
                value={template.header}
                onChange={handleInputChange}
            />
            <span>Body</span>
            <span>{1024 - template.body.length}/1024</span>
            <textarea
                maxLength={1024}
                name="body"
                value={template.body}
                onChange={handleInputChange}
            />
            <span>Rodapé</span>
            <span>{60 - template.footer.length}/60</span>
            <input type="text"
                maxLength={60}
                name="footer"
                value={template.footer}
                onChange={handleInputChange}
            />
            {buttons > 0 && (
                <div>
                    <input
                        value={quickReplies[0].text}
                        onChange={e => handleQuickReplyChange(e, 0)}
                        maxLength={20} />
                    <span>{20 - quickReplies[0].text.length}/20</span>
                </div>
            )}
            {buttons > 1 && (
                <div>
                    <input
                        value={quickReplies[1].text}
                        onChange={e => handleQuickReplyChange(e, 1)}
                        maxLength={20} />
                    <span>{20 - quickReplies[1].text.length}/20</span>
                </div>
            )}
            {buttons > 2 && (
                <div>
                    <input
                        value={quickReplies[2].text}
                        onChange={e => handleQuickReplyChange(e, 2)}
                        maxLength={20} />
                    <span>{20 - quickReplies[2].text.length}/20</span>
                </div>
            )}
            <button onClick={handleAddItem}>Adicionar botão</button>
            <button onClick={handleDeleteItem}>Deletar botão</button>
            <button onClick={handleSaveTemplate}>Salvar</button>
        </div>
        <div className="image-container">
            <img src={whatsappBackground} alt="Logo" width={300} height={600} />
            <div className="overlay-text">
                <div className="texts">
                    {<label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{template.header}</label>}
                    {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {template.body}</label>}
                    {<label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{template.footer}</label>}
                    <div className="quickReply-texts">
                        {buttons > 0 && (<div className="quick-reply"><label >{quickReplies[0].text}</label></div>)}
                        {buttons > 1 && (<div className="quick-reply"><label >{quickReplies[1].text}</label></div>)}
                        {buttons > 2 && (<div className="quick-reply"><label >{quickReplies[2].text}</label></div>)}
                    </div>
                </div>
            </div>
        </div>
    </div>
)
}

export default CreateTemplate;