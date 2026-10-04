import React, { createContext, useContext, useState, useEffect } from "react";
import initialData from "../../db.json";
import {
  listarOrdenes,
  crearOrden,
  actualizarOrden as actualizarOrdenEnServidor,
  eliminarOrden as eliminarOrdenEnServidor,
} from "../services/ordenesService.js";
import {
  listarUsuarios,
  crearUsuario as crearUsuarioEnServidor,
  reemplazarUsuario as reemplazarUsuarioEnServidor,
  eliminarUsuario as eliminarUsuarioEnServidor,
} from "../services/usuariosService.js";
import { listarClientes, crearCliente as crearClienteEnServidor, actualizarCliente as actualizarClienteEnServidor, eliminarCliente as eliminarClienteEnServidor } from "../services/clientesService.js";
import { listarEquipos, crearEquipo as crearEquipoEnServidor, actualizarEquipo as actualizarEquipoEnServidor, eliminarEquipo as eliminarEquipoEnServidor } from "../services/equiposService.js";
import { listarProductos, crearProducto as crearProductoEnServidor, actualizarProducto as actualizarProductoEnServidor, eliminarProducto as eliminarProductoEnServidor } from "../services/productosService.js";
import { listarServicios, crearServicio as crearServicioEnServidor, actualizarServicio as actualizarServicioEnServidor, eliminarServicio as eliminarServicioEnServidor } from "../services/serviciosService.js";
import { listarCotizaciones, crearCotizacion as crearCotizacionEnServidor, actualizarCotizacion as actualizarCotizacionEnServidor, eliminarCotizacion as eliminarCotizacionEnServidor } from "../services/cotizacionesService.js";
import { WORKSHOP_NAME } from "../config/workshop.js";

const WorkshopContext = createContext(null);

const confirmedPatch = (requestedFields, response) => Object.fromEntries(
  Object.keys(requestedFields).map((key) => [
    key,
    response && Object.prototype.hasOwnProperty.call(response, key) ? response[key] : requestedFields[key]
  ])
);

const STORAGE_KEY = "optifix_data_v1";
const DEMO_CLIENTS_SEEDED_KEY = "optifix_deletable_clients_seeded_v1";
const LEGACY_WORKSHOP_NAME = /T2K\s+SERVICIOS\s+ELECTR(?:ÓNICOS|ONICOS|Ã“NICOS)/gi;

/**
 * Migra datos históricos guardados en localStorage o recibidos desde JSON Server.
 * Se recorre la estructura completa porque el nombre puede existir en órdenes,
 * notas, comprobantes o líneas de tiempo creadas antes del cambio de marca.
 */
function migrateWorkshopName(value) {
  if (typeof value === "string") return value.replace(LEGACY_WORKSHOP_NAME, WORKSHOP_NAME);
  if (Array.isArray(value)) return value.map(migrateWorkshopName);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, migrateWorkshopName(nestedValue)])
    );
  }
  return value;
}
const DELETABLE_DEMO_CLIENTS = [
  { id: "cli-demo-1", identificacion: "119990101", nombre: "Andrea Solano", email: "andrea.solano@correo.cr", telefono: "87001234", direccion: "San Ramón, Alajuela", notas: "Cliente de prueba sin órdenes activas." },
  { id: "cli-demo-2", identificacion: "208880202", nombre: "Diego Vargas", email: "diego.vargas@correo.cr", telefono: "88114567", direccion: "Tres Ríos, Cartago", notas: "Cliente de prueba sin órdenes activas." },
  { id: "cli-demo-3", identificacion: "311770303", nombre: "María José Araya", email: "maria.araya@correo.cr", telefono: "89907890", direccion: "Belén, Heredia", notas: "Cliente de prueba sin órdenes activas." },
];

// Catálogo inicial de marcas del taller
const MARCAS_SEED = [
  "Samsung", "LG", "Sony", "Panasonic", "Philips", "Toshiba",
  "TCL", "Hisense", "Daewoo", "Oster", "Black & Decker",
  "Whirlpool", "Mabe", "Acer", "HP", "Dell", "Lenovo",
  "Apple", "Huawei", "Xiaomi", "Sharp", "JVC", "Pioneer",
  "Haier", "Midea", "Electrolux", "Bosch", "Siemens"
];

