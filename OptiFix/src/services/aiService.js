function getAiConfig() {
  // Vite inyecta VITE_* al compilar. El objeto global permite configuración runtime.
  const viteConfig = typeof import.meta !== "undefined" ? import.meta.env || {} : {};
  const runtimeConfig = typeof window !== "undefined" ? window.__OPTIFIX_RUNTIME_CONFIG__ || {} : {};
  return {
    apiKey: viteConfig.VITE_ANTHROPIC_API_KEY || runtimeConfig.VITE_ANTHROPIC_API_KEY,
    model: viteConfig.VITE_ANTHROPIC_MODEL || runtimeConfig.VITE_ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
  };
}

const demoDiagnostico = (falla, equipo) => ({
  modo: "demo",
  posiblesCausas: [`Revisar alimentación, conectores y estado físico relacionado con: ${falla}`, "Comprobar componentes de protección, fusibles y continuidad.", "Realizar diagnóstico funcional antes de reemplazar piezas."],
  serviciosRecomendados: ["Diagnóstico técnico", "Revisión electrónica", equipo?.tipo ? `Servicio para ${equipo.tipo}` : "Prueba funcional"],
  presupuesto: { minimo: 15000, maximo: 55000, moneda: "CRC" },
});

async function consultarClaude({ system, prompt }) {
  const { apiKey, model } = getAiConfig();
  if (!apiKey) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 650, system, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error("El servicio de IA no respondió.");
  const data = await response.json();
  return data.content?.[0]?.text?.trim() || "No fue posible generar una respuesta.";
}

export async function sugerirDiagnostico(fallaReportada, equipo = {}) {
  if (!fallaReportada?.trim()) throw new Error("Describe la falla reportada antes de solicitar una sugerencia.");
  const prompt = `Taller electrónico. Equipo: ${equipo.marca || ""} ${equipo.modelo || ""} ${equipo.tipo || ""}. Falla: ${fallaReportada}. Devuelve JSON con posiblesCausas (array), serviciosRecomendados (array) y presupuesto {minimo,maximo,moneda:"CRC"}.`;
  try {
    const respuesta = await consultarClaude({ system: "Eres un técnico experto de OptiFix. Responde en JSON válido, sin markdown.", prompt });
    if (!respuesta) return demoDiagnostico(fallaReportada, equipo);
    return JSON.parse(respuesta);
  } catch (error) {
    // Mantiene el diagnóstico operativo aun cuando Anthropic no esté disponible.
    return demoDiagnostico(fallaReportada, equipo);
  }
}
