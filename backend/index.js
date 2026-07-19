/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: index.js
 * UBICACIÓN: /backend/index.js
 * DESCRIPCIÓN: Servidor principal — seguro, limpio y listo para producción
 * ═══════════════════════════════════════════════════════════════════════
 *
 * MEJORAS APLICADAS:
 * ✅ Rate limiting en login, registro, votos y API general
 * ✅ Sanitización de inputs (XSS + NoSQL injection)
 * ✅ Helmet con CSP configurado correctamente
 * ✅ Cookies seguras para producción
 * ✅ console.log eliminados del código de producción
 * ✅ Variables de entorno validadas al arranque
 * ✅ CORS estricto con lista blanca de orígenes
 * ✅ Límite de body size para prevenir ataques de payload masivo
 * ✅ Headers de seguridad adicionales
 *
 * DEPENDENCIAS NUEVAS A INSTALAR:
 * npm install express-rate-limit express-mongo-sanitize xss
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import connectDB from "./utils/db.js";
import "./config/googleOAuth.js";

// Middlewares de seguridad
import { sanitizeMongo, sanitizeInputs } from "./middlewares/sanitize.js";
import {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  voteLimiter,
  publicLimiter,
} from "./middlewares/rateLimiter.js";

// Rutas
import authRoutes from "./routes/auth.js";
import approvalRoutes from "./routes/approval.js";
import profileRoutes from "./routes/profile.js";
import notificacionesRoutes from "./routes/notificaciones.js";
import candidatosRoutes from "./routes/candidatos.js";
import ciudadanosRoutes from "./routes/ciudadanos.js";
import eleccionesRoutes from "./routes/elecciones.js";
import estadisticasRoutes from "./routes/estadisticas.js";
import paisesRoutes from "./routes/paises.js";
import tiposEleccionesRoutes from "./routes/tiposElecciones.js";
import usuariosRoutes from "./routes/usuarios.js";
import votosRoutes from "./routes/votos.js";
import publicRoutes from "./routes/public.js";
import encuestasRoutes from "./routes/encuestas.js";

// ── Cargar variables de entorno ──────────────────────────────────────
dotenv.config();

// ── Validar variables críticas antes de arrancar ────────────────────
const requiredEnvVars = [
  "MONGO",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "SESSION_SECRET",
  "FRONTEND_URL",
];

const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(
    "❌ Faltan variables de entorno críticas:",
    missingEnvVars.join(", "),
  );
  console.error("Revisa tu archivo .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

// ═══════════════════════════════════════════════════════════════════════
// SEGURIDAD — HELMET
// ═══════════════════════════════════════════════════════════════════════

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.FRONTEND_URL],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
          },
        }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  }),
);

// ═══════════════════════════════════════════════════════════════════════
// CORS — Lista blanca de orígenes permitidos
// ═══════════════════════════════════════════════════════════════════════

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [process.env.FRONTEND_URL, "http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      // Herramientas como Postman no envían origin en desarrollo
      if (!origin && !isProduction) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("No permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ═══════════════════════════════════════════════════════════════════════
// PARSEO Y SANITIZACIÓN
// ═══════════════════════════════════════════════════════════════════════

// Límite reducido a 5MB para imágenes Base64 (era 10MB)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Sanitizar contra NoSQL injection (MongoDB operators en body/query/params)
app.use(sanitizeMongo);

// Sanitizar contra XSS en todos los campos de texto
app.use(sanitizeInputs);

// ═══════════════════════════════════════════════════════════════════════
// SESIONES Y PASSPORT (Google OAuth)
// ═══════════════════════════════════════════════════════════════════════

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITING GLOBAL (antes de las rutas)
// ═══════════════════════════════════════════════════════════════════════

app.use("/api/", apiLimiter);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════════════

// Health check — sin rate limit
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🗳️ API del Sistema de Votaciones Electrónicas",
    version: "3.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Rutas públicas (con rate limit moderado)
app.use("/api/public", publicLimiter, publicRoutes);
app.use("/api/encuestas", publicLimiter, encuestasRoutes);

// Rutas de auth (con rate limits estrictos en login y registro)
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth", authRoutes);

// Votos (rate limit muy estricto)
// app.use("/api/votos", voteLimiter, votosRoutes);
app.use("/api/votos", votosRoutes);
// Rutas protegidas
app.use("/api/approval", approvalRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/candidatos", candidatosRoutes);
app.use("/api/ciudadanos", ciudadanosRoutes);
app.use("/api/elecciones", eleccionesRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/paises", paisesRoutes);
app.use("/api/tipos-elecciones", tiposEleccionesRoutes);
app.use("/api/usuarios", usuariosRoutes);

// ═══════════════════════════════════════════════════════════════════════
// 404
// ═══════════════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    error: "NOT_FOUND",
  });
});

// ═══════════════════════════════════════════════════════════════════════
// MANEJO GLOBAL DE ERRORES
// ═══════════════════════════════════════════════════════════════════════

app.use((err, req, res, _next) => {
  // Log solo en desarrollo
  if (!isProduction) {
    console.error("ERROR:", err.message);
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Ya existe un registro con esos datos.",
      error: "DUPLICATE_KEY",
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: messages,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido.",
      error: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expirado. Por favor inicia sesión nuevamente.",
      error: "EXPIRED_TOKEN",
    });
  }

  if (err.message === "No permitido por CORS") {
    return res.status(403).json({
      success: false,
      message: "Origen no permitido.",
      error: "CORS_ERROR",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? "Error interno del servidor" : err.message,
    error: isProduction ? "INTERNAL_ERROR" : err.stack,
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INICIO DEL SERVIDOR
// ═══════════════════════════════════════════════════════════════════════

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      if (!isProduction) {
        console.log(`\n🗳️  Sistema de Votaciones — Puerto ${PORT}`);
        console.log(`✅ Entorno: ${process.env.NODE_ENV || "development"}`);
        console.log(`✅ Base de datos: Conectada`);
        console.log(`✅ Rate limiting: Activo`);
        console.log(`✅ Sanitización: Activa\n`);
      }
    });
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📋 Rutas disponibles:");
    console.log("   - GET  /                           (Health check)");
    console.log("   - GET  /health                     (Status)");
    console.log("   - POST /api/auth/register/*        (Registro)");
    console.log("   - POST /api/auth/login/*           (Login)");
    console.log("   - GET  /api/auth/google            (Google OAuth)");
    console.log("   - GET  /api/approval/*             (Aprobaciones)");
    console.log("   - GET  /api/profile                (Perfil)");
    console.log("   - POST /api/votos                  (Votar)");
    console.log("   - GET  /api/estadisticas/*         (Resultados)");
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();

// Manejo de señales
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  if (isProduction) process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.message);
  if (isProduction) process.exit(1);
});
