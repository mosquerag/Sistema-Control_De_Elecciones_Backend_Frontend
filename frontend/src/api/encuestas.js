import API from './axios';

/**
 * Enviar respuesta de encuesta (PÚBLICO - sin usuario)
 */
export const enviarEncuesta = async (respuesta, pregunta) => {
  const response = await API.post('/encuestas', {
    pregunta,
    respuesta
    // ✅ NO enviamos idUsuario
  });
  return response.data;
};

/**
 * Obtener resultados de encuesta
 */
export const getResultadosEncuesta = async () => {
  const response = await API.get('/encuestas/resultados');
  return response.data;
};

export default {
  enviarEncuesta,
  getResultadosEncuesta
};