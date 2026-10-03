import React from "react";
import LegalModal from "./LegalModal.jsx";
import Logo from "./Logo.jsx";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const [legalType, setLegalType] = React.useState(null);
  const { t } = useTranslation();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname.startsWith("/login/") || location.pathname === "/register";

  if (isAuthPage) return <footer className="app-footer app-footer-auth" aria-label={t("footer.footerLabel", "Pie de página")}>
    <div className="app-footer-main app-footer-auth-main">
      <div className="app-footer-brand"><div><Logo iconSize={34} className="app-footer-logo" /><p>{t("footer.tagline")}</p></div></div>
      <div className="app-footer-contact"><span className="app-footer-eyebrow">{t("footer.support")}</span><a href="mailto:soporte@optifix.com">soporte@optifix.com</a><a href="https://wa.me/50684229991" target="_blank" rel="noopener noreferrer">{t("footer.whatsapp")}</a></div>
    </div>
    <div className="app-footer-bottom app-footer-auth-bottom"><span>© 2026 OptiFix · Taller Servicios Electrónicos CR</span><div><button type="button" onClick={() => setLegalType("terms")}>{t("footer.terms")}</button><button type="button" onClick={() => setLegalType("privacy")}>{t("footer.privacy")}</button></div></div>
    {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
  </footer>;

  return <footer id="contacto" className="app-footer">
    <div className="app-footer-main">
      <div className="app-footer-brand">
        <div><Logo iconSize={34} className="app-footer-logo" /><p>{t("footer.tagline")}</p></div>
      </div>
      {isLanding && <nav className="app-footer-product" aria-label="Enlaces del producto">
        <span className="app-footer-eyebrow">PRODUCTO</span>
        <a href="#funcionalidades">Características</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#optibot">OptiBot</a>
      </nav>}
      <div className="app-footer-contact">
        <span className="app-footer-eyebrow">{t("footer.support")}</span>
        <a href="mailto:soporte@optifix.com">soporte@optifix.com</a>
        <a href="https://wa.me/50684229991" target="_blank" rel="noopener noreferrer">{t("footer.whatsapp")}</a>
      </div>
    </div>
    <div className="app-footer-bottom">
      <span>© 2026 OptiFix · Taller Servicios Electrónicos CR</span>
      <div><button type="button" onClick={() => setLegalType("terms")}>{t("footer.terms")}</button><button type="button" onClick={() => setLegalType("privacy")}>{t("footer.privacy")}</button></div>
    </div>
    {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
  </footer>;
}
