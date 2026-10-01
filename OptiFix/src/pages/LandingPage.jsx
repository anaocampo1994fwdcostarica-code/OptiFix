import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import Footer from "../components/Footer.jsx";
import AccessibilityPreferences from "../components/AccessibilityPreferences.jsx";
import workshopHeroImage from "../assets/optifix-workshop-hero.png";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./LandingPage.css";

const FEATURES = [
  {
    title: "Registro Completo de Equipos",
    desc: "Ingresá cualquier artículo electrónico con marca, modelo, serie, falla reportada y estado físico detallado.",
    icon: "▣"
  },
  {
    title: "Gestión de Clientes",
    desc: "Mantené un expediente completo de cada cliente con su historial de reparaciones, teléfono y correo electrónico.",
    icon: "♙"
  },
  {
    title: "Órdenes de Trabajo",
    desc: "Cada equipo genera una orden numerada con línea de tiempo visual y control de estados en tiempo real.",
    icon: "✓"
  },
  {
    title: "Contacto por WhatsApp",
    desc: "Abrí una conversación con el cliente desde su orden o expediente, con un mensaje preparado y sus datos de contacto disponibles.",
    icon: "◻"
  },
  {
    title: "Boletas y Reportes PDF",
    desc: "Consultá, imprimí o guardá la boleta digital de cada orden con sus datos, servicios y documentación adjunta.",
    icon: "▤"
  },
  {
    title: "Panel de Estadísticas",
    desc: "Visualizá el rendimiento del taller con gráficas de distribución de órdenes, equipos y facturación.",
    icon: "⌁"
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
    desc: "La orden avanza por estados: Recepción → En Taller → Presupuesto enviado, con una línea de tiempo clara para el equipo técnico."
  },
  {
    num: "03",
    title: "Entrega al Cliente",
    desc: "Una vez finalizado, se registra la entrega, se calcula el total y se emite el comprobante digital."
  }
];

const BENEFITS = [
  ["Operación profesional", "Estandarizá la recepción, diagnóstico, presupuesto y entrega para que cada orden tenga información clara y trazable."],
  ["Control en tiempo real", "Consultá estados, cargas de trabajo, clientes, equipos e importes desde un único panel de control."],
  ["Adaptado a tu taller", "Configurá servicios, productos, técnicos y permisos de acuerdo con la forma en que ya trabaja tu equipo."],
  ["Siempre disponible", "Trabajá desde computadora, tablet o celular sin instalaciones locales y con una experiencia consistente."]
];

const MODULES = [
  "Órdenes de trabajo digitales", "Historial por cliente y equipo", "Cotizaciones y adelantos", "Inventario de productos y servicios", "Agenda técnica", "Contacto directo por WhatsApp", "Boletas y reportes PDF", "Usuarios y permisos"
];

const DEMO_VIEWS = {
  seguimiento: { title: "Seguimiento de reparaci\u00F3n", items: ["Recepci\u00F3n registrada", "Diagn\u00F3stico t\u00E9cnico", "Equipo listo para entrega"] },
  boleta: { title: "Boleta digital", items: ["Servicios y repuestos detallados", "Total y adelanto registrados", "Lista para imprimir o guardar como PDF"] },
  metricas: { title: "Panel de m\u00E9tricas", items: ["\u00D3rdenes por estado", "Carga del banco de reparaci\u00F3n", "Facturaci\u00F3n estimada del mes"] }
};

