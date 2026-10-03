import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import AccessibilityPreferences from "../components/AccessibilityPreferences.jsx";
import { FaArrowRight, FaEye, FaEyeSlash, FaKey, FaLock, FaUser, FaUsers, FaWrench } from "react-icons/fa";
import "./Login.css";
import { useLanguage } from "../context/LanguageContext.jsx";


export function LoginCard() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [highlightedDemo, setHighlightedDemo] = useState(null);
  const highlightTimer = useRef(null);
  const navigate = useNavigate();
  const { loginConCredenciales } = useAuth();
  const { t, language } = useLanguage();
  const { usuarios } = useWorkshop();
  const demoAccounts = [
    { id: "admin", name: language === "en" ? "Administrator" : "Administrador", badge: "ADMIN", usuario: "admin", password: "admin123" },
    { id: "technician", name: language === "en" ? "Technician" : "Técnico", badge: language === "en" ? "TECHNICIAN" : "TÉCNICO", usuario: "tecnico", password: "tec123" }
  ];

  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  function useDemoAccount(account) {
    setUsuario(account.usuario);
    setPassword(account.password);
    setSelectedDemo(account.id);
    setHighlightedDemo(account.id);
    setError("");
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightedDemo(null), 600);
  }

  function handleUsernameChange(event) {
    const nextUsername = event.target.value;
    setUsuario(nextUsername);
    const account = demoAccounts.find((item) => item.id === selectedDemo);
    if (account && (nextUsername !== account.usuario || password !== account.password)) setSelectedDemo(null);
  }

  function handlePasswordChange(event) {
    const nextPassword = event.target.value;
    setPassword(nextPassword);
    const account = demoAccounts.find((item) => item.id === selectedDemo);
    if (account && (usuario !== account.usuario || nextPassword !== account.password)) setSelectedDemo(null);
  }

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
    <div className="form-title-wrap"><div className="brand-center"><Logo iconSize={76} className="justify-center" /></div><h1 className="heading">{language === "en" ? "Welcome to OptiFix" : "Bienvenido a OptiFix"}</h1><p className="login-sub">{language === "en" ? "Enter your credentials to access the management panel." : "Ingresá con tus credenciales para acceder al panel de gestión."}</p></div>
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-field"><label htmlFor="login-usuario">{t("login.username")}</label><div className="login-input-wrap"><FaUser aria-hidden="true" /><input id="login-usuario" name="usuario" type="text" placeholder={t("login.username")} value={usuario} onChange={handleUsernameChange} required autoComplete="username" className={`inputField ${highlightedDemo ? "demo-filled" : ""}`} /></div></div>
      <div className="login-field"><label htmlFor="login-password">{t("login.password")}</label><div className="login-input-wrap"><FaLock aria-hidden="true" /><input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder={t("login.password")} value={password} onChange={handlePasswordChange} required autoComplete="current-password" className={`inputField ${highlightedDemo ? "demo-filled" : ""}`} /><button type="button" className="password-visibility" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contenido del campo" : "Mostrar contenido del campo"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div></div>
      {error && <div className="login-error" role="alert">{error}</div>}
      <button type="submit" disabled={cargando} className="btn-submit"><span>{cargando ? t("common.loading") : t("login.submit")}</span><FaArrowRight aria-hidden="true" /></button>
      <button type="button" className="forgotLink" onClick={() => setForgotOpen(true)}>{t("login.forgot")}</button>
    </form>
    <aside className={`login-credentials ${credentialsOpen ? "open" : ""}`} aria-label={t("login.testCredentials")}>
      <button type="button" className="credentials-toggle" aria-expanded={credentialsOpen} aria-controls="demo-credentials-panel" onClick={() => setCredentialsOpen((open) => !open)}>
        <span><FaKey aria-hidden="true" />{language === "en" ? "Credentials for demonstration" : "Credenciales para demostración"}</span><span aria-hidden="true">⌄</span>
      </button>
      <div id="demo-credentials-panel" className="credentials-panel" hidden={!credentialsOpen}>
        {demoAccounts.map((account) => <article className={`demo-account demo-account-${account.id} ${selectedDemo === account.id ? "selected" : ""}`} key={account.id}>
          <span className={`demo-account-icon ${account.id}`} aria-hidden="true">{account.id === "admin" ? <FaUsers /> : <FaWrench />}</span>
          <div className="demo-account-content"><div className="demo-account-heading"><strong>{account.name}</strong><span className={`demo-role-badge ${account.id}`}>{account.badge}</span></div><p>{language === "en" ? "Username" : "Usuario"}: <b>{account.usuario}</b></p><p>{language === "en" ? "Password" : "Contraseña"}: <b>{account.password}</b></p></div>
          <button className="demo-use-account" type="button" onClick={() => useDemoAccount(account)}>{language === "en" ? "Use account" : "Usar cuenta"}</button>
        </article>)}
        {selectedDemo && <p className={`selected-demo selected-demo-${selectedDemo}`} role="status">✓ {language === "en" ? "Selected account" : "Cuenta seleccionada"}: <strong>{demoAccounts.find((account) => account.id === selectedDemo)?.name}</strong></p>}
      </div>
    </aside>
    {forgotOpen && <div className="login-recovery" role="status"><span>Para recuperar el acceso, contactá al administrador del taller.</span><button type="button" onClick={() => setForgotOpen(false)} aria-label="Cerrar aviso">×</button></div>}
  </div>;
}

export default function Login() {
  return <div className="login-page">
    <div className="login-back-wrap"><Link to="/" className="login-back-link">← Volver al Inicio</Link></div>
    <AccessibilityPreferences className="login-accessibility-controls" />
    <div className="login-page-main"><LoginCard /></div>
  </div>;
}
