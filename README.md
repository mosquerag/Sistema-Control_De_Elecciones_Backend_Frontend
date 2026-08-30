# 🗳️ VoteSecure — Sistema de Votaciones Electrónicas

> Plataforma web para gestión de elecciones democráticas seguras, transparentes y en tiempo real.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Roles y Permisos](#roles-y-permisos)
- [API — Endpoints](#api--endpoints)
- [Seguridad Implementada](#seguridad-implementada)
- [Dependencias](#dependencias)
- [Preparación para Producción](#preparación-para-producción)
- [Problemas Conocidos y Soluciones](#problemas-conocidos-y-soluciones)

---

## 📖 Descripción del Proyecto

VoteSecure es una aplicación web full-stack que permite la gestión completa de procesos electorales electrónicos. El sistema soporta tres tipos de usuarios (administrador, ciudadano y candidato), gestión de elecciones, registro y aprobación de participantes, votación en tiempo real y visualización de estadísticas.

### Funcionalidades principales

- Registro y autenticación de usuarios con tres roles distintos
- Sistema de aprobación manual de ciudadanos y candidatos por administrador
- Creación y gestión de tipos de elección y elecciones
- Votación con validación de voto único por ciudadano por elección
- Resultados y estadísticas en tiempo real
- Notificaciones en panel de administración
- Autenticación con Google OAuth 2.0 (configurable)
- Modo oscuro / claro con persistencia
- Encuestas de satisfacción públicas
- Diseño completamente responsivo

---

## 🛠️ Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | ≥ 18.0.0 | Entorno de ejecución |
| Express.js | ^4.19.2 | Framework web |
| MongoDB | Atlas / Local | Base de datos |
| Mongoose | ^8.3.2 | ODM para MongoDB |
| JSON Web Token | ^9.0.2 | Autenticación con tokens |
| bcryptjs | ^2.4.3 | Hash de contraseñas |
| Passport.js | ^0.7.0 | Estrategias de autenticación |
| passport-google-oauth20 | ^2.0.0 | Login con Google |
| Helmet | ^7.1.0 | Headers de seguridad HTTP |
| CORS | ^2.8.5 | Control de orígenes cruzados |
| express-rate-limit | ^7.3.1 | Límite de peticiones por IP |
| express-mongo-sanitize | ^2.2.0 | Prevención de NoSQL injection |
| xss | ^1.0.15 | Prevención de Cross-Site Scripting |
| dotenv | ^16.4.5 | Variables de entorno |
| nodemailer | ^6.9.13 | Envío de correos |
| cookie-parser | ^1.4.7 | Parseo de cookies |
| express-session | ^1.18.0 | Sesiones para OAuth |

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | ^19.2.0 | Librería de UI |
| Vite | ^7.2.4 | Build tool y dev server |
| React Router DOM | ^7.11.0 | Enrutamiento del lado cliente |
| Axios | ^1.13.2 | Cliente HTTP |
| Tailwind CSS | ^3.4.1 | Framework de estilos utilitarios |
| lucide-react | ^0.562.0 | Librería de iconos (SVG) |
| SweetAlert2 | ^11.26.17 | Alertas y modales elegantes |
| react-toastify | ^11.0.5 | Notificaciones tipo toast |
| date-fns | ^4.1.0 | Utilidades de fechas |
| js-cookie | ^3.0.5 | Manejo de cookies en frontend |

---

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── index.js                    # Servidor principal (Express)
│   ├── package.json
│   ├── .env                        # Variables de entorno (NO subir a git)
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── .gitignore
│   │
│   ├── config/
│   │   └── googleOAuth.js          # Configuración Passport Google OAuth
│   │
│   ├── controllers/
│   │   ├── authController.js       # Registro, login, tokens, OAuth
│   │   ├── approvalController.js   # Aprobación/rechazo de usuarios
│   │   ├── candidatosController.js # CRUD de candidatos
│   │   ├── eleccionesController.js # CRUD de elecciones
│   │   ├── estadisticasController.js # Resultados y análisis
│   │   ├── paisController.js       # CRUD de países
│   │   ├── profileController.js    # Perfil de usuario
│   │   ├── tipoEleccionController.js # CRUD de tipos de elección
│   │   ├── usuariosController.js   # Gestión admin de usuarios
│   │   └── votosController.js      # Sistema de votación
│   │
│   ├── middlewares/
│   │   ├── verifyToken.js          # Autenticación JWT
│   │   ├── roleMiddleware.js       # Verificación de roles
│   │   ├── rateLimiter.js          # Rate limiting por endpoint
│   │   ├── sanitize.js             # Sanitización de inputs (XSS + NoSQL)
│   │   ├── checkDuplicateVoto.js   # Prevención de voto duplicado
│   │   ├── normalizarFechas.js     # Normalización de fechas a UTC
│   │   └── validateAge.js          # Validación de edad mínima (18+)
│   │
│   ├── models/
│   │   ├── Usuario.js              # Modelo de usuarios (admin/ciudadano/candidato)
│   │   ├── Eleccion.js             # Modelo de elecciones
│   │   ├── Voto.js                 # Modelo de votos
│   │   ├── TipoEleccion.js         # Modelo de tipos de elección
│   │   ├── Notificacion.js         # Modelo de notificaciones
│   │   ├── Encuesta.js             # Modelo de encuestas
│   │   ├── Log.js                  # Modelo de logs de auditoría
│   │   └── Pais.js                 # Modelo de países
│   │
│   ├── routes/
│   │   ├── auth.js                 # Rutas de autenticación
│   │   ├── approval.js             # Rutas de aprobación
│   │   ├── candidatos.js           # Rutas de candidatos
│   │   ├── ciudadanos.js           # Rutas de ciudadanos
│   │   ├── elecciones.js           # Rutas de elecciones
│   │   ├── encuestas.js            # Rutas de encuestas
│   │   ├── estadisticas.js         # Rutas de estadísticas
│   │   ├── notificaciones.js       # Rutas de notificaciones
│   │   ├── paises.js               # Rutas de países
│   │   ├── profile.js              # Rutas de perfil
│   │   ├── public.js               # Rutas públicas (sin auth)
│   │   ├── tiposElecciones.js      # Rutas de tipos de elección
│   │   ├── usuarios.js             # Rutas de usuarios (admin)
│   │   └── votos.js                # Rutas de votación
│   │
│   └── utils/
│       └── db.js                   # Conexión a MongoDB con Mongoose
│
└── frontend/
    ├── index.html                  # Punto de entrada HTML
    ├── package.json
    ├── vite.config.js              # Configuración de Vite
    ├── tailwind.config.js          # Configuración de Tailwind CSS
    ├── postcss.config.js
    ├── jsconfig.json               # Alias de paths (@/ → src/)
    ├── .env                        # Variables de entorno frontend
    ├── .env.example
    │
    └── src/
        ├── main.jsx                # Punto de entrada React
        ├── App.jsx                 # Componente raíz con router
        ├── index.css               # Estilos globales + variables CSS
        │
        ├── api/                    # Servicios de comunicación con backend
        │   ├── axios.js            # Instancia Axios con interceptores
        │   ├── auth.js             # Llamadas de autenticación
        │   ├── candidatos.js
        │   ├── ciudadanos.js
        │   ├── elecciones.js
        │   ├── encuestas.js
        │   ├── estadisticas.js
        │   ├── notificaciones.js
        │   ├── paises.js
        │   ├── perfil.js
        │   ├── public.js
        │   ├── tiposElecciones.js
        │   ├── usuarios.js
        │   └── votos.js
        │
        ├── context/
        │   ├── AuthContext.jsx     # Contexto global de autenticación
        │   └── ThemeContext.jsx    # Contexto global de tema (dark/light)
        │
        ├── hooks/
        │   ├── useAuth.js          # Hook para acceder al AuthContext
        │   ├── useApi.js           # Hook genérico para llamadas API
        │   └── useMobile.js        # Hook para detectar dispositivo móvil
        │
        ├── router/
        │   ├── AppRouter.jsx       # Definición de todas las rutas
        │   ├── ProtectedRoute.jsx  # Protección de rutas privadas
        │   └── PublicRoute.jsx     # Redirección si ya está autenticado
        │
        ├── layouts/
        │   ├── AdminLayout.jsx     # Layout del panel de administración
        │   ├── CiudadanoLayout.jsx # Layout del panel de ciudadano
        │   └── CandidatoLayout.jsx # Layout del panel de candidato
        │
        ├── pages/
        │   ├── home/
        │   │   └── index.jsx       # Página principal pública
        │   │
        │   ├── auth/
        │   │   ├── InicioSesion.jsx      # Selección de tipo de usuario
        │   │   ├── RegisterSesion.jsx    # Selección para registro
        │   │   ├── LoginForm.jsx         # Formulario de login reutilizable
        │   │   ├── LoginAdmin.jsx
        │   │   ├── LoginCiudadano.jsx
        │   │   ├── LoginCandidato.jsx
        │   │   ├── RegisterForm.jsx      # Formulario de registro reutilizable
        │   │   ├── RegisterAdmin.jsx
        │   │   ├── RegisterCiudadano.jsx
        │   │   ├── RegisterCandidato.jsx
        │   │   ├── RegisterAdministrador.jsx
        │   │   └── GoogleCallback.jsx    # Procesamiento callback OAuth
        │   │
        │   ├── admin/
        │   │   ├── DashboardAdmin.jsx
        │   │   ├── DashboardStats.jsx
        │   │   ├── GestionElecciones.jsx
        │   │   ├── EleccionForm.jsx
        │   │   ├── EleccionList.jsx
        │   │   ├── EleccionListTotal.jsx
        │   │   ├── GestionTiposEleccion.jsx
        │   │   ├── GestionCandidatos.jsx
        │   │   ├── CandidatoForm.jsx
        │   │   ├── CandidatoList.jsx
        │   │   ├── GestionCiudadanos.jsx
        │   │   ├── CiudadanoForm.jsx
        │   │   ├── CiudadanoList.jsx
        │   │   ├── GestionUsuarios.jsx
        │   │   ├── DetallesUsuarios.jsx
        │   │   └── EstadisticasAdmin.jsx
        │   │
        │   ├── ciudadano/
        │   │   ├── DashboardCiudadano.jsx
        │   │   ├── EleccionesActivas.jsx
        │   │   ├── VerCandidatos.jsx
        │   │   ├── Votar.jsx
        │   │   ├── HistorialVotos.jsx
        │   │   ├── ResultadosPublicos.jsx
        │   │   └── ListaResultados.jsx
        │   │
        │   └── candidato/
        │       ├── DashboardCandidato.jsx
        │       └── MisResultados.jsx
        |    |── perfil/
        │
        ├── components/
        │   ├── common/             # Componentes reutilizables
        │   │   ├── ActionCard.jsx
        │   │   ├── Avatar.jsx
        │   │   ├── BackButton.jsx
        │   │   ├── Button.jsx
        │   │   ├── Card.jsx
        │   │   ├── EmptyState.jsx
        │   │   ├── FilterBar.jsx
        │   │   ├── Input.jsx
        │   │   ├── Label.jsx
        │   │   ├── Loader.jsx
        │   │   ├── Modal.jsx
        │   │   ├── NotificationPanel.jsx
        │   │   ├── PageHeader.jsx
        │   │   ├── PageLayout.jsx
        │   │   ├── ProgressBar.jsx
        │   │   ├── Select.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── StatusBadge.jsx
        │   │   ├── Table.jsx
        │   │   ├── Textarea.jsx
        │   │   ├── ThemeToggle.jsx
        │   │   ├── Title.jsx
        │   │   ├── TopBar.jsx
        │   │   └── WelcomeBanner.jsx
        │   │
        │   ├── auth/
        │   │   └── GoogleLoginButton.jsx
        │   │
        │   ├── home/               # Secciones de la página principal
        │   │   ├── Actividad.jsx
        │   │   ├── Caracteristicas.jsx
        │   │   ├── ControlVotaciones.jsx
        │   │   ├── Encuesta.jsx
        │   │   └── Propaganda.jsx
        │   │
        │   ├── candidato/
        │   │   ├── CandidatoCard.jsx
        │   │   ├── ConoceCandidatos.jsx
        │   │   └── ResultadosCandidato.jsx
        │   │
        │   ├── ciudadano/
        │   │   ├── MisVotos.jsx
        │   │   └── VotarModal.jsx
        │   │
        │   ├── elecciones/
        │   │   └── EleccionCard.jsx
        │   │
        │   └── perfil/
        │       └── ConfiguracionPerfil.jsx
        │
        ├── config/
        │   └── googleOAuth.js      # Config Google OAuth frontend
        │
        └── utils/
            ├── alertas.js          # Sistema centralizado de alertas
            ├── constants.js        # Constantes globales (ROLES, ROUTES)
            ├── formatDate.js       # Utilidades de formato de fechas
            ├── loginConfig.js      # Configuración de formularios de login
            ├── registerConfig.js   # Configuración de formularios de registro
            ├── userTypes.js        # Tipos de usuario para página home
            └── validation.js       # Funciones de validación de formularios
```

---

## ⚙️ Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (Atlas o local)
- Cuenta de Google Cloud (solo si se usa Google OAuth)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/votaciones-electronicas.git
cd votaciones-electronicas
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno del Backend

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 4. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 5. Configurar variables de entorno del Frontend

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 6. Iniciar en modo desarrollo

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

El backend corre en `http://localhost:4000`
El frontend corre en `http://localhost:5173`

---

## 🔐 Variables de Entorno

### Backend — `.env`

```env
# ── Base de datos ─────────────────────────────────────────────────────
MONGO=mongodb+srv://usuario:password@cluster.mongodb.net/votaciones

# ── JWT ───────────────────────────────────────────────────────────────
# IMPORTANTE: Usar valores aleatorios largos en producción (mínimo 32 chars)
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_muy_largo_y_seguro_aqui

# ── Sesión ────────────────────────────────────────────────────────────
SESSION_SECRET=tu_session_secret_aqui

# ── URLs ──────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
# En producción: FRONTEND_URL=https://tu-dominio.com
# Separar múltiples orígenes con coma:
ALLOWED_ORIGINS=http://localhost:5173,https://tu-dominio.com

# ── Entorno ───────────────────────────────────────────────────────────
NODE_ENV=development
PORT=4000

# ── Google OAuth (opcional) ───────────────────────────────────────────
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# ── Email (opcional) ──────────────────────────────────────────────────
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail

# ── Depuración (solo desarrollo) ─────────────────────────────────────
DEBUG_MODE=false
MONGOOSE_DEBUG=false
```

### Frontend — `.env`

```env
# URL del backend — NUNCA hardcodear la URL en el código
VITE_API_URL=http://localhost:4000

# Google OAuth Client ID (solo si se usa Google OAuth)
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

> ⚠️ **IMPORTANTE**: Nunca subas archivos `.env` a Git. Están incluidos en `.gitignore`.

---

## 📜 Scripts Disponibles

### Backend

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo (con nodemon)
npm run seed       # Poblar la base de datos con datos iniciales
npm run clean      # Limpiar datos de prueba
```

### Frontend

```bash
npm run dev        # Servidor de desarrollo (Vite)
npm run build      # Compilar para producción
npm run preview    # Previsualizar build de producción
npm run lint       # Verificar código con ESLint
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                   React + Vite + Tailwind                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Admin   │  │Ciudadano │  │Candidato │  │  Público  │  │
│  │  Panel   │  │  Panel   │  │  Panel   │  │   Home    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                        │                                     │
│              API Layer (Axios + Interceptores)               │
└─────────────────────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                    Express.js API REST                       │
│                                                             │
│  Rate Limiter → Sanitize → Auth Middleware → Controllers    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  /auth   │  │ /votos   │  │/approval │  │/estadíst. │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                        │                                     │
│                   Mongoose ODM                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        MONGODB                               │
│                                                             │
│  usuarios  elecciones  votos  notificaciones  logs          │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Roles y Permisos

### 👑 Administrador (`admin`)

- Crear, editar y eliminar tipos de elección
- Crear, editar y eliminar elecciones
- Registrar y gestionar candidatos
- Registrar y gestionar ciudadanos
- Aprobar o rechazar solicitudes de registro
- Bloquear y desbloquear usuarios
- Ver todas las estadísticas y resultados
- Crear otros administradores
- Gestionar notificaciones del sistema

### 🗳️ Ciudadano (`ciudadano`)

- Ver elecciones activas disponibles
- Emitir un voto por elección (único e irrevocable)
- Ver historial de sus votos emitidos
- Ver resultados públicos de elecciones
- Actualizar su perfil personal

### 🎯 Candidato (`candidato`)

- Ver sus resultados en tiempo real
- Ver su posición en el ranking de candidatos
- Actualizar su perfil y propuestas

### 🌍 Público (sin autenticación)

- Ver página principal e información del sistema
- Ver candidatos registrados
- Participar en encuestas de satisfacción
- Ver estadísticas generales del sistema

---

## 📡 API — Endpoints

### Autenticación — `/api/auth`

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/register/admin` | Público | Registro de administrador |
| POST | `/register/ciudadano` | Público | Registro de ciudadano |
| POST | `/register/candidato` | Público | Registro de candidato |
| POST | `/admin/register/admin` | Admin | Crear admin (datos mínimos) |
| POST | `/admin/register/ciudadano` | Admin | Crear ciudadano |
| POST | `/admin/register/candidato` | Admin | Crear candidato |
| POST | `/login/admin` | Público | Login de administrador |
| POST | `/login/ciudadano` | Público | Login de ciudadano |
| POST | `/login/candidato` | Público | Login de candidato |
| GET | `/google` | Público | Iniciar Google OAuth |
| GET | `/google/callback` | OAuth | Callback de Google |
| POST | `/logout` | Autenticado | Cerrar sesión |
| GET | `/verify-token` | Autenticado | Verificar token activo |
| POST | `/refresh-token` | Autenticado | Renovar access token |
| PUT | `/change-password` | Autenticado | Cambiar contraseña |

### Elecciones — `/api/elecciones`

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/` | Público | Todas las elecciones |
| GET | `/activas` | Público | Elecciones en curso |
| GET | `/:id` | Público | Elección por ID |
| POST | `/` | Admin | Crear elección |
| PUT | `/:id` | Admin | Actualizar elección |
| PATCH | `/:id/desactivar` | Admin | Desactivar elección |
| DELETE | `/:id` | Admin | Eliminar elección |

### Votos — `/api/votos`

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/` | Ciudadano | Emitir voto |
| GET | `/check/:idEleccion` | Ciudadano | Verificar si ya votó |
| GET | `/mis-votos` | Ciudadano | Historial de votos |
| GET | `/` | Admin | Todos los votos |
| GET | `/eleccion/:id` | Admin | Votos por elección |

### Estadísticas — `/api/estadisticas`

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/eleccion/:id` | Autenticado | Resultados de una elección |
| GET | `/candidato` | Candidato | Mis resultados |
| GET | `/evolucion/:idCandidato` | Autenticado | Evolución de votos por hora |

### Candidatos — `/api/candidatos`

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/` | Público | Todos los candidatos activos |
| GET | `/eleccion/:id` | Público | Candidatos por elección |
| GET | `/:id` | Público | Candidato por ID |
| PUT | `/:id` | Admin | Actualizar candidato |
| PATCH | `/:id/desactivar` | Admin | Desactivar candidato |
| DELETE | `/:id` | Admin | Eliminar candidato |

---

## 🔒 Seguridad Implementada

### Backend

#### Rate Limiting (Límite de peticiones)
Previene abusos y ataques de fuerza bruta:

| Endpoint | Límite | Ventana de tiempo |
|----------|--------|-------------------|
| Login | 10 intentos | 15 minutos |
| Registro | 5 registros | 1 hora |
| Votación | 5 peticiones | 1 hora |
| API general | 200 peticiones | 15 minutos |
| Rutas públicas | 100 peticiones | 10 minutos |

#### Sanitización de Inputs
- **express-mongo-sanitize**: Elimina operadores de MongoDB (`$`, `.`) de los inputs para prevenir NoSQL injection
- **xss**: Limpia HTML y scripts maliciosos de todos los campos de texto
- Los campos de imagen (Base64) son excluidos de la sanitización para no corromperlos
- Validación de formato de email, cédula (11 dígitos) y contraseñas en middleware dedicado

#### Autenticación y Tokens
- **JWT** con expiración: access token (15 min en producción, 24h en desarrollo), refresh token (7 días)
- **Cookies httpOnly**: Los tokens se almacenan en cookies `httpOnly` inaccesibles desde JavaScript
- **bcryptjs**: Contraseñas hasheadas con salt rounds = 12
- Verificación de estado de usuario en cada request (activo/bloqueado/pendiente)

#### Headers HTTP (Helmet)
- `X-Frame-Options: SAMEORIGIN` — Previene clickjacking
- `X-XSS-Protection` — Protección XSS del navegador
- `X-Content-Type-Options: nosniff` — Previene MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` — Fuerza HTTPS en producción
- `Content-Security-Policy` — Restringe fuentes de contenido en producción

#### CORS
- Lista blanca estricta de orígenes permitidos via `ALLOWED_ORIGINS` en `.env`
- Sin wildcard `*` en producción
- Credenciales habilitadas solo para orígenes permitidos

### Frontend

- URLs del backend siempre desde `VITE_API_URL` (variable de entorno), nunca hardcodeadas
- Interceptor de Axios para manejo automático de refresh token
- Redirección automática a login cuando el token expira
- Rutas protegidas con `ProtectedRoute` por rol
- Rutas públicas con `PublicRoute` que redirigen al dashboard si ya está autenticado
- Validación de formularios en el cliente antes de enviar al servidor

---

## 📦 Dependencias

### Nuevas dependencias a instalar en Backend

```bash
cd backend
npm install express-rate-limit express-mongo-sanitize xss
```

### Dependencias completas del Backend

```json
{
  "bcryptjs": "^2.4.3",          // Hash de contraseñas
  "cookie-parser": "^1.4.7",     // Parseo de cookies HTTP
  "cors": "^2.8.5",              // Control CORS
  "dotenv": "^16.4.5",           // Variables de entorno
  "express": "^4.19.2",          // Framework web
  "express-mongo-sanitize": "^2.2.0", // Previene NoSQL injection
  "express-rate-limit": "^7.3.1", // Rate limiting
  "express-session": "^1.18.0",  // Sesiones para OAuth
  "express-validator": "^7.0.1", // Validación de inputs
  "helmet": "^7.1.0",            // Headers de seguridad
  "jsonwebtoken": "^9.0.2",      // Generación y verificación JWT
  "mongoose": "^8.3.2",          // ODM para MongoDB
  "multer": "^1.4.5-lts.1",      // Upload de archivos (si se requiere)
  "nodemailer": "^6.9.13",       // Envío de emails
  "passport": "^0.7.0",          // Autenticación con estrategias
  "passport-google-oauth20": "^2.0.0", // Estrategia Google OAuth
  "uuid": "^9.0.1",              // Generación de UUIDs únicos
  "xss": "^1.0.15"               // Sanitización XSS
}
```

### Dependencias del Frontend

```json
{
  "axios": "^1.13.2",            // Cliente HTTP con interceptores
  "date-fns": "^4.1.0",          // Utilidades de fechas (format, parse, etc.)
  "date-fns-tz": "^3.2.0",       // Soporte de zonas horarias
  "js-cookie": "^3.0.5",         // Manejo de cookies en browser
  "lucide-react": "^0.562.0",    // Iconos SVG optimizados para React
  "react": "^19.2.0",            // Librería UI
  "react-dom": "^19.2.0",        // Renderizado React en DOM
  "react-router-dom": "^7.11.0", // Enrutamiento del lado cliente
  "react-router-hash-link": "^2.4.3", // Links con anclas hash
  "react-toastify": "^11.0.5",   // Notificaciones tipo toast
  "sweetalert2": "^11.26.17"     // Alertas y modales elegantes
}
```

> **Nota sobre iconos**: Se usa `lucide-react` como librería de iconos. Es compatible con React, tree-shakeable (solo carga los iconos que usas), funciona perfectamente en producción y tiene más de 1400 iconos disponibles. No requiere configuración adicional.

---

## 🚀 Preparación para Producción

### 1. Variables de entorno de producción

```env
# Backend
NODE_ENV=production
MONGO=mongodb+srv://...
JWT_SECRET=secreto_muy_largo_minimo_64_caracteres_aleatorios
JWT_REFRESH_SECRET=otro_secreto_muy_largo_diferente_al_anterior
SESSION_SECRET=tercer_secreto_para_sesiones
FRONTEND_URL=https://tu-dominio-frontend.com
ALLOWED_ORIGINS=https://tu-dominio-frontend.com
PORT=4000

# Frontend
VITE_API_URL=https://tu-dominio-backend.com
```

### 2. Build del frontend

```bash
cd frontend
npm run build
# Los archivos compilados estarán en dist/
```

### 3. Configuración de cookies en producción

Las cookies ya están configuradas para producción automáticamente cuando `NODE_ENV=production`:
- `secure: true` — Solo se envían por HTTPS
- `sameSite: 'none'` — Necesario para cookies cross-domain
- Expiración reducida a 15 minutos para access tokens

### 4. Google OAuth en producción

1. En Google Cloud Console, añadir el dominio de producción a los orígenes autorizados
2. Añadir la URL de callback de producción: `https://tu-backend.com/api/auth/google/callback`
3. Actualizar `GOOGLE_CALLBACK_URL` en `.env` del backend

### 5. MongoDB Atlas

- Configurar IP Whitelist en MongoDB Atlas (o usar `0.0.0.0/0` con credenciales fuertes)
- Asegurarse de que el usuario de BD tenga solo los permisos necesarios (no usar `admin`)

---

## ⚠️ Problemas Conocidos y Soluciones

### Google OAuth no funciona correctamente

**Problema**: El flujo de Google OAuth redirige correctamente pero el usuario no queda autenticado.

**Causa**: Google OAuth para ciudadanos y candidatos requiere que los usuarios estén aprobados por un admin antes de poder iniciar sesión.

**Solución**: Por ahora, se recomienda **desactivar Google OAuth en producción** (`allowGoogleLogin={false}`) hasta implementar un flujo de aprobación automática. Los administradores solo pueden crear cuentas manualmente.

### Inconsistencia en rutas del router vs constants.js

**Problema**: Las rutas definidas en `AppRouter.jsx` (ej. `/loginadmin`) no coinciden con las constantes en `constants.js` (ej. `LOGIN_ADMIN: '/login/admin'`).

**Solución aplicada**: Usar siempre las constantes de `constants.js` en los componentes. Las rutas del router deben actualizarse para coincidir con las constantes.

### Cookie `secure` en desarrollo

**Problema**: En desarrollo local (HTTP), las cookies `secure: true` no se envían.

**Solución aplicada**: `secure: false` en desarrollo (`NODE_ENV !== 'production'`). En producción siempre debe ser `true` con HTTPS.

### Imágenes Base64 grandes (>5MB)

**Problema**: El límite de body es 5MB. Las fotos de perfil en Base64 pueden superar este límite.

**Solución**: Comprimir imágenes antes de convertirlas a Base64 en el frontend. En producción se recomienda usar un servicio de almacenamiento de archivos (Cloudinary, AWS S3) en lugar de Base64.

---

## 📄 Licencia

MIT © Sistema de Votaciones Electrónicas