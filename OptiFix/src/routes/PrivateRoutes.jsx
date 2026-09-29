import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// PrivateRoutes protege las rutas privadas del panel de OptiFix.
// - Si todavía no se sabe si hay sesión -> pantalla de carga (evita parpadeo).
// - Si no hay sesión -> redirige a /login, guardando a dónde quería ir.
// - Si todo bien -> <Outlet /> renderiza la ruta hija real.
export default function PrivateRoutes() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "verificando") {
    return (
      <div className="loading-block" role="status">
        <span className="spinner" /> Verificando sesión...
      </div>
    );
  }

  if (status === "no-autenticado") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
