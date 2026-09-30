import { API_URL } from "../config.js";

const ORDERS_ENDPOINT = `${API_URL}/ordenes`;

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

/** Operaciones CRUD de órdenes contra el JSON Server local. */
export const listarOrdenes = () => request(ORDERS_ENDPOINT);
export const obtenerOrden = (id) => request(`${ORDERS_ENDPOINT}/${encodeURIComponent(id)}`);
export const crearOrden = (orden) => request(ORDERS_ENDPOINT, { method: "POST", body: JSON.stringify(orden) });
export const reemplazarOrden = (id, orden) => request(`${ORDERS_ENDPOINT}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(orden) });
export const actualizarOrden = (id, cambios) => request(`${ORDERS_ENDPOINT}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(cambios) });
export const eliminarOrden = (id) => request(`${ORDERS_ENDPOINT}/${encodeURIComponent(id)}`, { method: "DELETE" });
