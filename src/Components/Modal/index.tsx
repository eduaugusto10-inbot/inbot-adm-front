import React, { ReactNode, useState } from "react";
import './style.css'

interface ModalType {
    children?: ReactNode;
    isOpen: boolean;
    question: string;
    toggle: () => void;
    onButtonClick: (buttonId: string) => void;
    modalRef: React.RefObject<HTMLDivElement>;
    buttonA: string;
    buttonB: string;
    warning: boolean;
    text: string;
}

export default function Modal(props: ModalType) {
    const [loading, setLoading] = useState<boolean>(false)
    const handleButtonClick = (buttonId: string) => {
        props.onButtonClick(buttonId);        
        setLoading(false);
    };
    const handleButtonClickA= (buttonId: string) => {
        if(props.buttonA!=="Sim" && props.buttonA!=="Fechar") { 
            setLoading(true);
        }
        if(buttonId === "Fechar" || buttonId === "Deletar") {
            setLoading(false)
        }
        if(buttonId === "Cancelar") {
            setLoading(false)
        }
        if(buttonId === "Não") {
            setLoading(false)
        }
    
        props.onButtonClick(buttonId);
    };
    const handleButtonClickB = (buttonId: string) => {
        if(props.buttonB === "Salvar") { 
            setLoading(false);
        }
        if(buttonId === "Fechar" || buttonId === "Voltar" || buttonId === "Alterar" || buttonId === "Deletar") {
            setLoading(false)
        }
        props.onButtonClick(buttonId);
        // props.toggle()
    };
    const clickOutModal = () => {
        props.toggle()
        setLoading(false);
    }

    return (
        <>
            {props.isOpen && (
                <div ref={props.modalRef} className="modal-overlay" onClick={clickOutModal}>
                    <div onClick={(e) => e.stopPropagation()} className="modal-box">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", width: "100%" }}>
                            <h4 style={{ paddingBottom: "12px", color: "#0d5388" }}>{props.question}</h4>
                            <span 
                                onClick={() => {
                                    props.buttonA==="Sim" || props.buttonB==="Fechar" ? handleButtonClick(props.buttonB) : handleButtonClick(props.buttonA)
                                }}
                                style={{ color: "#a06060", fontWeight: "bolder", cursor: "pointer", justifySelf: "end" }}>X</span>
                        </div>
                        <div className="column-align">
                            <span></span>
                            {props.warning && <span style={{ color:"#0d5388", fontWeight:"bold", fontSize: props.buttonB === "OK" ? "12px": "16px" }}>{props.text}</span>}
                            {props.children}
                            <div style={{ marginTop: props.buttonB === "OK" ? "15px":"30px", display: "flex", justifyContent: "center" }}>
                                {props.buttonA!=="NaoExibir" && <button onClick={() => handleButtonClickA(props.buttonA)} style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: loading ? "#c3c3c3" : "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }}>{props.buttonA}</button>}
                                {props.buttonB!=="NaoExibir" && <button onClick={() => handleButtonClickB(props.buttonB)} style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: loading ? "#c3c3c3" : "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }}>{props.buttonB}</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
