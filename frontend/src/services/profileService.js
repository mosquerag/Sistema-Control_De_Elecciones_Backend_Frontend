/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: profileService.js
 * UBICACIÓN: /frontend/src/services/profileService.js
 * DESCRIPCIÓN: Servicio para gestión de perfiles de usuario
 * ═══════════════════════════════════════════════════════════════════════
 *
 * FUNCIÓN:
 * - Obtener perfil del usuario autenticado
 * - Actualizar datos del perfil
 * - Actualizar foto de perfil
 * - Obtener perfil de otro usuario (admin)
 *
 * DEPENDE DE:
 * - api.js (servicio base)
 *
 * ES USADO POR:
 * - ConfiguracionPerfil.jsx
 * - DetallesUsuarios.jsx
 * - Componentes de perfil
 *
 * PADRE: api.js
 */

import { GET, PUT } from "./api";

// ═══════════════════════════════════════════════════════════════════════
// PERFIL PROPIO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function obtenerPerfil
 * @description Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del perfil
 *
 * @ejemplo
 * const perfil = await obtenerPerfil();
 * console.log(perfil.data.nombre);
 */
export const obtenerPerfil = async () => {
  return await GET("/profile");
};

/**
 * @function actualizarPerfil
 * @description Actualiza los datos del perfil
 * @param {Object} datos - Datos a actualizar
 * @param {String} datos.nombre - Nuevo nombre
 * @param {String} datos.fotoPerfil - Nueva foto
 * @param {String} datos.direccion - Nueva dirección
 * @param {String} datos.municipio - Nuevo municipio
 * @param {String} datos.telefono - Nuevo teléfono
 * @param {Date} datos.fechaNacimiento - Nueva fecha de nacimiento
 * @param {String} datos.email - Nuevo email (solo si no es Google)
 * @param {String} datos.propuestas - Nuevas propuestas (solo candidatos)
 * @returns {Promise<Object>} Perfil actualizado y lista de cambios
 *
 * @ejemplo
 * const resultado = await actualizarPerfil({
 *   nombre: 'Juan Carlos Pérez',
 *   direccion: 'Calle 456',
 *   telefono: '3001234567'
 * });
 * console.log(resultado.data); // Perfil actualizado
 * console.log(resultado.cambios); // Lista de cambios
 */
export const actualizarPerfil = async (datos) => {
  return await PUT("/profile", datos);
};

/**
 * @function actualizarFotoPerfil
 * @description Actualiza solo la foto de perfil
 * @param {String} fotoPerfil - Nueva foto en Base64
 * @returns {Promise<Object>} Foto actualizada
 *
 * @ejemplo
 * const resultado = await actualizarFotoPerfil('data:image/jpeg;base64,...');
 */
export const actualizarFotoPerfil = async (fotoPerfil) => {
  return await PUT("/profile/foto", { fotoPerfil });
};

// ═══════════════════════════════════════════════════════════════════════
// PERFIL DE OTROS USUARIOS (ADMIN)
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function obtenerPerfilUsuario
 * @description Obtiene el perfil de otro usuario (solo admins)
 * @param {String} id - ID del usuario a consultar
 * @returns {Promise<Object>} Perfil completo del usuario
 *
 * @ejemplo
 * const perfil = await obtenerPerfilUsuario('507f1f77bcf86cd799439011');
 */
export const obtenerPerfilUsuario = async (id) => {
  return await GET(`/profile/usuario/${id}`);
};

export const changePassword = async (passwordActual, passwordNuevo) => {
  return await PUT("/profile/cambiar-password", {
    passwordActual,
    passwordNuevo,
  });
};

// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function validarCamposActualizables
 * @description Valida qué campos se pueden actualizar según el usuario
 * @param {Object} usuario - Usuario autenticado
 * @returns {Array<String>} Lista de campos actualizables
 *
 * @ejemplo
 * const camposPermitidos = validarCamposActualizables(usuario);
 * // ['nombre', 'fotoPerfil', 'direccion', 'municipio', 'telefono']
 */
export const validarCamposActualizables = (usuario) => {
  const camposBase = [
    "nombre", //El nombre se puede actualizar pero no es obligatorio
    "fotoPerfil",
    "direccion",
    "municipio",
    "telefono",
    "fechaNacimiento",
  ];

  // Si no es Google, puede cambiar email
  if (!usuario.registradoConGoogle) {
    camposBase.push("email");
  }

  // Si es candidato, puede actualizar propuestas
  if (usuario.rol === "candidato") {
    camposBase.push("propuestas");
  }

  return camposBase;
};

/**
 * @function validarImagenPerfil
 * @description Valida que la imagen de perfil sea válida
 * @param {String} imagen - Imagen en Base64 o URL
 * @returns {Object} { valido: Boolean, mensaje: String }
 *
 * @ejemplo
 * const resultado = validarImagenPerfil(imagenBase64);
 * if (!resultado.valido) {
 *   alert(resultado.mensaje);
 * }
 */
export const validarImagenPerfil = (imagen) => {
  if (!imagen) {
    return { valido: false, mensaje: "La imagen es obligatoria" };
  }

  // Validar formato Base64
  const esBase64 = imagen.startsWith("data:image/");
  const esURL = imagen.startsWith("http://") || imagen.startsWith("https://");

  if (!esBase64 && !esURL) {
    return { valido: false, mensaje: "Formato de imagen inválido" };
  }

  // Validar tamaño (aproximado para Base64)
  if (esBase64 && imagen.length > 5242880) {
    // 5MB
    return { valido: false, mensaje: "La imagen no puede superar 5MB" };
  }

  return { valido: true, mensaje: "Imagen válida" };
};

/**
 * @function convertirImagenABase64
 * @description Convierte un archivo de imagen a Base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<String>} Imagen en Base64
 *
 * @ejemplo
 * const handleFileChange = async (e) => {
 *   const file = e.target.files[0];
 *   const base64 = await convertirImagenABase64(file);
 *   setFotoPerfil(base64);
 * };
 */
export const convertirImagenABase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se proporcionó archivo"));
      return;
    }

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen"));
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5242880) {
      reject(new Error("La imagen no puede superar 5MB"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * @function formatearTelefono
 * @description Formatea un número de teléfono
 * @param {String} telefono - Número de teléfono
 * @returns {String} Teléfono formateado
 *
 * @ejemplo
 * formatearTelefono('3001234567') // '(300) 123-4567'
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return "";

  // Remover caracteres no numéricos
  const numeros = telefono.replace(/\D/g, "");

  // Formatear
  if (numeros.length === 10) {
    return `(${numeros.slice(0, 3)}) ${numeros.slice(3, 6)}-${numeros.slice(6)}`;
  }

  return telefono;
};

/**
 * @function limpiarTelefono
 * @description Limpia formato de teléfono dejando solo números
 * @param {String} telefono - Teléfono formateado
 * @returns {String} Solo números
 *
 * @ejemplo
 * limpiarTelefono('(300) 123-4567') // '3001234567'
 */
export const limpiarTelefono = (telefono) => {
  if (!telefono) return "";
  return telefono.replace(/\D/g, "");
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════════════

export default {
  // Perfil propio
  obtenerPerfil,
  actualizarPerfil,
  actualizarFotoPerfil,

  // Perfil de otros (admin)
  obtenerPerfilUsuario,

  // Utilidades
  validarCamposActualizables,
  validarImagenPerfil,
  convertirImagenABase64,
  formatearTelefono,
  limpiarTelefono,
};
