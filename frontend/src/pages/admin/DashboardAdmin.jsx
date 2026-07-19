/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: DashboardAdmin.jsx
 * UBICACIÓN: /frontend/src/pages/admin/DashboardAdmin.jsx
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { getElecciones } from "@/api/elecciones";
import { getCandidatos } from "@/api/candidatos";
import { getVotos } from "@/api/votos";
import { getTiposEleccion } from "@/api/tiposElecciones";
import { getUsuariosByRol } from "@/api/usuarios";
import DashboardStats from "./DashboardStats";
import Loader from "@/components/common/Loader";
import ActionCard from "@/components/common/ActionCard";
import WelcomeBanner from "@/components/common/WelcomeBanner";
import { ConfiguracionPerfil } from "../perfil/ConfiguracionPerfil";
import { alertaPerfilPendiente } from "@/utils/alertas";
import { ROUTES } from "@/utils/constants";
import {
  Vote,
  Users,
  BarChart3,
  FileText,
  UserCheck,
  Shield,
} from "lucide-react";


const MENU_ITEMS = [
  {
    id: "tipos",
    title: "Tipos de Elección",
    desc: "Gestionar categorías de elecciones",
    icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.GESTION_TIPOS_ELECCION,
  },
  {
    id: "elecciones",
    title: "Gestionar Elecciones",
    desc: "Crear y administrar elecciones",
    icon: <Vote className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.GESTION_ELECCIONES,
  },
  {
    id: "stats",
    title: "Estadísticas",
    desc: "Ver resultados y análisis",
    icon: <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.ESTADISTICAS_ADMIN,
  },
  {
    id: "candidatos",
    title: "Gestionar Candidatos",
    desc: "Registrar y administrar candidatos",
    icon: <UserCheck className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.GESTION_CANDIDATOS,
  },
  {
    id: "ciudadanos",
    title: "Gestionar Ciudadanos",
    desc: "Registrar y administrar ciudadanos",
    icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.GESTION_CIUDADANOS,
  },
  {
    id: "administradores",
    title: "Gestionar administradores",
    desc: "Registrar y administrar Administradores",
    icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.GESTION_ADMINISTRADORES,
  },
  {
    id: "usuarios",
    title: "Gestionar Usuarios",
    desc: "Ver y administrar usuarios del sistema",
    icon: <Shield className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.GESTION_USUARIOS,
  },
];

export default function DashboardAdmin() {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarConfiguracion, setMostrarConfig] = useState(false);

  // Abrir perfil si viene del login con perfilPendiente
  useEffect(() => {
    if (location.state?.abrirConfiguracion) {
      setMostrarConfig(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  useEffect(() => {
    const loadStats = async () => {
      try {

        const [eleccionesRes, candidatosRes, votosRes, usuariosRes, tiposRes, adminsRes] =
        await Promise.all([
          getElecciones(),
          getCandidatos(),
          getVotos(),
          getUsuariosByRol("ciudadano"),
          getTiposEleccion(),
          getUsuariosByRol("admin"),  // ← nuevo
        ]);

        // ✅ Extracción correcta considerando { success, data }
        const elecciones = eleccionesRes.data?.data || eleccionesRes.data || [];
        const candidatos = candidatosRes.data?.data || candidatosRes.data || [];
        const votos = votosRes.data?.data || votosRes.data || [];
        const ciudadanos = usuariosRes.data?.data || usuariosRes.data || [];
        const tiposEleccion = tiposRes.data?.data || tiposRes.data || [];
        const admins = adminsRes.data?.data || adminsRes.data || [];

        setStats({
          totalElecciones: elecciones.length,
          eleccionesActivas: elecciones.filter((e) => e.activa).length,
          totalCandidatos: candidatos.length,
          totalCiudadanos: ciudadanos.length,
          totalAdministradores: admins.length,
          totalVotos: votos.length,
          totalTipoElecciones: tiposEleccion.length,
        });
      } catch {
        // Stats queda null, DashboardStats muestra 0
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleCloseConfig = () => {
    const userActual = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userActual.perfilPendiente) {
      setMostrarConfig(false);
    } else {
      alertaPerfilPendiente(userActual.rol);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <WelcomeBanner
        nombre={user?.nombre}
        subtitle="Ejecuta y administra elecciones de manera eficiente"
      />
      <DashboardStats stats={stats} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {MENU_ITEMS.map((item) => (
          <ActionCard
            key={item.id}
            title={item.title}
            description={item.desc}
            icon={item.icon}
            route={item.route}
          />
        ))}
      </div>

      {mostrarConfiguracion && (
        <ConfiguracionPerfil onClose={handleCloseConfig} />
      )}
    </>
  );
}
