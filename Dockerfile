# Usa uma imagem Node.js como base
FROM node:alpine as build

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos do projeto para o contêiner
COPY . .

# Instala as dependências
RUN npm install

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Segunda fase - usa uma imagem nginx leve
FROM nginx:alpine

# Copia os arquivos de build do ReactJS para o diretório padrão do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o servidor Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
