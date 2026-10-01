import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icono from "./icons.jsx";
import Logo from "./Logo.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTranslation } from "react-i18next";

export default function TopNavbar({ onOpenNewOrderModal, onToggleMobileMenu, mobileMenuOpen = false }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem("optifix_font_scale")) || 1);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
  useEffect(() => { document.documentElement.style.setProperty("--font-scale", fontScale); localStorage.setItem("optifix_font_scale", String(fontScale)); }, [fontScale]);

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

  return <>
    <header className="gestioo-topbar">
      <button type="button" className="mobile-menu-btn" onClick={onToggleMobileMenu} aria-label={mobileMenuOpen ? "Cerrar menú lateral" : "Abrir menú lateral"} aria-expanded={mobileMenuOpen} aria-controls="main-sidebar">☰</button>
      <div className="block md:hidden"><Logo iconSize={24} /></div>

      {/* Buscador Global */}
      <div className="topbar-search-wrapper">
        <span className="search-icon-pos">
          <Icono nombre="search" size={15} />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="topbar-search-input"
          aria-label="Buscar órdenes, clientes o equipos"
          placeholder={t("search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="search-shortcut-kbd">/</kbd>

        {/* Resultados de Búsqueda Global */}
        {searchResults && (
          <div className="global-search-dropdown bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50 overflow-hidden">
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
        <div className="topbar-font-controls" aria-label="Tamaño de texto">
          <button type="button" onClick={() => setFontScale((value) => Math.max(.9, Number((value - .1).toFixed(1))))} title="Reducir tamaño de texto">A−</button>
          <button type="button" onClick={() => setFontScale((value) => Math.min(1.2, Number((value + .1).toFixed(1))))} title="Aumentar tamaño de texto">A+</button>
        </div>
        <button
          className="topbar-language-btn"
          onClick={() => i18n.changeLanguage(i18n.language === "es" ? "en" : "es")}
          title={t("action.language")}
          aria-label={t("action.language")}
        >
          {i18n.language === "es" ? "EN" : "ES"}
        </button>
        <button className="topbar-icon-btn" onClick={toggleTheme} title="Cambiar Tema" aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"} aria-pressed={theme === "dark"}>
          <Icono nombre={theme === "light" ? "moon" : "sun"} size={18} />
        </button>

        <button
          className="btn-new-order-quick"
          onClick={onOpenNewOrderModal}
          title="Crear nueva orden de trabajo"
        >
          <Icono nombre="plus" size={15} />
          <span>{t("action.newOrder")}</span>
        </button>

        <button className="topbar-icon-btn cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setIsChatOpen(true)} title="Mensajes internos" aria-label="Abrir chat interno" aria-expanded={isChatOpen}>
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
          {t("action.logout")}
        </button>

        <div className="user-avatar-btn" title="Perfil de usuario">
          <span>{getInitials(user?.nombre)}</span>
        </div>
      </div>
    </header>
    {isChatOpen && <InternalChatDrawer onClose={() => setIsChatOpen(false)} />}
  </>;
}

function InternalChatDrawer({ onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ id: 1, author: "Sistema", text: "Canal interno del taller. Coordiná tareas con el equipo." }]);
  const sendMessage = (event) => { event.preventDefault(); if (!message.trim()) return; setMessages((current) => [...current, { id: Date.now(), author: "Yo", text: message.trim() }]); setMessage(""); };
  return <div className="internal-chat-backdrop" onMouseDown={onClose}><aside className="internal-chat-drawer" role="dialog" aria-modal="true" aria-label="Chat interno" onMouseDown={(event) => event.stopPropagation()}><header><div><span>COMUNICACIÓN</span><h2>Chat Interno</h2></div><button type="button" onClick={onClose} aria-label="Cerrar chat">×</button></header><div className="internal-chat-messages">{messages.map((item) => <div key={item.id} className={item.author === "Yo" ? "mine" : ""}><small>{item.author}</small><p>{item.text}</p></div>)}</div><form onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribí un mensaje…" aria-label="Mensaje" /><button type="submit">Enviar</button></form></aside></div>;
}
