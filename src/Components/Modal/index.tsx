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
}

export default function Modal(props: ModalType) {
    const [loading, setLoading] = useState<boolean>(false)
    const [hiddenBtn, setHiddenBtn] = useState<boolean>(true)
    const handleButtonClick = (buttonId: string) => {
        props.onButtonClick(buttonId);
        setLoading(false);
    };
    const handleButtonClickSave = (buttonId: string) => {
        props.onButtonClick(buttonId);
        if(props.buttonA!=="Sim" && props.buttonA!=="Fechar") { 
            setLoading(true);
        }
        if(props.buttonB!=="Salvar") { 
            setLoading(true);
        }
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
                                    props.buttonA==="Sim" ? handleButtonClick(props.buttonB) : handleButtonClick(props.buttonA)
                                }}
                                style={{ color: "#a06060", fontWeight: "bolder", cursor: "pointer", justifySelf: "end" }}>X</span>
                        </div>
                        <div className="column-align">
                            <span></span>
                            <span style={{ color:"#0d5388", fontWeight:"bold" }}>{props.buttonB!=="NaoExibir" ? "Essa ação não poderá ser desfeita." : "Clique em fechar para continuar"}</span>
                            <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
                                <button onClick={() => handleButtonClickSave(props.buttonA)} style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: loading ? "#c3c3c3" : "#df383b", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }}>{props.buttonA}</button>
                                {props.buttonB!=="NaoExibir" && <button onClick={() => handleButtonClickSave(props.buttonB)} style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: loading ? "#c3c3c3" : "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }}>{props.buttonB}</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
