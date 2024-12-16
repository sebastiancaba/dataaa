const nodemailer = require("nodemailer");

// Configura el transporte de correo (ejemplo con Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail", // Usa "gmail" o tu proveedor SMTP
  auth: {
    user: "tuemail@gmail.com", // Tu correo electrónico
    pass: "tupassword", // Tu contraseña o App Password de Gmail
  },
});

server.post("/password-recovery", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido." });
  }

  // Simula búsqueda del usuario
  const users = router.db.get("usuarios").value();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "El correo electrónico no está registrado." });
  }

  // Configura el correo
  const recoveryLink = `https://tusitio.com/reset-password?email=${email}`;
  const mailOptions = {
    from: "tuemail@gmail.com", // Correo del remitente
    to: email, // Correo del destinatario
    subject: "Recuperación de contraseña",
    text: `Hola,\n\nHaz clic en el siguiente enlace para recuperar tu contraseña:\n${recoveryLink}\n\nSi no solicitaste esto, ignora este mensaje.`,
  };

  // Envía el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).json({ message: "Error al enviar el correo electrónico." });
    }
    console.log("Correo enviado:", info.response);
    res.status(200).json({ message: "Se ha enviado un enlace de recuperación al correo electrónico proporcionado." });
  });
});
