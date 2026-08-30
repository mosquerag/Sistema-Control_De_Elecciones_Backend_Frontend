
import API from "./axios.js";
export const getResultadosEleccion = (idEleccion) => 
  API.get(`/estadisticas/eleccion/${idEleccion}`);

export const getResultadosCandidato = () => 
  API.get('/estadisticas/candidato');

export const getEvolucionVotos = (idCandidato) => 
  API.get(`/estadisticas/evolucion/${idCandidato}`);