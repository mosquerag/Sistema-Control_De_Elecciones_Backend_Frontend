import { ROUTES } from "./constants";
import { Crown } from "lucide-react";

export const REGISTER_CONFIG = {
  // 👑 REGISTRO DE ADMIN (público — todos los campos)
  ADMIN: {
    id: "admin",
    title: "Administrador",
    icon: "👑",
    description: "Registro de nuevo administrador",
    rol: "admin",
    fields: [
      { name: "nombre", type: "text", label: "Nombre Completo", placeholder: "Juan Pérez", required: true },
      { name: "cedula", type: "text", label: "Cédula", placeholder: "40276543210", required: true, maxLength: 11 },
      { name: "fechaNacimiento", label: "Fecha de Nacimiento (opcional)", type: "date", required: false },
      { name: "email", type: "email", label: "Email", placeholder: "admin@ejemplo.com", required: true },
      { name: "password", type: "password", label: "Contraseña", placeholder: "········", required: true },
      { name: "confirmPassword", type: "password", label: "Confirmar Contraseña", placeholder: "········", required: true },
      { name: "fotoPerfil", type: "file", label: "Foto de Perfil", accept: "image/*", required: true },
    ],
    successRoute: ROUTES.LOGIN_ADMIN,
    showLoginLink: true,
    loginRoute: ROUTES.LOGIN_ADMIN,
  },

  // 👑 REGISTRO DE ADMIN POR ADMIN (datos mínimos — contraseña = cédula)
  ADMIN_BY_ADMIN: {
    id: "admin_by_admin",
    title: "Administrador",
    icon: "👑",
    description: "El administrador podrá ingresar con su cédula como contraseña temporal y deberá cambiarla al iniciar sesión.",
    rol: "admin",
    fields: [
      { name: "nombre", type: "text", label: "Nombre Completo", placeholder: "Juan Pérez", required: true },
      { name: "cedula", type: "text", label: "Cédula", placeholder: "40276543210", required: true, maxLength: 11 },
      { name: "fechaNacimiento", label: "Fecha de Nacimiento (opcional)", type: "date", required: false },
      { name: "email", type: "email", label: "Email", placeholder: "admin@ejemplo.com", required: true },
      { name: "fotoPerfil", type: "file", label: "Foto de Perfil (opcional)", accept: "image/*", required: false },
    ],
    successRoute: ROUTES.LOGIN_ADMIN,
    showLoginLink: false,
    loginRoute: ROUTES.LOGIN_ADMIN,
  },

  // 🗳️ REGISTRO DE CIUDADANO (público — todos los campos)
  CIUDADANO: {
    id: "ciudadano",
    title: "Ciudadano",
    icon: "🗳️",
    description: "Regístrate para poder votar",
    rol: "ciudadano",
    fields: [
      { name: "nombre", type: "text", label: "Nombre Completo", placeholder: "Ana Sofía Castillo Núñez", required: true },
      { name: "cedula", type: "text", label: "Cédula", placeholder: "40255667788", required: true, maxLength: 11 },
      { name: "fechaNacimiento", type: "date", label: "Fecha de Nacimiento", required: true },
      { name: "email", type: "email", label: "Email", placeholder: "ana.castillo@gmail.com", required: true },
      // { name: "telefono", type: "tel", label: "Teléfono", placeholder: "8096789012", required: true },
      { name: "telefono", type: "phone", label: "Teléfono", required: true },
      { name: "direccion", type: "text", label: "Dirección", placeholder: "Urbanización Los Jardines 22", required: true },
      // { name: "municipio", type: "text", label: "Municipio", placeholder: "Santo Domingo Norte", required: true },
      { name: "municipio", type: "select-pais-ciudad", label: "Ubicación", required: true },
      { name: "password", type: "password", label: "Contraseña", placeholder: "········", required: true },
      { name: "confirmPassword", type: "password", label: "Confirmar Contraseña", placeholder: "········", required: true },
      { name: "fotoPerfil", type: "file", label: "Foto de Perfil", accept: "image/*", required: true },
    ],
    successRoute: ROUTES.LOGIN_CIUDADANO,
    showLoginLink: true,
    loginRoute: ROUTES.LOGIN_CIUDADANO,
  },

  // 🎯 REGISTRO DE CANDIDATO (público — todos los campos)
  CANDIDATO: {
    id: "candidato",
    title: "Candidato",
    icon: "🎯",
    description: "Registro de nuevo candidato",
    rol: "candidato",
    fields: [
      { name: "nombre", type: "text", label: "Nombre Completo", placeholder: "Ana Patricia Fernández", required: true },
      { name: "cedula", type: "text", label: "Cédula", placeholder: "40276543210", required: true, maxLength: 11 },
      { name: "fechaNacimiento", label: "Fecha de Nacimiento", type: "date", required: true },
      { name: "email", type: "email", label: "Email", placeholder: "ana.fernandez@partidorojo.com", required: true },
      { name: "partido", type: "text", label: "Partido Político", placeholder: "Partido Rojo Popular", required: true },
      { name: "idEleccion", type: "select-elecciones", label: "Elección", placeholder: "Selecciona una elección", required: true },
      { name: "municipio", type: "select-pais-ciudad", label: "Ubicación", required: true }, 
      { name: "password", type: "password", label: "Contraseña", placeholder: "········", required: true },
      { name: "confirmPassword", type: "password", label: "Confirmar Contraseña", placeholder: "········", required: true },
      { name: "propuestas", type: "textarea", label: "Propuestas", placeholder: "1. Justicia social. 2. Vivienda digna.", required: true, fullWidth: true, rows: 4 },
      { name: "fotoPerfil", type: "file", label: "Foto de Perfil", accept: "image/*", required: true },
    ],
    successRoute: ROUTES.LOGIN_CANDIDATO,
    showLoginLink: true,
    loginRoute: ROUTES.LOGIN_CANDIDATO,
  },
};