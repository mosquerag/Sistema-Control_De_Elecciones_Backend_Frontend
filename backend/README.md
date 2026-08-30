# VoteSecure — Backend

API REST del sistema de votaciones electrónicas. Node.js + Express + MongoDB (Mongoose).

Para la descripción general del proyecto, instalación conjunta y tecnologías, ver el [README principal](../README.md). Para el detalle de modelos y colecciones, ver [docs/BASE_DE_DATOS.md](../docs/BASE_DE_DATOS.md).

## Ejecutar el backend de forma independiente

```bash
cd backend
npm install
cp .env.example .env   # completar con tus valores reales
npm run dev              # desarrollo (nodemon)
npm start                 # producción
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `MONGO` | Cadena de conexión a MongoDB (Atlas o local) |
| `PORT` | Puerto del servidor |
| `NODE_ENV` | `development` o `production` |
| `JWT_SECRET` | Secreto para firmar access tokens |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens (debe ser distinto al anterior) |
| `SESSION_SECRET` | Secreto de sesión (usado por Passport/OAuth) |
| `FRONTEND_URL` | URL del frontend, para CORS y redirecciones OAuth |
| `ALLOWED_ORIGINS` | Orígenes permitidos por CORS |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Credenciales de Google OAuth |
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | Cuenta usada por Nodemailer para envío de correos |
| `DEBUG_MODE` / `MONGOOSE_DEBUG` | Flags opcionales de depuración |

## Endpoints principales

Todos bajo el prefijo `/api`. Los que requieren autenticación usan cookie `access_token`.

| Prefijo | Recurso |
|---|---|
| `/api/auth` | Registro, login, logout, refresh token, Google OAuth, recuperación de contraseña |
| `/api/votos` | Emisión y consulta de votos |
| `/api/approval` | Aprobación/rechazo de ciudadanos y candidatos por admin |
| `/api/notificaciones` | Notificaciones del panel de administración |
| `/api/profile` | Perfil del usuario autenticado |
| `/api/candidatos` | Gestión de candidatos |
| `/api/ciudadanos` | Gestión de ciudadanos |
| `/api/elecciones` | Gestión de elecciones |
| `/api/estadisticas` | Estadísticas y resultados |
| `/api/paises` | Catálogo de países |
| `/api/tipos-elecciones` | Catálogo de tipos de elección |
| `/api/usuarios` | Gestión general de usuarios (admin) |
| `/api/public` | Endpoints públicos (sin autenticación) |
| `/api/encuestas` | Encuestas de satisfacción públicas |

## Scripts disponibles

| Script | Uso |
|---|---|
| `npm start` | Arranca el servidor (producción) |
| `npm run dev` | Arranca con nodemon (desarrollo, recarga automática) |
| `npm test` | Corre la suite de tests (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run seed` | Puebla la base de datos con datos de demo |
| `npm run backup` | Genera un backup local de las colecciones (⚠️ nunca subir el resultado a Git) |

## Estructura de carpetas

```
backend/
├── config/         # Configuración (Google OAuth)
├── controllers/     # Lógica de negocio por recurso
├── middlewares/      # Auth, rate limiting, sanitización, validación
├── models/            # Esquemas de Mongoose
├── routes/            # Definición de endpoints
├── scripts/           # Scripts utilitarios (seed, backup)
├── tests/              # Tests con Vitest
├── utils/              # Conexión a BD, envío de correos
└── index.js            # Punto de entrada
```