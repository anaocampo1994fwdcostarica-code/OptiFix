import { formatColones, getRelatedHistoryCount, safeValue } from "../components/order/OrderDetailComponents.jsx";
import { createBudgetDecisionChanges, createBudgetDecisionRevisionChanges, getBudgetTotals } from "../components/order/OrderManagementPanels.jsx";

describe("utilidades del detalle de orden", () => {
  it("muestra un valor seguro para datos opcionales", () => {
    expect(safeValue(undefined)).toBe("No cargado");
    expect(safeValue("  ")).toBe("No cargado");
    expect(safeValue("Sony")).toBe("Sony");
  });

  it("formatea colones con separador de miles consistente", () => {
    expect(formatColones(150000)).toBe("₡150.000");
    expect(formatColones(19500)).toBe("₡19.500");
  });

  it("cuenta antecedentes relacionados sin duplicar la orden actual", () => {
    const current = { id: "o-1", cliente_id: "c-1", equipo_id: "e-1" };
    const orders = [current, { id: "o-2", cliente_id: "c-1", equipo_id: "e-2" }, { id: "o-3", cliente_id: "c-2", equipo_id: "e-3" }];
    const equipment = [{ id: "e-1", serie: "ABC-10" }, { id: "e-2", serie: "OTRA" }, { id: "e-3", serie: "abc-10" }];
    expect(getRelatedHistoryCount(current, equipment[0], orders, equipment)).toBe(2);
  });
});

describe("cálculos del presupuesto", () => {
  test("calcula subtotal, IVA, total, adelanto y saldo con números", () => {
    const totals = getBudgetTotals({
      presupuesto_aplica_iva: true,
      adelanto: 5000,
      presupuesto_conceptos: [
        { id: "p1", tipo: "Producto", descripcion: "Tarjeta", cantidad: 1, precio_unitario: 125000 },
        { id: "s1", tipo: "Mano de obra", descripcion: "Mano de obra", cantidad: 1, precio_unitario: 15000 }
      ]
    });
    expect(totals.subtotal).toBe(140000);
    expect(totals.tax).toBe(18200);
    expect(totals.total).toBe(158200);
    expect(totals.balance).toBe(153200);
  });

  test("permite adelanto previo y evita saldos negativos", () => {
    const totals = getBudgetTotals({ presupuesto_aplica_iva: false, adelanto: 9999, presupuesto_conceptos: [{ descripcion: "Prueba", cantidad: "x", precio_unitario: -5 }] });
    expect(totals.subtotal).toBe(0);
    expect(totals.advance).toBe(9999);
    expect(totals.balance).toBe(0);
    expect(totals.credit).toBe(9999);
  });

  test("conserva adelanto antes de crear el presupuesto", () => {
    const totals = getBudgetTotals({ presupuesto_aplica_iva: true, adelanto: 5000, presupuesto_conceptos: [] });
    expect(totals.pending).toBe(true);
    expect(totals.advance).toBe(5000);
    expect(totals.balance).toBe(0);
    expect(totals.credit).toBe(0);
  });
});

describe("decisión del presupuesto", () => {
  const order = { estado_actual: "COMUNICANDO PRESUPUESTO", motivo_sin_reparar: "", linea_tiempo: [] };

  test("aprobar devuelve la orden a EN TALLER y registra evidencia", () => {
    const changes = createBudgetDecisionChanges(order, "APROBADO", "Cliente acepta por WhatsApp.", "Administrador", "04/10/2026 10:00 hs");
    expect(changes.estado_actual).toBe("EN TALLER");
    expect(changes.decisionPresupuesto).toBe("APROBADO");
    expect(changes.linea_tiempo[0]).toMatchObject({ estado: "Presupuesto aprobado", observacion: "Cliente acepta por WhatsApp.", realizado_por: "Administrador" });
  });

  test("rechazar deja la orden SIN REPARAR, no entregada", () => {
    const changes = createBudgetDecisionChanges(order, "RECHAZADO", "Cliente no acepta el monto.", "Administrador", "04/10/2026 10:05 hs");
    expect(changes.estado_actual).toBe("SIN REPARAR");
    expect(changes.estado_actual).not.toBe("ENTREGADO");
    expect(changes.motivo_sin_reparar).toBe("Cliente no acepta el monto.");
    expect(changes.linea_tiempo[0].estado).toBe("Presupuesto rechazado");
  });

  test("modificar una decisión conserva el historial y puede mantener el estado", () => {
    const rejected = { ...order, estado_actual: "SIN REPARAR", decisionPresupuesto: "RECHAZADO", linea_tiempo: [{ estado: "Presupuesto rechazado", detalle: "Registro original" }] };
    const changes = createBudgetDecisionRevisionChanges(rejected, "APROBADO", "El cliente cambió de opinión.", "Administrador", "04/10/2026 11:42 hs", false);
    expect(changes.estado_actual).toBeUndefined();
    expect(changes.decisionPresupuesto).toBe("APROBADO");
    expect(changes.linea_tiempo).toHaveLength(2);
    expect(changes.linea_tiempo[0].detalle).toBe("Registro original");
    expect(changes.linea_tiempo[1]).toMatchObject({ estado: "Decisión de presupuesto modificada", detalle: "RECHAZADO → APROBADO. El cliente cambió de opinión." });
  });

  test("modificar una decisión puede mover explícitamente el estado", () => {
    const approved = { ...order, estado_actual: "EN TALLER", decisionPresupuesto: "APROBADO", linea_tiempo: [] };
    const changes = createBudgetDecisionRevisionChanges(approved, "RECHAZADO", "Cliente cancela la reparación.", "Administrador", "04/10/2026 12:00 hs", true);
    expect(changes.estado_actual).toBe("SIN REPARAR");
    expect(changes.etapa_categoria).toBe("SIN REPARAR");
    expect(changes.linea_tiempo).toHaveLength(2);
  });
});
