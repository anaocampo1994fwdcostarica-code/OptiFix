export const ORDER_FLOW = ["RECEPCIÓN", "ANÁLISIS TÉCNICO", "EN TALLER", "COMUNICANDO PRESUPUESTO", "REPARADO", "SIN REPARAR", "ENTREGADO"];

export function normalizeOrderStatus(status, stage = "", deliveredAt = null) {
  const value = String(status || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const category = String(stage || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (value.includes("ENTREGAD") || deliveredAt) return "ENTREGADO";
  if (value.includes("SIN REPAR")) return "SIN REPARAR";
  if (value === "REPARADO") return "REPARADO";
  if (value.includes("PRESUPUESTO")) return "COMUNICANDO PRESUPUESTO";
  if (value.includes("TALLER") || value === "BODEGA" || category === "TALLER" || category === "BODEGA") return "EN TALLER";
  if (value.includes("ANALISIS") || value.includes("TRAMITE") || value.includes("DIAGNOST") || category === "TRAMITE") return "ANÁLISIS TÉCNICO";
  if (value.includes("RECEPCI") || value === "ENTRADA" || category === "ENTRADA") return "RECEPCIÓN";
  // SALIDA sin fecha de entrega no constituye evidencia de entrega.
  if (value === "SALIDA" || category === "SALIDA") return "REPARADO";
  return "RECEPCIÓN";
}

export const ESTADOS_OFICIALES = {
  "RECEPCIÓN": { label: "Recepción", bg: "#e0f2fe", color: "#075985", border: "#7dd3fc", icon: "↓" },
  "ANÁLISIS TÉCNICO": { label: "Análisis técnico", bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", icon: "◉" },
  "EN TALLER": { label: "En taller", bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd", icon: "◆" },
  "COMUNICANDO PRESUPUESTO": { label: "Comunicando presupuesto", bg: "#ffedd5", color: "#9a3412", border: "#fdba74", icon: "$" },
  REPARADO: { label: "Reparado", bg: "#dcfce7", color: "#166534", border: "#86efac", icon: "✓" },
  "SIN REPARAR": { label: "Sin reparar", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", icon: "!" },
  ENTREGADO: { label: "Entregado", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7", icon: "✓" }
};

export function getEstadoBadge(order = {}) { return ESTADOS_OFICIALES[normalizeOrderStatus(order.estado_actual, order.etapa_categoria, order.fecha_entrega)]; }
export function getOrderStage(order = {}) { return normalizeOrderStatus(order.estado_actual, order.etapa_categoria, order.fecha_entrega); }
export const isOrderActive = (order = {}) => normalizeOrderStatus(order.estado_actual, order.etapa_categoria, order.fecha_entrega) !== "ENTREGADO";
