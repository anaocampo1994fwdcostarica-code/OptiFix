import React from "react";
import { Link } from "react-router-dom";

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

const linkStyle = {
  color: "#94a3b8",
  textDecoration: "none",
  fontSize: "13px",
  lineHeight: "2.1rem",
  display: "block",
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
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
            Sistema web para el control total de tu taller de reparación de equipos
            electrónicos: órdenes de trabajo, clientes, inventario y seguimiento en
            tiempo real.
          </p>
        </div>

        <div>
          <h4 style={titleStyle}>Plataforma</h4>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link to="/ordenes" style={linkStyle}>Órdenes de trabajo</Link>
            <Link to="/productos" style={linkStyle}>Catálogo de repuestos</Link>
            <Link to="/servicios" style={linkStyle}>Catálogo de servicios</Link>
            <Link to="/estadisticas" style={linkStyle}>Estadísticas del taller</Link>
          </div>
        </div>

        <div>
          <h4 style={titleStyle}>Acceso</h4>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link to="/login/admin" style={linkStyle}>Iniciar sesión (Administrador)</Link>
            <Link to="/login/tecnico" style={linkStyle}>Iniciar sesión (Técnico)</Link>
            <Link to="/login" style={linkStyle}>Entrar en modo demo</Link>
            <Link to="/" style={linkStyle}>Volver al inicio</Link>
          </div>
        </div>

        <div>
          <h4 style={titleStyle}>Contacto</h4>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span>📍 Centro de Servicios Electrónicos</span>
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
        <span>Boleta digital · Seguimiento por WhatsApp · Enlace de estado en tiempo real</span>
      </div>
    </footer>
  );
}