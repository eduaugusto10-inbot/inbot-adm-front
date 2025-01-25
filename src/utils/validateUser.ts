import axios from 'axios';
import api from './api';

export const validatedUser = async (
  botId: string | null,
  token: string | null
) => {
  if (botId === null || token === null) {
    return false;
  }

  try {
    let hasWhats = false;
    let hasTeams = false;
    await api.get(`/whats-botid/${botId}`);
    const url =
      botId == '1'
        ? `https://oec.in.bot/api/validate_admin_token?token=${token}&is_ajax=1`
        : botId == '11'
        ? `https://tecban-chat.in.bot/api/validate_admin_token?token=${token}&is_ajax=1`
        : `https://in.bot/api/validate_admin_token?token=${token}&is_ajax=1`;
    const resp = await axios.get(url);
    await api
      .get(`/whatsapp/trigger-bot/${botId}`)
      .then((resp) => {
        if (resp.data.data.length) hasWhats = true;
      })
      .catch((error) => console.log(error));
    await api
      .get(`/teams/list-bot/botid/${botId}`)
      .then((resp) => {
        if (resp.data.length) hasTeams = true;
      })
      .catch((error) => console.log(error));
    if (resp.data.bot_id === botId && hasTeams && !hasWhats) {
      return { logged: true, channel: 'teams' };
    } else if (resp.data.bot_id === botId && hasWhats && !hasTeams) {
      return { logged: true, channel: 'whats' };
    } else if (resp.data.bot_id === botId && hasWhats && hasTeams) {
      return { logged: true, channel: 'all' };
    } else {
      return { logged: false, channel: 'none' };
    }
  } catch (error) {
    console.log('Erro na validação:', error);
    return false;
  }
};
