import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icono from "../components/icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { getEstadoBadge } from "../utils/estadoColors.js";
import ItemProductoModal from "../components/modals/ItemProductoModal.jsx";
import CambiarEstadoModal from "../components/modals/CambiarEstadoModal.jsx";

export default function OrdenDetalle() {
  const { numero } = useParams();
  const navigate = useNavigate();
  const {
    ordenes,
    clientes,
    equipos,
    toggleGarantia,
    addProductService,
    removeProductService,
    toggleTarea,
    addTarea,
    addNota,
    addArchivo,
    changeOrdenStatus
  } = useWorkshop();

  const [activeTab, setActiveTab] = useState("productos");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nuevaTareaTexto, setNuevaTareaTexto] = useState("");
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState("");

  const orden = ordenes.find((o) => String(o.numero) === String(numero) || o.id === numero);

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

  // Cálculos de productos y servicios
  const items = orden.productos_servicios || [];
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.cantidad) || 1) * (Number(curr.importe) || 0), 0);
  const adelanto = Number(orden.adelanto) || 0;
  const total = Math.max(0, subtotal - adelanto);

  const isEntregado = orden.estado_actual === "ENTREGADO" || (orden.etapa_categoria === "SALIDA" && orden.fecha_entrega);

  const handlePrint = () => {
    // Permite que React termine de pintar la orden antes de invocar el diálogo.
    requestAnimationFrame(() => window.print());
  };

  const handleWhatsApp = () => {
    const telefono = (cliente.telefono || "").replace(/\D/g, "");
    if (!telefono) {
      alert("Esta orden no tiene un teléfono de cliente registrado.");
      return;
    }
    const mensaje = `Hola ${cliente.nombre || ""}, adjuntamos los detalles de su orden N°${orden.numero} en OptiFix. Estado actual: ${orden.estado_actual}.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener,noreferrer");
  };

  const handleAddTareaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaTareaTexto.trim()) return;
    addTarea(orden.id, nuevaTareaTexto);
    setNuevaTareaTexto("");
  };

  const handleAddNotaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaNotaTexto.trim()) return;
    addNota(orden.id, nuevaNotaTexto, orden.responsable);
    setNuevaNotaTexto("");
  };

  const handleSimulateUpload = () => {
    const fileName = prompt("Nombre del archivo / fotografía a adjuntar:", "foto_diagnostico_adicional.jpg");
    if (fileName) {
      addArchivo(orden.id, {
        nombre: fileName,
        tipo: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
        tamano: "1.2 MB"
      });
    }
  };

  return (
    <div className="page-container printable-order">
      {/* Breadcrumb idéntico a Captura 2 */}
      <div className="breadcrumb-nav">
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/ordenes")}>
          🏠 Principal
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
          <h1 className="order-title-main">Orden N° {orden.numero}</h1>
        </div>

        <div className="order-actions-bar">
          <button className="btn-outline-icon" onClick={handlePrint} title="Imprimir orden">
            <Icono nombre="printer" size={16} />
          </button>
          <button
            className="btn-outline-icon"
            onClick={handleWhatsApp}
            title="Enviar detalles por WhatsApp"
          >
            <Icono nombre="whatsapp" size={16} />
          </button>
          <button
            className="btn-outline-icon"
            onClick={() => setActiveTab("linea_tiempo")}
            title="Historial"
          >
            <Icono nombre="history" size={16} />
          </button>
          <button
            className="btn-green-delivery"
            onClick={() => setIsStatusModalOpen(true)}
          >
            <Icono nombre="check-circle" size={15} />
            <span>{isEntregado ? "Ver Entrega" : "Gestionar Estado"}</span>
          </button>
        </div>
      </div>

      {/* Banner de Entrega si está entregado (Captura 2) */}
      {isEntregado && (
        <div className="alert-banner-red">
          <Icono nombre="check-circle" size={20} />
          <span>¡Atención! Este equipo ya fue entregado.</span>
        </div>
      )}

      {/* Grilla Superior de 2 Tarjetas: Cliente & Equipo (Capturas 1 y 2) */}
      <div className="order-two-cards-grid">
        {/* Tarjeta de Cliente */}
        <div className="entity-info-card">
          <div className="entity-avatar-placeholder">
            <Icono nombre="camera-off" size={32} />
          </div>
          <div className="entity-details">
            <div className="entity-label-sub">
              Persona {cliente.identificacion || "111120342"}
            </div>
            <div className="entity-name-title" title={cliente.nombre}>
              {cliente.nombre || "VIANNEY SABORIO HERNANDEZ"}
            </div>
            <div className="entity-meta-line">
              <Icono nombre="mail" size={13} />
              <span>{cliente.email || "No cargado"}</span>
            </div>
            <div className="entity-meta-line">
              <Icono nombre="phone" size={13} />
              <span>{cliente.telefono || "88386357"}</span>
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
            <div className="entity-label-sub">{equipo.tipo || "Pantalla"}</div>
            <div className="entity-name-title">
              {equipo.marca || "Sony"}, {equipo.modelo || "XBR-55X930D"}
            </div>
            <div className="entity-meta-line">
              <Icono nombre="laptop" size={13} />
              <span style={{ fontFamily: "monospace" }}>{equipo.serie || "5027152"}</span>
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

      {/* Tarjeta Principal de Información de la Orden (Capturas 1 y 2) */}
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
              <strong>Responsable:</strong> {orden.responsable}
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
                Realizado por: {orden.linea_tiempo[orden.linea_tiempo.length - 1].realizado_por}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn-outline-icon" onClick={handlePrint} title="Imprimir reporte">
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

      {/* Pestañas de la Orden (Captura 1 y 2 + Alcance) */}
      <div className="order-tabs-bar">
        <button
          className={`order-tab-btn ${activeTab === "productos" ? "active" : ""}`}
          onClick={() => setActiveTab("productos")}
        >
          Productos/Servicios ({items.length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "tareas" ? "active" : ""}`}
          onClick={() => setActiveTab("tareas")}
        >
          Tareas ({(orden.tareas || []).length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "notas" ? "active" : ""}`}
          onClick={() => setActiveTab("notas")}
        >
          Notas ({(orden.notas || []).length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "archivos" ? "active" : ""}`}
          onClick={() => setActiveTab("archivos")}
        >
          Orden digital / Archivos ({(orden.archivos || []).length})
        </button>
        <button
          className={`order-tab-btn ${activeTab === "linea_tiempo" ? "active" : ""}`}
          onClick={() => setActiveTab("linea_tiempo")}
        >
          Línea de Tiempo ({(orden.linea_tiempo || []).length})
        </button>
      </div>

      {/* Contenido de las Pestañas */}

      {/* TAB 1: PRODUCTOS Y SERVICIOS (Captura 1) */}
      {activeTab === "productos" && (
        <div className="table-card">
          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "14px", color: "#ffffff" }}>
              Desglose de Mano de Obra y Repuestos
            </h3>
            <button className="btn-primary" onClick={() => setIsItemModalOpen(true)}>
              <Icono nombre="plus" size={14} />
              <span>Agregar Item</span>
            </button>
          </div>

          <table className="gestioo-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th style={{ width: "100px", textAlign: "right" }}>Cant.</th>
                <th style={{ width: "160px", textAlign: "right" }}>Importe</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "var(--text-dim)" }}>
                    No se han cargado productos ni servicios en esta orden.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: "#ffffff" }}>{item.descripcion}</td>
                    <td style={{ textAlign: "right" }}>{Number(item.cantidad).toFixed(2)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#ffffff" }}>
                      ₡ {Number(item.importe).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-outline-icon"
                        style={{ width: "26px", height: "26px" }}
                        onClick={() => removeProductService(orden.id, item.id)}
                        title="Eliminar item"
                      >
                        <Icono nombre="trash" size={12} style={{ color: "var(--accent-red)" }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Cuadro de Totales Calculados (Captura 1) */}
          <div className="totals-summary-box">
            <div className="totals-row">
              <span>Subtotal</span>
              <strong style={{ color: "#ffffff" }}>
                ₡ {subtotal.toFixed(2)}
              </strong>
            </div>
            <div className="totals-row">
              <span>Adelanto</span>
              <strong style={{ color: "var(--accent-cyan)" }}>
                - ₡ {adelanto.toFixed(2)}
              </strong>
            </div>
            <div className="totals-row final-total">
              <span>Total</span>
              <span style={{ color: "var(--accent-cyan)" }}>
                ₡ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAREAS TÉCNICAS */}
      {activeTab === "tareas" && (
        <div className="work-order-meta-card">
          <h3 style={{ fontSize: "15px", color: "#ffffff", marginBottom: "14px" }}>
            Checklist de Procedimientos Técnicos
          </h3>

          <form onSubmit={handleAddTareaSubmit} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
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
          </form>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {(orden.tareas || []).map((t) => (
              <div
                key={t.id}
                className={`task-item-row ${t.completada ? "completed" : ""}`}
                onClick={() => toggleTarea(orden.id, t.id)}
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
                {t.completada && (
                  <span style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: 700 }}>
                    COMPLETADA
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NOTAS */}
      {activeTab === "notas" && (
        <div className="work-order-meta-card">
          <h3 style={{ fontSize: "15px", color: "#ffffff", marginBottom: "14px" }}>
            Bitácora de Notas y Comunicación
          </h3>

          <form onSubmit={handleAddNotaSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Redactar una nueva nota técnica o reporte para el expediente..."
              value={nuevaNotaTexto}
              onChange={(e) => setNuevaNotaTexto(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary">
                Guardar Nota
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>
                  <strong style={{ color: "var(--accent-cyan)" }}>{n.autor}</strong>
                  <span>📅 {n.fecha}</span>
                </div>
                <p style={{ color: "#ffffff", fontSize: "13px" }}>{n.texto}</p>
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
            <button className="btn-primary" onClick={handleSimulateUpload}>
              <Icono nombre="plus" size={14} />
              <span>Adjuntar Archivo / Foto</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
            {(orden.archivos || []).map((arc) => (
              <div
                key={arc.id}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ height: "90px", background: "#0c1f33", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  <Icono nombre={arc.tipo.includes("pdf") ? "file-text" : "camera"} size={36} />
                </div>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {arc.nombre}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
                  <span>{arc.tamano}</span>
                  <span>{arc.fecha}</span>
                </div>
              </div>
            ))}
          </div>
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
                  Por: <strong>{item.realizado_por}</strong>
                </div>
                <p style={{ fontSize: "13px", color: "#ffffff" }}>{item.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales Interactivos */}
      <ItemProductoModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onAdd={(item) => addProductService(orden.id, item)}
      />

      <CambiarEstadoModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        orden={orden}
        onConfirmChange={changeOrdenStatus}
      />
    </div>
  );
}
