import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icono from "./icons.jsx";
import OptifixLogo from "./OptifixLogo.jsx";

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [isServiceCenterOpen, setIsServiceCenterOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`gestioo-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <Link to="/ordenes" className="brand-logo">
          <span className="brand-key-badge">
            <OptifixLogo size={28} />
          </span>
          {!collapsed && <span className="brand-wordmark">OPTIFIX</span>}
        </Link>
        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <Icono nombre={collapsed ? "chevron-right" : "arrow-left"} size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Agenda */}
        <Link
          to="/agenda"
          className={`nav-item ${isActive("/agenda") ? "active" : ""}`}
        >
          <Icono nombre="calendar" size={18} />
          {!collapsed && <span>Agenda</span>}
        </Link>

        {/* Centro de Servicios Acordeón */}
        <div className="nav-group">
          <button
            type="button"
            className="nav-group-header"
            onClick={() => setIsServiceCenterOpen(!isServiceCenterOpen)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Icono nombre="wrench" size={18} />
              {!collapsed && <span>Centro de Servicios</span>}
            </div>
            {!collapsed && (
              <Icono
                nombre={isServiceCenterOpen ? "chevron-down" : "chevron-right"}
                size={14}
              />
            )}
          </button>

          {isServiceCenterOpen && !collapsed && (
            <div className="nav-submenu">
              <Link
                to="/ordenes"
                className={`nav-subitem ${
                  isActive("/ordenes") || location.pathname.startsWith("/ordenes/")
                    ? "active"
                    : ""
                }`}
              >
                Órdenes de trabajo
              </Link>
              <Link
                to="/equipos"
                className={`nav-subitem ${isActive("/equipos") ? "active" : ""}`}
              >
                Equipos (Historial)
              </Link>
              <Link
                to="/clientes"
                className={`nav-subitem ${isActive("/clientes") ? "active" : ""}`}
              >
                Clientes (Historial)
              </Link>
              <Link
                to="/estadisticas"
                className={`nav-subitem ${isActive("/estadisticas") ? "active" : ""}`}
              >
                Estadísticas
              </Link>
            </div>
          )}
        </div>

        {/* Cotizaciones */}
        <Link
          to="/cotizaciones"
          className={`nav-item ${isActive("/cotizaciones") ? "active" : ""}`}
        >
          <Icono nombre="clipboard" size={18} />
          {!collapsed && <span>Cotizaciones</span>}
        </Link>

        {/* Productos */}
        <Link
          to="/productos"
          className={`nav-item ${isActive("/productos") ? "active" : ""}`}
        >
          <Icono nombre="box" size={18} />
          {!collapsed && <span>Productos</span>}
        </Link>

        {/* Servicios */}
        <Link
          to="/servicios"
          className={`nav-item ${isActive("/servicios") ? "active" : ""}`}
        >
          <Icono nombre="wrench" size={18} />
          {!collapsed && <span>Servicios</span>}
        </Link>
      </nav>
    </aside>
  );
}
