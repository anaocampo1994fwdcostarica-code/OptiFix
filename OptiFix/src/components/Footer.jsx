import React from "react";
import LegalModal from "./LegalModal.jsx";
import Logo from "./Logo.jsx";

export default function Footer() {
  const [legalType, setLegalType] = React.useState(null);

  return <footer id="contacto" className="app-footer">
    <div className="app-footer-main">
      <div className="app-footer-brand">
        <div><Logo iconSize={34} className="app-footer-logo" /><p>Gestión clara para servicios técnicos.</p></div>
      </div>
      <div className="app-footer-contact">
        <span className="app-footer-eyebrow">SOPORTE</span>
        <a href="mailto:soporte@optifix.com">soporte@optifix.com</a>
        <a href="https://wa.me/50684229991" target="_blank" rel="noopener noreferrer">WhatsApp de soporte</a>
      </div>
    </div>
    <div className="app-footer-bottom">
      <span>© 2026 OptiFix · Taller Servicios Electrónicos CR</span>
      <div><button type="button" onClick={() => setLegalType("terms")}>Términos</button><button type="button" onClick={() => setLegalType("privacy")}>Privacidad</button></div>
    </div>
    {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
  </footer>;
}
