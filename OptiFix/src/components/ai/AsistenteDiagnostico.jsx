import React, { useState } from "react";
import { sugerirDiagnostico } from "../../services/aiService.js";

export default function AsistenteDiagnostico({ fallaReportada, equipo, onAplicar }) {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const solicitar = async () => { try { setCargando(true); setError(""); setResultado(await sugerirDiagnostico(fallaReportada, equipo)); } catch (e) { setError(e.message); } finally { setCargando(false); } };
  return <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-slate-700"><button type="button" onClick={solicitar} disabled={cargando} className="rounded-lg bg-sky-700 px-3 py-2 font-bold text-white disabled:opacity-60">{cargando ? "Analizando…" : "Sugerir diagnóstico con IA"}</button>{error && <p className="mt-2 text-red-600">{error}</p>}{resultado && <div className="mt-3"><b>{resultado.modo === "demo" ? "Sugerencia demo" : "Sugerencia IA"}</b><ul className="mt-1 list-disc pl-4">{resultado.posiblesCausas?.map((causa) => <li key={causa}>{causa}</li>)}</ul><p className="mt-2"><b>Servicios:</b> {resultado.serviciosRecomendados?.join(", ")}</p><p><b>Estimado:</b> ₡{resultado.presupuesto?.minimo?.toLocaleString()} – ₡{resultado.presupuesto?.maximo?.toLocaleString()}</p><button type="button" onClick={() => onAplicar?.(resultado)} className="mt-2 font-bold text-sky-700">Aplicar a diagnóstico</button></div>}</div>;
}
