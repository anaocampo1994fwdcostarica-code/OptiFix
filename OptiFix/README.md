# OptiFix

Sistema de gestión para talleres de reparación electrónica con Vite, React, React Router, JSON Server y Jest.

## Ejecutar

```bash
npm install
npm run server
npm run dev
```

## Endpoint externo

`src/services/externalApiService.js` consulta Frankfurter (API pública) para el tipo de cambio USD → CRC. El Dashboard lo muestra como referencia para repuestos importados y conserva una tasa de respaldo sin conexión.

## Asistente de diagnóstico IA

En Nueva Orden, use **Sugerir diagnóstico con IA**. Por defecto opera en modo demo local. Para conectarlo a Anthropic defina `VITE_ANTHROPIC_API_KEY` y, opcionalmente, `VITE_ANTHROPIC_MODEL` en `.env.local`. En producción use un backend intermediario para proteger la clave.

## Flujos n8n

Importe `n8n/optifix-automatizaciones.json` con **Import from File**. Es un único lienzo con tres webhooks: `POST /webhook/optifix-order-delivered` (correo HTML por cambio de estado), `POST /webhook/optifix-users` (evento de registro de usuario) y `POST /webhook/optifix-chat` (chat público). Configure la credencial SMTP y, para producción, sustituya el fallback del chat por una consulta HTTP segura a JSON Server y un nodo AI Agent. El `db.json` principal de OptiFix es la fuente mock de datos.

## Backend simulado con n8n

`src/services/n8nBackendService.js` centraliza los contratos con n8n. Configure en el HTML de despliegue `window.__OPTIFIX_N8N_BACKEND_URL__ = "https://tu-n8n.com/webhook"`. Los webhooks deben responder siempre:

```json
{ "ok": true, "data": { } }
```

o ante una falla:

```json
{ "ok": false, "error": "Descripción segura del error" }
```

Endpoints del workflow: `optifix-users`, `optifix-order-delivered` y `optifix-chat`. En n8n, cada Webhook recibe `{ action, ...payload }`, usa un nodo Code o HTTP para leer/escribir el `db.json` montado en el servidor, y termina con **Respond to Webhook**. Nunca exponga un webhook de escritura sin autenticación o una firma compartida; el navegador no debe tener acceso directo al archivo del servidor.

## OptiBot IA (administración)

OptiBot es un chat interno para administradores y técnicos, disponible en `/asistente`. El frontend no consume un proveedor de IA directamente: solo envía `pregunta` y el perfil seguro de la sesión (`id`, `nombre`, `usuario`, `email`, `rol`) al webhook de n8n. No se envían contraseñas, claves de IA ni el `db.json` completo desde el navegador.

1. Copie `.env.example` a `.env.local` y defina `VITE_N8N_OPTIBOT_WEBHOOK_URL=http://localhost:5678/webhook/optifix-admin-chat`. Reinicie Vite después de modificar el archivo.
2. El workflow activo debe conservar **Webhook OptiBot administrativo** → **Validar consulta OptiBot** → **AI Agent OptiBot** → **Formatear respuesta OptiBot** → **Responder OptiBot**. Seleccione en el agente la credencial de DeepSeek que ya está configurada en n8n; la clave del proveedor queda únicamente allí.
3. El export incluye herramientas HTTP Request de solo lectura para `ordenes`, `clientes`, `equipos`, `servicios` y `usuarios-publicos`. El endpoint `usuarios-publicos` elimina `password` antes de responder. Nunca conecte `/usuarios` directamente al agente.
4. La API mock confirmada por `package.json`, `server.js` y `src/config.js` usa el puerto `3001`. Si n8n se ejecuta directamente en Windows, use `http://localhost:3001/...`; si se ejecuta en Docker, use `http://host.docker.internal:3001/...` en cada herramienta.
5. Active el workflow y pruebe una pregunta desde `/asistente`. El webhook debe devolver:

```json
{ "ok": true, "respuesta": "Texto generado por el agente" }
```

`json-server` aplica CORS mediante `jsonServer.defaults()`. Para la comunicación React → n8n, configure en el proceso de n8n `N8N_CORS_ORIGIN=http://localhost:5175` y reinícielo. Si Vite se inició en otro puerto, sustituya `5175` por el puerto que muestra el navegador. No use extensiones ni desactive CORS en el navegador.

Si n8n está apagado, el webhook no está configurado o el agente falla, la interfaz conserva el historial y muestra un error visible y recuperable; no bloquea la aplicación. Para producción, proteja el webhook con autenticación, un proxy de backend o firma verificable y limite el acceso de las herramientas de datos.

## Pruebas

```bash
npm run test
```

## Evidencias del Backend y Pruebas de API (Postman)

El ciclo de vida CRUD de las órdenes de reparación fue validado con **JSON Server** en `http://localhost:3001` y **Postman**. Las pruebas verifican la creación de órdenes, su actualización completa y la modificación parcial de campos, confirmando respuestas exitosas del backend simulado.

### POST · Creación de registros

La creación de una orden devuelve `201 Created` e incluye el identificador generado por el backend.

![Evidencia Postman: creación de orden](./evidencias/Prueba%20unitaria%20POST.jpg)

### PUT · Actualización completa

La actualización completa de la orden devuelve `200 OK` y conserva el identificador del registro actualizado.

![Evidencia Postman: actualización completa](./evidencias/Prueba%20unitaria%20PUT.jpg)

### PATCH · Actualización parcial

La actualización parcial del comentario técnico devuelve `200 OK` sin requerir reemplazar el recurso completo.

![Evidencia Postman: actualización parcial](./evidencias/Prueba%20unitaria%20PATCH.jpg)

> Nota de validación: para consultar la API de órdenes, utilice `http://localhost:3001/ordenes`. El puerto `5175` corresponde a la interfaz Vite y devuelve HTML, no el arreglo JSON de órdenes.
