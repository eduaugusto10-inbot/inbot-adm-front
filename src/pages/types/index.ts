export { }

export interface ICustomerData {
    number: string;
    client: string;
    description: string;
    observation: string,
    accessToken: string;
    botId: number;
    gateway: string;
    botToken: string;
    botServerType: string;
    address: string;
    email: string;
    vertical: string;
    websites: string;
}

export interface ITemplate {
    footer: string,
    body: string,
    header: string
}

export interface IQuickReply {
    type: string,
    text: string,
}

export const defaultQuickReply: IQuickReply[] = [
    { type: "quickReply", text: "Botão" }
];

export const templateValue: ITemplate = {
    footer: "Rodapé",
    body: "Conteúdo",
    header: "Cabeçalho"
};

export const defaultCustomerData: ICustomerData = {
    number: '',
    client: '',
    description: '',
    observation: '',
    accessToken: '',
    botId: 0,
    botToken: '',
    gateway: '',
    botServerType: '',
    address: '',
    email: '',
    vertical: '',
    websites: ''
}