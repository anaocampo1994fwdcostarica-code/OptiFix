import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccessibilityPreferences from "../components/AccessibilityPreferences.jsx";
import Logo from "../components/Logo.jsx";
import ProductTabs, { dashboardImage, optiBotImage } from "../components/landing/ProductTabs.jsx";
import "./LandingPage.css";

const FEATURES = [
  ["01", "Órdenes de trabajo", "Gestioná cada reparación desde el ingreso del equipo hasta su entrega."],
  ["02", "Clientes y equipos", "Mantené organizado el historial de clientes, equipos y reparaciones."],
  ["03", "Comunicación por WhatsApp", "Mantené al cliente informado sobre presupuestos, cambios de estado y finalización de su reparación."],
  ["04", "OptiBot con Inteligencia Artificial", "Consultá información operativa del taller utilizando lenguaje natural."],
  ["05", "Boletas y reportes PDF", "Generá, consultá e imprimí comprobantes digitales de cada orden."],
  ["06", "Estadísticas", "Visualizá órdenes, actividad y métricas importantes desde el panel administrativo."]
];

const FAQS = [
  ["¿Necesito instalar algún programa?", "No. OptiFix funciona desde el navegador en computadora, tablet o celular."],
  ["¿Puedo consultar el historial de un cliente o equipo?", "Sí. El sistema conserva la información asociada a clientes, equipos y órdenes de trabajo."],
  ["¿Cómo se mantiene informado al cliente?", "El taller puede comunicar por WhatsApp presupuestos, cambios relevantes y la finalización de una reparación."],
  ["¿Puedo trabajar con varios técnicos?", "Sí. OptiFix incluye usuarios, permisos y una agenda técnica para organizar la operación."],
  ["¿OptiFix genera comprobantes o boletas?", "Sí. Las órdenes incluyen comprobantes digitales y reportes listos para imprimir o guardar como PDF."],
  ["¿Qué puede consultar OptiBot?", "Información operativa disponible para usuarios autorizados, como órdenes, colaboradores, servicios y actividad del taller."]
];

const NAV_ITEMS = [
  ["funcionalidades", "Características"], ["como-funciona", "Cómo funciona"], ["optibot", "OptiBot"],
  ["producto", "Producto"], ["preguntas", "Preguntas frecuentes"]
];

