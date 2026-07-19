import { useState, useEffect } from "react";
import { Bell, X, Check, XCircle, Clock, User } from "lucide-react";
import {
  getNotificaciones,
  aprobarUsuarioDesdeNotificacion,
  rechazarUsuarioDesdeNotificacion,
} from "@/api/notificaciones";
import {
  mostrarAlerta,
  confirmarAccion,
  manejarErrorApi,
  toastError,
} from "@/utils/alertas";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

export function NotificationPanel({
  isOpen,
  onClose,
  onNotificationCountChange,
}) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (isOpen) loadNotificaciones();
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────
  // CARGA
  // ─────────────────────────────────────────────────────────
  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await getNotificaciones();
      const notifs = response.data || response;
      const pendientes = notifs.filter(
        (n) =>
          !n.procesada &&
          (n.tipo === "nuevo_registro" || n.tipo === "nueva_postulacion"),
      );
      setNotificaciones(pendientes);
      if (onNotificationCountChange)
        onNotificationCountChange(pendientes.length);
    } catch (error) {
      toastError("Error al cargar notificaciones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // ACCIONES
  // ─────────────────────────────────────────────────────────
  const handleAprobar = (notificacion) => {
    confirmarAccion(
      "¿Aprobar usuario?",
      `¿Estás seguro de que deseas aprobar a ${notificacion.datos?.nombre}?`,
      async () => {
        try {
          setProcessingId(notificacion._id);
          await aprobarUsuarioDesdeNotificacion(
            notificacion._id,
            notificacion.idUsuario,
          );
          mostrarAlerta(
            "success",
            "Usuario aprobado",
            `${notificacion.datos?.nombre} ha sido aprobado exitosamente`,
          );
          await loadNotificaciones();
        } catch (error) {
          manejarErrorApi(error, "Error al aprobar usuario");
        } finally {
          setProcessingId(null);
        }
      },
    );
  };

  const handleRechazar = (notificacion) => {
    confirmarAccion(
      "¿Rechazar usuario?",
      `¿Estás seguro de que deseas rechazar a ${notificacion.datos?.nombre}?`,
      async () => {
        try {
          setProcessingId(notificacion._id);
          await rechazarUsuarioDesdeNotificacion(
            notificacion._id,
            notificacion.idUsuario,
          );
          mostrarAlerta(
            "success",
            "Usuario rechazado",
            `${notificacion.datos?.nombre} ha sido rechazado`,
          );
          await loadNotificaciones();
        } catch (error) {
          manejarErrorApi(error, "Error al rechazar usuario");
        } finally {
          setProcessingId(null);
        }
      },
    );
  };

  // ─────────────────────────────────────────────────────────
  // HELPERS UI
  // ─────────────────────────────────────────────────────────
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "nuevo_registro":
        return <User className="w-5 h-5 text-slate-900 dark:text-slate-200" />;
      case "nueva_postulacion":
        return <User className="w-5 h-5 text-slate-900 dark:text-slate-200" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400 dark:text-slate-500" />;
    }
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Overlay ──────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-black/25 dark:bg-black/50 z-40"
        onClick={onClose}
      />

      {/* ── Panel ────────────────────────────────────────── */}
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-96
                      bg-white dark:bg-slate-800
                      shadow-2xl z-50
                      flex flex-col
                      transition-transform duration-300 ease-in-out"
      >
        {/* ── Header ───────────────────────────────────── */}
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-900 dark:from-blue-700 dark:to-blue-900/5
                        px-4 py-4 text-white flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              <h2 className="text-xl font-bold text-white">Notificaciones</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors
                         hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            {notificaciones.length} pendiente
            {notificaciones.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Contenido ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading */}
          {loading && <Loader size="md" />}

          {/* Vacío */}
          {!loading && notificaciones.length === 0 && (
            <EmptyState
              icon={Bell}
              title="No hay notificaciones"
              description="Todo está al día"
              iconColor="text-gray-300 dark:text-slate-600"
            />
          )}

          {/* Lista */}
          {!loading && notificaciones.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {notificaciones.map((notif) => (
                <div
                  key={notif._id}
                  className="p-4 transition-colors hover:bg-blue-500/50 dark:hover:bg-blue-800/50"
                >
                  <div className="flex items-start gap-3">
                    {/* Ícono tipo */}
                    <div className="flex-shrink-0 mt-1">
                      {getTipoIcon(notif.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Nombre + badge rol */}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-slate-100">
                          {notif.datos?.nombre || "Usuario"}
                        </p>
                        <StatusBadge status={notif.tipoUsuario} />
                      </div>

                      {/* Info */}
                      <div
                        className="space-y-1 text-sm
                                      text-gray-600 dark:text-slate-400"
                      >
                        <p className="flex items-center gap-1">
                          <span
                            className="font-medium
                                           text-gray-700 dark:text-slate-300"
                          >
                            Email:
                          </span>
                          <span className="truncate">{notif.datos?.email}</span>
                        </p>

                        {notif.datos?.cedula && (
                          <p className="flex items-center gap-1">
                            <span
                              className="font-medium
                                             text-gray-700 dark:text-slate-300"
                            >
                              Cédula:
                            </span>
                            <span>{notif.datos.cedula}</span>
                          </p>
                        )}

                        {notif.datos?.partido && (
                          <p className="flex items-center gap-1">
                            <span
                              className="font-medium
                                             text-gray-700 dark:text-slate-300"
                            >
                              Partido:
                            </span>
                            <span>{notif.datos.partido}</span>
                          </p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <p
                        className="flex items-center gap-1 text-xs
                                    text-gray-400 dark:text-slate-500"
                      >
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString("es-ES")}
                      </p>

                      {/* Botones Aprobar / Rechazar */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleAprobar(notif)}
                          disabled={processingId === notif._id}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          {processingId === notif._id
                            ? "Procesando..."
                            : "Aprobar"}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRechazar(notif)}
                          disabled={processingId === notif._id}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          {processingId === notif._id
                            ? "Procesando..."
                            : "Rechazar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
