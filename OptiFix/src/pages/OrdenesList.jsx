import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { getEstadoBadge } from "../utils/estadoColors.js";
import { useTranslation } from "react-i18next";
import "./OrdenesList.css";

const PAGE_SIZE = 6;

// Filtros exactos solicitados
function matchTab(orden, tabId) {
  const estado = (orden.estado_actual || "").toUpperCase();
  const etapa  = (orden.etapa_categoria || "").toUpperCase();
  switch (tabId) {
    case "TODOS":
      return true;
    case "ENTRADA":
      return etapa === "ENTRADA" || estado === "RECEPCIÓN" || estado === "ENTRADA";
    case "TRAMITE":
      return (
        estado.includes("PRESUPUESTO") ||
        estado.includes("TRÁMITE") ||
        estado === "REPARADO" ||
        etapa === "TRAMITE"
      );
    case "TALLER":
      return etapa === "TALLER" || estado === "TALLER";
    case "SALIDA":
      return etapa === "SALIDA" || estado === "ENTREGADO" || estado === "SALIDA";
    default:
      return true;
  }
}

export default function OrdenesList({ onOpenNewOrderModal }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ordenes, equipos, clientes } = useWorkshop();
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const pipelineTabs = [
    { id: "TODOS", label: t("orders.all") }, { id: "ENTRADA", label: t("orders.entry") },
    { id: "TRAMITE", label: t("orders.progress") }, { id: "TALLER", label: t("orders.workshop") }, { id: "SALIDA", label: t("orders.delivered") }
  ];

  const filteredOrdenes = ordenes.filter((o) => matchTab(o, activeTab));
  
  const totalPages = Math.ceil(filteredOrdenes.length / PAGE_SIZE) || 1;
  const paginatedOrdenes = filteredOrdenes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <span>Principal</span>
        <span>/</span>
        <span>Taller</span>
        <span>/</span>
        <span className="breadcrumb-current">{t("nav.orders")}</span>
      </div>

      {/* Título de sección + botón nueva orden */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
            {t("orders.title")}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            {t("orders.description")}
          </p>
        </div>
      </div>

      {/* Pestañas de Filtro con los 4 estados exactos */}
      <div className="order-tabs-bar" style={{ marginBottom: "20px" }}>
        {pipelineTabs.map((tab) => {
          const count = ordenes.filter((o) => matchTab(o, tab.id)).length;
          return (
            <button
              key={tab.id}
              className={`order-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: "6px",
                fontSize: "11px",
                background: activeTab === tab.id ? "rgba(56,189,248,0.2)" : "var(--bg-input)",
                padding: "1px 6px",
                borderRadius: "99px",
                color: activeTab === tab.id ? "var(--accent-cyan)" : "var(--text-dim)"
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla de Órdenes */}
      <div className="table-card orders-table-card">
        <table className="gestioo-table orders-table">
          <thead>
            <tr>
              <th style={{ width: "110px" }}>N°</th>
              <th>ESTADO</th>
              <th>N° SERIE</th>
              <th>MARCA</th>
              <th>MODELO</th>
              <th>CLIENTE</th>
              <th>INGRESO</th>
              <th style={{ textAlign: "right" }}>{t("orders.action")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrdenes.length === 0 ? (
              <tr>
                <td colSpan="8" style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "var(--text-dim)"
                }}>
                  <div>No hay órdenes en esta categoría.</div>
                </td>
              </tr>
            ) : (
              paginatedOrdenes.map((orden) => {
                const eq  = equipos.find((e) => e.id === orden.equipo_id) || {};
                const cli = clientes.find((c) => c.id === orden.cliente_id) || {};

                // Color del badge de estado
                const estadoBadge = getEstadoBadge(orden);

                return (
                  <tr
                    key={orden.id}
                    className="table-row-clickable orders-table-row"
                    onClick={() => navigate(`/ordenes/${orden.numero}`)}
                  >
                    <td>
                      <div className="table-order-num">
                        <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{orden.numero}</span>
                      </div>
                    </td>
                    <td>
                      <span className="orders-table-status" style={{
                        background: estadoBadge.bg,
                        color: estadoBadge.color,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.3px",
                        whiteSpace: "nowrap"
                      }}>
                        {orden.estado_actual}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#334155" }}>
                      {eq.serie || "—"}
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      {eq.marca || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {eq.modelo || "NO TRAE MODELO"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "#0f172a", fontSize: "13px" }}>
                        {cli.nombre || "—"}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                        {cli.telefono}
                      </div>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {orden.fecha_ingreso?.split(" ")[0]}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-outline-icon order-detail-button"
                        style={{ display: "inline-flex" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ordenes/${orden.numero}`);
                        }}
                        title="Ver detalle"
                      >
                        {t("orders.viewDetail")}
                      </button>
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
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOrdenes.length)} de {filteredOrdenes.length} órdenes
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
    </div>
  );
}
