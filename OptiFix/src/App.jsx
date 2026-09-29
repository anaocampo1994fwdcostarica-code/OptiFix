import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import NotificationDrawer from "./components/NotificationDrawer.jsx";
import Routing from "./routes/Routing.jsx";
import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      <div className="gestioo-public-layout" style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
        <Routing onOpenNewOrderModal={() => navigate('/nueva-orden')} />
      </div>
    );
  }

  return (
    <div className="gestioo-layout">
      {/* Barra Lateral Izquierda (Gestioo) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Área Principal */}
      <div className="gestioo-main-area">
        <TopNavbar onOpenNewOrderModal={() => navigate('/nueva-orden')} />

        <main style={{ flex: 1 }}>
          <Routing onOpenNewOrderModal={() => navigate('/nueva-orden')} />
        </main>
      </div>

      {/* Cajón Lateral de Notificaciones (Captura 3) */}
      <NotificationDrawer />
    </div>
  );
}