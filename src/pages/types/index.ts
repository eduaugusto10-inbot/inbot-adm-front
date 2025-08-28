export {};

export interface SavedValue {
  nomeCampo: string;
  tipo: string;
  status: string;
}

export interface ICustomerData {
  number: string;
  client: string;
  description: string;
  observation: string;
  accessToken: string;
  botId: number;
  webhook: string;
  botToken: string;
  botServerType: string;
  url_server: string;
  url_inchat: string;
  server: string;
  address: string;
  email: string;
  vertical: string;
  websites: string;
  profile_pic: string;
  activated: number;
  origin: string;
  about: string;
}

export interface ITemplate {
  footer: string;
  body: string;
  header: string;
}
export interface ITemplateTeams {
  body: string;
  header: string;
}

export interface IButtonTeams {
  title: string;
}

export interface PayloadTeams {
  templateName: string;
  message: string;
  hasButton: number;
  hasHeader: number;
  hasVariable: number;
  language: string;
  status: string;
  buttons: IButtonTeams[];
}

export interface IQuickReply {
  type: string;
  text: string;
}

export const defaultQuickReply: IQuickReply[] = [
  { type: "quickReply", text: "Botão" },
];

export const templateValue: ITemplate = {
  footer: "",
  body: "",
  header: "",
};

export const defaultCustomerData: ICustomerData = {
  number: "",
  client: "",
  description: "",
  observation: "",
  accessToken: "",
  botId: 0,
  botToken: "",
  webhook: "",
  botServerType: "",
  url_server: "",
  url_inchat: "",
  server: "",
  address: "",
  email: "",
  vertical: "",
  websites: "",
  profile_pic: "",
  activated: 0,
  origin: "",
  about: "",
};

export interface ITemplateList {
  ID: string;
  category: string;
  name: string;
  language: string;
  status: string;
  components: any;
}
export interface ITemplateListTeams {
  id: string;
  templateName: string;
  message: string;
  hasButton: number;
  hasHeader: number;
  hasVariable: number;
  language: string;
  status: string;
  buttons: IButtonTeams[];
}

export interface IPayload {
  category: string;
  name: string;
  language: string;
  components: [
    {
      type: string;
      parameters: [
        {
          type: string;
          text: string;
          example: string;
          phoneNumber: string;
          url: string;
        }
      ];
    }
  ];
}

export interface IObject {
  type?: string;
  parameters: [
    {
      type: string;
      text: string;
      example?: string[];
    }
  ];
}
export interface IFooter {
  type: string;
  parameters: [
    {
      type: string;
      text: string;
    }
  ];
}
export interface IHeader {
  choose?: boolean;
  type?: string;
  parameters?: [
    {
      type?: string;
      text?: string;
      example?: [string];
    }
  ];
}

export const payload: IPayload = {
  category: "",
  name: "",
  language: "",
  components: [
    {
      type: "",
      parameters: [
        {
          type: "",
          text: "",
          example: "",
          phoneNumber: "",
          url: "",
        },
      ],
    },
  ],
};

export interface IButton {
  id: number;
  value: string;
  text: string;
  type?: string;
  url_phone?: string;
}

export interface IVariables {
  id: number;
  value: string;
  text: string;
}

export interface IListVariables {
  phone: number | null;
  email: string;
  variable_1: string;
  variable_2: string;
  variable_3: string;
  variable_4: string;
  variable_5: string;
  variable_6: string;
  variable_7: string;
  variable_8: string;
  variable_9: string;
  media_url?: string;
  payload_1?: string;
  payload_2?: string;
  payload_3?: string;
}

export interface ITriggerList {
  id: number;
  campaign_name: string;
  template_name: string;
  status: string;
  type_trigger: string;
  time_trigger: string;
  data_criacao: string;
}

export interface AccordionState {
  channelTrigger: boolean;
  selectNumber: boolean;
  config: boolean;
  recebidores: boolean;
  disparo: boolean;
  revisar: boolean;
}

export interface ICustomer {
  id: number;
  engagement: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
  data_disparo: string;
  variable_1: string;
  variable_2: string;
  variable_3: string;
  variable_4: string;
  variable_5: string;
  variable_6: string;
  variable_7: string;
  variable_8: string;
  variable_9: string;
  media_url?: string;
  payload_1?: string;
  payload_2?: string;
  payload_3?: string;
  log?: string;
}
export interface AccordionUserManager {
  new: boolean;
  base: boolean;
}
export interface AccordionTable {
  individual: boolean;
  sheets: boolean;
}
export interface AccordionStateCreate {
  channelTrigger: boolean;
  config: boolean;
  header: boolean;
  body: boolean;
  footer: boolean;
  botao: boolean;
}
export interface AccordionStateCreateTeams {
  channelTrigger: boolean;
  config: boolean;
  header: boolean;
  body: boolean;
  botao: boolean;
}
export interface AccordionStateWhats {
  inbot: boolean;
  smarters: boolean;
  finish: boolean;
}
export interface ButtonQR {
  type: string;
  parameters: { type?: string; text: string }[];
}

export interface Filters {
  telefone: string;
  email: string;
  variable_1: string;
  variable_2: string;
  variable_3: string;
  variable_4: string;
  variable_5: string;
  variable_6: string;
  variable_7: string;
  variable_8: string;
  variable_9: string;
  status: {
    executado: boolean;
    entregue: boolean;
    aguardando: boolean;
    enviado: boolean;
    erro: boolean;
    cancelado: boolean;
    criando: boolean;
  };
}

export interface ITriggerListFilter {
  campaign_name: string;
  template_name: string;
  category: string;
  type_trigger: string;
  time_trigger: string;
  data_criacao: string;
  status: {
    executado: true;
    entregue: boolean;
    aguardando: boolean;
    enviado: boolean;
    erro: boolean;
    cancelado: boolean;
    criando: boolean;
  };
}

export interface IFilterBtn {
  status: {
    todos: boolean;
    ativos: boolean;
    inativos: boolean;
  };
}
