import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Envuelve una ruta privada. Si no hay sesión, redirige a /login.
 * Si se pasa allowedRoles y el rol del usuario no está incluido,
 * redirige a /ordenes (áreas comunes a ambos roles).
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, status } = useAuth();

  if (status === "verificando") {
    return null;
  }

  if (status !== "autenticado" || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/ordenes" replace />;
  }

  return children;
}
