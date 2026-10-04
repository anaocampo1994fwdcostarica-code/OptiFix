import React, { useEffect, useMemo, useState } from "react";
import Icono from "../icons.jsx";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import { formatColones, safeValue } from "./OrderDetailComponents.jsx";

const CUSTOMER_FIELDS = [
  ["identificacion", "Cédula"], ["nombre", "Nombre completo"], ["email", "Correo electrónico", "email"],
  ["telefono", "Teléfono / WhatsApp", "tel"], ["direccion", "Dirección"], ["notas", "Notas"]
];
const EQUIPMENT_FIELDS = [
  ["tipo", "Categoría"], ["marca", "Marca"], ["modelo", "Modelo"], ["serie", "Número de serie"],
  ["estado_fisico", "Estado físico"], ["accesorios", "Accesorios"], ["notas", "Observaciones"]
];

export function EntityEditModal({ kind, entity, onClose, onSave }) {
  const dialogRef = useFocusTrap(true, onClose);
  const fields = kind === "customer" ? CUSTOMER_FIELDS : EQUIPMENT_FIELDS;
  const [draft, setDraft] = useState(() => Object.fromEntries(fields.map(([key]) => [key, entity?.[key] || ""])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (!draft.nombre?.trim() && kind === "customer") return setError("El nombre del cliente es obligatorio.");
    if (!draft.tipo?.trim() && kind === "equipment") return setError("La categoría del equipo es obligatoria.");
    setSaving(true);
    try { await onSave(draft); } catch (saveError) { setError(saveError.message || "No se pudieron guardar los cambios."); setSaving(false); }
  };
  const title = kind === "customer" ? "Datos del cliente" : "Datos del equipo";
  return <div className="order-edit-overlay" onMouseDown={onClose}>
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="entity-modal-title" className="entity-edit-modal" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span>EXPEDIENTE</span><h2 id="entity-modal-title">{title}</h2></div><button type="button" onClick={onClose} aria-label={`Cerrar ${title.toLowerCase()}`}><Icono nombre="x" size={19} /></button></header>
      <form onSubmit={submit}><div className="entity-edit-grid">{fields.map(([key, label, type = "text"]) => <label key={key}>{label}<input type={type} value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="primary" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button></footer>
      </form>
    </section>
  </div>;
}

const TYPES = ["Producto", "Servicio", "Mano de obra", "Repuesto", "Otro"];
const normalizeConcept = (item) => ({ id: item.id || `budget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, tipo: item.tipo || "Producto", descripcion: item.descripcion || "", cantidad: Math.max(1, Number(item.cantidad) || 1), precio_unitario: Math.max(0, Number(item.precio_unitario ?? item.importe) || 0) });

export function getBudgetTotals(order) {
  const concepts = (order.presupuesto_conceptos || []).map(normalizeConcept);
  const subtotal = concepts.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);
  const tax = order.presupuesto_aplica_iva ? subtotal * 0.13 : 0;
  const total = subtotal + tax;
  const advance = Math.max(0, Number(order.adelanto) || 0);
  return { concepts, subtotal, tax, total, advance, balance: Math.max(total - advance, 0), credit: concepts.length ? Math.max(advance - total, 0) : 0, pending: concepts.length === 0 };
}

export function createBudgetDecisionChanges(order, decision, comment, actor, timestamp) {
  const approved = decision === "APROBADO";
  const nextStatus = approved ? "EN TALLER" : "SIN REPARAR";
  const decisionLabel = approved ? "Presupuesto aprobado" : "Presupuesto rechazado";
  const evidence = String(comment || "").trim();
  const performedBy = actor || "OptiFix";
  const historyEvent = {
    fecha: timestamp,
    estado_anterior: order.estado_actual,
    estado: decisionLabel,
    nuevo_estado: nextStatus,
    realizado_por: performedBy,
    observacion: evidence,
    detalle: evidence || decisionLabel
  };
  const statusEvent = {
    fecha: timestamp,
    estado_anterior: order.estado_actual,
    estado: nextStatus,
    nuevo_estado: nextStatus,
    realizado_por: performedBy,
    observacion: "",
    detalle: approved
      ? "La orden vuelve a EN TALLER para realizar la reparación aprobada."
      : "La orden queda SIN REPARAR y pendiente de entrega al cliente."
  };
  return {
    decisionPresupuesto: decision,
    fechaDecisionPresupuesto: timestamp,
    comentarioDecisionPresupuesto: evidence,
    usuarioQueRegistroDecision: performedBy,
    presupuesto_estado: decision,
    estado_actual: nextStatus,
    etapa_categoria: nextStatus,
    motivo_sin_reparar: approved ? order.motivo_sin_reparar || "" : evidence,
    linea_tiempo: [...(order.linea_tiempo || []), historyEvent, statusEvent]
  };
}

export function createBudgetDecisionRevisionChanges(order, decision, comment, actor, timestamp, moveState) {
  const previousDecision = order.decisionPresupuesto;
  const targetStatus = decision === "APROBADO" ? "EN TALLER" : "SIN REPARAR";
  const evidence = String(comment || "").trim();
  const performedBy = actor || "OptiFix";
  const history = [...(order.linea_tiempo || []), {
    fecha: timestamp,
    estado_anterior: order.estado_actual,
    estado: "Decisión de presupuesto modificada",
    nuevo_estado: moveState ? targetStatus : order.estado_actual,
    realizado_por: performedBy,
    observacion: evidence,
    detalle: `${previousDecision} → ${decision}. ${evidence}`
  }];
  if (moveState && order.estado_actual !== targetStatus) history.push({
    fecha: timestamp,
    estado_anterior: order.estado_actual,
    estado: targetStatus,
    nuevo_estado: targetStatus,
    realizado_por: performedBy,
    observacion: "",
    detalle: `Estado actualizado a ${targetStatus} por modificación de la decisión del presupuesto.`
  });
  return {
    decisionPresupuesto: decision,
    fechaDecisionPresupuesto: timestamp,
    comentarioDecisionPresupuesto: evidence,
    usuarioQueRegistroDecision: performedBy,
    presupuesto_estado: decision,
    ...(moveState ? { estado_actual: targetStatus, etapa_categoria: targetStatus } : {}),
    ...(decision === "RECHAZADO" ? { motivo_sin_reparar: evidence } : {}),
    linea_tiempo: history
  };
}

export function BudgetTab({ order, onSave, onDecision, onEditDecision, currentUser, toast }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState("");
  const [optimisticIva, setOptimisticIva] = useState(Boolean(order.presupuesto_aplica_iva));
  const [optimisticAdvance, setOptimisticAdvance] = useState(Number(order.adelanto) || 0);
  const [advanceEditing, setAdvanceEditing] = useState(false);
  const [decision, setDecision] = useState(null);
  useEffect(() => setOptimisticIva(Boolean(order.presupuesto_aplica_iva)), [order.presupuesto_aplica_iva]);
  useEffect(() => setOptimisticAdvance(Number(order.adelanto) || 0), [order.adelanto]);
  const totals = useMemo(() => getBudgetTotals({ ...order, presupuesto_aplica_iva: optimisticIva, adelanto: optimisticAdvance }), [order, optimisticIva, optimisticAdvance]);
  const persist = async (changes, message, key = "budget") => { setError(""); setSavingKey(key); try { await onSave(changes); toast(message); return true; } catch (saveError) { setError(saveError.message || "No se pudo guardar el presupuesto."); return false; } finally { setSavingKey(""); } };
  const toggleIva = async (checked) => { const previous = optimisticIva; setOptimisticIva(checked); const saved = await persist({ presupuesto_aplica_iva: checked }, "IVA actualizado correctamente.", "iva"); if (!saved) { setOptimisticIva(previous); setError("No se pudo actualizar el IVA. Intenta nuevamente."); } };
  const saveAdvance = async (value) => { const previous = optimisticAdvance; setOptimisticAdvance(value); const saved = await persist({ adelanto: value }, "Adelanto actualizado correctamente.", "advance"); if (!saved) { setOptimisticAdvance(previous); throw new Error("No se pudo actualizar el adelanto. Intenta nuevamente."); } setAdvanceEditing(false); };
  const remove = (id) => { if (window.confirm("¿Eliminar este producto o servicio de la orden?")) persist({ presupuesto_conceptos: totals.concepts.filter((item) => item.id !== id) }, "Producto o servicio eliminado."); };
  return <section className="budget-tab-card" aria-labelledby="budget-tab-title">
    <header><div><span>CONTROL FINANCIERO</span><h2 id="budget-tab-title">Productos y servicios</h2><p>Conceptos incluidos en la reparación.</p></div><button className="btn-primary" type="button" onClick={() => setEditing({})}><Icono nombre="plus" size={14} />Agregar producto/servicio</button></header>
    <div className="budget-table-wrap"><table className="budget-table"><thead><tr><th>Tipo</th><th>Descripción</th><th>Cantidad</th><th>Precio unitario</th><th>Importe</th><th>Acciones</th></tr></thead><tbody>{totals.concepts.length ? totals.concepts.map((item) => <tr key={item.id}><td><span className="concept-type">{item.tipo}</span></td><td>{item.descripcion}</td><td>{item.cantidad}</td><td>{formatColones(item.precio_unitario)}</td><td><strong>{formatColones(item.cantidad * item.precio_unitario)}</strong></td><td><div className="budget-actions"><button type="button" onClick={() => setEditing(item)} aria-label={`Editar ${item.descripcion}`} title="Editar concepto"><Icono nombre="edit" size={15} /></button><button type="button" onClick={() => remove(item.id)} aria-label={`Eliminar ${item.descripcion}`} title="Eliminar concepto"><Icono nombre="trash" size={15} /></button></div></td></tr>) : <tr><td colSpan="6" className="budget-empty">Sin conceptos cotizados.</td></tr>}</tbody></table></div>
    <div className="budget-bottom"><aside className="budget-summary"><h3>Resumen</h3>{totals.pending ? <p className="budget-pending"><span>Presupuesto</span><strong>Pendiente de cotización</strong></p> : <p><span>Subtotal</span><strong>{formatColones(totals.subtotal)}</strong></p>}<p className="vat-summary-row"><span>IVA (13%) <button type="button" className="vat-help" title="Aplicar IVA (13%) al total de productos y servicios." aria-label="Información sobre IVA">?</button></span><label className="budget-switch compact"><input type="checkbox" checked={optimisticIva} disabled={savingKey === "iva"} onChange={(event) => toggleIva(event.target.checked)} /><span /><span className="sr-only">Aplicar IVA (13%)</span></label><strong>{formatColones(totals.tax)}</strong></p>{savingKey === "iva" && <small className="save-feedback">Guardando IVA…</small>}<p className="major"><span>Total</span><strong>{formatColones(totals.total)}</strong></p><p className="advance-summary-row"><span>Adelanto recibido</span><strong>− {formatColones(totals.advance)}</strong><button type="button" onClick={() => setAdvanceEditing(true)} title="Editar adelanto recibido" aria-label="Editar adelanto recibido"><Icono nombre="edit" size={14} /></button></p><p className="balance"><span>Saldo pendiente</span><strong>{totals.pending ? "Pendiente de cotización" : formatColones(totals.balance)}</strong></p>{totals.credit > 0 && <p className="credit"><span>Saldo a favor</span><strong>{formatColones(totals.credit)}</strong></p>}</aside></div>
    {(String(order.estado_actual || "").toUpperCase() === "COMUNICANDO PRESUPUESTO" || order.decisionPresupuesto) && <BudgetDecisionCard order={order} totals={totals} onChoose={setDecision} onEdit={onEditDecision} />}
    {error && <p className="form-error" role="alert">{error}</p>}
    {editing && <BudgetConceptModal concept={editing} onClose={() => setEditing(null)} onSave={async (concept) => { const normalized = normalizeConcept(concept); const exists = totals.concepts.some((item) => item.id === normalized.id); const saved = await persist({ presupuesto_conceptos: exists ? totals.concepts.map((item) => item.id === normalized.id ? normalized : item) : [...totals.concepts, normalized] }, exists ? "Producto/servicio actualizado correctamente." : "Producto/servicio agregado correctamente.", "concept"); if (!saved) throw new Error("No se pudo guardar el producto/servicio. Inténtalo nuevamente."); setEditing(null); }} />}
    {advanceEditing && <AdvanceModal value={optimisticAdvance} onClose={() => setAdvanceEditing(false)} onSave={saveAdvance} />}
    {decision && <BudgetDecisionModal decision={decision} currentUser={currentUser} onClose={() => setDecision(null)} onConfirm={async (comment) => { await onDecision(decision, comment); setDecision(null); }} />}
  </section>;
}

function BudgetDecisionCard({ order, totals, onChoose, onEdit }) {
  const status = order.decisionPresupuesto || "PENDIENTE";
  return <section className={`budget-decision-card ${status.toLowerCase()}`} aria-labelledby="budget-decision-title"><div><span>DECISIÓN DEL CLIENTE</span><h3 id="budget-decision-title">Presupuesto comunicado: {formatColones(totals.total)}</h3>{status === "PENDIENTE" ? <p>Estado de respuesta: <strong>Pendiente de confirmación</strong></p> : <><p><strong>{status === "APROBADO" ? "✓ PRESUPUESTO APROBADO" : "✕ PRESUPUESTO RECHAZADO"}</strong> <button type="button" className="budget-decision-edit" onClick={onEdit} title="Modificar decisión del presupuesto" aria-label="Modificar decisión del presupuesto"><Icono nombre="edit" size={14} /></button></p><blockquote>{order.comentarioDecisionPresupuesto}</blockquote><small>{order.fechaDecisionPresupuesto} · Registrado por: {order.usuarioQueRegistroDecision || "No cargado"}</small></>}</div>{status === "PENDIENTE" && <div className="budget-decision-actions"><button type="button" className="approve" onClick={() => onChoose("APROBADO")}><Icono nombre="check-circle" size={16} />Aprobar presupuesto</button><button type="button" className="reject" onClick={() => onChoose("RECHAZADO")}><Icono nombre="x" size={16} />Rechazar presupuesto</button></div>}</section>;
}

export function BudgetDecisionEditModal({ order, onClose, onSave }) {
  const dialogRef = useFocusTrap(true, onClose);
  const [decision, setDecision] = useState(order.decisionPresupuesto || "APROBADO");
  const [comment, setComment] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const targetStatus = decision === "APROBADO" ? "EN TALLER" : "SIN REPARAR";
  const continueToConfirmation = (event) => { event.preventDefault(); if (decision === order.decisionPresupuesto) return setError("Seleccione una decisión diferente a la actual."); if (!comment.trim()) return setError("El motivo o comentario del cambio es obligatorio."); setError(""); setConfirming(true); };
  const save = async (moveState) => { setSaving(true); setError(""); try { await onSave(decision, comment.trim(), moveState); } catch (saveError) { setError(saveError.message || "No se pudo modificar la decisión."); setSaving(false); } };
  return <div className="order-edit-overlay" onMouseDown={saving ? undefined : onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="edit-budget-decision-title" className="order-edit-modal budget-decision-modal" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="edit-budget-decision-title">Modificar decisión del presupuesto</h2><button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar"><Icono nombre="x" size={18} /></button></header>{!confirming ? <form onSubmit={continueToConfirmation}><div className="current-budget-decision"><span>Decisión actual</span><strong>{order.decisionPresupuesto}</strong></div><label>Nueva decisión<select value={decision} onChange={(event) => setDecision(event.target.value)} disabled={saving}><option value="APROBADO">APROBADO</option><option value="RECHAZADO">RECHAZADO</option></select></label><label>Motivo / comentario del cambio *<textarea autoFocus rows="4" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Explicá por qué cambió la decisión del cliente." disabled={saving} /></label>{error && <p className="form-error" role="alert">{error}</p>}<footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="primary">Guardar cambio</button></footer></form> : <div className="budget-decision-confirm"><p>{decision === "APROBADO" ? "El cliente aprobó el presupuesto." : "El cliente rechazó el presupuesto."}<br />¿Desea mover la orden a <strong>{targetStatus}</strong>?</p>{error && <p className="form-error" role="alert">{error}</p>}<footer><button type="button" onClick={() => save(false)} disabled={saving}>Mantener estado actual</button><button type="button" className="primary" onClick={() => save(true)} disabled={saving}>{saving ? "Guardando…" : `Mover a ${targetStatus === "EN TALLER" ? "En taller" : "Sin reparar"}`}</button></footer></div>}</section></div>;
}

function BudgetDecisionModal({ decision, onClose, onConfirm }) {
  const dialogRef = useFocusTrap(true, onClose);
  const approval = decision === "APROBADO";
  const [comment, setComment] = useState(() => approval ? "Cliente acepta presupuesto vía WhatsApp." : "Cliente no está de acuerdo con el monto total."); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); if (!comment.trim()) return setError("Registre el comentario o evidencia de la decisión."); setSaving(true); try { await onConfirm(comment.trim()); } catch (saveError) { setError(saveError.message || "No se pudo registrar la decisión."); setSaving(false); } };
  const examples = approval ? ["Cliente acepta presupuesto vía WhatsApp.", "Cliente confirma reparación por llamada telefónica.", "Cliente aprueba el presupuesto personalmente en el taller."] : ["Cliente rechaza presupuesto vía WhatsApp.", "Cliente no desea invertir en la reparación.", "Cliente solicita retirar el equipo sin reparar."];
  return <div className="order-edit-overlay" onMouseDown={onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="decision-modal-title" className="order-edit-modal budget-decision-modal" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="decision-modal-title">{approval ? "Aprobar presupuesto" : "Rechazar presupuesto"}</h2><button type="button" onClick={onClose} aria-label="Cerrar"><Icono nombre="x" size={18} /></button></header><form onSubmit={submit}><p>{approval ? "El cliente confirmó que desea realizar la reparación." : "Registre por qué el cliente no autoriza la reparación."}</p><label>Comentario / evidencia de confirmación<textarea autoFocus rows="4" value={comment} onChange={(event) => setComment(event.target.value)} placeholder={approval ? "Ej. Cliente acepta presupuesto vía WhatsApp." : "Ej. Cliente rechaza presupuesto vía WhatsApp por costo de reparación."} /></label><div className="decision-examples"><small>Ejemplos:</small>{examples.map((example) => <span key={example}>• {example}</span>)}</div>{error && <p className="form-error" role="alert">{error}</p>}<footer><button type="button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className={approval ? "primary" : "danger"} disabled={saving}>{saving ? "Guardando…" : approval ? "Confirmar aprobación" : "Confirmar rechazo"}</button></footer></form></section></div>;
}

function BudgetConceptModal({ concept, onClose, onSave }) {
  const dialogRef = useFocusTrap(true, onClose);
  const [draft, setDraft] = useState(() => normalizeConcept(concept));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => dialogRef.current?.focus(), [dialogRef]);
  const submit = async (event) => { event.preventDefault(); const quantity = Number(draft.cantidad); const price = Number(draft.precio_unitario); if (!draft.descripcion.trim()) return setError("Ingrese una descripción."); if (!Number.isFinite(quantity) || quantity <= 0) return setError("La cantidad debe ser mayor que cero."); if (!Number.isFinite(price) || price < 0) return setError("El precio debe ser igual o mayor que cero."); setSaving(true); setError(""); try { await onSave({ ...draft, cantidad: quantity, precio_unitario: price }); } catch (saveError) { setError(saveError.message || "No se pudo guardar el producto/servicio. Inténtalo nuevamente."); setSaving(false); } };
  return <div className="order-edit-overlay" onMouseDown={saving ? undefined : onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="concept-modal-title" className="order-edit-modal budget-concept-modal" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="concept-modal-title">{concept.descripcion ? "Editar concepto" : "Agregar concepto"}</h2><button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar"><Icono nombre="x" size={18} /></button></header><form onSubmit={submit}><label>Tipo<select value={draft.tipo} disabled={saving} onChange={(event) => setDraft({ ...draft, tipo: event.target.value })}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label><label>Descripción<input autoFocus value={draft.descripcion} disabled={saving} onChange={(event) => setDraft({ ...draft, descripcion: event.target.value })} /></label><div className="concept-number-grid"><label>Cantidad<input type="number" min="0.01" step="0.01" value={draft.cantidad} disabled={saving} onChange={(event) => setDraft({ ...draft, cantidad: event.target.value })} /></label><label>Precio unitario<input type="number" min="0" step="1" value={draft.precio_unitario} disabled={saving} onChange={(event) => setDraft({ ...draft, precio_unitario: event.target.value })} /></label></div><p className="concept-preview">Importe estimado: <strong>{formatColones((Number(draft.cantidad) || 0) * (Number(draft.precio_unitario) || 0))}</strong></p>{error && <p className="form-error" role="alert">{error}</p>}<footer><button type="button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary" disabled={saving}>{saving ? "Guardando…" : "Guardar concepto"}</button></footer></form></section></div>;
}

function AdvanceModal({ value, onClose, onSave }) {
  const dialogRef = useFocusTrap(true, onClose); const [draft, setDraft] = useState(String(value || 0)); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); const amount = Number(draft); if (!Number.isFinite(amount) || amount < 0) return setError("Ingrese un monto válido, igual o mayor que cero."); setSaving(true); setError(""); try { await onSave(amount); } catch (saveError) { setError(saveError.message || "No se pudo actualizar el adelanto."); setSaving(false); } };
  return <div className="order-edit-overlay" onMouseDown={saving ? undefined : onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="advance-modal-title" className="order-edit-modal advance-modal" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="advance-modal-title">Editar adelanto</h2><button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar"><Icono nombre="x" size={18} /></button></header><form onSubmit={submit}><label>Monto recibido<input autoFocus type="number" min="0" step="1" value={draft} disabled={saving} onChange={(event) => setDraft(event.target.value)} /></label><small>Monto recibido por revisión/diagnóstico y aplicable al costo de reparación.</small>{error && <p className="form-error" role="alert">{error}</p>}<footer><button type="button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button></footer></form></section></div>;
}
