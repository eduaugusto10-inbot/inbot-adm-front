import axios from "axios";
import api from "./api";

export const validatedUser = (botId: string | null, token: string | null) => {
  console.log(botId + " " + token);
  let logged = true;
  if (botId === null || token === null) {
    //window.location.href = "https://in.bot/inbot-admin";
  }
  api
    .get(`/whats-botid/${botId}`)
    .then(() => {
      axios
        .get(`https://in.bot/api/validate_admin_token?token=${token}&is_ajax=1`)
        .then((resp) => {
          console.log(resp.data.bot_id + " " + botId);
          if (resp.data.bot_id === botId) {
            logged = true;
          } else {
            window.location.href = "https://in.bot/inbot-admin";
          }
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log("botId nao liberado", error);
    });
  console.log(botId);
  return logged;
};
