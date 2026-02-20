import React from "react";
import "./index.css";
import alert from "../../img/help_blue.png";
import alertWarning from "../../img/circle-info-solid.svg";

interface AlertProps {
  message: string;
  variant?: "default" | "warning";
}

const Alert: React.FC<AlertProps> = ({ message, variant = "default" }) => {
  const formattedMessage = { __html: message };
  const isWarning = variant === "warning";
  return (
    <div
      className={`container-alert ${isWarning ? "container-alert-warning" : ""}`}
    >
      <div>
        <img
          src={isWarning ? alertWarning : alert}
          alt="alerta"
          width={20}
          style={{ margin: "10px" }}
        />
      </div>
      <div className="div-text">
        <span
          className={`span-12 ${isWarning ? "span-12-warning" : ""}`}
          dangerouslySetInnerHTML={formattedMessage}
        ></span>
      </div>
    </div>
  );
};

export default Alert;
