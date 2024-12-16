require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json()); // Middleware para leer JSON

// Carga las variables desde el archivo .env
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const PORT = process.env.PORT || 3000;

// Endpoint para recuperación de contraseña
app.post("/password-recovery", async (req, res) => {
  const { email } = req.body;

  // Validar que el email esté presente
  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido." });
  }

  // Generar el enlace de recuperación
  const recoveryLink = `https://tusitio.com/reset-password?email=${encodeURIComponent(email)}`;

  try {
    // Petición a la API de Mailersend
    const response = await axios.post(
      "https://api.mailersend.com/v1/email",
      {
        from: {
          email: FROM_EMAIL,
          name: "Soporte",
        },
        to: [{ email }], // Correo del destinatario
        subject: "Recuperación de contraseña",
        html: `
          <h3>Recuperación de Contraseña</h3>
          <p>Hola,</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${recoveryLink}">${recoveryLink}</a>
          <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${MAILERSEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Correo enviado a: ${email}`);
    res.status(200).json({
      message: "Correo de recuperación enviado con éxito.",
      link: recoveryLink, // Útil para pruebas
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error.response?.data || error.message);
    res.status(500).json({ message: "Error al enviar el correo." });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
