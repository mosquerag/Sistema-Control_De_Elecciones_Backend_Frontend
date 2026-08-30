import API from './axios';

export const votar = (data) => API.post('/votos', data);
export const checkVoto = (idEleccion) => API.get(`/votos/check/${idEleccion}`);
export const getMisVotos = () => API.get('/votos/mis-votos');
export const getVotos = () => API.get('/votos');
export const getVotosByEleccion = (idEleccion) => API.get(`/votos/eleccion/${idEleccion}`);
export const getVotoById = (id) => API.get(`/votos/${id}`);