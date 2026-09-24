import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage.jsx";
import Login from "../pages/Login.jsx";
import SeguimientoPublico from "../pages/SeguimientoPublico.jsx";
import OrdenesList from "../pages/OrdenesList.jsx";
import OrdenDetalle from "../pages/OrdenDetalle.jsx";
import ClientesView from "../pages/ClientesView.jsx";
import EquiposView from "../pages/EquiposView.jsx";
import EstadisticasView from "../pages/EstadisticasView.jsx";
import ProductosView from "../pages/ProductosView.jsx";
import ServiciosView from "../pages/ServiciosView.jsx";
import CotizacionesView from "../pages/CotizacionesView.jsx";
import GenericModuleView from "../pages/GenericModuleView.jsx";
import Agenda from "../pages/Agenda.jsx";

export default function Routing({ onOpenNewOrderModal }) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/admin" element={<Login />} />
      <Route path="/login/tecnico" element={<Login />} />
      <Route path="/seguimiento/:id" element={<SeguimientoPublico />} />

      <Route
        path="/ordenes"
        element={<OrdenesList onOpenNewOrderModal={onOpenNewOrderModal} />}
      />
      <Route path="/ordenes/:numero" element={<OrdenDetalle />} />

      <Route path="/clientes" element={<ClientesView />} />
      <Route
        path="/equipos"
        element={<EquiposView onOpenNewOrderModal={onOpenNewOrderModal} />}
      />
      <Route path="/estadisticas" element={<EstadisticasView />} />

      {/* Módulos auxiliares */}
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/cotizaciones" element={<CotizacionesView />} />
      <Route path="/productos" element={<ProductosView />} />
      <Route path="/servicios" element={<ServiciosView />} />

      <Route path="*" element={<Navigate to="/ordenes" replace />} />
    </Routes>
  );
}