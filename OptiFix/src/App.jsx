import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import NotificationDrawer from "./components/NotificationDrawer.jsx";
import OptiBotFloating from "./components/ai/OptiBotFloating.jsx";
import Footer from "./components/Footer.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import Routing from "./routes/Routing.jsx";
import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { status } = useAuth();

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname.startsWith("/seguimiento") ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/login/") ||
    location.pathname === "/register";

  // Mientras no haya sesión (o se esté verificando), nunca se muestra el
  // shell privado (sidebar + topbar) — evita el "flash" del panel antes
  // de que ProtectedRoute redirija a /login.
  const mostrarShellPrivado = !isPublicRoute && status === "autenticado";

  if (!mostrarShellPrivado) {
    return (
      <div className="gestioo-public-layout" style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)", display: "flex", flexDirection: "column" }}>
        <Routing onOpenNewOrderModal={() => navigate('/nueva-orden')} />
        <Footer />
        <CookieBanner />
      </div>
    );
  }

  return (
    <div className="gestioo-layout">
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

        <main style={{ flex: 1 }}>
          <Routing onOpenNewOrderModal={() => navigate('/nueva-orden')} />
        </main>
        <Footer />
      </div>

      {/* Cajón Lateral de Notificaciones (Captura 3) */}
      <NotificationDrawer />
      {location.pathname !== "/asistente" && <OptiBotFloating />}
      <CookieBanner />
    </div>
  );
}
