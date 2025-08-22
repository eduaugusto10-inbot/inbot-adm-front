FROM node:alpine as build

WORKDIR /app

COPY . .

RUN npm install

ARG REACT_APP_BASE_URL
ARG REACT_APP_BASE_URL_V2
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL
ENV REACT_APP_BASE_URL_V2=$REACT_APP_BASE_URL_V2

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
