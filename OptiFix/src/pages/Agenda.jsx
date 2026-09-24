import React from "react";

export default function Agenda() {
  return (
    <div className="page-container">
      <div className="breadcrumb-nav">
        <span>Principal</span>
        <span>/</span>
        <span className="breadcrumb-current">Agenda de Citas</span>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--brand-slate)", marginBottom: "4px" }}>
          Agenda de Citas y Turnos
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Sincronización en tiempo real. Gestiona visitas, recepciones y entregas.
        </p>
      </div>

      <div className="table-card" style={{ padding: "24px", backgroundColor: "var(--brand-tint)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", color: "var(--brand-cerulean)", fontWeight: 700 }}>
            Próximas Citas (Hoy)
          </h2>
          <button className="btn-primary" style={{ backgroundColor: "var(--brand-cerulean)" }}>
            + Nueva Cita
          </button>
        </div>
        
        <table className="gestioo-table" style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
          <thead>
            <tr>
              <th>HORA</th>
              <th>CLIENTE</th>
              <th>EQUIPO / MOTIVO</th>
              <th>ESTADO</th>
              <th style={{ textAlign: "right" }}>CONTACTO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>10:30 AM</td>
              <td>Juan Pérez</td>
              <td>iPhone 13 - Revisión de Batería</td>
              <td><span className="pill-badge-green" style={{ backgroundColor: "#fbbf24", color: "#78350f" }}>Pendiente</span></td>
              <td style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button className="btn-outline-icon" title="Llamar">📞</button>
                <button className="btn-outline-icon" title="WhatsApp" style={{ color: "#25D366" }}>💬</button>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>11:45 AM</td>
              <td>María Gómez</td>
              <td>Samsung TV 55" - Reparación Taller</td>
              <td><span className="pill-badge-green" style={{ backgroundColor: "#34d399", color: "#064e3b" }}>Confirmada</span></td>
              <td style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button className="btn-outline-icon" title="Llamar">📞</button>
                <button className="btn-outline-icon" title="WhatsApp" style={{ color: "#25D366" }}>💬</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
