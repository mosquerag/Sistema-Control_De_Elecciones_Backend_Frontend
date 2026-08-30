# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Sin publicar]

## [3.1.0] - 2026-08-29

### Seguridad
- **Crítico**: purgados datos reales de 117 usuarios que estaban commiteados públicamente en `backend/backups/`. Historial de Git reescrito.
- **Crítico**: purgado `certificado.html` (documento académico personal) que estaba expuesto en la raíz del repo. Historial de Git reescrito nuevamente.
- Activado rate limiting en `/api/votos` (máximo 5 intentos por hora).
- Agregadas reglas en `.gitignore` para evitar que vuelvan a subirse backups o archivos personales.

### Eliminado
- `backend/indexcopy.js` y `backend/controllers/eleccionesController copy.js` — versiones antiguas sin uso.
- Componentes duplicados en el frontend sin usar: `utils/ProtectedRoute.jsx`, `components/common/ProtectedRoute.jsx`, `components/PublicRoute.jsx`, `components/ThemeContext.jsx`, `context/ThemeToggle.jsx`.

### Corregido
- Scripts rotos en `backend/package.json` (`seed` y `clean` apuntaban a archivos inexistentes).

### Agregado
- Documentación completa: `CONTRIBUTING.md`, `docs/DIAGRAMAS.md`, `docs/MANUAL_USUARIO.md`, `docs/BASE_DE_DATOS.md`, README de backend y frontend.
- Manual de uso integrado en la aplicación (sección "Ayuda" por rol).

## [3.0.0] - fecha desconocida (completar si se recuerda)

### Cambios conocidos previos a este changelog
- Reemplazo del login débil de ciudadano/candidato por autenticación con contraseña.
- Migración de tokens de `localStorage` a cookies `httpOnly`.
- Arquitectura de voto anónimo mediante modelo dual (`Voto` / `VotoAnonimo`).
- Autenticación JWT solo por cookies, con RBAC.

> Nota: las versiones anteriores a la 3.1.0 no tienen fecha exacta porque el historial de commits fue reescrito por motivos de seguridad.