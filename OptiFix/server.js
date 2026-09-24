import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = () => router.db;

// ---------------------------------------------------------------------------
// Endpoints personalizados que replican la Especificación de API REST OPTIFIX
// (https://api.optifix.gob.digital/v1). Se registran ANTES del router genérico
// para que Express los resuelva con prioridad.
// ---------------------------------------------------------------------------

// GET /tramites/search — búsqueda libre sobre el catálogo (q, categoria, page, limit)
server.get("/tramites/search", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase().trim();
  const categoria = req.query.categoria;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  let tramites = db().get("tramites").value();

  if (q) {
    tramites = tramites.filter((t) =>
      [t.titulo, t.codigo, t.area, t.descripcion, t.codigo_area]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  if (categoria) {
    tramites = tramites.filter((t) => t.codigo_area === categoria);
  }

  const total = tramites.length;
  const start = (page - 1) * limit;
  res.json({
    total,
    page,
    limit,
    data: tramites.slice(start, start + limit),
  });
});

// GET /categorias — áreas clave de atención (envuelve en { categorias })
server.get("/categorias", (_req, res) => {
  res.json({ categorias: db().get("categorias").value() });
});

// GET /tramites/:codigo — detalle de un trámite por su código
server.get("/tramites/:codigo", (req, res) => {
  const tramite = db()
    .get("tramites")
    .find((t) => t.codigo === req.params.codigo)
    .value();
  if (!tramite) {
    return res.status(404).json({ error: "Trámite no encontrado" });
  }
  res.json(tramite);
});

// GET /metricas/publicas — métricas institucionales de la franja superior
server.get("/metricas/publicas", (_req, res) => {
  res.json(db().get("metricas").value());
});

// POST /auth/login-ciudadano — acceso con firma o clave única
server.post("/auth/login-ciudadano", (req, res) => {
  const { identificacion, password, metodo } = req.body || {};
  const ciudadano = db()
    .get("ciudadanos")
    .find((c) => c.identificacion === identificacion && c.password === password)
    .value();

  if (!ciudadano || (metodo && ciudadano.metodo !== metodo)) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  res.json({
    token: `jwt-demo.${Buffer.from(
      JSON.stringify({ identificacion, nombre: ciudadano.nombre })
    ).toString("base64")}.optifix-signature`,
    expira_en: 3600,
    usuario: {
      nombre: ciudadano.nombre,
      tipo: ciudadano.tipo,
      expedientes_activos: ciudadano.expedientes_activos,
    },
  });
});

// POST /verificacion/cvu — validación criptográfica de un documento emitido
server.post("/verificacion/cvu", (req, res) => {
  const { codigo_cvu, codigo_documento_id } = req.body || {};
  const documento = db()
    .get("verificaciones")
    .find(
      (v) =>
        v.codigo_cvu === codigo_cvu &&
        v.codigo_documento_id === codigo_documento_id
    )
    .value();

  if (!documento) {
    return res.status(404).json({ error: "Documento no válido o no registrado" });
  }
  res.json(documento);
});

// GET /radicados/:numero — consulta de expediente (lo resuelve el router
// genérico de json-server porque cada radicado usa id = numero_radicado).

server.use(router);
server.listen(3001, () => {
  console.log("API OPTIFIX (mock) corriendo en http://localhost:3001");
});