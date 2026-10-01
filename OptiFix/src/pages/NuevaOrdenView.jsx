import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import AsistenteDiagnostico from "../components/ai/AsistenteDiagnostico.jsx";

/* ────────────────────────────────────────────────────────────────
   OptiFix Logo SVG – Inline component (isotipo con punto naranja)
   ──────────────────────────────────────────────────────────────── */
function OptifixLogo({ size = 40 }) {
  return (
    <svg viewBox="0 0 140 140" style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="optifix_hdr_grad" x1="16" y1="16" x2="124" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="108" height="108" rx="28" fill="url(#optifix_hdr_grad)" />
      <circle cx="70" cy="70" r="36" stroke="#ffffff" strokeWidth="4.2" fill="none" opacity="0.95" />
      <circle cx="70" cy="34" r="4.6" fill="#ffffff" />
      <circle cx="70" cy="106" r="4.6" fill="#ffffff" />
      <circle cx="34" cy="70" r="4.6" fill="#ffffff" />
      <circle cx="106" cy="70" r="4.6" fill="#ffffff" />
      <circle cx="70" cy="70" r="23" fill="#0b1728" />
      <path d="M59.5 70.5L67 78L80.5 62.5" stroke="#0284c7" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Punto Anaranjado Oficial de Calibración */}
      <circle cx="90.5" cy="49" r="6.8" fill="#ff7a00" stroke="#ffffff" strokeWidth="2.2" />
    </svg>
  );
}

