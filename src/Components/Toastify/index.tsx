import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const successMessageChange = () => toast.success("Número alterado com sucesso", {
    theme: "colored"
});
export const successMessageCreate = () => toast.success("Número criado com sucesso", {
    theme: "colored"
});
export const successMessageDelete = () => toast.success("Número deletado com sucesso", {
    theme: "colored"
});
export const errorMessage = () => toast.error("Erro no sistema, tente mais tarde", {
    theme: "colored"
});
export const errorMessageDelete = () => toast.error("Erro ao deletar número", {
    theme: "colored"
});
export const errorSession = () => toast.error("Sessão expirada, faça login novamente", {
    theme: "colored"
});