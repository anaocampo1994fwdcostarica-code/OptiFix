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

Importe los JSON de `n8n/` con **Import from File** en n8n. Active cada flujo y reemplace la URL del nodo de notificación por email, Slack o webhook.site. Los disparadores son `POST /webhook/optifix-user-created` y `POST /webhook/optifix-order-delivered`.

## Pruebas

```bash
npm run test
```
