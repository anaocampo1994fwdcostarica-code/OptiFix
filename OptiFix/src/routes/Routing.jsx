import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import SeguimientoOrdenView from "../pages/SeguimientoOrdenView.jsx";
import OrdenesList from "../pages/OrdenesList.jsx";
import OrdenDetalle from "../pages/OrdenDetalle.jsx";
import ClientesView from "../pages/ClientesView.jsx";
import EquiposView from "../pages/EquiposView.jsx";
import EstadisticasView from "../pages/EstadisticasView.jsx";
import ProductosView from "../pages/ProductosView.jsx";
import ServiciosView from "../pages/ServiciosView.jsx";
import CotizacionesView from "../pages/CotizacionesView.jsx";
import AgendaView from "../pages/AgendaView.jsx";
import DashboardView from "../pages/DashboardView.jsx";
import UsuariosView from "../pages/UsuariosView.jsx";
import AsistenteIAView from "../pages/AsistenteIAView.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

import NuevaOrdenView from "../pages/NuevaOrdenView.jsx";

export default function Routing({ onOpenNewOrderModal }) {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/admin" element={<Login />} />
      <Route path="/login/tecnico" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/seguimiento/:token" element={<SeguimientoOrdenView />} />

      {/* Rutas privadas — cualquier sesión (admin o técnico) */}
      <Route
        path="/usuarios"
        element={<ProtectedRoute allowedRoles={["admin"]}><UsuariosView /></ProtectedRoute>}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardView onOpenNewOrderModal={onOpenNewOrderModal} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nueva-orden"
        element={
          <ProtectedRoute>
            <NuevaOrdenView onOrdenCreada={() => {}} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordenes"
        element={
          <ProtectedRoute>
            <OrdenesList onOpenNewOrderModal={onOpenNewOrderModal} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordenes/:numero"
        element={
          <ProtectedRoute>
            <OrdenDetalle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipos"
        element={
          <ProtectedRoute>
            <EquiposView onOpenNewOrderModal={onOpenNewOrderModal} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <AgendaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/productos"
        element={
          <ProtectedRoute>
            <ProductosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicios"
        element={
          <ProtectedRoute>
            <ServiciosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asistente"
        element={<ProtectedRoute allowedRoles={["admin", "tecnico"]}><AsistenteIAView /></ProtectedRoute>}
      />

      {/* Rutas privadas — exclusivas de Administrador */}
      <Route
        path="/estadisticas"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EstadisticasView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cotizaciones"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CotizacionesView />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
