import axios from "axios";

// const generateToken = async (botId: number): Promise<string | null> => {
//   try {
//     const resp = await api.get(`/customer-manager/access-key/${botId}`);
//     return resp.data.key;
//   } catch (error) {
//     console.error("Erro ao buscar access key:", error);
//     return null;
//   }
// };

const api = axios.create({
  // baseURL: "http://localhost:19000",
  baseURL: "https://api-stg.inbot.com.br/user-manager/v1",
  // baseURL: 'https://webhooks.inbot.com.br/inbot-adm-back/v1/gateway'
});

export default api;
