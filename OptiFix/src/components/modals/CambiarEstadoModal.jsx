import React, { useEffect, useMemo, useState } from "react";
import Icono from "../icons.jsx";
import { actualizarEstadoOrden } from "../../services/n8nBackendService.js";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import { formatColones } from "../order/OrderDetailComponents.jsx";
import { getBudgetTotals } from "../order/OrderManagementPanels.jsx";
import { ORDER_FLOW, normalizeOrderStatus } from "../../utils/estadoColors.js";
import { WORKSHOP_NAME } from "../../config/workshop.js";

const REASONS = ["Sin reparación posible", "Repuesto no disponible", "Presupuesto rechazado", "Costo de reparación no conveniente", "Daño irreparable", "Otro"];
const NEXT = { "RECEPCIÓN": ["ANÁLISIS TÉCNICO"], "ANÁLISIS TÉCNICO": ["EN TALLER"], "EN TALLER": ["COMUNICANDO PRESUPUESTO"], "COMUNICANDO PRESUPUESTO": ["REPARADO", "SIN REPARAR"], REPARADO: ["ENTREGADO"], "SIN REPARAR": ["ENTREGADO"], ENTREGADO: [] };
const stageFor = (status) => status === "RECEPCIÓN" ? "ENTRADA" : status === "ENTREGADO" ? "SALIDA" : status;

