import React from "react";
import Icono from "./icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";

export default function NotificationDrawer() {
  const { isNotificationDrawerOpen, setIsNotificationDrawerOpen, notificaciones } = useWorkshop();

  return (
    <aside className={`notifications-drawer ${isNotificationDrawerOpen ? "open" : ""}`}>
      <div className="drawer-header">
        <div className="drawer-header-icons">
          <Icono nombre="headset" size={16} />
          <Icono nombre="file-text" size={16} />
          <Icono nombre="message" size={16} />
          <Icono nombre="bell" size={16} />
        </div>
        <span className="drawer-title">Notificaciones</span>
        <button
          className="modal-close-btn"
          onClick={() => setIsNotificationDrawerOpen(false)}
          title="Cerrar panel"
        >
          <Icono nombre="x" size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {notificaciones.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "30px 10px" }}>
            No hay notificaciones pendientes.
          </div>
        ) : (
          notificaciones.map((n) => (
            <div key={n.id} className="notification-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff" }}>
                  {n.titulo}
                </span>
                <input type="checkbox" defaultChecked={n.leido} />
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                {n.mensaje}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
                <span>📅 {n.fecha}</span>
                <span style={{ color: "var(--accent-blue)", cursor: "pointer" }}>Marcar como leído</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="drawer-footer">
        <button className="btn-outline-icon" title="Limpiar todas">
          <Icono nombre="trash" size={15} />
        </button>
        <button className="btn-outline-icon" title="Ver todo">
          <Icono nombre="eye" size={15} />
        </button>
        <button
          className="btn-outline-icon"
          onClick={() => setIsNotificationDrawerOpen(false)}
          title="Cerrar"
        >
          <Icono nombre="x" size={15} />
        </button>
      </div>
    </aside>
  );
}
