import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import AccessibilityPreferences from "../components/AccessibilityPreferences.jsx";
import "./Login.css";
import { useLanguage } from "../context/LanguageContext.jsx";

const ETIQUETAS_ROL = { admin: "Administrador", tecnico: "Técnico" };

export function LoginCard({ initialRole = "admin" }) {
  const [tab, setTab] = useState(initialRole);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login, loginConCredenciales } = useAuth();
  const { t } = useLanguage();
  const { usuarios } = useWorkshop();

  function entrarComo(user) { login(user); navigate("/ordenes"); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setCargando(true);
    try {
      const sesion = await loginConCredenciales({ usuario, password, rol: tab, fallbackUsers: usuarios });
      if (sesion) navigate("/ordenes");
      else setError(t("login.invalid", { role: t(tab === "admin" ? "login.admin" : "login.technician") }));
    } finally {
      setCargando(false);
    }
  }

  function handleDemo() {
    const demo = usuarios.find((user) => user.usuario === "demo") || usuarios[0];
    if (demo) entrarComo(demo);
  }

  return <div className="form_main login-panel">
    <div className="form-title-wrap"><div className="brand-center"><OptifixBrand size={48} textSize={26} taglineSize={9} /></div><h1 className="heading">{t("login.title")}</h1><p className="login-sub">{t("login.subtitle")}</p></div>
    <form onSubmit={handleSubmit} className="login-form">
      <div className="inputContainer"><input name="usuario" type="text" placeholder={t("login.username")} value={usuario} onChange={(event) => setUsuario(event.target.value)} required autoComplete="username" className="inputField" /></div>
      <div className="inputContainer"><input name="password" type="password" placeholder={t("login.password")} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="inputField" /></div>
      {error && <div className="login-error" role="alert">{error}</div>}
      <button type="submit" disabled={cargando} className="btn-submit">{cargando ? t("common.loading") : t("login.submit")}</button>
      <a className="forgotLink" href="/login">{t("login.forgot")}</a>
    </form>
    <div className="login-divider"><div className="line" /><span>o</span><div className="line" /></div>
    <button type="button" onClick={handleDemo} className="login-demo-btn">Entrar en modo demo</button>
    <div className="login-credentials"><p className="cred-title">Credenciales de prueba</p><p>Admin: <code>admin / admin123</code></p><p>Técnico: <code>tecnico / tec123</code></p></div>
    <div className="register-link"><p>¿No tienes cuenta? <Link to="/register">Crear cuenta</Link> · <a href="/">Volver al inicio</a></p></div>
  </div>;
}

export default function Login() {
  const { role } = useParams();
  const initialRole = role === "tecnico" ? "tecnico" : "admin";
  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #0a2547 0%, #0d4d8a 55%, #38bdf8 120%)", fontFamily: "'Inter', 'Outfit', sans-serif", position: "relative" }}>
    <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}><Link to="/" className="inline-flex items-center gap-2 text-white hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-sm font-semibold text-sm shadow-sm border border-white/10">← Volver al Inicio</Link></div>
    <AccessibilityPreferences className="login-accessibility-controls" />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}><LoginCard initialRole={initialRole} /></div>
    <Footer />
  </div>;
}
