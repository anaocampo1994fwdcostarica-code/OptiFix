import { createContext, useEffect, useState } from "react";
import { autenticarUsuario } from "../services/usuariosService.js";

export const AuthContext = createContext(null);

const SESSION_KEY = "optifix_session";

// Simulación académica: localStorage solo guarda identidad y permisos mínimos.
// En producción esto debe reemplazarse por una sesión emitida por un backend.
function crearSesionSegura(usuario = {}) {
  const rol = ["admin", "recepcion", "tecnico"].includes(usuario.rol) ? usuario.rol : "tecnico";
  return {
    id: usuario.id || null,
    nombre: usuario.nombre || "",
    usuario: usuario.usuario || "",
    email: usuario.email || "",
    rol,
    roles: usuario.roles || (rol === "admin" || rol === "recepcion"
      ? ["ver_ordenes", "crear_orden", "crear_cotizacion", "gestionar_usuarios"]
      : ["ver_ordenes", "crear_orden"]),
  };
}

// AuthProvider centraliza toda la sesión del taller:
// - el usuario autenticado (nombre, usuario, rol: "admin" | "tecnico")
// - login / logout y persistencia en localStorage
// - status: "verificando" | "autenticado" | "no-autenticado"
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("verificando");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const sesion = crearSesionSegura(JSON.parse(stored));
        // Elimina campos heredados o manipulados, como password, de la sesión local.
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
        setUser(sesion);
        setStatus("autenticado");
      } else {
        setStatus("no-autenticado");
      }
    } catch (e) {
      setStatus("no-autenticado");
    }
  }, []);

  function login(usuario) {
    // Nunca persistir password u otros datos sensibles del objeto de usuario.
    const sesion = crearSesionSegura(usuario);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    setUser(sesion);
    setStatus("autenticado");
    return sesion;
  }

  async function loginConCredenciales({ usuario, password, rol, fallbackUsers = [] }) {
    let usuarioAutenticado;
    try {
      usuarioAutenticado = await autenticarUsuario({ usuario, password, rol });
    } catch (error) {
      // Respaldo académico offline: solo si JSON Server no está disponible.
      const usuarioNormalizado = usuario.trim().toLowerCase();
      usuarioAutenticado = fallbackUsers.find((candidate) => (
        candidate.usuario?.toLowerCase() === usuarioNormalizado
        && candidate.password === password
        && (!rol || candidate.rol === rol)
      )) || null;
    }
    return usuarioAutenticado ? login(usuarioAutenticado) : null;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setStatus("no-autenticado");
  }

  return (
    <AuthContext.Provider value={{ user, status, login, loginConCredenciales, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
