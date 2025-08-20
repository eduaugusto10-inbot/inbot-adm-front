import React from "react";

interface WhatsAppLimitWarningProps {
    metaUrl: string;
}

export function WhatsAppLimitWarning({ metaUrl }: WhatsAppLimitWarningProps) {
    return (
        <div className="whatsapp-limit-warning" style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "15px"
        }}>
            <div style={{ 
                backgroundColor: "#FEF5E7", 
                borderRadius: "50%", 
                width: "30px", 
                height: "30px", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                flexShrink: 0
            }}>
                <span style={{ color: "#E67E22", fontWeight: "bold", fontSize: "18px" }}>!</span>
            </div>
            <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#324d69", fontSize: "16px" }}>Atenção ao limite de disparos</h4>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", lineHeight: "1.5" }}>
                    Antes de criar sua campanha, verifique o limite de disparos disponível para o seu número WhatsApp.
                    Campanhas que excedam este limite podem falhar ou ser bloqueadas pela Meta.
                </p>
                <a 
                    href={metaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                        display: "inline-block",
                        backgroundColor: "#0171BD",
                        color: "white",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "bold"
                    }}
                >
                    Verificar limite na Meta
                </a>
                <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#666" }}>
                    *Você será redirecionado para a página oficial da Meta onde poderá consultar os limites do seu número.
                </p>
            </div>
        </div>
    );
}