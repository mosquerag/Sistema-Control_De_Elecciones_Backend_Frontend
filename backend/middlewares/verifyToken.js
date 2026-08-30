import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// ═══════════════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR: EXTRAER TOKEN
// ═══════════════════════════════════════════════════════════════════════

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