# Gestor-Inteligente-de-Documentos-Frontend

## Ejecución standalone (sin el repositorio raíz)

Este repositorio es autónomo: incluye su `Dockerfile` y su
`docker-compose.yml`.

```bash
cp .env.example .env    # ajusta API_URL a la URL del backend
docker compose up --build
```

La aplicación queda en http://localhost:8080 y el backend se consume
directamente en `API_URL`.

> **Importante:** la configuración se resuelve al **arrancar el contenedor**
> (`docker-entrypoint.d/40-runtime-config.sh`), no al construir la imagen. La
> misma imagen puede promoverse de staging a producción cambiando variables:
>
> - `API_URL`: URL absoluta del backend para el navegador. Si se deja vacía, el
>   frontend usa rutas relativas y nginx hace proxy inverso.
> - `API_UPSTREAM`: URL interna que nginx usa como upstream cuando `API_URL`
>   está vacía. En Docker Compose es `http://backend-api:3000`; en Railway es
>   `http://backend-api.railway.internal:3000`.
> - `DNS_RESOLVER`: servidor DNS para resolver `API_UPSTREAM`. Se autodetecta
>   de `/etc/resolv.conf` (Docker: `127.0.0.11`, Railway: `fd12::10`).
> - `JOB_TIMEOUT_MS`: presupuesto de polling de jobs (12 min por defecto).
>
> `VITE_API_URL` y `VITE_JOB_TIMEOUT_MS` siguen funcionando como fallback de
> build time para desarrollo, pero el pipeline usa la configuración runtime.

En Railway, definir `API_UPSTREAM` (o `API_URL`) en las variables del servicio;
no hace falta reconstruir la imagen.

## Regla importante
NADIE debe hacer push directo a main o develop.

Todos deben trabajar en su rama correspondiente (feature/, fix/ o docs/) y posteriormente abrir un Pull Request (PR).

## Nombres de ramas
Todas las ramas deben seguir el siguiente formato:

feature/nombre-de-la-funcionalidad
fix/nombre-del-error
docs/nombre-del-documento

Regla de nombres
Si una rama no cumple con este formato, el Pull Request será rechazado y se deberá renombrar la rama antes de volver a solicitar la revisión.

## Nombres de commits
Todos los commits deben utilizar el siguiente formato:

tipo: descripción breve

## Pull Requests
Todo cambio destinado a develop debe realizarse mediante un Pull Request.

Antes de solicitar la revisión
Verificar que:

 El código funciona correctamente.
 La rama tiene un nombre válido.
 Los commits siguen el estándar establecido.
 Se ha completado la plantilla del Pull Request.
 Se han resuelto las conversaciones pendientes.
 No existen conflictos pendientes.

## Reglas principales
### No hacer Push directo
No está permitido realizar push directamente a:

main
develop

### Trabajar siempre en una rama
Cada integrante debe trabajar en una rama correspondiente:

feature/*
fix/*
docs/*

### Todo cambio debe pasar por Pull Request
Los cambios deben seguir siempre el flujo:

Rama de trabajo
      ↓
   Commit
      ↓
Pull Request
      ↓
   Revisión
      ↓
   develop
      ↓
Pull Request
      ↓
    main

### Importante
El incumplimiento de estas reglas puede ocasionar el rechazo del Pull Request hasta que se corrija la situación.

## Calidad, lint y hooks

| Comando | Qué hace |
|---|---|
| `npm run lint` | ESLint (flat config en `eslint.config.js`, reglas de React) |
| `npm run lint:fix` | ESLint con `--fix` |
| `npm run format` / `npm run format:check` | Prettier sobre `src/` |
| `npm run build` | Build de Vite (`dist/`) |

Los hooks de Git (Husky) se instalan solos al ejecutar `npm install` (script
`prepare`). En cada commit, `lint-staged` ejecuta `eslint --fix` y
`prettier --write` **solo** sobre los archivos preparados.

### Escaneo de secretos (Gitleaks)

- En CI se ejecuta siempre (`gitleaks/gitleaks-action`) sobre los commits del PR.
- En local es opcional: si tienes el binario `gitleaks` instalado, el hook
  `pre-commit` lo ejecuta automáticamente; si no, se omite y el CI lo cubre igual.
- Instalación (verifica con `gitleaks version`): binario oficial en
  <https://github.com/gitleaks/gitleaks/releases>; macOS `brew install gitleaks`;
  Windows `scoop install gitleaks`.
- Configuración: `.gitleaks.toml`.

### Integración continua (GitHub Actions)

`.github/workflows/ci.yml` se ejecuta en cada push a `develop`/`main` y en
cada Pull Request hacia esas ramas:

| Job | Comprueba |
|---|---|
| `Lint, formato y build` | `npm run lint`, `npm run format:check` y `npm run build` |
| `Prueba de humo Docker` | Construye la imagen y verifica `GET /healthz` |
| `Escaneo de secretos` | Gitleaks sobre el historial completo |

- El job `ci` instala dependencias **una sola vez** (antes eran 3 jobs
  encadenados que reinstalaban tres veces).
- La versión de Node la fija `.nvmrc` (**20**, la misma que el `Dockerfile`).
- Las ejecuciones antiguas de la misma rama se cancelan solas (`concurrency`).

> Nota: para que estos checks bloqueen el merge, márcalos como *required
> status checks* en la protección de rama usando los nombres exactos de los
> jobs (`Lint, formato y build`, `Prueba de humo Docker` y
> `Escaneo de secretos`).
