import { format, parseISO, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';


export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(parseISO(date), "dd/MM/yyyy 'a las' HH:mm", { locale: es });
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  return differenceInYears(new Date(), parseISO(birthDate));
};

export const isEleccionActiva = (fechaInicio, fechaFin) => {
  const hoy = new Date();
  const inicio = parseISO(fechaInicio);
  const fin = parseISO(fechaFin);
  return hoy >= inicio && hoy <= fin;
};