import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import NotificationDrawer from "./components/NotificationDrawer.jsx";
import OptiBotFloating from "./components/ai/OptiBotFloating.jsx";
import Footer from "./components/Footer.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import AccessibilityWidget from "./components/AccessibilityWidget.jsx";
import Routing from "./routes/Routing.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useTranslation } from "react-i18next";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { status } = useAuth();
  const { t } = useTranslation();

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname.startsWith("/seguimiento") ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/login/") ||
    location.pathname === "/register";
  const isAuthRoute = location.pathname === "/login" || location.pathname.startsWith("/login/") || location.pathname === "/register";

  // Mientras no haya sesión (o se esté verificando), nunca se muestra el
  // shell privado (sidebar + topbar) — evita el "flash" del panel antes
  // de que ProtectedRoute redirija a /login.
  const mostrarShellPrivado = !isPublicRoute && status === "autenticado";

  if (!mostrarShellPrivado) {
    return (
      <div className={`gestioo-public-layout ${isAuthRoute ? "auth-public-layout" : ""}`} style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)", display: "flex", flexDirection: "column" }}>
        <a className="skip-link" href="#main-content">{t("shell.skip")}</a>
        <main id="main-content" className={`public-main ${isAuthRoute ? "auth-public-main" : ""}`} tabIndex={-1}><Routing onOpenNewOrderModal={() => navigate('/nueva-orden')} /></main>
        <Footer />
        <AccessibilityWidget />
        <CookieBanner />
      </div>
    );
  }

  return (
    <div className="gestioo-layout">
      <a className="skip-link" href="#main-content">{t("shell.skip")}</a>
      {/* Barra Lateral Izquierda (Gestioo) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {mobileMenuOpen && <button type="button" className="mobile-sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)} />}

      {/* Área Principal */}
      <div className="gestioo-main-area">
        <TopNavbar onOpenNewOrderModal={() => navigate('/nueva-orden')} onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)} mobileMenuOpen={mobileMenuOpen} />

        <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
          <Routing onOpenNewOrderModal={() => navigate('/nueva-orden')} />
        </main>
        <Footer />
      </div>

      {/* Cajón Lateral de Notificaciones (Captura 3) */}
      <NotificationDrawer />
      {location.pathname !== "/asistente" && <OptiBotFloating />}
      <AccessibilityWidget />
      <CookieBanner />
    </div>
  );
}
