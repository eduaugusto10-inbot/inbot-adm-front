import axios from "axios";

const api = axios.create({
  baseURL: "https://api.inbot.com.br/user-manager/v1",
});

export const apiTemplateWhatsapp = axios.create({
  baseURL: "https://api.inbot.com.br/v2/api",
});

export default api;
