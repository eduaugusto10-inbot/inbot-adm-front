import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const successMessageChange = () => toast.success("Dados alterados com sucesso", {
    theme: "colored"
});
export const successMessageDeleteTemplate = () => toast.success("Template deletado com sucesso", {
    theme: "colored"
});
export const successMessageCreate = () => toast.success("Número criado com sucesso", {
    theme: "colored"
});
export const successMessageDelete = () => toast.success("Número deletado com sucesso", {
    theme: "colored"
});
export const successMessageImg = () => toast.success("Imagem salva com sucesso", {
    theme: "colored"
});
export const successCreateTemplate = () => toast.success("Template criado com sucesso", {
    theme: "colored"
})
export const successCancelTrigger = () => toast.success("Disparo cancelado com sucesso", {
    theme: "colored"
})
export const errorMessage = () => toast.error("Erro no sistema, tente mais tarde", {
    theme: "colored"
});
export const errorMessageDefault = (message: string) => toast.error(message, {
    theme: "colored"
});
export const errorMessageDelete = () => toast.error("Erro ao deletar número", {
    theme: "colored"
});
export const errorMessageImg = () => toast.error("Erro ao salvar imagem", {
    theme: "colored"
});
export const errorSession = () => toast.error("Sessão expirada, faça login novamente", {
    theme: "colored"
});
export const errorSheets = () => toast.error("Coluna telefone não esta correta", {
    theme: "colored"
});
export const errorPhoneEmpty = () => toast.error("Telefone não pode ser vazio", {
    theme: "colored"
});
export const errorMidiaEmpty = () => toast.error("Link não pode ser vazio", {
    theme: "colored"
});
export const errorEmptyVariable = () => toast.error("Variável não pode ser vazio", {
    theme: "colored"
});
export const errorDuplicatedPhone = () => toast.error("Telefone já cadastrado", {
    theme: "colored"
});
export const errorCampaingEmpty = () => toast.error("Insira o nome da campanha", {
    theme: "colored"
});
export const errorTriggerMode = () => toast.error("Escolha o modo de disparo", {
    theme: "colored"
});
export const errorNoRecipient = () => toast.error("Nenhum destinatário cadastrado", {
    theme: "colored"
});
export const waitingMessage = () => toast.info("Aguarde ...", {
    theme: "colored"
})
export const successCreateTrigger = () => toast.success("Criado com sucesso", {
    theme: "colored"
});
export const emptyMessage = () => toast.warn("Preencha todos os campos");
export const errorMessageHeader = () => toast.warn("Preencha os campos do cabeçalho");
export const errorMessageConfig = () => toast.warn("Preencha os campos de configuração");
export const errorMessageFooter = () => toast.warn("Preencha os campos do rodapé");
export const errorMessageBody = () => toast.warn("Preencha o body, não pode ser vazio");
export const erroMessageQuickReply = () => toast.warn("Preencha o botão");
export const errorCancelTrigger = () => toast.error("Não permitido cancelar operação",{
    theme:"colored"
})
