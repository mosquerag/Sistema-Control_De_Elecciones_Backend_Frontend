function Caracteristicas() {
  const features = [
    {
      title: "Seguridad Garantizada",
      description:
        "Encriptación de extremo a extremo y verificación de identidad para máxima seguridad.",
      img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    },
    {
      title: "Resultados en Tiempo Real",
      description:
        "Visualiza estadísticas y resultados actualizados instantáneamente.",
      img: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&q=80",
    },
    {
      title: "Alcance Global",
      description:
        "Gestiona votaciones nacionales e internacionales desde una sola plataforma.",
      img: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800&q=80",
    },
    {
      title: "Multiusuario",
      description:
        "Sistema robusto para administradores, supervisores y votantes.",
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    },
  ];

  return (
    <section
      id="caracteristicas"
      className="py-10 bg-blue-400/95 dark:bg-blue-900/80"
    >
      <div className="mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white dark:text-gray-100 mb-6">
          ¿Por qué elegir VoteSecure?
        </h2>

        <p className="max-w-2xl mx-auto mb-12 text-slate-100 dark:text-slate-200">
          Nuestra plataforma ofrece herramientas avanzadas para garantizar
          procesos electorales seguros y transparentes.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-blue-900 dark:bg-blue-950 border border-blue-400/50 hover:scale-105 transition duration-300"
            >
              <img
                src={f.img}
                alt={f.title}
                className="w-full h-52 object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white dark:text-blue-400 mb-4">
                  {f.title}
                </h3>

                <p className="text-slate-100 dark:text-slate-200 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Caracteristicas;
