import React from "react";
import whatsappBackground from '../../../img/background.jpeg';

export function ModalTemplate(props: any) {

    const findText = (obj: any, type: string) => {
        let response = ""
        for (let index = 0; index < obj.length; index++) {
            if (obj[index].type === type) {
                response = obj[index].parameters[0].text;
            }
        }
        return response;
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

    return (
        <div>
            <div className="image-container rigth fixed" style={{ position: "fixed", alignContent: "end", textAlign: "end", right: "100px", bottom: "0px" }}>
                <img src={whatsappBackground} alt="Logo" width={350} height={600} />
                <div className="overlay-text">
                    <div className="texts">
                        {<label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{findText(props.modalTemplate.components, "header")}</label>}
                        {/* {typeOfHeader === "image" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={midia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "document" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><img src={midia} style={{ maxWidth: '100%', maxHeight: '200px' }} alt="" /></label>}
                        {typeOfHeader === "video" && <label className="header" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}><video width="160" height="120" controls><source src={midia} type="video/mp4" /></video></label>} */}
                        {<label style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}> {findText(props.modalTemplate.components, "body")}</label>}
                        {<label className="footer" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize:"12px" }}>{findText(props.modalTemplate.components, "footer")}</label>}
                        {findButton(props.modalTemplate.components, "button") !== undefined && findButton(props.modalTemplate.components, "button").map((button: { text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                            <div className="quickReply-texts">
                                <div className="quick-reply"><label >{button.text}</label></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalTemplate;