import Draggable from "react-draggable"
import xis from '../../img/x.svg'
import setaDiagonal from '../../img/seta-diagonal.svg'
import './style.css'

interface DraggableComponentProps {
    urlVideo: string;
    showVideo: () => void;
  }
  
  export function DraggableComponent({ urlVideo, showVideo }: DraggableComponentProps) {
    
    return(
    <div>
        <Draggable handle=".handle" defaultPosition={{ x: 0, y: 0 }}>
            <div className="draggable">
                <div className="column-align draggable-sub">
                <div className="handle" style={{width:"100%"}}>
                <div className="handle-sub" >
                    <img src={setaDiagonal} alt="alerta" width={20}  />
                    <div style={{width:"100px", height:"2px", backgroundColor:"#FFF"}}></div>
                    <div style={{width:"20px", cursor:"pointer", marginRight:"4px"}} onClick={showVideo}>
                        <img src={xis} alt="fechar" width={25}  />
                    </div>
                </div>
                </div>
                <div  className="iframe-div">
                <iframe
                    src={urlVideo}
                    allow="fullscreen"
                    style={{
                    borderRadius:"0px 13px 13px 13px",
                    width: "100%",
                    height: "100%",
                    }}
                    title="Loom Video"
                ></iframe>
                </div>
                </div>
            </div>
        </Draggable>
    </div>)
}