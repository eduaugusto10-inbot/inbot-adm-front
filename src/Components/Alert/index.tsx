import React from "react"
import "./index.css"
import alert from "../../img/help.png"
interface AlertProps {
    message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
    const formattedMessage = {__html: message};
    return (
        <div className="container-alert">
            <div>
                <img src={alert} alt="alerta" width={20} style={{ margin: "10px" }} />
            </div>
            <div className="div-text">
                <span className="span-12" dangerouslySetInnerHTML={formattedMessage}></span>
            </div>
        </div>
    )
}

export default Alert;