import { Outlet } from "react-router-dom";
import PageLayout from "@/components/common/PageLayout";
import { ROUTES } from "@/utils/constants";
import { Home as HomeIcon, Vote } from "lucide-react";

const sidebarMenuItems = [
  {
    id: "home",
    label: "Inicio",
    icon: <HomeIcon className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.DASHBOARD_CANDIDATO,
  },
  {
    id: "resultados",
    label: "Mis Resultados",
    icon: <Vote className="w-5 h-5 flex-shrink-0" />,
    route: ROUTES.MIS_RESULTADOS,
  },
];

export default function CandidatoLayout() {
  return (
    <PageLayout menuItems={sidebarMenuItems} activeSection="home">
      <Outlet />
    </PageLayout>
  );
}