import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import NotificationDrawer from "./components/NotificationDrawer.jsx";
import Routing from "./routes/Routing.jsx";
import NuevaOrdenModal from "./components/modals/NuevaOrdenModal.jsx";
import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const location = useLocation();
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
        <Routing onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)} />
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
        <TopNavbar onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)} />

        <main style={{ flex: 1 }}>
          <Routing onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)} />
        </main>
      </div>

      {/* Cajón Lateral de Notificaciones (Captura 3) */}
      <NotificationDrawer />

      {/* Modal Global para Crear Nueva Orden */}
      <NuevaOrdenModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />
    </div>
  );
}