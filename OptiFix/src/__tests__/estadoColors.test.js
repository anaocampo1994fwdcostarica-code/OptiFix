import { ESTADOS_OFICIALES, getEstadoBadge, getOrderStage, isOrderActive, normalizeOrderStatus, ORDER_FLOW } from "../utils/estadoColors.js";

describe("flujo oficial de estados", () => {
  test("expone los estados en el orden operativo acordado", () => {
    expect(ORDER_FLOW).toEqual(["RECEPCIÓN", "ANÁLISIS TÉCNICO", "EN TALLER", "COMUNICANDO PRESUPUESTO", "REPARADO", "SIN REPARAR", "ENTREGADO"]);
  });

  test.each([
    [{ estado_actual: "ENTRADA", etapa_categoria: "ENTRADA" }, "RECEPCIÓN"],
    [{ estado_actual: "EN TRÁMITE", etapa_categoria: "TRAMITE" }, "ANÁLISIS TÉCNICO"],
    [{ estado_actual: "TALLER", etapa_categoria: "TALLER" }, "EN TALLER"],
    [{ estado_actual: "COMUNICANDO PRESUPUESTO", etapa_categoria: "BODEGA" }, "COMUNICANDO PRESUPUESTO"],
    [{ estado_actual: "REPARADO", etapa_categoria: "TALLER" }, "REPARADO"],
    [{ estado_actual: "SIN REPARAR", etapa_categoria: "TALLER" }, "SIN REPARAR"],
    [{ estado_actual: "ENTREGADO", etapa_categoria: "SALIDA" }, "ENTREGADO"]
  ])("normaliza estados históricos sin modificar datos", (order, expected) => expect(getOrderStage(order)).toBe(expected));

  test("no interpreta SALIDA como entrega sin evidencia", () => {
    expect(normalizeOrderStatus("SALIDA", "SALIDA", null)).toBe("REPARADO");
    expect(normalizeOrderStatus("SALIDA", "SALIDA", "20/09/2026")).toBe("ENTREGADO");
  });

  test("solo Entregado deja de ser una orden activa", () => {
    expect(isOrderActive({ estado_actual: "REPARADO" })).toBe(true);
    expect(isOrderActive({ estado_actual: "SIN REPARAR" })).toBe(true);
    expect(isOrderActive({ estado_actual: "ENTREGADO" })).toBe(false);
  });

  test("cada estado tiene texto, icono y contraste semántico", () => {
    ORDER_FLOW.forEach((status) => {
      const badge = getEstadoBadge({ estado_actual: status });
      expect(badge).toEqual(ESTADOS_OFICIALES[status]);
      expect(badge.label).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.border).toBeTruthy();
    });
  });
});
