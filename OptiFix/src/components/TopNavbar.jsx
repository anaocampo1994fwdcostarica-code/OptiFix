import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icono from "./icons.jsx";
import OptifixLogo from "./OptifixLogo.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function TopNavbar({ onOpenNewOrderModal }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { user, logout } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    notificaciones,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    theme,
    toggleTheme
  } = useWorkshop();

  // Atajo de teclado: presionar '/' para enfocar el buscador global
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const unreadCount = notificaciones.filter((n) => !n.leido).length;

  function salir() {
    logout();
    navigate("/login", { replace: true });
  }

  function getInitials(name) {
    if (!name) return "OP";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <header className="gestioo-topbar">
      <div className="topbar-brand" aria-label="OptiFix brand">
        <OptifixLogo size={22} className="topbar-brand-mark" />
        <span className="topbar-brand-wordmark">OPTIFIX</span>
      </div>

      {/* Buscador Global */}
      <div className="topbar-search-wrapper">
        <span className="search-icon-pos">
          <Icono nombre="search" size={15} />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="topbar-search-input"
          placeholder="Buscar orden, cliente o equipo [/]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="search-shortcut-kbd">/</kbd>

        {/* Resultados de Búsqueda Global */}
        {searchResults && (
          <div className="global-search-dropdown">
            {searchResults.totalCount === 0 ? (
              <div style={{ padding: "12px 14px", color: "var(--text-dim)", fontSize: "12px" }}>
                Sin resultados para "{searchQuery}"
              </div>
            ) : (
              <>
                {searchResults.ordenes.length > 0 && (
                  <div>
                    <div className="search-category-title">Órdenes de Trabajo</div>
                    {searchResults.ordenes.slice(0, 4).map((o) => (
                      <div
                        key={o.id}
                        className="search-result-item"
                        onClick={() => {
                          setSearchQuery("");
                          navigate(`/ordenes/${o.numero}`);
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#fff" }}>
                          Orden Nº {o.numero}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                          {o.estado_actual}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.clientes.length > 0 && (
                  <div>
                    <div className="search-category-title">Clientes</div>
                    {searchResults.clientes.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="search-result-item"
                        onClick={() => {
                          setSearchQuery("");
                          navigate(`/clientes?id=${c.id}`);
                        }}
                      >
                        <span style={{ color: "#fff" }}>{c.nombre}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {c.telefono || c.identificacion}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.equipos.length > 0 && (
                  <div>
                    <div className="search-category-title">Equipos</div>
                    {searchResults.equipos.slice(0, 3).map((eq) => (
                      <div
                        key={eq.id}
                        className="search-result-item"
                        onClick={() => {
                          setSearchQuery("");
                          navigate(`/equipos?id=${eq.id}`);
                        }}
                      >
                        <span style={{ color: "#fff" }}>
                          {eq.marca} {eq.modelo}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {eq.serie}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Botones de acción derecha */}
      <div className="topbar-actions">
        <button className="topbar-icon-btn" onClick={toggleTheme} title="Cambiar Tema">
          <Icono nombre={theme === "light" ? "moon" : "sun"} size={18} />
        </button>

        <button
          className="btn-new-order-quick"
          onClick={onOpenNewOrderModal}
          title="Crear nueva orden de trabajo"
        >
          <Icono nombre="plus" size={15} />
          <span>Nueva Orden</span>
        </button>

        <button className="topbar-icon-btn" title="Mensajes internos">
          <Icono nombre="message" size={16} />
        </button>

        <button
          className="topbar-icon-btn"
          title="Notificaciones"
          onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
        >
          <Icono nombre="bell" size={17} />
          {unreadCount > 0 && <span className="badge-counter" />}
        </button>

        <button className="topbar-logout-btn" onClick={salir} title="Cerrar sesión">
          Salir
        </button>

        <div className="user-avatar-btn" title="Perfil de usuario">
          <span>{getInitials(user?.nombre)}</span>
        </div>
      </div>
    </header>
  );
}
