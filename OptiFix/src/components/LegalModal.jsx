import React from "react";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

const legalContent = {
  terms: {
    title: "Términos y Condiciones",
    sections: [
      ["Uso del sistema", "OptiFix es una plataforma para la gestión operativa de talleres. El usuario debe utilizarla de forma lícita, responsable y únicamente para actividades relacionadas con la administración de servicios técnicos."],
      ["Privacidad y datos", "La información ingresada se utiliza para gestionar órdenes, clientes y equipos. Cada taller es responsable de contar con autorización para registrar y tratar los datos de sus clientes."],
      ["Responsabilidades", "El usuario debe proteger sus credenciales y verificar la información antes de generar una orden, comprobante o reporte. Esta versión es demostrativa y académica."],
    ],
  },
  privacy: {
    title: "Política de Privacidad",
    sections: [
      ["Información recopilada", "OptiFix puede procesar datos de contacto, equipos y órdenes de reparación necesarios para prestar las funcionalidades del sistema."],
      ["Finalidad", "Los datos se usan exclusivamente para la administración del taller, el seguimiento de reparaciones y la generación de comprobantes asociados."],
      ["Conservación y seguridad", "El acceso a módulos internos requiere autenticación. Esta demostración usa JSON Server y almacenamiento local como respaldo."],
    ],
  },
};

export default function LegalModal({ type, onClose }) {
  const content = legalContent[type];
  const dialogRef = useFocusTrap(true, onClose);

  return <div className="legal-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section ref={dialogRef} tabIndex={-1} className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="legal-modal-header"><h2 id="legal-modal-title">{content.title}</h2><button type="button" onClick={onClose} aria-label="Cerrar contenido legal">×</button></header>
      <div className="legal-modal-content">{content.sections.map(([heading, text]) => <section key={heading}><h3>{heading}</h3><p>{text}</p></section>)}</div>
      <button type="button" className="legal-modal-close" onClick={onClose}>Entendido</button>
    </section>
  </div>;
}
