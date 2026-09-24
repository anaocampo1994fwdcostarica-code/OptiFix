import React, { createContext, useContext, useState, useEffect } from "react";
import initialData from "../../db.json";

const WorkshopContext = createContext(null);

const STORAGE_KEY = "optifix_data_v1";

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
  { id: "user-1", nombre: "Administrador", usuario: "admin", password: "admin123", rol: "admin" },
  { id: "user-2", nombre: "Técnico Principal", usuario: "tecnico", password: "tec123", rol: "tecnico" },
  { id: "user-3", nombre: "Usuario Demo", usuario: "demo", password: "demo", rol: "admin" },
];

export function WorkshopProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Asegurar que siempre existe el catálogo de marcas
        if (!parsed.marcas || parsed.marcas.length === 0) {
          parsed.marcas = MARCAS_SEED;
        }
        // Asegurar que siempre existen usuarios para poder iniciar sesión
        if (!parsed.usuarios || parsed.usuarios.length === 0) {
          parsed.usuarios = USUARIOS_SEED;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error al cargar datos locales de OptiFix", e);
    }
    return { ...initialData, marcas: MARCAS_SEED, usuarios: USUARIOS_SEED };
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error al guardar datos de OptiFix", e);
    }
  }, [data]);

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
      password: usuarioData.password,
      rol: usuarioData.rol === "tecnico" ? "tecnico" : "admin",
    };
    setData((prev) => ({ ...prev, usuarios: [...(prev.usuarios || []), nuevo] }));
    return { usuario: nuevo };
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
    setData((prev) => ({
      ...prev,
      clientes: [nuevo, ...prev.clientes]
    }));
    return nuevo;
  };

  const updateCliente = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      clientes: prev.clientes.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    }));
  };

  const deleteCliente = (id) => {
    setData((prev) => ({
      ...prev,
      clientes: prev.clientes.filter((c) => c.id !== id)
    }));
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
    setData((prev) => ({
      ...prev,
      equipos: [nuevo, ...prev.equipos]
    }));
    return nuevo;
  };

  const updateEquipo = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      equipos: prev.equipos.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    }));
  };

  const deleteEquipo = (id) => {
    setData((prev) => ({
      ...prev,
      equipos: prev.equipos.filter((e) => e.id !== id)
    }));
  };

  // ── COTIZACIONES CRUD ─────────────────────────────────────────────────────────
  const addCotizacion = (cotizacionData) => {
    const nextNum = Math.max(...(data.cotizaciones || []).map((c) => c.numero || 0), 0) + 1;
    const nowStr = new Date().toLocaleDateString("es-CR");
    const nueva = {
      id: `cot-${Date.now()}`,
      numero: nextNum,
      cliente_id: cotizacionData.cliente_id,
      equipo_texto: cotizacionData.equipo_texto || "",
      falla: cotizacionData.falla || "",
      estado: "PENDIENTE",
      fecha: nowStr,
      vigencia: cotizacionData.vigencia || 15,
      notas: cotizacionData.notas || "",
      items: (cotizacionData.items || []).map((item) => ({
        descripcion: item.descripcion || "",
        cantidad: Number(item.cantidad) || 1,
        precio: Number(item.precio) || 0
      }))
    };
    setData((prev) => ({
      ...prev,
      cotizaciones: [nueva, ...(prev.cotizaciones || [])]
    }));
    return nueva;
  };

  const aprobarCotizacion = (id) => {
    setData((prev) => ({
      ...prev,
      cotizaciones: (prev.cotizaciones || []).map((c) =>
        c.id === id ? { ...c, estado: "APROBADA" } : c
      )
    }));
  };

  const addOrden = (ordenData) => {
    const nextNum = Math.max(...data.ordenes.map((o) => o.numero || 8000), 8825) + 1;
    const nowStr = new Date().toLocaleString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) + " hs";

    const nueva = {
      id: `ord-${nextNum}`,
      numero: nextNum,
      token_seguimiento: `ORD-${nextNum}`,
      cliente_id: ordenData.cliente_id,
      equipo_id: ordenData.equipo_id,
      referencia_externa: ordenData.referencia_externa || "",
      prioridad: ordenData.prioridad || "Normal",
      area: ordenData.area || "Entrada",
      responsable: ordenData.responsable || "OptiFix Centro de Servicios",
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

    setData((prev) => ({
      ...prev,
      ordenes: [nueva, ...prev.ordenes]
    }));
    return nueva;
  };

  const updateOrden = (id, fields) => {
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) =>
        o.id === id || o.numero === Number(id) ? { ...o, ...fields } : o
      )
    }));
  };

  const changeOrdenStatus = (ordenId, nuevoEstado, nuevaEtapa, detalle) => {
    const nowStr = new Date().toLocaleString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) + " hs";

    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((o) => {
        if (o.id === ordenId || o.numero === Number(ordenId)) {
          const isEntregado = nuevoEstado.toUpperCase().includes("ENTREGADO");
          return {
            ...o,
            estado_actual: nuevoEstado,
            etapa_categoria: nuevaEtapa || o.etapa_categoria,
            fecha_entrega: isEntregado ? nowStr : o.fecha_entrega,
            linea_tiempo: [
              ...o.linea_tiempo,
              {
                fecha: nowStr,
                estado: nuevoEstado,
                realizado_por: "OptiFix",
                detalle: detalle || `Cambio de estado a ${nuevoEstado}`
              }
            ]
          };
        }
        return o;
      })
    }));
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
  const addArchivo = (ordenId, { nombre, tipo = "image/jpeg", tamano = "1.1 MB" }) => {
    const newF = {
      id: `arc-${Date.now()}`,
      nombre, tipo, tamano,
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

  // ── RESET DEMO ────────────────────────────────────────────────────────────────
  const resetToSeedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({ ...initialData, marcas: MARCAS_SEED, usuarios: USUARIOS_SEED });
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
      const eq = data.equipos.find((e) => e.id === o.equipo_id);
      const cli = data.clientes.find((c) => c.id === o.cliente_id);
      return (
        numStr.includes(q) ||
        (o.trabajo_solicitado && o.trabajo_solicitado.toLowerCase().includes(q)) ||
        (eq && ((eq.marca || "").toLowerCase().includes(q) || (eq.modelo || "").toLowerCase().includes(q) || (eq.serie || "").toLowerCase().includes(q))) ||
        (cli && ((cli.nombre || "").toLowerCase().includes(q) || (cli.identificacion || "").includes(q)))
      );
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
    notificaciones: data.notificaciones || [],
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
    aprobarCotizacion,
    addOrden,
    updateOrden,
    changeOrdenStatus,
    toggleGarantia,
    addProductService,
    removeProductService,
    toggleTarea,
    addTarea,
    addNota,
    addArchivo,
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
