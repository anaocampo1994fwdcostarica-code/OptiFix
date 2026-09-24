import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="auth-wrap">
      <div className="card auth-card" style={{ textAlign: "center" }}>
        <h1>404 — Página no encontrada</h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          La página que buscas no existe o fue movida.
        </p>
        <Link to="/" className="btn btn-primary btn-block">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}