const FAQS = [
  ["\u00BFNecesito instalar alg\u00FAn programa?", "No. OptiFix funciona desde el navegador, por lo que pod\u00E9s acceder desde una computadora, tablet o celular con conexi\u00F3n a internet."],
  ["\u00BFQu\u00E9 diferencia hay entre Administrador y T\u00E9cnico?", "El administrador configura el taller, usuarios y m\u00F3dulos. El t\u00E9cnico trabaja las \u00F3rdenes, actualiza diagn\u00F3sticos y consulta la operaci\u00F3n diaria."],
  ["\u00BFC\u00F3mo contacto al cliente por WhatsApp?", "Desde la orden o el expediente del cliente se prepara el mensaje con los datos y el estado actual para abrir la conversaci\u00F3n directamente."],
  ["\u00BFD\u00F3nde se guardan los datos?", "Durante la demostraci\u00F3n, la aplicaci\u00F3n usa JSON Server y respaldo local. La configuraci\u00F3n de producci\u00F3n depende de la infraestructura elegida por cada taller."]
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { ordenes, clientes } = useWorkshop();
  const [consulta, setConsulta] = useState({ orden: "", documento: "" });
  const [consultaError, setConsultaError] = useState("");
  const [demoView, setDemoView] = useState("seguimiento");
  const [reparacionesMes, setReparacionesMes] = useState(40);
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);

  function consultarSeguimiento(event) {
    event.preventDefault();
    const referencia = consulta.orden.trim().toLowerCase();
    const verificacion = consulta.documento.replace(/\D/g, "");
    const orden = ordenes.find((item) => String(item.id || "").toLowerCase() === referencia || String(item.numero || "").toLowerCase() === referencia);
    const cliente = orden && clientes.find((item) => item.id === orden.cliente_id);
    const telefono = String(cliente?.telefono || "").replace(/\D/g, "");
    const identificacion = String(cliente?.identificacion || "").replace(/\D/g, "");
    if (!orden || !orden.token_seguimiento || !verificacion || (!telefono.endsWith(verificacion) && !identificacion.endsWith(verificacion))) {
      setConsultaError(t("landing.hero.trackError"));
      return;
    }
    navigate(`/seguimiento/${orden.token_seguimiento}`);
  }

  const ahorroHoras = Math.round(reparacionesMes * 0.18);
  const features = t("landing.features.items", { returnObjects: true });
  const steps = t("landing.flow.steps", { returnObjects: true });
  const benefits = t("landing.benefits.items", { returnObjects: true });
  const modules = t("landing.modules.items", { returnObjects: true });
  const demoViews = {
    seguimiento: t("landing.demo.tracking", { returnObjects: true }),
    boleta: t("landing.demo.receipt", { returnObjects: true }),
    metricas: t("landing.demo.metrics", { returnObjects: true })
  };
  const demo = demoViews[demoView];
  const faqs = [
    [t("landing.faq.install"), t("landing.faq.installAnswer")],
    [t("landing.faq.roles"), t("landing.faq.rolesAnswer")],
    [t("landing.faq.whatsapp"), t("landing.faq.whatsappAnswer")],
    [t("landing.faq.data"), t("landing.faq.dataAnswer")]
  ];

  return (
    <div className="landing-root navan-landing">
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="landing-nav">
        <OptifixBrand size={54} textSize={28} showTagline={false} />
        <div className="landing-nav-links">
          <a href="#features">{t("landing.nav.features")}</a>
          <a href="#how">{t("landing.nav.how")}</a>
          <a href="#modulos">{t("landing.nav.modules")}</a>
          <a href="#contacto">{t("landing.nav.contact")}</a>
          <Link to="/login/admin" className="landing-nav-cta">
            {t("landing.nav.enter")}
          </Link>
          <AccessibilityPreferences className="landing-accessibility-controls" />
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <div className="landing-badge">{t("landing.hero.badge")}</div>
          <h1 className="landing-hero-title">
            {t("landing.hero.titleBefore")}<span className="landing-highlight">{t("landing.hero.highlight")}</span>{t("landing.hero.titleAfter")}
          </h1>
          <p className="landing-hero-sub">
            {t("landing.hero.description")}
          </p>
          <div className="landing-hero-actions">
            <Link to="/login/admin" className="btn-landing-primary">
              {t("landing.hero.admin")}
            </Link>
            <Link to="/login/tecnico" className="btn-landing-secondary">
              {t("landing.hero.technician")}
            </Link>
          </div>

          <form className="landing-track-form" onSubmit={consultarSeguimiento}>
            <div className="landing-track-heading">
              <strong>{t("landing.hero.trackTitle")}</strong>
              <span>{t("landing.hero.trackHint")}</span>
            </div>
            <div className="landing-track-fields">
              <input aria-label={t("landing.hero.order")} value={consulta.orden} onChange={(event) => setConsulta({ ...consulta, orden: event.target.value })} placeholder={t("landing.hero.order")} required />
              <input aria-label={t("landing.hero.document")} value={consulta.documento} onChange={(event) => setConsulta({ ...consulta, documento: event.target.value })} placeholder={t("landing.hero.document")} required />
              <button type="submit">{t("landing.hero.trackAction")}</button>
            </div>
            {consultaError && <p className="landing-track-error" role="alert">{consultaError}</p>}
          </form>

          {/* Mini stats */}
          <div className="landing-stats-row">
            {t("landing.stats", { returnObjects: true }).map((s) => (
              <div key={s.label} className="landing-stat-chip">
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero mockup */}
        <div className="landing-hero-mockup">
          <figure className="landing-workshop-photo">
            <img
              src={workshopHeroImage}
              alt="Mesa de trabajo de un taller electrónico con herramientas, cautín y el panel de OptiFix en un monitor"
            />
          </figure>
          <div className="mockup-window">
            <div className="mockup-topbar">
              <span className="mockup-dot red" /><span className="mockup-dot yellow" /><span className="mockup-dot green" />
              <span className="mockup-url">optifix.taller/ordenes</span>
              <span className="mockup-online">● Online</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {["Órdenes", "Clientes", "Equipos", "Stats"].map((m) => (
                  <div key={m} className="mockup-menu-item">{m}</div>
                ))}
              </div>
              <div className="mockup-content">
                <div className="mockup-title-bar">
                  <strong>Órdenes de Reparación Recientes</strong>
                  <span>Ver todas (48)</span>
                </div>
                {[['#ORD-1092', 'Smart TV Samsung 55" 4K', 'En Diagnóstico'], ['#ORD-1091', 'Notebook Lenovo Legion 5', 'En Reparación'], ['#ORD-1090', 'Amplificador Yamaha RX-V485', 'Listo para entrega']].map(([id, equipo, estado], i) => (
                  <div key={id} className="mockup-row mockup-order-row">
                    <b>{id}</b><div><strong>{equipo}</strong><small>Cliente y falla registrados</small></div>
                    <span className={`mockup-badge ${i === 0 ? "amber" : i === 1 ? "blue" : "green"}`}>{estado}</span>
                  </div>
                ))}
                <div className="mockup-footer"><span>◉ Panel activo y sincronizado</span><b>Banco #1 Activo</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-label">{t("landing.features.label")}</div>
          <h2 className="landing-section-title">{t("landing.features.title")}</h2>
          <p className="landing-section-sub">
            {t("landing.features.subtitle")}
          </p>
          <div className="features-grid">
            {features.map((f, index) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon" aria-hidden="true">{["▣", "♙", "✓", "◻", "▤", "⌁"][index]}</span>
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
          <div className="landing-section-label">{t("landing.flow.label")}</div>
          <h2 className="landing-section-title">{t("landing.flow.title")}</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={s.title} className="step-card">
                <div className="step-num">0{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-value-section">
        <div className="landing-section-inner">
          <div className="landing-section-label">{t("landing.benefits.label")}</div>
          <h2 className="landing-section-title">{t("landing.benefits.title")}</h2>
          <p className="landing-section-sub">{t("landing.benefits.description")}</p>
          <div className="landing-benefits-grid">
            {benefits.map((item, index) => <article className="landing-benefit" key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.desc}</p></article>)}
          </div>
        </div>
      </section>

      <section id="modulos" className="landing-section landing-modules-section">
        <div className="landing-section-inner landing-modules-layout">
          <div>
            <div className="landing-section-label">{t("landing.modules.label")}</div>
            <h2 className="landing-section-title">{t("landing.modules.title")}</h2>
            <p className="landing-section-sub">{t("landing.modules.description")}</p>
            <Link to="/login/admin" className="btn-landing-primary">{t("landing.modules.action")}</Link>
          </div>
          <ul className="landing-modules-list">{modules.map((module) => <li key={module}><span>✓</span>{module}</li>)}</ul>
        </div>
      </section>

      {/* ── CTA BOTTOM ────────────────────────────────────── */}
      <section className="landing-section landing-demo-section">
        <div className="landing-section-inner">
          <div className="landing-section-label">{t("landing.demo.label")}</div>
          <h2 className="landing-section-title">{t("landing.demo.title")}</h2>
          <div className="landing-demo-layout">
            <div className="landing-demo-tabs" role="tablist" aria-label="Demostraciones de OptiFix">
              {Object.entries(demoViews).map(([key, value]) => <button key={key} type="button" role="tab" aria-selected={demoView === key} className={demoView === key ? "active" : ""} onClick={() => setDemoView(key)}>{value.title}</button>)}
            </div>
            <article className="landing-demo-preview" aria-live="polite">
              <span className="landing-demo-eyebrow">{t("landing.demo.mode")}</span>
              <h3>{demo.title}</h3>
              <ol>{demo.items.map((item, index) => <li key={item}><b>0{index + 1}</b>{item}</li>)}</ol>
              <button type="button" className="btn-landing-primary" onClick={() => setDemoOpen(true)}>{t("landing.demo.action")}</button>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section landing-impact-section">
        <div className="landing-section-inner landing-impact-layout">
          <div><div className="landing-section-label">{t("landing.calculator.label")}</div><h2 className="landing-section-title">{t("landing.calculator.title")}</h2><p className="landing-section-sub">{t("landing.calculator.description")}</p></div>
          <div className="landing-calculator"><label htmlFor="reparaciones-mes">{t("landing.calculator.monthly")} <strong>{reparacionesMes}</strong></label><input id="reparaciones-mes" type="range" min="10" max="300" step="10" value={reparacionesMes} onChange={(event) => setReparacionesMes(Number(event.target.value))} /><div className="landing-impact-result"><strong>{ahorroHoras} h</strong><span>{t("landing.calculator.result")}</span></div><small>{t("landing.calculator.note")}</small></div>
        </div>
      </section>

      <section className="landing-section landing-trust-section"><div className="landing-section-inner"><div className="landing-trust-metrics"><article><strong>{ordenes.length}</strong><span>{t("landing.trust.orders")}</span></article><article><strong>8</strong><span>{t("landing.trust.modules")}</span></article><article><strong>Web</strong><span>{t("landing.trust.web")}</span></article></div><div className="landing-testimonials"><blockquote>“{t("landing.trust.quoteOne")}”<footer>{t("landing.trust.admin")}</footer></blockquote><blockquote>“{t("landing.trust.quoteTwo")}”<footer>{t("landing.trust.technical")}</footer></blockquote></div></div></section>

      <section className="landing-section landing-faq-section"><div className="landing-section-inner"><div className="landing-section-label">{t("landing.faq.label")}</div><h2 className="landing-section-title">{t("landing.faq.title")}</h2><div className="landing-faq-list">{faqs.map(([pregunta, respuesta], index) => <article key={pregunta} className={faqAbierta === index ? "open" : ""}><button type="button" aria-expanded={faqAbierta === index} onClick={() => setFaqAbierta(faqAbierta === index ? null : index)}><span>{pregunta}</span><b aria-hidden="true">{faqAbierta === index ? "−" : "+"}</b></button>{faqAbierta === index && <p>{respuesta}</p>}</article>)}</div></div></section>

      <section className="landing-cta-section">
        <div className="landing-section-inner" style={{ textAlign: "center" }}>
          <h2 className="landing-cta-title">{t("landing.cta.title")}</h2>
          <p className="landing-cta-sub">
            {t("landing.cta.description")}
          </p>
          <Link to="/login/admin" className="btn-landing-primary landing-cta-btn">
            {t("landing.cta.action")}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      {demoOpen && <div className="landing-demo-modal-backdrop" role="presentation" onMouseDown={() => setDemoOpen(false)}><section className="landing-demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="landing-modal-close" type="button" aria-label="Cerrar" onClick={() => setDemoOpen(false)}>×</button><span className="landing-section-label">Acceso de evaluación</span><h2 id="demo-modal-title">Probá OptiFix con datos de demostración.</h2><p>Ingresá al panel usando el modo demo. Encontrarás órdenes, clientes, equipos y métricas precargadas para recorrer la aplicación.</p><Link to="/login" className="btn-landing-primary">Ir al modo demo</Link></section></div>}

      <footer className="landing-footer">
        <Footer />
      </footer>
    </div>
  );
}
