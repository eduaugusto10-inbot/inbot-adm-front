# Utilitário de API Inbot

Utilitário simples para fazer chamadas à API da Inbot com autenticação automática.

## Como usar

### Importação

```typescript
import inbotApi from "../utils/apiInbot";
```

### Configuração do botId

Antes de fazer qualquer chamada à API, é necessário configurar o botId:

```typescript
// Configurar o botId
inbotApi.setBotId(403); // Substitua pelo botId desejado
```

### Fazendo chamadas à API

O utilitário gerencia automaticamente a obtenção do access-key e a geração do token JWT. Você só precisa chamar os métodos HTTP desejados:

#### GET

```typescript
// Exemplo de chamada GET
try {
  const data = await inbotApi.get("/endpoint");
  console.log("Dados recebidos:", data);
} catch (error) {
  console.error("Erro na chamada:", error);
}
```

#### POST

```typescript
// Exemplo de chamada POST
try {
  const response = await inbotApi.post("/endpoint", {
    chave1: "valor1",
    chave2: "valor2",
  });
  console.log("Resposta:", response);
} catch (error) {
  console.error("Erro na chamada:", error);
}
```

#### PUT

```typescript
// Exemplo de chamada PUT
try {
  const response = await inbotApi.put("/endpoint", {
    id: 123,
    nome: "Novo nome",
  });
  console.log("Resposta:", response);
} catch (error) {
  console.error("Erro na chamada:", error);
}
```

#### PATCH

```typescript
// Exemplo de chamada PATCH
try {
  const response = await inbotApi.patch("/endpoint", {
    status: "ativo",
    // Atualização parcial, apenas os campos fornecidos serão alterados
  });
  console.log("Resposta:", response);
} catch (error) {
  console.error("Erro na chamada:", error);
}
```

#### DELETE

```typescript
// Exemplo de chamada DELETE
try {
  const response = await inbotApi.delete("/endpoint");
  console.log("Resposta:", response);
} catch (error) {
  console.error("Erro na chamada:", error);
}
```

### Chamando endpoints com caminhos adicionais

Você pode chamar endpoints com caminhos adicionais simplesmente incluindo-os no parâmetro:

```typescript
// Para acessar: https://api.inbot.com.br/v2/api/v2/botId/403/users/123/settings
const settings = await inbotApi.get("/users/123/settings");

// Para atualizar parcialmente: https://api.inbot.com.br/v2/api/v2/botId/403/users/123/status
await inbotApi.patch("/users/123/status", { active: true });

// Para atualizar completamente: https://api.inbot.com.br/v2/api/v2/botId/403/users/123/profile
await inbotApi.put("/users/123/profile", { name: "Novo Nome" });

// Para excluir: https://api.inbot.com.br/v2/api/v2/botId/403/messages/456
await inbotApi.delete("/messages/456");
```

## Funcionalidades

- Gerenciamento automático de autenticação (access-key e token)
- Renovação automática de tokens expirados
- Interface simples para chamadas GET, POST, PUT, PATCH e DELETE
- Suporte a endpoints com múltiplos caminhos
