import { API_URL } from "../config.js";

const endpoint = `${API_URL}/productos`;
async function request(url, options = {}) { const response = await fetch(url, { headers: { "Content-Type": "application/json", ...options.headers }, ...options }); if (!response.ok) throw new Error((await response.text().catch(() => "")) || `JSON Server respondió con ${response.status}.`); return response.status === 204 ? null : response.json(); }
export const listarProductos = () => request(endpoint);
export const crearProducto = (data) => request(endpoint, { method: "POST", body: JSON.stringify(data) });
export const actualizarProducto = (id, data) => request(`${endpoint}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
export const eliminarProducto = (id) => request(`${endpoint}/${encodeURIComponent(id)}`, { method: "DELETE" });
