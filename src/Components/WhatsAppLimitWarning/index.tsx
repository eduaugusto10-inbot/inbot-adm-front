import React from "react";
import "./index.css";
import alert from "../../img/help_blue.png";

interface WhatsAppLimitWarningProps {
  metaUrl: string;
}

export function WhatsAppLimitWarning({ metaUrl }: WhatsAppLimitWarningProps) {
  return (
    <div className="container-alert">
      <div>
        <img src={alert} alt="alerta" width={20} style={{ margin: "10px" }} />
      </div>
      <div className="div-text">
        <span className="span-12 texto-alinhado">
          <strong>Atenção ao limite de disparos</strong>
          <br />
          Antes de criar sua campanha, verifique o limite de disparos disponível
          para o seu número WhatsApp. Campanhas que excedam este limite podem
          falhar ou ser bloqueadas pela Meta.
          <br />
          <br />
          <a
            href={metaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button-next"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0d5388",
              color: "white",
              padding: "8px 15px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13.6px",
              fontWeight: "bold",
              border: "none",
              textAlign: "center",
              lineHeight: "1.2",
            }}
          >
            Verificar limite na Meta
          </a>
          <br />
          <small
            style={{
              fontSize: "10px",
              color: "#666",
              marginTop: "5px",
              display: "block",
            }}
          >
            *Você será redirecionado para a página oficial da Meta onde poderá
            consultar os limites do seu número.
          </small>
        </span>
      </div>
    </div>
  );
}
