/**
 * ARCHIVO: DashboardCandidato.jsx
 * UBICACIÓN: /frontend/src/pages/candidato/DashboardCandidato.jsxa
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import Loader from "@/components/common/Loader";
import ActionCard from "@/components/common/ActionCard";
import WelcomeBanner from "@/components/common/WelcomeBanner";
// import { ConfiguracionPerfil } from "@/components/perfil/ConfiguracionPerfil";
import { ConfiguracionPerfil } from "../perfil/ConfiguracionPerfil";
import { alertaPerfilPendiente } from "@/utils/alertas";
import { ROUTES } from "@/utils/constants";
import { BarChart3 } from "lucide-react";

const MENU_ITEMS = [
  {
    id: "resultados",
    title: "Ver Mis Resultados",
    desc: "Consultar los resultados de las elecciones en las que participas",
    icon: <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />,
    route: ROUTES.MIS_RESULTADOS,
  },
];

const DashboardCandidato = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [mostrarConfig, setMostrarConfig] = useState(false);

  useEffect(() => {
    if (location.state?.abrirConfiguracion) {
      setMostrarConfig(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCloseConfig = () => {
    const userActual = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userActual.perfilPendiente) {
      setMostrarConfig(false);
    } else {
      alertaPerfilPendiente(userActual.rol);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <WelcomeBanner
        nombre={user?.nombre}
        subtitle="Gestiona y visualiza tus resultados de manera eficiente"
      />
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

      {mostrarConfig && <ConfiguracionPerfil onClose={handleCloseConfig} />}
    </>
  );
};

export default DashboardCandidato;
