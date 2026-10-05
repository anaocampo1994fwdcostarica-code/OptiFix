import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// El inventario histórico ya contiene modelos válidos. Se sincronizan una vez
// con el catálogo para que el autocomplete pueda encontrarlos desde el inicio.
const db = router.db;
const catalogModels = db.get("modelos").value() || [];
const equipmentModels = db.get("equipos").value() || [];
const modelKey = (brand, model) => `${String(brand || "").trim().toLowerCase()}::${String(model || "").trim().toLowerCase()}`;
const knownModelKeys = new Set(catalogModels.map((item) => modelKey(item.marcaNombre || item.marca, item.nombre || item.modelo)));
const missingModels = [];
equipmentModels.forEach((equipment) => {
  const nombre = String(equipment.modelo || "").trim();
  const marcaNombre = String(equipment.marca || "").trim();
  const key = modelKey(marcaNombre, nombre);
  if (!nombre || !marcaNombre || knownModelKeys.has(key)) return;
  knownModelKeys.add(key);
  missingModels.push({ id: `modelo-seed-${catalogModels.length + missingModels.length + 1}`, nombre, marcaNombre });
});
if (missingModels.length) db.set("modelos", [...catalogModels, ...missingModels]).write();

// Endpoint explícito para evitar duplicados y devolver siempre el modelo real
// que quedó persistido. El identificador se genera en el servidor.
server.post("/modelos", (request, response) => {
  const nombre = String(request.body?.nombre || "").trim();
  const marcaNombre = String(request.body?.marcaNombre || request.body?.marca || "").trim();
  if (!nombre || !marcaNombre) return response.status(400).json({ message: "Nombre y marca son obligatorios." });

  const models = db.get("modelos").value() || [];
  const existing = models.find((item) => modelKey(item.marcaNombre || item.marca, item.nombre || item.modelo) === modelKey(marcaNombre, nombre));
  if (existing) return response.status(200).json(existing);

  const created = { id: `modelo-${Date.now()}`, nombre, marcaNombre };
  db.get("modelos").push(created).write();
  return response.status(201).json(created);
});

// Fuente exclusiva para el agente de n8n: nunca expone contraseñas del mock.
server.get("/usuarios-publicos", (_request, response) => {
  const usuarios = router.db.get("usuarios").value() || [];
  response.json(usuarios.map(({ password, ...usuario }) => usuario));
});

server.use(router);
const port = Number(process.env.PORT) || 3001;
server.listen(port, () => console.log(`API mock de OptiFix en http://localhost:${port}`));
