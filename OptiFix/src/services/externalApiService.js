const FALLBACK_USD_TO_CRC = 510;

/** Consulta Frankfurter, API pública y gratuita de tipos de cambio. */
export async function obtenerTipoCambioUsdCrc() {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=CRC");
    if (!response.ok) throw new Error("No se pudo consultar el tipo de cambio");
    const data = await response.json();
    return { rate: data.rates?.CRC || FALLBACK_USD_TO_CRC, date: data.date, source: "Frankfurter" };
  } catch {
    return { rate: FALLBACK_USD_TO_CRC, date: null, source: "Referencia sin conexión" };
  }
}
