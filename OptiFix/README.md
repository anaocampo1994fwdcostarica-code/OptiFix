# OPTIFIX — Ventanilla Única Digital

Frontend (React + Vite) que da soporte a la interfaz oficial de **OPTIFIX**,
consumiendo la [Especificación de API REST](https://api.optifix.gob.digital/v1):
búsqueda de trámites, consulta de radicados, autenticación ciudadana, catálogo
de servicios y validación criptográfica (CVU).

## Instalación

```bash
npm install
```

## Backend simulado (replica los endpoints de la especificación)

En una terminal aparte:

```bash
npm run server
```

Levanta en `http://localhost:3001` un mock (json-server + `server.js`) que
replica los endpoints de la API:

| Especificación (producción)                  | Mock local                            |
| -------------------------------------------- | ------------------------------------- |
| `GET /tramites/search`                       | `GET http://localhost:3001/tramites/search` |
| `GET /categorias`                            | `GET http://localhost:3001/categorias` |
| `GET /radicados/{numero_radicado}`           | `GET http://localhost:3001/radicados/:numero` |
| `GET /metricas/publicas`                     | `GET http://localhost:3001/metricas/publicas` |
| `POST /verificacion/cvu`                     | `POST http://localhost:3001/verificacion/cvu` |
| `POST /auth/login-ciudadano`                 | `POST http://localhost:3001/auth/login-ciudadano` |

## Levantar la app

```bash
npm run dev
```

## Correr las pruebas unitarias

```bash
npm run test
```

## Datos de prueba

| Identificación | Contraseña    | Método        | Usuario                 | Tipo              |
|----------------|---------------|---------------|-------------------------|-------------------|
| 1102938491     | ciudadano123  | CLAVE_DIGITAL | Carlos Alberto Mendoza  | PERSONA_NATURAL   |
| 3101847205     | firma456      | FIRMA_DIGITAL | Lab. Farmacéutico Nac.  | PERSONA_JURIDICA  |

Radicado de ejemplo: `OPX-2024-98421-S`.
CVU de ejemplo: `CVU-8982-OPT-9921` + documento `CERT-2024-ALM-003`.

## Estructura

- `src/pages/*` → cada pantalla de la app (Home, búsqueda, radicado, verificación, portal).
- `src/components/*` → componentes reutilizables (Hero, categorías, stepper, badges...).
- `src/services/*` → único lugar que habla con la API (mirror del contrato REST).
- `src/index.css` → sistema de diseño y paleta institucional de toda la página.
- `server.js` + `db.json` → mock de backend con los endpoints de la especificación.