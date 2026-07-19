function Actividad() {
  return (
    <section
      id="actividad"
      className="w-full flex flex-col items-center justify-center p-0 space-y-10 py-12 mt-0 bg-slate-800 dark:bg-slate-700 text-white">
      <div className=" w-full  mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
        <div>
          <p className="text-5xl font-bold mb-2">150+</p>
          <p className="text-blue-100">Países Activos</p>
        </div>
        <div>
          <p className="text-5xl font-bold mb-2">10M+</p>
          <p className="text-blue-100">Votos Registrados</p>
        </div>
        <div>
          <p className="text-5xl font-bold mb-2">99.9%</p>
          <p className="text-blue-100">Tiempo de Actividad</p>
        </div>
      </div>
    </section>
  );
}
export default Actividad;
