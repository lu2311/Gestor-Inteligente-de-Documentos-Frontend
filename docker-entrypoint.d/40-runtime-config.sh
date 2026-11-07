#!/bin/sh
# Genera configuración en tiempo de arranque (no de build).
#
# Variables:
#   API_URL         URL absoluta del backend para el navegador. Vacía = mismo
#                   origen (nginx hace proxy inverso).
#   API_UPSTREAM    URL interna del backend usada por nginx. Por defecto,
#                   http://backend-api:3000 (Docker Compose).
#   DNS_RESOLVER    Servidor DNS para resolver API_UPSTREAM. Si no se define,
#                   se toma el primer nameserver de /etc/resolv.conf.
#   JOB_TIMEOUT_MS  Presupuesto de polling de jobs en milisegundos.
#
# El script corre antes de que nginx arranque (imagen oficial de nginx ejecuta
# /docker-entrypoint.d/*.sh en orden). No usa envsubst para no romper variables
# de nginx como $request_uri; los placeholders son marcas propias.
set -eu

CONFIG_PATH="/usr/share/nginx/html/config.js"
TEMPLATE_PATH="/etc/nginx/default.conf.template"
NGINX_CONF_PATH="/etc/nginx/conf.d/default.conf"

api_url="${API_URL:-}"
api_upstream="${API_UPSTREAM:-http://backend-api:3000}"
job_timeout_ms="${JOB_TIMEOUT_MS:-0}"

if [ -z "${DNS_RESOLVER:-}" ]; then
  DNS_RESOLVER="$(awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf 2>/dev/null || true)"
fi
DNS_RESOLVER="${DNS_RESOLVER:-127.0.0.11}"

# Validaciones mínimas: estos valores se insertan en nginx y en JavaScript.
case "$api_upstream" in
  *[!A-Za-z0-9:/.@_~\[\]-]*)
    echo "[runtime-config] API_UPSTREAM contiene caracteres no permitidos: $api_upstream" >&2
    exit 1
    ;;
esac

case "$api_url" in
  *[!A-Za-z0-9:/.@_~-]*)
    echo "[runtime-config] API_URL contiene caracteres no permitidos: $api_url" >&2
    exit 1
    ;;
esac

case "$DNS_RESOLVER" in
  *[!A-Za-z0-9:.]*)
    echo "[runtime-config] DNS_RESOLVER contiene caracteres no permitidos: $DNS_RESOLVER" >&2
    exit 1
    ;;
esac

case "$job_timeout_ms" in
  '' | *[!0-9]*) job_timeout_ms=0 ;;
esac

# nginx exige corchetes para direcciones IPv6 en `resolver` (fd12::10).
case "$DNS_RESOLVER" in
  *:*) dns_directive="[$DNS_RESOLVER]" ;;
  *) dns_directive="$DNS_RESOLVER" ;;
esac

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

cat >"$CONFIG_PATH" <<EOF
// Generado en tiempo de arranque por docker-entrypoint.d/40-runtime-config.sh.
window.__APP_CONFIG__ = Object.freeze({
  apiUrl: "$(json_escape "$api_url")",
  jobTimeoutMs: ${job_timeout_ms},
});
EOF

echo "[runtime-config] API_URL='${api_url}' API_UPSTREAM='${api_upstream}' DNS_RESOLVER='${DNS_RESOLVER}'"

sed \
  -e "s|__API_UPSTREAM__|${api_upstream}|g" \
  -e "s|__DNS_RESOLVER__|${dns_directive}|g" \
  "$TEMPLATE_PATH" >"$NGINX_CONF_PATH"
