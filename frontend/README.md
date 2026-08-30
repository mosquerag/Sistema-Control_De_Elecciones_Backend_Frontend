# VoteSecure — Frontend

Interfaz web del sistema de votaciones electrónicas. React + Vite + Tailwind CSS.

Para la descripción general del proyecto, ver el [README principal](../README.md).

## Ejecutar el frontend de forma independiente

```bash
cd frontend
npm install
cp .env.example .env   # completar con tus valores reales
npm run dev              # desarrollo (http://localhost:5173)
npm run build             # build de producción (queda en dist/)
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend (ej. `http://localhost:4000` en desarrollo) |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth (solo si se usa login con Google) |

## Estructura de carpetas

> Nota: `components/` no está subdividido por rol — los componentes de UI reutilizables viven en `components/common/`, y el resto de componentes de una sola sección (home, candidatos, etc.) están directamente en `components/`. Los componentes específicos de una página (como `pages/ciudadano/CandidatoCard.jsx`) viven junto a su página, no en `components/`.

## Rutas principales

| Ruta | Acceso |
|---|---|
| `/` | Pública — landing page |
| `/iniciosesion`, `/registrarse` | Públicas — selección de tipo de cuenta |
| `/loginadmin`, `/loginciudadano`, `/logincandidato` | Públicas — login por rol |
| `/admin/*` | Protegida — rol `admin` |
| `/ciudadano/*` | Protegida — rol `ciudadano` |
| `/candidato/*` | Protegida — rol `candidato` |

## Scripts disponibles

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve localmente el build de producción, para probarlo |