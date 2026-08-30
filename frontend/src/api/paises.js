import API from './axios';

export const getPaises = () => API.get('/paises');
export const getPaisById = (id) => API.get(`/paises/${id}`);
export const createPais = (data) => API.post('/paises', data);
export const updatePais = (id, data) => API.put(`/paises/${id}`, data);
export const deletePais = (id) => API.delete(`/paises/${id}`);