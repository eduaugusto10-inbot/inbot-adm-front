import axios from 'axios';
import api from './api';

export const validatedUser = async (
  botId: string | null,
  token: string | null
) => {
  console.log(botId + ' ' + token);

  if (botId === null || token === null) {
    return false;
  }

  try {
    await api.get(`/whats-botid/${botId}`);
    const url =
      botId == '1'
        ? `https://oec.in.bot/api/validate_admin_token?token=${token}&is_ajax=1`
        : botId == '11'
        ? `https://tecban-chat.in.bot/api/validate_admin_token?token=${token}&is_ajax=1`
        : `https://in.bot/api/validate_admin_token?token=${token}&is_ajax=1`;
    const resp = await axios.get(url);
    if (resp.data.bot_id === botId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Erro na validação:', error);
    return false;
  }
};
