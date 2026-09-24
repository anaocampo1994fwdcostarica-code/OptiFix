// src/utils/estadoColors.js
// Paleta oficial de estados — Anteproyecto OptiFix, sección "Sistema de color":
// Recepción #00873A · En trámite #565E74 · Presupuesto #2C8FC4 · Entregado #28814D · Rechazado #C43D3D

export const ESTADOS_OFICIALES = {
  RECEPCION:   { label: "Recepción",   bg: "#00873A", color: "#ffffff" },
  TRAMITE:     { label: "En trámite",  bg: "#565E74", color: "#ffffff" },
  PRESUPUESTO: { label: "Presupuesto", bg: "#2C8FC4", color: "#ffffff" },
  ENTREGADO:   { label: "Entregado",   bg: "#28814D", color: "#ffffff" },
  RECHAZADO:   { label: "Rechazado",   bg: "#C43D3D", color: "#ffffff" },
};

/**
 * Devuelve { label, bg, color } para una orden, usando SIEMPRE
 * los 5 colores oficiales del anteproyecto (nunca un color suelto
 * inventado por pantalla).
 *
 * Acepta la orden completa para poder mirar tanto estado_actual
 * como etapa_categoria y clasificar bien casos como "DIAGNÓSTICO"
 * o "BODEGA", que según el anteproyecto caen bajo "En trámite".
 */
export function getEstadoBadge(orden = {}) {
  const estado = (orden.estado_actual || "").toUpperCase();
  const etapa = (orden.etapa_categoria || "").toUpperCase();

  if (estado.includes("RECHAZ")) return ESTADOS_OFICIALES.RECHAZADO;
  if (estado === "ENTREGADO" || etapa === "SALIDA") return ESTADOS_OFICIALES.ENTREGADO;
  if (estado.includes("PRESUPUESTO")) return ESTADOS_OFICIALES.PRESUPUESTO;
  if (estado === "RECEPCIÓN" || etapa === "ENTRADA") return ESTADOS_OFICIALES.RECEPCION;

  // Diagnóstico en banco, espera de repuestos, taller, reparado, bodega, etc.
  return ESTADOS_OFICIALES.TRAMITE;
}
