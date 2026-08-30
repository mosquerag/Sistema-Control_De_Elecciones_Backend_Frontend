import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Envía un correo genérico
 */
export const enviarCorreo = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn(
      "⚠️ EMAIL_USER / EMAIL_APP_PASSWORD no configurados — correo no enviado.",
    );
    return { enviado: false, motivo: "NO_CONFIGURADO" };
  }

  try {
    await transporter.sendMail({
      from: `"VoteSecure" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { enviado: true };
  } catch (error) {
    console.error("Error al enviar correo:", error.message);
    return { enviado: false, motivo: error.message };
  }
};

export const notificarNuevoAdminGoogle = async (adminsExistentes, nuevoAdmin) => {
  if (!adminsExistentes || adminsExistentes.length === 0) return;

  const destinatarios = adminsExistentes.map((a) => a.email).join(",");

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1e3a8a;">Nuevo administrador registrado</h2>
      <p>Se registró un nuevo administrador en VoteSecure usando su cuenta de Google:</p>
      <ul>
        <li><strong>Nombre:</strong> ${nuevoAdmin.nombre}</li>
        <li><strong>Correo:</strong> ${nuevoAdmin.email}</li>
      </ul>
      <p>Su cuenta ya está <strong>activa</strong> (los administradores registrados con Google no requieren aprobación). Este correo es solo informativo.</p>
    </div>
  `;

  return enviarCorreo({
    to: destinatarios,
    subject: "Nuevo administrador registrado con Google — VoteSecure",
    html,
  });
};
/**
 * Notifica AL PROPIO admin que se acaba de registrar con Google.
 * Su cuenta queda activa de inmediato (sin aprobación).
 */
export const notificarRegistroGoogleAlUsuario = async (usuario) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1e3a8a;">¡Bienvenido a VoteSecure!</h2>
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Tu cuenta de administrador fue creada exitosamente usando tu cuenta de Google (<strong>${usuario.email}</strong>) y ya está <strong>activa</strong>.</p>
      <p>La próxima vez que inicies sesión te pediremos completar algunos datos que Google no nos proporciona (como tu cédula y teléfono).</p>
      <p style="color:#6b7280; font-size: 13px;">Si no reconoces esta actividad, contacta al equipo de soporte de inmediato.</p>
    </div>
  `;
  return enviarCorreo({
    to: usuario.email,
    subject: "Tu cuenta de administrador fue creada — VoteSecure",
    html,
  });
};

/**
 * Notifica AL PROPIO admin cada vez que inicia sesión con Google.
 */
export const notificarLoginGoogleAlUsuario = async (usuario) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1e3a8a;">Nuevo inicio de sesión detectado</h2>
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Se inició sesión en tu cuenta de administrador de VoteSecure usando tu cuenta de Google el ${new Date().toLocaleString("es-DO")}.</p>
      <p style="color:#6b7280; font-size: 13px;">Si no fuiste tú, cambia tu contraseña de Google y contacta al equipo de soporte de inmediato.</p>
    </div>
  `;
  return enviarCorreo({
    to: usuario.email,
    subject: "Inicio de sesión con Google — VoteSecure",
    html,
  });
};

/**
 * Envía el enlace para restablecer contraseña AL CORREO del usuario.
 * El token nunca se devuelve en la respuesta del API — solo viaja por correo.
 */
export const enviarCorreoResetPassword = async (usuario, resetToken) => {
  const enlace = `${process.env.FRONTEND_URL}/forgot-password?token=${resetToken}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1e3a8a;">Restablecer contraseña</h2>
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Solicitaste restablecer tu contraseña en VoteSecure. Haz clic en el siguiente enlace para continuar:</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="${enlace}" style="background:#1e3a8a; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
          Restablecer mi contraseña
        </a>
      </p>
      <p style="color:#6b7280; font-size: 13px;">Este enlace vence en 5 minutos. Si no solicitaste este cambio, ignora este correo — tu contraseña seguirá siendo la misma.</p>
    </div>
  `;
  return enviarCorreo({
    to: usuario.email,
    subject: "Restablece tu contraseña — VoteSecure",
    html,
  });
};