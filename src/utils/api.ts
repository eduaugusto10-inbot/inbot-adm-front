import axios from "axios";

const api = axios.create({
  baseURL: "https://api-stg.inbot.com.br/user-manager/v1",
});

export default api;