export default function LandingPage() {
  const [reparacionesMes, setReparacionesMes] = useState(40);
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const ahorroHoras = Math.round(reparacionesMes * 0.18);
  const progresoImpacto = ((reparacionesMes - 10) / 290) * 100;

  useEffect(() => {
    const revealItems = document.querySelectorAll(".landing-product [data-reveal]");
    const sectionItems = NAV_ITEMS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const reduceMotion = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.12 });
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.35] });
    revealItems.forEach((item) => revealObserver.observe(item));
    sectionItems.forEach((item) => sectionObserver.observe(item));
    return () => { revealObserver.disconnect(); sectionObserver.disconnect(); };
  }, []);

  return <div className="landing-root navan-landing landing-product">
    <nav className="landing-nav" aria-label="Navegación principal">
      <a href="#inicio" className="landing-brand-link" aria-label="Ir al inicio de OptiFix"><Logo iconSize={42} className="landing-logo" /></a>
      <div className="landing-nav-links">
        {NAV_ITEMS.map(([id, label]) => <a key={id} href={`#${id}`} className={activeSection === id ? "active" : ""} aria-current={activeSection === id ? "location" : undefined}>{label}</a>)}
        <AccessibilityPreferences className="landing-accessibility-controls" />
        <Link to="/login" className="landing-login-link">Ingresar</Link>
      </div>
    </nav>

    <div className="landing-main">
      <section id="inicio" className="landing-hero landing-product-hero">
        <div className="landing-hero-content" data-reveal><span className="landing-hero-kicker">GESTIÓN OPERATIVA PARA TALLERES</span><h1 className="landing-hero-title">Todo tu taller, <span className="landing-highlight">organizado</span> en un solo lugar.</h1><p className="landing-hero-sub">Gestioná clientes, equipos, órdenes de trabajo y reparaciones desde una plataforma diseñada para simplificar la operación diaria de tu taller.</p><div className="landing-hero-actions"><a className="btn-landing-primary" href="#como-funciona">Ver cómo funciona</a></div><div className="landing-proof-row" aria-label="Beneficios principales"><span>✓ Órdenes en tiempo real</span><span>✓ Agenda técnica</span><span>✓ Métricas del taller</span></div></div>
        <figure className="landing-real-screen landing-hero-screen" data-reveal><div className="landing-screen-toolbar" aria-hidden="true"><i /><i /><i /><span>OptiFix · Producto real</span></div><img src={dashboardImage} alt="Dashboard administrativo real de OptiFix con métricas, órdenes activas y agenda técnica." /></figure>
      </section>

      <section className="landing-section landing-problem-section" data-reveal><div className="landing-section-inner"><div className="landing-section-label">OPERACIÓN CENTRALIZADA</div><h2 className="landing-section-title">Menos tiempo buscando información. Más tiempo reparando.</h2><p className="landing-section-sub">OptiFix centraliza la operación del taller para que clientes, equipos, órdenes y reparaciones estén siempre organizados.</p><div className="landing-problem-grid">{[['01','Información dispersa','Clientes, equipos y órdenes repartidos entre cuadernos, mensajes y archivos.'],['02','Seguimiento complicado','Es difícil conocer rápidamente qué está pasando con cada reparación.'],['03','Consultas constantes','La comunicación consume tiempo cuando la información no está centralizada.']].map((item) => <article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}<aside><b>OptiFix centraliza todo.</b><p>Una vista operativa para tomar decisiones con información organizada.</p></aside></div></div></section>

      <section id="como-funciona" className="landing-section landing-flow-section" data-reveal><div className="landing-section-inner"><div className="landing-section-label">FLUJO OPERATIVO</div><h2 className="landing-section-title">¿Cómo funciona OptiFix?</h2><div className="landing-flow-grid">{[['01','Ingreso del equipo','Registrá el cliente, el equipo, accesorios y la falla reportada.'],['02','Reparación y seguimiento','El técnico gestiona el trabajo y actualiza el estado de la reparación.'],['03','Entrega al cliente','Finalizá la orden, generá el comprobante y conservá el historial.']].map((step, index) => <React.Fragment key={step[0]}><article><span>{step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p></article>{index < 2 && <i aria-hidden="true">→</i>}</React.Fragment>)}</div></div></section>

      <section id="funcionalidades" className="landing-section" data-reveal><div className="landing-section-inner"><div className="landing-section-label">FUNCIONALIDADES PRINCIPALES</div><h2 className="landing-section-title">Todo lo que necesitás para operar mejor.</h2><p className="landing-section-sub">Herramientas conectadas para administradores, técnicos y personal operativo del taller.</p><div className="features-grid">{FEATURES.map(([number, title, description]) => <article className="feature-card" key={number}><span className="feature-icon">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

      <section id="optibot" className="landing-section landing-optibot-section" data-reveal><div className="landing-section-inner landing-optibot-layout"><div className="landing-optibot-copy"><div className="landing-section-label">INTELIGENCIA ARTIFICIAL</div><h2 className="landing-section-title">Preguntale a tu taller.</h2><p className="landing-section-sub">OptiBot permite a administradores y técnicos consultar información operativa de OptiFix utilizando lenguaje natural.</p><ul className="landing-question-list"><li>¿Cuál es el estado de la orden 8822?</li><li>¿Cuántas órdenes están en recepción?</li><li>¿Cuál es el correo de un colaborador?</li><li>¿Qué servicios están registrados?</li></ul><small className="landing-authorized">Disponible para usuarios autorizados</small><div className="landing-ai-flow" aria-label="Arquitectura de OptiBot"><span>React</span><i aria-hidden="true">→</i><span>n8n</span><i aria-hidden="true">→</i><span>DeepSeek</span><i aria-hidden="true">→</i><span>Datos de OptiFix</span></div></div><figure className="landing-real-screen landing-optibot-screen"><div className="landing-screen-toolbar" aria-hidden="true"><i /><i /><i /><span>OptiBot · Consulta real</span></div><img src={optiBotImage} alt="Captura real de OptiBot mostrando el estado de la orden 8822." /></figure></div></section>

      <section className="landing-section landing-tracking-section" data-reveal><div className="landing-section-inner landing-two-column"><div className="landing-tracking-flow"><span>Orden creada</span><i>↓</i><span>Técnico gestiona la reparación</span><i>↓</i><span>Cambio de estado</span><i>↓</i><span>Comunicación por WhatsApp</span><i>↓</i><span>Cliente recibe la actualización</span></div><div><div className="landing-section-label">COMUNICACIÓN CON EL CLIENTE</div><h2 className="landing-section-title">Mantené informado a tu cliente durante la reparación.</h2><p className="landing-section-sub">Desde la gestión de la orden, el taller puede mantener al cliente informado mediante WhatsApp sobre presupuestos, cambios de estado y finalización de la reparación.</p></div></div></section>

      <section id="producto" className="landing-section landing-product-section" data-reveal><div className="landing-section-inner"><div className="landing-section-label">PRODUCTO REAL</div><h2 className="landing-section-title">Conocé OptiFix por dentro.</h2><p className="landing-section-sub">Explorá algunas de las herramientas que utiliza el equipo del taller durante su operación diaria.</p><ProductTabs /></div></section>

      <section className="landing-section landing-impact-section" data-reveal><div className="landing-section-inner landing-impact-layout"><div><div className="landing-section-label">CALCULADORA DE IMPACTO</div><h2 className="landing-section-title">Mirá cuánto tiempo podés recuperar.</h2><p className="landing-section-sub">Ajustá el volumen mensual de reparaciones para obtener una estimación operativa orientativa.</p></div><div className="landing-calculator"><label htmlFor="reparaciones-mes">Reparaciones por mes <strong>{reparacionesMes}</strong></label><input id="reparaciones-mes" type="range" min="10" max="300" step="10" value={reparacionesMes} onChange={(event) => setReparacionesMes(Number(event.target.value))} style={{ "--impact-progress": `${progresoImpacto}%` }} /><div className="landing-impact-result"><strong key={ahorroHoras} className="landing-impact-hours">{ahorroHoras} h</strong><span>estimadas al mes en organización, seguimiento y generación de comprobantes.</span></div><small>Estimación orientativa de demostración. El resultado depende de la operación de cada taller.</small></div></div></section>

      <section className="landing-section landing-pricing-section" data-reveal><div className="landing-section-inner landing-adapted-layout"><div><div className="landing-section-label">ADAPTADO A TU TALLER</div><h2 className="landing-section-title">Una solución que se adapta a tu operación.</h2><p className="landing-section-sub">OptiFix reúne las herramientas necesarias para organizar la gestión diaria del taller.</p></div><div className="landing-compact-benefits"><article><span>TU EQUIPO</span><p>Roles y permisos para organizar el trabajo de administradores y técnicos.</p></article><article><span>TU OPERACIÓN</span><p>Clientes, equipos, órdenes y servicios centralizados.</p></article><article><span>TU GESTIÓN</span><p>Métricas e información operativa para apoyar la administración del taller.</p></article></div></div></section>

      <section id="preguntas" className="landing-section landing-faq-section" data-reveal><div className="landing-section-inner"><div className="landing-section-label">PREGUNTAS FRECUENTES</div><h2 className="landing-section-title">Respuestas rápidas antes de comenzar.</h2><div className="landing-faq-list">{FAQS.map((item, index) => { const open = faqAbierta === index; const panelId = `faq-panel-${index}`; return <article key={item[0]} className={open ? "open" : ""}><button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setFaqAbierta(open ? null : index)}><span>{item[0]}</span><b aria-hidden="true">{open ? "−" : "+"}</b></button><div id={panelId} className="landing-faq-answer" hidden={!open}><p>{item[1]}</p></div></article>; })}</div></div></section>

      <section className="landing-cta-section" data-reveal><div className="landing-section-inner landing-final-cta"><span>OPTIFIX PARA TU TALLER</span><h2 className="landing-cta-title">¿Querés implementar OptiFix en tu taller?</h2><p>Descubrí cómo OptiFix puede ayudarte a centralizar la operación, organizar las reparaciones y mejorar la comunicación con tus clientes.</p><div><a href="https://wa.me/50684229991?text=Hola,%20me%20gustaría%20obtener%20más%20información%20sobre%20OptiFix%20para%20mi%20taller." target="_blank" rel="noopener noreferrer" className="btn-landing-primary landing-cta-btn">Quiero conocer OptiFix</a></div></div></section>
    </div>
  </div>;
}
