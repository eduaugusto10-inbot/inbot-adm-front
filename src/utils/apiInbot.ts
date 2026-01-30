import axios from "axios";

interface AccessKeyResponse {
  id: number;
  accessKey: string;
  botId: number;
  createdAt: string;
  updatedAt: string;
}

interface TokenResponse {
  token: string;
}

/**
 * Utilitário simples para fazer chamadas à API da Inbot com autenticação automática
 */
const inbotApi = {
  baseUrl: "https://api-stg.inbot.com.br/v2/",

  token: null as string | null,
  tokenExpiration: null as Date | null,
  botId: null as number | null,

  /**
   * Define o botId para as chamadas à API
   * @param botId ID do bot
   */
  setBotId(botId: number): void {
    this.botId = botId;
  },

  /**
   * Obtém o access-key para o botId configurado
   * @returns Promise com o access-key
   */
  async getAccessKey(): Promise<string> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    try {
      const response = await axios.get<AccessKeyResponse>(
        `${this.baseUrl}/botId/${this.botId}/auth/access-key`
      );
      return response.data.accessKey;
    } catch (error) {
      console.error("Erro ao obter access-key:", error);
      throw new Error("Falha ao obter access-key");
    }
  },

  /**
   * Gera um token de autenticação usando o access-key
   * @param accessKey Access-key obtido previamente
   * @returns Promise com o token
   */
  async generateToken(accessKey: string): Promise<string> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    try {
      const response = await axios.post<TokenResponse>(
        `${this.baseUrl}/botId/${this.botId}/auth/token`,
        { accessKey },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
        }
      );

      // Define a expiração do token para 8 horas a partir de agora
      this.tokenExpiration = new Date();
      this.tokenExpiration.setHours(this.tokenExpiration.getHours() + 8);

      return response.data.token;
    } catch (error) {
      console.error("Erro ao gerar token:", error);
      throw new Error("Falha ao gerar token de autenticação");
    }
  },

  /**
   * Verifica se o token atual é válido ou precisa ser renovado
   * @returns true se o token precisa ser renovado, false caso contrário
   */
  isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return true;
    }

    // Adiciona uma margem de segurança de 5 minutos
    const now = new Date();
    const safetyMargin = 5 * 60 * 1000; // 5 minutos em milissegundos
    return now.getTime() + safetyMargin >= this.tokenExpiration.getTime();
  },

  /**
   * Obtém um token válido, gerando um novo se necessário
   * @returns Promise com o token válido
   */
  async getValidToken(): Promise<string> {
    if (this.isTokenExpired()) {
      const accessKey = await this.getAccessKey();
      this.token = await this.generateToken(accessKey);
    }
    return this.token!;
  },

  /**
   * Faz uma chamada GET à API com autenticação
   * @param endpoint Endpoint da API (sem o prefixo /botId/{botId})
   * @returns Promise com a resposta da API
   */
  async get<T>(endpoint: string): Promise<T> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/botId/${this.botId}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;

    try {
      const response = await axios.get<T>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na chamada GET para ${url}:`, error);
      throw error;
    }
  },

  /**
   * Faz uma chamada POST à API com autenticação
   * @param endpoint Endpoint da API (sem o prefixo /botId/{botId})
   * @param data Dados a serem enviados no corpo da requisição
   * @returns Promise com a resposta da API
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/botId/${this.botId}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;

    try {
      const response = await axios.post<T>(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na chamada POST para ${url}:`, error);
      throw error;
    }
  },

  /**
   * Faz uma chamada PUT à API com autenticação
   * @param endpoint Endpoint da API (sem o prefixo /botId/{botId})
   * @param data Dados a serem enviados no corpo da requisição
   * @returns Promise com a resposta da API
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/botId/${this.botId}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;

    try {
      const response = await axios.put<T>(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na chamada PUT para ${url}:`, error);
      throw error;
    }
  },

  /**
   * Faz uma chamada DELETE à API com autenticação
   * @param endpoint Endpoint da API (sem o prefixo /botId/{botId})
   * @returns Promise com a resposta da API
   */
  async delete<T>(endpoint: string): Promise<T> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/botId/${this.botId}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;

    try {
      const response = await axios.delete<T>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na chamada DELETE para ${url}:`, error);
      throw error;
    }
  },

  /**
   * Faz uma chamada PATCH à API com autenticação
   * @param endpoint Endpoint da API (sem o prefixo /botId/{botId})
   * @param data Dados a serem enviados no corpo da requisição
   * @returns Promise com a resposta da API
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    if (!this.botId) {
      throw new Error(
        "BotId não configurado. Use setBotId() antes de fazer chamadas à API."
      );
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/botId/${this.botId}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;

    try {
      const response = await axios.patch<T>(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na chamada PATCH para ${url}:`, error);
      throw error;
    }
  },
};

export default inbotApi;
