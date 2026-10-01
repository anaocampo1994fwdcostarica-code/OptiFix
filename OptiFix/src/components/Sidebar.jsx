import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icono from "./icons.jsx";
import Logo from "./Logo.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTranslation } from "react-i18next";

export default function Sidebar({ collapsed, mobileOpen = false, onToggle }) {
  const location = useLocation();
  const [isServiceCenterOpen, setIsServiceCenterOpen] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const esAdmin = user?.rol === "admin";

  const isActive = (path) => location.pathname === path;

  return (
    <aside id="main-sidebar" className={`gestioo-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`} aria-label="Navegación principal">
      <div className="sidebar-header">
        <Link to="/dashboard" className="brand-logo">
          <Logo iconSize={30} showText={!collapsed} />
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
        <Link
          to="/dashboard"
          className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
        >
          <Icono nombre="barchart" size={18} />
          {!collapsed && <span>{t("nav.dashboard")}</span>}
        </Link>
        {/* Agenda */}
        <Link
          to="/agenda"
          className={`nav-item ${isActive("/agenda") ? "active" : ""}`}
        >
          <Icono nombre="calendar" size={18} />
          {!collapsed && <span>{t("nav.agenda")}</span>}
        </Link>
        {/* Centro de Servicios Acordeón */}
        <div className="nav-group">
          <button
            type="button"
            className="nav-group-header"
            onClick={() => setIsServiceCenterOpen(!isServiceCenterOpen)}
            aria-expanded={isServiceCenterOpen}
            aria-controls="service-center-submenu"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Icono nombre="wrench" size={18} />
              {!collapsed && <span>{t("nav.serviceCenter")}</span>}
            </div>
            {!collapsed && (
              <Icono
                nombre={isServiceCenterOpen ? "chevron-down" : "chevron-right"}
                size={14}
              />
            )}
          </button>

          {isServiceCenterOpen && !collapsed && (
            <div id="service-center-submenu" className="nav-submenu">
              <Link
                to="/ordenes"
                className={`nav-subitem ${
                  isActive("/ordenes") || location.pathname.startsWith("/ordenes/")
                    ? "active"
                    : ""
                }`}
              >
                {t("nav.orders")}
              </Link>
              <Link
                to="/equipos"
                className={`nav-subitem ${isActive("/equipos") ? "active" : ""}`}
              >
                {t("nav.equipment")}
              </Link>
              <Link
                to="/clientes"
                className={`nav-subitem ${isActive("/clientes") ? "active" : ""}`}
              >
                {t("nav.clients")}
              </Link>
              {esAdmin && (
                <Link
                  to="/estadisticas"
                  className={`nav-subitem ${isActive("/estadisticas") ? "active" : ""}`}
                >
                  {t("nav.statistics")}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Cotizaciones — solo Administrador */}
        {esAdmin && (
          <Link
            to="/cotizaciones"
            className={`nav-item ${isActive("/cotizaciones") ? "active" : ""}`}
          >
            <Icono nombre="clipboard" size={18} />
            {!collapsed && <span>{t("nav.quotes")}</span>}
          </Link>
        )}

        {esAdmin && (
          <Link to="/usuarios" className={`nav-item ${isActive("/usuarios") ? "active" : ""}`}>
            <Icono nombre="users" size={18} />
            {!collapsed && <span>{t("nav.users")}</span>}
          </Link>
        )}

        {/* Productos */}
        <Link
          to="/productos"
          className={`nav-item ${isActive("/productos") ? "active" : ""}`}
        >
          <Icono nombre="box" size={18} />
          {!collapsed && <span>{t("nav.products")}</span>}
        </Link>

        {/* Servicios */}
        <Link
          to="/servicios"
          className={`nav-item ${isActive("/servicios") ? "active" : ""}`}
        >
          <Icono nombre="wrench" size={18} />
          {!collapsed && <span>{t("nav.services")}</span>}
        </Link>
      </nav>
    </aside>
  );
}
