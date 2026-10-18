# Gestor-Inteligente-de-Documentos-Frontend

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

> Nota: si quieres que estos checks bloqueen el merge, márcalos como
> *required status checks* en la protección de la rama `develop`.
