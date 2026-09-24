import React from "react";
import { Link } from "react-router-dom";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import Footer from "../components/Footer.jsx";
import "./LandingPage.css";

const FEATURES = [
  {
    title: "Registro Completo de Equipos",
    desc: "Ingresá cualquier artículo electrónico con marca, modelo, serie, falla reportada y estado físico detallado."
  },
  {
    title: "Gestión de Clientes",
    desc: "Mantené un expediente completo de cada cliente con su historial de reparaciones, teléfono y correo electrónico."
  },
  {
    title: "Órdenes de Trabajo",
    desc: "Cada equipo genera una orden numerada con línea de tiempo visual y control de estados en tiempo real."
  },
  {
    title: "Notificación por WhatsApp",
    desc: "Enviá la boleta de ingreso y actualizaciones de estado directamente al cliente por WhatsApp con un solo clic."
  },
  {
    title: "Enlace de Seguimiento",
    desc: "Cada orden tiene un enlace único que el cliente puede consultar para ver el estado actualizado de su reparación."
  },
  {
    title: "Panel de Estadísticas",
    desc: "Visualizá el rendimiento del taller con gráficas de distribución de órdenes, equipos y facturación."
  }
];

const STEPS = [
  {
    num: "01",
    title: "Ingreso del Equipo",
    desc: "El técnico registra el equipo, los datos del cliente, la falla reportada y los accesorios recibidos."
  },
  {
    num: "02",
    title: "Reparación y Seguimiento",
    desc: "La orden avanza por estados: Recepción → En Taller → Presupuesto enviado. El cliente recibe notificaciones."
  },
  {
    num: "03",
    title: "Entrega al Cliente",
    desc: "Una vez finalizado, se registra la entrega, se calcula el total y se emite el comprobante digital."
  }
];
export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="landing-nav">
        <OptifixBrand size={34} textSize={20} />
        <div className="landing-nav-links">
          <a href="#features">Características</a>
          <a href="#how">Cómo funciona</a>
          <Link to="/login/admin" className="landing-nav-cta">
            Ingresar al Panel
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <div className="landing-badge">Sistema de Gestión de Taller Electrónico</div>
          <h1 className="landing-hero-title">
            El <span className="landing-highlight">control total</span> de tu taller
            <br />en una sola plataforma.
          </h1>
          <p className="landing-hero-sub">
            OptiFix te permite registrar equipos, gestionar clientes, controlar estados
            de reparación y comunicarte con tus clientes — todo desde un panel moderno
            y fácil de usar.
          </p>
          <div className="landing-hero-actions">
            <Link to="/login/admin" className="btn-landing-primary">
              Acceso de Administrador
            </Link>
            <Link to="/login/tecnico" className="btn-landing-secondary">
              Acceso de Técnico
            </Link>
            <a href="#how" className="btn-landing-secondary">Ver cómo funciona</a>
          </div>

          {/* Mini stats */}
          <div className="landing-stats-row">
            {[
              { val: "100%", label: "Web — sin instalación" },
              { val: "WhatsApp", label: "Notificaciones directas" },
              { val: "Enlace", label: "Seguimiento del cliente" }
            ].map((s) => (
              <div key={s.label} className="landing-stat-chip">
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero mockup */}
        <div className="landing-hero-mockup">
          <div className="mockup-window">
            <div className="mockup-topbar">
              <span className="mockup-url">optifix.taller/ordenes</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {["Órdenes", "Clientes", "Equipos", "Stats"].map((m) => (
                  <div key={m} className="mockup-menu-item">{m}</div>
                ))}
              </div>
              <div className="mockup-content">
                <div className="mockup-title-bar">
                  <div className="mockup-heading-block" />
                  <div className="mockup-btn-block" />
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="mockup-row">
                    <div className="mockup-cell wide" />
                    <div className={`mockup-badge ${i === 0 ? "green" : i === 2 ? "blue" : "amber"}`} />
                    <div className="mockup-cell" />
                    <div className="mockup-cell" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-label">Funcionalidades principales</div>
          <h2 className="landing-section-title">Todo lo que necesita tu taller</h2>
          <p className="landing-section-sub">
            Diseñado específicamente para talleres de electrónica y reparaciones de aparatos del hogar.
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <div className="landing-section-label">Flujo operativo</div>
          <h2 className="landing-section-title">¿Cómo funciona OptiFix?</h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ────────────────────────────────────── */}
      <section className="landing-cta-section">
        <div className="landing-section-inner" style={{ textAlign: "center" }}>
          <h2 className="landing-cta-title">¿Listo para optimizar tu taller?</h2>
          <p className="landing-cta-sub">
            Entrá al panel de administración y comenzá a registrar órdenes ahora mismo.
          </p>
          <Link to="/login/admin" className="btn-landing-primary landing-cta-btn">
            Abrir OptiFix — Panel de Administración
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="landing-footer">
        <Footer />
      </footer>
    </div>
  );
}
