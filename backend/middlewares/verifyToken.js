/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: verifyToken.js
 * UBICACIÓN: /backend/middlewares/verifyToken.js
 * DESCRIPCIÓN: Middlewares de autenticación y autorización
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Verifica tokens JWT (access y refresh)
 * - Valida roles de usuarios
 * - Verifica estado de aprobación
 * - Bloquea acceso a usuarios no autorizados
 * 
 * DEPENDE DE:
 * - jsonwebtoken (generación y verificación de tokens)
 * - Usuario.js (modelo de usuario)
 * 
 * ES USADO POR:
 * - Todas las rutas protegidas
 * - auth.js, approval.js, profile.js, votos.js, etc.
 * 
 * MIDDLEWARES DISPONIBLES:
 * - verifyToken: Verifica que el usuario esté autenticado
 * - verifyAdmin: Verifica que el usuario sea admin
 * - verifyCiudadano: Verifica que el usuario sea ciudadano
 * - verifyCandidato: Verifica que el usuario sea candidato
 * - verifyRoles: Verifica uno o más roles específicos
 * - verifyEstadoActivo: Verifica que el usuario esté aprobado
 */

import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// ═══════════════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR: EXTRAER TOKEN
// ═══════════════════════════════════════════════════════════════════════

/**
 * Extrae el token JWT de las cookies o headers
 * @param {Object} req - Request de Express
 * @returns {String|null} Token JWT o null
 */
const extraerToken = (req) => {
  // Prioridad 1: Token en cookie (más seguro)
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  // Prioridad 2: Token en header Authorization
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    
    // Formato: "Bearer TOKEN"
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remover "Bearer "
    }
    
    // Formato directo: "TOKEN"
    return authHeader;
  }

  // Prioridad 3: Token en header x-access-token
  if (req.headers['x-access-token']) {
    return req.headers['x-access-token'];
  }

  return null;
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR TOKEN (AUTENTICACIÓN BASE)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario esté autenticado con un token válido
 * 
 * @middleware
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 * 
 * @description
 * - Extrae el token de cookies o headers
 * - Verifica que el token sea válido
 * - Obtiene el usuario de la base de datos
 * - Verifica que el usuario exista
 * - Agrega req.user con los datos del usuario
 * - Permite continuar si todo es válido
 * 
 * @ejemplo
 * router.get('/profile', verifyToken, getProfile);
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Extraer token
    const token = extraerToken(req);

    // Validar que existe el token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.',
        error: 'NO_TOKEN',
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor inicia sesión nuevamente.',
          error: 'TOKEN_EXPIRED',
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido.',
          error: 'TOKEN_INVALID',
        });
      }

      throw error;
    }

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
        error: 'USER_NOT_FOUND',
      });
    }

    // Agregar usuario al request
    req.user = usuario;
    req.userId = usuario._id;
    req.userRol = usuario.rol;

    next();
  } catch (error) {
    console.error('Error en verifyToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar token.',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR ESTADO ACTIVO
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario esté en estado "activo" (aprobado)
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * 
 * @description
 * - Verifica que req.user exista
 * - Verifica que el estado sea "activo"
 * - Verifica que activo === true
 * - Bloquea usuarios pendientes, rechazados o bloqueados
 * 
 * @ejemplo
 * router.post('/votar', verifyToken, verifyEstadoActivo, emitirVoto);
 */
export const verifyEstadoActivo = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Verificar estado
  if (req.user.estado === 'pendiente_aprobacion') {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta está pendiente de aprobación. Un administrador debe aprobarla antes de que puedas usar el sistema.',
      error: 'PENDING_APPROVAL',
    });
  }

  if (req.user.estado === 'rechazado') {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta fue rechazada.',
      error: 'ACCOUNT_REJECTED',
      motivo: req.user.motivoRechazo || 'No especificado',
    });
  }

  if (req.user.estado === 'bloqueado' || req.user.activo === false) {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta está bloqueada. Contacta al administrador.',
      error: 'ACCOUNT_BLOCKED',
    });
  }

  if (req.user.estado !== 'activo') {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta no está activa.',
      error: 'ACCOUNT_INACTIVE',
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR ROL ADMIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario sea administrador
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * 
 * @ejemplo
 * router.post('/elecciones', verifyToken, verifyAdmin, crearEleccion);
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de administrador.',
      error: 'ADMIN_REQUIRED',
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR ROL CIUDADANO
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario sea ciudadano y esté activo
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * 
 * @ejemplo
 * router.post('/votar', verifyToken, verifyCiudadano, emitirVoto);
 */
export const verifyCiudadano = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  if (req.user.rol !== 'ciudadano') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Esta acción es solo para ciudadanos.',
      error: 'CIUDADANO_REQUIRED',
    });
  }

  // Verificar que esté activo
  if (req.user.estado !== 'activo') {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta debe estar aprobada para realizar esta acción.',
      error: 'APPROVAL_REQUIRED',
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR ROL CANDIDATO
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario sea candidato y esté activo
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * 
 * @ejemplo
 * router.get('/mis-resultados', verifyToken, verifyCandidato, getMisResultados);
 */
export const verifyCandidato = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  if (req.user.rol !== 'candidato') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Esta acción es solo para candidatos.',
      error: 'CANDIDATO_REQUIRED',
    });
  }

  // Verificar que esté activo
  if (req.user.estado !== 'activo') {
    return res.status(403).json({
      success: false,
      message: 'Tu cuenta debe estar aprobada para realizar esta acción.',
      error: 'APPROVAL_REQUIRED',
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR MÚLTIPLES ROLES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario tenga uno de los roles especificados
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * @param {Array<String>} rolesPermitidos - Array de roles permitidos
 * @returns {Function} Middleware
 * 
 * @ejemplo
 * router.get('/estadisticas', verifyToken, verifyRoles(['admin', 'candidato']), getEstadisticas);
 */
export const verifyRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
        error: 'ROLE_REQUIRED',
        rolesPermitidos,
      });
    }

    next();
  };
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR REFRESH TOKEN
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica refresh token (para renovar access token)
 * 
 * @middleware
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 * 
 * @description
 * - Extrae refresh token del body
 * - Verifica que sea válido
 * - Agrega decoded al request
 * 
 * @ejemplo
 * router.post('/refresh-token', verifyRefreshToken, refreshAccessToken);
 */
