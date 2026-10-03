import React, { useRef, useState } from "react";
import dashboardImage from "../../assets/landing/dashboard-optifix.jpg";
import ordersImage from "../../assets/landing/ordenes-optifix.jpg";
import orderDetailImage from "../../assets/landing/gestion-orden-optifix.jpg";
import optiBotImage from "../../assets/landing/optibot-optifix.jpg";

const PRODUCT_VIEWS = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Centro de Control y Operaciones",
    description: "Visualizá órdenes activas, facturación estimada, agenda técnica, cotizaciones y prioridades desde un mismo panel.",
    image: dashboardImage,
    alt: "Dashboard administrativo real de OptiFix con métricas, órdenes activas y agenda técnica."
  },
  {
    id: "orders",
    label: "Órdenes",
    title: "Todas las órdenes bajo control",
    description: "Consultá las reparaciones registradas, sus estados y accedé rápidamente al detalle de cada orden.",
    image: ordersImage,
    alt: "Vista real de la lista de órdenes de trabajo de OptiFix."
  },
  {
    id: "order-management",
    label: "Gestión de orden",
    title: "Gestioná cada reparación desde un solo lugar",
    description: "Consultá cliente, equipo, falla reportada, presupuesto, estado y demás información necesaria para gestionar la reparación.",
    image: orderDetailImage,
    alt: "Vista real del detalle y gestión de una orden de trabajo en OptiFix."
  },
  {
    id: "optibot",
    label: "OptiBot",
    title: "Consultá tu taller con Inteligencia Artificial",
    description: "OptiBot permite a usuarios autorizados realizar consultas operativas mediante la integración de React, n8n y DeepSeek.",
    image: optiBotImage,
    alt: "Captura real de OptiBot respondiendo una consulta sobre una orden de trabajo."
  }
];

export { dashboardImage, optiBotImage };

export default function ProductTabs() {
  const [activeId, setActiveId] = useState(PRODUCT_VIEWS[0].id);
  const tabRefs = useRef([]);
  const activeView = PRODUCT_VIEWS.find((view) => view.id === activeId) || PRODUCT_VIEWS[0];

  const selectByIndex = (index) => {
    const normalizedIndex = (index + PRODUCT_VIEWS.length) % PRODUCT_VIEWS.length;
    setActiveId(PRODUCT_VIEWS[normalizedIndex].id);
    tabRefs.current[normalizedIndex]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectByIndex(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectByIndex(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectByIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectByIndex(PRODUCT_VIEWS.length - 1);
    }
  };

  return (
    <div className="landing-product-showcase">
      <div className="landing-product-tabs" role="tablist" aria-label="Vistas reales de OptiFix">
        {PRODUCT_VIEWS.map((view, index) => {
          const selected = view.id === activeId;
          return (
            <button
              key={view.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`product-tab-${view.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`product-panel-${view.id}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? "active" : ""}
              onClick={() => setActiveId(view.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      <div
        key={activeView.id}
        id={`product-panel-${activeView.id}`}
        role="tabpanel"
        aria-labelledby={`product-tab-${activeView.id}`}
        className="landing-product-panel"
        tabIndex={0}
      >
        <div className="landing-product-copy">
          <span>INTERFAZ REAL DE OPTIFIX</span>
          <h3>{activeView.title}</h3>
          <p>{activeView.description}</p>
        </div>
        <figure className="landing-real-screen landing-real-screen-large">
          <div className="landing-screen-toolbar" aria-hidden="true"><i /><i /><i /><span>OptiFix</span></div>
          <img src={activeView.image} alt={activeView.alt} />
        </figure>
      </div>
    </div>
  );
}
