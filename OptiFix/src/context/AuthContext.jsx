import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const SESSION_KEY = "optifix_session";

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
        setUser(JSON.parse(stored));
        setStatus("autenticado");
      } else {
        setStatus("no-autenticado");
      }
    } catch (e) {
      setStatus("no-autenticado");
    }
  }, []);

  function login(usuario) {
    const sesion = {
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      rol: usuario.rol,
      roles: usuario.roles || (usuario.rol === "admin" ? ["ver_ordenes", "crear_orden", "crear_cotizacion", "gestionar_usuarios"] : ["ver_ordenes", "crear_orden"])
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    setUser(sesion);
    setStatus("autenticado");
    return sesion;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setStatus("no-autenticado");
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
