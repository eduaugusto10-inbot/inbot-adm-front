import axios from "axios";
import api from "./api";

export const validatedUser = (botId: string | null, token: string | null) => {
  console.log(botId + " " + token);
  let logged = false;
  if (botId === null || token === null) {
    window.location.href = "https://in.bot/inbot-admin";
  }
  api.get(`/whats-botid/${botId}`).catch((error) => {
    console.log("botId nao liberado", error);
  });
  axios
    .get(`https://in.bot/api/validate_admin_token?token=${token}`)
    .then((resp) => {
      console.log(resp);
      if (resp.data.bot_id !== botId) {
        window.location.href = "https://in.bot/inbot-admin";
      }
      logged = true;
    })
    .catch(() => {
      window.location.href = "https://in.bot/inbot-admin";
    });
  return logged;
};
