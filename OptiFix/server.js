import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(router);
server.listen(3001, () => console.log("API mock de OptiFix en http://localhost:3001"));
