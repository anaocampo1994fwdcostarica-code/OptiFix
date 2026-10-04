import React, { useMemo, useState } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import Icono from "../icons.jsx";
import { normalizeOrderStatus } from "../../utils/estadoColors.js";

export const safeValue = (value, fallback = "No cargado") => value === null || value === undefined || String(value).trim() === "" ? fallback : value;
export const formatColones = (value) => {
  const amount = Math.round(Number(value) || 0);
  const parts = new Intl.NumberFormat("es-CR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).formatToParts(amount);
  return `₡${parts.map((part) => part.type === "group" ? "." : part.value).join("").replace(/\s/g, "")}`;
};

export function CustomerCard({ customer, onOpenRecord, whatsappMessage = "" }) {
  const phoneDigits = String(customer.telefono || "").replace(/\D/g, "");
  return <article className="order-entity-card">
    <div className="order-entity-icon"><Icono nombre="users" size={24} /></div>
    <div className="order-entity-content">
      <span className="order-entity-kicker">Cédula {safeValue(customer.identificacion)}</span>
      <h2>{safeValue(customer.nombre)}</h2>
      <p><Icono nombre="mail" size={14} />{safeValue(customer.email)}</p>
      <p><Icono nombre="phone" size={14} />{safeValue(customer.telefono)}</p>
    </div>
    <div className="order-entity-actions">
      {phoneDigits && <a href={"https://wa.me/" + phoneDigits + (whatsappMessage ? "?text=" + encodeURIComponent(whatsappMessage) : "")} target="_blank" rel="noreferrer" aria-label="Contactar cliente por WhatsApp" title="Contactar por WhatsApp"><Icono nombre="whatsapp" size={16} /></a>}
      <button type="button" onClick={onOpenRecord} aria-label="Ver ficha del cliente" title="Ver ficha del cliente"><Icono nombre="eye" size={16} /></button>
    </div>
  </article>;
}

export function EquipmentCard({ equipment, onOpenRecord }) {
  return <article className="order-entity-card">
    <div className="order-entity-icon"><Icono nombre="laptop" size={24} /></div>
    <div className="order-entity-content">
      <span className="order-entity-kicker">{safeValue(equipment.tipo).toString().toUpperCase()}</span>
      <h2>{safeValue(equipment.marca)}</h2>
      <strong className="order-equipment-model">{safeValue(equipment.modelo)}</strong>
      <p><Icono nombre="key" size={14} />Serie: {safeValue(equipment.serie)}</p>
    </div>
    <div className="order-entity-actions"><button type="button" onClick={onOpenRecord} aria-label="Ver ficha del equipo" title="Ver ficha del equipo"><Icono nombre="eye" size={16} /></button></div>
  </article>;
}

const FLOW = [
  { id: "RECEPCIÓN", label: "Recepción", help: "Equipo recibido y registrado." },
  { id: "ANÁLISIS TÉCNICO", label: "Análisis técnico", help: "Unidad asignada para evaluación técnica." },
  { id: "EN TALLER", label: "En taller", help: "Reparación, pruebas o espera de repuesto." },
  { id: "COMUNICANDO PRESUPUESTO", label: "Comunicando presupuesto", help: "Presupuesto comunicado; se espera decisión." },
  { id: "RESULTADO", label: "Resultado", help: "Resultado alternativo: Reparado o Sin reparar." },
  { id: "ENTREGADO", label: "Entregado", help: "Equipo entregado al cliente; orden finalizada." }
];

function currentFlow(order) { const status = normalizeOrderStatus(order.estado_actual, order.etapa_categoria, order.fecha_entrega); if (status === "ENTREGADO") return { index: 5, result: "" }; if (status === "REPARADO" || status === "SIN REPARAR") return { index: 4, result: status }; return { index: Math.max(0, FLOW.findIndex((step) => step.id === status)), result: "" }; }

export function OrderStatusFlow({ order }) {
  const current = currentFlow(order);
  return <section className="order-status-flow" aria-label={"Flujo de estado. Estado actual: " + safeValue(order.estado_actual)}>
    {FLOW.map((step, index) => <React.Fragment key={step.id}>
      <div className={"status-flow-step " + (index < current.index ? "completed " : "") + (index === current.index ? "current " : "")} title={step.help}>
        <span>{index < current.index ? "✓" : index + 1}</span>
        <strong>{step.label}</strong>
        {step.id === "RESULTADO" && <small className={current.result === "SIN REPARAR" ? "negative" : current.result === "REPARADO" ? "positive" : ""}>{current.result || "Reparado / Sin reparar"}</small>}
      </div>
      {index < FLOW.length - 1 && <i aria-hidden="true"><Icono nombre="chevron-right" size={15} /></i>}
    </React.Fragment>)}
  </section>;
}

export function OrderSummary({ order, onEditExternal, onEditResponsible, onToggleWarranty, onEditBudgetDecision, isUpdatingWarranty = false }) {
  const budgetDecision = order.decisionPresupuesto || "PENDIENTE";
  const hasBudgetDecisionContext = Boolean(order.decisionPresupuesto || (order.presupuesto_conceptos || []).length || normalizeOrderStatus(order.estado_actual, order.etapa_categoria, order.fecha_entrega) === "COMUNICANDO PRESUPUESTO");
  return <article className="order-summary-card">
    <header>
      <h2>Orden #{order.numero} <span className="external-reference">/ Ext. # {safeValue(order.referencia_externa, "Sin asignar")} <button type="button" onClick={onEditExternal} aria-label="Editar referencia externa" title="Editar referencia externa"><Icono nombre="edit" size={14} /></button></span></h2>
      <div className="order-state-badges"><span className="current-order-state"><span className="current-state-dot" aria-hidden="true" /> Estado actual: {normalizeOrderStatus(order.estado_actual, order.etapa_categoria, order.fecha_entrega)}</span>{hasBudgetDecisionContext && <span className={`budget-decision-badge ${budgetDecision.toLowerCase()}`}>Presupuesto: {budgetDecision === "APROBADO" ? "✓ APROBADO" : budgetDecision === "RECHAZADO" ? "✕ RECHAZADO" : "PENDIENTE DE RESPUESTA"}{order.decisionPresupuesto && <button type="button" onClick={onEditBudgetDecision} title="Modificar decisión del presupuesto" aria-label="Modificar decisión del presupuesto"><Icono nombre="edit" size={12} /></button>}</span>}</div>
    </header>
    <div className="order-summary-grid">
      <section className="order-summary-details">
        <p className="responsible-field"><strong>Responsable:</strong><span className="responsible-value">{order.responsable && !["OptiFix", "Técnico Principal"].includes(order.responsable) ? order.responsable : "Sin asignar"}<button type="button" onClick={onEditResponsible} aria-label="Cambiar técnico responsable" title="Cambiar técnico responsable"><Icono nombre="edit" size={14} /></button></span></p>
        <p><strong>Ingresado:</strong><span>{safeValue(order.fecha_ingreso)}</span></p>
        <p><strong>Daño:</strong><span>{safeValue(order.trabajo_solicitado)}</span></p>
        <p><strong>Descripción del estado:</strong><span>{safeValue(order.descripcion_estado)}</span></p>
        <p><strong>Accesorios:</strong><span>{safeValue(order.accesorios, "Sin accesorios registrados")}</span></p>
      </section>
      <aside className="order-summary-warranty">
        <div className="warranty-row"><div><span>Garantía</span><strong>{isUpdatingWarranty ? "Guardando…" : order.garantia ? "Con garantía" : "Sin garantía"}</strong></div><button type="button" role="switch" aria-checked={Boolean(order.garantia)} aria-label="Cambiar garantía" disabled={isUpdatingWarranty} className={"warranty-switch " + (order.garantia ? "on" : "")} onClick={onToggleWarranty}><span /></button></div>
      </aside>
    </div>
  </article>;
}

function uniqueOrders(orders) { return [...new Map(orders.map((order) => [order.id || order.numero, order])).values()]; }
const normalizedSerial = (serial) => String(serial || "").trim().toLowerCase();

export function getRelatedHistoryCount(currentOrder, currentEquipment, orders, equipment) {
  const serial = normalizedSerial(currentEquipment.serie);
  const equipmentIds = new Set(serial ? equipment.filter((item) => normalizedSerial(item.serie) === serial).map((item) => item.id) : []);
  return uniqueOrders(orders.filter((order) => order.id !== currentOrder.id && (order.cliente_id === currentOrder.cliente_id || equipmentIds.has(order.equipo_id)))).length;
}

export function RelatedHistoryDrawer({ currentOrder, customer, currentEquipment, orders, equipment, onClose, onOpenOrder }) {
  const drawerRef = useFocusTrap(true, onClose);
  const [tab, setTab] = useState("customer");
  const equipmentById = useMemo(() => new Map(equipment.map((item) => [item.id, item])), [equipment]);
  const customerOrders = useMemo(() => uniqueOrders(orders.filter((order) => order.cliente_id === customer.id)), [customer.id, orders]);
  const serial = normalizedSerial(currentEquipment.serie);
  const serialEquipmentIds = useMemo(() => new Set(serial ? equipment.filter((item) => normalizedSerial(item.serie) === serial).map((item) => item.id) : []), [equipment, serial]);
  const equipmentOrders = useMemo(() => uniqueOrders(orders.filter((order) => serialEquipmentIds.has(order.equipo_id))), [orders, serialEquipmentIds]);
  const list = tab === "customer" ? customerOrders : equipmentOrders;

  return <div className="related-history-overlay" onMouseDown={onClose}>
    <aside ref={drawerRef} tabIndex={-1} className="related-history-drawer" role="dialog" aria-modal="true" aria-labelledby="history-drawer-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span>EXPEDIENTE OPERATIVO</span><h2 id="history-drawer-title">Historial relacionado</h2></div><button type="button" onClick={onClose} aria-label="Cerrar historial"><Icono nombre="x" size={20} /></button></header>
      <div className="history-drawer-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === "customer"} className={tab === "customer" ? "active" : ""} onClick={() => setTab("customer")}>Historial del cliente</button><button type="button" role="tab" aria-selected={tab === "equipment"} className={tab === "equipment" ? "active" : ""} onClick={() => setTab("equipment")}>Historial del equipo</button></div>
      <div className="history-drawer-context">{tab === "customer" ? <><span>Cédula / ID único</span><strong>{safeValue(customer.identificacion)}</strong></> : <><span>Número de serie</span><strong>{safeValue(currentEquipment.serie)}</strong></>}</div>
      <div className="history-records">
        {tab === "equipment" && !serial ? <HistoryEmpty text="Este equipo no tiene un número de serie registrado." /> : list.length ? list.map((order) => {
          const itemEquipment = equipmentById.get(order.equipo_id) || {};
          return <article key={order.id || order.numero} className={order.id === currentOrder.id ? "current" : ""}><div><span>Orden #{order.numero}{order.id === currentOrder.id ? " · Actual" : ""}</span><h3>{[safeValue(itemEquipment.marca), safeValue(itemEquipment.modelo)].join(" ")}</h3><p>{safeValue(order.trabajo_solicitado)}</p><small>{safeValue(order.fecha_ingreso)} · Estado: {safeValue(order.estado_actual)}</small></div><button type="button" onClick={() => onOpenOrder(order.numero)}>Ver orden</button></article>;
        }) : <HistoryEmpty text={tab === "equipment" ? "No se encontraron reparaciones anteriores para este equipo." : "No se encontraron otras órdenes para este cliente."} />}
      </div>
    </aside>
  </div>;
}

function HistoryEmpty({ text }) { return <div className="history-empty"><Icono nombre="history" size={25} /><strong>Sin antecedentes</strong><p>{text}</p></div>; }

export function EditOrderFieldModal({ title, label, value, type = "text", options, onClose, onSave }) {
  const dialogRef = useFocusTrap(true, onClose);
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (type === "number" && (draft === "" || Number(draft) < 0 || !Number.isFinite(Number(draft)))) { setError("Ingrese un monto numérico válido."); return; }
    setSaving(true); setError("");
    try { await onSave(type === "number" ? Number(draft) : String(draft).trim()); }
    catch (saveError) { setError(saveError.message || "No se pudo guardar el cambio."); setSaving(false); }
  };
  return <div className="order-edit-overlay" onMouseDown={onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="edit-order-field-title" className="order-edit-modal" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="edit-order-field-title">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar"><Icono nombre="x" size={18} /></button></header><form onSubmit={submit}><label>{label}{options ? <select value={draft} onChange={(event) => setDraft(event.target.value)} required disabled={saving}><option value="">Seleccione una opción</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus disabled={saving} />}</label>{error && <p role="alert">{error}</p>}<footer><button type="button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary" disabled={saving}>{saving ? "Guardando…" : title.includes("responsable") ? "Guardar asignación" : "Guardar cambios"}</button></footer></form></section></div>;
}
