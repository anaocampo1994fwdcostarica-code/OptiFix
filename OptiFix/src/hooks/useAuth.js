import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

// En vez de importar useContext + AuthContext en cada componente,
// cualquier página/componente hace: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
