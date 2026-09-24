import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Lo opuesto a PrivateRoutes: si YA hay sesión, no tiene sentido
// mostrar Login/Register de nuevo -> lo mandamos al dashboard.
export default function GuestRoutes() {
  const { status } = useAuth();

  if (status === "autenticado") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
