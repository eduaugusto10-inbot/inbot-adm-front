import React from "react";
import whatsappBackground from '../../../img/background_1_compressed.png';

export function ModalTemplate(props: any) {

    return (
        <div>
            <div style={{ position: "fixed", width:"350px", height:"350px", alignContent: "end", textAlign: "end", right: "100px", bottom: "0px", zIndex:"2" }}>
                <div className="overlay-text">
                    <div className="texts">
                        <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', backgroundColor: "none" }}>{props.modalTemplate.hasHeader > 0 ? props.modalTemplate.message : ''}</label>
                        <label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {props.modalTemplate.message}</label>
                        {props.modalTemplate.hasButton > 0 && props.modalTemplate.buttons.map((button: { title: string | null | undefined; }) => (
                            button.title != null && <div className="quickReply-texts">
                                <div className="quick-reply-teams"><label >{button.title}</label></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalTemplate;