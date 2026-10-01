const getWebhookUrl = () => {
  const viteUrl = import.meta.env.VITE_N8N_OPTIBOT_WEBHOOK_URL;
  const runtimeUrl = typeof window !== "undefined"
    ? window.__OPTIFIX_RUNTIME_CONFIG__?.VITE_N8N_OPTIBOT_WEBHOOK_URL
    : "";
  return viteUrl || runtimeUrl || "";
};

const safeSessionUser = (user = {}) => ({ id: user.id, nombre: user.nombre, rol: user.rol });

/** La IA y sus credenciales permanecen en n8n; el navegador no recibe secretos. */
export async function consultarOptiBot(pregunta, usuario) {
  const texto = pregunta?.trim();
  if (!texto) throw new Error("Escribe una pregunta para OptiBot.");
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) throw new Error("OptiBot no está configurado. Falta la URL de conexión con n8n.");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ pregunta: texto, usuario: safeSessionUser(usuario) }) });
    let payload;
    try { payload = await response.json(); } catch { throw new Error("OptiBot devolvió una respuesta no válida."); }
    if (!response.ok || payload?.ok === false || payload?.success === false) {
      throw new Error(payload?.error || "OptiBot no pudo procesar la consulta. Intenta nuevamente.");
    }

    const respuesta = payload?.respuesta ?? payload?.output ?? payload?.text;
    if (typeof respuesta !== "string" || !respuesta.trim()) throw new Error("OptiBot no devolvió una respuesta disponible.");
    return respuesta.trim();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("OptiBot tardó demasiado en responder. Intenta nuevamente.");
    if (error instanceof TypeError) {
      if (import.meta.env.DEV) console.error("No fue posible conectar con el webhook de OptiBot.", error);
      throw new Error("No fue posible conectar con OptiBot. Verifica que n8n esté activo.");
    }
    if (import.meta.env.DEV) console.error("Error de OptiBot:", error);
    throw error;
  } finally { window.clearTimeout(timeout); }
}
