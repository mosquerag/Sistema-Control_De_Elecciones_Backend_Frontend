import {
  CheckCircle,
  Mail,
  Phone,
  FileText,
  Shield,
  DollarSign,
  BookOpen,
  Newspaper,
  Award,
  Headphones,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";

const Footer = () => {
  return (
    <footer
      id="contacto"
      className="w-full bg-blue-900/80  dark:bg-blue-950 border-t border-slate-700 dark:border-slate-800 text-white"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Grid principal ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-bold text-white">VoteSecure</span>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed mb-4">
              La plataforma líder en gestión de votaciones seguras y
              transparentes.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-blue-200 hover:bg-blue-600 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-blue-700" />
                </button>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2">
              {[
                { icon: FileText, label: "Características" },
                { icon: Shield, label: "Seguridad" },
                { icon: DollarSign, label: "Precios" },
                { icon: BookOpen, label: "Documentación" },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a className="flex items-center gap-2 text-sm text-slate-200 hover:text-blue-400 transition-colors cursor-pointer">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Recursos
            </h4>
            <ul className="space-y-2">
              {[
                { icon: Newspaper, label: "Blog" },
                { icon: Award, label: "Casos de Éxito" },
                { icon: Headphones, label: "Soporte" },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a className="flex items-center gap-2 text-sm text-slate-200 hover:text-blue-400 transition-colors cursor-pointer">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-100 hover:text-blue-400 transition-colors cursor-pointer">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                info@votesecure.com
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-100 hover:text-blue-400 transition-colors cursor-pointer">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                +1 (555) 123-4567
              </li>
            </ul>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 border border-emerald-700/40">
              <Shield className="w-3.5 h-3.5 text-emerald-200" />
              <span className="text-xs text-emerald-400 font-medium">
                Plataforma certificada
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer bottom ── */}
        <div className="border-t border-slate-600 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-100">
            © VoteSecure. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {["Privacidad", "Términos", "Cookies"].map((item) => (
              <a
                key={item}
                className="text-xs text-slate-100 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
