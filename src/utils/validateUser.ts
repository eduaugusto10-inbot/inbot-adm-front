import axios from "axios";
import api from "./api";

// Função utilitária para obter o nome do usuário do localStorage
export const getAdminName = (): string | null => {
  return localStorage.getItem("admin_name");
};

// Função utilitária para obter o tipo do usuário do localStorage
export const getAdminType = (): string | null => {
  return localStorage.getItem("admin_type");
};

// Função utilitária para obter o email do usuário do localStorage
export const getAdminEmail = (): string | null => {
  return localStorage.getItem("admin_email");
};

// Função utilitária para obter o ID do usuário do localStorage
export const getAdminId = (): string | null => {
  return localStorage.getItem("admin_id");
};

// Função utilitária para obter todas as informações do admin
export const getAdminInfo = () => {
  return {
    name: getAdminName(),
    type: getAdminType(),
    email: getAdminEmail(),
    id: getAdminId(),
  };
};

// Função utilitária para limpar todas as informações do usuário do localStorage
export const clearAdminData = (): void => {
  localStorage.removeItem("admin_name");
  localStorage.removeItem("admin_type");
  localStorage.removeItem("admin_email");
  localStorage.removeItem("admin_id");
};

export const validatedUser = async (
  botId: string | null,
  token: string | null,
  baseUrl: string | null
) => {
  if (botId === null || token === null) {
    return false;
  }

  try {
    let hasWhats = false;
    let hasTeams = false;
    const url = `${baseUrl}validate_admin_token?token=${token}&is_ajax=1`;
    const resp = await axios.get(url);

    // Salvar informações do usuário no localStorage
    if (resp.data.admin_name) {
      localStorage.setItem("admin_name", resp.data.admin_name);
    }
    if (resp.data.admin_type) {
      localStorage.setItem("admin_type", resp.data.admin_type);
    }
    if (resp.data.admin_email) {
      localStorage.setItem("admin_email", resp.data.admin_email);
    }
    if (resp.data.admin_id) {
      localStorage.setItem("admin_id", resp.data.admin_id.toString());
    }

    await api
      .get(`/whats-botid/${botId}`)
      .then((resp) => {
        if (resp.data?.id) hasWhats = true;
      })
      .catch((error) => {
        console.log(error);
      });
    await api
      .get(`/teams/list-bot/botid/${botId}`)
      .then((resp) => {
        if (resp.data.length) hasTeams = true;
      })
      .catch((error) => console.log(error));
    console.log("hasTeams", hasTeams);
    console.log("hasWhats", hasWhats);
    if (resp.data.bot_id === botId && hasTeams && !hasWhats) {
      return { logged: true, channel: "teams" };
    } else if (resp.data.bot_id === botId && hasWhats && !hasTeams) {
      return { logged: true, channel: "whats" };
    } else if (resp.data.bot_id === botId && hasWhats && hasTeams) {
      return { logged: true, channel: "all" };
    } else {
      return { logged: false, channel: "none" };
    }
  } catch (error) {
    console.log("Erro na validação:", error);
    return false;
  }
};
