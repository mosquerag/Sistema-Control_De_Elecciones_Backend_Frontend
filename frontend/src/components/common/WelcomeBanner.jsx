
const WelcomeBanner = ({
  nombre = "Usuario",
  subtitle = "Tu voz importa. ¡Ejerce tu derecho al voto!",
}) => {
  return (
    <div className="text-center text-white mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-slate-100 mb-2">
        Bienvenido, {nombre}
      </h1>
      <p className="text-lg text-blue-700 dark:text-blue-400">{subtitle}</p>
    </div>
  );
};

export default WelcomeBanner;
