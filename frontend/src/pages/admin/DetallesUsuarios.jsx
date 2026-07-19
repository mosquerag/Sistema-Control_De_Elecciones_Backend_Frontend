import React from "react";
import {
  Mail,
  Star,
  Bookmark,
  CreditCard, // Para cédula
  Calendar, // Para fecha de nacimiento
  User, //  Para rol
  CheckCircle, // Para estado activo
  XCircle, // Para estado inactivo
  Cake, // Para edad
  Phone, // Para teléfono
} from "lucide-react";
import Card from "@/components/common/Card";
import Avatar from "@/components/common/Avatar";

const DetallesUsuarios = ({ usuario }) => {
  if (!usuario) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          No hay información de usuario disponible
        </p>
      </div>
    );
  }
  // Función para obtener iniciales
  const getInitials = (nombre) => {
    if (!nombre) return "?";
    const palabras = nombre.trim().split(" ");
    if (palabras.length === 1) {
      return palabras[0].charAt(0).toUpperCase();
    }
    return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
  };

  return (
    <Card noHover className="!border-0 !p-2 !shadow-none !overflow-hidden">
      {/* Imagen de perfil */}
      <div className="relative h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 -m-6 mb-0 rounded-t-1xl">
        {usuario.foto || usuario.fotoPerfil ? (
          <img
            src={usuario.foto || usuario.fotoPerfil}
            alt={`${usuario.nombre} - Foto de perfil`}
            className="w-full h-full object-cover opacity-90 rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
            {getInitials(usuario.nombre)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-1xl"></div>
      </div>

      {/* Contenido */}
      <div className="relative px-5 pb-2 -mt-10">
        {/* Nombre y verificación */}
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg break-words">
            {usuario.nombre}
          </h2>
          {usuario.verificado && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
            >
              <circle cx="12" cy="12" r="10" fill="#2196F3" />
              <path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Descripción */}
        {usuario.descripcion && (
          <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
            {usuario.descripcion}
          </p>
        )}

        {/* Highlights */}
        {(usuario.rating || usuario.revenue || usuario.rate) && (
          <div className="flex justify-center items-center gap-4 mb-2">
            {usuario.rating && (
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-800">
                    {usuario.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  Review
                </span>
              </div>
            )}

            {usuario.revenue && (
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-gray-800 mb-1">
                  {usuario.revenue}
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  Revenue
                </span>
              </div>
            )}

            {usuario.rate && (
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-gray-800 mb-1">
                  {usuario.rate}
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  Rate
                </span>
              </div>
            )}
          </div>
        )}

        {/* ✅ INFORMACIÓN ADICIONAL CON ICONOS */}
        <div className="space-y-2 mb-0 bg-blue-100/80 p-3 rounded-xl dark:bg-blue-900/40">
          {/* Estado */}
          <div className="flex items-center gap-3">
            {usuario.activo ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-white min-w-[80px]">
              Estado:
            </span>
            <span
              className={`ml-auto inline-block text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${
                usuario.activo
                  ? "bg-green-700 dark:bg-green-300 text-green-300 dark:text-green-900"
                  : "bg-red-800 dark:bg-red-300 text-red-300 dark:text-red-900"
              }`}
            >
              {usuario.activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Rol */}
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
              Rol:
            </span>
            <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white capitalize flex-1 text-right">
              {usuario.rol || "-"}
            </span>
          </div>

          {/** Nacionalidad  */}
          {/* {usuario.nacionalidad && (
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Nacionalidad:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right">
                {usuario.nacionalidad}
              </span>
            </div>
          )}
           */}
          {/** País */}
          {(usuario.pais || usuario.nacionalidad) && (
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                País:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right">
                {usuario.pais || usuario.nacionalidad}
              </span>
            </div>
          )}

          {/** Municipio */}
          {usuario.municipio && (
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Municipio o Departamento:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right">
                {usuario.municipio}
              </span>
            </div>
          )}

          {/* Cédula */}
          {usuario.cedula && (
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Cédula:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white font-mono flex-1 text-right">
                {usuario.cedula}
              </span>
            </div>
          )}

          {/* Email */}
          {usuario.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500 dark:text-white  flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Email:
              </span>

              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right break-all min-w-0">
                {usuario.email}
              </span>
            </div>
          )}

          {usuario.telefono && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Teléfono:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right">
                {usuario.telefono}
              </span>
            </div>
          )}

          {/* Fecha de Nacimiento */}
          {usuario.fechaNacimiento && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Fecha Nacimiento:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right">
                {/* {new Date(usuario.fechaNacimiento).toLocaleDateString("es-DO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} */}

                {new Date(usuario.fechaNacimiento).toLocaleDateString("es-DO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </div>
          )}

          {/* Edad */}
          {usuario.edad && (
            <div className="flex items-center gap-3">
              <Cake className="w-4 h-4 text-gray-500 dark:text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-100 min-w-[80px]">
                Edad:
              </span>
              <span className="text-xs sm:text-sm text-gray-800 font-medium dark:text-white flex-1 text-right">
                {usuario.edad} años
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DetallesUsuarios;
