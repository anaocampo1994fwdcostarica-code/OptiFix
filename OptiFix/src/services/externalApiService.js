/** Consulta las tasas públicas reportadas para Banco Nacional de Costa Rica. */
export async function obtenerTipoCambioUsdCrc() {
  try {
    const response = await fetch("https://tipodecambio.cr/api/rates");
    if (!response.ok) throw new Error("No se pudo consultar el tipo de cambio");
    const data = await response.json();
    const bancoNacional = data.rates?.find((item) =>
      item.entidad?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === "banco nacional"
    );
    if (!bancoNacional?.venta) throw new Error("Banco Nacional no disponible");

    return {
      rate: Number(bancoNacional.venta),
      date: bancoNacional.actualizacion || null,
      source: `Banco Nacional${bancoNacional.actualizacion ? ` · ${bancoNacional.actualizacion}` : ""}`
    };
  } catch {
    // Respaldo oficial: Hacienda publica la referencia diaria del BCCR.
    try {
      const response = await fetch("https://api.hacienda.go.cr/indicadores/tc/dolar");
      if (!response.ok) throw new Error("No se pudo consultar el BCCR");
      const data = await response.json();
      if (!data.venta?.valor) throw new Error("Venta BCCR no disponible");

      return {
        rate: Number(data.venta.valor),
        date: data.venta.fecha || null,
        source: `BCCR (respaldo)${data.venta.fecha ? ` · ${data.venta.fecha}` : ""}`
      };
    } catch {
      return { rate: null, date: null, source: "Tipo de cambio no disponible" };
    }
  }
}
