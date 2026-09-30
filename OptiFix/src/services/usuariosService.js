import { API_URL } from "../config.js";

const USERS_ENDPOINT = `${API_URL}/usuarios`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `JSON Server respondió con ${response.status}.`);
  }
  return response.status === 204 ? null : response.json();
}

/** CRUD de usuarios contra el backend simulado con JSON Server. */
export const listarUsuarios = () => request(USERS_ENDPOINT);
export const obtenerUsuario = (id) => request(`${USERS_ENDPOINT}/${encodeURIComponent(id)}`);
export const crearUsuario = (usuario) => request(USERS_ENDPOINT, { method: "POST", body: JSON.stringify(usuario) });
export const reemplazarUsuario = (id, usuario) => request(`${USERS_ENDPOINT}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(usuario) });
export const eliminarUsuario = (id) => request(`${USERS_ENDPOINT}/${encodeURIComponent(id)}`, { method: "DELETE" });

/** Consulta credenciales en JSON Server; AuthContext resuelve el respaldo offline. */
export async function autenticarUsuario({ usuario, password, rol }) {
  const coincidencias = await request(`${USERS_ENDPOINT}?usuario=${encodeURIComponent(usuario.trim())}`);
  return coincidencias.find((candidate) => candidate.password === password && candidate.rol === rol) || null;
}
