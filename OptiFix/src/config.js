// Punto único de configuración del cliente HTTP.
//
// En producción la API vive en https://api.optifix.gob.digital/v1.
// En desarrollo se usa el mock local montado con `npm run server`
// (json-server + server.js) que replica los endpoints de la especificación.
// La URL se puede sobreescribir desde la consola: window.__OPTIFIX_API_URL__ = "..."
export const API_URL =
  (typeof window !== "undefined" ? window.__OPTIFIX_API_URL__ : undefined) ||
  "http://localhost:3001";