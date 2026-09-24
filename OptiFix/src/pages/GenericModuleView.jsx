import React from "react";
export default function GenericModuleView({ titulo, icon, descripcion }) {
  return (
    <div className="page-container">
      <div className="breadcrumb-nav">
        <span>Principal</span>
        <span>/</span>
        <span className="breadcrumb-current">{titulo}</span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>{titulo}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{descripcion}</p>
      </div>

      <div className="work-order-meta-card" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h3 style={{ fontSize: "16px", color: "#0f172a", marginBottom: "8px" }}>
          Módulo de {titulo}
        </h3>
        <p style={{ color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto 20px", fontSize: "13px" }}>
          Este módulo está integrado a la base de datos de Gestioo y preparado para sincronización con el inventario de repuestos y agenda de citas.
        </p>
      </div>
    </div>
  );
}