export default function NuevaOrdenView({ onOrdenCreada }) {
  const { clientes, equipos, addCliente, addEquipo, addOrden } = useWorkshop();
  const navigate = useNavigate();

  // ── Tab / Stepper state ──────────────────────────────────────

  // ── Inline quick-create forms ────────────────────────────────
  const [showClientForm, setShowClientForm] = useState(true);
  const [showEquipmentForm, setShowEquipmentForm] = useState(true);

  const [newClient, setNewClient] = useState({ tipo_cliente: "Persona", nombre: "", identificacion: "", telefono: "", email: "" });
  const [newEquipo, setNewEquipo] = useState({ tipo: "Laptop / Portátil", marca: "", modelo: "", serie: "" });

  // ── Form state — General ─────────────────────────────────────
  const [clienteId, setClienteId] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [referenciaExterna, setReferenciaExterna] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [area, setArea] = useState("Entrada");
  const [estado, setEstado] = useState("RECEPCIÓN");
  const [responsable, setResponsable] = useState("Sin Asignar (Cola General)");
  const [trabajo, setTrabajo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [diagnosticoSeleccion, setDiagnosticoSeleccion] = useState("No");
  const [tieneGarantia, setTieneGarantia] = useState(false);
  const [adelanto, setAdelanto] = useState("");

  // ── Form state — Tabs ────────────────────────────────────────
  const [diagnosticoTexto, setDiagnosticoTexto] = useState("");
  const [anotaciones, setAnotaciones] = useState("");
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [errorOrden, setErrorOrden] = useState("");

  // ── Search state ─────────────────────────────────────────────
  const [clienteQuery, setClienteQuery] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [equipoQuery, setEquipoQuery] = useState("");
  const [showEquipoDropdown, setShowEquipoDropdown] = useState(false);

  // ── Aux display state ────────────────────────────────────────
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteIdentificacion, setClienteIdentificacion] = useState("");

  // ── Computed ──────────────────────────────────────────────────
  const adelantoNum = Number(String(adelanto).replace(/[^0-9.]/g, "")) || 0;

  const clientesFiltrados = clientes.filter(c =>
    (c.nombre + " " + (c.apellido || "")).toLowerCase().includes(clienteQuery.toLowerCase()) ||
    (c.identificacion && c.identificacion.includes(clienteQuery))
  );

  const equiposFiltrados = equipos.filter(e =>
    (e.serie && e.serie.toLowerCase().includes(equipoQuery.toLowerCase())) ||
    (e.marca && e.marca.toLowerCase().includes(equipoQuery.toLowerCase())) ||
    (e.modelo && e.modelo.toLowerCase().includes(equipoQuery.toLowerCase()))
  );

  const selectedEquipo = equipoId ? equipos.find(e => e.id === equipoId) : null;

  // ── Handlers ─────────────────────────────────────────────────
  const handleSelectCliente = (cli) => {
    setClienteId(cli.id);
    setClienteNombre(cli.nombre || "");
    setClienteApellido(cli.apellido || "");
    setClienteTelefono(cli.telefono || "");
    setClienteEmail(cli.email || "");
    setClienteIdentificacion(cli.identificacion || "");
    setClienteQuery(cli.nombre + " " + (cli.apellido || ""));
    setShowClienteDropdown(false);
  };

  const handleSelectEquipo = (eq) => {
    setEquipoId(eq.id);
    setEquipoQuery(eq.marca + " " + eq.modelo);
    setShowEquipoDropdown(false);
  };

  const handleSaveQuickClient = async () => {
    if (!newClient.nombre || !newClient.identificacion || !newClient.telefono) {
      alert("Por favor complete nombre, cédula y teléfono.");
      return;
    }
    const cli = await addCliente(newClient);
    handleSelectCliente(cli);
    setShowClientForm(false);
    setNewClient({ tipo_cliente: "Persona", nombre: "", identificacion: "", telefono: "", email: "" });
  };

  const handleSaveQuickEquipment = async () => {
    if (!newEquipo.marca || !newEquipo.modelo || !newEquipo.serie) {
      alert("Por favor complete marca, modelo y número de serie.");
      return;
    }
    const eq = await addEquipo({ ...newEquipo, cliente_id: clienteId });
    handleSelectEquipo(eq);
    setShowEquipmentForm(false);
    setNewEquipo({ tipo: "Laptop / Portátil", marca: "", modelo: "", serie: "" });
  };

  const handleSubmit = async () => {
    if (!clienteId || !equipoId || !trabajo.trim()) {
      alert("Por favor complete Cliente, Equipo y Trabajo solicitado.");
      return;
    }

    setErrorOrden("");
    setGuardandoOrden(true);
    try {
    const nuevaOrden = await addOrden({
      cliente_id: clienteId,
      equipo_id: equipoId,
      referencia_externa: referenciaExterna,
      prioridad,
      area,
      estado_actual: estado,
      etapa_categoria: area.toUpperCase(),
      responsable,
      trabajo_solicitado: trabajo,
      descripcion_estado: descripcion,
      diagnostico: diagnosticoSeleccion === "Sí" ? diagnosticoTexto : "",
      garantia: tieneGarantia,
      adelanto: adelantoNum,
      anotaciones
    });

    if (onOrdenCreada) onOrdenCreada(nuevaOrden);

    // Abrir el expediente recién creado directamente. Así se conserva el
    // identificador generado por el contexto y se evita obligar al usuario a
    // encontrar la orden de nuevo en el listado antes de ver su detalle.
    navigate(`/ordenes/${nuevaOrden.numero}`, { replace: true });
    } catch (error) {
      setErrorOrden(error.message || "No fue posible guardar la orden en el servidor local.");
    } finally {
      setGuardandoOrden(false);
    }
  };

  // ── Helper: initials from name ───────────────────────────────
  const getInitials = (nombre, apellido) => {
    const n = (nombre || "").charAt(0).toUpperCase();
    const a = (apellido || "").charAt(0).toUpperCase();
    return n + a || "??";
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div
      className="nueva-orden-view min-h-screen flex flex-col pb-28 md:pb-24"
      style={{ backgroundColor: "#f0f4f9", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#1e293b" }}
      onClick={() => { setShowClienteDropdown(false); setShowEquipoDropdown(false); }}
    >
      {/* ═══════════════ HEADER / TOPBAR ═══════════════ */}
      <header className="hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group focus:outline-none" onClick={e => e.preventDefault()}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-sm">
                <OptifixLogo size={40} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none text-slate-900">
                  Opti<span className="text-sky-600">Fix</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-mono mt-0.5">
                  OptiFix
                </span>
              </div>
            </a>
            {/* Context badges */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 font-mono">
                ERP v3.4
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                #ORD-NUEVA
              </span>
            </div>
          </div>

          {/* STEPPER (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-xs text-sky-700 border border-slate-200/60">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Cliente & Contacto</span>
            </div>
            <i className="ph ph-caret-right text-slate-400 text-xs"></i>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Dispositivo</span>
            </div>
            <i className="ph ph-caret-right text-slate-400 text-xs"></i>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Diagnóstico & Costos</span>
            </div>
          </nav>

          {/* CLOSE BUTTON */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <i className="ph ph-x text-lg"></i>
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Nueva Orden de Servicio Técnico</h1>
              <span className="md:hidden px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">#NUEVA</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Recepción, verificación del cliente y diagnóstico preliminar en mostrador.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300/80 rounded-xl transition-colors">
              <i className="ph ph-barcode text-base text-sky-600"></i>
              <span>Escanear Código / QR</span>
            </button>
          </div>
        </div>

        {/* ═══ GRID: CLIENTE (Left) & DISPOSITIVO (Right) ═══ */}
        <div className="grid grid-cols-1 gap-6">

          {/* ─── CARD 1: CLIENTE SOLICITANTE ─── */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-700 p-5 sm:p-6 shadow-xs dark:shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-600"></div>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                    <i className="ph ph-user"></i>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">1. Datos del Cliente</h2>
                  <span className="text-rose-500 font-bold">*</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClientForm(!showClientForm)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/70 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <i className="ph ph-user-plus"></i>
                  <span>+ Nuevo Cliente</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-4" onClick={e => e.stopPropagation()}>
                <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
                <input
                  type="text"
                  placeholder="Buscar por Nombre, Cédula / DNI o Teléfono..."
                  value={clienteQuery}
                  onChange={e => { setClienteQuery(e.target.value); setClienteId(""); setShowClienteDropdown(true); }}
                  onFocus={() => setShowClienteDropdown(true)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
                />
                {clienteQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => { setClienteQuery(""); setClienteId(""); }}
                    type="button"
                  >
                    <i className="ph ph-x-circle text-base"></i>
                  </button>
                )}
                {/* Dropdown */}
                {showClienteDropdown && clienteQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    {clientesFiltrados.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCliente(c)}
                        className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <div className="font-semibold text-sm text-slate-900">{c.nombre} {c.apellido}</div>
                        <div className="text-xs text-slate-500 font-mono">{c.identificacion} • {c.telefono}</div>
                      </div>
                    ))}
                    {clientesFiltrados.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">No hay resultados</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected client card */}
              {clienteId && (
                <div className="bg-gradient-to-br from-slate-50 to-sky-50/30 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {getInitials(clienteNombre, clienteApellido)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">{clienteNombre} {clienteApellido}</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <i className="ph ph-check-circle"></i> Verificado
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">Cédula: {clienteIdentificacion} • Persona Física</p>
                      </div>
                    </div>
                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-sky-600 p-1.5 rounded-lg hover:bg-white"
                      onClick={() => { setClienteId(""); setClienteQuery(""); }}
                      type="button"
                    >
                      <i className="ph ph-pencil-simple text-base"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <i className="ph ph-whatsapp-logo text-emerald-600 text-base"></i>
                      <span className="font-mono font-medium">{clienteTelefono}</span>
                      <span className="text-[10px] bg-slate-200 px-1 rounded text-slate-600">Principal</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 truncate">
                      <i className="ph ph-envelope text-slate-400 text-base"></i>
                      <span className="truncate">{clienteEmail || "Sin correo"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick create client form */}
              {showClientForm && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 bg-slate-50/60 p-3.5 rounded-xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <i className="ph ph-identification-card text-sky-600"></i> Ficha Rápida de Cliente
                    </span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Se guardará automáticamente
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Cliente</label>
                      <select value={newClient.tipo_cliente} onChange={e => setNewClient({ ...newClient, tipo_cliente: e.target.value })} className="w-full text-xs rounded-lg border-slate-300 py-1.5 bg-white border px-2">
                        <option value="Persona">Persona</option>
                        <option value="Empresa">Empresa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">DNI / Cédula <span className="text-rose-500">*</span></label>
                      <input value={newClient.identificacion} onChange={e => setNewClient({ ...newClient, identificacion: e.target.value })} className="w-full text-xs font-mono rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="Ej: 1-0988-0234" type="text" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre <span className="text-rose-500">*</span></label>
                      <input value={newClient.nombre} onChange={e => setNewClient({ ...newClient, nombre: e.target.value })} className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="Nombre" type="text" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono (WhatsApp) <span className="text-rose-500">*</span></label>
                      <input value={newClient.telefono} onChange={e => setNewClient({ ...newClient, telefono: e.target.value })} className="w-full text-xs font-mono rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="+506 8888-8888" type="text" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                      <input value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="cliente@correo.com" type="email" />
                    </div>
                  </div>
                  <button onClick={handleSaveQuickClient} className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-lg mt-1 transition-colors" type="button">Guardar y Seleccionar Cliente</button>
                </div>
              )}
            </div>

            {/* Notification bar */}
            {clienteId && (
              <div className="mt-4 flex items-center justify-between text-xs bg-emerald-50/70 border border-emerald-200/80 px-3 py-2 rounded-xl text-emerald-800">
                <div className="flex items-center gap-2">
                  <i className="ph ph-bell-ringing text-emerald-600 text-base"></i>
                  <span>Notificaciones automáticas por <strong>WhatsApp & SMS</strong> activadas.</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-700">Listo</span>
              </div>
            )}
          </section>

          {/* ─── CARD 2: DISPOSITIVO / EQUIPO ─── */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-700 p-5 sm:p-6 shadow-xs dark:shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 to-indigo-600"></div>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                    <i className="ph ph-laptop"></i>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">2. Datos del Dispositivo</h2>
                  <span className="text-rose-500 font-bold">*</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEquipmentForm(!showEquipmentForm)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/70 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <i className="ph ph-plus-circle"></i>
                  <span>+ Registrar Equipo</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-4" onClick={e => e.stopPropagation()}>
                <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
                <input
                  type="text"
                  placeholder="Buscar por N° Serie, Marca o Modelo..."
                  value={equipoQuery}
                  onChange={e => { setEquipoQuery(e.target.value); setEquipoId(""); setShowEquipoDropdown(true); }}
                  onFocus={() => setShowEquipoDropdown(true)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
                />
                {equipoQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => { setEquipoQuery(""); setEquipoId(""); }}
                    type="button"
                  >
                    <i className="ph ph-x-circle text-base"></i>
                  </button>
                )}
                {/* Dropdown */}
                {showEquipoDropdown && equipoQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    {equiposFiltrados.map(e => (
                      <div
                        key={e.id}
                        onClick={() => handleSelectEquipo(e)}
                        className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <div className="font-semibold text-sm text-slate-900">{e.marca} {e.modelo}</div>
                        <div className="text-xs text-slate-500 font-mono">S/N: {e.serie} • {e.tipo || "Equipo"}</div>
                      </div>
                    ))}
                    {equiposFiltrados.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">No hay resultados</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected equipment card */}
              {selectedEquipo && (
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200/90 border border-slate-300 text-slate-500 flex items-center justify-center text-xl shrink-0 relative overflow-hidden">
                        <i className="ph ph-device-mobile-camera"></i>
                        <span className="absolute bottom-0 right-0 bg-sky-600 text-white p-0.5 rounded-tl text-[9px]">
                          <i className="ph ph-check"></i>
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">{selectedEquipo.marca} {selectedEquipo.modelo}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">{selectedEquipo.tipo || "Equipo"}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">Marca: {selectedEquipo.marca} • Modelo: {selectedEquipo.modelo}</p>
                      </div>
                    </div>
                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-sky-600 p-1.5 rounded-lg hover:bg-white"
                      onClick={() => { setEquipoId(""); setEquipoQuery(""); }}
                      type="button"
                    >
                      <i className="ph ph-pencil-simple text-base"></i>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="text-slate-400">S/N:</span>
                      <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{selectedEquipo.serie}</span>
                    </div>
                    {selectedEquipo.falla_reportada && (
                      <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 text-[11px]">
                        <i className="ph ph-warning-circle"></i>
                        <span>{selectedEquipo.falla_reportada}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick create equipment form */}
              {showEquipmentForm && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 bg-slate-50/60 p-3.5 rounded-xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <i className="ph ph-cpu text-sky-600"></i> Registrar Nuevo Dispositivo
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Categoría / Tipo <span className="text-rose-500">*</span></label>
                      <select value={newEquipo.tipo} onChange={e => setNewEquipo({ ...newEquipo, tipo: e.target.value })} className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white">
                        <option value="Laptop / Portátil">Laptop / Portátil</option>
                        <option value="Smartphone / Móvil">Smartphone / Móvil</option>
                        <option value="Consola de Videojuego">Consola de Videojuego</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Monitor / TV">Monitor / TV</option>
                        <option value="Genérico / Otro">Genérico / Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marca <span className="text-rose-500">*</span></label>
                      <input value={newEquipo.marca} onChange={e => setNewEquipo({ ...newEquipo, marca: e.target.value })} className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="Ej: Apple, Lenovo, HP" type="text" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Modelo <span className="text-rose-500">*</span></label>
                      <input value={newEquipo.modelo} onChange={e => setNewEquipo({ ...newEquipo, modelo: e.target.value })} className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="Ej: MacBook Pro 14" type="text" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">N° de Serie Físico <span className="text-rose-500">*</span></label>
                      <input value={newEquipo.serie} onChange={e => setNewEquipo({ ...newEquipo, serie: e.target.value })} className="w-full text-xs font-mono rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="Escanear o digitar SN" type="text" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accesorios Dejados</label>
                      <input className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white" placeholder="Cargador original..." type="text" />
                    </div>
                  </div>
                  <button onClick={handleSaveQuickEquipment} className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-lg mt-1 transition-colors" type="button">Guardar y Seleccionar Equipo</button>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <label className="flex min-h-11 items-center gap-3 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tieneGarantia}
                  onChange={(event) => setTieneGarantia(event.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-teal-500 dark:focus:ring-teal-500"
                />
                <span>El artículo tiene garantía activa</span>
              </label>
              <p className="self-center text-[11px] text-slate-500 sm:text-right">Se registrará en los datos de la orden.</p>
            </div>

            {/* History link */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <i className="ph ph-clock-counter-clockwise text-slate-400"></i>
                <span>Historial previo en taller: <strong>{equipoId ? "consultar" : "—"}</strong></span>
              </div>
              {equipoId && (
                <button type="button" className="text-sky-600 hover:underline font-semibold">Ver historial</button>
              )}
            </div>
          </section>
        </div>

        {/* ═══ CENTRAL SECTION: TABS + FORM ═══ */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-xs dark:shadow-xl p-5 sm:p-7 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-gray-700 pb-2 mb-4">3. Estado Inicial y Recepción</h2>
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Row 1: Priority, Area, Status, Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Prioridad de Atención <span className="text-slate-400 font-normal">(SLA)</span>
                  </label>
                  <div className="relative">
                    <select value={prioridad} onChange={e => setPrioridad(e.target.value)} className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                      <option value="Baja">Baja (72-96 hrs)</option>
                      <option value="Normal">Normal (24-48 hrs)</option>
                      <option value="Alta">Alta / Urgente (Mismo día)</option>
                      <option value="Urgente">Garantía / Express</option>
                    </select>
                    <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Área / Mesa de Trabajo</label>
                  <div className="relative">
                    <select value={area} onChange={e => setArea(e.target.value)} className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                      <option value="Entrada">Mesa de Entrada / Recepción</option>
                      <option value="Taller">Laboratorio Hardware L2</option>
                      <option value="Micro">Microelectrónica & SMD L3</option>
                      <option value="Software">Software & Recuperación</option>
                      <option value="QC">Control de Calidad (QC)</option>
                    </select>
                    <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Estado Inicial</label>
                  <div className="relative">
                    <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-sky-700 bg-sky-50/40 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                      <option value="RECEPCIÓN">RECEPCIÓN / POR REVISAR</option>
                      <option value="DIAGNÓSTICO">EN DIAGNÓSTICO</option>
                      <option value="PRESUPUESTO">PRESUPUESTO PENDIENTE</option>
                      <option value="APROBADO">APROBADO / EN ESPERA REPUESTO</option>
                    </select>
                    <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Técnico Responsable</label>
                  <div className="relative">
                    <select value={responsable} onChange={e => setResponsable(e.target.value)} className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                      <option value="Mario Soto (Técnico Master - L2)">Mario Soto (Técnico Master - L2)</option>
                      <option value="Ana Brenes (Especialista Apple)">Ana Brenes (Especialista Apple)</option>
                      <option value="Kevyn Jiménez (Recepción & Triage)">Kevyn Jiménez (Recepción & Triage)</option>
                      <option value="Sin Asignar (Cola General)">Auto-asignar según carga</option>
                    </select>
                    <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                  </div>
                </div>
              </div>

              {/* Row 2: Work description + Visual inspection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Trabajo Solicitado / Motivo de Ingreso</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <button type="button" className="hover:text-sky-600 flex items-center gap-1">
                        <i className="ph ph-sparkle text-amber-500"></i> Auto-resumen
                      </button>
                      <span>•</span>
                      <button type="button" className="hover:text-sky-600 flex items-center gap-1">
                        <i className="ph ph-microphone"></i> Voz
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={trabajo}
                    onChange={e => setTrabajo(e.target.value)}
                    placeholder="Describa con precisión la falla reportada por el cliente..."
                    className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-normal"
                  ></textarea>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Inspección Visual & Accesorios Recibidos</span>
                    </label>
                    <button type="button" className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                      <i className="ph ph-list-plus"></i> Cargar Checklist
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Indique rayones, golpes, cargadores, cables o accesorios incluidos..."
                    className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-normal"
                  ></textarea>
                </div>
              </div>

              {/* Row 3: diagnóstico y adelanto inicial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Diagnóstico Previo</label>
                  <div className="relative">
                    <select value={diagnosticoSeleccion} onChange={e => setDiagnosticoSeleccion(e.target.value)} className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                      <option value="No">No (Falla identificada)</option>
                      <option value="Sí">Sí (Requiere laboratorio)</option>
                      <option value="Aprobado">Aprobado en mesa</option>
                    </select>
                    <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Adelanto / Revisión</label>
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono">CRC (₡)</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₡</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={adelanto}
                      onChange={e => setAdelanto(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-7 pr-3 py-2 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Diagnóstico inicial</label>
                  <textarea value={diagnosticoTexto} onChange={e => setDiagnosticoTexto(e.target.value)} className="w-full min-h-32 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-800 placeholder:text-slate-400" placeholder="Detalles del diagnóstico técnico de entrada..." />
                  <AsistenteDiagnostico fallaReportada={trabajo || diagnosticoTexto} equipo={selectedEquipo} onAplicar={(resultado) => setDiagnosticoTexto(`${diagnosticoTexto}${diagnosticoTexto ? "\n\n" : ""}Sugerencia IA:\n${resultado.posiblesCausas?.join("\n") || ""}`)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Notas de recepción</label>
                  <textarea value={anotaciones} onChange={e => setAnotaciones(e.target.value)} className="w-full min-h-32 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-800 placeholder:text-slate-400" placeholder="Anotaciones internas y checklist de recepción..." />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════ STICKY FOOTER ═══════════════ */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Live summary */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-500 font-medium">Resumen:</span>
              <span className="font-bold text-slate-800">{clienteNombre || "—"}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-600 hidden md:inline">
                {selectedEquipo ? `${selectedEquipo.marca} ${selectedEquipo.modelo}` : "—"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {errorOrden && <p className="w-full text-xs font-semibold text-red-600" role="alert">{errorOrden}</p>}
          <div className="flex items-center justify-end w-full sm:w-auto gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
            >
              <i className="ph ph-floppy-disk text-base"></i>
              <span>Borrador</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={guardandoOrden}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 active:scale-[0.98] rounded-xl shadow-md shadow-sky-600/20 transition-all"
            >
              <i className="ph ph-printer text-base"></i>
              <span>{guardandoOrden ? "Guardando en JSON Server..." : "Crear Orden & Imprimir Boleta"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
