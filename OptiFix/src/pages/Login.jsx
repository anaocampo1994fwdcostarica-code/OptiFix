import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import OptifixLogo from "../components/OptifixLogo.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import AccessibilityPreferences from "../components/AccessibilityPreferences.jsx";
import "./Login.css";
import { useLanguage } from "../context/LanguageContext.jsx";


export function LoginCard() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const { loginConCredenciales } = useAuth();
  const { t } = useLanguage();
  const { usuarios } = useWorkshop();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setCargando(true);
    try {
      const sesion = await loginConCredenciales({ usuario, password, fallbackUsers: usuarios });
      if (sesion) navigate("/ordenes");
      else setError(t("login.invalid"));
    } finally {
      setCargando(false);
    }
  }

  return <div className="form_main login-panel">
    <div className="form-title-wrap"><div className="brand-center"><OptifixLogo size={76} /></div><p className="login-brand-name">Opti<span>Fix</span></p><h1 className="heading">{t("login.title")}</h1><p className="login-sub">{t("login.subtitle")}</p></div>
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-field"><label htmlFor="login-usuario">{t("login.username")}</label><input id="login-usuario" name="usuario" type="text" placeholder={t("login.username")} value={usuario} onChange={(event) => setUsuario(event.target.value)} required autoComplete="username" className="inputField" /></div>
      <div className="login-field"><label htmlFor="login-password">{t("login.password")}</label><input id="login-password" name="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="inputField" /></div>
      {error && <div className="login-error" role="alert">{error}</div>}
      <button type="submit" disabled={cargando} className="btn-submit">{cargando ? t("common.loading") : t("login.submit")}</button>
      <button type="button" className="forgotLink" onClick={() => setForgotOpen(true)}>{t("login.forgot")}</button>
    </form>
    {forgotOpen && <div className="login-recovery" role="status"><span>Para recuperar el acceso, contactá al administrador del taller.</span><button type="button" onClick={() => setForgotOpen(false)} aria-label="Cerrar aviso">×</button></div>}
  </div>;
}

export default function Login() {
  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #0a2547 0%, #0d4d8a 55%, #38bdf8 120%)", fontFamily: "'Inter', 'Outfit', sans-serif", position: "relative" }}>
    <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}><Link to="/" className="inline-flex items-center gap-2 text-white hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-sm font-semibold text-sm shadow-sm border border-white/10">← Volver al Inicio</Link></div>
    <AccessibilityPreferences className="login-accessibility-controls" />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}><LoginCard /></div>
  </div>;
}
