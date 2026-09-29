// Se puede inyectar desde index.html o desde un backend sin exponer secretos.
const webhookBase = (typeof window !== "undefined" && window.__OPTIFIX_N8N_WEBHOOK_URL__) || "";
export function notificarN8n(evento, payload) {
  if (!webhookBase) return Promise.resolve({ demo: true });
  return fetch(`${webhookBase.replace(/\/$/, "")}/optifix-${evento}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
}