export default function CambiarEstadoModal({ isOpen, onClose, orden, cliente = {}, equipo = {}, technicians = [], currentUser, onGoToBudget, onConfirmChange }) {
  const dialogRef = useFocusTrap(isOpen, onClose);
  const current = normalizeOrderStatus(orden?.estado_actual, orden?.etapa_categoria, orden?.fecha_entrega);
  const awaitingBudgetDecision = current === "COMUNICANDO PRESUPUESTO" && !orden?.decisionPresupuesto;
  const recommended = awaitingBudgetDecision ? current : NEXT[current]?.[0] || current;
  const isAdmin = currentUser?.rol === "admin";
  const allowed = isAdmin ? ORDER_FLOW : ORDER_FLOW.filter((status) => NEXT[current]?.includes(status));
  const [selectedEstado, setSelectedEstado] = useState(recommended);
  const [detalle, setDetalle] = useState("");
  const [technician, setTechnician] = useState(orden?.responsable === "OptiFix" ? "" : orden?.responsable || "");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totals = useMemo(() => getBudgetTotals(orden || {}), [orden]);
  const hasBudget = totals.concepts.length > 0;
  const needsTechnician = selectedEstado === "ANÁLISIS TÉCNICO" && (!orden?.responsable || ["OptiFix", "Técnico Principal"].includes(orden.responsable));
  const correction = !NEXT[current]?.includes(selectedEstado) && selectedEstado !== current;
  useEffect(() => { if (isOpen) { setSelectedEstado(recommended); setDetalle(""); setReason(""); setOtherReason(""); setError(""); } }, [isOpen, recommended]);
  if (!isOpen || !orden) return null;

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (selectedEstado === current) return setError("Seleccione un estado diferente al actual.");
    if (needsTechnician && !technician) return setError("Debe asignar un técnico antes de continuar.");
    if (selectedEstado === "COMUNICANDO PRESUPUESTO" && !hasBudget) return setError("No existe un presupuesto registrado para esta orden. Registra los productos y servicios necesarios antes de comunicar el presupuesto al cliente.");
    if (selectedEstado === "SIN REPARAR" && (!reason || (reason === "Otro" && !otherReason.trim()))) return setError("Seleccione y especifique el motivo por el que el equipo queda sin reparar.");
    const finalReason = reason === "Otro" ? otherReason.trim() : reason;
    const observation = [detalle.trim(), finalReason && `Motivo: ${finalReason}`, needsTechnician && `Asignada a ${technician}`].filter(Boolean).join(" · ");
    try {
      setLoading(true);
      const remote = await actualizarEstadoOrden({ ordenId: orden.id, estado: selectedEstado, comentarioTecnico: observation, cliente, equipo, seguimientoUrl: `${window.location.origin}/seguimiento/${orden.token_seguimiento}` });
      if (!remote.ok && !remote.demo) throw new Error(remote.error || "No fue posible actualizar la orden en n8n.");
      await onConfirmChange(orden.id, selectedEstado, stageFor(selectedEstado), observation, { estado_anterior: current, responsable: technician || orden.responsable || "", motivo_sin_reparar: finalReason || "", finalizada: selectedEstado === "ENTREGADO", realizado_por: currentUser?.nombre || WORKSHOP_NAME });
      onClose();
    } catch (requestError) { setError(requestError.message || "No se pudo actualizar el estado. Inténtalo nuevamente."); }
    finally { setLoading(false); }
  };

  return <div className="modal-overlay" onClick={onClose}><section ref={dialogRef} tabIndex={-1} className="modal-content status-management-modal" role="dialog" aria-modal="true" aria-labelledby="change-status-title" onClick={(event) => event.stopPropagation()}>
    <div className="modal-header"><div><span className="modal-eyebrow">FLUJO OPERATIVO</span><h3 id="change-status-title">Cambiar estado de la orden</h3><p>Orden N.º {orden.numero}</p></div><button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar cambio de estado"><Icono nombre="x" size={18} /></button></div>
    <form onSubmit={submit}><div className="modal-body">
      <div className="status-current-grid"><div><span>Estado actual</span><strong>{current}</strong></div><div><span>{awaitingBudgetDecision ? "Siguiente acción" : "Siguiente recomendado"}</span><strong>{awaitingBudgetDecision ? "Esperar decisión del cliente" : recommended}</strong></div></div>
      <div className="form-group"><label htmlFor="new-order-status">Cambiar estado a *</label><select id="new-order-status" className="form-select" value={selectedEstado} onChange={(event) => { setSelectedEstado(event.target.value); setError(""); }}>{allowed.map((status) => <option key={status} value={status}>{status}</option>)}</select>{correction && <small className="status-help"><Icono nombre="alert-triangle" size={14} />Corrección administrativa: la observación es opcional y quedará registrada si la agregás.</small>}</div>
      {needsTechnician && <div className="form-group"><label htmlFor="assigned-technician">Asignar técnico *</label><select id="assigned-technician" className="form-select" value={technician} onChange={(event) => setTechnician(event.target.value)}><option value="">Seleccione un técnico</option>{technicians.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>}
      {selectedEstado === "SIN REPARAR" && <><div className="form-group"><label htmlFor="repair-reason">Motivo *</label><select id="repair-reason" className="form-select" value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Seleccione un motivo</option>{REASONS.map((item) => <option key={item}>{item}</option>)}</select></div>{reason === "Otro" && <div className="form-group"><label htmlFor="other-reason">Especificar motivo *</label><input id="other-reason" className="form-input" value={otherReason} onChange={(event) => setOtherReason(event.target.value)} /></div>}</>}
      {selectedEstado === "ENTREGADO" && <div className="delivery-confirmation"><h4>Finalizar orden</h4><p>Esta acción marcará el equipo como entregado al cliente y moverá la orden al historial.</p><dl><div><dt>Orden</dt><dd>#{orden.numero}</dd></div><div><dt>Cliente</dt><dd>{cliente.nombre || "No cargado"}</dd></div><div><dt>Equipo</dt><dd>{equipo.marca || equipo.tipo || "No cargado"}</dd></div><div><dt>Serie</dt><dd>{equipo.serie || "No cargado"}</dd></div><div><dt>Saldo pendiente</dt><dd>{formatColones(totals.balance)}</dd></div></dl>{totals.balance > 0 && <p className="balance-warning"><Icono nombre="alert-triangle" size={16} />Esta orden todavía presenta un saldo pendiente de {formatColones(totals.balance)}.</p>}</div>}
      {selectedEstado === "COMUNICANDO PRESUPUESTO" && !hasBudget && <div className="budget-required" role="alert"><Icono nombre="alert-triangle" size={18} /><div><strong>No existen productos o servicios cotizados para esta orden.</strong><p>Registra los conceptos necesarios antes de comunicar el presupuesto al cliente.</p><button type="button" onClick={onGoToBudget}>Ir a Productos/Servicios</button></div></div>}
      <div className="form-group"><label htmlFor="status-observation">Observación (opcional)</label><textarea id="status-observation" className="form-textarea" rows="3" placeholder="Agregá un detalle opcional para el historial..." value={detalle} onChange={(event) => setDetalle(event.target.value)} /></div>
      {error && <p className="modal-form-error" role="alert"><Icono nombre="alert-triangle" size={15} />{error}</p>}
    </div><div className="modal-footer"><button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button><button type="submit" className="btn-primary" disabled={loading || (selectedEstado === "COMUNICANDO PRESUPUESTO" && !hasBudget)}>{loading ? "Actualizando…" : selectedEstado === "ENTREGADO" ? "Confirmar entrega" : needsTechnician ? "Asignar y continuar" : "Confirmar cambio"}</button></div></form>
  </section></div>;
}
