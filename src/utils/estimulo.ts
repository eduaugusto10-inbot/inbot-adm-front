import axios from "axios";

export const estimulos = async (botId: string) => {
  try {
    const response = await axios.get(
      `https://in.bot/inbot-admin?action=lista_estimulos&is_ajax=1&bot_id=${botId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
