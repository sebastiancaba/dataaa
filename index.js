// Importa y configura dotenv al inicio del archivo
require("dotenv").config();
console.log("Gmail Password Recovery API Key:", process.env.GMAIL_PASSWORD);

const jsonServer = require("json-server");
const server = jsonServer.create();
const cors = require("cors");
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

// Importa nodemailer
const nodemailer = require("nodemailer");

// Configura el transporte de nodemailer usando Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Correo electrónico de Gmail
    pass: process.env.GMAIL_PASSWORD // Contraseña o app password de Gmail
  }
});

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Ruta para recuperación de contraseña
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

  // Simular un enlace de recuperación
  const recoveryLink = `https://tusitio.com/reset-password?email=${email}`;

  // Configurar el correo
  const mailOptions = {
    from: process.env.GMAIL_USER, // Correo electrónico de origen
    to: email, // Correo del destinatario
    subject: "Recuperación de contraseña",
    text: `Hola, \n\nHaz clic en el siguiente enlace para recuperar tu contraseña:\n${recoveryLink}\n\nSi no solicitaste esto, ignora este mensaje.`,
    html: `
      <h3>Recuperación de Contraseña</h3>
      <p>Hola,</p>
      <p>Haz clic en el siguiente enlace para recuperar tu contraseña:</p>
      <a href="${recoveryLink}">${recoveryLink}</a>
      <p>Si no solicitaste esto, ignora este mensaje.</p>
    `
  };

  // Enviar el correo usando nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).json({ message: "Error al enviar el correo electrónico." });
    }
    console.log("Correo enviado con éxito a:", email);
    res.status(200).json({
      message: "Se ha enviado un enlace de recuperación al correo electrónico proporcionado.",
      link: recoveryLink
    });
  });
});

// Rutas existentes
server.use(router);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
