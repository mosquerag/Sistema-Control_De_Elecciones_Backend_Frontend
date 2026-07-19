/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: auth.js
 * UBICACIÓN: /backend/routes/auth.js
 * DESCRIPCIÓN: Rutas de autenticación con rate limiting y validación
 * ═══════════════════════════════════════════════════════════════════════
 *
 * MEJORAS APLICADAS:
 * ✅ Rate limiting aplicado a login y registro
 * ✅ Validación de inputs con middleware
 * ✅ Rutas organizadas y documentadas
 */

import express from "express";
import passport from "passport";

import {
  registerAdmin,
  registerCiudadano,
  registerCandidato,
  registerAdminByAdmin,
  registerCiudadanoByAdmin,
  registerCandidatoByAdmin,
  loginAdmin,
  loginCiudadano,
  loginCandidato,
  googleCallback,
  googleRegister,
  logout,
  verifyToken as verifyTokenController,
  refreshToken as refreshTokenController,
  cambiarPassword,
} from "../controllers/authController.js";
import { verifyIdentity, resetPassword } from '../controllers/forgotPasswordController.js';
console.log('forgotPassword cargado:', { verifyIdentity, resetPassword });



import { verifyToken } from "../middlewares/verifyToken.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";
import { validateAuthInputs } from "../middlewares/sanitize.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[AUTH ROUTER] ${req.method} ${req.path}`);
  next();
});

// ── REGISTRO PÚBLICO ─────────────────────────────────────────────────
router.post(
  "/register/admin",
  registerLimiter,
  validateAuthInputs,
  registerAdmin,
);
router.post(
  "/register/ciudadano",
  registerLimiter,
  validateAuthInputs,
  registerCiudadano,
);
router.post(
  "/register/candidato",
  registerLimiter,
  validateAuthInputs,
  registerCandidato,
);

// ── REGISTRO POR ADMIN (protegido) ───────────────────────────────────
router.post(
  "/admin/register/admin",
  verifyToken,
  esAdmin,
  validateAuthInputs,
  registerAdminByAdmin,
);
router.post(
  "/admin/register/ciudadano",
  verifyToken,
  esAdmin,
  validateAuthInputs,
  registerCiudadanoByAdmin,
);
router.post(
  "/admin/register/candidato",
  verifyToken,
  esAdmin,
  validateAuthInputs,
  registerCandidatoByAdmin,
);

// ── LOGIN ─────────────────────────────────────────────────────────────
router.post("/login/admin", loginLimiter, validateAuthInputs, loginAdmin);
router.post(
  "/login/ciudadano",
  loginLimiter,
  validateAuthInputs,
  loginCiudadano,
);
router.post(
  "/login/candidato",
  loginLimiter,
  validateAuthInputs,
  loginCandidato,
);

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────
router.get("/google", (req, res, next) => {
  const rol = req.query.rol || "ciudadano";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: rol,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/iniciosesion?error=oauth_failed`,
    session: false,
  }),
  googleCallback,
);

router.post("/google/register", googleRegister);

// ── GESTIÓN DE SESIÓN ─────────────────────────────────────────────────
router.post("/logout", verifyToken, logout);
router.get("/verify-token", verifyToken, verifyTokenController);
router.post("/refresh-token", refreshTokenController);
router.put("/change-password", verifyToken, cambiarPassword);

router.post('/verify-identity', verifyIdentity);
router.post('/reset-password',  resetPassword);

export default router;
