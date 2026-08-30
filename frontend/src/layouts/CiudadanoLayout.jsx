import { Outlet } from "react-router-dom";
import PageLayout from "@/components/common/PageLayout";
import { ROUTES } from "@/utils/constants";
import { Home as HomeIcon, Vote, Users, HelpCircle } from "lucide-react";

const sidebarMenuItems = [
  {
    id: "home",
    label: "Inicio",
    icon: <HomeIcon className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.DASHBOARD_CIUDADANO,
  },
  {
    id: "eleccionesActivas",
    label: "Elecciones Activas",
    icon: <Vote className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.ELECCIONES_ACTIVAS,
  },
  {
    id: "historialVotos",
    label: "Historial de Votos",
    icon: <Users className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.HISTORIAL_VOTOS,
  },
  {
    id: "ayuda",
    label: "Ayuda",
    icon: <HelpCircle className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.AYUDA_CIUDADANO
  },
];

export default function CiudadanoLayout() {
  return (
    <PageLayout menuItems={sidebarMenuItems} activeSection="home">
      <Outlet />
    </PageLayout>
  );
}
