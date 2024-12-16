const jsonServer = require("json-server");
const server = jsonServer.create();
const cors = require("cors");
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;
const nodemailer = require("nodemailer");

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Configura Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Usa "gmail" para enviar con Gmail
  auth: {
    user: "tuemail@gmail.com", // Coloca tu correo
    pass: "tupassword" // Coloca tu contraseña o App Password de Gmail
  }
});

// Ruta para recuperar contraseña
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
    from: "tuemail@gmail.com",
    to: email,
    subject: "Recuperación de contraseña",
    text: `Hola, \n\nHaz clic en el siguiente enlace para recuperar tu contraseña:\n${recoveryLink}\n\nSi no solicitaste esto, ignora este mensaje.`
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).json({ message: "Error al enviar el correo electrónico." });
    }
    console.log("Correo enviado:", info.response);
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
