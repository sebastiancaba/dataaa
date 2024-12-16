const nodemailer = require("nodemailer");

// Configura el transporte (usa tu proveedor de correo SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail", // Ejemplo: Gmail SMTP
  auth: {
    user: "tuemail@gmail.com", // Coloca tu correo
    pass: "tucontraseña", // Coloca tu contraseña o App Password
  },
});

// Ruta para enviar el enlace de recuperación
server.post("/password-recovery", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido." });
  }

  // Buscar el usuario en la base de datos
  const users = router.db.get("usuarios").value();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "El correo electrónico no está registrado." });
  }

  // Simular enlace de recuperación
  const recoveryLink = `https://tusitio.com/reset-password?email=${email}`;

  // Configurar el correo
  const mailOptions = {
    from: "tuemail@gmail.com", // Correo remitente
    to: email, // Correo destinatario
    subject: "Recuperación de Contraseña",
    text: `Hola, \n\nHaz clic en el siguiente enlace para recuperar tu contraseña:\n\n${recoveryLink}\n\nSi no solicitaste este correo, ignóralo.`,
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).json({ message: "Error al enviar el correo electrónico." });
    }
    console.log("Correo enviado:", info.response);
    res.status(200).json({ message: "Se ha enviado un enlace de recuperación al correo electrónico proporcionado." });
  });
});
