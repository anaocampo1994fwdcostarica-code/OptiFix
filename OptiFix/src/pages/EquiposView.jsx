import React, { useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import EquipoModal from "../components/modals/EquipoModal.jsx";
import Icono from "../components/icons.jsx";
import { useNavigate } from "react-router-dom";
import "./EquiposView.css";

const PAGE_SIZE = 6;

function categoriaDe(tipo = "") {
  const t = tipo.toUpperCase();
  if (t.includes("PANTALLA") || t.includes("VIDEOC") || t.includes("TV")) return "Pantallas";
  if (t.includes("AUDIO") || t.includes("SONIDO") || t.includes("PARLANTE") || t.includes("EQUIPO")) return "Audio";
  if (t.includes("MICROONDA") || t.includes("ELECTRODOM") || t.includes("LAVADORA") || t.includes("REFRI")) return "Electrodomésticos";
  return "Otros";
}

function condicionEstilo(estado = "") {
  const e = estado.toUpperCase();
  if (e.includes("OXIDADO") || e.includes("ROTO") || e.includes("QUEBRADO")) {
    return { background: "var(--accent-red-bg)", color: "#9c1c1c" };
  }
  if (e.includes("BUEN ESTADO") || e.includes("EXCELENTE") || e.includes("INTACT")) {
    return { background: "var(--accent-green-bg)", color: "#146c43" };
  }
  if (e.includes("REGULAR")) {
    return { background: "var(--bg-input)", color: "var(--text-muted)" };
  }
  // Sucio, rayas, manchas, etc. → advertencia leve
  return { background: "#fff6e0", color: "#8a6100" };
}

export default function EquiposView({ onOpenNewOrderModal }) {
  const navigate = useNavigate();
  const { equipos, clientes, ordenes, addEquipo, updateEquipo } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoToEdit, setEquipoToEdit] = useState(null);

  // Generate tab counts
  const counts = {
    TODOS: equipos.length,
    PANTALLAS: 0,
    AUDIO: 0,
    ELECTRODOMESTICOS: 0,
    OTROS: 0
  };

  equipos.forEach(eq => {
    const cat = categoriaDe(eq.tipo).toUpperCase();
    if (cat === "PANTALLAS") counts.PANTALLAS++;
    else if (cat === "AUDIO") counts.AUDIO++;
    else if (cat === "ELECTRODOMÉSTICOS" || cat === "ELECTRODOMESTICOS") counts.ELECTRODOMESTICOS++;
    else counts.OTROS++;
  });

  const filteredEquipos = useMemo(() => {
    return equipos.filter((e) => {
      const matchSearch =
        e.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.modelo && e.modelo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchTab = true;
      if (activeTab !== "TODOS") {
        const cat = categoriaDe(e.tipo).toUpperCase();
        if (activeTab === "ELECTRODOMESTICOS" && (cat === "ELECTRODOMÉSTICOS" || cat === "ELECTRODOMESTICOS")) {
            matchTab = true;
        } else {
            matchTab = cat === activeTab;
        }
      }

      return matchSearch && matchTab;
    });
  }, [equipos, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredEquipos.length / PAGE_SIZE) || 1;
  const paginatedEquipos = filteredEquipos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleOpenEdit = (e) => {
    setEquipoToEdit(e);
    setIsModalOpen(true);
  };

  const handleSaveEquipo = (formData) => {
    if (equipoToEdit) {
      updateEquipo(equipoToEdit.id, formData);
    } else {
      addEquipo(formData);
    }
  };

  return (
    <div className="page-container">
      <div className="breadcrumb-nav">
        <span>Principal</span>
        <span>/</span>
        <span>Taller</span>
        <span>/</span>
        <span className="breadcrumb-current">Base de Equipos</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", color: "#0B1C30", fontWeight: 700, margin: 0 }}>Gestión de Equipos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Directorio completo de aparatos registrados y su condición de ingreso.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-outline-icon" title="Exportar">
            Exportar
          </button>
          <button className="btn-primary" style={{ backgroundColor: "#006194" }} onClick={() => { setEquipoToEdit(null); setIsModalOpen(true); }}>
            + Registrar Equipo
          </button>
        </div>
      </div>

      <div className="equipos-toolbar">
        <div className="equipos-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por serie, marca o modelo..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="equipos-tabs">
          <button className={activeTab === "TODOS" ? "active" : ""} onClick={() => { setActiveTab("TODOS"); setPage(1); }}>Todos ({counts.TODOS})</button>
          <button className={activeTab === "PANTALLAS" ? "active" : ""} onClick={() => { setActiveTab("PANTALLAS"); setPage(1); }}>Pantallas ({counts.PANTALLAS})</button>
          <button className={activeTab === "AUDIO" ? "active" : ""} onClick={() => { setActiveTab("AUDIO"); setPage(1); }}>Audio ({counts.AUDIO})</button>
          <button className={activeTab === "ELECTRODOMESTICOS" ? "active" : ""} onClick={() => { setActiveTab("ELECTRODOMESTICOS"); setPage(1); }}>Electrodomésticos ({counts.ELECTRODOMESTICOS})</button>
          <button className={activeTab === "OTROS" ? "active" : ""} onClick={() => { setActiveTab("OTROS"); setPage(1); }}>Otros ({counts.OTROS})</button>
        </div>
      </div>

      {/* Tabla de Equipos */}
      <div className="table-card">
        <table className="gestioo-table">
          <thead>
            <tr>
              <th>EQUIPO / MODELO</th>
              <th>N° SERIE</th>
              <th>CLIENTE</th>
              <th>CONDICIÓN (INGRESO)</th>
              <th style={{ textAlign: "right" }}>ÓRDENES</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEquipos.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
                  No se encontraron equipos registrados con ese criterio.
                </td>
              </tr>
            ) : (
              paginatedEquipos.map((e) => {
                const cli = clientes.find((c) => c.id === e.cliente_id) || {};
                const eqOrdenes = ordenes.filter((o) => o.equipo_id === e.id);
                // Last order for the 'Ver orden' button logic
                const lastOrder = eqOrdenes.length > 0 ? eqOrdenes[eqOrdenes.length - 1] : null;

                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="equipo-tipo-chip">{e.tipo || "Genérico"}</span>
                            <span style={{ fontWeight: 700, color: "#0B1C30" }}>{e.marca}</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{e.modelo || "Sin modelo"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="equipo-serie-chip">{e.serie}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "#0B1C30", fontSize: "13px" }}>{cli.nombre || "—"}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{cli.telefono}</div>
                    </td>
                    <td>
                      <span className="equipo-condicion-chip" style={condicionEstilo(e.estado_ingreso)}>
                        {e.estado_ingreso || "NO ESPECIFICADO"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        <button
                          className="btn-outline-icon"
                          onClick={() => handleOpenEdit(e)}
                          title="Editar equipo"
                        >
                          ✏️
                        </button>
                        {lastOrder ? (
                            <button
                                className="btn-primary"
                                style={{ backgroundColor: "#006194", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}
                                onClick={() => navigate(`/ordenes/${lastOrder.numero}`)}
                                title="Ver última orden"
                            >
                                Ver Orden {lastOrder.numero}
                            </button>
                        ) : (
                            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Sin órdenes</span>
                        )}
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
          <div className="orders-pagination">
            <span>
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredEquipos.length)} de {filteredEquipos.length} equipos registrados
            </span>
            <div className="orders-pagination-controls">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </button>
              <div className="orders-page-number">{page}</div>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <EquipoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEquipo}
        equipoToEdit={equipoToEdit}
      />
    </div>
  );
}