export const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no proporcionado.',
        error: 'NO_REFRESH_TOKEN',
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    req.decoded = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirado. Por favor inicia sesión nuevamente.',
        error: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Refresh token inválido.',
      error: 'REFRESH_TOKEN_INVALID',
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE: VERIFICAR PROPIEDAD (Usuario puede editar solo sus datos)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario esté editando sus propios datos
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * @param {String} paramName - Nombre del parámetro con el ID (default: 'id')
 * @returns {Function} Middleware
 * 
 * @description
 * - Verifica que el ID del parámetro coincida con el ID del usuario autenticado
 * - Permite a admins editar cualquier usuario
 * 
 * @ejemplo
 * router.put('/usuarios/:id', verifyToken, verifyPropiedad('id'), actualizarUsuario);
 */
export const verifyPropiedad = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    const targetId = req.params[paramName];

    // Admins pueden editar cualquier usuario
    if (req.user.rol === 'admin') {
      return next();
    }

    // Usuarios normales solo pueden editar sus propios datos
    if (req.user._id.toString() !== targetId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar estos datos.',
        error: 'PERMISSION_DENIED',
      });
    }

    next();
  };
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════════════

export default {
  verifyToken,
  verifyEstadoActivo,
  verifyAdmin,
  verifyCiudadano,
  verifyCandidato,
  verifyRoles,
  verifyRefreshToken,
  verifyPropiedad,
};

/**
 * ═══════════════════════════════════════════════════════════════════════
 * EJEMPLOS DE USO EN RUTAS:
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * // Solo autenticación
 * router.get('/profile', verifyToken, getProfile);
 * 
 * // Autenticación + activo
 * router.post('/votar', verifyToken, verifyEstadoActivo, emitirVoto);
 * 
 * // Solo admins
 * router.post('/elecciones', verifyToken, verifyAdmin, crearEleccion);
 * 
 * // Solo ciudadanos activos
 * router.post('/votar', verifyToken, verifyCiudadano, emitirVoto);
 * 
 * // Solo candidatos activos
 * router.get('/mis-resultados', verifyToken, verifyCandidato, getMisResultados);
 * 
 * // Múltiples roles (admin o candidato)
 * router.get('/estadisticas/:id', verifyToken, verifyRoles(['admin', 'candidato']), getEstadisticas);
 * 
 * // Verificar propiedad
 * router.put('/usuarios/:id', verifyToken, verifyPropiedad('id'), actualizarUsuario);
 * 
 * // Refresh token
 * router.post('/refresh-token', verifyRefreshToken, refreshAccessToken);
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FLUJO DE AUTENTICACIÓN:
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * 1. Usuario inicia sesión
 *    → authController genera access token y refresh token
 *    → Access token en cookie httpOnly
 *    → Refresh token enviado al frontend
 * 
 * 2. Usuario hace petición protegida
 *    → verifyToken extrae token de cookie/header
 *    → Verifica firma con JWT_SECRET
 *    → Busca usuario en BD
 *    → Agrega req.user
 * 
 * 3. Middleware de rol verifica permisos
 *    → verifyAdmin / verifyCiudadano / etc.
 *    → Verifica rol del usuario
 *    → Permite o bloquea
 * 
 * 4. Access token expira
 *    → Frontend envía refresh token
 *    → verifyRefreshToken valida
 *    → authController genera nuevo access token
 * 
 * 5. Refresh token expira
 *    → Usuario debe iniciar sesión nuevamente
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */