import { API_URL } from "../config.js";

const endpoint = `${API_URL}/modelos`;
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error((await response.text().catch(() => "")) || `JSON Server respondió con ${response.status}.`);
  return response.status === 204 ? null : response.json();
}

export const listarModelos = () => request(endpoint);
export const crearModelo = (data) => request(endpoint, { method: "POST", body: JSON.stringify(data) });
