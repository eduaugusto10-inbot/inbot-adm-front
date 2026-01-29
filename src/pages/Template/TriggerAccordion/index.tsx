import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { read, utils } from "xlsx";
import {
  errorCampaingEmpty,
  errorDuplicatedPhone,
  errorEmptyVariable,
  errorPhoneEmpty,
  errorTriggerMode,
  successCreateTrigger,
  waitingMessage,
  creatingCampaignMessage,
  errorNoRecipient,
  errorMidiaEmpty,
  errorMessagePayload,
  errorMessageDefault,
} from "../../../Components/Toastify";
import api from "../../../utils/api";
import axios from "axios";

const baseURL = process.env.NODE_ENV === 'development' 
  ? "https://api-stg.inbot.com.br/v2/" 
  : "https://api.inbot.com.br/v2/";

const templateApi = axios.create({ baseURL });
import attached from "../../../img/attachment.png";
import { ToastContainer, toast } from "react-toastify";
import "./index.css";
import Alert from "../../../Components/Alert";
import {
  AccordionState,
  IListVariables,
  ITemplateList,
  IVariables,
} from "../../types";
import { mask } from "../../../utils/utils";
import Modal from "../../../Components/Modal";
import useModal from "../../../Components/Modal/useModal";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import chevron from "../../../img/right-chevron.png";
import info from "../../../img/circle-info-solid.svg";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { validatedUser, getAdminName } from "../../../utils/validateUser";
import { DraggableComponent } from "../../../Components/Draggable";
import { WhatsAppLimitWarning } from "../../../Components/WhatsAppLimitWarning";
import Select from "react-select";

export function Accordion() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(true);
  const [isTeamsEnabled, setIsTeamsEnabled] = useState(true);
  if (process.env.NODE_ENV !== 'development' && searchParams.get("bot_id") === null) {
    window.location.href = "https://in.bot/inbot-admin";
  }
  var botId = searchParams.get("bot_id") ?? "0";

  const history = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const logged: any =
        (await validatedUser(
          searchParams.get("bot_id"),
          searchParams.get("token"),
          searchParams.get("url_base_api")
        )) ?? false;
      console.log(`Logged: ${JSON.stringify(logged)}`);
      if (!logged) {
        history(`/template-warning-no-whats?bot_id=${botId}`);
      }
      if (logged.channel === "whats") {
        setIsTeamsEnabled(false);
      }
      if (logged.channel === "teams") {
        history(
          `/template-trigger-teams?bot_id=${botId}&token=${searchParams.get(
            "token"
          )}&url_base_api=${searchParams.get("url_base_api")}`
        );
      }
      api
        .get(`/whats-botid-all/${botId}`)
        .then(async (resp) => {
          // Extrair todos os números de disparo da resposta da API
          const botNumbers = resp.data.bot.map((bot: any) => ({
            number: bot.number,
            botServerType: bot.botServerType,
          }));

          setDispatchNumbers(botNumbers);
          setSelectedDispatchNumber("");

          setPhone(resp.data.bot[0].number);
          if (searchParams.get("bot_id") === null) {
            window.location.href = "https://in.bot/inbot-admin";
          }
          api
            .get(`/whatsapp/trigger-bot/${botId}`)
            .then((resp) => setTriggerNames(resp.data))
            .catch((error) => console.log(error));
          const token = resp.data.bot[0].accessToken;
          setPhone(resp.data.bot[0].number);
        })
        .catch((error) => console.log(error)); //history(`/template-warning-no-whats?bot_id=${botId}`))
    };

    if (process.env.NODE_ENV !== 'development' && searchParams.get("bot_id") === null) {
      window.location.href = "https://in.bot/inbot-admin";
    } else {
      fetchData();
    }
  }, []);

  function BackToList() {
    history(
      `/trigger-list?bot_id=${botId}&token=${searchParams.get(
        "token"
      )}&url_base_api=${searchParams.get("url_base_api")}`
    );
  }

  const [accordionState, setAccordionState] = useState<AccordionState>({
    channelTrigger: true,
    config: false,
    recebidores: false,
    disparo: false,
    revisar: false,
  });
  const [fileData, setFileData] = useState<any[][]>([]);
  const [clientNumber, setClientNumber] = useState<number | "">("");
  const [typeClient, setTypeClients] = useState<boolean>();
  const [mode, setMode] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [categoryTemplate, setCategoryTemplate] = useState<string>("");
  const [showType, setShowType] = useState<boolean>(false);
  const [triggerMode, setTriggerMode] = useState<string>("imediato");
  const [campaignName, setCampaignName] = useState<string>("");
  const [dates, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [hours, setHours] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [variables, setVariables] = useState<IVariables[]>([]);
  const [listVariables, setListVariables] = useState<IListVariables[]>([]);
  const [triggerNames, setTriggerNames] = useState<any>([]);
  const [warningText, setWarningText] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [payload1, setPayload1] = useState<string>();
  const [typeClientValue, setTypeClientValue] = useState<boolean>(false);
  const [payload2, setPayload2] = useState<string>();
  const [payload3, setPayload3] = useState<string>();
  const [templateNameSelect, setTemplateNameSelect] = useState<string>("Edta");
  const [urlMidia, setURLMidia] = useState<string>("");
  const [templates, setTemplates] = useState<ITemplateList[]>([]);
  const [qtButtons, setQtButtons] = useState<number>(0);
  const [titleButton1, setTitleButton1] = useState<string>("");
  const [bodyText, setBodyText] = useState<string>("");
  const [typeOfHeader, setTypeOfHeader] = useState<string>("");
  const [footerText, setFooterText] = useState<string>("");
  const [headerText, setHeaderText] = useState<string>("");
  const [titleButton2, setTitleButton2] = useState<string>("");
  const [titleButton3, setTitleButton3] = useState<string>("");
  const [headerTable, setHeaderTable] = useState<any>();
  const [hiddenVideo, setHiddenVideo] = useState<boolean>(false);
  const [headerConfig, setHeaderConfig] = useState<string | null>();
  const [variableQty, setVariableQty] = useState<number>(0);
  const [blockAddNumber, setBlockAddNumber] = useState<boolean>(false);
  const [phone, setPhone] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [dispatchNumbers, setDispatchNumbers] = useState<
    { number: string; botServerType: string }[]
  >([]);

  const [selectedDispatchNumber, setSelectedDispatchNumber] =
    useState<string>("");
  const [templateConfigurations, setTemplateConfigurations] = useState<any>(null);
  const [hasButton, setHasButton] = useState<boolean>(false);
  const [hasHeader, setHasHeader] = useState<boolean>(false);
  const [hasBody, setHasBody] = useState<boolean>(false);
  const [hasFooter, setHasFooter] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [createTriggerMenu, setCreateTriggerMenu] = useState(false);

  useEffect(() => {
    loadNewTemplate(location?.state?.templateID);
  }, [createTriggerMenu]);

  const loadTemplates = async (phoneNumber: string) => {
    try {
      const templatesResp = await templateApi.get(
        `/api/botId/${botId}/template/phoneNumber/${phoneNumber}`
      );
      if (
        templatesResp.data &&
        templatesResp.data.length > 0
      ) {
        setTemplates(templatesResp.data);
        setCreateTriggerMenu(true);
      } else {
        setTemplates([]);
        setCreateTriggerMenu(false);
        errorMessageDefault(
          "Por favor, criar um template antes de criar a campanha"
        );
      }
    } catch (error) {
      console.log(error);
      errorMessageDefault("Erro ao carregar templates");
    }
  };

  const toggleAccordion = (key: keyof AccordionState) => {
    setAccordionState({
      channelTrigger: false,
      config: false,
      recebidores: false,
      disparo: false,
      revisar: false,
    });
    setAccordionState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const addCustomerToSendTemplate = () => {
    let emptyVariable = false;
    let duplicatedPhone = false;
    if (clientNumber === "") {
      errorPhoneEmpty();
      return;
    }
    const itemsToCheck = ["document", "image", "video"];
    const hasItem = itemsToCheck.some((item) => headerConfig?.includes(item));
    if (urlMidia === "" && hasItem) {
      errorMidiaEmpty();
      return;
    }
    variables.forEach((variable) => {
      if (variable?.text === "") {
        emptyVariable = true;
      }
    });
    listVariables.forEach((variable) => {
      if (variable.phone === clientNumber) {
        duplicatedPhone = true;
      }
    });
    if (emptyVariable) {
      errorEmptyVariable();
      return;
    }
    if (duplicatedPhone) {
      errorDuplicatedPhone();
      return;
    }
    setListVariables((prevState) => [
      ...prevState,
      {
        phone: clientNumber,
        email: "",
        variable_1: variables[0]?.text,
        variable_2: variables[1]?.text,
        variable_3: variables[2]?.text,
        variable_4: variables[3]?.text,
        variable_5: variables[4]?.text,
        variable_6: variables[5]?.text,
        variable_7: variables[6]?.text,
        variable_8: variables[7]?.text,
        variable_9: variables[8]?.text,
        media_url: urlMidia,
        payload_1: payload1,
        payload_2: payload2,
        payload_3: payload3,
        title_button_1: titleButton1,
        title_button_2: titleButton2,
        title_button_3: titleButton3,
      },
    ]);
    setClientNumber("");
    setVariables([]);
  };

  const formatDateComplete = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Janeiro é 0
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file) {
      setFileName(file.name);
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = read(bstr, { type: "binary" });

      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Voltamos para raw: false para evitar problemas com datas
      const data = utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
      }) as any[][];
      
      const dataFile: any = [];
      const dataHeader: any = [];
      data.slice(0).forEach((values: any, index: number) => {
        if (values.length > 0 && index < 1) {
          dataHeader.push(values);
        }
      });
      
      data.slice(1).forEach((values, linha) => {
        const wrongFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{2}$/;
        if (values.length > 0) {
          values.forEach((cell, coluna) => {
            // Tratamento específico para cada coluna
            if (coluna === 0) {
              // Para a coluna de telefone (coluna A), garantir que seja tratado como número
              // e remover caracteres não numéricos
              // Se o valor for científico (como 5.5e+11), convertemos para número primeiro
              let phoneValue = cell ? cell.toString() : "";
              
              // Verificar se é notação científica
              if (phoneValue.includes('e+') || phoneValue.includes('E+')) {
                try {
                  // Converter para número e depois para string para eliminar notação científica
                  phoneValue = Number(phoneValue).toString();
                } catch (e) {
                  console.log("Erro ao converter telefone:", e);
                }
              }
              
              // Remover caracteres não numéricos
              values[coluna] = phoneValue.replace(/\D/g, "");
            } else {
              // Para as outras colunas, manter como estão (já que raw: false)
              const cellValue = cell ? cell.toString() : "";
              if (wrongFormatRegex.test(cellValue)) {
                values[coluna] = formatDateComplete(cellValue);
              } else {
                values[coluna] = cellValue;
              }
            }
          });
          dataFile.push(values);
        }
      });
      
      setHeaderTable(dataHeader);
      setFileData(dataFile);
    };

    reader.readAsBinaryString(file);
  };

