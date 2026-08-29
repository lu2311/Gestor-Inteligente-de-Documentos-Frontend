# Gestor-Inteligente-de-Documentos-Frontend
Reglas de trabajo con Git
Estrategia de ramas

El proyecto utiliza la siguiente estrategia:

Rama	Propósito	Quién crea	Quién fusiona
main	Código estable para la sustentación	Solo Alexander	Alexander, mediante PR desde develop
develop	Integración de todo el código	Solo Alexander	Alexander, mediante PR desde feature/*
feature/backend-basico	Backend de Juan	Juan	Juan crea PR a develop; Alexander fusiona
feature/frontend-basico	Frontend de Luis	Luis	Luis crea PR a develop; Alexander fusiona
feature/automatizaciones	RPA/BD de Edu	Edu	Edu crea PR a develop; Alexander fusiona
Regla importante

NADIE hace push directo a main o develop.

Todos deben trabajar en su rama feature/, fix/ o docs/ correspondiente y posteriormente abrir un Pull Request.

Nombres de ramas

Todas las ramas deben seguir este formato:

feature/backend-basico
feature/frontend-dashboard
feature/rpa-correos
fix/error-cors
docs/readme

Reglas
feature/ → nuevas funcionalidades.
fix/ → corrección de errores.
docs/ → cambios únicamente en documentación.

Si una rama no cumple con este formato, el Pull Request será rechazado y se deberá renombrar la rama antes de volver a solicitar la revisión.

Nombres de commits

Todos los commits deben utilizar el siguiente formato:

feat: añadir endpoint /upload
fix: corregir error de CORS
docs: actualizar README
chore: actualizar dependencias

Formato
tipo: descripción breve


Tipos principales:

feat: → nueva funcionalidad.
fix: → corrección de errores.
docs: → documentación.
chore: → tareas de mantenimiento/configuración.
Regla importante

Si no usan este estándar de commits, les rechazo el PR.

Pull Requests

Todo cambio destinado a develop debe realizarse mediante Pull Request.

Antes de solicitar la revisión:

 El código funciona correctamente.
 La rama tiene un nombre válido.
 Los commits siguen el estándar establecido.
 Se ha completado la plantilla del Pull Request.
 Se han resuelto las conversaciones pendientes.
Flujo obligatorio
feature/* / fix/* / docs/*
          │
          ▼
       Pull Request
          │
          ▼
       develop
          │
          ▼
       Pull Request
          │
          ▼
         main


No se permite hacer push directo a main ni develop.
