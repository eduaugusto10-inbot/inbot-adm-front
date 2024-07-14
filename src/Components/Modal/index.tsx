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
    const handleButtonClick = (buttonId: string) => {
        props.onButtonClick(buttonId);
        setLoading(false);
    };
    const handleButtonClickSave = (buttonId: string) => {
        props.onButtonClick(buttonId);
        setLoading(true);
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
                        <div style={{width:"100%", textAlign:"end"}}>
                            <span 
                                onClick={() => handleButtonClick(props.buttonA)}
                                style={{color:"#a06060", fontWeight:"bolder", cursor:"pointer"}}>X</span>
                        </div>
                        <div className="column-align" style={{ height:"100%" }}>
                            <h4 style={{ paddingBottom:"20px", color:"#0d5388" }}>{props.question}</h4>
                            <span></span>
                            <span style={{ color:"#0d5388", fontWeight:"bold" }}>Essa ação não poderá ser desfeita.</span>
                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <button onClick={() => handleButtonClickSave(props.buttonB)} style={{ margin: "5px", width: "80px", height: "30px", borderRadius: "10px", backgroundColor: loading ? "#c3c3c3" : "#5ed12c", color: "#FFF", border: "1px solid #a8a8a8", fontSize: "14px", fontWeight: "bolder" }} disabled={loading} >{loading ? <div className="in_loader"></div> : props.buttonB}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
