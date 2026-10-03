import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icono from "./icons.jsx";
import Logo from "./Logo.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

export default function TopNavbar({ onOpenNewOrderModal, onToggleMobileMenu, mobileMenuOpen = false }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage === "en" ? "en" : "es";
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem("optifix_font_scale")) || 1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    notificaciones,
    usuarios,
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
      <button type="button" className="mobile-menu-btn" onClick={onToggleMobileMenu} aria-label={mobileMenuOpen ? t("shell.closeMenu") : t("shell.openMenu")} aria-expanded={mobileMenuOpen} aria-controls="main-sidebar">☰</button>
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
          aria-label={t("shell.searchLabel")}
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
                {t("shell.noResults", { query: searchQuery })}
              </div>
            ) : (
              <>
                {searchResults.ordenes.length > 0 && (
                  <div>
                    <div className="search-category-title">{t("shell.workOrders")}</div>
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
                          {t("shell.orderNumber", { number: o.numero })}
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
                    <div className="search-category-title">{t("shell.clients")}</div>
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
                    <div className="search-category-title">{t("shell.equipment")}</div>
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
        <button
          className="topbar-language-btn"
          onClick={() => void i18n.changeLanguage(activeLanguage === "es" ? "en" : "es")}
          title={t("action.language")}
          aria-label={t("action.language")}
        >
          {activeLanguage.toUpperCase()}
        </button>
        <button className="topbar-icon-btn" onClick={toggleTheme} title={t("shell.changeTheme")} aria-label={theme === "light" ? t("shell.darkMode") : t("shell.lightMode")} aria-pressed={theme === "dark"}>
          <Icono nombre={theme === "light" ? "moon" : "sun"} size={18} />
        </button>

        <button
          className="btn-new-order-quick"
          onClick={onOpenNewOrderModal}
          title={t("shell.createOrder")}
        >
          <Icono nombre="plus" size={15} />
          <span>{t("action.newOrder")}</span>
        </button>

        <button className="topbar-icon-btn cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setIsChatOpen(true)} title={t("shell.internalMessages")} aria-label={t("shell.openChat")} aria-expanded={isChatOpen}>
          <Icono nombre="message" size={16} />
        </button>

        <button
          className={`topbar-icon-btn focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${unreadCount > 0 ? "animate-pulse" : ""}`}
          title={t("shell.notifications")}
          aria-label={`${t("shell.notifications")}: ${unreadCount}`}
          aria-expanded={isNotificationDrawerOpen}
          onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
        >
          <Icono nombre="bell" size={17} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-2.5 w-2.5" aria-label={`${unreadCount} ${t("shell.notifications")}`}>
              <span aria-hidden="true" className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span aria-hidden="true" className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </span>
          )}
        </button>

        <button className="topbar-logout-btn" onClick={salir} title={t("shell.logout")}>
          {t("action.logout")}
        </button>

        <div className="user-avatar-btn" title={t("shell.profile")}>
          <span>{getInitials(user?.nombre)}</span>
        </div>
      </div>
    </header>
    {isChatOpen && <InternalChatDrawer currentUser={user} users={usuarios} onClose={() => setIsChatOpen(false)} />}
  </>;
}

function InternalChatDrawer({ currentUser, users = [], onClose }) {
  const { t, i18n } = useTranslation();
  const drawerRef = useFocusTrap(true, onClose);
  const [activeContact, setActiveContact] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const myId = String(currentUser?.id || currentUser?.usuario || "current-user");
  const contacts = users.filter((contact) => String(contact.id || contact.usuario) !== myId);
  const conversationKey = activeContact ? `optifix_chat_${[myId, String(activeContact.id || activeContact.usuario)].sort().join("_")}` : "";
  const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US";

  useEffect(() => {
    if (!conversationKey) return;
    try { setMessages(JSON.parse(localStorage.getItem(conversationKey) || "[]")); } catch { setMessages([]); }
  }, [conversationKey]);
  const openConversation = (contact) => { setActiveContact(contact); setMessage(""); setConfirmClear(false); };
  const sendMessage = (event) => { event.preventDefault(); if (!message.trim() || !activeContact) return; const next = [...messages, { id: Date.now(), senderId: myId, text: message.trim(), createdAt: new Date().toISOString() }]; setMessages(next); localStorage.setItem(conversationKey, JSON.stringify(next)); setMessage(""); };
  const clearConversation = () => { localStorage.removeItem(conversationKey); setMessages([]); setConfirmClear(false); };

  return <div className="internal-chat-backdrop" onMouseDown={onClose}><aside ref={drawerRef} tabIndex={-1} className="internal-chat-drawer" role="dialog" aria-modal="true" aria-label={t("chat.title")} onMouseDown={(event) => event.stopPropagation()}>
    {!activeContact ? <><header><div><span>{t("chat.directMessages")}</span><h2>{t("chat.title")}</h2></div><button type="button" onClick={onClose} aria-label={t("chat.close")}>×</button></header><div className="internal-chat-contacts">{contacts.length ? contacts.map((contact, index) => <button type="button" key={contact.id || contact.usuario} onClick={() => openConversation(contact)}><span className="chat-contact-avatar">{initials(contact.nombre)}</span><span className="chat-contact-copy"><b>{contact.nombre}</b><small>{contact.rol === "admin" ? t("chat.admin") : t("chat.technician")}</small></span><i className={index % 3 === 0 ? "offline" : "online"} title={index % 3 === 0 ? t("chat.offline") : t("chat.online")} /></button>) : <p className="internal-chat-empty">{t("chat.noUsers")}</p>}</div></> : <><header className="internal-chat-active-header"><button type="button" className="internal-chat-back" onClick={() => setActiveContact(null)}>← {t("chat.back")}</button><div className="internal-chat-active-contact"><span className="chat-contact-avatar">{initials(activeContact.nombre)}</span><div><h2>{activeContact.nombre}</h2><small>{activeContact.rol === "admin" ? t("chat.admin") : t("chat.technician")} · {t("chat.online")}</small></div></div><button type="button" className="internal-chat-trash" onClick={() => setConfirmClear(true)} title={t("chat.deleteConversation")} aria-label={t("chat.deleteConversation")}>🗑</button></header><div className="internal-chat-messages">{messages.length ? messages.map((item) => <div key={item.id} className={String(item.senderId) === myId ? "mine" : "received"}><p>{item.text}</p><small>{new Date(item.createdAt).toLocaleTimeString(i18n.language === "en" ? "en-US" : "es-CR", { hour: "2-digit", minute: "2-digit" })}</small></div>) : <p className="internal-chat-empty">{t("chat.noMessages")}</p>}</div><form onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("chat.messageFor", { name: activeContact.nombre })} aria-label={t("chat.message")} /><button type="submit">{t("chat.send")}</button></form>{confirmClear && <div className="internal-chat-confirm"><div><strong>{t("chat.deleteTitle")}</strong><p>{t("chat.deleteBody")}</p><span><button type="button" onClick={() => setConfirmClear(false)}>{t("chat.cancel")}</button><button type="button" onClick={clearConversation}>{t("chat.delete")}</button></span></div></div>}</>}
  </aside></div>;
}
