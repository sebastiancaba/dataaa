require("dotenv").config();
const express = require("express");
const { MailerSend, EmailParams, Recipient } = require("@mailersend/sdk");

const app = express();
app.use(express.json());

// Configura Mailersend con la API Key desde .env
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY, // Variable segura
});

// Endpoint de recuperación de contraseña
app.post("/password-recovery", async (req, res) => {
  const { email } = req.body; // Recibe el correo del usuario

  // Validar que el email esté presente
  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido." });
  }

  // Generar un enlace de recuperación (dinámico)
  const recoveryLink = `https://tusitio.com/reset-password?email=${encodeURIComponent(email)}`;

  try {
    // Configuración del correo
    const emailParams = new EmailParams()
      .setFrom("no-reply@trial-3yxj6ljr2904do2r.mlsender.net") // Usa el remitente verificado
      .setFromName("Soporte") // Nombre visible del remitente
      .setRecipients([new Recipient(email, "Usuario")]) // Correo dinámico
      .setSubject("Recuperación de contraseña")
      .setHtml(`
        <h3>Recuperación de Contraseña</h3>
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${recoveryLink}">Restablecer contraseña</a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `);

    // Envía el correo
    await mailerSend.email.send(emailParams);
    console.log(`Correo enviado a: ${email}`);
    res.status(200).json({
      message: "Correo de recuperación enviado con éxito.",
      link: recoveryLink, // Opcional: devuelve el enlace para verificar en pruebas
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo de recuperación." });
  }
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
