const jsonServer = require("json-server");
const server = jsonServer.create();
const cors = require("cors");
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000; // Puerto del servidor

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser); // Permite procesar JSON en el body

// Ruta personalizada: /password-recovery
server.post("/password-recovery", (req, res) => {
  const { email } = req.body;

  // Validación del email
  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido." });
  }

  // Buscar el usuario por email en la colección "usuarios"
  const users = router.db.get("usuarios").value(); // Obtiene todos los usuarios
  const user = users.find((u) => u.email === email);

  if (!user) {
    // El correo no está registrado
    return res.status(404).json({ message: "El correo electrónico no está registrado." });
  }

  // Simulación de envío de enlace de recuperación
  console.log(`Enlace de recuperación enviado a: ${email}`);
  return res.status(200).json({
    message: "Se ha enviado un enlace de recuperación al correo electrónico proporcionado.",
  });
});

// Usar el resto de las rutas de json-server
server.use(router);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
