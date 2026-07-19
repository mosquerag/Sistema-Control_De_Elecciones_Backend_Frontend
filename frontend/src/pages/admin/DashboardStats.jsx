

import { Vote, CheckCircle, Users, TrendingUp, BarChart3, LayoutList, Crown } from "lucide-react";


const DashboardStats = ({ stats }) => {
  const statsDisplay = [
    {
      title: "Total Tipo Elecciones",
      value: stats?.totalTipoElecciones || 0,
      icon: <LayoutList className="w-6 h-6 md:w-8 md:h-8" />,
      gradient: "from-violet-500 to-violet-600",
      bgGradient: "from-violet-500/10 to-violet-600/10",
    },
    {
      title: "Total Elecciones",
      value: stats?.totalElecciones || 0,
      icon: <Vote className="w-6 h-6 md:w-8 md:h-8" />,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      title: "Elecciones Activas",
      value: stats?.eleccionesActivas || 0,
      icon: <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/10",
    },
    {
      title: "Total Candidatos",
      value: stats?.totalCandidatos || 0,
      icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10",
    },
    {
      title: "Total Ciudadanos",
      value: stats?.totalCiudadanos || 0,
      icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/10 to-red-600/10",
    },
    {
      title: "Total Administradores",
      value: stats?.totalAdministradores || 0,
      icon: <Crown className="w-6 h-6 md:w-8 md:h-8" />,  // ← Crown
      gradient: "from-yellow-500 to-amber-600",
      bgGradient: "from-yellow-500/10 to-amber-600/10",
    },
    {
      title: "Votos Registrados",
      value: stats?.totalVotos || 0,
      icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/10 to-rose-600/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
      {statsDisplay.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-blue-400/80 dark:bg-blue-900/90 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          ></div>

          {/* Contenido */}
          <div className="relative z-10">
            {/* Icono con gradient */}
            <div
              className={`inline-flex p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              {stat.icon}
            </div>

            {/* Valor */}
            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1">
              {stat.value}
            </div>

            {/* Título */}
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {stat.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
