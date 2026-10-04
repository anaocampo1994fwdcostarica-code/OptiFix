import React, { useEffect, useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import EquipoModal from "../components/modals/EquipoModal.jsx";
import Icono from "../components/icons.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./EquiposView.css";

const PAGE_SIZE = 6;

function categoriaDe(tipo = "") {
  const t = tipo.toUpperCase();
  if (t.includes("PANTALLA") || t.includes("VIDEOC") || t.includes("TV")) return "Pantallas";
  if (t.includes("AUDIO") || t.includes("SONIDO") || t.includes("PARLANTE") || t.includes("EQUIPO")) return "Audio";
  if (t.includes("MICROONDA") || t.includes("ELECTRODOM") || t.includes("LAVADORA") || t.includes("REFRI")) return "Electrodomésticos";
  return "Otros";
}

function normalizeText(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

function formatFechaCorta(value) {
  if (!value) return "Sin fecha";
  const raw = String(value).trim();
  const clean = raw.replace(/\s+hs/i, "");
  const date = new Date(clean);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return raw;
}

function getEquipoHistory(equipo, equipos, ordenes) {
  if (!equipo) return [];
  const serial = normalizeText(equipo.serie);
  const relatedIds = new Set([equipo.id]);

  if (serial) {
    equipos.forEach((item) => {
      if (item.id !== equipo.id && normalizeText(item.serie) === serial) {
        relatedIds.add(item.id);
      }
    });
  }

  return ordenes
    .filter((orden) => relatedIds.has(orden.equipo_id))
    .sort((a, b) => {
      const dateA = Date.parse(String(a.fecha_ingreso || "").replace(/\s+hs/i, "")) || 0;
      const dateB = Date.parse(String(b.fecha_ingreso || "").replace(/\s+hs/i, "")) || 0;
      return dateB - dateA;
    });
}

export default function EquiposView({ onOpenNewOrderModal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { equipos, clientes, ordenes, addEquipo, updateEquipo, deleteEquipo } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoToEdit, setEquipoToEdit] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const counts = {
    TODOS: equipos.length,
    PANTALLAS: 0,
    AUDIO: 0,
    ELECTRODOMESTICOS: 0,
    OTROS: 0
  };

  equipos.forEach((eq) => {
    const cat = categoriaDe(eq.tipo).toUpperCase();
    if (cat === "PANTALLAS") counts.PANTALLAS++;
    else if (cat === "AUDIO") counts.AUDIO++;
    else if (cat === "ELECTRODOMESTICOS") counts.ELECTRODOMESTICOS++;
    else counts.OTROS++;
  });

  const filteredEquipos = useMemo(() => {
    return equipos.filter((equipo) => {
      const cliente = clientes.find((item) => item.id === equipo.cliente_id) || {};
      const searchValue = normalizeText(searchTerm);
      const matchingSearch =
        !searchValue ||
        normalizeText(equipo.serie).includes(searchValue) ||
        normalizeText(equipo.marca).includes(searchValue) ||
        normalizeText(equipo.modelo).includes(searchValue) ||
        normalizeText(cliente.nombre).includes(searchValue) ||
        normalizeText(cliente.telefono).includes(searchValue);

      let matchingTab = true;
      if (activeTab !== "TODOS") {
        const category = categoriaDe(equipo.tipo).toUpperCase();
        matchingTab = category === activeTab;
      }

      return matchingSearch && matchingTab;
    });
  }, [equipos, clientes, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredEquipos.length / PAGE_SIZE) || 1;
  const paginatedEquipos = filteredEquipos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const historyOrders = useMemo(() => {
    if (!selectedHistory) return [];
    return getEquipoHistory(selectedHistory, equipos, ordenes);
  }, [selectedHistory, equipos, ordenes]);

  const handleExport = () => {
    const headers = ["Tipo de Equipo", "Marca", "Modelo", "Número de Serie", "Nombre del Cliente", "Contacto del Cliente"];
    const escapeCsvValue = (value) => {
      let safeValue = String(value ?? "").replace(/\r?\n|\r/g, " ").trim();
      if (/^[=+\-@]/.test(safeValue)) safeValue = `'${safeValue}`;
      return `"${safeValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredEquipos.map((equipo) => {
      const cliente = clientes.find((item) => item.id === equipo.cliente_id) || {};
      const contacto = [cliente.telefono, cliente.correo || cliente.email].filter(Boolean).join(" / ");
      return [equipo.tipo, equipo.marca, equipo.modelo, equipo.serie, cliente.nombre, contacto];
    });

    const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(";")).join("\r\n");
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `OptiFix_Inventario_Equipos_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    setToast(t("equipment.exportSuccess"));
  };

  const handleOpenEdit = (equipo) => {
    setEquipoToEdit(equipo);
    setIsModalOpen(true);
  };

  const handleSaveEquipo = async (formData) => {
    if (equipoToEdit) {
      updateEquipo(equipoToEdit.id, formData);
    } else {
      addEquipo(formData);
    }
  };

  const handleDeleteEquipo = async (equipo) => {
    const relatedOrders = getEquipoHistory(equipo, equipos, ordenes);
    if (relatedOrders.length > 0) {
      setDeleteTarget({ equipo, relatedOrders, blocked: true });
      return;
    }

    if (!window.confirm(t("equipment.deleteConfirm", { name: `${equipo.marca} ${equipo.modelo}` }))) return;

    try {
      await deleteEquipo(equipo.id);
      setToast(t("equipment.deleted"));
    } catch (error) {
      window.alert(error.message || t("equipment.deleteError"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteTarget.blocked) return;

    try {
      await deleteEquipo(deleteTarget.equipo.id);
      setDeleteTarget(null);
      setToast("Equipo eliminado");
    } catch (error) {
      setDeleteTarget(null);
      window.alert(error.message || t("equipment.deleteError"));
    }
  };

  return (
    <div className="equipment-view-page">
      <div className="equipment-view-header">
        <div>
          <h1>{t("equipment.title")}</h1>
          <p>{t("equipment.subtitle")}</p>
        </div>
        <div className="equipment-view-actions">
          <button type="button" onClick={handleExport} className="compact-secondary-button">
            <Icono nombre="download" size={16} />
            {t("common.export")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEquipoToEdit(null);
              setIsModalOpen(true);
            }}
            className="compact-primary-button"
          >
            <Icono nombre="plus" size={16} />
            {t("equipment.register")}
          </button>
        </div>
      </div>

      <div className="equipment-table-shell">
        <div className="equipment-toolbar">
          <div className="equipment-tabs" role="tablist" aria-label={t("equipment.title")}>
            {[
              { id: "TODOS", label: `Todos (${counts.TODOS})` },
              { id: "PANTALLAS", label: `Pantallas (${counts.PANTALLAS})` },
              { id: "AUDIO", label: `Audio (${counts.AUDIO})` },
              { id: "ELECTRODOMESTICOS", label: `Electrodomésticos (${counts.ELECTRODOMESTICOS})` },
              { id: "OTROS", label: `Otros (${counts.OTROS})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={activeTab === tab.id ? "active" : ""}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="equipment-search">
            <span className="equipment-search-icon"><Icono nombre="search" size={15} /></span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder={t("equipment.search")}
            />
          </div>
        </div>

        <div className="equipment-table-wrap">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>{t("common.equipment")}</th>
                <th>{t("equipment.brand")}</th>
                <th>{t("equipment.modelField")}</th>
                <th>{t("equipment.serial")}</th>
                <th>{t("common.client")}</th>
                <th className="actions-column">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEquipos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    <div className="empty-state-content">
                      <Icono nombre="laptop" size={26} />
                      <span>{t("equipment.empty")}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEquipos.map((equipo) => {
                  const cliente = clientes.find((item) => item.id === equipo.cliente_id) || {};
                  const relatedOrders = getEquipoHistory(equipo, equipos, ordenes);
                  const lastOrder = relatedOrders[0];

                  return (
                    <tr key={equipo.id} className="equipment-row">
                      <td>
                        <div className="equipment-cell">
                          <span className="equipment-type-badge">{equipo.tipo || t("equipment.generic")}</span>
                        </div>
                      </td>
                      <td>
                        <div className="equipment-cell strong">{equipo.marca || "—"}</div>
                      </td>
                      <td>
                        <div className="equipment-cell muted">{equipo.modelo || t("equipment.noModel")}</div>
                      </td>
                      <td>
                        <span className="equipment-serial-badge">{equipo.serie || "—"}</span>
                      </td>
                      <td>
                        <div className="equipment-client-cell">
                          <strong>{cliente.nombre || "—"}</strong>
                          <small>{cliente.telefono || "—"}</small>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="equipment-actions">
                          <button
                            type="button"
                            className="action-button history"
                            onClick={() => setSelectedHistory(equipo)}
                            title="Ver historial del equipo"
                            aria-label={`Ver historial del equipo ${equipo.serie}`}
                          >
                            <Icono nombre="history" size={14} />
                            <span>Historial</span>
                          </button>
                          <button
                            type="button"
                            className="action-button"
                            onClick={() => handleOpenEdit(equipo)}
                            title="Editar equipo"
                            aria-label={`Editar equipo ${equipo.marca}`}
                          >
                            <Icono nombre="edit" size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-button danger"
                            onClick={() => handleDeleteEquipo(equipo)}
                            title="Eliminar equipo"
                            aria-label={`Eliminar equipo ${equipo.marca}`}
                          >
                            <Icono nombre="trash" size={14} />
                          </button>
                        </div>
                        {lastOrder ? (
                          <div className="last-order-pill" onClick={() => navigate(`/ordenes/${lastOrder.numero}`)}>
                            Orden #{lastOrder.numero}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="equipment-pagination">
            <span>
              Página {page} de {totalPages}
            </span>
            <div className="equipment-pagination-controls">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={page === pageNumber ? "current" : ""}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</button>
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

      {selectedHistory && (
        <div className="history-overlay" onMouseDown={() => setSelectedHistory(null)}>
          <aside className="history-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="history-header">
              <div>
                <span>Serie</span>
                <h2>Historial del equipo</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setSelectedHistory(null)} aria-label="Cerrar historial">
                <Icono nombre="x" size={18} />
              </button>
            </div>

            <div className="history-summary">
              <strong>{selectedHistory.serie || "Sin serie"}</strong>
              <small>
                {selectedHistory.tipo || "Equipo"} · {selectedHistory.marca || "Marca no registrada"} · {selectedHistory.modelo || "Sin modelo"}
              </small>
            </div>

            <div className="history-list">
              {historyOrders.length === 0 ? (
                <div className="history-empty-state">
                  <Icono nombre="history" size={22} />
                  <strong>No hay historial</strong>
                  <p>No se encontraron órdenes anteriores relacionadas con esta serie.</p>
                </div>
              ) : (
                historyOrders.map((orden) => (
                  <article key={orden.id || orden.numero} className="history-item" onClick={() => navigate(`/ordenes/${orden.numero}`)}>
                    <div className="history-item-top">
                      <span>Orden #{orden.numero}</span>
                      <em>{orden.estado_actual || "Sin estado"}</em>
                    </div>
                    <div className="history-item-meta">
                      <small>Fecha: {formatFechaCorta(orden.fecha_ingreso)}</small>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {deleteTarget && (
        <div className="history-overlay" onMouseDown={() => setDeleteTarget(null)}>
          <div className="delete-confirmation" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{deleteTarget.blocked ? "No se puede eliminar el equipo" : "Eliminar equipo"}</h3>
            <p>{deleteTarget.blocked ? "Este equipo tiene historial asociado y no puede borrarse para no perder información del taller." : "¿Seguro que deseas eliminar este equipo?"}</p>
            <p className="delete-serial">Serie: {deleteTarget.equipo.serie || "Sin serie"}</p>
            <div className="delete-warning">
              {deleteTarget.blocked
                ? "Se encontró historial u órdenes relacionadas con esta serie. Revisa el historial antes de eliminarlo."
                : "El equipo tiene historial y órdenes asociadas. Para proteger la información del taller, esta eliminación está bloqueada."}
            </div>
            <div className="delete-actions">
              <button type="button" className="compact-secondary-button" onClick={() => setDeleteTarget(null)}>
                {deleteTarget.blocked ? "Entendido" : "Cancelar"}
              </button>
              {!deleteTarget.blocked && (
                <button type="button" className="compact-danger-button" onClick={confirmDelete}>Eliminar</button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="equipment-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
