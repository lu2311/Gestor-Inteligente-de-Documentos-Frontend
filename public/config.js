// Configuración de runtime. El contenedor la sobrescribe al arrancar
// (docker-entrypoint.d/40-runtime-config.sh); en desarrollo queda vacía y la
// aplicación usa VITE_API_URL o el backend local.
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
