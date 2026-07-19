import { ROUTES } from "./constants";

/**
 * LOGIN_CONFIG.js
 *
 * PROPÓSITO:
 * Este archivo es el CEREBRO del sistema de login.
 * Define QUÉ CAMPOS necesita cada tipo de usuario para iniciar sesión.
 *
 * DEPENDE DE:
 * - constants.js (para las rutas ROUTES.DASHBOARD_*)
 *
 *  ES USADO POR:
 * - LoginAdmin.jsx
 * - LoginCiudadano.jsx
 * - LoginCandidato.jsx
 *
 *  VENTAJA:
 * Si quieres cambiar los campos de un login, SOLO modificas AQUÍ.
 * No necesitas tocar LoginForm.jsx ni los archivos individuales.
 */

export const LOGIN_CONFIG = {
  //  CONFIGURACIÓN PARA ADMIN
  ADMIN: {
    id: "admin", // Identificador único
    title: "Admin", // Título que aparece en el formulario
    icon: "👑", // Icono que se muestra
    description: "Acceso para administradores", // Descripción del login

    //  CAMPOS QUE SE PIDEN AL ADMIN:
    fields: [
      {
        name: "email", // Nombre del campo (para formData.email)
        type: "email", // Tipo de input HTML
        label: "Email", // Etiqueta que ve el usuario
        placeholder: "admin@ejemplo.com", // Placeholder del input
      },
      {
        name: "password", // Nombre del campo (para formData.password)
        type: "password", // Input tipo password (oculta el texto)
        label: "Contraseña",
        placeholder: "********",
      },
    ],
    //  RESULTADO: LoginForm genera un formulario con email + password
  },

  //  CONFIGURACIÓN PARA CIUDADANO
  CIUDADANO: {
    id: "ciudadano",
    title: "Ciudadano",
    icon: "🗳️",
    description: "Ingresa para votar",

    // 🔑 CAMPOS QUE SE PIDEN AL CIUDADANO:
    // fields: [
    //   {
    //     name: "cedula", // Ciudadano usa CÉDULA (no email)
    //     type: "text",
    //     label: "Cédula",
    //     placeholder: "123456789",
    //   },
    //   {
    //     name: "fechaNacimiento", // Ciudadano usa FECHA (no password)
    //     type: "date", // Input tipo date (calendario)
    //     label: "Fecha de Nacimiento",
    //     placeholder: "",
    //   },
    // ],

    fields: [
      {
        name: "cedula",
        type: "text",
        label: "Cédula",
        placeholder: "123456789",
      },
      {
        name: "password",
        type: "password",
        label: "Contraseña",
        placeholder: "········",
      },
    
    ],

    //  CONFIGURACIÓN ESPECIAL PARA CIUDADANO:
    showRegister: true, // Muestra botón "Registrarse"
    registerRoute: ROUTES.REGISTER_CIUDADANO, // A dónde va ese botón

    // RESULTADO: LoginForm genera un formulario con cédula + fecha
    //               + un link de "Registrarse"
  },

  //  CONFIGURACIÓN PARA CANDIDATO
  CANDIDATO: {
    id: "candidato",
    title: "Candidato",
    icon: "🎯",
    description: "Consulta tus resultados",

    //  CAMPOS QUE SE PIDEN AL CANDIDATO:
    // fields: [
    //   {
    //     name: "cedula", // Candidato también usa CÉDULA
    //     type: "text",
    //     label: "Cédula",
    //     placeholder: "123456789",
    //   },
    //   {
    //     name: "nombre", // Candidato usa NOMBRE (no password)
    //     type: "text",
    //     label: "Nombre Completo",
    //     placeholder: "María González",
    //   },
    // ],
    fields: [
      {
        name: "cedula",
        type: "text",
        label: "Cédula",
        placeholder: "123456789",
      },
      {
        name: "password",
        type: "password",
        label: "Contraseña",
        placeholder: "········",
      },
    ],
    //  RESULTADO: LoginForm genera un formulario con cédula + nombre
  },
};

/**
 *  CÓMO FUNCIONA EL FLUJO:
 *
 * 1️Usuario entra a /login/ciudadano
 * 2️ LoginCiudadano.jsx dice: "Usa LOGIN_CONFIG.CIUDADANO"
 * 3️ LoginForm.jsx lee LOGIN_CONFIG.CIUDADANO y ve:
 *     - fields tiene 2 elementos (cedula y fechaNacimiento)
 *     - showRegister es true
 * 4️LoginForm GENERA AUTOMÁTICAMENTE:
 *     - Input de cédula
 *     - Input de fecha
 *     - Link de "Registrarse"
 * 5️ Cuando el usuario llena y envía:
 *     - formData = { cedula: "123456789", fechaNacimiento: "2000-01-01" }
 *     - Se llama a loginCiudadano(formData)
 *
 * MAGIA: El mismo LoginForm.jsx sirve para TODOS los tipos de usuario,
 *          solo cambiando la configuración que le pasas.
 */
