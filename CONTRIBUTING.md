# Guía de contribución — VoteSecure

Este documento explica cómo, dónde y con qué convenciones se deben hacer cambios en este proyecto.

## 1. Estructura del repositorio


**Regla general**: si el cambio es de lógica de negocio, autenticación, base de datos o endpoints → va en `backend/`. Si es de interfaz, componentes visuales o experiencia de usuario → va en `frontend/`. Si afecta a ambos, se documentan por separado en el mismo commit o PR.

## 2. Antes de escribir código

1. Lee el [README principal](README.md) y, si el cambio toca datos, [`docs/BASE_DE_DATOS.md`](docs/BASE_DE_DATOS.md).
2. Si vas a modificar un modelo de Mongoose existente, revisa qué controladores y rutas lo usan antes de tocarlo (un cambio de esquema puede romper validaciones en varios controllers a la vez).
3. Si el cambio es de seguridad o autenticación, revisa `backend/middlewares/` y `backend/controllers/authController.js` primero — no dupliques lógica de verificación de token o de roles, ya existe en los middlewares.

## 3. Dónde hacer cada tipo de cambio

| Tipo de cambio | Dónde |
|---|---|
| Nuevo endpoint | Crear/editar en `backend/routes/`, lógica en `backend/controllers/` |
| Nueva validación de datos | `backend/middlewares/sanitize.js` o `express-validator` en la ruta |
| Nuevo modelo o campo de BD | `backend/models/`, y actualizar `docs/BASE_DE_DATOS.md` |
| Nueva página o vista | `frontend/src/pages/<rol>/` (admin, ciudadano, candidato, auth, perfil) |
| Componente reutilizable de UI | `frontend/src/components/common/` |
| Cambio de estilos globales | `frontend/tailwind.config.js` |
| Traducciones (ES/EN) | Archivos JSON de `i18next` (frontend) |

## 4. Convención de commits

Se usa un formato tipo [Conventional Commits](https://www.conventionalcommits.org/es/):


| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `security` | Corrección relacionada con seguridad (usar siempre este tipo, no `fix`, para que quede visible en el historial) |
| `docs` | Cambios solo de documentación |
| `chore` | Tareas de mantenimiento (dependencias, configuración, limpieza) |
| `refactor` | Cambio de código que no altera comportamiento |
| `test` | Agregar o corregir tests |

Ejemplos:

## 5. Variables de entorno

Nunca subir `.env` con valores reales. Si agregas una variable de entorno nueva:
1. Agrégala a `backend/.env.example` o `frontend/.env.example` (con un valor de ejemplo, nunca el real).
2. Documéntala en `backend/README.md` (tabla de variables de entorno).

## 6. Antes de hacer commit — checklist rápido

- [ ] ¿Este cambio incluye datos reales, backups, o archivos `.env`? → No lo subas.
- [ ] ¿Agregaste `console.log` de depuración? → Quítalos antes del commit, o dedícalos a una rama de debug.
- [ ] ¿Tocaste un modelo de Mongoose? → Actualiza `docs/BASE_DE_DATOS.md`.
- [ ] ¿El cambio es visible para el usuario final? → Considera si el manual de usuario (`docs/MANUAL_USUARIO.md`) necesita actualizarse.
- [ ] ¿Es un cambio notable? → Agrega una línea en `CHANGELOG.md` bajo `[Sin publicar]`.

## 7. Testing

El backend usa Vitest:
```bash
cd backend
npm test           # correr toda la suite
npm run test:watch  # modo watch mientras desarrollas
```
Antes de un cambio grande en `controllers/` o `models/`, revisa si ya existe un test relacionado en `backend/tests/` y actualízalo si aplica.

## 8. Flujo de trabajo recomendado (proyecto individual)

Como este es un proyecto de una sola desarrolladora, no se exige pull request obligatorio, pero sí se recomienda:
1. Trabajar cambios grandes o riesgosos en una rama aparte (`git checkout -b nombre-del-cambio`).
2. Probar localmente antes de mezclar a `main`.
3. Hacer `merge` a `main` solo cuando el cambio esté probado.
4. Reservar commits directos a `main` para cambios pequeños y de bajo riesgo (typos, ajustes menores de estilos, documentación).