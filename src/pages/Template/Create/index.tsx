import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import alert from "../../../img/help_blue.png";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import {
  erroMessageQuickReply,
  errorMessageHeader,
  errorMessageFooter,
  errorMessageBody,
  waitingMessage,
  successCreateTemplate,
  errorMessage,
  errorMessageConfig,
  errorVariableEmpty,
} from "../../../Components/Toastify";
import strings from "../strings.json";
import api from "../../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import whatsappBackground from "../../../img/background_1.png";
import "./index.css";
import attached from "../../../img/attachment.png";
import Alert from "../../../Components/Alert";
import {
  AccordionStateCreate,
  ButtonQR,
  IButton,
  IFooter,
  IHeader,
  IObject,
  ITemplate,
  IVariables,
  templateValue,
} from "../../types";
import { mask } from "../../../utils/utils";
import useModal from "../../../Components/Modal/useModal";
import Modal from "../../../Components/Modal";
import chevron from "../../../img/right-chevron.png";
import { validatedUser } from "../../../utils/validateUser";
import Draggable from "react-draggable";
import { DraggableComponent } from "../../../Components/Draggable";

export function CreateTemplateAccordion() {
  const history = useNavigate();
  function BackToList() {
    history(
      `/template-list?bot_id=${botId}&token=${searchParams.get(
        "token"
      )}&url_base_api=${searchParams.get("url_base_api")}`
    );
  }
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(true);
  const [isTeamsEnabled, setIsTeamsEnabled] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  if (searchParams.get("bot_id") === null) {
    window.location.href = "https://in.bot/inbot-admin";
  }
  var botId = searchParams.get("bot_id") ?? "0";

  const location = useLocation();
  useEffect(() => {
    const fetchData = async () => {
      const logged: any =
        (await validatedUser(
          searchParams.get("bot_id"),
          searchParams.get("token"),
          searchParams.get("url_base_api")
        )) ?? false;
      console.log(`Logged: ${JSON.stringify(logged)}`);
      if (!logged.logged) {
        history(`/template-warning-no-whats?bot_id=${botId}`);
      }
      if (logged.channel === "teams") {
        history(
          `/template-create-teams?bot_id=${botId}&token=${searchParams.get(
            "token"
          )}&url_base_api=${searchParams.get("url_base_api")}`
        );
      }
      if (logged.channel === "whats") {
        setIsTeamsEnabled(false);
      }
      api
        .get(`/whats-botid/${botId}`)
        .then((resp) => {
          setPhone(resp.data.number);
        })
        .catch((error) =>
          history(`/template-warning-no-whats?bot_id=${botId}`)
        );
    };
    fetchData();
  }, []);
  const [templateName, setTemplateName] = useState<string>("");
  const [templateType, setTemplateType] = useState<string>("");
  const [showTemplate, setShowTempalte] = useState<boolean>(true);
  const [hiddenVideo, setHiddenVideo] = useState<boolean>(false);
  const [accordionState, setAccordionState] = useState<AccordionStateCreate>({
    channelTrigger: true,
    config: false,
    header: false,
    body: false,
    footer: false,
    botao: false,
  });
  const [typeOfHeader, setTypeOfHeader] = useState<string>("sheader");
  const [rodapeType, setRodapeType] = useState<string>("srodape");
  const [headers, setHeader] = useState<IHeader>({
    parameters: [{ type: "sheader" }],
  });
  const [template, setTemplate] = useState<ITemplate>(templateValue);
  const [variables, setVariables] = useState<IVariables[]>([]);
  const [text, setText] = useState<string>("");
  const [rodape, setRodape] = useState<boolean>(true);
  const [buttons, setButtons] = useState<IButton[]>([]);
  const [buttonsCTA, setButtonsCTA] = useState<IButton[]>([]);
  const [typeOfButtons, setTypeOfButtons] = useState<string>("without");
  const [phone, setPhone] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const selectTemplate = (e: string) => {
    switch (e) {
      case "UTILITY":
        return strings.utilitario;
      case "AUTHENTICATION":
        return strings.autenticacao;
      case "MARKETING":
        return strings.marketing;
      default:
        return "Escolha uma das opções de Categoria";
    }
  };

  const showVideo = () => {
    console.log("Abre");
    setHiddenVideo(!hiddenVideo);
  };
  useEffect(() => {
    if (searchParams.get("bot_id") === null) {
      window.location.href = "https://in.bot/inbot-admin";
    }
    api
      .get(`/whats-botid/${botId}`)
      .then((resp) => {
        setPhone(resp.data.number);
      })
      .catch((error) => console.log(error));
    if (location?.state?.duplicated) {
      setTypeOfHeader(location?.state?.headerConfig);
      setRodape(location?.state?.rodapeConfig === "rodape" ? false : true);
      setRodapeType(location?.state?.rodapeConfig);
      location.state.duplicated = false;
      setTemplate((prevState) => ({
        ...prevState,
        body: location?.state?.bodyText,
        header: location?.state?.headerText,
        footer: location?.state?.footerText,
      }));
      const totalVariable = location.state.variableQuantity;
      setTemplateType(location?.state?.category);
      for (let i = 0; i < totalVariable; i++) {
        if (variables.length < 8) {
          const newVariables: IVariables = {
            id: Date.now() + i,
            value: `${variables.length + 1}`,
            text: "",
          };
          setVariables((prevVariables) => [...prevVariables, newVariables]);
        }
      }
      const buttonsContent = location.state.buttonsContent;
      let countButtons = 0;
      let buttonsData: any = [];
      let typeBtn = "";
      location.state.buttonsContent.map((element: any) => {
        if (element.type === "quickReply") {
          if (buttonsContent.length < 3) {
            const newButtons: IButton = {
              id: Date.now() + countButtons,
              value: `Button ${countButtons + 1}`,
              text: element.text,
            };
            setTypeOfButtons("quickReply");
            typeBtn = "quickReply";
            buttonsData = [...buttonsData, newButtons];
          }
        }
        if (element.type === "cta" || element.type === "staticURL") {
          if (buttonsContent.length < 2) {
            const newButtons: IButton = {
              id: Date.now() + countButtons,
              value: `Button ${countButtons + 1}`,
              text: element.text,
              type: element.type,
              url_phone: element.url,
            };
            setTypeOfButtons("cta");
            typeBtn = "cta";
            buttonsData = [...buttonsData, newButtons];
          }
        }
        countButtons++;
      });

      typeBtn === "cta" ? setButtonsCTA(buttonsData) : setButtons(buttonsData);
    }
  }, []);

  const toggleAccordion = (key: keyof AccordionStateCreate) => {
    setAccordionState({
      channelTrigger: false,
      config: false,
      header: false,
      body: false,
      footer: false,
      botao: false,
    });
    setAccordionState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const rodapeRadio = (e: any) => {
    setRodapeType(e.target.value);
    const value = e.target.value === "rodape";
    setRodape(!value);
    let rodapeText = "";
    if (value) {
      rodapeText = "";
    }
    setTemplate((prevState) => ({
      ...prevState,
      footer: rodapeText,
    }));
  };

  const handleAddVariable = () => {
    if (variables.length < 8) {
      const newVariables: IVariables = {
        id: Date.now(),
        value: `${variables.length + 1}`,
        text: "",
      };
      setVariables((prevVariables) => [...prevVariables, newVariables]);
      setTemplate((prevState) => ({
        ...prevState,
        body: prevState.body + `{{${variables.length + 1}}}`,
      }));
    }
  };

  const handleDeleteItem = (id: number) => {
    if (typeOfButtons !== "cta") {
      setButtons(buttons.filter((button) => button.id !== id));
    }
    if (typeOfButtons === "cta") {
      setButtonsCTA(buttonsCTA.filter((button) => button.id !== id));
    }
  };

  const handleAddButton = () => {
    if (typeOfButtons !== "cta") {
      if (buttons.length < 3) {
        const newButtons: IButton = {
          id: Date.now(),
          value: `Button ${buttons.length + 1}`,
          text: "",
        };
        setButtons((prevButtons) => [...prevButtons, newButtons]);
      }
    }
    if (typeOfButtons === "cta") {
      if (buttonsCTA.length < 2) {
        const newButtons: IButton = {
          id: Date.now(),
          value: `Button ${buttons.length + 1}`,
          text: "",
        };
        setButtonsCTA((prevButtons) => [...prevButtons, newButtons]);
      }
    }
  };
  const quickReplyRadio = (e: any) => {
    setTypeOfButtons(e.target.value);
  };

  const handleAddButtonText = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    buttonId: string
  ) => {
    const { name, value } = e.target;
    if (typeOfButtons !== "cta") {
      setButtons((prevButtons) => {
        return prevButtons.map((button) => {
          if (button.id.toString() === buttonId) {
            return {
              ...button,
              text: value.replace(/\p{Extended_Pictographic}/gu, ""),
            };
          }
          return button;
        });
      });
    }
    if (typeOfButtons === "cta") {
      setButtonsCTA((prevButtons) => {
        return prevButtons.map((button) => {
          if (button.id.toString() === buttonId) {
            if (value === "phoneNumber" || value === "staticURL")
              return { ...button, type: value };
            if (name === "url_phone") return { ...button, url_phone: value };
            else return { ...button, text: value };
          }
          return button;
        });
      });
    }
  };

  const handleDeleteVariables = (id: number) => {
    let value: number = 99;
    for (let i = 0; i < variables.length; i++) {
      if (variables[i].id === id) {
        value = i + 1;
      }
    }
    const newBody = template.body.replace(`{{${value}}}`, "");

    const body = newBody.replace(/{{(\d+)}}/g, (match, p1) => {
      const num = parseInt(p1, 10);
      return `{{${num > value ? num - 1 : num}}}`;
    });
    setTemplate((prevState) => ({
      ...prevState,
      body: body,
    }));
    setVariables(variables.filter((variable) => variable.id !== id));
  };

  const handleInputVariable = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setVariables((prevVariables) => {
      return prevVariables.map((variable) => {
        if (variable.id.toString() === name) {
          return { ...variable, text: value };
        }
        return variable;
      });
    });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTemplate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const headerRadio = (e: any) => {
    setTypeOfHeader(e.target.value);
    setHeader((prevState) => ({
      ...prevState,
      parameters: [{ type: e.target.value }],
    }));
    setTemplate((prevState) => ({
      ...prevState,
      header: "",
    }));
  };

  const handleChangeText = (text: string) => {
    return text.replace(/{{(\d+)}}/g, (match, p1) => {
      const indice = parseInt(p1, 10) - 1;
      if (indice >= 0 && indice < variables.length) {
        return variables[indice].text;
      } else {
        return match;
      }
    });
  };

  const validatedPayload = () => {
    // Validação dos campos obrigatórios
    const requiredFields: { [key: string]: string } = {
      templateName: "Nome do template",
      templateType: "Categoria",
    };

    let hasError = false;
    let firstErrorField = "";
    const missingFields: string[] = [];

    // Verificar cada campo obrigatório
    for (const [field, label] of Object.entries(requiredFields)) {
      let value = "";
      if (field === "templateName") value = templateName;
      if (field === "templateType") value = templateType;

      if (!value) {
        hasError = true;
        missingFields.push(label);

        // Guardar o primeiro campo com erro para definir o accordion
        if (!firstErrorField) {
          firstErrorField = field;
        }
      }
    }

    // Verificar o corpo da mensagem
    if (template.body === "") {
      hasError = true;
      missingFields.push("Corpo da mensagem");
      if (!firstErrorField) {
        firstErrorField = "body";
      }
    }

    // Verificar o cabeçalho se estiver habilitado
    if (typeOfHeader === "header" && template.header === "") {
      hasError = true;
      missingFields.push("Cabeçalho");
      if (!firstErrorField) {
        firstErrorField = "header";
      }
    }

    // Verificar o rodapé se estiver habilitado
    if (rodapeType === "rodape" && template.footer === "") {
      hasError = true;
      missingFields.push("Rodapé");
      if (!firstErrorField) {
        firstErrorField = "footer";
      }
    }

    // Verificar botões se estiverem habilitados
    if (typeOfButtons === "quickReply" && buttons.length === 0) {
      hasError = true;
      missingFields.push("Botões");
      if (!firstErrorField) {
        firstErrorField = "buttons";
      }
    }

    if (typeOfButtons === "cta" && buttonsCTA.length === 0) {
      hasError = true;
      missingFields.push("Botões");
      if (!firstErrorField) {
        firstErrorField = "buttonsCTA";
      }
    }

    // Verificar variáveis
    if (variables.length > 0) {
      for (const variable of variables) {
        if (variable.text.length === 0) {
          hasError = true;
          missingFields.push("Variáveis");
          break;
        }
      }
    }

    // Se houver erro, não continua com o envio do formulário
    if (hasError) {
      // Abrir o accordion correspondente ao primeiro campo com erro
      if (
        firstErrorField === "templateName" ||
        firstErrorField === "templateType"
      ) {
        setAccordionState({
          channelTrigger: false,
          config: true,
          header: false,
          body: false,
          footer: false,
          botao: false,
        });
      } else if (firstErrorField === "header") {
        setAccordionState({
          channelTrigger: false,
          config: false,
          header: true,
          body: false,
          footer: false,
          botao: false,
        });
      } else if (firstErrorField === "body") {
        setAccordionState({
          channelTrigger: false,
          config: false,
          header: false,
          body: true,
          footer: false,
          botao: false,
        });
      } else if (firstErrorField === "footer") {
        setAccordionState({
          channelTrigger: false,
          config: false,
          header: false,
          body: false,
          footer: true,
          botao: false,
        });
      } else if (
        firstErrorField === "buttons" ||
        firstErrorField === "buttonsCTA"
      ) {
        setAccordionState({
          channelTrigger: false,
          config: false,
          header: false,
          body: false,
          footer: false,
          botao: true,
        });
      }

      // Mostrar toasts com um pequeno atraso entre eles
      if (missingFields.length > 3) {
        // Se houver mais de 3 campos faltando, mostrar uma mensagem genérica
        toast.error(
          `Preencha todos os campos obrigatórios (${missingFields.length} campos faltando)`,
          {
            theme: "colored",
          }
        );
      } else {
        // Mostrar mensagens específicas para cada campo faltando (até 3)
        missingFields.forEach((field, index) => {
          setTimeout(() => {
            toast.error(`O campo ${field} é obrigatório`, {
              theme: "colored",
            });
          }, index * 300); // 300ms de atraso entre cada toast
        });
      }

      return false;
    }

    return true;
  };
  const createPayload = () => {
    // Validar os campos obrigatórios antes de criar o payload
    if (!validatedPayload()) {
      return;
    }

    if (headers === undefined) {
      errorMessageHeader();
      return;
    }
    if (template.footer === "" && rodape === false) {
      errorMessageFooter();
      return;
    }
    if (template.body === "") {
      errorMessageBody();
      return;
    }
    waitingMessage();
    let footer: IFooter;
    let body: IObject;
    let header: IHeader;
    let buttonQR: ButtonQR;
    const payload: any = {};
    const components: any[] = [];
    if (typeOfButtons === "quickReply") {
      buttonQR = {
        type: "BUTTONS",
        parameters: [],
      };
      let errorQR = false;
      for (let index = 0; index < buttons.length; index++) {
        if (buttons[index].text !== "") {
          buttonQR.parameters.push({
            type: typeOfButtons,
            text: buttons[index].text,
          });
        } else {
          errorQR = true;
        }
      }
      if (errorQR) {
        erroMessageQuickReply();
        return;
      }
      components.push(buttonQR);
    }
    if (typeOfButtons === "cta") {
      buttonQR = {
        type: "BUTTONS",
        parameters: [],
      };
      let errorQR = false;
      for (let index = 0; index < buttonsCTA.length; index++) {
        if (buttonsCTA[index].text !== "") {
          const url_phone =
            buttonsCTA[index].type === "staticURL" ? "url" : "phoneNumber";
          buttonQR.parameters.push({
            type: buttonsCTA[index].type,
            text: buttonsCTA[index].text,
            [url_phone]: buttonsCTA[index].url_phone,
          });
        } else {
          errorQR = true;
        }
      }
      if (errorQR) {
        erroMessageQuickReply();
        return;
      }
      components.push(buttonQR);
    }

    if (template.footer) {
      footer = {
        type: "FOOTER",
        parameters: [
          {
            type: "text",
            text: template.footer,
          },
        ],
      };
      components.push(footer);
    }
    if (headers?.parameters?.[0].type === "text") {
      header = {
        type: "HEADER",
        parameters: [
          {
            type: headers?.parameters?.[0].type,
            text: template.header,
          },
        ],
      };
      components.push(header);
    }
    if (
      headers?.parameters?.[0].type === "image" ||
      headers?.parameters?.[0].type === "video" ||
      headers?.parameters?.[0].type === "document"
    ) {
      header = {
        type: "HEADER",
        parameters: [
          {
            type: headers?.parameters?.[0].type,
          },
        ],
      };
      components.push(header);
    }
    body = {
      type: "BODY",
      parameters: [
        {
          type: "text",
          text: template.body,
        },
      ],
    };
    if (variables.length > 0) {
      body.parameters[0].example = [];
      for (let index = 0; index < variables.length; index++) {
        body.parameters[0].example.push(variables[index].text);
      }
    }
    components.push(body);
    payload["components"] = components;
    payload["category"] = templateType;
    payload["name"] = templateName;
    payload["language"] = "pt_BR"; //configTemplate.language;
    const data: { payload: any } = { payload };
    api
      .post(`/whats/template/${botId}`, data)
      .then(() => {
        successCreateTemplate();
        setTimeout(() => BackToList(), 3000);
      })
      .catch((err) => {
        console.log("$s ERROR create template: %O", new Date(), err);
        errorMessage();
      });
  };
  const modalRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle } = useModal();
  const [buttonA, setButtonA] = useState<string>("");
  const [buttonB, setButtonB] = useState<string>("");
  const [textToModal, setTextToModal] = useState<string>("");
  const [midia, setMidia] = useState<string>();
  const handleButtonName = (wichButton: string) => {
    if (wichButton === "Salvar") {
      setButtonA("Fechar");
      setButtonB("Salvar");
      setTextToModal("Você deseja salvar?");
      setText("Esta ação não poderá ser alterada.");
    } else if (wichButton === "Cancelar") {
      setButtonA("Cancelar");
      setButtonB("Voltar");
      setTextToModal("Deseja cancelar o template?");
      setText("Esta ação não poderá ser alterada.");
    }
    toggle();
  };
  const removeAccentsAndCommas = (str: string) => {
    // Primeiro remove acentuações
    let result = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Depois mantém apenas letras, números e underline
    result = result.replace(/[^a-zA-Z0-9_]/g, "");

    return result.toLowerCase();
  };
  const handleButtonClick = (buttonId: string) => {
    if (buttonId === "Salvar") {
      createPayload();
    } else if (buttonId === "Voltar") {
      toggle();
    } else if (buttonId === "Cancelar") {
      toggle();
      BackToList();
    } else if (buttonId === "Fechar") {
      toggle();
    }
  };
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const imagemSelecionada = event.target.files?.[0];
    if (imagemSelecionada) {
      setFileName(imagemSelecionada.name);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setMidia(dataUrl);
      };
      reader.readAsDataURL(imagemSelecionada);
    }
  };
  return (
    <div
      className="column-align width-95-perc"
      style={{ alignItems: "center", padding: "10px 0px" }}
    >
      <h1
        style={{
          fontSize: "23px",
          fontWeight: "bolder",
          color: "#004488",
          width: "100%",
        }}
        className="title_2024"
      >
        Criar Template
      </h1>
      <div
        className="column-align"
        style={{ alignItems: "center", width: "100%" }}
      >
        <div
          className="hr_color"
          style={{ width: "97%", marginTop: "15px" }}
        ></div>
        <div style={{ textAlign: "end", width: "94%" }}>
          <span style={{ cursor: "pointer" }} onClick={() => showVideo()}>
            Não sabe como criar template?{" "}
            <strong style={{ color: "blue" }}>Assista nosso vídeo</strong>
          </span>
        </div>
      </div>
      <br />
      <div style={{ width: "100vw" }}>
        <Modal
          buttonA={buttonA}
          text={text}
          warning={false}
          buttonB={buttonB}
          isOpen={isOpen}
          modalRef={modalRef}
          toggle={toggle}
          question={textToModal}
          onButtonClick={handleButtonClick}
        ></Modal>
        <ToastContainer />
        {hiddenVideo && (
          <DraggableComponent
            urlVideo={
              "https://www.loom.com/embed/e5216eb8145c4eaaae86b3e76b5f6dd0?sid=b6e75c08-5db3-41b4-bb0a-c029504dd33a"
            }
            showVideo={showVideo}
          />
        )}

        <div
          className="config-template column-align"
          style={{ alignItems: "center" }}
        >
          <div
            className={`accordion_head ${
              accordionState.channelTrigger ? "accordion_head_opened" : ""
            }`}
            style={{ borderRadius: "20px" }}
            onClick={() => toggleAccordion("channelTrigger")}
          >
            1. Canal de Disparo
            <div className="accordion_chevron">
              <img
                src={chevron}
                alt=""
                style={{
                  rotate: accordionState.channelTrigger ? "-90deg" : "90deg",
                }}
              />
            </div>
          </div>
          {accordionState.channelTrigger && (
            <div className="body-no-background" style={{ width: "100%" }}>
              <div className="accordeon-new" style={{ width: "802px" }}>
                <div className="body" style={{ backgroundColor: "#FFF" }}>
                  <div className="line" style={{ marginTop: "17px" }}>
                    <input
                      type="radio"
                      disabled={!isWhatsAppEnabled}
                      name="disparo"
                      value=""
                      className="input-spaces"
                      checked={true}
                    />
                    <span>WhatsApp</span>
                    <input
                      type="radio"
                      disabled={!isTeamsEnabled}
                      name="disparo"
                      value=""
                      onChange={() =>
                        history(
                          `/template-create-teams?bot_id=${botId}&token=${searchParams.get(
                            "token"
                          )}&url_base_api=${searchParams.get("url_base_api")}`
                        )
                      }
                      className="input-spaces"
                      checked={false}
                    />
                    <span>Teams</span>
                  </div>
                </div>
                <div style={{ width: "100%", textAlign: "right" }}>
                  <button
                    style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                    className="button-next"
                    onClick={() => toggleAccordion("config")}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className="config-template column-align"
          style={{ alignItems: "center" }}
        >
          <div
            className={`accordion_head ${
              accordionState.config ? "accordion_head_opened" : ""
            }`}
            style={{ borderRadius: "20px" }}
            onClick={() => toggleAccordion("config")}
          >
            2. Configuração
            <div className="accordion_chevron">
              <img
                src={chevron}
                alt=""
                style={{ rotate: accordionState.config ? "-90deg" : "90deg" }}
              />
            </div>
          </div>
          {accordionState.config && (
            <div className="column accordeon-new" style={{ width: "800px" }}>
              <div
                className="row-align"
                style={{
                  textAlign: "left",
                  backgroundColor: "#FFF",
                  width: "100%",
                  paddingTop: "0px",
                  marginTop: "0px",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <div
                  className="input"
                  style={{
                    justifyContent: "center",
                    paddingTop: "0px",
                    marginTop: "0px",
                    flex: "0 0 auto",
                    width: "450px",
                  }}
                >
                  <div
                    className="row-align"
                    style={{ margin: "0px 10px 10px 10px" }}
                  >
                    <span
                      className="span-title"
                      style={{ justifyContent: "flex-start" }}
                    >
                      Nome
                    </span>
                    <input
                      type="text"
                      className="input-values"
                      maxLength={512}
                      name="templateName"
                      value={templateName}
                      style={{ width: "350px" }}
                      onChange={(e) =>
                        setTemplateName(
                          removeAccentsAndCommas(e.target.value)
                            .replace(/\s/g, "")
                            .toLowerCase()
                        )
                      }
                    />
                    <a
                      data-tooltip-id="my-tooltip-multiline"
                      data-tooltip-html="Utilizar apenas letras, números e underline.<br /> Não utilizar espaços, acentuações e virgulas.<br />Exemplo correto: template_1"
                    >
                      <img src={alert} width={20} height={20} alt="alerta" />
                    </a>
                    <Tooltip id="my-tooltip-multiline" />
                  </div>
                  <div className="row-align" style={{ margin: "10px" }}>
                    <span
                      className="span-title"
                      style={{ justifyContent: "flex-start" }}
                    >
                      Categoria
                    </span>
                    <select
                      className="input-values"
                      style={{ width: "350px" }}
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value)}
                    >
                      <option value="">---</option>
                      <option value={"AUTHENTICATION"}>Autenticação</option>
                      <option value={"UTILITY"}>Utilidade</option>
                      <option value={"MARKETING"}>Marketing</option>
                    </select>
                  </div>
                  <div
                    className="row-align"
                    style={{ margin: "10px", textAlign: "left" }}
                  >
                    <span
                      className="span-title"
                      style={{
                        textAlign: "left",
                        justifyContent: "flex-start",
                      }}
                    >
                      Tel. Origem
                    </span>
                    <input
                      type="text"
                      className="input-values"
                      value={mask(phone)}
                      disabled
                      style={{ width: "350px" }}
                    />
                  </div>
                  <div className="row-align" style={{ margin: "10px" }}>
                    <span
                      className="span-title"
                      style={{
                        textAlign: "left",
                        justifyContent: "flex-start",
                      }}
                    >
                      Bot ID
                    </span>
                    <input
                      type="text"
                      className="input-values"
                      value={botId ?? ""}
                      disabled
                      style={{ width: "350px" }}
                    />
                  </div>
                </div>
                <div
                  className="card_2024 column-align"
                  style={{
                    width: "340px",
                    maxWidth: "340px",
                    textAlign: "left",
                    marginLeft: "3px",
                    flex: "0 0 auto",
                    alignSelf: "flex-start",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    className="row-align"
                    style={{ width: "100%", height: "50px", padding: "0 10px" }}
                  >
                    <div style={{ margin: "10px 10px 10px 0" }}>
                      <img src={alert} width={20} alt="alerta" />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: "1",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{ padding: "12px 0", fontSize: "16px" }}
                        className="title-blue bolder"
                      >
                        {templateType === "AUTHENTICATION"
                          ? "Autenticação"
                          : templateType === "UTILITY"
                          ? "Utilitário"
                          : templateType === "MARKETING"
                          ? "Marketing"
                          : "Início"}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      margin: "0 10px 10px 10px",
                      fontSize: "11px",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    {selectTemplate(templateType)}
                  </span>
                  {templateType && (
                    <div
                      style={{
                        margin: "0 10px 10px 10px",
                        padding: "15px",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeaa7",
                        borderRadius: "8px",
                        fontSize: "12px",
                        lineHeight: "1.4",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        overflow: "hidden",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#856404",
                          marginBottom: "8px",
                        }}
                      >
                        ⚠️ Atenção:
                      </div>
                      <div
                        style={{
                          color: "#856404",
                          marginBottom: "5px",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        • A Meta (WhatsApp) pode reclassificar a categoria do
                        template antes de aprovar.
                      </div>
                      <div
                        style={{
                          color: "#856404",
                          marginBottom: "5px",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        • Templates também podem ser reprovados se não seguirem
                        as políticas da plataforma.
                      </div>
                      <div
                        style={{
                          color: "#856404",
                          marginBottom: "5px",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        • Após a aprovação, confirme a categoria final na tela
                        de Gestão de Templates, pois ela pode ser diferente da
                        que você escolheu.
                      </div>
                      <div
                        style={{
                          color: "#856404",
                          marginBottom: "5px",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        • Os custos da campanha são calculados com base na
                        categoria aprovada, e não na categoria selecionada
                        inicialmente.
                      </div>
                      <div
                        style={{
                          color: "#856404",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        • Para dicas de como criar os melhores templates, fale
                        com o nosso agente Templatão da Meta.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{ width: "100%", textAlign: "right", marginTop: "20px" }}
              >
                <button
                  style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                  className="button-next"
                  onClick={() => toggleAccordion("header")}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="config-recebidores"
          style={{
            maxHeight: "95%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className={`accordion_head ${
              accordionState.header ? "accordion_head_opened" : ""
            }`}
            onClick={() => toggleAccordion("header")}
          >
            3. Cabeçalho
            <div className="accordion_chevron">
              <img
                src={chevron}
                alt=""
                style={{ rotate: accordionState.header ? "-90deg" : "90deg" }}
              />
            </div>
          </div>
          {accordionState.header && (
            <div
              className="body accordeon-new"
              style={{ backgroundColor: "#FFF" }}
            >
              <div className="radio row-align ">
                <div className="row-align" onChange={headerRadio}>
                  <input
                    type="radio"
                    value="text"
                    name="header"
                    checked={typeOfHeader === "text"}
                  />
                  <span className="padding-5">Texto</span>
                </div>
                <div className="row-align" onChange={headerRadio}>
                  <input
                    type="radio"
                    value="image"
                    name="header"
                    checked={typeOfHeader === "image"}
                  />
                  <span className="padding-5">Imagem</span>
                </div>
                <div className="row-align" onChange={headerRadio}>
                  <input
                    type="radio"
                    value="document"
                    name="header"
                    checked={typeOfHeader === "document"}
                  />
                  <span className="padding-5">Documento</span>
                </div>
                <div className="row-align" onChange={headerRadio}>
                  <input
                    type="radio"
                    value="video"
                    name="header"
                    checked={typeOfHeader === "video"}
                  />
                  <span className="padding-5">Video</span>
                </div>
                <div className="row-align" onChange={headerRadio}>
                  <input
                    type="radio"
                    value="sheader"
                    name="header"
                    checked={typeOfHeader === "sheader"}
                  />
                  <span className="padding-5">Sem cabeçalho</span>
                </div>
              </div>
              {typeOfHeader === "text" && (
                <div className="container-configure">
                  <div style={{ width: "750px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "initial",
                        paddingLeft: "50px",
                      }}
                    >
                      <span>Texto do Cabeçalho</span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      name="header"
                      value={template.header}
                      onChange={handleInputChange}
                      className="input-values"
                      style={{ width: "90%" }}
                    />
                    <div style={{ width: "92%", textAlign: "end" }}>
                      <span>{template.header.length}/60</span>
                    </div>
                  </div>
                </div>
              )}
              {typeOfHeader === "image" && (
                <div className="container-configure">
                  <div
                    className="row-align"
                    style={{
                      width: "100%",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <input
                      type="file"
                      accept="image"
                      name="header"
                      id="myFile"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      style={{ display: "none" }}
                    />
                    <input
                      type="text"
                      value={fileName}
                      style={{
                        width: "100%",
                        borderRadius: "7px",
                        border: "1px solid #d8d8d8",
                      }}
                      disabled
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="button-blue"
                      style={{ marginLeft: "10px" }}
                    >
                      Anexar
                    </button>
                  </div>
                  <Alert
                    message={
                      "Você vai inserir a url da imagem no momento em que for disparar a mensagem."
                    }
                  />
                </div>
              )}
              {typeOfHeader === "document" && (
                <div className="container-configure">
                  <Alert
                    message={
                      "Você vai inserir a url da documento no momento em que for disparar a mensagem."
                    }
                  />
                </div>
              )}
              {typeOfHeader === "video" && (
                <div className="container-configure">
                  <Alert
                    message={
                      "Você vai inserir a url do video no momento em que for disparar a mensagem. A visualização ao lado é simbolica."
                    }
                  />
                </div>
              )}
              <div style={{ width: "100%", textAlign: "right" }}>
                <button
                  style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                  className="button-next"
                  onClick={() => toggleAccordion("body")}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="modo-disparo column-align"
          style={{ alignItems: "center" }}
        >
          <div
            className={`accordion_head ${
              accordionState.body ? "accordion_head_opened" : ""
            }`}
            onClick={() => toggleAccordion("body")}
          >
            4. Corpo da Mensagem
            <div className="accordion_chevron">
              <img
                src={chevron}
                alt=""
                style={{ rotate: accordionState.body ? "-90deg" : "90deg" }}
              />
            </div>
          </div>
          {accordionState.body && (
            <div
              className="body accordeon-new"
              style={{ backgroundColor: "#FFF" }}
            >
              <div
                className="column-align"
                style={{
                  width: "100%",
                  textAlign: "initial",
                  paddingLeft: "20px",
                  backgroundColor: "#FFF",
                }}
              >
                <span
                  className="title-blue bolder"
                  style={{ marginTop: "10px" }}
                >
                  Corpo da Mensagem
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    marginBottom: "20px",
                    fontStyle: "italic",
                  }}
                >
                  Este é o principal conteúdo de texto no seu template.
                </span>
                <textarea
                  maxLength={1024}
                  name="body"
                  value={template.body}
                  onChange={handleInputChange}
                  style={{ width: "90%", borderRadius: "8px", padding: "9px" }}
                />

                <div style={{ width: "87%", textAlign: "end" }}>
                  <span>{template.body.length}/1024</span>
                </div>
                <span style={{ fontWeight: "bolder" }}>Variáveis</span>
                <div>
                  <button onClick={handleAddVariable} className="button-next">
                    Adicionar
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)", // Duas colunas de largura igual
                    gridTemplateRows: "repeat(4, auto)", // Quatro linhas com altura automática
                    gap: "10px", // Espaçamento entre as células
                    marginTop: "10px",
                  }}
                >
                  {variables.map((variable, index) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <span className="span-title-variables">
                        {index + 1}.{" "}
                      </span>{" "}
                      <input
                        value={variable.text}
                        type="text"
                        name={variable.id.toString()}
                        id=""
                        onChange={handleInputVariable}
                        className="input-values"
                        style={{ height: "26px" }}
                      />
                      <div
                        className="minus-delete"
                        onClick={() => handleDeleteVariables(variable.id)}
                      >
                        -
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{ width: "100%", textAlign: "right", marginTop: "10px" }}
              >
                <button
                  style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                  className="button-next"
                  onClick={() => toggleAccordion("footer")}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="revisar column-align" style={{ alignItems: "center" }}>
          <div
            className={`accordion_head ${
              accordionState.footer ? "accordion_head_opened" : ""
            }`}
            onClick={() => toggleAccordion("footer")}
          >
            5. Rodapé
            <div className="accordion_chevron">
              <img
                src={chevron}
                alt=""
                style={{ rotate: accordionState.footer ? "-90deg" : "90deg" }}
              />
            </div>
          </div>
          {accordionState.footer && (
            <div
              className="body accordeon-new"
              style={{ backgroundColor: "#FFF" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  alignItems: "center",
                  backgroundColor: "#FFF",
                }}
              >
                <div className="radio row-align">
                  <div className="row-align" onChange={rodapeRadio}>
                    <input
                      type="radio"
                      name="Texto"
                      value="rodape"
                      checked={rodapeType === "rodape"}
                    />
                    <span className="padding-5">Texto</span>
                  </div>
                  <div className="row-align" onChange={rodapeRadio}>
                    <input
                      type="radio"
                      name="Texto"
                      value="srodape"
                      checked={rodapeType === "srodape"}
                    />
                    <span className="padding-5">Sem rodapé</span>
                  </div>
                </div>

                {!rodape && (
                  <div style={{ width: "100%" }}>
                    <input
                      type="text"
                      maxLength={60}
                      style={{ width: "90%" }}
                      name="footer"
                      value={template.footer}
                      onChange={handleInputChange}
                      className="input-values"
                    />
                    <div style={{ width: "87%", textAlign: "end" }}>
                      <span>{template.footer.length}/60</span>
                    </div>
                  </div>
                )}
                <Alert message="No rodapé você não poderá inserir variável." />
              </div>
              <div style={{ width: "100%", textAlign: "right" }}>
                <button
                  style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                  className="button-next"
                  onClick={() => toggleAccordion("botao")}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="revisar"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className={`accordion_head ${
              accordionState.botao ? "accordion_head_opened" : ""
            }`}
            onClick={() => toggleAccordion("botao")}
          >
            6. Botões
            <div className="accordion_chevron">
              <img
                src={chevron}
                alt=""
                style={{ rotate: accordionState.botao ? "-90deg" : "90deg" }}
              />
            </div>
          </div>
          {accordionState.botao && (
            <div
              className="body accordeon-new"
              style={{ backgroundColor: "#FFF" }}
            >
              <div
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  paddingLeft: "20px",
                  backgroundColor: "#FFF",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingLeft: "-20px",
                    backgroundColor: "#FFF",
                  }}
                >
                  <div
                    className="radio"
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    <div className="row-align" onChange={quickReplyRadio}>
                      <input
                        type="radio"
                        value="quickReply"
                        name="quickReply"
                        checked={typeOfButtons === "quickReply"}
                      />
                      <span className="padding-5">Resposta rápida</span>
                    </div>
                    <div className="row-align" onChange={quickReplyRadio}>
                      <input
                        type="radio"
                        value="cta"
                        name="quickReply"
                        checked={typeOfButtons === "cta"}
                      />
                      <span className="padding-5">Call To Action (CTA)</span>
                    </div>
                    <div className="row-align" onChange={quickReplyRadio}>
                      <input
                        type="radio"
                        value="without"
                        name="quickReply"
                        checked={typeOfButtons === "without"}
                      />
                      <span className="padding-5">Nenhum</span>
                    </div>
                  </div>
                </div>
                {typeOfButtons === "quickReply" && (
                  <div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <button className="button-next" onClick={handleAddButton}>
                        Adicionar
                      </button>
                    </div>
                    {buttons.map((button, index) => (
                      <div className="container-configure" key={button.id}>
                        <div
                          className="row-align"
                          style={{ marginTop: "10px" }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <span
                                className="span-title"
                                style={{
                                  width: "70px",
                                  justifyContent: "flex-start",
                                }}
                              >
                                Texto
                                <a
                                  data-tooltip-id="no-emoji"
                                  data-tooltip-html="Não utilizar emojis."
                                >
                                  <img
                                    src={alert}
                                    width={15}
                                    height={15}
                                    alt="alerta"
                                    style={{ marginBottom: "15px" }}
                                  />
                                </a>
                              </span>
                              <Tooltip id="no-emoji" />
                              <input
                                value={button.text}
                                onChange={(e) =>
                                  handleAddButtonText(e, button.id.toString())
                                }
                                maxLength={20}
                                name={button.id.toString()}
                                className="input-values"
                                style={{ height: "26px" }}
                              />
                              <div
                                className="minus-delete"
                                onClick={() => handleDeleteItem(button.id)}
                              >
                                -
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {typeOfButtons === "cta" && (
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <button className="button-next" onClick={handleAddButton}>
                        Adicionar
                      </button>
                    </div>
                    {buttonsCTA.map((button, index) => (
                      <div
                        className="container-configure"
                        style={{ width: "100%" }}
                        key={button.id}
                      >
                        <div className="row-align">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: " 13px",
                            }}
                          >
                            <span
                              className="span-title"
                              style={{
                                width: "60px",
                                justifyContent: "flex-start",
                              }}
                            >
                              Tipo
                              <a
                                data-tooltip-id="no-emoji"
                                data-tooltip-html="Não utilizar emojis."
                              >
                                <img
                                  src={alert}
                                  width={15}
                                  height={15}
                                  alt="alerta"
                                  style={{ marginBottom: "15px" }}
                                />
                              </a>
                            </span>
                            <Tooltip id="no-emoji" />
                            <select
                              className="input-values"
                              value={button.type}
                              style={{
                                width: "100px",
                                height: "26px",
                                padding: "0px",
                              }}
                              name={button.id.toString()}
                              onChange={(e) =>
                                handleAddButtonText(e, button.id.toString())
                              }
                            >
                              <option>--</option>
                              <option value={"staticURL"}>URL</option>
                              <option value={"phoneNumber"}>Telefone</option>
                            </select>
                            <div
                              className="column-align"
                              style={{
                                textAlign: "right",
                                paddingTop:
                                  button.type === "staticURL" ? "24px" : "0px",
                              }}
                            >
                              <input
                                type="text"
                                className="input-values"
                                maxLength={23}
                                style={{ height: "26px" }}
                                value={button.text}
                                name="text"
                                onChange={(e) =>
                                  handleAddButtonText(e, button.id.toString())
                                }
                                placeholder="Nome do botão"
                              />
                              {button.type === "staticURL" && (
                                <span style={{ marginRight: "15px" }}>
                                  {button.text.length}/23
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              className="input-values"
                              style={{ height: "26px" }}
                              value={button.url_phone}
                              name="url_phone"
                              onChange={(e) =>
                                handleAddButtonText(e, button.id.toString())
                              }
                            />
                            <div
                              className="minus-delete"
                              onClick={() => handleDeleteItem(button.id)}
                            >
                              -
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Alert message="No primeiro campo colocar o nome a ser exibido no botão, no segundo campo é o valor do campo. Exemplo: campo 1: Site campo 2: www.inbot.com.br, desta forma ao clicar no botão escrito Site o usuário será direcionado para o site da InBot." />
                  </div>
                )}
              </div>
              <div
                style={{
                  width: "100%",
                  flexDirection: "row",
                  textAlign: "end",
                  alignContent: "end",
                  alignItems: "end",
                  padding: "15px",
                }}
              >
                <button
                  className="button-cancel"
                  onClick={() => handleButtonName("Cancelar")}
                >
                  Cancelar
                </button>
                <button className="button-save" onClick={() => createPayload()}>
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showTemplate && (
        <div
          className="image-container rigth fixed"
          style={{
            position: "fixed",
            color: "#000",
            alignContent: "end",
            textAlign: "end",
            right: "20px",
            bottom: "0px",
          }}
        >
          <button
            style={{
              width: "150px",
              height: "40px",
              margin: "0px 30px 15px 0px",
            }}
            className="button-next"
            onClick={() => setShowTempalte(!showTemplate)}
          >
            Exibir template
          </button>
        </div>
      )}
      {!showTemplate && (
        <div
          onClick={() => setShowTempalte(!showTemplate)}
          className="image-container rigth fixed"
          style={{
            position: "fixed",
            color: "#000",
            alignContent: "end",
            textAlign: "end",
            right: "50px",
            bottom: "0px",
          }}
        >
          <img src={whatsappBackground} alt="Logo" width={350} height={600} />
          <div
            className="overlay-text-template"
            style={{ overflowY: "auto", maxHeight: "80%" }}
          >
            <div className="texts" style={{ width: "100%" }}>
              {typeOfHeader === "text" && (
                <label
                  className="header"
                  style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}
                >
                  {template.header}
                </label>
              )}
              {typeOfHeader === "image" && (
                <label
                  className="header"
                  style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}
                >
                  <img
                    src={midia}
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                    alt=""
                  />
                </label>
              )}
              {typeOfHeader === "document" && (
                <div className="column-align" style={{ padding: "10px" }}>
                  <label
                    className="header"
                    style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}
                  >
                    <img
                      src={attached}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        border: "1px solid #c3c3c3",
                        borderRadius: "8px",
                      }}
                      alt=""
                    />
                  </label>
                </div>
              )}
              {typeOfHeader === "video" && (
                <label
                  className="header"
                  style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}
                >
                  <video width="160" height="120" controls>
                    <source src={midia} type="video/mp4" />
                  </video>
                </label>
              )}
              <label style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}>
                {handleChangeText(template.body)}
              </label>
              {
                <label
                  className="footer font-size-12"
                  style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}
                >
                  {template.footer}
                </label>
              }
              {typeOfButtons === "quickReply" && (
                <div className="quickReply-texts">
                  {buttons.length > 0 && (
                    <div className="quick-reply">
                      <label>{buttons[0].text}</label>
                    </div>
                  )}
                  {buttons.length > 1 && (
                    <div className="quick-reply">
                      <label>{buttons[1].text}</label>
                    </div>
                  )}
                  {buttons.length > 2 && (
                    <div className="quick-reply">
                      <label>{buttons[2].text}</label>
                    </div>
                  )}
                </div>
              )}
              {typeOfButtons === "cta" && (
                <div className="quickReply-texts">
                  {buttonsCTA.length > 0 && (
                    <div className="quick-reply">
                      <label>{buttonsCTA[0].text}</label>
                    </div>
                  )}
                  {buttonsCTA.length > 1 && (
                    <div className="quick-reply">
                      <label>{buttonsCTA[1].text}</label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTemplateAccordion;
