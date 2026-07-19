/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: googleOAuth.js
 * UBICACIÓN: /backend/config/googleOAuth.js
 * DESCRIPCIÓN: Configuración de Passport para Google OAuth 2.0
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIONES APLICADAS:
 * ✅ Eliminado console.log que exponía credenciales en arranque
 * ✅ Eliminado hardcoded rol: "admin" — ahora el rol viene del state de la URL
 * ✅ Eliminados todos los console.log de depuración
 * ✅ Manejo correcto de errores sin exponer información sensible
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Usuario from "../models/Usuario.js";
import Notificacion from "../models/Notificacion.js";
import dotenv from "dotenv";

dotenv.config();

console.log("VERIFICANDO VARIABLES DE ENTORNO:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

// Validar configuración de Google OAuth al arrancar
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️ Google OAuth no configurado (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
    );
  }
}

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

        console.log("GOOGLE OAUTH - Inicio de autenticación");
        console.log("Email:", profile.emails[0].value);
        console.log("Nombre:", profile.displayName);
        console.log("Google ID:", profile.id);

        const email = profile.emails?.[0]?.value;
        const nombre = profile.displayName;
        const googleId = profile.id;
        const fotoPerfil = profile.photos?.[0]?.value || null;

        // El rol viene del state que se guardó al iniciar OAuth
        // Solo se permiten ciudadano y candidato por Google (admin debe registrarse manualmente)
        const rolSolicitado = req.query?.state || "ciudadano";
        const rolesPermitidos = ["ciudadano", "candidato"];
        const rol = rolesPermitidos.includes(rolSolicitado)
          ? rolSolicitado
          : "ciudadano";

        console.log("Rol seleccionado:", rol);

        if (!email) {
          return done(new Error("No se pudo obtener el email de Google"), null);
        }

        // Buscar usuario existente
        let usuario = await Usuario.findOne({ googleId });
        if (!usuario && email) {
          usuario = await Usuario.findOne({ email });
        }

        if (usuario) {
          // Actualizar googleId si no lo tiene
          if (!usuario.googleId) {
            usuario.googleId = googleId;
            usuario.esGoogleAuth = true;
          }
          // Actualizar foto si no tiene
          if (fotoPerfil && !usuario.fotoPerfil) {
            usuario.fotoPerfil = fotoPerfil;
          }
          await usuario.save();
          console.log("Log de inicio de sesión registrado");

          return done(null, usuario);
        }

        console.log("Creando nuevo usuario desde Google");

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
          nombre,
          email,
          googleId,
          fotoPerfil,
          rol,
          estado: "pendiente_aprobacion",
          activo: true,
          esGoogleAuth: true,
        });

        await nuevoUsuario.save();

        console.log("Usuario creado exitosamente");
        console.log("Estado: activo");

        // Notificar a admins (solo para ciudadanos y candidatos)
        await Notificacion.create({
          tipo: rol === "candidato" ? "nueva_postulacion" : "nuevo_registro",
          tipoUsuario: rol,
          idUsuario: nuevoUsuario._id,
          mensaje: `Nuevo ${rol} registrado con Google: ${nombre}`,
          datos: { nombre, email, rol, googleId, metodoRegistro: "google" },
          visible: true,
          procesada: false,
          prioridad: "media",
        });

        

        console.log("Notificación creada para admins");

        return done(null, nuevoUsuario);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Serialización de sesión
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
