require("dotenv").config(); // Importa y configura dotenv al inicio del archivo

const jsonServer = require("json-server");
const server = jsonServer.create();
const cors = require("cors");
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

// Importa SendGrid
const sgMail = require("@sendgrid/mail");

// Configura SendGrid con la API Key desde las variables de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Usa la clave desde el archivo .env

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

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
    to: email,
    from: "sebacabab@gmail.com", // Correo registrado en SendGrid
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

  // Enviar el correo usando SendGrid
  sgMail
    .send(mailOptions)
    .then(() => {
      console.log("Correo enviado con éxito a:", email);
      res.status(200).json({
        message: "Se ha enviado un enlace de recuperación al correo electrónico proporcionado.",
        link: recoveryLink
      });
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error);
      res.status(500).json({ message: "Error al enviar el correo electrónico." });
    });
});

// Rutas existentes
server.use(router);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
