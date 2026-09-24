import React, { useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import ClienteModal from "../components/modals/ClienteModal.jsx";
import Icono from "../components/icons.jsx";
import "./ClientesView.css";

const PAGE_SIZE = 5;

const AVATAR_PALETTE = ["#006194", "#28814D", "#2C8FC4", "#565E74", "#00873A", "#0B1C30"];

function iniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function colorAvatar(nombre = "") {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export default function ClientesView() {
  const { clientes, ordenes, equipos, addCliente, updateCliente } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);

  // ── Métricas del encabezado ────────────
  const ordenesEnTaller = ordenes.filter(o => o.estado_actual !== "ENTREGADO").length;
  const clientesRegistrados = clientes.length;
  const equiposEnCustodia = equipos.length;
  const clientesConTelefono = clientes.filter(c => c.telefono).length;

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const matchSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.identificacion.includes(searchTerm) ||
                          (c.telefono && c.telefono.includes(searchTerm)) ||
                          (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const clientOrdenes = ordenes.filter(o => o.cliente_id === c.id);
      let matchTab = true;
      if (tab === "CON_ORDENES") matchTab = clientOrdenes.some(o => o.estado_actual !== "ENTREGADO");
      if (tab === "HISTORICOS") matchTab = clientOrdenes.every(o => o.estado_actual === "ENTREGADO") && clientOrdenes.length > 0;

      return matchSearch && matchTab;
    });
  }, [clientes, ordenes, searchTerm, tab]);

  const totalPages = Math.ceil(filteredClientes.length / PAGE_SIZE) || 1;
  const paginatedClientes = filteredClientes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleOpenCreate = () => {
    setClienteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setClienteToEdit(c);
    setIsModalOpen(true);
  };

  const handleSaveCliente = (formData) => {
    if (clienteToEdit) {
      updateCliente(clienteToEdit.id, formData);
    } else {
      addCliente(formData);
    }
  };

  return (
    <div className="page-container">
      <div className="breadcrumb-nav">
        <span>Principal</span>
        <span>/</span>
        <span>Centro de Servicios</span>
        <span>/</span>
        <span className="breadcrumb-current">Clientes</span>
      </div>

      <div className="clientes-header">
        <div>
          <h1 className="clientes-title">Directorio de Clientes</h1>
          <p className="clientes-subtitle">Administra los datos de contacto, expedientes y equipos asociados.</p>
        </div>
        <div className="clientes-header-actions">
          <button className="btn-primary" onClick={handleOpenCreate} style={{ backgroundColor: "#006194" }}>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="clientes-kpi-row">
        <div className="clientes-kpi-card">
          <div>
            <h4>Clientes Registrados</h4>
            <div className="kpi-value" style={{ color: "#0B1C30", fontSize: "24px", fontWeight: "bold" }}>{clientesRegistrados}</div>
          </div>
        </div>
        <div className="clientes-kpi-card">
          <div>
            <h4>Órdenes en Taller</h4>
            <div className="kpi-value" style={{ color: "#2C8FC4", fontSize: "24px", fontWeight: "bold" }}>{ordenesEnTaller}</div>
          </div>
        </div>
        <div className="clientes-kpi-card">
          <div>
            <h4>Equipos en Custodia</h4>
            <div className="kpi-value" style={{ color: "#565E74", fontSize: "24px", fontWeight: "bold" }}>{equiposEnCustodia}</div>
          </div>
        </div>
        <div className="clientes-kpi-card">
          <div>
            <h4>Canal WhatsApp</h4>
            <div className="kpi-value" style={{ color: "#00873A", fontSize: "24px", fontWeight: "bold" }}>{clientesConTelefono}</div>
          </div>
        </div>
      </div>

      {/* Controles de tabla */}
      <div className="clientes-controls">
        <div className="clientes-tabs">
          <button className={tab === "TODOS" ? "active" : ""} onClick={() => { setTab("TODOS"); setPage(1); }}>Todos</button>
          <button className={tab === "CON_ORDENES" ? "active" : ""} onClick={() => { setTab("CON_ORDENES"); setPage(1); }}>Con Órdenes Activas</button>
          <button className={tab === "HISTORICOS" ? "active" : ""} onClick={() => { setTab("HISTORICOS"); setPage(1); }}>Históricos</button>
        </div>
        <div className="clientes-search">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="table-card">
        <table className="gestioo-table clientes-table">
          <thead>
            <tr>
              <th>CLIENTE</th>
              <th>IDENTIFICACIÓN</th>
              <th>CONTACTO</th>
              <th>EQUIPOS</th>
              <th>ÓRDENES ACTIVAS</th>
              <th style={{ textAlign: "right" }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
                  No se encontraron clientes registrados con ese criterio.
                </td>
              </tr>
            ) : (
              paginatedClientes.map((c) => {
                const clientEquipos = equipos.filter((eq) => eq.cliente_id === c.id);
                const clientOrdenes = ordenes.filter((o) => o.cliente_id === c.id);
                const activeOrdersCount = clientOrdenes.filter(o => o.estado_actual !== "ENTREGADO").length;

                return (
                  <tr key={c.id}>
                    <td>
                      <div className="cliente-avatar-cell">
                        <div className="cliente-avatar" style={{ backgroundColor: colorAvatar(c.nombre) }}>
                          {iniciales(c.nombre)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0B1C30" }}>{c.nombre}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{c.direccion || "Sin dirección"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cliente-id-chip">{c.identificacion}</span>
                    </td>
                    <td>
                      <div className="cliente-contact-row">
                        <span title="Teléfono">📞 {c.telefono || "N/A"}</span>
                      </div>
                      <div className="cliente-contact-row" style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                        <span title="Email">✉️ {c.email || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="pipeline-chip" style={{ padding: "2px 8px", fontSize: "11px" }}>
                        {clientEquipos.length} equipos
                      </span>
                    </td>
                    <td>
                      <span className="pill-badge-green" style={{ background: "#0B1C30", color: "#ffffff" }}>
                        {activeOrdersCount} órdenes
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <a
                          href={c.telefono ? `https://wa.me/${c.telefono.replace(/\D/g, "")}` : "#"}
                          target={c.telefono ? "_blank" : "_self"}
                          rel="noreferrer"
                          className={`btn-outline-icon ${!c.telefono ? "disabled" : ""}`}
                          title="WhatsApp"
                          style={{ borderColor: c.telefono ? "#00873A" : "", color: c.telefono ? "#00873A" : "" }}
                          onClick={(e) => { if (!c.telefono) e.preventDefault(); }}
                        >
                          💬
                        </a>
                        <button
                          className="btn-outline-icon"
                          onClick={() => handleOpenEdit(c)}
                          title="Editar cliente"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        )}
      </div>

      {/* 3 Tarjetas Inferiores */}
      <div className="clientes-bottom-cards">
        <div className="bottom-card">
          <h4>Comunicación Centralizada</h4>
          <p>Envía notificaciones de presupuestos y reparaciones directo a los clientes.</p>
        </div>
        <div className="bottom-card">
          <h4>Trazabilidad</h4>
          <p>Historial completo de reparaciones, notas y facturación por equipo.</p>
        </div>
        <div className="bottom-card dark-card">
          <h4>Alta Rápida</h4>
          <p>Registra clientes y equipos simultáneamente desde una nueva orden.</p>
        </div>
      </div>

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        clienteToEdit={clienteToEdit}
      />
    </div>
  );
}
