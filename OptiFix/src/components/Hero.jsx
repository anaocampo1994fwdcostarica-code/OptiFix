import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icono from "./icons.jsx";

// Hero con el buscador central (GET /tramites/search a través de /buscar).
export default function Hero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const termino = q.trim();
    navigate(termino ? `/buscar?q=${encodeURIComponent(termino)}` : "/buscar");
  }

  return (
    <section className="hero">
      <div className="container">
        <span className="hero__eyebrow">
          <Icono nombre="shield-lock" size={16} /> Ventanilla Única Digital
        </span>
        <h1>Trámites y servicios en un solo lugar, al alcance del ciudadano.</h1>
        <p>
          Gestiona registros sanitarios, licencias, notificaciones obligatorias y
          certificados digitales de forma 100 % en línea, con seguimiento en
          tiempo real y validez criptográfica garantizada.
        </p>

        <form className="hero-search" role="search" onSubmit={handleSubmit}>
          <label htmlFor="buscador-tramites" className="sr-only">
            Buscar trámites
          </label>
          <input
            id="buscador-tramites"
            type="search"
            placeholder="¿Qué trámite necesitas? Ej. registro sanitario, licencia de farmacia..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Icono nombre="search" size={18} /> Buscar
          </button>
        </form>

        <div className="hero__quick">
          <a href="/#categorias">Explorar por categoría</a>
          <Link to="/consulta-radicado">Consultar radicado</Link>
          <Link to="/verificacion">Verificar documento</Link>
        </div>
      </div>
    </section>
  );
}