import API from './axios';

/**
 * Obtiene estadísticas públicas (sin autenticación)
 * @returns {Promise} Estadísticas del sistema
 */
export const getPublicStats = async () => {
  const response = await API.get('/public/stats');
  return response.data;
};

export default {
  getPublicStats
};