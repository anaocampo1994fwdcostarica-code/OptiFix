import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Icono from "../components/icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { getEstadoBadge } from "../utils/estadoColors.js";
import CambiarEstadoModal from "../components/modals/CambiarEstadoModal.jsx";
import { VistaPreviaReporteOrden } from "../components/ReporteOrdenPDF.jsx";
import { WORKSHOP_NAME } from "../config/workshop.js";
import { useAuth } from "../hooks/useAuth.js";
import { normalizeOrderStatus } from "../utils/estadoColors.js";
import { CustomerCard, EquipmentCard, EditOrderFieldModal, getRelatedHistoryCount, OrderSummary, RelatedHistoryDrawer, formatColones } from "../components/order/OrderDetailComponents.jsx";
import { BudgetDecisionEditModal, BudgetTab, createBudgetDecisionChanges, createBudgetDecisionRevisionChanges, EntityEditModal, getBudgetTotals } from "../components/order/OrderManagementPanels.jsx";
import "./OrdenDetalle.css";
import "./OrdenDetallePolish.css";
import "./BudgetDecision.css";

export default function OrdenDetalle() {
  const { numero } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    ordenes,
    clientes,
    equipos,
    addProductService,
    removeProductService,
    toggleTarea,
    addTarea,
    addNota,
    addArchivo,
    deleteArchivo,
    changeOrdenStatus,
    deleteOrden,
    updateOrden,
    updateCliente,
    updateEquipo,
    usuarios,
    addNotification
  } = useWorkshop();

  const tabStorageKey = `optifix_order_tab_${numero}`;
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem(tabStorageKey);
    return savedTab === "presupuesto" ? "productos" : savedTab || "productos";
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nuevaTareaTexto, setNuevaTareaTexto] = useState("");
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState("");
  const [archivosPendientes, setArchivosPendientes] = useState([]);
  const [archivoVistaPrevia, setArchivoVistaPrevia] = useState(null);
  const [mostrarVistaPreviaReporte, setMostrarVistaPreviaReporte] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [detailToast, setDetailToast] = useState("");
  const [entityEditor, setEntityEditor] = useState(null);
  const [isUpdatingWarranty, setIsUpdatingWarranty] = useState(false);
  const [isBudgetDecisionEditOpen, setIsBudgetDecisionEditOpen] = useState(false);
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState("actions");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const componenteImprimirRef = useRef(null);
  const fileInputRef = useRef(null);

  const orden = ordenes.find((o) => String(o.numero) === String(numero) || o.id === numero);

  // Los hooks deben ejecutarse siempre en el mismo orden. Antes este hook estaba
  // debajo del retorno de "orden no encontrada": si la colección remota quedaba
  // momentáneamente sin la orden y luego regresaba, React detectaba un hook nuevo
  // y desmontaba la vista con un error de render.
  const reactToPrint = useReactToPrint({
    contentRef: componenteImprimirRef,
    documentTitle: `Orden_Servicio_${orden?.numero || numero}`,
    pageStyle: `
      @page { size: auto; margin: 12mm; }
      html, body { background: #ffffff !important; color: #111827 !important; }
      .print-order-template { display: block !important; visibility: visible !important; background: #ffffff !important; color: #111827 !important; }
      .print-order-template * { visibility: visible !important; }
    `
  });

  useEffect(() => {
    if (!detailToast) return undefined;
    const timer = window.setTimeout(() => setDetailToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [detailToast]);

  useEffect(() => { sessionStorage.setItem(tabStorageKey, activeTab); }, [activeTab, tabStorageKey]);

  if (!orden) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ color: "#ffffff", marginBottom: "12px" }}>Orden no encontrada</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          La orden de trabajo #{numero} no existe o fue eliminada.
        </p>
        <button className="btn-primary" onClick={() => navigate("/ordenes")}>
          Volver al listado de órdenes
        </button>
      </div>
    );
  }

  const cliente = clientes.find((c) => c.id === orden.cliente_id) || {};
  const equipo = equipos.find((e) => e.id === orden.equipo_id) || {};
  const relatedHistoryCount = getRelatedHistoryCount(orden, equipo, ordenes, equipos);
  const technicianOptions = usuarios.filter((registeredUser) => registeredUser.rol === "tecnico" && registeredUser.nombre !== "Técnico Principal").map((registeredUser) => ({ value: registeredUser.nombre, label: registeredUser.especialidad ? `${registeredUser.nombre} · ${registeredUser.especialidad}` : `${registeredUser.nombre} · Técnico` }));
  if (orden.responsable && !["OptiFix", "Técnico Principal"].includes(orden.responsable) && !technicianOptions.some((option) => option.value === orden.responsable)) technicianOptions.unshift({ value: orden.responsable, label: orden.responsable });

  // Cálculos de productos y servicios
  const items = (orden.presupuesto_conceptos || []).map((item) => ({ ...item, importe: Number(item.precio_unitario) || 0 }));
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.cantidad) || 1) * (Number(curr.importe) || 0), 0);
  const adelanto = Number(orden.adelanto) || 0;
  const budgetTotals = getBudgetTotals(orden);
  const total = budgetTotals.balance;

  const isEntregado = normalizeOrderStatus(orden.estado_actual, orden.etapa_categoria, orden.fecha_entrega) === "ENTREGADO";
  const handlePrint = () => {
    // Permite que React termine de pintar la orden antes de invocar el diálogo.
    reactToPrint();
  };
  const normalizeWhatsapp = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("506") && digits.length >= 11 ? digits : digits.length === 8 ? `506${digits}` : "";
  };
  const openWhatsappDialog = () => {
    const phone = normalizeWhatsapp(cliente?.telefono);
    if (!phone) return setDetailToast(cliente?.telefono ? "El número de WhatsApp del cliente no es válido." : "No hay un número de WhatsApp registrado para este cliente.");
    setWhatsappMessage(`Hola, ${cliente?.nombre || ""}. 👋\n\nLe informamos que su equipo ha sido registrado correctamente en ${WORKSHOP_NAME} con la orden N.º ${orden.numero}.\n\nLe mantendremos informado(a) sobre el avance de su servicio.\n\nGracias por confiar en nosotros.`);
    setWhatsappMode("actions");
    setIsWhatsappDialogOpen(true);
  };
  const openWhatsapp = (withPdf = false) => {
    const phone = normalizeWhatsapp(cliente?.telefono);
    if (!phone) return;
    const message = withPdf
      ? `Hola, ${cliente?.nombre || ""}.\n\nLe compartiremos el comprobante de su orden N.º ${orden.numero} de ${WORKSHOP_NAME}.\n\nEl documento se abrirá para imprimir o guardar como PDF. Por favor, adjúntelo manualmente en este chat.\n\nGracias por confiar en nosotros.`
      : whatsappMessage;
    if (withPdf) handlePrint();
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setIsWhatsappDialogOpen(false);
  };

  const handleDeleteOrden = async () => {
    if (user?.rol !== "admin") return;
    if (!window.confirm(`¿Eliminar permanentemente la orden N° ${orden.numero}?`)) return;
    try { await deleteOrden(orden.id); navigate("/ordenes"); } catch (error) { window.alert(error.message || "No se pudo eliminar la orden."); }
  };

  const saveOrderField = async (field, value) => {
    const changes = field.startsWith("archivo:")
      ? { archivos: (orden.archivos || []).map((archivo) => archivo.id === field.slice(8) ? { ...archivo, nombre: value } : archivo) }
      : field.startsWith("nota:")
        ? { notas: (orden.notas || []).map((nota) => nota.id === field.slice(5) ? { ...nota, texto: value } : nota) }
        : { [field]: value };
    if (field === "responsable" && value !== orden.responsable) {
      const now = new Date().toLocaleString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " hs";
      changes.linea_tiempo = [...(orden.linea_tiempo || []), { fecha: now, estado: orden.estado_actual, realizado_por: user?.nombre || WORKSHOP_NAME, detalle: `Responsable reasignado a ${value}` }];
    }
    try {
      await updateOrden(orden.id, changes);
      if (field === "responsable" && value !== orden.responsable) {
        addNotification?.({
          ordenNumero: orden.numero,
          titulo: "Orden asignada a técnico",
          descripcion: `La orden #${orden.numero} fue asignada a ${value}.`
        });
      }
      setEditField(null);
      setDetailToast("Cambios guardados correctamente.");
    } catch (error) {
      setDetailToast(error.message || "No se pudieron guardar los cambios.");
      throw error;
    }
  };

  const toggleOrderWarranty = async () => {
    if (isUpdatingWarranty) return;
    setIsUpdatingWarranty(true);
    try {
      await updateOrden(orden.id, { garantia: !orden.garantia });
      setDetailToast("Garantía actualizada correctamente.");
    } catch (error) {
      setDetailToast(error.message || "No se pudo guardar el cambio. Inténtalo nuevamente.");
    } finally {
      setIsUpdatingWarranty(false);
    }
  };

  const handleAddTareaSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaTareaTexto.trim()) return;
    const now = new Date().toLocaleString("es-CR");
    try {
      await updateOrden(orden.id, { tareas: [...(orden.tareas || []), { id: `t-${Date.now()}`, texto: nuevaTareaTexto.trim(), asignado_a: orden.responsable && orden.responsable !== "OptiFix" ? orden.responsable : "Sin asignar", fecha: now, prioridad: "Normal", estado: "Pendiente", completada: false }] });
      if (orden.responsable && orden.responsable !== "OptiFix") {
        addNotification?.({
          ordenNumero: orden.numero,
          titulo: "Nueva tarea asignada",
          descripcion: `Se asignó una tarea a ${orden.responsable} en la orden #${orden.numero}.`
        });
      }
      setNuevaTareaTexto("");
      setDetailToast("Tarea agregada correctamente.");
    } catch (error) { setDetailToast(error.message || "No se pudo guardar el cambio. Inténtalo nuevamente."); }
  };

  const handleAddNotaSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaNotaTexto.trim()) return;
    const now = new Date().toLocaleString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " hs";
    try {
      await updateOrden(orden.id, { notas: [...(orden.notas || []), { id: `n-${Date.now()}`, autor: user?.nombre || WORKSHOP_NAME, rol: user?.rol === "tecnico" ? "Técnico" : "Administrador", fecha: now, texto: nuevaNotaTexto.trim() }] });
      setNuevaNotaTexto("");
      setDetailToast("Trabajo registrado correctamente.");
    } catch (error) { setDetailToast(error.message || "No se pudo guardar el cambio. Inténtalo nuevamente."); }
  };

  const handleFileChange = async (event) => {
    const archivos = Array.from(event.target.files || []);
    if (!archivos.length) return;
    const pendientes = await Promise.all(archivos.map(async (archivo) => ({
      id: `pendiente-${archivo.name}-${archivo.lastModified}`,
      nombre: archivo.name,
      tipo: archivo.type || "application/octet-stream",
      tamano: `${(archivo.size / 1024 / 1024).toFixed(2)} MB`,
      preview: archivo.type.startsWith("image/") ? URL.createObjectURL(archivo) : null,
      vistaPrevia: archivo.type.startsWith("image/") ? await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(archivo); }) : null
    })));
    setArchivosPendientes((actuales) => [...actuales, ...pendientes]);
    event.target.value = "";
  };

  const guardarArchivosPendientes = async () => {
    const nuevos = archivosPendientes.map(({ nombre, tipo, tamano, vistaPrevia }, index) => ({ id: `arc-${Date.now()}-${index}`, nombre, tipo, tamano, vistaPrevia, fecha: new Date().toLocaleDateString("es-CR") }));
    try {
      await updateOrden(orden.id, { archivos: [...(orden.archivos || []), ...nuevos] });
      archivosPendientes.forEach(({ preview }) => { if (preview) URL.revokeObjectURL(preview); });
      setArchivosPendientes([]);
      setDetailToast("Archivos guardados correctamente.");
    } catch (error) { setDetailToast(error.message || "No se pudo guardar el cambio. Inténtalo nuevamente."); }
  };

  const saveEntity = async (changes) => {
    if (entityEditor === "customer") await updateCliente(cliente.id, changes);
    else await updateEquipo(equipo.id, changes);
    setEntityEditor(null);
    setDetailToast(entityEditor === "customer" ? "Cliente actualizado correctamente." : "Equipo actualizado correctamente.");
  };

  const toggleTaskPersisted = async (task) => {
    const completed = !task.completada;
    try {
      await updateOrden(orden.id, { tareas: (orden.tareas || []).map((item) => item.id === task.id ? { ...item, completada: completed, estado: completed ? "Completada" : "Pendiente" } : item) });
    } catch (error) { setDetailToast(error.message || "No se pudo guardar el cambio. Inténtalo nuevamente."); }
  };

  const removeOrderFile = async (fileId) => {
    if (!window.confirm("¿Eliminar este archivo de la orden?")) return;
    try {
      await updateOrden(orden.id, { archivos: (orden.archivos || []).filter((file) => file.id !== fileId) });
      setDetailToast("Archivo eliminado correctamente.");
    } catch (error) { setDetailToast(error.message || "No se pudo guardar el cambio. Inténtalo nuevamente."); }
  };

  const handleBudgetDecision = async (decision, comment) => {
    const now = new Date().toLocaleString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " hs";
    const changes = createBudgetDecisionChanges(orden, decision, comment, user?.nombre, now);
    await updateOrden(orden.id, changes);
    addNotification?.({ ordenNumero: orden.numero, titulo: decision === "APROBADO" ? "Presupuesto aprobado" : "Presupuesto rechazado", descripcion: comment });
    setDetailToast(decision === "APROBADO" ? "Presupuesto aprobado correctamente." : "Presupuesto rechazado correctamente.");
  };

  const handleBudgetDecisionRevision = async (decision, comment, moveState) => {
    const now = new Date().toLocaleString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " hs";
    const changes = createBudgetDecisionRevisionChanges(orden, decision, comment, user?.nombre, now, moveState);
    await updateOrden(orden.id, changes);
    setIsBudgetDecisionEditOpen(false);
    setDetailToast("Decisión del presupuesto modificada correctamente.");
  };

  const quitarArchivoPendiente = (id) => setArchivosPendientes((actuales) => {
    const archivo = actuales.find((item) => item.id === id);
    if (archivo?.preview) URL.revokeObjectURL(archivo.preview);
    return actuales.filter((item) => item.id !== id);
  });

  return (
    <div className="page-container printable-order">
      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
      {/* Debe estar montada para react-to-print, pero no puede usar display:none. */}
      <div className="print-source" aria-hidden="true">
        <PlantillaImpresion ref={componenteImprimirRef} datosOrden={{ orden, cliente, equipo, items, budgetTotals, archivos: orden.archivos || [] }} />
      </div>
      {mostrarVistaPreviaReporte && (
        <VistaPreviaReporteOrden
          orden={orden}
          cliente={cliente}
          equipo={equipo}
          archivos={orden.archivos || []}
          onClose={() => setMostrarVistaPreviaReporte(false)}
          onPrint={() => {
            setMostrarVistaPreviaReporte(false);
            window.setTimeout(handlePrint, 0);
          }}
        />
      )}
      {/* Breadcrumb idéntico a Captura 2 */}
      <div className="breadcrumb-nav">
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/ordenes")}>
          Principal
        </span>
        <span>&gt;</span>
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/ordenes")}>
          Taller
        </span>
        <span>&gt;</span>
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/ordenes")}>
          Órdenes
        </span>
        <span>&gt;</span>
        <span className="breadcrumb-current">Orden Nº {orden.numero}</span>
      </div>

      {/* Cabecera y Botones de Acción Superiores (Captura 1 y 2) */}
      <div className="order-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="btn-outline-icon"
            onClick={() => navigate("/ordenes")}
            title="Volver a la lista"
          >
            <Icono nombre="arrow-left" size={16} />
          </button>
          <h1 className="order-title-main">Orden N.º {orden.numero}</h1>
        </div>

        <div className="order-actions-bar">
          <button className="btn-outline-icon" onClick={() => setMostrarVistaPreviaReporte(true)} title="Imprimir orden" aria-label="Imprimir orden">
            <Icono nombre="printer" size={16} />
          </button>
          <button
            className="btn-outline-icon"
            onClick={openWhatsappDialog}
            title="Enviar mensaje por WhatsApp"
            aria-label="Enviar mensaje por WhatsApp"
          >
            <Icono nombre="whatsapp" size={16} />
          </button>
          <button
            className="btn-outline-icon order-history-button"
            onClick={() => setHistoryOpen(true)}
            title="Ver historial"
            aria-label={`Ver historial relacionado. ${relatedHistoryCount} antecedentes`}
          >
            <Icono nombre="history" size={16} />
            {relatedHistoryCount > 0 && <span>{relatedHistoryCount}</span>}
          </button>
          {user?.rol === "admin" && <button className="btn-outline-icon" onClick={handleDeleteOrden} title="Eliminar orden" aria-label={`Eliminar orden ${orden.numero}`}>
            <Icono nombre="trash" size={16} />
          </button>}
          <button
            className="btn-green-delivery"
            onClick={() => setIsStatusModalOpen(true)}
            title="Cambiar estado"
          >
            <Icono nombre="check-circle" size={15} />
            <span>{isEntregado ? "Ver Entrega" : "Cambiar estado"}</span>
          </button>
        </div>
      </div>

      {/* Banner de Entrega si está entregado (Captura 2) */}
      {isEntregado && (
        <div className="alert-banner-delivered">
          <Icono nombre="check-circle" size={20} />
          <span>¡Atención! Este equipo ya fue entregado.</span>
        </div>
      )}

      {/* Grilla Superior de 2 Tarjetas: Cliente & Equipo (Capturas 1 y 2) */}
      <div className="order-entity-grid">
        <CustomerCard customer={cliente} whatsappMessage={`Hola ${cliente.nombre || ""}, compartimos información de su orden N.º ${orden.numero} en OptiFix. Estado actual: ${orden.estado_actual}.`} onOpenRecord={() => setEntityEditor("customer")} />
        <EquipmentCard equipment={equipo} onOpenRecord={() => setEntityEditor("equipment")} />
      </div>
      {false && <>
      <div className="order-two-cards-grid">
        {/* Tarjeta de Cliente */}
        <div className="entity-info-card">
          <div className="entity-avatar-placeholder">
            <Icono nombre="camera-off" size={32} />
          </div>
          <div className="entity-details">
            <div className="entity-label-sub">
              Cédula {cliente.identificacion || "No cargado"}
            </div>
            <div className="entity-name-title" title={cliente.nombre}>
              {cliente.nombre || "No cargado"}
            </div>
            <div className="entity-meta-line">
              <Icono nombre="mail" size={13} />
              <span>{cliente.email || "No cargado"}</span>
            </div>
            <div className="entity-meta-line">
              <Icono nombre="phone" size={13} />
              <span>{cliente.telefono || "No cargado"}</span>
            </div>
          </div>
          <div className="entity-quick-actions">
            {cliente.telefono && (
              <a
                href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline-icon"
                title="Contactar por WhatsApp"
              >
                <Icono nombre="whatsapp" size={14} style={{ color: "#22c55e" }} />
              </a>
            )}
            <button
              className="btn-outline-icon"
              onClick={() => navigate(`/clientes?id=${cliente.id}`)}
              title="Ver ficha del cliente"
            >
              <Icono nombre="eye" size={14} />
            </button>
          </div>
        </div>

        {/* Tarjeta de Equipo */}
        <div className="entity-info-card">
          <div className="entity-avatar-placeholder">
            <Icono nombre="camera-off" size={32} />
          </div>
          <div className="entity-details">
            <div className="entity-label-sub">{equipo.tipo || "No cargado"}</div>
            <div className="entity-name-title">
              {equipo.marca || "No cargado"}, {equipo.modelo || "No cargado"}
            </div>
            <div className="entity-meta-line">
              <Icono nombre="laptop" size={13} />
              <span style={{ fontFamily: "monospace" }}>{equipo.serie || "No cargado"}</span>
            </div>
            <div className="entity-meta-line">
              <Icono nombre="lock" size={13} />
              <span>{equipo.notas || "No cargado"}</span>
            </div>
          </div>
          <div className="entity-quick-actions">
            <button
              className="btn-outline-icon"
              onClick={() => navigate(`/equipos?id=${equipo.id}`)}
              title="Ver historial del equipo"
            >
              <Icono nombre="eye" size={14} />
            </button>
          </div>
        </div>
      </div>
      </>}

      {/* Tarjeta Principal de Información de la Orden (Capturas 1 y 2) */}
      <OrderSummary
        order={orden}
        onEditExternal={() => setEditField({ field: "referencia_externa", title: "Referencia externa", label: "Número externo", value: orden.referencia_externa || "" })}
        onEditResponsible={() => setEditField({ field: "responsable", title: "Asignar técnico responsable", label: "Técnico", value: ["OptiFix", "Técnico Principal"].includes(orden.responsable) ? "" : orden.responsable || "", options: technicianOptions })}
        onToggleWarranty={toggleOrderWarranty}
        onEditBudgetDecision={() => setIsBudgetDecisionEditOpen(true)}
        isUpdatingWarranty={isUpdatingWarranty}
      />
      {false && <>
      <div className="work-order-meta-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", color: "#ffffff", fontWeight: 700 }}>
            Orden #{orden.numero} / Ext. #
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-dim)" }}>
            <span style={{ background: "var(--bg-input)", padding: "2px 8px", borderRadius: "4px" }}>
              💬 SMS Entrada
            </span>
            <span style={{ background: "var(--bg-input)", padding: "2px 8px", borderRadius: "4px" }}>
              💬 SMS Salida
            </span>
            <span style={{ background: "var(--bg-input)", padding: "2px 8px", borderRadius: "4px" }}>
              ✉️ Entrada
            </span>
            <span style={{ background: "var(--bg-input)", padding: "2px 8px", borderRadius: "4px" }}>
              ✉️ Salida
            </span>
            <span>👁️ 39</span>
            <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>⭐ 5/5</span>
          </div>
        </div>

        <div className="meta-grid-2col">
          <div>
            <div className="meta-field-item">
              <strong>Responsable:</strong> {WORKSHOP_NAME}
            </div>
            <div className="meta-field-item">
              <strong>📅 Ingresado:</strong> {orden.fecha_ingreso}
            </div>
            {orden.fecha_entrega && (
              <div className="meta-field-item">
                <strong>📦 Entregado:</strong> {orden.fecha_entrega}
              </div>
            )}
            <div className="meta-field-item" style={{ marginTop: "10px" }}>
              <strong>Trabajo:</strong> {orden.trabajo_solicitado}
            </div>
            <div className="meta-field-item">
              <strong>Descripción del estado:</strong> {orden.descripcion_estado}
            </div>
            {orden.accesorios && (
              <div className="meta-field-item">
                <strong>Accesorios:</strong> {orden.accesorios}
              </div>
            )}
          </div>

          <div>
            <div className="meta-finances">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontWeight: 600, color: "#ffffff" }}>Garantía:</span>
                <button
                  type="button"
                  onClick={() => toggleGarantia(orden.id)}
                  style={{
                    backgroundColor: orden.garantia ? "#22c55e" : "#475569",
                    color: "#ffffff",
                    border: "none",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {orden.garantia ? "ACTIVA" : "SIN GARANTÍA"}
                </button>
              </div>
              <div className="finance-row">
                <span>Presupuesto:</span>
                <strong>₡ {Number(orden.presupuesto).toFixed(2)}</strong>
              </div>
              <div className="finance-row">
                <span>Adelanto:</span>
                <strong style={{ color: "var(--accent-cyan)" }}>
                  ₡ {adelanto.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Fila de Estados / Chevrons (Captura 1 y 2) */}
        <div className="status-stage-wrapper">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div className="chevron-stages-chain">
              <div
                className="chevron-stage-pill"
                style={{ backgroundColor: "#0B1C30", color: "#ffffff" }}
              >
                {orden.etapa_categoria || "BODEGA"}
              </div>
              <div
                className="chevron-stage-pill"
                style={{ 
                  backgroundColor: getEstadoBadge(orden).bg, 
                  color: getEstadoBadge(orden).color 
                }}
              >
                <Icono nombre="chevron-right" size={12} />
                <span>{orden.estado_actual}</span>
              </div>
            </div>

            {orden.linea_tiempo && orden.linea_tiempo.length > 0 && (
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Último cambio de estado: {orden.linea_tiempo[orden.linea_tiempo.length - 1].fecha}.
                Realizado por: {orden.linea_tiempo[orden.linea_tiempo.length - 1].realizado_por === "OptiFix" ? WORKSHOP_NAME : (orden.linea_tiempo[orden.linea_tiempo.length - 1].realizado_por || WORKSHOP_NAME)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn-outline-icon" onClick={() => setMostrarVistaPreviaReporte(true)} title="Vista previa e impresión de orden">
              <Icono nombre="printer" size={16} />
            </button>
            <button
              className="btn-change-status"
              onClick={() => setIsStatusModalOpen(true)}
            >
              <span>Orden</span>
              <Icono nombre="arrow-right" size={14} />
            </button>
          </div>
        </div>
      </div>
      </>}

      {/* Pestañas de la Orden (Captura 1 y 2 + Alcance) */}
      <div className="order-tabs-bar">
        <button
          className={`order-tab-btn ${activeTab === "productos" ? "active" : ""}`}
          onClick={() => setActiveTab("productos")}
        >
          Productos/Servicios ({items.length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "notas" ? "active" : ""}`}
          onClick={() => setActiveTab("notas")}
        >
          Trabajo realizado ({(orden.notas || []).length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "archivos" ? "active" : ""}`}
          onClick={() => setActiveTab("archivos")}
        >
          Archivos ({(orden.archivos || []).length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "tareas" ? "active" : ""}`}
          onClick={() => setActiveTab("tareas")}
        >
          Tareas ({(orden.tareas || []).length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "linea_tiempo" ? "active" : ""}`}
          onClick={() => setActiveTab("linea_tiempo")}
        >
          Línea de tiempo ({(orden.linea_tiempo || []).length})
        </button>
      </div>

      {/* Contenido de las Pestañas */}

      {/* TAB 1: PRODUCTOS Y SERVICIOS (Captura 1) */}
      {activeTab === "productos" && (
        <BudgetTab order={orden} onSave={(changes) => updateOrden(orden.id, changes)} onDecision={handleBudgetDecision} onEditDecision={() => setIsBudgetDecisionEditOpen(true)} currentUser={user} toast={setDetailToast} />
      )}

      {/* TAB 2: TAREAS TÉCNICAS */}
      {activeTab === "tareas" && (
        <div className="work-order-meta-card">
          <h3 style={{ fontSize: "15px", color: "#ffffff", marginBottom: "14px" }}>
            Checklist de Procedimientos Técnicos
          </h3>

          {user?.rol === "admin" && <form onSubmit={handleAddTareaSubmit} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Escribe una nueva tarea técnica (ej. Cambio de pasta térmica, medición de bobinas)..."
              value={nuevaTareaTexto}
              onChange={(e) => setNuevaTareaTexto(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
              <Icono nombre="plus" size={14} />
              <span>Agregar Tarea</span>
            </button>
          </form>}

          <div style={{ display: "flex", flexDirection: "column" }}>
            {(orden.tareas || []).map((t) => (
              <div
                key={t.id}
                className={`task-item-row ${t.completada ? "completed" : ""}`}
                onClick={() => toggleTaskPersisted(t)}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={t.completada}
                  onChange={() => {}}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ flex: 1, color: t.completada ? "var(--text-dim)" : "#ffffff" }}>
                  {t.texto}
                </span>
                <div className="task-detail-meta"><small>{t.asignado_a || "Sin asignar"} · {t.fecha || "Sin fecha"} · {t.prioridad || "Normal"}</small><span className={`task-status-badge ${t.completada ? "completed" : "pending"}`}>{t.estado || (t.completada ? "Completada" : "Pendiente")}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRABAJO REALIZADO */}
      {activeTab === "notas" && (
        <div className="work-order-meta-card">
          <h3 style={{ fontSize: "15px", color: "#ffffff", marginBottom: "14px" }}>
            Trabajo realizado
          </h3>

          <form onSubmit={handleAddNotaSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Describa el trabajo realizado en el equipo..."
              value={nuevaNotaTexto}
              onChange={(e) => setNuevaNotaTexto(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary">
                + Registrar trabajo
              </button>
            </div>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(orden.notas || []).map((n) => (
              <div
                key={n.id}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "12px 16px"
                }}
              >
                <p style={{ color: "var(--text-main)", fontSize: "13px", fontWeight: 600 }}>{n.texto}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}><span>{["OptiFix", "Administrador OptiFix", "OptiFix Administrador"].includes(n.autor) ? WORKSHOP_NAME : (n.autor || WORKSHOP_NAME)} · {["OptiFix", "Administrador OptiFix", "OptiFix Administrador"].includes(n.autor) ? "Sistema" : (n.rol || "Administrador")}</span><span>{n.fecha}</span></div>
                {(user?.rol === "admin" || n.autor === user?.nombre) && <div className="note-actions"><button type="button" onClick={() => setEditField({ field: `nota:${n.id}`, title: "Editar trabajo realizado", label: "Trabajo realizado", value: n.texto || "" })} aria-label="Editar trabajo" title="Editar trabajo"><Icono nombre="edit" size={14} /></button><button type="button" onClick={() => updateOrden(orden.id, { notas: (orden.notas || []).filter((nota) => nota.id !== n.id) })} aria-label="Eliminar trabajo" title="Eliminar trabajo"><Icono nombre="trash" size={14} /></button></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARCHIVOS / ORDEN DIGITAL */}
      {activeTab === "archivos" && (
        <div className="work-order-meta-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", color: "#ffffff" }}>
              Documentación Digital y Fotografías del Equipo
            </h3>
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Icono nombre="plus" size={14} />
              <span>Adjuntar Archivo / Foto</span>
            </button>
            {archivosPendientes.length > 0 && <button className="btn-secondary" onClick={guardarArchivosPendientes}>Guardar cambios ({archivosPendientes.length})</button>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
            {archivosPendientes.map((arc) => (
              <div key={arc.id} style={{ position: "relative", background: "var(--bg-input)", border: "1px solid var(--accent-blue)", borderRadius: "8px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <button type="button" onClick={() => quitarArchivoPendiente(arc.id)} aria-label={`Quitar ${arc.nombre}`} style={{ position: "absolute", top: "7px", right: "7px", width: "25px", height: "25px", border: 0, borderRadius: "50%", background: "var(--accent-red)", color: "#fff", cursor: "pointer", zIndex: 1 }}>×</button>
                {arc.preview && <button type="button" onClick={() => setArchivoVistaPrevia({ nombre: arc.nombre, src: arc.preview })} aria-label={`Ver ${arc.nombre}`} style={{ position: "absolute", top: "7px", right: "39px", width: "25px", height: "25px", border: 0, borderRadius: "50%", background: "#fff", color: "#0b1f38", cursor: "pointer", zIndex: 1 }}><Icono nombre="eye" size={15} /></button>}
                <div style={{ height: "90px", background: "#0c1f33", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  {arc.preview ? <img src={arc.preview} alt={`Vista previa de ${arc.nombre}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icono nombre="file-text" size={36} />}
                </div>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{arc.nombre}</div>
                <small style={{ color: "var(--accent-blue-hover)" }}>Pendiente de guardar · {arc.tamano}</small>
              </div>
            ))}
            {(orden.archivos || []).map((arc) => (
              <div
                key={arc.id}
                style={{
                  position: "relative",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ height: "90px", background: "#0c1f33", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  {arc.vistaPrevia ? <img src={arc.vistaPrevia} alt={arc.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icono nombre={arc.tipo.includes("pdf") ? "file-text" : "camera"} size={36} />}
                </div>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {arc.nombre}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
                  <span>{arc.tamano}</span>
                  <span>{arc.fecha}</span>
                </div>
                <div className="file-card-actions">
                  <button type="button" disabled={!arc.vistaPrevia} onClick={() => arc.vistaPrevia && setArchivoVistaPrevia({ nombre: arc.nombre, src: arc.vistaPrevia })} aria-label={`Ver ${arc.nombre}`} title="Ver archivo"><Icono nombre="eye" size={15} /></button>
                  <button type="button" onClick={() => setEditField({ field: `archivo:${arc.id}`, title: "Editar archivo", label: "Nombre del archivo", value: arc.nombre || "" })} aria-label={`Editar nombre de ${arc.nombre}`} title="Editar nombre"><Icono nombre="edit" size={14} /></button>
                  <button type="button" onClick={() => removeOrderFile(arc.id)} aria-label={`Eliminar ${arc.nombre}`} title="Eliminar archivo"><Icono nombre="trash" size={15} /></button>
                </div>
              </div>
            ))}
          </div>
          {archivoVistaPrevia && <div className="file-preview-modal" onClick={() => setArchivoVistaPrevia(null)}><div className="file-preview-dialog" onClick={(event) => event.stopPropagation()}><button onClick={() => setArchivoVistaPrevia(null)} aria-label="Cerrar vista previa">×</button><img src={archivoVistaPrevia.src} alt={archivoVistaPrevia.nombre} /><p>{archivoVistaPrevia.nombre}</p></div></div>}
        </div>
      )}

      {/* TAB 5: LÍNEA DE TIEMPO */}
      {activeTab === "linea_tiempo" && (
        <div className="work-order-meta-card">
          <h3 style={{ fontSize: "15px", color: "#ffffff", marginBottom: "18px" }}>
            Trazabilidad Histórica de la Orden de Trabajo
          </h3>

          <div className="timeline-feed">
            {(orden.linea_tiempo || []).map((item, idx) => (
              <div key={idx} className="timeline-node">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>
                    {item.estado}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{item.fecha}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>
                  Por: <strong>{item.realizado_por === "OptiFix" ? WORKSHOP_NAME : (item.realizado_por || WORKSHOP_NAME)}</strong>
                </div>
                {item.detalle && <p style={{ fontSize: "13px", color: "var(--text-main)" }}>{item.detalle}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {historyOpen && <RelatedHistoryDrawer currentOrder={orden} customer={cliente} currentEquipment={equipo} orders={ordenes} equipment={equipos} onClose={() => setHistoryOpen(false)} onOpenOrder={(orderNumber) => { setHistoryOpen(false); navigate(`/ordenes/${orderNumber}`); }} />}
      {entityEditor && <EntityEditModal kind={entityEditor} entity={entityEditor === "customer" ? cliente : equipo} onClose={() => setEntityEditor(null)} onSave={saveEntity} />}
      {editField && <EditOrderFieldModal title={editField.title} label={editField.label} value={editField.value} type={editField.type} options={editField.options} onClose={() => setEditField(null)} onSave={(value) => saveOrderField(editField.field, value)} />}
      {isBudgetDecisionEditOpen && <BudgetDecisionEditModal order={orden} onClose={() => setIsBudgetDecisionEditOpen(false)} onSave={handleBudgetDecisionRevision} />}
      {isWhatsappDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={() => setIsWhatsappDialogOpen(false)}>
          <section className="whatsapp-dialog w-full max-w-lg rounded-2xl p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="whatsapp-order-title" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 id="whatsapp-order-title" className="text-lg font-bold">Enviar por WhatsApp</h2>
                <p className="mt-1 text-sm">{cliente?.nombre || "Cliente"} · +{normalizeWhatsapp(cliente?.telefono)}</p>
              </div>
              <button type="button" onClick={() => setIsWhatsappDialogOpen(false)} aria-label="Cerrar">×</button>
            </header>
            <div className="whatsapp-order-summary mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p><strong>Orden:</strong> N.º {orden.numero}</p>
              <p className="mt-1"><strong>Equipo:</strong> {equipo?.marca || equipo?.tipo || "Sin registrar"} {equipo?.modelo || ""}</p>
            </div>
            {whatsappMode === "actions" && <p className="mt-5 text-sm">Selecciona cómo deseas comunicarte con el cliente.</p>}
            {whatsappMode === "message" && <label className="mt-5 grid gap-1 text-sm font-semibold">Mensaje a enviar<textarea rows="7" value={whatsappMessage} onChange={(event) => setWhatsappMessage(event.target.value)} /></label>}
            {whatsappMode === "pdf" && <p className="mt-5 text-sm">Se abrirá el comprobante para imprimir o guardar como PDF. WhatsApp no permite adjuntar automáticamente archivos locales; podrás adjuntarlo manualmente al abrir el chat.</p>}
            <footer className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setIsWhatsappDialogOpen(false)}>Cancelar</button>
              {whatsappMode !== "actions" && <button type="button" onClick={() => setWhatsappMode("actions")}>Volver</button>}
              {whatsappMode === "actions" && <><button type="button" onClick={() => setWhatsappMode("message")}>Enviar mensaje</button><button type="button" onClick={() => setWhatsappMode("pdf")}>Enviar orden en PDF</button></>}
              {whatsappMode === "message" && <button type="button" disabled={!whatsappMessage.trim()} onClick={() => openWhatsapp(false)}>Abrir WhatsApp</button>}
              {whatsappMode === "pdf" && <button type="button" onClick={() => openWhatsapp(true)}>Preparar PDF y abrir WhatsApp</button>}
            </footer>
          </section>
        </div>
      )}
      {detailToast && <div className="order-detail-toast" role="status" aria-live="polite"><span aria-hidden="true">✓</span>{detailToast}</div>}

      <CambiarEstadoModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        orden={orden}
        cliente={cliente}
        equipo={equipo}
        technicians={technicianOptions}
        currentUser={user}
        onGoToBudget={() => { setIsStatusModalOpen(false); setActiveTab("productos"); }}
        onConfirmChange={changeOrdenStatus}
      />
    </div>
  );
}

const PlantillaImpresion = React.forwardRef(function PlantillaImpresion({ datosOrden }, ref) {
  const { orden, cliente, equipo, items, budgetTotals = {}, archivos = [] } = datosOrden || {};
  const fotosAdjuntas = archivos.filter((archivo) => typeof archivo?.vistaPrevia === "string" && archivo.vistaPrevia.trim().length > 0);
  return <div ref={ref} className="print-order-template" style={{ display: "block", minHeight: "100vh", padding: "32px", backgroundColor: "#ffffff", color: "#111827", fontFamily: "Arial, sans-serif" }}>
    <header className="print-order-header"><div><strong>OptiFix</strong><span>{WORKSHOP_NAME}</span></div><div><h1>Orden de Servicio N° {orden?.numero || "Nueva"}</h1><span>Ext. # {orden?.referencia_externa || "Sin asignar"} · Fecha: {orden?.fecha_ingreso || "—"}</span></div></header>
    <section className="print-order-grid"><div><h2>Datos del cliente</h2><p><b>Nombre:</b> {cliente?.nombre || "—"}</p><p><b>Contacto:</b> {cliente?.telefono || "—"}</p><p><b>Email:</b> {cliente?.email || "—"}</p></div><div><h2>Datos del equipo</h2><p><b>Equipo:</b> {equipo?.tipo || "—"}</p><p><b>Modelo:</b> {[equipo?.marca, equipo?.modelo].filter(Boolean).join(" ") || "—"}</p><p><b>Serie:</b> {equipo?.serie || "—"}</p></div></section>
    <section className="print-order-work"><h2>Trabajo solicitado</h2><p>{orden?.trabajo_solicitado || "Sin detalle"}</p><p><b>Estado actual:</b> {orden?.estado_actual || "—"}</p><p><b>Responsable:</b> {orden?.responsable && orden.responsable !== "OptiFix" ? orden.responsable : "Sin asignar"}</p><p><b>Garantía:</b> {orden?.garantia ? "Con garantía" : "Sin garantía"}</p></section>
    <section className="print-order-work"><h2>Trabajo realizado</h2>{orden?.notas?.length ? <ul>{orden.notas.map((nota) => <li key={nota.id}><b>{nota.texto === "Ingreso de la orden de trabajo al sistema OptiFix." ? "Orden de trabajo registrada." : nota.texto}</b><br /><small>Realizado por: {["OptiFix", "Administrador OptiFix", "OptiFix Administrador"].includes(nota.autor) ? WORKSHOP_NAME : (nota.autor || WORKSHOP_NAME)} · {["OptiFix", "Administrador OptiFix", "OptiFix Administrador"].includes(nota.autor) ? "Sistema" : (nota.rol || "Administrador")} · {nota.fecha || "—"}</small></li>)}</ul> : <p>Sin trabajo técnico registrado.</p>}</section>
    <table className="print-order-table"><thead><tr><th>Descripción</th><th>Cant.</th><th>Importe</th></tr></thead><tbody>{items?.length ? items.map((item) => <tr key={item.id}><td>{item.descripcion}</td><td>{item.cantidad}</td><td>₡ {Number(item.importe || 0).toFixed(2)}</td></tr>) : <tr><td colSpan="3">Sin productos o servicios registrados.</td></tr>}</tbody></table>
    <section className="print-order-attachments">
      <h2>Fotografías adjuntas del equipo</h2>
      {fotosAdjuntas.length > 0 ? (
        <div className="print-order-photo-grid">
          {fotosAdjuntas.map((archivo) => (
            <figure key={archivo.id || archivo.nombre}>
              <img src={archivo.vistaPrevia} alt={archivo.nombre || "Fotografía adjunta"} />
              <figcaption>{archivo.nombre || "Fotografía del equipo"}</figcaption>
            </figure>
          ))}
        </div>
      ) : <p>No hay fotografías adjuntas en esta orden.</p>}
    </section>
    <section className="print-order-totals"><p>Subtotal <b>{formatColones(budgetTotals.subtotal)}</b></p><p>IVA (13%) <b>{formatColones(budgetTotals.tax)}</b></p><p>Total <b>{formatColones(budgetTotals.total)}</b></p><p>Adelanto <b>- {formatColones(budgetTotals.advance)}</b></p><p className="print-order-total">Saldo pendiente <b>{formatColones(budgetTotals.balance)}</b></p></section>
  </div>;
});