// Usuarios semilla para autenticación (admin / técnico)
const USUARIOS_SEED = [
  { id: "user-1", nombre: "Administrador", usuario: "admin", email: "admin@optifix.local", telefono: "7000-0001", password: "admin123", rol: "admin", roles: ["ver_ordenes", "crear_orden", "crear_cotizacion", "gestionar_usuarios"] },
  { id: "user-2", nombre: "Técnico Principal", usuario: "tecnico", email: "tecnico@optifix.local", telefono: "7000-0002", password: "tec123", rol: "tecnico", roles: ["ver_ordenes", "crear_orden"] },
  { id: "user-3", nombre: "Usuario Demo", usuario: "demo", email: "demo@optifix.local", telefono: "7000-0003", password: "demo", rol: "admin", roles: ["ver_ordenes", "crear_orden", "crear_cotizacion", "gestionar_usuarios"] },
  { id: "user-tech-daniel", nombre: "Daniel Rojas Vargas", usuario: "daniel.rojas", email: "daniel.rojas@optifix.local", telefono: "7000-0101", password: "demo-tecnico", rol: "tecnico", especialidad: "Electrónica / Reparaciones", roles: ["ver_ordenes", "crear_orden"] },
  { id: "user-tech-andres", nombre: "Andrés Jiménez Mora", usuario: "andres.jimenez", email: "andres.jimenez@optifix.local", telefono: "7000-0102", password: "demo-tecnico", rol: "tecnico", especialidad: "Diagnóstico técnico", roles: ["ver_ordenes", "crear_orden"] },
  { id: "user-tech-sofia", nombre: "Sofía Hernández Solano", usuario: "sofia.hernandez", email: "sofia.hernandez@optifix.local", telefono: "7000-0103", password: "demo-tecnico", rol: "tecnico", especialidad: "Electrónica y equipos", roles: ["ver_ordenes", "crear_orden"] },
];

