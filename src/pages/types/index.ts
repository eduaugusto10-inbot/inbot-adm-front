export { }

export interface ICustomerData {
    number: string;
    client: string;
    description: string;
    observation: string,
    accessToken: string;
    botId: number;
    webhook: string;
    botToken: string;
    botServerType: string;
    address: string;
    email: string;
    vertical: string;
    websites: string;
    profile_pic: string;
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
    footer: "",
    body: "",
    header: ""
};

export const defaultCustomerData: ICustomerData = {
    number: '',
    client: '',
    description: '',
    observation: '',
    accessToken: '',
    botId: 0,
    botToken: '',
    webhook: '',
    botServerType: '',
    address: '',
    email: '',
    vertical: '',
    websites: '',
    profile_pic: '',
}

export interface ITemplateList {
    ID: string,
    category: string,
    name: string,
    language: string
    status: string,
    components: any
}

export interface IPayload {
    category: string,
    name: string,
    language: string,
    components: [{
        type: string,
        parameters: [{
            type: string,
            text: string,
            example: string,
            phoneNumber: string,
            url: string
        }]
    }]
}

export interface IObject {
    type?: string,
    parameters: [{
        type: string,
        text: string,
        example?: string[],
    }]
}
export interface IFooter {
    type: string,
    parameters: [{
        type: string,
        text: string,
    }]
}
export interface IHeader {
    choose?: boolean,
    type?: string,
    parameters?: [{
        type?: string,
        text?: string,
        example?: [string]
    }]
}

export const payload: IPayload = {
    category: "",
    name: "",
    language: "",
    components: [{
        type: "",
        parameters: [{
            type: "",
            text: "",
            example: "",
            phoneNumber: "",
            url: ""
        }]
    }]
}

export interface IButton {
    id: number
    value: string
    text: string
    type?: string
    phoneNumber?: string
    url?: string
}

export interface IVariables {
    id: number
    value: string
    text: string
}