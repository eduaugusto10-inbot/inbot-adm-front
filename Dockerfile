# Use node image as base
FROM node:18-alpine as builder

# Set the working directory in the container
WORKDIR /app
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the application
RUN npm run build

# Start a new stage from nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output from the previous stage to the nginx server
COPY --from=builder /app/build /usr/share/nginx/html

# Copy manifest.json to the nginx server
COPY build/manifest.json /usr/share/nginx/html/inbot-adm-front/v1/gateway/

# Expose port 80
EXPOSE 80

# Command to run the nginx server
CMD ["nginx", "-g", "daemon off;"]

