/**
 * Cliente del backend simulado en n8n.
 * Configure window.__OPTIFIX_N8N_BACKEND_URL__ = "https://tu-n8n.com/webhook"
 * antes de cargar la aplicación. Cada endpoint debe responder { ok, data, error? }.
 */
const getBaseUrl = () => (typeof window !== "undefined" && window.__OPTIFIX_N8N_BACKEND_URL__) || "";

async function request(endpoint, payload, method = "POST") {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return { ok: false, demo: true, error: "Webhook n8n no configurado" };
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) throw new Error(result.error || "El webhook n8n no pudo procesar la solicitud.");
  return result;
}

export function registrarUsuario(usuario) {
  const { password, ...usuarioSeguro } = usuario;
  return request("optifix-users", { action: "USER_CREATE", usuario: usuarioSeguro, password });
}

export function actualizarEstadoOrden({ ordenId, estado, comentarioTecnico, cliente, equipo, seguimientoUrl }) {
  return request("optifix-order-delivered", { action: "ORDER_STATUS_UPDATE", ordenId, estado, comentarioTecnico, cliente, equipo, seguimientoUrl });
}

export function consultarOrdenPublica(token) {
  return request("optifix-public-order", { action: "ORDER_PUBLIC_GET", token });
}

export function preguntarChatPublico({ ordenId, token, pregunta }) {
  return request("optifix-chat", { action: "ORDER_CHAT", ordenId, token, pregunta });
}