export function WorkshopProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = migrateWorkshopName(JSON.parse(saved));
        // Asegurar que siempre existe el catálogo de marcas
        if (!parsed.marcas || parsed.marcas.length === 0) {
          parsed.marcas = MARCAS_SEED;
        }
        // Asegurar que siempre existen usuarios para poder iniciar sesión
        if (!parsed.usuarios || parsed.usuarios.length === 0) {
          parsed.usuarios = USUARIOS_SEED;
        }
        // Se insertan una sola vez para probar la eliminación sin afectar órdenes existentes.
        if (!localStorage.getItem(DEMO_CLIENTS_SEEDED_KEY)) {
          const ids = new Set((parsed.clientes || []).map((cliente) => cliente.id));
          parsed.clientes = [...DELETABLE_DEMO_CLIENTS.filter((cliente) => !ids.has(cliente.id)), ...(parsed.clientes || [])];
          localStorage.setItem(DEMO_CLIENTS_SEEDED_KEY, "true");
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error al cargar datos locales de OptiFix", e);
    }
    localStorage.setItem(DEMO_CLIENTS_SEEDED_KEY, "true");
    return migrateWorkshopName({ ...initialData, marcas: MARCAS_SEED, usuarios: USUARIOS_SEED });
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("optifix_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "light-mode" : "";
    localStorage.setItem("optifix_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [activeStageFilter, setActiveStageFilter] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const markNotificationAsRead = (notificationId) => {
    setData((prev) => ({
      ...prev,
      notificaciones: (prev.notificaciones || []).map((notification) =>
        notification.id === notificationId ? { ...notification, leido: true } : notification
      )
    }));
  };

  const markAllNotificationsAsRead = () => {
    setData((prev) => ({
      ...prev,
      notificaciones: (prev.notificaciones || []).map((notification) => ({ ...notification, leido: true }))
    }));
  };

  const deleteNotification = (notificationId) => {
    setData((prev) => ({
      ...prev,
      notificaciones: (prev.notificaciones || []).filter((notification) => notification.id !== notificationId)
    }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error al guardar datos de OptiFix", e);
    }
  }, [data]);

  // JSON Server es la fuente principal de órdenes. El estado inicial/localStorage
  // solo se conserva para que el taller pueda abrir en modo offline si la API falla.
  useEffect(() => {
    let cancelled = false;

    async function cargarOrdenesRemotas() {
      // Jest/jsdom puede no implementar fetch; en ese caso el respaldo local
      // es el comportamiento esperado y no debe producir una advertencia.
      if (typeof fetch !== "function") return;
      try {
        const ordenesRemotas = await listarOrdenes();
        if (!cancelled && Array.isArray(ordenesRemotas)) {
          setData((prev) => ({ ...prev, ordenes: migrateWorkshopName(ordenesRemotas) }));
        }
      } catch (error) {
        console.warn("JSON Server no está disponible; se utilizará el respaldo local.", error);
      }
    }

    cargarOrdenesRemotas();
    return () => { cancelled = true; };
  }, []);

  // Catálogos operativos: JSON Server es la fuente de verdad; localStorage es respaldo offline.
  useEffect(() => {
    let cancelled = false;
    async function cargarCatalogosRemotos() {
      if (typeof fetch !== "function") return;
      const recursos = [
        ["clientes", listarClientes], ["equipos", listarEquipos], ["productos", listarProductos],
        ["servicios", listarServicios], ["cotizaciones", listarCotizaciones],
      ];
      const resultados = await Promise.allSettled(recursos.map(([, listar]) => listar()));
      if (cancelled) return;
      // El servidor puede haberse iniciado antes de actualizar db.json. Sincronizamos
      // los tres contactos de prueba para que estén disponibles de inmediato.
      const clientesResultado = resultados[0];
      if (clientesResultado.status === "fulfilled" && Array.isArray(clientesResultado.value)) {
        const idsRemotos = new Set(clientesResultado.value.map((cliente) => cliente.id));
        const faltantes = DELETABLE_DEMO_CLIENTS.filter((cliente) => !idsRemotos.has(cliente.id));
        if (faltantes.length) {
          const creados = await Promise.allSettled(faltantes.map((cliente) => crearClienteEnServidor(cliente)));
          const confirmados = creados.filter((resultado) => resultado.status === "fulfilled").map((resultado) => resultado.value);
          const idsConfirmados = new Set(confirmados.map((cliente) => cliente.id));
          clientesResultado.value = [...confirmados, ...faltantes.filter((cliente) => !idsConfirmados.has(cliente.id)), ...clientesResultado.value];
        }
      }
      setData((prev) => {
        const siguiente = { ...prev };
        resultados.forEach((resultado, indice) => {
          if (resultado.status === "fulfilled" && Array.isArray(resultado.value)) {
            siguiente[recursos[indice][0]] = migrateWorkshopName(resultado.value);
          }
        });
        return siguiente;
      });
    }
    cargarCatalogosRemotos();
    return () => { cancelled = true; };
  }, []);

  // Los usuarios también se cargan desde JSON Server. El estado/localStorage
  // permanece únicamente como respaldo para uso offline durante el desarrollo.
  useEffect(() => {
    let cancelled = false;

    async function cargarUsuariosRemotos() {
      if (typeof fetch !== "function") return;
      try {
        const usuariosRemotos = await listarUsuarios();
        if (!cancelled && Array.isArray(usuariosRemotos)) {
          setData((prev) => ({ ...prev, usuarios: migrateWorkshopName(usuariosRemotos) }));
        }
      } catch (error) {
        console.warn("JSON Server no está disponible; se utilizarán usuarios locales.", error);
      }
    }

    cargarUsuariosRemotos();
    return () => { cancelled = true; };
  }, []);

  // ── MARCAS ───────────────────────────────────────────────────────────────────
  const addMarca = (nombre) => {
    const normalizado = nombre.trim();
    if (!normalizado) return;
    setData((prev) => {
      const ya_existe = (prev.marcas || []).some(
        (m) => m.toLowerCase() === normalizado.toLowerCase()
      );
      if (ya_existe) return prev;
      return { ...prev, marcas: [...(prev.marcas || []), normalizado].sort() };
    });
  };

  // ── USUARIOS (autenticación) ──────────────────────────────────────────────────
  const addUsuario = (usuarioData) => {
    const existe = (data.usuarios || []).some(
      (u) => u.usuario.toLowerCase() === usuarioData.usuario.trim().toLowerCase()
    );
    if (existe) {
      return { error: "Ese nombre de usuario ya existe." };
    }
    const nuevo = {
      id: `user-${Date.now()}`,
      nombre: usuarioData.nombre.trim(),
      usuario: usuarioData.usuario.trim(),
      email: usuarioData.email?.trim() || "",
      telefono: usuarioData.telefono?.trim() || "",
      password: usuarioData.password,
      rol: usuarioData.rol === "tecnico" ? "tecnico" : "admin",
      roles: usuarioData.roles || (usuarioData.rol === "tecnico" ? ["ver_ordenes", "crear_orden"] : ["ver_ordenes", "crear_orden", "crear_cotizacion", "gestionar_usuarios"]),
    };
    return crearUsuarioEnServidor(nuevo)
      .then((creado) => {
        setData((prev) => ({ ...prev, usuarios: [...(prev.usuarios || []), creado] }));
        return { usuario: creado, source: "json-server" };
      })
      .catch((error) => {
        // Fallos de red (incluido JSON Server apagado) conservan la continuidad offline.
        if (typeof fetch !== "function" || error instanceof TypeError) {
          setData((prev) => ({ ...prev, usuarios: [...(prev.usuarios || []), nuevo] }));
          return { usuario: nuevo, source: "offline" };
        }
        throw error;
      });
  };

  const updateUsuario = async (id, fields) => {
    const actual = (data.usuarios || []).find((user) => user.id === id);
    if (!actual) return { error: "Usuario no encontrado." };

    const actualizado = { ...actual, ...fields };
    try {
      const remoto = await reemplazarUsuarioEnServidor(id, actualizado);
      setData((prev) => ({
        ...prev,
        usuarios: (prev.usuarios || []).map((user) => user.id === id ? remoto : user),
      }));
      return { usuario: remoto, source: "json-server" };
    } catch (error) {
      if (typeof fetch !== "function" || error instanceof TypeError) {
        setData((prev) => ({
          ...prev,
          usuarios: (prev.usuarios || []).map((user) => user.id === id ? actualizado : user),
        }));
        return { usuario: actualizado, source: "offline" };
      }
      throw error;
    }
  };

  const deleteUsuario = async (id) => {
    setData((prev) => ({ ...prev, usuarios: (prev.usuarios || []).filter((user) => user.id !== id) }));
    try {
      await eliminarUsuarioEnServidor(id);
    } catch (error) {
      // La eliminación local mantiene la sesión operativa si el mock remoto no responde.
      console.warn("No se pudo sincronizar la eliminación del usuario con el servidor.", error);
    }
  };

  // ── CLIENTES CRUD ─────────────────────────────────────────────────────────────
  const addCliente = (clienteData) => {
    const newId = `cli-${Date.now()}`;
    const nuevo = {
      id: newId,
      tipo_cliente: clienteData.tipo_cliente || "Persona",
      identificacion: clienteData.identificacion || "",
      nombre: clienteData.nombre || "",
      apellido: clienteData.apellido || "",
      email: clienteData.email || "",
      telefono: clienteData.telefono || "",
      correos: clienteData.correos || [],
      telefonos: clienteData.telefonos || [],
      direccion: clienteData.direccion || "",
      notas: clienteData.notas || ""
    };
    if (typeof fetch !== "function") {
      setData((prev) => ({ ...prev, clientes: [nuevo, ...prev.clientes] }));
      return nuevo;
    }
    return crearClienteEnServidor(nuevo).then((creado) => {
      setData((prev) => ({ ...prev, clientes: [creado, ...prev.clientes.filter((cliente) => cliente.id !== creado.id)] }));
      return creado;
    });
  };

  const updateCliente = async (id, updatedFields) => {
    const actualizado = await actualizarClienteEnServidor(id, updatedFields);
    setData((prev) => ({ ...prev, clientes: prev.clientes.map((cliente) => cliente.id === id ? actualizado : cliente) }));
    return actualizado;
  };

  const deleteCliente = async (id) => {
    try {
      await eliminarClienteEnServidor(id);
    } catch (error) {
      // Los contactos de prueba también se pueden borrar si el servidor local no los persistió.
      if (!DELETABLE_DEMO_CLIENTS.some((cliente) => cliente.id === id)) throw error;
    }
    setData((prev) => ({ ...prev, clientes: prev.clientes.filter((cliente) => cliente.id !== id) }));
  };

  // ── EQUIPOS CRUD ──────────────────────────────────────────────────────────────
  const addEquipo = (equipoData) => {
    const newId = `eq-${Date.now()}`;
    const nuevo = {
      id: newId,
      cliente_id: equipoData.cliente_id || "",
      tipo: equipoData.tipo || "Artículo",
      marca: equipoData.marca || "",
      modelo: equipoData.modelo || "",
      serie: equipoData.serie || "",
      estado_fisico: equipoData.estado_fisico || "BUEN ESTADO",
      accesorios: equipoData.accesorios || "NINGUNO",
      falla_reportada: equipoData.falla_reportada || "",
      notas: equipoData.notas || ""
    };
    if (typeof fetch !== "function") {
      setData((prev) => ({ ...prev, equipos: [nuevo, ...prev.equipos] }));
      return nuevo;
    }
    return crearEquipoEnServidor(nuevo).then((creado) => {
      setData((prev) => ({ ...prev, equipos: [creado, ...prev.equipos.filter((equipo) => equipo.id !== creado.id)] }));
      return creado;
    });
  };

  const updateEquipo = async (id, updatedFields) => {
    const actualizado = await actualizarEquipoEnServidor(id, updatedFields);
    setData((prev) => ({ ...prev, equipos: prev.equipos.map((equipo) => equipo.id === id ? actualizado : equipo) }));
    return actualizado;
  };

  const deleteEquipo = async (id) => {
    await eliminarEquipoEnServidor(id);
    setData((prev) => ({ ...prev, equipos: prev.equipos.filter((equipo) => equipo.id !== id) }));
  };

  // ── COTIZACIONES CRUD ─────────────────────────────────────────────────────────
  const addCotizacion = async (cotizacionData) => {
    const nextNum = Math.max(...(data.cotizaciones || []).map((c) => c.numero || 0), 0) + 1;
    const nowStr = new Date().toLocaleDateString("es-CR");
    const nueva = {
      id: `cot-${Date.now()}`,
      numero: nextNum,
      cliente_id: cotizacionData.cliente_id,
      cliente_nombre: cotizacionData.cliente_nombre || "",
      equipo_texto: cotizacionData.equipo_texto || "",
      falla: cotizacionData.falla || "",
      estado: "PENDIENTE",
      fecha: nowStr,
      vigencia: cotizacionData.vigencia || 15,
      notas: cotizacionData.notas || "",
      subtotal: Number(cotizacionData.subtotal) || 0,
      iva: Number(cotizacionData.iva) || 0,
      total: Number(cotizacionData.total) || 0,
      items: (cotizacionData.items || []).map((item) => ({
        descripcion: item.descripcion || "",
        cantidad: Number(item.cantidad) || 1,
        precio: Number(item.precio) || 0,
        subtotal: Number(item.subtotal) || 0,
        iva: Number(item.iva) || 0,
        total: Number(item.total) || 0
      }))
    };
    const creada = await crearCotizacionEnServidor(nueva);
    setData((prev) => ({ ...prev, cotizaciones: [creada, ...(prev.cotizaciones || []).filter((cotizacion) => cotizacion.id !== creada.id)] }));
    return creada;
  };

  const updateCotizacion = async (id, fields) => {
    const actualizada = await actualizarCotizacionEnServidor(id, fields);
    setData((prev) => ({ ...prev, cotizaciones: (prev.cotizaciones || []).map((cotizacion) => cotizacion.id === id ? actualizada : cotizacion) }));
    return actualizada;
  };

  const aprobarCotizacion = (id) => updateCotizacion(id, { estado: "APROBADA" });

  const deleteCotizacion = async (id) => {
    await eliminarCotizacionEnServidor(id);
    setData((prev) => ({ ...prev, cotizaciones: (prev.cotizaciones || []).filter((cotizacion) => cotizacion.id !== id) }));
  };

  const addProducto = async (producto) => {
    const creado = await crearProductoEnServidor({ ...producto, id: producto.id || `prod-${Date.now()}`, precio: Number(producto.precio) || 0, stock: Number(producto.stock) || 0 });
    setData((prev) => ({ ...prev, productos: [creado, ...(prev.productos || []).filter((item) => item.id !== creado.id)] }));
    return creado;
  };
  const updateProducto = async (id, cambios) => {
    const actualizado = await actualizarProductoEnServidor(id, cambios);
    setData((prev) => ({ ...prev, productos: (prev.productos || []).map((item) => item.id === id ? actualizado : item) }));
    return actualizado;
  };
  const deleteProducto = async (id) => {
    await eliminarProductoEnServidor(id);
    setData((prev) => ({ ...prev, productos: (prev.productos || []).filter((item) => item.id !== id) }));
  };

  const addServicio = async (servicio) => {
    const creado = await crearServicioEnServidor({ ...servicio, id: servicio.id || `srv-${Date.now()}`, precio: Number(servicio.precio) || 0 });
    setData((prev) => ({ ...prev, servicios: [creado, ...(prev.servicios || []).filter((item) => item.id !== creado.id)] }));
    return creado;
  };
  const updateServicio = async (id, cambios) => {
    const actualizado = await actualizarServicioEnServidor(id, cambios);
    setData((prev) => ({ ...prev, servicios: (prev.servicios || []).map((item) => item.id === id ? actualizado : item) }));
    return actualizado;
  };
  const deleteServicio = async (id) => {
    await eliminarServicioEnServidor(id);
    setData((prev) => ({ ...prev, servicios: (prev.servicios || []).filter((item) => item.id !== id) }));
  };

  const addOrden = async (ordenData) => {
    const nextNum = Math.max(...data.ordenes.map((o) => o.numero || 8000), 8825) + 1;
    const nowStr = new Date().toLocaleString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) + " hs";

    const nueva = {
      id: `ord-${nextNum}`,
      numero: nextNum,
      token_seguimiento: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tok-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`,
      cliente_id: ordenData.cliente_id,
      equipo_id: ordenData.equipo_id,
      referencia_externa: ordenData.referencia_externa || "",
      prioridad: ordenData.prioridad || "Normal",
      area: ordenData.area || "Entrada",
      responsable: "",
      fecha_ingreso: nowStr,
      fecha_entrega: null,
      fecha_prometida: ordenData.fecha_prometida || null,
      estado_actual: ordenData.estado_actual || "RECEPCIÓN",
      etapa_categoria: ordenData.etapa_categoria || "ENTRADA",
      trabajo_solicitado: ordenData.trabajo_solicitado || "REVISIÓN GENERAL",
      descripcion_estado: ordenData.descripcion_estado || "NORMAL",
      diagnostico: ordenData.diagnostico || "",
      accesorios: ordenData.accesorios || "NINGUNO",
      garantia: !!ordenData.garantia,
      presupuesto: Number(ordenData.presupuesto) || 0,
      adelanto: Number(ordenData.adelanto) || 0,
      presupuesto_conceptos: [],
      presupuesto_aplica_iva: false,
      presupuesto_estado: "BORRADOR",
      productos_servicios: [],
      tareas: [
        { id: `t-${Date.now()}-1`, texto: "Inspección visual inicial", completada: false }
      ],
      notas: [
        {
          id: `n-${Date.now()}`,
          autor: "OptiFix",
          fecha: nowStr,
          texto: "Ingreso de la orden de trabajo al sistema OptiFix."
        }
      ],
      archivos: [],
      linea_tiempo: [
        {
          fecha: nowStr,
          estado: ordenData.estado_actual || "RECEPCIÓN",
          realizado_por: "OptiFix",
          detalle: "Creación de la orden e ingreso al taller."
        }
      ]
    };

    const creadaEnServidor = await crearOrden(nueva);
    setData((prev) => ({
      ...prev,
      ordenes: [creadaEnServidor, ...prev.ordenes.filter((orden) => orden.id !== creadaEnServidor.id)]
    }));
    return creadaEnServidor;
  };

  const updateOrden = async (id, fields) => {
    const ordenActual = (data.ordenes || []).find((orden) => orden.id === id || orden.numero === Number(id));
    if (!ordenActual) throw new Error("No se encontró la orden que se desea actualizar.");
    const optimista = { ...ordenActual, ...fields };
    // Mantiene la orden montada y visible mientras se realiza el PATCH.
    setData((prev) => ({ ...prev, ordenes: prev.ordenes.map((orden) => orden.id === ordenActual.id ? optimista : orden) }));
    try {
      const respuesta = await actualizarOrdenEnServidor(ordenActual.id, fields);
      // Algunos backends devuelven solo los campos modificados. Nunca sustituir
      // la orden completa por una respuesta parcial.
      const confirmada = confirmedPatch(fields, respuesta);
      // Solo confirma las claves solicitadas. Una respuesta completa y tardía no
      // puede sobrescribir otro switch o edición que se guardó en paralelo.
      setData((prev) => ({ ...prev, ordenes: prev.ordenes.map((orden) => orden.id === ordenActual.id ? { ...orden, ...confirmada, id: ordenActual.id } : orden) }));
      return { ...optimista, ...confirmada, id: ordenActual.id };
    } catch (error) {
      // Revierte solamente los campos de esta operación. Restaurar el objeto
      // completo podía borrar otro cambio optimista realizado mientras este PATCH
      // seguía pendiente (por ejemplo IVA y garantía casi simultáneamente).
      setData((prev) => ({
        ...prev,
        ordenes: prev.ordenes.map((orden) => {
          if (orden.id !== ordenActual.id) return orden;
          const rollback = { ...orden };
          Object.keys(fields).forEach((key) => {
            if (Object.is(orden[key], fields[key])) rollback[key] = ordenActual[key];
          });
          return rollback;
        })
      }));
      throw error;
    }
  };

  const changeOrdenStatus = async (ordenId, nuevoEstado, nuevaEtapa, detalle, metadata = {}) => {
    const nowStr = new Date().toLocaleString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) + " hs";

    const ordenActual = (data.ordenes || []).find((orden) => orden.id === ordenId || orden.numero === Number(ordenId));
    if (!ordenActual) throw new Error("No se encontró la orden que se desea actualizar.");

    const isEntregado = nuevoEstado.toUpperCase().includes("ENTREGADO");
    const cambios = {
      estado_actual: nuevoEstado,
      etapa_categoria: nuevaEtapa || ordenActual.etapa_categoria,
      fecha_entrega: isEntregado ? nowStr : ordenActual.fecha_entrega,
      finalizada: isEntregado ? true : Boolean(metadata.finalizada),
      responsable: metadata.responsable ?? ordenActual.responsable,
      motivo_sin_reparar: metadata.motivo_sin_reparar || (nuevoEstado === "SIN REPARAR" ? detalle : ordenActual.motivo_sin_reparar || ""),
      presupuesto_estado: nuevoEstado === "COMUNICANDO PRESUPUESTO" ? "ENVIADO" : ordenActual.presupuesto_estado || "BORRADOR",
      linea_tiempo: [
        ...(ordenActual.linea_tiempo || []),
        { fecha: nowStr, estado_anterior: metadata.estado_anterior || ordenActual.estado_actual, estado: nuevoEstado, nuevo_estado: nuevoEstado, realizado_por: metadata.realizado_por || "OptiFix", responsable: metadata.responsable ?? ordenActual.responsable ?? "", observacion: detalle || "", motivo: metadata.motivo_sin_reparar || "", detalle: detalle || `Cambio de estado a ${nuevoEstado}` }
      ]
    };
    const optimista = { ...ordenActual, ...cambios };
    setData((prev) => ({ ...prev, ordenes: prev.ordenes.map((orden) => orden.id === ordenActual.id ? optimista : orden) }));
    try {
      const respuesta = await actualizarOrdenEnServidor(ordenActual.id, cambios);
      const confirmada = confirmedPatch(cambios, respuesta);
      setData((prev) => ({ ...prev, ordenes: prev.ordenes.map((orden) => orden.id === ordenActual.id ? { ...orden, ...confirmada, id: ordenActual.id } : orden) }));
      return { ...optimista, ...confirmada, id: ordenActual.id };
    } catch (error) {
      setData((prev) => ({
        ...prev,
        ordenes: prev.ordenes.map((orden) => {
          if (orden.id !== ordenActual.id) return orden;
          const rollback = { ...orden };
          Object.keys(cambios).forEach((key) => {
            if (Object.is(orden[key], cambios[key])) rollback[key] = ordenActual[key];
          });
          return rollback;
        })
      }));
      throw error;
    }
  };

  const deleteOrden = async (id) => {
    const ordenActual = (data.ordenes || []).find((orden) => orden.id === id || orden.numero === Number(id));
    if (!ordenActual) throw new Error("No se encontró la orden que se desea eliminar.");

    await eliminarOrdenEnServidor(ordenActual.id);
    setData((prev) => ({ ...prev, ordenes: prev.ordenes.filter((orden) => orden.id !== ordenActual.id) }));
  };

  /** Recarga únicamente las órdenes desde la misma fuente remota ya usada al iniciar. */
  const refreshOrdenes = async () => {
    const ordenesRemotas = await listarOrdenes();
    if (!Array.isArray(ordenesRemotas)) throw new Error("No se pudieron actualizar las órdenes.");
    const ordenesActualizadas = migrateWorkshopName(ordenesRemotas);
    setData((prev) => ({ ...prev, ordenes: ordenesActualizadas }));
    return ordenesActualizadas;
  };

  const toggleGarantia = (ordenId) => {
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) =>
        o.id === ordenId || o.numero === Number(ordenId) ? { ...o, garantia: !o.garantia } : o
      )
    }));
  };

  // ── PRODUCTOS Y SERVICIOS ─────────────────────────────────────────────────────
  const addProductService = (ordenId, item) => {
    const newItem = {
      id: `ps-${Date.now()}`,
      descripcion: item.descripcion || "Item",
      cantidad: Number(item.cantidad) || 1,
      importe: Number(item.importe) || 0
    };
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          return { ...o, productos_servicios: [...(o.productos_servicios || []), newItem] };
        }
        return o;
      })
    }));
  };

  const removeProductService = (ordenId, itemId) => {
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          return {
            ...o,
            productos_servicios: (o.productos_servicios || []).filter((item) => item.id !== itemId)
          };
        }
        return o;
      })
    }));
  };

  // ── TAREAS ────────────────────────────────────────────────────────────────────
  const toggleTarea = (ordenId, tareaId) => {
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          return {
            ...o,
            tareas: (o.tareas || []).map((t) =>
              t.id === tareaId ? { ...t, completada: !t.completada } : t
            )
          };
        }
        return o;
      })
    }));
  };

  const addTarea = (ordenId, texto) => {
    const newT = { id: `t-${Date.now()}`, texto, completada: false };
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          return { ...o, tareas: [...(o.tareas || []), newT] };
        }
        return o;
      })
    }));
  };

  // ── NOTAS ─────────────────────────────────────────────────────────────────────
  const addNota = (ordenId, texto, autor = "OptiFix") => {
    const nowStr = new Date().toLocaleString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) + " hs";
    const newN = { id: `n-${Date.now()}`, autor, fecha: nowStr, texto };
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          return { ...o, notas: [...(o.notas || []), newN] };
        }
        return o;
      })
    }));
  };

  // ── ARCHIVOS ──────────────────────────────────────────────────────────────────
  const addArchivo = (ordenId, { nombre, tipo = "image/jpeg", tamano = "1.1 MB", vistaPrevia = null }) => {
    const newF = {
      id: `arc-${Date.now()}`,
      nombre, tipo, tamano, vistaPrevia,
      fecha: new Date().toLocaleDateString("es-CR")
    };
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          return { ...o, archivos: [...(o.archivos || []), newF] };
        }
        return o;
      })
    }));
  };

  const deleteArchivo = (ordenId, archivoId) => {
    setData((prev) => ({ ...prev, ordenes: prev.ordenes.map((orden) =>
      orden.id === ordenId || orden.numero === Number(ordenId)
        ? { ...orden, archivos: (orden.archivos || []).filter((archivo) => archivo.id !== archivoId) }
        : orden
    ) }));
  };

  // ── RESET DEMO ────────────────────────────────────────────────────────────────
  const resetToSeedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(migrateWorkshopName({ ...initialData, marcas: MARCAS_SEED, usuarios: USUARIOS_SEED }));
  };

  // ── BÚSQUEDA GLOBAL ───────────────────────────────────────────────────────────
  const searchResults = (() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    const matchedClientes = (data.clientes || []).filter(
      (c) =>
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.apellido || "").toLowerCase().includes(q) ||
        (c.identificacion || "").includes(q) ||
        (c.telefono && c.telefono.includes(q))
    );

    const matchedEquipos = (data.equipos || []).filter(
      (e) =>
        (e.marca || "").toLowerCase().includes(q) ||
        (e.modelo || "").toLowerCase().includes(q) ||
        (e.serie || "").toLowerCase().includes(q) ||
        (e.tipo || "").toLowerCase().includes(q)
    );

    const matchedOrdenes = (data.ordenes || []).filter((o) => {
      const numStr = String(o.numero);
      const referenciaExterna = String(o.referencia_externa || "").toLowerCase();
      const eq = data.equipos.find((e) => e.id === o.equipo_id);
      const cli = data.clientes.find((c) => c.id === o.cliente_id);
      return (
        numStr.includes(q) ||
        referenciaExterna.includes(q) ||
        (o.trabajo_solicitado && o.trabajo_solicitado.toLowerCase().includes(q)) ||
        (eq && ((eq.marca || "").toLowerCase().includes(q) || (eq.modelo || "").toLowerCase().includes(q) || (eq.serie || "").toLowerCase().includes(q))) ||
        (cli && ((cli.nombre || "").toLowerCase().includes(q) || (cli.identificacion || "").includes(q)))
      );
    }).sort((a, b) => {
      const equipoA = data.equipos.find((equipo) => equipo.id === a.equipo_id);
      const equipoB = data.equipos.find((equipo) => equipo.id === b.equipo_id);
      const puntuacion = (orden, equipo) => {
        if (String(orden.numero) === q) return 3;
        if (String(orden.referencia_externa || "").toLowerCase() === q) return 2;
        if (String(equipo?.serie || "").toLowerCase() === q) return 1;
        return 0;
      };
      return puntuacion(b, equipoB) - puntuacion(a, equipoA);
    });

    return {
      clientes: matchedClientes,
      equipos: matchedEquipos,
      ordenes: matchedOrdenes,
      totalCount: matchedClientes.length + matchedEquipos.length + matchedOrdenes.length
    };
  })();

  const value = {
    theme,
    toggleTheme,
    clientes: data.clientes || [],
    equipos: data.equipos || [],
    ordenes: data.ordenes || [],
    cotizaciones: data.cotizaciones || [],
    marcas: data.marcas || MARCAS_SEED,
    usuarios: data.usuarios || USUARIOS_SEED,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    notificaciones: data.notificaciones || [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    estadisticas: data.estadisticas || {},
    activeStageFilter,
    setActiveStageFilter,
    searchQuery,
    setSearchQuery,
    searchResults,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    addMarca,
    addCliente,
    updateCliente,
    deleteCliente,
    addEquipo,
    updateEquipo,
    deleteEquipo,
    addCotizacion,
    updateCotizacion,
    aprobarCotizacion,
    deleteCotizacion,
    productos: data.productos || [],
    addProducto,
    updateProducto,
    deleteProducto,
    servicios: data.servicios || [],
    addServicio,
    updateServicio,
    deleteServicio,
    addOrden,
    updateOrden,
    changeOrdenStatus,
    deleteOrden,
    refreshOrdenes,
    toggleGarantia,
    addProductService,
    removeProductService,
    toggleTarea,
    addTarea,
    addNota,
    addArchivo,
    deleteArchivo,
    resetToSeedData
  };

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
}

export function useWorkshop() {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error("useWorkshop debe utilizarse dentro de un WorkshopProvider");
  }
  return context;
}
