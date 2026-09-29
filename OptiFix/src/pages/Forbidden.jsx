import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <section className="auth-wrap">
      <div className="card auth-card" style={{ textAlign: "center" }}>
        <h1>403 — Acceso restringido</h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          No tienes permisos para ver esta página. Inicia sesión con una cuenta autorizada.
        </p>
        <Link to="/login" className="btn btn-primary btn-block">
          Ir al inicio de sesión
        </Link>
      </div>
    </section>
  );
}
