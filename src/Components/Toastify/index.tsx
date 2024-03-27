import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const successMessageChange = () => toast.success("Dados alterados com sucesso", {
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
export const errorMessage = () => toast.error("Erro no sistema, tente mais tarde", {
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
export const waitingMessage = () => toast.info("Aguarde ...", {
    theme: "colored"
})
export const emptyMessage = () => toast.warn("Preencha todos os campos");
export const errorMessageHeader = () => toast.warn("Preencha os campos do cabeçalho");
export const errorMessageFooter = () => toast.warn("Preencha os campos do rodapé");
export const errorMessageBody = () => toast.warn("Preencha o body, não pode ser vazio");
export const erroMessageQuickReply = () => toast.warn("Preencha o botão");
