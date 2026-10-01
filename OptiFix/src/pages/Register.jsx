import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { registrarUsuario } from "../services/n8nBackendService.js";
import "./Login.css";

// El registro público está limitado a personal técnico. Solo /usuarios puede crear administradores.
const PUBLIC_ROLE = "tecnico";

export default function Register() {
  const navigate = useNavigate();
  const { addUsuario } = useWorkshop();
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
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

    const nuevoTecnico = { nombre, usuario, password, rol: PUBLIC_ROLE };
    try {
      const remote = await registrarUsuario(nuevoTecnico);
      if (!remote.ok && !remote.demo) throw new Error(remote.error || "No fue posible registrar el usuario.");
      const resultado = await addUsuario(nuevoTecnico);
      if (resultado.error) throw new Error(resultado.error);
      setExito(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (requestError) {
      setError(requestError.message || "No fue posible registrar el usuario.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #0a2547 0%, #0d4d8a 55%, #38bdf8 120%)", fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div className="form_main login-panel">
          <div className="form-title-wrap"><div className="brand-center"><OptifixBrand size={48} textSize={26} taglineSize={9} /></div><h1 className="heading">Crear cuenta</h1><p className="login-sub">Registro de personal técnico del taller</p></div>
          {exito ? (
            <div className="login-credentials" role="status" style={{ textAlign: "center" }}><p className="cred-title">¡Cuenta creada!</p><p>Redirigiendo al inicio de sesión…</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="inputContainer"><label className="sr-only" htmlFor="register-name">Nombre completo</label><input id="register-name" type="text" placeholder="Nombre completo" value={nombre} onChange={(event) => setNombre(event.target.value)} required className="inputField" /></div>
              <div className="inputContainer"><label className="sr-only" htmlFor="register-user">Usuario</label><input id="register-user" type="text" placeholder="Usuario" value={usuario} onChange={(event) => setUsuario(event.target.value)} required autoComplete="username" className="inputField" /></div>
              <div className="inputContainer"><label className="sr-only" htmlFor="register-password">Contraseña</label><input id="register-password" type="password" placeholder="Contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" className="inputField" /></div>
              <div className="inputContainer"><label className="sr-only" htmlFor="register-confirm">Confirmar contraseña</label><input id="register-confirm" type="password" placeholder="Confirmar contraseña" value={confirmar} onChange={(event) => setConfirmar(event.target.value)} required autoComplete="new-password" className="inputField" /></div>
              <p className="login-sub" role="note">Las cuentas creadas aquí reciben el rol de Técnico.</p>
              {error && <div className="login-error" role="alert">{error}</div>}
              <button type="submit" className="btn-submit">Crear cuenta de técnico</button>
            </form>
          )}
          <div className="register-link"><p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p></div>
        </div>
      </div>
    </div>
  );
}
