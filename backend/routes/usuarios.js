/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: usuarios.js
 * UBICACIÓN: /backend/routes/usuarios.js
 * DESCRIPCIÓN: Rutas de gestión de usuarios (admin)
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  getUsuarios,
  getUsuariosByRol,
  getUsuarioById,
  updateUsuario,
  desactivarUsuario,
  deleteUsuario,
} from '../controllers/usuariosController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// TODAS LAS RUTAS REQUIEREN ADMIN
// ═══════════════════════════════════════════════════════════════════════

router.use(verifyToken);
router.use(verifyAdmin);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/usuarios
 * @description Obtener todos los usuarios
 * @access Privado (solo admin)
 */
router.get('/', getUsuarios);

/**
 * @route GET /api/usuarios/rol/:rol
 * @description Obtener usuarios por rol
 * @access Privado (solo admin)
 */
router.get('/rol/:rol', getUsuariosByRol);

/**
 * @route GET /api/usuarios/:id
 * @description Obtener usuario por ID
 * @access Privado (solo admin)
 */
router.get('/:id', getUsuarioById);

/**
 * @route PUT /api/usuarios/:id
 * @description Actualizar usuario
 * @access Privado (solo admin)
 */
router.put('/:id', updateUsuario);

/**
 * @route PATCH /api/usuarios/:id/desactivar
 * @description Desactivar usuario (soft delete)
 * @access Privado (solo admin)
 */
router.patch('/:id/desactivar', desactivarUsuario);

/**
 * @route DELETE /api/usuarios/:id
 * @description Eliminar usuario permanentemente
 * @access Privado (solo admin)
 */
router.delete('/:id', deleteUsuario);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;