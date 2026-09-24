import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import "./Login.css";

const USUARIOS = [
  { usuario: "admin", password: "admin123", rol: "admin", nombre: "Administrador" },
  { usuario: "tecnico", password: "tec123", rol: "tecnico", nombre: "Técnico Principal" },
];

const DEMO = { usuario: "demo", password: "demo", rol: "admin", nombre: "Usuario Demo" };

const CUENTAS = {
  admin: { rol: "admin", user: "admin", pass: "admin123", label: "Administrador" },
  tecnico: { rol: "tecnico", user: "tecnico", pass: "tec123", label: "Técnico" },
};

export function LoginCard({ initialRole = "admin" }) {
  const [tab, setTab] = useState(initialRole);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const CUENTA = CUENTAS[tab];

  function cambiarTab(nuevo) {
    setTab(nuevo);
    setUsuario("");
    setPassword("");
    setError("");
  }

  function entrarComo(u) {
    localStorage.setItem(
      "optifix_session",
      JSON.stringify({ nombre: u.nombre, rol: u.rol })
    );
    navigate("/ordenes");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    setTimeout(() => {
      if (usuario.trim() === CUENTA.user && password === CUENTA.pass) {
        entrarComo(USUARIOS.find((u) => u.rol === CUENTA.rol));
      } else {
        setError(`Usuario o contraseña incorrectos para el acceso de ${CUENTA.label}.`);
      }
      setCargando(false);
    }, 600);
  }

  function handleDemo() {
    entrarComo(DEMO);
  }

  return (
    <div className="form_main login-panel">
      {/* Logo y título */}
      <div className="form-title-wrap">
        <div className="brand-center">
          <OptifixBrand size={48} textSize={26} taglineSize={9} />
        </div>
        <h1 className="heading">Login</h1>
        <p className="login-sub">Acceso de {CUENTA.label}</p>
      </div>

      {/* Dos accesos separados: Administrador / Técnico */}
      <div className="login-tabs">
        {["admin", "tecnico"].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => cambiarTab(id)}
            className={`login-tab-btn ${tab === id ? "active" : ""}`}
          >
            {CUENTAS[id].label}
          </button>
        ))}
      </div>

      {/* Formulario específico del rol activo */}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="inputContainer">
          <input
            key={tab + "-usuario"}
            name="usuario"
            type="text"
            placeholder={CUENTA.user}
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

        {error && <div className="login-error">{error}</div>}

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

      {/* Credenciales del rol activo */}
      <div className="login-credentials">
        <p className="cred-title">Credenciales de prueba · {CUENTA.label}</p>
        {tab === "admin" ? (
          <p>Admin: <code>admin / admin123</code></p>
        ) : (
          <p>Técnico: <code>tecnico / tec123</code></p>
        )}
        <p>Demo: <code>demo / demo</code></p>
      </div>

      <div className="register-link">
        <p>
          ¿Problemas de acceso? <a href="/">Volver al inicio</a>
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
      }}
    >
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