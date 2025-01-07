import React from "react";
import whatsappBackground from '../../../img/background_1_compressed.png';
import './style.css';
export function ModalTemplate(props: any) {

    const findText = (obj: any, type: string) => {
        return obj.find((comp: any) => comp.type === type)?.parameters[0]?.text || "";
    }

    const findButton = (obj: any, type: string) => {
        return obj.find((comp: any) => comp.type === "button")?.parameters || [];
    }

    return (
        <div>
            <div style={{ position: "fixed", alignContent: "end", textAlign: "end", right: "100px", bottom: "0px", zIndex: "2" }}>
                <img src={whatsappBackground} alt="Logo" width={350} height={600} />
                <div className="overlay-text">
                    <div className="texts" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                        <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', backgroundColor: "none" }}>
                            {findText(props.modalTemplate.components, "header")}
                        </label>
                        <label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                            {findText(props.modalTemplate.components, "body")}
                        </label>
                        <label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize: "12px" }}>
                            {findText(props.modalTemplate.components, "footer")}
                        </label>
                        {findButton(props.modalTemplate.components, "button") !== undefined && findButton(props.modalTemplate.components, "button").map((button: { text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                            <div className="quickReply-texts">
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
