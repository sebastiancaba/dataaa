require("dotenv").config({ path: "./.env" });
console.log("Resend API Key:", process.env.RESEND_API_KEY);
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const jsonServer = require("json-server");
const server = jsonServer.create();
const cors = require("cors");
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

const cors = require("cors");

// Configurar CORS para permitir solicitudes de tu frontend
server.use(cors({
  origin: "http://localhost:8100", // Permitir solo este origen
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"] // Encabezados permitidos
}));

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permitir cualquier origen temporalmente
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/password-recovery", async (req, res) => {
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

  const recoveryLink = `https://tusitio.com/reset-password?email=${email}`;

  try {
    await resend.emails.send({
      from: "se.caba@duocuc.cl", // Debe ser un remitente verificado en Resend
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <h3>Recuperación de Contraseña</h3>
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para recuperar tu contraseña:</p>
        <a href="${recoveryLink}">${recoveryLink}</a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `,
    });

    console.log("Correo enviado con éxito a:", email);
    res.status(200).json({
      message: "Se ha enviado un enlace de recuperación al correo electrónico proporcionado.",
      link: recoveryLink,
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo electrónico." });
  }
});

server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
