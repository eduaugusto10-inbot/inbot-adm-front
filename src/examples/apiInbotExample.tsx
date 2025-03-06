import React, { useEffect, useState } from 'react';
import inbotApi from '../utils/apiInbot';

// Exemplo de interface para os dados retornados pela API
interface BotInfo {
  id: number;
  name: string;
  status: string;
  // Outros campos conforme necessário
}

const ApiInbotExample: React.FC = () => {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Configurar o botId
    inbotApi.setBotId(403);
    
    // Função para carregar dados do bot
    const fetchBotInfo = async () => {
      try {
        setLoading(true);
        
        // Exemplo de chamada GET
        const botData = await inbotApi.get<BotInfo>('/info');
        setBotInfo(botData);
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados do bot. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBotInfo();
  }, []);
  
  // Renderização do componente
  return (
    <div className="api-example">
      <h1>Exemplo de Uso da API Inbot</h1>
      
      {loading && <div className="loading">Carregando...</div>}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}
      
      {botInfo && (
        <div className="bot-info">
          <h2>Informações do Bot</h2>
          <p><strong>ID:</strong> {botInfo.id}</p>
          <p><strong>Nome:</strong> {botInfo.name}</p>
          <p><strong>Status:</strong> {botInfo.status}</p>
        </div>
      )}
    </div>
  );
};

export default ApiInbotExample; 