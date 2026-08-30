# Base de datos — VoteSecure

MongoDB (Atlas o local) vía Mongoose. Ver también el [diagrama entidad-relación](DIAGRAMAS.md#2-modelo-de-datos-entidad-relación) para la vista visual.

## Colecciones

### Usuario
La colección central — cubre admin, ciudadano y candidato en un solo modelo, diferenciados por `rol`.

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | String | Único, 3-100 caracteres |
| `cedula` | String | 11 dígitos. Obligatoria excepto para `admin` |
| `email` | String | Obligatorio para `admin` y cuentas Google. Índice `sparse` (permite múltiples documentos sin email) |
| `password` | String | Hash bcrypt. No requerido si `esGoogleAuth: true` |
| `rol` | String enum | `admin` \| `ciudadano` \| `candidato` |
| `estado` | String enum | `pendiente_aprobacion` \| `pendiente` \| `activo` \| `bloqueado` \| `rechazado` \| `archivado` |
| `esGoogleAuth` / `googleId` | Boolean / String | Cuentas registradas vía Google OAuth |
| `aprobadoPor` / `rechazadoPor` | ObjectId → Usuario | Quién aprobó/rechazó la cuenta |
| `historicoEstados` | Array | Bitácora de cambios de estado con fecha y admin responsable |
| `partido` / `propuestas` / `idEleccion` | — | Solo aplican cuando `rol: "candidato"` |
| `totalVotos` | Number | Contador denormalizado de votos recibidos (solo candidatos) |
| `direccion` / `telefono` / `fechaNacimiento` / `nacionalidad` | — | Datos personales |

**Índices**: `cedula` (único, sparse), `email` (único, sparse), `googleId` (único, sparse), `{rol, estado}`, `{idEleccion, rol}`.

⚠️ Esta colección contiene **datos personales sensibles** (cédula, email, dirección, teléfono, hash de contraseña). Nunca debe exportarse fuera del entorno de producción sin anonimizar.

### Eleccion
| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | String | Único |
| `idTipoEleccion` | ObjectId → TipoEleccion | |
| `fechaInicio` / `fechaFin` | Date | `fechaFin` debe ser posterior a `fechaInicio` |
| `estado` | String enum | `proxima` \| `abierta_postulacion` \| `en_votacion` \| `finalizada` \| `cancelada` |
| `abiertaPostulacion` | Boolean | Si acepta inscripción de nuevos candidatos |
| `totalVotantes` | Number | Contador denormalizado |

**Regla de negocio importante**: una vez que una elección tiene votos registrados, `fechaInicio`, `fechaFin` e `idTipoEleccion` quedan bloqueados para edición.

### TipoEleccion
Catálogo simple: `nombre` (único), `descripcion`, `activa`.

### Voto
Registra **quién votó**, sin registrar por quién.

| Campo | Notas |
|---|---|
| `idCiudadano` | ObjectId → Usuario |
| `idEleccion` | ObjectId → Eleccion |
| `fechaVoto`, `ipAddress` | Trazabilidad |

**Índice único** `{idCiudadano, idEleccion}` — es lo que impide el doble voto.

### VotoAnonimo
Registra **por quién se votó**, sin registrar quién votó.

| Campo | Notas |
|---|---|
| `idEleccion` | ObjectId → Eleccion |
| `idCandidato` | ObjectId → Usuario |
| `fecha` | — |

Estas dos colecciones separadas son el mecanismo de anonimato del voto.

### Notificacion, Encuesta, Log, Pais
Colecciones de soporte: notificaciones del panel admin, encuestas de satisfacción, bitácora de acciones del sistema y catálogo de países. Cada una referencia a `Usuario` donde aplica.

## Backups

- El script `npm run backup` genera un dump local de las colecciones.
- **Regla crítica**: la carpeta de salida nunca debe commitearse a Git — está en `.gitignore` (ver el incidente documentado en `CHANGELOG.md` v3.1.0).
- Guarda los backups fuera del repositorio, en almacenamiento cifrado o con acceso restringido.

## Migraciones / cambios de esquema

Este proyecto no usa una herramienta de migraciones formal. Al modificar un modelo:
1. Actualiza el archivo en `backend/models/`.
2. Si el cambio afecta documentos existentes, escribe un script puntual en `backend/scripts/`.
3. Documenta el cambio en `CHANGELOG.md`.
4. Actualiza este archivo para reflejar el nuevo esquema.