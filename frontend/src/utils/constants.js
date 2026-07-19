export const ROLES = {
  ADMIN: "admin",
  CIUDADANO: "ciudadano",
  CANDIDATO: "candidato",
};

export const ROUTES = {
  // Públicas
  HOME: "/",
  NOT_FOUND: "*",

  // Auth
  LOGIN_ADMIN: "/login/admin",
  LOGIN_CIUDADANO: "/login/ciudadano",
  LOGIN_CANDIDATO: "/login/candidato",
  // REGISTER_CIUDADANO: '/register/ciudadano',

  //  Registro
  REGISTER_ADMIN: "/registro/admin",
  REGISTER_CIUDADANO: "/registro/ciudadano",
  REGISTER_CANDIDATO: "/registro/candidato",

  // Admin
  DASHBOARD_ADMIN: "/admin/dashboard",
  GESTION_ELECCIONES: "/admin/elecciones",
  GESTION_TIPOS_ELECCION: "/admin/tipos-eleccion", // ✅ Agregar
  GESTION_CANDIDATOS: "/admin/candidatos",
  GESTION_CIUDADANOS: "/admin/ciudadanos",
  GESTION_USUARIOS: "/admin/usuarios",
  GESTION_ADMINISTRADORES: '/admin/administradores',
  ESTADISTICAS_ADMIN: "/admin/estadisticas",

  // Ciudadano
  DASHBOARD_CIUDADANO: "/ciudadano/dashboard",
  ELECCIONES_ACTIVAS: "/ciudadano/elecciones",
  VER_CANDIDATOS: "/ciudadano/candidatos/:idEleccion",
  VOTAR: "/ciudadano/votar/:idEleccion",
  HISTORIAL_VOTOS: "/ciudadano/historial",
  RESULTADOS_PUBLICOS: "/ciudadano/resultados/:idEleccion",
  LISTA_RESULTADOS: "/ciudadano/resultados-publicos",

  // Candidato
  DASHBOARD_CANDIDATO: "/candidato/dashboard",
  MIS_RESULTADOS: "/candidato/resultados",
};

export const ESTADOS_ELECCION = {
  PENDIENTE: "pendiente",
  EN_CURSO: "en_curso",
  FINALIZADA: "finalizada",
};
