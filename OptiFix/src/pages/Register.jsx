import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { sendUserWebhook } from "../services/webhookService.js";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();
  const { addUsuario } = useWorkshop();

  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [rol, setRol] = useState("tecnico");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !usuario.trim() || !password) {
      setError("Completa nombre, usuario y contraseña.");
      return;
    }
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const resultado = addUsuario({ nombre, usuario, password, rol });
    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    await sendUserWebhook(resultado.usuario, "NEW_USER_CREATED");
    setExito(true);
    setTimeout(() => navigate(`/login/${rol}`), 1200);
  }

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
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div className="form_main login-panel">
          <div className="form-title-wrap">
            <div className="brand-center">
              <OptifixBrand size={48} textSize={26} taglineSize={9} />
            </div>
            <h1 className="heading">Crear cuenta</h1>
            <p className="login-sub">Registro de personal del taller</p>
          </div>

          {exito ? (
            <div className="login-credentials" role="status" style={{ textAlign: "center" }}>
              <p className="cred-title">¡Cuenta creada!</p>
              <p>Redirigiendo al login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="inputContainer">
                <input
                  type="text" placeholder="Nombre completo" value={nombre}
                  onChange={(e) => setNombre(e.target.value)} required className="inputField"
                />
              </div>
              <div className="inputContainer">
                <input
                  type="text" placeholder="Usuario" value={usuario}
                  onChange={(e) => setUsuario(e.target.value)} required
                  autoComplete="username" className="inputField"
                />
              </div>
              <div className="inputContainer">
                <input
                  type="password" placeholder="Contraseña" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  autoComplete="new-password" className="inputField"
                />
              </div>
              <div className="inputContainer">
                <input
                  type="password" placeholder="Confirmar contraseña" value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)} required
                  autoComplete="new-password" className="inputField"
                />
              </div>

              <div className="login-tabs" role="radiogroup" aria-label="Rol del usuario">
                {[{ id: "tecnico", label: "Técnico" }, { id: "admin", label: "Administrador" }].map((r) => (
                  <button
                    key={r.id} type="button" role="radio" aria-checked={rol === r.id}
                    onClick={() => setRol(r.id)}
                    className={`login-tab-btn ${rol === r.id ? "active" : ""}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {error && <div className="login-error" role="alert">{error}</div>}

              <button type="submit" className="btn-submit">Crear cuenta</button>
            </form>
          )}

          <div className="register-link">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
