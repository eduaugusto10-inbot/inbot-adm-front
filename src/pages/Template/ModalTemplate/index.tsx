import React from "react";
import whatsappBackground from '../../../img/background_1_compressed.png';
import './style.css';
export function ModalTemplate(props: any) {

    const findText = (obj: any, type: string) => {
        if (!obj || !Array.isArray(obj)) {
            return "";
        }
        const found = obj.find((comp: any) => comp.type?.toUpperCase() === type.toUpperCase());
        return found?.parameters?.[0]?.text || "";
    }

    const findButton = (obj: any) => {
        if (!obj || !Array.isArray(obj)) {
            return [];
        }
        return obj.filter((comp: any) => comp.type === "button")?.flatMap((comp: any) => comp.parameters) || [];
    }

    return (
        <div>
            <div style={{ position: "fixed", alignContent: "end", textAlign: "end", right: "100px", bottom: "0px", zIndex: "2" }}>
                <img src={whatsappBackground} alt="Logo" width={350} height={600} />
                <div className="overlay-text">
                    <div className="texts" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', backgroundColor: "none" }}>
                            {findText(props.modalTemplate.components, "HEADER")}
                        </label>
                        <label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                            {findText(props.modalTemplate.components, "BODY")}
                        </label>
                        <label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize: "12px" }}>
                            {findText(props.modalTemplate.components, "FOOTER")}
                        </label>
                        {findButton(props.modalTemplate.components).map((button: any, index: number) => (
                            <div key={index} className="quickReply-texts">
                                <div className="quick-reply"><label>{button.text}</label></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalTemplate;
