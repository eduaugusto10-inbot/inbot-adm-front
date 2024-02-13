FROM node:18-alpine
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

WORKDIR /code
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY package*.json /code/

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production
RUN npm ci
COPY . /code

# Build application ReactJS
RUN npm run build

# Bundle app source

EXPOSE 19000
CMD ["npm", "start"]
