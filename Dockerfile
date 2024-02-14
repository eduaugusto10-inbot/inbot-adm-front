# Use uma imagem base do Node.js 18
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o package.json e o package-lock.json para instalar dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do aplicativo
COPY . .

# Construa o aplicativo ReactJS
RUN npm run build

# Defina a porta do contêiner para a porta 80
EXPOSE 80

# Comando para iniciar o servidor quando o contêiner for iniciado
CMD ["npm", "start"]
