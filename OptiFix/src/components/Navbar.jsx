import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Logo from "./Logo.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <Logo showTagline />

        <nav className="nav-links" aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
          <Link to="/consulta-radicado">Consulta de radicados</Link>
          <Link to="/verificacion">Verificar documento</Link>

          {user ? (
            <>
              <Link to="/dashboard">Mi portal</Link>
              <button onClick={logout} className="nav-link-button">
                Salir ({user.nombre})
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-cta">
              Ingreso ciudadano
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}