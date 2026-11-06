# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite resuelve estas variables en tiempo de build (no de ejecución).
# Railway solo inyecta variables como build args si están declaradas con ARG.
# Sin VITE_API_URL el frontend usaría rutas relativas y Nginx intentaría
# resolver "backend-api:3000" (DNS de Docker Compose), que no existe fuera
# del compose raíz.
ARG VITE_API_URL=""
ARG VITE_JOB_TIMEOUT_MS=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_JOB_TIMEOUT_MS=$VITE_JOB_TIMEOUT_MS

RUN npm run build

# ==========================================
# Etapa de producción con Nginx
# ==========================================
FROM nginx:alpine

# Copiar los archivos estáticos compilados de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]