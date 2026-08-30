import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Country } from "country-state-city";
import Usuario from "../models/Usuario.js";
import Notificacion from "../models/Notificacion.js";

import {
  notificarNuevoAdminGoogle,
  notificarRegistroGoogleAlUsuario,
  notificarLoginGoogleAlUsuario,
} from "../utils/mailer.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️ Google OAuth no configurado (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
    );
  }
}

/**
 * Deriva el nombre del país a partir del "locale" que entrega Google
 * (ej. "es-DO", "en-US"). Es una aproximación basada en la configuración
 * regional de la cuenta de Google, no una verificación de ubicación real.
 * Si no se puede determinar, devuelve null (se pedirá manualmente después).
 */
const obtenerPaisDesdeLocale = (locale) => {
  if (!locale || typeof locale !== "string") return null;
  const partes = locale.split(/[-_]/);
  if (partes.length < 2) return null; // ej. "es" solo, sin región

  const codigoPais = partes[1].toUpperCase();
  const pais = Country.getCountryByCode(codigoPais);
  return pais?.name || null;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, _accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const nombre = profile.displayName;
        const googleId = profile.id;
        const fotoPerfil = profile.photos?.[0]?.value || null;
        const locale = profile._json?.locale || null;
        const paisDetectado = obtenerPaisDesdeLocale(locale);

        if (!email) {
          return done(new Error("No se pudo obtener el email de Google"), null);
        }

        // Solo admin puede autenticarse con Google
        const rolSolicitado = req.query?.state;
        if (rolSolicitado !== "admin") {
          return done(
            new Error(
              "Este método de acceso solo está disponible para administradores.",
            ),
            null,
          );
        }

        // Buscar usuario existente (por googleId primero, luego por email)
        let usuario = await Usuario.findOne({ googleId });
        if (!usuario) {
          usuario = await Usuario.findOne({ email });
        }

        // ── CASO 1: el admin YA EXISTE → es un inicio de sesión ──────────
        if (usuario) {
          if (usuario.rol !== "admin") {
            return done(
              new Error(
                "Esta cuenta de correo ya existe con otro rol en el sistema.",
              ),
              null,
            );
          }
          if (!usuario.googleId) {
            usuario.googleId = googleId;
            usuario.esGoogleAuth = true;
          }
          if (fotoPerfil && !usuario.fotoPerfil) {
            usuario.fotoPerfil = fotoPerfil;
          }
          // Si nunca se pudo completar el país, se reintenta con el locale actual
          if (!usuario.pais && paisDetectado) {
            usuario.pais = paisDetectado;
          }
          await usuario.save();

          // Correo de aviso de inicio de sesión (no bloquea el login si falla)
          notificarLoginGoogleAlUsuario(usuario).catch((err) =>
            console.error(
              "Error enviando correo de aviso de login:",
              err.message,
            ),
          );

          return done(null, usuario);
        }

        // ── CASO 2: admin NUEVO → registro directo, sin aprobación ───────
        const nuevoAdmin = new Usuario({
          nombre,
          email,
          googleId,
          fotoPerfil,
          rol: "admin",
          estado: "activo", // aprobado automáticamente (solo Google + admin)
          activo: true,
          esGoogleAuth: true,
          fechaAprobacion: new Date(),
          pais: paisDetectado, // null si no se pudo determinar por el locale
          // Google no entrega cédula ni (a veces) país — se pide completar al primer login
          perfilPendiente: true,
        });

        await nuevoAdmin.save();

        // NO se crea notificación de tipo "nuevo_registro": esa es la que
        // dispara los botones Aprobar/Rechazar en la campanita, y este admin
        // ya quedó activo — no necesita revisión de nadie.

        // Correo de bienvenida/confirmación AL PROPIO admin nuevo
        notificarRegistroGoogleAlUsuario(nuevoAdmin).catch((err) =>
          console.error("Error enviando correo de bienvenida:", err.message),
        );

        // Aviso informativo por correo a los demás admins (ya activo, sin acción requerida)
        const adminsExistentes = await Usuario.find({
          rol: "admin",
          activo: true,
          _id: { $ne: nuevoAdmin._id },
        }).select("email");

        notificarNuevoAdminGoogle(adminsExistentes, nuevoAdmin).catch((err) =>
          console.error("Error enviando correo a otros admins:", err.message),
        );

        return done(null, nuevoAdmin);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((usuario, done) => {
  done(null, usuario._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id).select("-password");
    if (!usuario) return done(null, false);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

export default passport;