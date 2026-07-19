import { useEffect, useState } from "react";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { confirmarAccion, mostrarAlerta } from "@/utils/alertas";
import { getNotificaciones } from "@/api/notificaciones";
import Modal from "./Modal";
import DetallesUsuarios from "@/pages/admin/DetallesUsuarios";
import { NotificationPanel } from "./NotificationPanel";
import { ConfiguracionPerfil } from "@/pages/perfil/ConfiguracionPerfil";
import ThemeToggle from "../ThemeToggle";
import Avatar from "@/components/common/Avatar";

export function TopBar({ userData, isMobile, onMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [perfilModalOpen, setPerfilModalOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [configuracionModalOpen, setConfiguracionModalOpen] = useState(false);

  // Cargar contador de notificaciones (solo admin)
  useEffect(() => {
    const loadNotificationCount = async () => {
      if (user?.rol !== "admin") return;
      try {
        const response = await getNotificaciones();
        const notifs = response.data || response;
        const pendientes = notifs.filter(
          (n) =>
            !n.procesada &&
            (n.tipo === "nuevo_registro" || n.tipo === "nueva_postulacion"),
        );
        setNotificationCount(pendientes.length);
      } catch (error) {
        console.error("Error al cargar contador de notificaciones:", error);
      }
    };
    loadNotificationCount();
  }, [user?.rol]);

  // Recargar contador al cerrar panel
  const handleCloseNotificationPanel = async () => {
    setNotificationPanelOpen(false);
    try {
      const response = await getNotificaciones();
      const notifs = response.data || response;
      const pendientes = notifs.filter(
        (n) =>
          !n.procesada &&
          (n.tipo === "nuevo_registro" || n.tipo === "nueva_postulacion"),
      );
      setNotificationCount(pendientes.length);
    } catch (error) {
      console.error("Error al recargar contador:", error);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    confirmarAccion(
      "¿Cerrar sesión?",
      "¿Estás seguro de que deseas cerrar sesión?",
      () => {
        logout();
        mostrarAlerta(
          "success",
          "Sesión cerrada",
          "Sesión cerrada correctamente",
        );
        setTimeout(() => navigate("/"), 2000);
      },
    );
  };

  return (
    <>
      {/* ── Barra principal ─────────────────────────────────────────── */}
      <div
        className="
        bg-white dark:bg-slate-900
        shadow-sm border-b border-slate-200 dark:border-slate-800
        px-2 md:px-8 py-3 md:py-1
        sticky top-0 z-20
      "
      >
        <div className="flex items-center justify-between">
          {/* Botón hamburguesa móvil */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isMobile && (
              <button
                onClick={onMenuToggle}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700
                           rounded-lg transition-colors duration-200 md:hidden"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Notificaciones — solo admin */}
            {user?.rol === "admin" && (
              <button
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                className="relative p-2 hover:bg-blue-500/50 dark:hover:bg-blue-800/50
                           rounded-lg transition-colors duration-200"
              >
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-700 dark:text-blue-300" />
                {notificationCount > 0 && (
                  <span
                    className="
                    absolute top-1 right-1
                    min-w-[18px] h-[18px]
                    bg-red-500 text-white text-xs font-bold
                    rounded-full flex items-center justify-center px-1
                  "
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* ── THEME TOGGLE ────────────────────────────────────── */}
            <ThemeToggle variant="icon" />

            {/* Separador visual */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 md:space-x-3
                           hover:bg-slate-100 dark:hover:bg-slate-700
                           rounded-xl px-3 py-1 transition-all duration-200"
              >
                {/* Avatar con iniciales */}
                <div className="relative flex-shrink-0">
                  <div className="relative flex-shrink-0">
                    <Avatar
                      nombre={user?.nombre}
                      foto={user?.fotoPerfil}
                      size="sm"
                      gradient="from-blue-900 to-slate-500"
                    />
                    {userData.isOnline && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                     bg-green-400 rounded-full border-2 border-green-500 dark:border-slate-800"
                      />
                    )}
                  </div>
                  {userData.isOnline && (
                    <div
                      className="
                      absolute -bottom-0.5 -right-0.5
                      w-3 h-3 bg-green-400 rounded-full
                      border-2 border-slate-200 dark:border-slate-800
                    "
                    />
                  )}
                </div>

                {/* Nombre y rol */}
                <div className="text-left hidden sm:block min-w-0">
                  <p className="font-bold text-blue-900 dark:text-blue-400 text-sm truncate">
                    {user?.nombre || userData.name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                    {user?.rol}
                  </p>
                </div>

                {/* Chevron */}
                <svg
                  className={`
                    w-3 h-3 md:w-4 md:h-4 text-slate-400 dark:text-slate-500
                    transition-transform duration-200 hidden sm:block
                    ${profileMenuOpen ? "rotate-180" : ""}
                  `}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* ── Dropdown ──────────────────────────────────────── */}
              {profileMenuOpen && (
                <div
                  className="
                  absolute right-0 top-full mt-2 w-56 md:w-64
                  bg-white dark:bg-slate-800
                  rounded-2xl shadow-2xl
                  border border-slate-200 dark:border-slate-800
                  py-2 z-50 animate-slide-down
                "
                >
                  {/* Header dropdown */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        nombre={user?.nombre}
                        foto={user?.fotoPerfil}
                        size="sm"
                        gradient="from-blue-900 to-slate-500"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                          {user?.nombre || userData.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.rol}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setPerfilModalOpen(true);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5
                                 hover:bg-slate-50 dark:hover:bg-slate-700
                                 transition-colors duration-150"
                    >
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200 text-left">
                        Ver perfil
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setConfiguracionModalOpen(true);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5
                                 hover:bg-slate-50 dark:hover:bg-slate-700
                                 transition-colors duration-150"
                    >
                      <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200 text-left">
                        Configuración de cuenta
                      </span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-200 dark:border-slate-800 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5
                                 hover:bg-red-50 dark:hover:bg-red-900/30
                                 transition-colors duration-150 group"
                    >
                      <LogOut
                        className="w-5 h-5 text-slate-600 dark:text-slate-400
                                         group-hover:text-red-600 dark:group-hover:text-red-400
                                         flex-shrink-0 transition-colors"
                      />
                      <span
                        className="text-sm text-slate-700 dark:text-slate-200
                                       group-hover:text-red-600 dark:group-hover:text-red-400
                                       text-left font-medium transition-colors"
                      >
                        Cerrar sesión
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal perfil */}
      <Modal
        isOpen={perfilModalOpen}
        onClose={() => setPerfilModalOpen(false)}
        title="Mi Perfil"
      >
        <DetallesUsuarios
          usuario={{
            nombre: user?.nombre,
            email: user?.email,
            cedula: user?.cedula,
            rol: user?.rol,
            activo: user?.activo,
            fotoPerfil: user?.fotoPerfil,
          }}
        />
      </Modal>

      {/* Overlay para cerrar menú de perfil */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}

      {/* Panel de notificaciones */}
      {user?.rol === "admin" && (
        <NotificationPanel
          isOpen={notificationPanelOpen}
          onClose={handleCloseNotificationPanel}
          onNotificationCountChange={setNotificationCount}
        />
      )}

      {/* Modal configuración */}
      {configuracionModalOpen && (
        <ConfiguracionPerfil
          onClose={() => setConfiguracionModalOpen(false)}
          onCancel={() => setConfiguracionModalOpen(false)}
        />
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
      `}</style>
    </>
  );
}
