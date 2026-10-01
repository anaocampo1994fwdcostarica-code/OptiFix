import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Fuente exclusiva para el agente de n8n: nunca expone contraseñas del mock.
server.get("/usuarios-publicos", (_request, response) => {
  const usuarios = router.db.get("usuarios").value() || [];
  response.json(usuarios.map(({ password, ...usuario }) => usuario));
});

server.use(router);
server.listen(3001, () => console.log("API mock de OptiFix en http://localhost:3001"));
