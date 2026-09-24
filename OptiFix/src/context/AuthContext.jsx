import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

// AuthProvider centraliza TODO lo relacionado a la sesión ciudadana:
// - el usuario autenticado (nombre, tipo, expedientes activos)
// - el token JWT de acceso devuelto por POST /auth/login-ciudadano
// - login / logout y persistencia en localStorage
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("verificando"); // verificando | autenticado | no-autenticado

  useEffect(() => {
    const storedUser = localStorage.getItem("optifix_usuario");
    const storedToken = localStorage.getItem("optifix_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setStatus("autenticado");
    } else {
      setStatus("no-autenticado");
    }
  }, []);

  function login(usuarioBackend, jwtToken) {
    localStorage.setItem("optifix_usuario", JSON.stringify(usuarioBackend));
    localStorage.setItem("optifix_token", jwtToken);
    setUser(usuarioBackend);
    setToken(jwtToken);
    setStatus("autenticado");
  }

  function logout() {
    localStorage.removeItem("optifix_usuario");
    localStorage.removeItem("optifix_token");
    setUser(null);
    setToken(null);
    setStatus("no-autenticado");
  }

  return (
    <AuthContext.Provider value={{ user, token, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}