/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: profile.js
 * UBICACIÓN: /backend/routes/profile.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIONES:
 * ✅ Eliminada ruta duplicada PUT /cambiar-password (existía dos veces)
 * ✅ Eliminada lógica inline en la segunda ruta (debe estar en el controlador)
 * ✅ La lógica de cambio de contraseña está en profileController.js
 */

import express from "express";
import {
  obtenerPerfil,
  actualizarPerfil,
  actualizarFotoPerfil,
  cambiarPassword,
  obtenerPerfilUsuario,
} from "../controllers/profileController.js";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ── Perfil propio ─────────────────────────────────────────────────────
router.get("/", obtenerPerfil);
router.put("/", actualizarPerfil);
router.put("/foto", actualizarFotoPerfil);

// ✅ Una sola ruta para cambiar contraseña (eliminada la duplicada)
router.put("/cambiar-password", cambiarPassword);

// ── Administrativo ────────────────────────────────────────────────────
router.get("/usuario/:id", verifyAdmin, obtenerPerfilUsuario);

export default router;
