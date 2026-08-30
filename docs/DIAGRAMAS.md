# Diagramas del sistema — VoteSecure

## 1. Arquitectura general

\`\`\`mermaid
flowchart TB
    subgraph Cliente
        A[Navegador del usuario]
    end

    subgraph Frontend["Frontend — React + Vite"]
        B[SPA React]
        B1[Axios + interceptor de refresh token]
    end

    subgraph Backend["Backend — Node.js + Express"]
        C[API REST]
        C1[Middlewares: helmet, cors, rate-limit, sanitize]
        C2[Controllers]
        C3[JWT: access token 15min / refresh token 7d]
    end

    subgraph Datos
        D[(MongoDB Atlas)]
    end

    subgraph Externos["Servicios externos"]
        E[Google OAuth 2.0]
        F[SMTP — Nodemailer]
    end

    A -->|HTTPS| B
    B --> B1
    B1 -->|cookies httpOnly| C
    C --> C1 --> C2
    C2 --> C3
    C2 -->|Mongoose| D
    C2 -.->|login social| E
    C2 -.->|notificaciones / recuperación| F
\`\`\`

## 2. Modelo de datos (entidad-relación)

\`\`\`mermaid
erDiagram
    USUARIO ||--o{ VOTO : "emite (como ciudadano)"
    USUARIO ||--o{ VOTOANONIMO : "recibe (como candidato)"
    USUARIO ||--o{ NOTIFICACION : recibe
    USUARIO ||--o{ ENCUESTA : responde
    USUARIO ||--o{ LOG : genera
    USUARIO }o--o| USUARIO : "aprueba / rechaza"

    ELECCION ||--o{ VOTO : registra
    ELECCION ||--o{ VOTOANONIMO : registra
    TIPOELECCION ||--o{ ELECCION : clasifica

    USUARIO {
        ObjectId _id
        String nombre
        String email
        String password
        String rol "admin | ciudadano | candidato"
        Boolean esGoogleAuth
        String estado
        Boolean activo
        Date fechaAprobacion
        ObjectId aprobadoPor FK
    }

    ELECCION {
        ObjectId _id
        String titulo
        ObjectId idTipoEleccion FK
        Date fechaInicio
        Date fechaFin
        Boolean activa
    }

    TIPOELECCION {
        ObjectId _id
        String nombre
        Boolean activo
    }

    VOTO {
        ObjectId _id
        ObjectId idCiudadano FK
        ObjectId idEleccion FK
        Date fechaVoto
        String ipAddress
    }

    VOTOANONIMO {
        ObjectId _id
        ObjectId idEleccion FK
        ObjectId idCandidato FK
        Date fecha
    }

    NOTIFICACION {
        ObjectId _id
        ObjectId idUsuario FK
        String tipo
        String mensaje
        Boolean leida
    }
\`\`\`

> **Nota de diseño clave**: `VOTO` registra *quién* votó (para impedir doble voto, vía índice único `idCiudadano + idEleccion`) pero **no** guarda por quién votó. `VOTOANONIMO` registra *por quién* se votó, pero no queda ligado al ciudadano. Esta separación en dos colecciones es lo que garantiza el anonimato del voto — ver el flujo abajo.

## 3. Flujo de autenticación

\`\`\`mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    U->>F: Ingresa credenciales
    F->>B: POST /api/auth/login/{rol}
    B->>DB: Busca usuario + compara hash (bcrypt)
    DB-->>B: Usuario válido
    B->>B: Genera access token (15min) + refresh token (7d)
    B-->>F: Set-Cookie httpOnly (access_token, refresh_token)
    F-->>U: Redirige a dashboard según rol

    Note over F,B: En cada request protegido
    F->>B: Request + cookie access_token
    B->>B: Verifica JWT
    alt Token expirado
        B-->>F: 401
        F->>B: POST /api/auth/refresh-token (cookie refresh_token)
        B-->>F: Nuevo access_token
        F->>B: Reintenta request original
    else Token válido
        B-->>F: 200 + datos
    end
\`\`\`

## 4. Flujo de votación (con anonimato)

\`\`\`mermaid
sequenceDiagram
    participant C as Ciudadano
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    C->>F: Selecciona candidato y confirma voto
    F->>B: POST /api/votos { idEleccion, idCandidato }
    B->>DB: ¿Ya existe Voto(idCiudadano, idEleccion)?
    alt Ya votó
        DB-->>B: Registro existe
        B-->>F: 400 — voto duplicado
    else No ha votado
        B->>DB: Crea Voto { idCiudadano, idEleccion } — SIN candidato
        B->>DB: Crea VotoAnonimo { idEleccion, idCandidato } — SIN ciudadano
        DB-->>B: OK
        B-->>F: 201 — voto registrado
        F-->>C: Confirmación
    end
\`\`\`

## 5. Roles y permisos

\`\`\`mermaid
flowchart LR
    Admin[Admin] -->|crea/gestiona| Elecciones
    Admin -->|aprueba/rechaza| Ciudadanos
    Admin -->|aprueba/rechaza| Candidatos
    Ciudadano -->|vota en| Elecciones
    Candidato -->|participa en| Elecciones
    Admin -->|ve| Estadisticas
    Ciudadano -->|ve resultados públicos de| Estadisticas
\`\`\`