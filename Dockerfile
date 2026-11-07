# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# La configuración del API se resuelve al arrancar el contenedor (ver
# docker-entrypoint.d/40-runtime-config.sh), no al construir la imagen. Así la
# misma imagen inmutable sirve para staging y producción sin rebuild.
RUN npm run build

# ==========================================
# Etapa de producción con Nginx
# ==========================================
FROM nginx:alpine

# Copiar los archivos estáticos compilados de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Plantilla de Nginx + script de configuración en runtime.
# La plantilla vive fuera de /etc/nginx/templates para que el envsubst de la
# imagen oficial no sustituya variables propias de nginx ($request_uri, etc.).
COPY nginx.conf.template /etc/nginx/default.conf.template
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

# Defaults para Docker Compose. En Railway se sobrescribe API_UPSTREAM con el
# nombre privado del servicio (por ejemplo, http://backend-api.railway.internal:3000).
ENV API_UPSTREAM=http://backend-api:3000
ENV JOB_TIMEOUT_MS=720000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]