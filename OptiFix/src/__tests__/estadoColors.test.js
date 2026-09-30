import { getEstadoBadge, ESTADOS_OFICIALES } from "../utils/estadoColors.js";

describe("getEstadoBadge", () => {
  it("clasifica RECEPCIÓN", () => {
    expect(getEstadoBadge({ estado_actual: "RECEPCIÓN", etapa_categoria: "ENTRADA" })).toEqual(ESTADOS_OFICIALES.RECEPCION);
  });
  it("clasifica ENTREGADO", () => {
    expect(getEstadoBadge({ estado_actual: "ENTREGADO", etapa_categoria: "SALIDA" })).toEqual(ESTADOS_OFICIALES.ENTREGADO);
  });
  it("clasifica las variantes de presupuesto", () => {
    expect(getEstadoBadge({ estado_actual: "COMUNICANDO PRESUPUESTO", etapa_categoria: "BODEGA" })).toEqual(ESTADOS_OFICIALES.PRESUPUESTO);
  });
  it("clasifica estados rechazados sin importar mayúsculas", () => {
    expect(getEstadoBadge({ estado_actual: "rechazado por cliente" })).toEqual(ESTADOS_OFICIALES.RECHAZADO);
  });
  it("usa En trámite como categoría predeterminada", () => {
    expect(getEstadoBadge({ estado_actual: "DIAGNÓSTICO", etapa_categoria: "BODEGA" })).toEqual(ESTADOS_OFICIALES.TRAMITE);
  });
  it("soporta órdenes sin campos", () => {
    expect(getEstadoBadge({})).toEqual(ESTADOS_OFICIALES.TRAMITE);
    expect(getEstadoBadge()).toEqual(ESTADOS_OFICIALES.TRAMITE);
  });
});
