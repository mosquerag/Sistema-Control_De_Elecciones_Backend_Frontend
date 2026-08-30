import { ROUTES } from './constants';

// Configuración de tipos de usuario para la página Home
export const USER_TYPES = {
  ADMIN: {
    id: 'admin',
    title: 'Administrador',
    icon: '👑',
    description: 'Gestiona elecciones, candidatos y resultados',
    route: ROUTES.LOGIN_ADMIN,
    // Agregar ruta de registro (opcional para admin)
    /**Solo crear admin dedes el backen y crear desde el panale principala del admind crear otros admisn con fucnione srestrigidas */
    showRegister: false, // Cambiar a true si quieres permitir registro de admins (cambiar a falso si no se desea  registro de admins)
    registerRoute: ROUTES.REGISTER_ADMIN
  },
  CIUDADANO: {
    id: 'ciudadano',
    title: 'Ciudadano',
    icon: '🗳️',
    description: 'Vota por tus candidatos favoritos',
    route: ROUTES.LOGIN_CIUDADANO,
    showRegister: true,
    registerRoute: ROUTES.REGISTER_CIUDADANO
  },
  CANDIDATO: {
    id: 'candidato',
    title: 'Candidato',
    icon: '🎯',
    description: 'Consulta tus resultados en tiempo real',
    route: ROUTES.LOGIN_CANDIDATO,
    // Agregar opción de registro para candidatos
    showRegister: true, // Cambiar a true si quieres permitir auto-registro de candidatos (cambiar a falso si no se desea  registro de candidatos)
    registerRoute: ROUTES.REGISTER_CANDIDATO
  }
};
/** */