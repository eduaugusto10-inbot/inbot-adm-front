import React from "react";

export function WarningNoWhats() {
    return(
    <div className="column-align" style={{width:"95%", alignItems:"center" }}>
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width:"100%" }} className="title_2024">Campanhas</h1>
            <div className="column-align" style={{alignItems:"center"}}>
                <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
            </div>
            <div className="div_color" style={{width:"80%", textAlign:"left", marginTop:"20px"}}>
            <span>Olá! 😊</span>
            <br />
            <br />
            <span>A função de campanhas é exclusiva para números de WhatsApp. Com ela, você pode enviar mensagens ativas para seus clientes, colaboradores ou parceiros, iniciando conversas e jornadas para vender, orientar, confirmar ou realizar outras interações importantes.</span>
            <br />
            <br />
            <span>Essa ferramenta é poderosa e pode impulsionar os resultados em atendimento, vendas e muito mais. Imagine enviar ofertas exclusivas, confirmar compromissos, orientar sobre novos produtos ou serviços, e manter seus contatos sempre engajados!</span>
            <br />
            <br />
            <span>Obrigado pelo interesse em explorar essa funcionalidade. Abaixo, você encontrará um vídeo explicando como ela funciona. Se quiser habilitar seu número de WhatsApp e expandir as possibilidades da sua operação, entre em contato com nosso time comercial.</span>
            <br />
            <br />
            <div className="column-align" style={{textAlign:"center", alignItems:"center"}}>
                <span style={{fontWeight:"bold", marginBottom:"20px"}}>O número comercial da InBot é (11) 97344-8511</span>
                <button className="button-save" style={{width:"200px", color:"white", fontWeight:"bolder", fontSize:"12px", border:"none", borderRadius:"8px"}}>WhatsApp Comercial</button>
                <br />
                <span>Ah, e caso prefira, você também pode nos enviar um <strong>e-mail para o endereço comercial@inbot.com.br.</strong></span>
                <br />
                <button className="button-blue" style={{width:"200px"}}>E-mail Comercial</button>
                <br />
                <span>Estamos sempre prontos para te atender da melhor forma possível!</span>
            </div>
        </div>
    </div>
    )
}

export default WarningNoWhats;