// Estas funções foram substituídas por versões com progresso dentro do createTrigger


  const signInClients = (e: any) => {
    setTypeClients(e);
    setShowType(true);
    setListVariables([]);
    setFileData([]);
  };
  const handleMode = (e: any) => {
    const value = e.target.value === "imediato";
    setTriggerMode(e.target.value);
    setMode(!value);
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
  const handleAddVariable = (id: number) => {
    if (variables.length < 8) {
      const newVariables: IVariables = {
        id: id,
        value: `${variables.length + 1}`,
        text: "",
      };
      setVariables((prevVariables) => [...prevVariables, newVariables]);
    }
  };

  const encontrarMaiorNumero = (texto: string): number => {
    const regex = /{{.*?(\d+).*?}}/g;
    const numeros: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(texto)) !== null) {
      if (match[1]) {
        numeros.push(parseInt(match[1]));
      }
    }

    if (numeros.length > 0) {
      return Math.max(...numeros);
    } else {
      return 0;
    }
  };
  const hasMedia = (headerElement: any) => {
    let headerType = null;
    headerElement.forEach((element: any) => {
      if (element.type === "HEADER") {
        switch (element.parameters[0].type) {
          case "video":
            headerType = "video";
            break;
          case "text":
            headerType = "text";
            break;
          case "image":
            headerType = "image";
            break;
          case "document":
            headerType = "document";
            break;
          default:
            break;
        }
      }
    });
    return headerType;
  };
  const hasManyButtons = (headerElement: any) => {
    let buttons = 0;
    headerElement.forEach((element: any) => {
      if (element.type === "BUTTONS") {
        if (element.parameters[0].type === "quickReply") {
          buttons = element.parameters.length;
          if (buttons > 0) setTitleButton1(element.parameters[0].text);
          if (buttons > 1) setTitleButton2(element.parameters[1].text);
          if (buttons > 2) setTitleButton3(element.parameters[2].text);
        }
      }
      if (element.type === "BODY") {
        setBodyText(element.parameters[0].text);
      }
      if (element.type === "HEADER") {
        setHeaderText(element.parameters[0]?.text);
        setTypeOfHeader(element.parameters[0].type);
      }
      if (element.type === "FOOTER") {
        setFooterText(element.parameters[0].text);
      }
    });
    return buttons;
  };

  const showVideo = () => {
    console.log("Abre");
    setHiddenVideo(!hiddenVideo);
  };

  const openModal = (e: any) => {
    if (templateName === "") {
      loadNewTemplate(e);
    } else {
      handleButtonName("Select");
    }
    setTemplateNameSelect(e);
  };

  const openModalChangeCustomersType = (e: any) => {
    const value = e.target.value === "unico";
    setTypeClientValue(!value);
    if (
      showType === false ||
      (listVariables.length === 0 && fileData.length === 0)
    ) {
      signInClients(!value);
    } else {
      handleButtonName("ChangeCustomersContacts");
    }
  };

  const loadNewTemplate = (e: any) => {
    setVariables([]);
    setMode(false);
    setPayload1(undefined);
    setPayload2(undefined);
    setPayload3(undefined);
    setURLMidia("");
    setTriggerMode("imediato");
    setFileData([]);
    setListVariables([]);
    setFileName("");
    templates.forEach((template: any) => {
      if (template.templateName === e) {
        setTemplateName(template.templateName);
        setCategoryTemplate(template.category);
        setTemplateConfigurations(template.configurations || null);
        if (template.body && template.body.length > 0) {
          template.body.forEach((element: any) => {
            if (element.type === "text") {
              setBodyText(element.text || "");
              setVariableQty(element.numVariables || encontrarMaiorNumero(element.text || ""));
            }
          });
        }
        if (template.header && template.header.length > 0) {
          setHeaderConfig(template.header[0].type);
          setTypeOfHeader(template.header[0].type);
          setHeaderText(template.header[0].text || "");
        }
        if (template.footer && template.footer.length > 0) {
          setFooterText(template.footer[0].text || "");
        }
        if (template.button && template.button.length > 0) {
          setQtButtons(template.button.length);
          template.button.forEach((btn: any, index: number) => {
            if (index === 0) setTitleButton1(btn.text || "");
            if (index === 1) setTitleButton2(btn.text || "");
            if (index === 2) setTitleButton3(btn.text || "");
          });
        }
        setHasButton(template.hasButton || false);
        setHasHeader(template.hasHeader || false);
        setHasBody(template.hasBody || false);
        setHasFooter(template.hasFooter || false);
        return;
      }
    });
  };

  const handleCampaignName = (e: string) => {
    if (
      triggerNames !== undefined &&
      triggerNames.data &&
      Array.isArray(triggerNames.data)
    ) {
      setErrorMessage("");
      for (let i = 0; i < triggerNames.data.length; i++) {
        if (triggerNames.data[i].campaign_name === e) {
          setErrorMessage("O nome da campanha já existe!");
        }
      }
    }
    setCampaignName(e);
  };

  useEffect(() => {
    if (fileInputRef.current) {
      setFileName(fileInputRef.current.value);
    }
  }, [fileName]);

  const validatedPayload = (): boolean => {
    if (typeOfHeader === "TEXT" && headerText === "") {
      return false;
    }
    if (bodyText === "") {
      return false;
    }
    if (qtButtons > 0 && titleButton1 === "") {
      return false;
    }
    if (qtButtons > 1 && titleButton2 === "") {
      return false;
    }
    if (qtButtons > 2 && titleButton3 === "") {
      return false;
    }
    return true;
  };

  const createTrigger = async () => {
    if (campaignName === "") {
      errorCampaingEmpty();
      return;
    }
    if (triggerMode === "") {
      errorTriggerMode();
      return;
    }
    if (selectedDispatchNumber === "") {
      setErrorMessage("Por favor, selecione um número de disparo.");
      return;
    }
    if (listVariables.length === 0 && fileData.length === 0) {
      errorNoRecipient();
      return;
    }
    if (typeOfHeader === "IMAGE" && urlMidia === "") {
      errorMidiaEmpty();
      return;
    }
    if (typeOfHeader === "VIDEO" && urlMidia === "") {
      errorMidiaEmpty();
      return;
    }
    if (typeOfHeader === "DOCUMENT" && urlMidia === "") {
      errorMidiaEmpty();
      return;
    }
    if (!validatedPayload()) {
      errorMessagePayload();
      return;
    }
    
    // Iniciar com a mensagem inicial
    const toastId = toast.info("Aguarde, iniciando processamento da campanha...", {
      theme: "colored",
      autoClose: false,
      closeOnClick: false
    });
    
    const data = {
      campaignName: campaignName,
      templateName: templateName,
      typeTrigger: triggerMode,
      timeTrigger: triggerMode === "agendado" ? `${dates} ${hours}` : null,
      channel: "whatsapp",
      status: "criando",
      category: categoryTemplate,
      triggerOrigin: "MANUAL",
      botId: botId,
      phoneTrigger: selectedDispatchNumber || phone,
      createdBy: getAdminName(),
    };

    await api
      .post("/whatsapp/trigger", data)
      .then((resp) => {
        if (typeClient) {
          // Calcular o total de contatos
          const totalContacts = fileData.filter(customer => customer?.[0]).length;
          let processedContacts = 0;
          
          // Função modificada para atualizar o progresso
          const handleSubmitListDataFileWithProgress = async (
            dataTemplate: string[][],
            campaignId: string
          ) => {
            try {
              const customerList = dataTemplate
                .filter((customer) => customer?.[0])
                .map((customer) => ({
                  campaignId: `${campaignId}`,
                  phone: `${customer[0].replace(/\D/g, "")}`,
                  status: "aguardando",
                  variable_1: customer[1],
                  variable_2: customer[2],
                  variable_3: customer[3],
                  variable_4: customer[4],
                  variable_5: customer[5],
                  variable_6: customer[6],
                  variable_7: customer[7],
                  variable_8: customer[8],
                  variable_9: customer[9],
                  media_url: urlMidia,
                  type_media: headerConfig,
                  payload_1: payload1,
                  payload_2: payload2,
                  payload_3: payload3,
                  title_button_1: titleButton1,
                  title_button_2: titleButton2,
                  title_button_3: titleButton3,
                  channel: "whatsapp",
                }));

              // Quebrar a lista em lotes de 100 objetos
              const batchSize = 100;
              const batches = [];
              
              for (let i = 0; i < customerList.length; i += batchSize) {
                batches.push(customerList.slice(i, i + batchSize));
              }
              
              // Enviar cada lote separadamente e atualizar o progresso
              for (const batch of batches) {
                await api.post("/whats-customer", batch);
                processedContacts += batch.length;
                
                // Atualizar a mensagem de progresso
                const percentComplete = Math.round((processedContacts / totalContacts) * 100);
                toast.update(toastId, { 
                  render: `Aguarde, estamos processando ${processedContacts} de ${totalContacts} contatos (${percentComplete}% concluído)`
                });
                
                console.log(`Lote de ${batch.length} contatos enviado com sucesso`);
              }

              console.log(
                "Lista de dados enviada com sucesso para a campanha:",
                campaignId
              );
              return Promise.resolve();
            } catch (error) {
              console.error("Erro ao enviar lista de dados:", error);
              throw error;
            }
          };
          
          handleSubmitListDataFileWithProgress(fileData, resp.data.data.insertId)
            .catch((error) => {
              console.log("Erro ao enviar lista de dados:", error);
              // Atualiza o status para erro quando falha no envio da lista
              api.put(
                `/whatsapp/trigger/${resp.data.data.insertId}?status=erro`
              );
              toast.dismiss(toastId); // Fechar o toast de aguarde
              errorMessageDefault(
                "Erro ao processar a campanha. Verifique os dados e tente novamente."
              );
            })
            .finally(() => {
              toast.dismiss(toastId); // Fechar o toast de aguarde quando terminar
              successCreateTrigger();
              api.put(
                `/whatsapp/trigger/${resp.data.data.insertId}?status=aguardando`
              );
              setTimeout(() => BackToList(), 3000);
            });
        } else {
          // Calcular o total de contatos
          const totalContacts = listVariables.length;
          let processedContacts = 0;
          
          // Função modificada para atualizar o progresso
          const handleSubmitManualListDataWithProgress = async (campaignId: string) => {
            try {
              const customerList = listVariables.map((item) => ({
                campaignId: `${campaignId}`,
                phone: `${item.phone}`,
                status: "aguardando",
                variable_1: item?.variable_1,
                variable_2: item?.variable_2,
                variable_3: item?.variable_3,
                variable_4: item?.variable_4,
                variable_5: item?.variable_5,
                variable_6: item?.variable_6,
                variable_7: item?.variable_7,
                variable_8: item?.variable_8,
                variable_9: item?.variable_9,
                media_url: urlMidia,
                type_media: headerConfig,
                payload_1: payload1,
                payload_2: payload2,
                payload_3: payload3,
                title_button_1: titleButton1,
                title_button_2: titleButton2,
                title_button_3: titleButton3,
                channel: "whatsapp",
              }));

              // Quebrar a lista em lotes de 100 objetos
              const batchSize = 100;
              const batches = [];
              
              for (let i = 0; i < customerList.length; i += batchSize) {
                batches.push(customerList.slice(i, i + batchSize));
              }
              
              // Enviar cada lote separadamente e atualizar o progresso
              for (const batch of batches) {
                await api.post("/whats-customer", batch);
                processedContacts += batch.length;
                
                // Atualizar a mensagem de progresso
                const percentComplete = Math.round((processedContacts / totalContacts) * 100);
                toast.update(toastId, { 
                  render: `Aguarde, estamos processando ${processedContacts} de ${totalContacts} contatos (${percentComplete}% concluído)`
                });
                
                console.log(`Lote de ${batch.length} contatos enviado com sucesso`);
              }

              console.log(
                "Lista manual enviada com sucesso para a campanha:",
                campaignId
              );
              return Promise.resolve();
            } catch (error) {
              console.error("Erro ao enviar lista manual:", error);
              throw error;
            }
          };
          
          handleSubmitManualListDataWithProgress(resp.data.data.insertId)
            .catch((error) => {
              console.log("Erro ao enviar lista manual:", error);
              // Atualiza o status para erro quando falha no envio da lista manual
              api.put(`/whatsapp/trigger/${resp.data.data.insertId}?status=erro`);
              toast.dismiss(toastId); // Fechar o toast de aguarde
              errorMessageDefault(
                "Erro ao processar a campanha. Verifique os dados e tente novamente."
              );
            })
            .finally(() => {
              toast.dismiss(toastId); // Fechar o toast de aguarde quando terminar
              successCreateTrigger();
              api.put(
                `/whatsapp/trigger/${resp.data.data.insertId}?status=aguardando`
              );
              setTimeout(() => BackToList(), 3000);
            });
        }
      })
      .catch((err) => {
        console.log("Erro ao criar campanha:", err);
        toast.dismiss(toastId); // Fechar o toast de aguarde em caso de erro
        errorMessageDefault(
          "Erro ao criar campanha. Por favor, tente novamente."
        );
      });
  };
  if (variableQty > 0 && variables.length < variableQty) {
    for (let i = 0; i < variableQty; i++) {
      handleAddVariable(i);
    }
  }
  const modalRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle } = useModal();
  const [buttonA, setButtonA] = useState<string>("");
  const [buttonB, setButtonB] = useState<string>("");
  const [textToModal, setTextToModal] = useState<string>("");

  const handleButtonName = (wichButton: string) => {
    if (wichButton === "Salvar") {
      setButtonA("Fechar");
      setButtonB("Salvar");
      setTextToModal("Você deseja salvar?");
      setText("Essa ação não poderá ser desfeita.");
      setWarningText(true);
    } else if (wichButton === "Cancelar") {
      setButtonA("Sim");
      setButtonB("Não");
      setTextToModal("Deseja cancelar a Campanha?");
      setText("Essa ação não poderá ser desfeita.");
      setWarningText(true);
    } else if (wichButton === "warningFile") {
      setTextToModal("Verifique o padrão do telefone");
      setButtonB("OK");
      setButtonA("NaoExibir");
      setWarningText(true);
      setText(
        "Para garantir o envio corretamente, não se esqueça de verificar na sua planilha se os números de telefone estão completos seguindo o padrão: código do país (Brasil = 55), código regional (SP = 11) e número do telefone. Exemplo: 5511988880000"
      );
    } else if (wichButton === "ChangeCustomersContacts") {
      setButtonA("Não");
      setButtonB("Alterar");
      setTextToModal("Deseja alterar a opção?");
      setWarningText(false);
    } else if (wichButton === "Select") {
      setButtonA("Não");
      setButtonB("Alterar");
      setTextToModal("Deseja alterar o template?");
      setText("Essa ação não poderá ser desfeita.");
      setWarningText(true);
    }
    toggle();
  };
  const handleButtonClick = (buttonId: string) => {
    if (buttonId === "Salvar") {
      createTrigger();
    } else if (buttonId === "Fechar") {
      toggle();
    } else if (buttonId === "Voltar") {
      toggle();
      BackToList();
    } else if (buttonId === "Sim") {
      toggle();
      BackToList();
    } else if (buttonId === "Não") {
      toggle();
    } else if (buttonId === "OK") {
      toggle();
      fileInputRef.current?.click();
    } else if (
      textToModal === "Deseja alterar a opção?" &&
      buttonId === "Alterar"
    ) {
      signInClients(typeClientValue);
      toggle();
    } else if (buttonId === "Alterar") {
      loadNewTemplate(templateNameSelect);
      toggle();
    }
  };

  const sheetsVariables = () => {
    let total = 0;
    if (fileData[0] === undefined) {
      return total - 1;
    }
    fileData[0].forEach((value) => {
      if (value !== "") total++;
    });
    return total - 1;
  };
  function convertServerType(botServerType: string) {
    switch (botServerType) {
      case "production":
        return "Principal";
      case "staging":
        return "Teste";
      case "development":
        return "Teste";
      default:
        return "Teste";
    }
  }

  function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split("-").map(Number);
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  }

  function checkNumber(phone: number) {
    setClientNumber(phone);
    setBlockAddNumber(phone.toString().length >= 5);
  }

  const handleDispatchNumberChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedNumber = e.target.value;
    setSelectedDispatchNumber(selectedNumber);
    
    if (
      selectedNumber !== "" &&
      errorMessage &&
      errorMessage.includes("número de disparo")
    ) {
      setErrorMessage("");
    }

    if (selectedNumber !== "") {
      await loadTemplates(selectedNumber);
    }
  };

  return (
    <div
      className="container-trigger width-95-perc"
      style={{ padding: "10px 0px" }}
    >
      <Modal
        buttonA={buttonA}
        buttonB={buttonB}
        isOpen={isOpen}
        modalRef={modalRef}
        text={text}
        toggle={toggle}
        question={textToModal}
        warning={warningText}
        onButtonClick={handleButtonClick}
      ></Modal>
      <ToastContainer />
      <h1
        style={{
          fontSize: "23px",
          fontWeight: "bolder",
          color: "#324d69",
          width: "100%",
        }}
        className="title_2024"
      >
        Criar Campanha
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
      <div>
        {hiddenVideo && (
          <DraggableComponent
            urlVideo={
              "https://www.loom.com/embed/e5216eb8145c4eaaae86b3e76b5f6dd0?sid=b6e75c08-5db3-41b4-bb0a-c029504dd33a"
            }
            showVideo={showVideo}
          />
        )}
        <div
          className={`accordion_head ${
            accordionState.channelTrigger ? "accordion_head_opened" : ""
          }`}
          style={{ borderRadius: "20px" }}
          onClick={() => toggleAccordion("channelTrigger")}
        >
          1. Selecionar canal
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
            <div className="accordeon-new">
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
                        `/template-trigger-teams?bot_id=${botId}&token=${searchParams.get(
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
      <div>
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
          <div className="body-no-background" style={{ width: "100%" }}>
            <div className="accordeon-new">
              <div
                className="body line"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  backgroundColor: "#FFF",
                  padding: "20px",
                  gap: "20px",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <span
                      className="span-title"
                      style={{
                        minWidth: "180px",
                        textAlign: "left",
                        paddingTop: "5px",
                      }}
                    >
                      Nome da campanha
                    </span>
                    <div style={{ flex: 1 }}>
                      <input
                        className="input-values"
                        type="text"
                        value={campaignName}
                        onChange={(e) => handleCampaignName(e.target.value)}
                        style={{ width: "100%", maxWidth: "400px" }}
                      />
                      {errorMessage && errorMessage.includes("campanha") && (
                        <p
                          style={{
                            color: "red",
                            fontSize: "10px",
                            fontWeight: "bolder",
                            marginTop: "5px",
                            margin: "5px 0 0 0",
                          }}
                        >
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <span
                      className="span-title"
                      style={{
                        minWidth: "180px",
                        textAlign: "left",
                        paddingTop: "5px",
                      }}
                    >
                      Número de disparo
                    </span>
                    <div style={{ flex: 1 }}>
                      <select
                        value={selectedDispatchNumber}
                        className="input-values"
                        onChange={handleDispatchNumberChange}
                        style={{ width: "100%", maxWidth: "400px" }}
                      >
                        <option value="">Selecione um número</option>
                        {dispatchNumbers.map((number, key) => (
                          <option key={key} value={number.number}>
                            {mask(number.number) +
                              " - " +
                              convertServerType(number.botServerType)}
                          </option>
                        ))}
                      </select>
                      {selectedDispatchNumber === "" &&
                        errorMessage &&
                        errorMessage.includes("número de disparo") && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "10px",
                              fontWeight: "bolder",
                              margin: "5px 0 0 0",
                            }}
                          >
                            {errorMessage}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <span
                      className="span-title"
                      style={{
                        minWidth: "180px",
                        textAlign: "left",
                        paddingTop: "5px",
                      }}
                    >
                      Selecionar template
                    </span>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div 
                        className="input-values" style={{ 
                          width: "100%", 
                          maxWidth: "400px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingLeft: "0",
                        }}>
                        <Select
                        value={templateName && templates.find(t => t.templateName === templateName) ? { value: templateName, label: templateName } : null}
                        onChange={(option: any) => {
                          if (option) {
                            setTemplateName(option.value);
                            openModal(option.value);
                          }
                        }}
                        options={templates.filter(t => t.templateName).map(t => ({ value: t.templateName!, label: t.templateName! }))}
                        placeholder="Buscar template..."
                        isClearable
                        isDisabled={selectedDispatchNumber === ""}
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: "100%",
                          }),
                          control: (base) => ({
                            ...base,
                            width: "100%",
                            height: "30px",
                            minHeight: "30px",
                            fontSize: "14px",
                            border: "1px solid #a8a8a8",
                            borderRadius: "8px",
                            paddingLeft: "7px",
                          }),
                        }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card unificado com os avisos */}
                {(templateName && categoryTemplate) ||
                selectedDispatchNumber !== "" ? (
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "8px",
                      padding: "15px",
                      marginTop: "20px",
                      marginBottom: "10px",
                    }}
                  >
                    {templateName && categoryTemplate && (
                      <div
                        style={{
                          marginBottom:
                            selectedDispatchNumber !== "" ? "15px" : "0",
                        }}
                      >
                        <Alert
                          message={`<strong>🟢 Aviso:</strong> Este template foi aprovado na categoria <strong>${
                            categoryTemplate === "MARKETING"
                              ? "MARKETING"
                              : categoryTemplate === "UTILITY"
                              ? "UTILIDADE"
                              : categoryTemplate === "AUTHENTICATION"
                              ? "AUTENTICAÇÃO"
                              : categoryTemplate
                          }</strong>.<br/>Após o envio da campanha, não é possível cancelar o disparo nem os custos associados.`}
                        />
                      </div>
                    )}
                    {selectedDispatchNumber !== "" && (
                      <div>
                        <WhatsAppLimitWarning metaUrl="https://business.facebook.com/business/loginpage/?next=%2Flatest%2Fwhatsapp_manager%2Fphone_numbers%2F%3Fasset_id%3D321277311061053%26business_id%3D484683378535543%26nav_ref%3Dbiz_unified_f3_login_page_to_mbs&login_options%5B0%5D=FB&login_options%5B1%5D=IG&login_options%5B2%5D=SSO&config_ref=biz_login_tool_flavor_mbs" />
                      </div>
                    )}
                  </div>
                ) : null}

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingTop: "10px",
                  }}
                >
                  <button
                    style={{ width: "80px" }}
                    className="button-next"
                    onClick={() => toggleAccordion("recebidores")}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className="config-recebidores"
        style={{ maxHeight: "1080px", maxWidth: "900px" }}
      >
        <div
          className={`accordion_head ${
            accordionState.recebidores ? "accordion_head_opened" : ""
          }`}
          onClick={() => toggleAccordion("recebidores")}
        >
          3. Cadastro dos Contatos da Campanha
          <div className="accordion_chevron">
            <img
              src={chevron}
              alt=""
              style={{
                rotate: accordionState.recebidores ? "-90deg" : "90deg",
              }}
            />
          </div>
        </div>
        {accordionState.recebidores && (
          <div className="body-no-background" style={{ width: "100%" }}>
            <div
              className="accordeon-new"
              style={{ width: "90%", padding: "0px 15px" }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "14px", paddingTop: "14px" }}>
                  Adicione os contatos que receberão as mensagens. Você pode
                  importar uma lista ou adicionar manualmente.
                </span>
                <div
                  style={{
                    marginTop: "17px",
                    marginBottom: "12px",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ marginBottom: "-7px" }}>
                    <input
                      type="radio"
                      name="clientes"
                      value="unico"
                      onChange={openModalChangeCustomersType}
                      className="input-spaces"
                      checked={typeClient === false}
                    />
                    <span className="blue-text">
                      <strong>Cadastrar Contato Individualmente:</strong>
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontStyle: "italic",
                      marginLeft: "25px",
                    }}
                  >
                    {" "}
                    "Selecione esta opção se deseja adicionar contatos um a um
                    manualmente para esta campanha."
                  </span>
                  {!typeClient && showType && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        marginTop: "20px",
                      }}
                    >
                      <div className="row-align">
                        <div className="column-align">
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
                                paddingBottom: blockAddNumber ? "0px" : "19px",
                              }}
                            >
                              Telefone{" "}
                            </span>
                            <div className="column-align">
                              <PhoneInput
                                defaultCountry="br"
                                value={clientNumber.toString()}
                                onChange={(event) => {
                                  checkNumber(
                                    parseInt(event.replace(/\D/g, ""))
                                  );
                                }}
                                inputStyle={{
                                  width: "212px",
                                  height: "30px",
                                  border: blockAddNumber
                                    ? "1px solid #A8A8A8"
                                    : "1px solid red",
                                  marginLeft: "5px",
                                  padding: "5px",
                                  borderRadius: "8px",
                                  alignItems: "center",
                                }}
                              />
                              {!blockAddNumber ? (
                                <span
                                  style={{
                                    paddingLeft: "50px",
                                    color: "red",
                                    fontSize: "11px",
                                  }}
                                >
                                  Telefone inválido
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {variables.length > 0 && (
                              <div style={{ textAlign: "left" }}>
                                {variables.map((variable, index) => (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "left",
                                      margin: "10px",
                                    }}
                                  >
                                    <span className="span-title">
                                      Variáveis {index + 1}
                                    </span>
                                    <input
                                      value={variable.text}
                                      type="text"
                                      name={variable.id.toString()}
                                      id=""
                                      onChange={handleInputVariable}
                                      className="input-values"
                                    />
                                    <a
                                      style={{ alignContent: "center" }}
                                      data-tooltip-id="no-emoji"
                                      data-tooltip-html="Você deverá preencher a variáveL para que não ocorra erro no envio"
                                    >
                                      <img
                                        src={info}
                                        width={15}
                                        height={15}
                                        alt="alerta"
                                      />
                                    </a>
                                    <Tooltip id="no-emoji" />
                                  </div>
                                ))}
                              </div>
                            )}
                            {headerConfig !== "text" &&
                              headerConfig !== null && (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "left",
                                    margin: "10px",
                                  }}
                                >
                                  <span className="span-title">
                                    Link{" "}
                                    {headerConfig === "document"
                                      ? "documento"
                                      : headerConfig === "image"
                                      ? "imagem"
                                      : "video"}
                                  </span>
                                  <input
                                    className="input-values"
                                    value={urlMidia.replace(/\s+/g, "")}
                                    onChange={(e) =>
                                      setURLMidia(
                                        e.target.value.replace(/\s+/g, "")
                                      )
                                    }
                                  />
                                </div>
                              )}
                            {hasButton && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "left",
                                  margin: "10px",
                                }}
                              >
                                <span
                                  className="span-title"
                                  style={{
                                    width: "auto",
                                    marginLeft: "10px",
                                    justifyContent: "flex-start",
                                    marginBottom: "15px",
                                  }}
                                >
                                  Título botão: {titleButton1}
                                </span>
                                {templateConfigurations ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "left",
                                      marginLeft: "10px",
                                      gap: "15px",
                                      padding: "10px",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "8px",
                                      border: "1px solid #e9ecef",
                                    }}
                                  >
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                      <span style={{ color: "#666", fontStyle: "italic", fontSize: "13px", width: "100%" }}>
                                        Payload 1 (antes da expiração):
                                      </span>
                                      <input
                                        className="input-values"
                                        value={templateConfigurations.payloadBeforeExpirationTime || ""}
                                        disabled
                                        style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px", boxSizing: "border-box" }}
                                      />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                      <span style={{ color: "#666", fontStyle: "italic", fontSize: "13px", width: "100%" }}>
                                        Payload 2 (após a expiração):
                                      </span>
                                      <input
                                        className="input-values"
                                        value={templateConfigurations.payloadAfterExpirationTime || ""}
                                        disabled
                                        style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px", boxSizing: "border-box" }}
                                      />
                                    </div>
                                    <div style={{ marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #e9ecef" }}>
                                      <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                        💡 Estes payloads foram configurados diretamente no template
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "left",
                                      marginLeft: "-4px",
                                    }}
                                  >
                                    <span className="span-title">Payload 1</span>
                                    <input
                                      className="input-values"
                                      value={payload1}
                                      onChange={(e) =>
                                        setPayload1(e.target.value)
                                      }
                                    />
                                    <a
                                      style={{ alignContent: "center" }}
                                      data-tooltip-id="no-emoji"
                                      data-tooltip-html="Payload não podem ser iguais!"
                                    >
                                      <img
                                        src={info}
                                        width={15}
                                        height={15}
                                        alt="alerta"
                                      />
                                    </a>
                                    <Tooltip id="no-emoji" />
                                  </div>
                                )}
                              </div>
                            )}
                            {qtButtons > 1 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "left",
                                  margin: "10px",
                                }}
                              >
                                <span
                                  className="span-title"
                                  style={{
                                    width: "auto",
                                    marginLeft: "10px",
                                    justifyContent: "flex-start",
                                    marginBottom: "15px",
                                  }}
                                >
                                  Título botão: {titleButton1}{" "}
                                </span>
                                {templateConfigurations ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "left",
                                      marginLeft: "10px",
                                      gap: "15px",
                                      padding: "10px",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "8px",
                                      border: "1px solid #e9ecef",
                                    }}
                                  >
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                        Payload 1 (antes da expiração):
                                      </span>
                                      <input
                                        className="input-values"
                                        value={templateConfigurations.payloadBeforeExpirationTime || ""}
                                        disabled
                                        style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                      />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                        Payload 2 (após a expiração):
                                      </span>
                                      <input
                                        className="input-values"
                                        value={templateConfigurations.payloadAfterExpirationTime || ""}
                                        disabled
                                        style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                      />
                                    </div>
                                    <div style={{ marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #e9ecef" }}>
                                      <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                        💡 Estes payloads foram configurados diretamente no template
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "left",
                                      marginLeft: "-4px",
                                    }}
                                  >
                                    <span className="span-title">Payload 2</span>
                                    <input
                                      className="input-values"
                                      value={payload2}
                                      onChange={(e) =>
                                        setPayload2(e.target.value)
                                      }
                                    />
                                    <a
                                      style={{ alignContent: "center" }}
                                      data-tooltip-id="no-emoji"
                                      data-tooltip-html="Payload não podem ser iguais!"
                                    >
                                      <img
                                        src={info}
                                        width={15}
                                        height={15}
                                        alt="alerta"
                                      />
                                    </a>
                                    <Tooltip id="no-emoji" />
                                  </div>
                                )}
                              </div>
                            )}
                            {qtButtons > 2 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "left",
                                  margin: "10px",
                                }}
                              >
                                <span
                                  className="span-title"
                                  style={{
                                    width: "auto",
                                    marginLeft: "10px",
                                    justifyContent: "flex-start",
                                    marginBottom: "15px",
                                  }}
                                >
                                  Título botão: {titleButton2}{" "}
                                </span>
                                {templateConfigurations ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "left",
                                      marginLeft: "10px",
                                      gap: "15px",
                                      padding: "10px",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "8px",
                                      border: "1px solid #e9ecef",
                                    }}
                                  >
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                        Payload 1 (antes da expiração):
                                      </span>
                                      <input
                                        className="input-values"
                                        value={templateConfigurations.payloadBeforeExpirationTime || ""}
                                        disabled
                                        style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                      />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                        Payload 2 (após a expiração):
                                      </span>
                                      <input
                                        className="input-values"
                                        value={templateConfigurations.payloadAfterExpirationTime || ""}
                                        disabled
                                        style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                      />
                                    </div>
                                    <div style={{ marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #e9ecef" }}>
                                      <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                        💡 Estes payloads foram configurados diretamente no template
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "left",
                                      marginLeft: "-4px",
                                    }}
                                  >
                                    <span className="span-title">Payload</span>
                                    <input
                                      className="input-values"
                                      value={payload3}
                                      onChange={(e) =>
                                        setPayload3(e.target.value)
                                      }
                                    />
                                    <a
                                      style={{ alignContent: "center" }}
                                      data-tooltip-id="no-emoji"
                                      data-tooltip-html="Payload não podem ser iguais!"
                                    >
                                      <img
                                        src={info}
                                        width={15}
                                        height={15}
                                        alt="alerta"
                                      />
                                    </a>
                                    <Tooltip id="no-emoji" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div
                              style={{
                                width: "100%",
                                textAlign: "end",
                                paddingRight: "10px",
                                paddingBottom: "20px",
                              }}
                            >
                              <button
                                onClick={addCustomerToSendTemplate}
                                style={{ width: "150px", marginRight: "20px" }}
                                className={
                                  blockAddNumber
                                    ? "button-blue"
                                    : "button-disabled"
                                }
                                disabled={!blockAddNumber}
                              >
                                Adicionar contato
                              </button>
                            </div>
                          </div>
                        </div>
                        <div style={{ width: "100%" }}>
                          <div
                            style={{
                              width: "100%",
                              alignItems: "center",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div
                              style={{
                                width: "200px",
                                border: "1px solid #C4C4C4",
                                padding: "20px 0px",
                                borderRadius: "7px",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                className="texts"
                                style={{ fontSize: "10px" }}
                              >
                                {hasHeader && typeOfHeader === "text" && (
                                  <label
                                    className="header"
                                    style={{
                                      whiteSpace: "pre-line",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    {headerText}
                                  </label>
                                )}
                                {hasHeader && typeOfHeader === "image" && (
                                  <label
                                    className="header"
                                    style={{
                                      whiteSpace: "pre-line",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    <img
                                      src={urlMidia}
                                      style={{
                                        maxWidth: "100%",
                                        maxHeight: "200px",
                                      }}
                                      alt=""
                                    />
                                  </label>
                                )}
                                {hasHeader && typeOfHeader === "document" && (
                                  <div
                                    className="column-align"
                                    style={{ padding: "10px" }}
                                  >
                                    <label
                                      className="header"
                                      style={{
                                        whiteSpace: "pre-line",
                                        wordWrap: "break-word",
                                      }}
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
                                {hasHeader && typeOfHeader === "video" && (
                                  <label
                                    className="header"
                                    style={{
                                      whiteSpace: "pre-line",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    <video width="160" height="120" controls>
                                      <source src={urlMidia} type="video/mp4" />
                                    </video>
                                  </label>
                                )}
                                {
                                  hasBody && (
                                    <label
                                      style={{
                                        whiteSpace: "pre-line",
                                        wordWrap: "break-word",
                                      }}
                                    >
                                      {" "}
                                      {bodyText.length > 256
                                        ? bodyText.slice(0, 256) + "...veja mais"
                                        : bodyText}
                                    </label>
                                  )
                                }
                                {
                                  hasFooter && (
                                    <label
                                      className="footer font-size-12"
                                      style={{
                                        whiteSpace: "pre-line",
                                        wordWrap: "break-word",
                                      }}
                                    >
                                      {footerText}
                                    </label>
                                  )
                                }
                                {hasButton && (
                                  <div className="quickReply-texts">
                                    {hasButton && (
                                      <div className="quick-reply">
                                        <label>{titleButton1}</label>
                                      </div>
                                    )}
                                    {qtButtons > 1 && (
                                      <div className="quick-reply">
                                        <label>{titleButton2}</label>
                                      </div>
                                    )}
                                    {qtButtons > 2 && (
                                      <div className="quick-reply">
                                        <label>{titleButton3}</label>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* {typeOfButtons === "cta" && <div className="quickReply-texts">
                            {buttonsCTA.length > 0 && (<div className="quick-reply"><label >{buttonsCTA[0].text}</label></div>)}
                            {buttonsCTA.length > 1 && (<div className="quick-reply"><label >{buttonsCTA[1].text}</label></div>)}
                        </div>} */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          maxHeight: "500px",
                          overflowY: "auto",
                          marginBottom: "10px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "10px 0px",
                        }}
                      >
                        <table
                          className="table-2024 fixed-header-table"
                          style={{
                            backgroundColor: "#FFF",
                            width: "97%",
                            padding: "2px 0px 10px 0px",
                          }}
                        >
                          <thead>
                            <tr className="cells table-2024 border-bottom-zero">
                              <th
                                className="cells"
                                style={{ fontSize: "10px" }}
                              >
                                <div
                                  style={{
                                    background: "#FFF",
                                    borderRadius: "6px",
                                  }}
                                >
                                  Telefone
                                </div>
                              </th>
                              {variables.length > 0 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 1
                                </th>
                              )}
                              {variables.length > 1 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 2
                                </th>
                              )}
                              {variables.length > 2 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 3
                                </th>
                              )}
                              {variables.length > 3 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 4
                                </th>
                              )}
                              {variables.length > 4 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 5
                                </th>
                              )}
                              {variables.length > 5 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 6
                                </th>
                              )}
                              {variables.length > 6 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 7
                                </th>
                              )}
                              {variables.length > 7 && (
                                <th
                                  className="cells"
                                  style={{ fontSize: "10px" }}
                                >
                                  Variável 8
                                </th>
                              )}
                              {headerConfig !== "text" &&
                                headerConfig !== null && (
                                  <th
                                    className="cells"
                                    style={{ fontSize: "10px" }}
                                  >
                                    Link midia
                                  </th>
                                )}
                            </tr>
                          </thead>
                          <tbody
                            style={{
                              backgroundColor: "#F9F9F9",
                              fontSize: "12px",
                            }}
                          >
                            {listVariables.length > 0 &&
                              listVariables.map((unicVariable, rowIndex) => (
                                <tr key={rowIndex}>
                                  <th className="border-gray">
                                    {unicVariable.phone}
                                  </th>
                                  {variables.length > 0 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_1}
                                    </th>
                                  )}
                                  {variables.length > 1 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_2}
                                    </th>
                                  )}
                                  {variables.length > 2 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_3}
                                    </th>
                                  )}
                                  {variables.length > 3 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_4}
                                    </th>
                                  )}
                                  {variables.length > 4 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_5}
                                    </th>
                                  )}
                                  {variables.length > 5 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_6}
                                    </th>
                                  )}
                                  {variables.length > 6 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_7}
                                    </th>
                                  )}
                                  {variables.length > 7 && (
                                    <th className="border-gray">
                                      {unicVariable.variable_8}
                                    </th>
                                  )}
                                  {headerConfig !== "text" &&
                                    headerConfig !== null && (
                                      <th>{unicVariable.media_url} OI</th>
                                    )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginBottom: "17px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div>
                    <input
                      type="radio"
                      name="clientes"
                      value="multiplos"
                      onChange={openModalChangeCustomersType}
                      className="input-spaces"
                      checked={typeClient === true}
                    />
                    <span className="blue-text">
                      <strong>Upload de Planilha de Contatos:</strong>
                    </span>
                    <a
                      href="/files/Modelo.xlsx"
                      download="Modelo - Planilha Contatos para Campanhas.xlsx"
                    >
                      <button
                        className="button-blue"
                        style={{ marginLeft: "12px", width: "120px" }}
                      >
                        Planilha exemplo
                      </button>
                    </a>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontStyle: "italic",
                      marginLeft: "25px",
                    }}
                  >
                    {" "}
                    "Escolha esta opção para fazer upload de uma planilha com
                    vários contatos de uma só vez para esta campanha."
                  </span>
                </div>
              </div>
              {typeClient && showType && (
                <div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    style={{
                      backgroundColor: "#0D5388",
                      color: "#FFF",
                      borderRadius: "20px",
                      display: "none",
                    }}
                    ref={fileInputRef}
                  />
                  <div className="row-align">
                    <div className="column-align">
                      {headerConfig !== "text" && headerConfig !== null && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "left",
                            margin: "10px",
                          }}
                        >
                          <span className="span-title">
                            Link{" "}
                            {headerConfig === "document"
                              ? "documento"
                              : headerConfig === "image"
                              ? "imagem"
                              : "video"}
                          </span>
                          <input
                            className="input-values"
                            value={urlMidia.replace(/\s+/g, "")}
                            onChange={(e) =>
                              setURLMidia(e.target.value.replace(/\s+/g, ""))
                            }
                          />
                        </div>
                      )}
                      {hasButton && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "left",
                            margin: "10px",
                          }}
                        >
                          <span
                            className="span-title"
                            style={{
                              width: "auto",
                              marginLeft: "10px",
                              justifyContent: "flex-start",
                              marginBottom: "15px",
                            }}
                          >
                            Título botão: {titleButton1}{" "}
                          </span>
                          {templateConfigurations ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "left",
                                marginLeft: "10px",
                                gap: "15px",
                                padding: "10px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                  Payload 1 (antes da expiração):
                                </span>
                                <input
                                  className="input-values"
                                  value={templateConfigurations.payloadBeforeExpirationTime || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                  Payload 2 (após a expiração):
                                </span>
                                <input
                                  className="input-values"
                                  value={templateConfigurations.payloadAfterExpirationTime || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                />
                              </div>
                              <div style={{ marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #e9ecef" }}>
                                <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                  💡 Estes payloads foram configurados diretamente no template
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "left",
                                marginLeft: "-4px",
                              }}
                            >
                              <span className="span-title">Payload 1</span>
                              <input
                                className="input-values"
                                value={payload1}
                                onChange={(e) => setPayload1(e.target.value)}
                              />
                              <a
                                style={{ alignContent: "center" }}
                                data-tooltip-id="no-emoji"
                                data-tooltip-html="Payload não podem ser iguais!"
                              >
                                <img
                                  src={info}
                                  width={15}
                                  height={15}
                                  alt="alerta"
                                />
                              </a>
                              <Tooltip id="no-emoji" />
                            </div>
                          )}
                        </div>
                      )}
                      {qtButtons > 1 && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "left",
                            margin: "10px",
                          }}
                        >
                          <span
                            className="span-title"
                            style={{
                              width: "auto",
                              marginLeft: "10px",
                              justifyContent: "flex-start",
                              marginBottom: "15px",
                            }}
                          >
                            Título botão: {titleButton2}{" "}
                          </span>
                          {templateConfigurations ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "left",
                                marginLeft: "10px",
                                gap: "15px",
                                padding: "10px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                  Payload 1 (antes da expiração):
                                </span>
                                <input
                                  className="input-values"
                                  value={templateConfigurations.payloadBeforeExpirationTime || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                  Payload 2 (após a expiração):
                                </span>
                                <input
                                  className="input-values"
                                  value={templateConfigurations.payloadAfterExpirationTime || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                />
                              </div>
                              <div style={{ marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #e9ecef" }}>
                                <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                  💡 Estes payloads foram configurados diretamente no template
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "left",
                                marginLeft: "-4px",
                              }}
                            >
                              <span className="span-title">Payload 2</span>
                              <input
                                className="input-values"
                                value={payload2}
                                onChange={(e) => setPayload2(e.target.value)}
                              />
                              <a
                                style={{ alignContent: "center" }}
                                data-tooltip-id="no-emoji"
                                data-tooltip-html="Payload não podem ser iguais!"
                              >
                                <img
                                  src={info}
                                  width={15}
                                  height={15}
                                  alt="alerta"
                                />
                              </a>
                              <Tooltip id="no-emoji" />
                            </div>
                          )}
                        </div>
                      )}
                      {qtButtons > 2 && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "left",
                            margin: "10px",
                          }}
                        >
                          <span
                            className="span-title"
                            style={{
                              width: "auto",
                              marginLeft: "10px",
                              justifyContent: "flex-start",
                              marginBottom: "15px",
                            }}
                          >
                            Título botão: {titleButton3}{" "}
                          </span>
                          {templateConfigurations ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "left",
                                marginLeft: "10px",
                                gap: "15px",
                                padding: "10px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                  Payload 1 (antes da expiração):
                                </span>
                                <input
                                  className="input-values"
                                  value={templateConfigurations.payloadBeforeExpirationTime || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span className="span-title" style={{ color: "#666", fontStyle: "italic", fontSize: "13px" }}>
                                  Payload 2 (após a expiração):
                                </span>
                                <input
                                  className="input-values"
                                  value={templateConfigurations.payloadAfterExpirationTime || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", color: "#666", width: "100%", padding: "8px" }}
                                />
                              </div>
                              <div style={{ marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #e9ecef" }}>
                                <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                  💡 Estes payloads foram configurados diretamente no template
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "left",
                                marginLeft: "-4px",
                              }}
                            >
                              <span className="span-title">Payload</span>
                              <input
                                className="input-values"
                                value={payload3}
                                onChange={(e) => setPayload3(e.target.value)}
                              />
                              <a
                                style={{ alignContent: "center" }}
                                data-tooltip-id="no-emoji"
                                data-tooltip-html="Payload não podem ser iguais!"
                              >
                                <img
                                  src={info}
                                  width={15}
                                  height={15}
                                  alt="alerta"
                                />
                              </a>
                              <Tooltip id="no-emoji" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          width: "100%",
                          alignItems: "center",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            width: "200px",
                            border: "1px solid #C4C4C4",
                            padding: "20px 0px",
                            borderRadius: "7px",
                            marginBottom: "10px",
                          }}
                        >
                          <div className="texts" style={{ fontSize: "10px" }}>
                            {hasHeader && typeOfHeader === "text" && (
                              <label
                                className="header"
                                style={{
                                  whiteSpace: "pre-line",
                                  wordWrap: "break-word",
                                }}
                              >
                                {headerText}
                              </label>
                            )}
                            {hasHeader && typeOfHeader === "image" && (
                              <label
                                className="header"
                                style={{
                                  whiteSpace: "pre-line",
                                  wordWrap: "break-word",
                                }}
                              >
                                <img
                                  src={urlMidia}
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "200px",
                                  }}
                                  alt=""
                                />
                              </label>
                            )}
                            {hasHeader && typeOfHeader === "document" && (
                              <div
                                className="column-align"
                                style={{ padding: "10px" }}
                              >
                                <label
                                  className="header"
                                  style={{
                                    whiteSpace: "pre-line",
                                    wordWrap: "break-word",
                                  }}
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
                            {hasHeader && typeOfHeader === "video" && (
                              <label
                                className="header"
                                style={{
                                  whiteSpace: "pre-line",
                                  wordWrap: "break-word",
                                }}
                              >
                                <video width="160" height="120" controls>
                                  <source src={urlMidia} type="video/mp4" />
                                </video>
                              </label>
                            )}
                            {
                              hasBody && (
                                <label
                                  style={{
                                    whiteSpace: "pre-line",
                                    wordWrap: "break-word",
                                  }}
                                >
                                  {" "}
                                  {bodyText.length > 256
                                    ? bodyText.slice(0, 256) + "...veja mais"
                                    : bodyText}
                                </label>
                              )
                            }
                            {
                              hasFooter && (
                                <label
                                  className="footer font-size-12"
                                  style={{
                                    whiteSpace: "pre-line",
                                    wordWrap: "break-word",
                                  }}
                                >
                                  {footerText}
                                </label>
                              )
                            }
                            {hasButton && (
                              <div className="quickReply-texts">
                                {hasButton && (
                                  <div className="quick-reply">
                                    <label>{titleButton1}</label>
                                  </div>
                                )}
                                {qtButtons > 1 && (
                                  <div className="quick-reply">
                                    <label>{titleButton2}</label>
                                  </div>
                                )}
                                {qtButtons > 2 && (
                                  <div className="quick-reply">
                                    <label>{titleButton3}</label>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* {typeOfButtons === "cta" && <div className="quickReply-texts">
                            {buttonsCTA.length > 0 && (<div className="quick-reply"><label >{buttonsCTA[0].text}</label></div>)}
                            {buttonsCTA.length > 1 && (<div className="quick-reply"><label >{buttonsCTA[1].text}</label></div>)}
                        </div>} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "10px" }}>
                    <input
                      type="text"
                      value={fileName}
                      disabled
                      style={{ width: "300px", borderRadius: "8px" }}
                    />
                    <button
                      type="button"
                      style={{ width: "120px", marginLeft: "7px" }}
                      onClick={() => handleButtonName("warningFile")}
                      className="button-blue"
                    >
                      Escolher arquivo
                    </button>
                  </div>
                  <div
                    style={{
                      maxHeight: "500px",
                      maxWidth: "900px",
                      overflowY: "auto",
                      marginBottom: "10px",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "10px 0px",
                    }}
                  >
                    <table
                      className="table-2024 fixed-header-table"
                      style={{
                        backgroundColor: "#FFF",
                        width: "97%",
                        padding: "10px",
                      }}
                    >
                      <thead>
                        <tr className="cells table-2024 border-bottom-zero font-size-12">
                          {headerTable &&
                            headerTable.length > 0 &&
                            headerTable[0].map((cell: any, index: number) => (
                              <th className="cells" key={index}>
                                {cell}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody
                        className="font-size-12"
                        style={{ backgroundColor: "#F9F9F9" }}
                      >
                        {fileData.length > 0 &&
                          fileData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  style={{
                                    color:
                                      cellIndex === 0 &&
                                      /^\d+$/.test(cell) === false
                                        ? "red"
                                        : "",
                                  }}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {sheetsVariables() === variables.length
                      ? "Planilha correta"
                      : `Planilha com erro, o template precisa de ${
                          variables.length
                        } variável(is) e sua planilha possui ${
                          sheetsVariables() === -1 ? 0 : sheetsVariables()
                        }`}
                  </div>
                </div>
              )}
              <div style={{ width: "100%", textAlign: "right" }}>
                <button
                  style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                  className="button-next"
                  onClick={() => toggleAccordion("disparo")}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="modo-disparo">
        <div
          className={`accordion_head ${
            accordionState.disparo ? "accordion_head_opened" : ""
          }`}
          onClick={() => toggleAccordion("disparo")}
        >
          4. Modo de Disparo
          <div className="accordion_chevron">
            <img
              src={chevron}
              alt=""
              style={{ rotate: accordionState.disparo ? "-90deg" : "90deg" }}
            />
          </div>
        </div>
        {accordionState.disparo && (
          <div className="body-no-background" style={{ width: "100%" }}>
            <div className="accordeon-new">
              <div className="body" style={{ backgroundColor: "#FFF" }}>
                <div className="line">
                  <input
                    type="radio"
                    name="disparo"
                    value="imediato"
                    onChange={handleMode}
                    className="input-spaces"
                    checked={mode === false}
                  />
                  <span>Imediato</span>
                  <input
                    type="radio"
                    name="disparo"
                    value="agendado"
                    onChange={handleMode}
                    className="input-spaces"
                    checked={mode === true}
                  />
                  <span>Agendado</span>
                </div>
                {mode && (
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        margin: "10px",
                      }}
                    >
                      <span className="span-title">Data</span>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={dates}
                        onChange={(e) =>
                          setDate((e.target as HTMLInputElement).value)
                        }
                        className="input-values"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        margin: "10px",
                      }}
                    >
                      <span className="span-title">Horário</span>
                      <input
                        type="time"
                        min={new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        value={hours}
                        onChange={(e) =>
                          setHours((e.target as HTMLInputElement).value)
                        }
                        className="input-values"
                      />
                    </div>
                  </div>
                )}
                {!mode && (
                  <div>
                    <Alert message="Neste modo, após salvar a campanha, o disparo começará a ser realizado, não podendo ser cancelado." />
                  </div>
                )}
              </div>
              <div style={{ width: "100%", textAlign: "right" }}>
                <button
                  style={{ width: "80px", margin: "0px 30px 15px 0px" }}
                  className="button-next"
                  onClick={() => toggleAccordion("revisar")}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="revisar">
        <div
          className={`accordion_head ${
            accordionState.revisar ? "accordion_head_opened" : ""
          }`}
          onClick={() => toggleAccordion("revisar")}
        >
          5. Resumo e salvar
          <div className="accordion_chevron">
            <img
              src={chevron}
              alt=""
              style={{ rotate: accordionState.revisar ? "-90deg" : "90deg" }}
            />
          </div>
        </div>
        {accordionState.revisar && (
          <div className="body-no-background" style={{ width: "100%" }}>
            <div
              className="accordeon-new"
              style={{ padding: "0px 15px 15px 10px" }}
            >
              <div style={{ justifyContent: "center" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    width: "90%",
                  }}
                >
                  <span className="span-title-resume">
                    Nome da campanha: {campaignName}
                  </span>
                  <span className="span-title-resume">
                    Template: {templateName}
                  </span>
                  <span className="span-title-resume">
                    Telefone do disparo: {mask(selectedDispatchNumber || phone)}
                  </span>
                  <span className="span-title-resume">
                    Data e hora do disparo:{" "}
                    {triggerMode === "imediato"
                      ? "imediato"
                      : `agendado dia ${formatDate(dates)} às ${hours}`}
                  </span>
                  <span className="span-title-resume">
                    Quantidade de disparos:{" "}
                    {typeClient === false
                      ? listVariables.length
                      : fileData.length > 0
                      ? fileData.length
                      : "0"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <button
                    className="button-cancel"
                    onClick={() => handleButtonName("Cancelar")}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button-save"
                    onClick={() => handleButtonName("Salvar")}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accordion;
