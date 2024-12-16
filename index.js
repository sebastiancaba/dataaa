const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Configuración de CORS
app.use(cors({
  origin: "http://localhost:8100", // Permite solicitudes desde tu frontend
  methods: ["POST", "GET"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"] // Encabezados permitidos
}));

app.use(express.json());

// Endpoint de recuperación de contraseña
app.post("/password-recovery", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido." });
  }

  const recoveryLink = `https://tusitio.com/reset-password?email=${encodeURIComponent(email)}`;

  try {
    await axios.post(
      "https://api.mailersend.com/v1/email",
      {
        from: { email: "se.caba@duocuc.cl", name: "Soporte" },
        to: [{ email }],
        subject: "Recuperación de contraseña",
        html: `
          <h3>Recuperación de Contraseña</h3>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${recoveryLink}">${recoveryLink}</a>
        `
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ message: "Correo enviado con éxito." });
  } catch (error) {
    console.error("Error al enviar el correo:", error.response?.data || error.message);
    res.status(500).json({ message: "Error al enviar el correo." });
  }
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
