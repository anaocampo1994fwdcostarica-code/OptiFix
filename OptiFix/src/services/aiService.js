const demo = (falla, equipo) => ({
  modo: "demo",
  posiblesCausas: [`Revisar alimentación, conectores y estado físico relacionado con: ${falla}`, "Comprobar componentes de protección, fusibles y continuidad.", "Realizar diagnóstico funcional antes de reemplazar piezas."],
  serviciosRecomendados: ["Diagnóstico técnico", "Revisión electrónica", equipo?.tipo ? `Servicio para ${equipo.tipo}` : "Prueba funcional"],
  presupuesto: { minimo: 15000, maximo: 55000, moneda: "CRC" }
});

export async function sugerirDiagnostico(fallaReportada, equipo = {}) {
  if (!fallaReportada?.trim()) throw new Error("Describe la falla reportada antes de solicitar una sugerencia.");
  const runtimeConfig = typeof window !== "undefined" ? window.__OPTIFIX_RUNTIME_CONFIG__ || {} : {};
  const apiKey = runtimeConfig.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return demo(fallaReportada, equipo);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: runtimeConfig.VITE_ANTHROPIC_MODEL || "claude-3-5-haiku-latest", max_tokens: 500, messages: [{ role: "user", content: `Taller electrónico. Equipo: ${equipo.marca || ""} ${equipo.modelo || ""} ${equipo.tipo || ""}. Falla: ${fallaReportada}. Devuelve JSON con posiblesCausas (array), serviciosRecomendados (array) y presupuesto {minimo,maximo,moneda:"CRC"}.` }] })
  });
  if (!response.ok) throw new Error("El servicio de IA no respondió.");
  const data = await response.json();
  return JSON.parse(data.content?.[0]?.text || "{}");
}
