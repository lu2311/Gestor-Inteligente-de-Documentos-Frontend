# ---------- Etapa 1: build ----------
# Compila la app de Vite/React a archivos estáticos.
FROM node:20-alpine AS build

WORKDIR /app

# Se copian solo los manifiestos primero para aprovechar la caché de capas de
# Docker: si package.json no cambia, no se reinstalan dependencias en cada build.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: runtime ----------
# Imagen final: solo Nginx + los archivos estáticos ya compilados (sin Node,
# sin node_modules, sin código fuente).
FROM nginx:1.27-alpine AS runtime

# Configuración de Nginx para servir una SPA (fallback a index.html) y cachear
# los assets con hash generados por Vite.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx-alpine ya trae un usuario "nginx" sin privilegios; ajustamos permisos
# para poder correr el contenedor sin root.
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
