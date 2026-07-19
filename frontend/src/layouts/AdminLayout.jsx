

import { Outlet } from "react-router-dom";
import PageLayout from "@/components/common/PageLayout";
import { ROUTES } from "@/utils/constants";
import {
  LayoutDashboard,
  Vote,
  Users,
  BarChart3,
  FileText,
  UserCheck,
  Shield,
  Crown,
  // layoutList,
} from "lucide-react";

const sidebarMenuItems = [
  {
    id: "home",
    label: "Inicio",
    icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.DASHBOARD_ADMIN,
  },
  {
    id: "tipos-eleccion",
    label: "Tipos de Elección",
    icon: <FileText className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.GESTION_TIPOS_ELECCION,
  },
  {
    id: "elecciones",
    label: "Elecciones",
    icon: <Vote className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.GESTION_ELECCIONES,
  },
  {
    id: "estadisticas",
    label: "Estadísticas",
    icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.ESTADISTICAS_ADMIN,
  },
  {
    id: "candidatos",
    label: "Candidatos",
    icon: <UserCheck className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.GESTION_CANDIDATOS,
  },
  {
    id: "ciudadanos",
    label: "Ciudadanos",
    icon: <Users className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.GESTION_CIUDADANOS,
  },
  {
    id: "administradores",
    label: "Administradores",
    icon: <Crown className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.GESTION_ADMINISTRADORES,
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icon: <Shield className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.GESTION_USUARIOS,
  },
];

export default function AdminLayout() {
  return (
    <PageLayout menuItems={sidebarMenuItems} activeSection="home">
      <Outlet />
    </PageLayout>
  );
}
