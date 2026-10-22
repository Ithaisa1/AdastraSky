# Compilación
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_URL=http://localhost:5000
ARG VITE_CONTACT_EMAIL=
ENV VITE_API_URL=$VITE_API_URL VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL
RUN npm run build

# Servidor estático
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
