import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import AccessibilityPreferences from "../components/AccessibilityPreferences.jsx";
import "./Login.css";

const ETIQUETAS_ROL = { admin: "Administrador", tecnico: "Técnico" };

export function LoginCard({ initialRole = "admin" }) {
  const [tab, setTab] = useState(initialRole);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { usuarios } = useWorkshop();

  function cambiarTab(nuevo) {
    setTab(nuevo);
    setUsuario("");
    setPassword("");
    setError("");
  }

  function entrarComo(u) {
    login(u);
    navigate("/ordenes");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    setTimeout(() => {
      const encontrado = usuarios.find(
        (u) =>
          u.usuario.toLowerCase() === usuario.trim().toLowerCase() &&
          u.password === password &&
          u.rol === tab
      );
      if (encontrado) {
        entrarComo(encontrado);
      } else {
        setError(`Usuario o contraseña incorrectos para el acceso de ${ETIQUETAS_ROL[tab]}.`);
      }
      setCargando(false);
    }, 500);
  }

  function handleDemo() {
    const demo = usuarios.find((u) => u.usuario === "demo") || usuarios[0];
    if (demo) entrarComo(demo);
  }

  return (
    <div className="form_main login-panel">
      {/* Logo y título */}
      <div className="form-title-wrap">
        <div className="brand-center">
          <OptifixBrand size={48} textSize={26} taglineSize={9} />
        </div>
        <h1 className="heading">Acceso</h1>
        <p className="login-sub">Ingrese sus credenciales para continuar</p>
      </div>



      {/* Formulario específico del rol activo */}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="inputContainer">
          <input
            key={tab + "-usuario"}
            name="usuario"
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            autoComplete="username"
            className="inputField"
          />
        </div>

        <div className="inputContainer">
          <input
            key={tab + "-password"}
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="inputField"
          />
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}

        <button type="submit" disabled={cargando} className="btn-submit">
          {cargando ? "Verificando..." : "Ingresar"}
        </button>

        <a className="forgotLink" href="/login">
          ¿Olvidaste tu contraseña?
        </a>
      </form>

      <div className="login-divider">
        <div className="line" />
        <span>o</span>
        <div className="line" />
      </div>

      <button type="button" onClick={handleDemo} className="login-demo-btn">
        Entrar en modo demo
      </button>

      {/* Credenciales de prueba completas */}
      <div className="login-credentials">
        <p className="cred-title">Credenciales de prueba</p>
        <p>Admin: <code>admin / admin123</code></p>
        <p>Técnico: <code>tecnico / tec123</code></p>
        <p>Demo: <code>demo / demo</code></p>
      </div>

      <div className="register-link">
        <p>
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link> · <a href="/">Volver al inicio</a>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const { role } = useParams();
  const initialRole = role === "tecnico" ? "tecnico" : "admin";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0a2547 0%, #0d4d8a 55%, #38bdf8 120%)",
        fontFamily: "'Inter', 'Outfit', sans-serif",
        position: "relative"
      }}
    >
      <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-sm font-semibold text-sm shadow-sm border border-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver al Inicio
        </Link>
      </div>
      <AccessibilityPreferences className="login-accessibility-controls" />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <LoginCard initialRole={initialRole} />
      </div>
      <Footer />
    </div>
  );
}
