import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import LegalModal from "./LegalModal.jsx";

const footerStyle = {
  background: "#06101a",
  borderTop: "1px solid #17324f",
  padding: "44px 24px 20px",
  color: "#94a3b8",
  fontFamily: "'Inter', 'Outfit', sans-serif",
};

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "28px",
};

const titleStyle = {
  color: "#f8fafc",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "12px",
};

export default function Footer() {
  const { t } = useLanguage();
  const [legalType, setLegalType] = React.useState(null);
  return (
    <footer style={footerStyle} id="contacto">
      <div style={containerStyle}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #0088cc, #00c6ff)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#ffffff",
                fontSize: "15px",
              }}
            >
              OF
            </span>
            <strong style={{ color: "#ffffff", fontSize: "18px" }}>OptiFix</strong>
          </div>
          <p style={{ marginTop: "12px", fontSize: "13px", lineHeight: 1.7, maxWidth: "280px" }}>
            {t("landing.footer.description")}
          </p>
        </div>

        <div>
          <h4 style={titleStyle}>{t("landing.footer.contact")}</h4>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span>📍 {t("landing.footer.center")}</span>
            <span>📞 Tel: (500) 555-1234</span>
            <span>💬 WhatsApp: (500) 555-1234</span>
            <span>✉️ soporte@optifix.com</span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1100px",
          margin: "26px auto 0",
          borderTop: "1px solid #17324f",
          paddingTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "12px",
        }}
      >
        <span>© 2026 OptiFix · Centro de Servicios Electrónicos · v2.0</span>
        <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          <button type="button" className="footer-legal-link" onClick={() => setLegalType("terms")}>Términos y Condiciones</button>
          <button type="button" id="legal-privacy" className="footer-legal-link" onClick={() => setLegalType("privacy")}>Política de Privacidad</button>
          <span>{t("landing.footer.footerLine")}</span>
        </span>
      </div>
      {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
    </footer>
  );
}
