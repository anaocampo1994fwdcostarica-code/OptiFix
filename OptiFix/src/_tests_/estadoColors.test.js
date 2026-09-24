import { getEstadoBadge, ESTADOS_OFICIALES } from "../utils/estadoColors.js";

describe("getEstadoBadge", () => {
  it("clasifica RECEPCIÓN con el color oficial de Recepción", () => {
    const badge = getEstadoBadge({ estado_actual: "RECEPCIÓN", etapa_categoria: "ENTRADA" });
    expect(badge).toEqual(ESTADOS_OFICIALES.RECEPCION);
  });

  it("clasifica ENTREGADO con el color oficial de Entregado", () => {
    const badge = getEstadoBadge({ estado_actual: "ENTREGADO", etapa_categoria: "SALIDA" });
    expect(badge).toEqual(ESTADOS_OFICIALES.ENTREGADO);
  });

  it("clasifica cualquier variante de presupuesto con el color de Presupuesto", () => {
    const badge = getEstadoBadge({ estado_actual: "COMUNICANDO PRESUPUESTO", etapa_categoria: "BODEGA" });
    expect(badge).toEqual(ESTADOS_OFICIALES.PRESUPUESTO);
  });

  it("clasifica un estado rechazado con el color de Rechazado sin importar mayúsculas", () => {
    const badge = getEstadoBadge({ estado_actual: "rechazado por cliente" });
    expect(badge).toEqual(ESTADOS_OFICIALES.RECHAZADO);
  });

  it("usa En trámite como categoría por defecto (ej. diagnóstico, bodega)", () => {
    const badge = getEstadoBadge({ estado_actual: "DIAGNÓSTICO", etapa_categoria: "BODEGA" });
    expect(badge).toEqual(ESTADOS_OFICIALES.TRAMITE);
  });

  it("no revienta si la orden llega sin campos", () => {
    expect(getEstadoBadge({})).toEqual(ESTADOS_OFICIALES.TRAMITE);
    expect(getEstadoBadge()).toEqual(ESTADOS_OFICIALES.TRAMITE);
  });
});
