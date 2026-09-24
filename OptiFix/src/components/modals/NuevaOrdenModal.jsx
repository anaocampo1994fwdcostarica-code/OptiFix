import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMagic, FaPlus, FaSearch, FaTimes, FaCalendarAlt, FaClipboardList, FaNotesMedical, FaRegCommentDots } from "react-icons/fa";
import { useWorkshop } from "../../context/WorkshopContext.jsx";
import CreandoContactoModal from "./CreandoContactoModal.jsx";
import CreandoEquipoModal from "./CreandoEquipoModal.jsx";

export default function NuevaOrdenModal({ isOpen, onClose, onOrdenCreada }) {
  const { clientes, equipos, addCliente, addEquipo, addOrden } = useWorkshop();

  const [activeTab, setActiveTab] = useState("General");
  
  // Modals state
  const [showContactoModal, setShowContactoModal] = useState(false);
  const [showEquipoModal, setShowEquipoModal] = useState(false);

  // Form state - General
  const [clienteId, setClienteId] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [referenciaExterna, setReferenciaExterna] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [area, setArea] = useState("Entrada");
  const [estado, setEstado] = useState("RECEPCIÓN");
  const [responsable, setResponsable] = useState("SERVITOTAL 800");
  const [trabajo, setTrabajo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [diagnosticoSeleccion, setDiagnosticoSeleccion] = useState("No");
  const [garantia, setGarantia] = useState("No");
  const [fechaPrometida, setFechaPrometida] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [adelanto, setAdelanto] = useState("");

  // Form state - Tabs
  const [diagnosticoTexto, setDiagnosticoTexto] = useState("");
  const [anotaciones, setAnotaciones] = useState("");

  const [errors, setErrors] = useState({});

  // Search state
  const [clienteQuery, setClienteQuery] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [equipoQuery, setEquipoQuery] = useState("");
  const [showEquipoDropdown, setShowEquipoDropdown] = useState(false);

  const clienteRef = useRef(null);
  const equipoRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) setShowClienteDropdown(false);
      if (equipoRef.current && !equipoRef.current.contains(e.target)) setShowEquipoDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("General");
      setClienteId("");
      setClienteNombre("");
      setClienteApellido("");
      setClienteTelefono("");
      setEquipoId("");
      setClienteQuery("");
      setEquipoQuery("");
      setReferenciaExterna("");
      setPrioridad("Normal");
      setArea("Entrada");
      setEstado("RECEPCIÓN");
      setResponsable("SERVITOTAL 800");
      setTrabajo("");
      setDescripcion("");
      setDiagnosticoSeleccion("No");
      setGarantia("No");
      setFechaPrometida("");
      setPresupuesto("");
      setAdelanto("");
      setDiagnosticoTexto("");
      setAnotaciones("");
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search handlers
  const clientesFiltrados = clientes.filter(c => 
    (c.nombre + " " + (c.apellido || "")).toLowerCase().includes(clienteQuery.toLowerCase()) || 
    (c.identificacion && c.identificacion.includes(clienteQuery))
  );

  const equiposFiltrados = equipos.filter(e => 
    (e.serie && e.serie.toLowerCase().includes(equipoQuery.toLowerCase())) ||
    (e.marca && e.marca.toLowerCase().includes(equipoQuery.toLowerCase()))
  );

  const handleSelectCliente = (cli) => {
    setClienteId(cli.id);
    setClienteNombre(cli.nombre || "");
    setClienteApellido(cli.apellido || "");
    setClienteTelefono(cli.telefono || "");
    setClienteQuery(`${cli.nombre} ${cli.apellido || ""} (${cli.identificacion})`);
    setShowClienteDropdown(false);
    setErrors({ ...errors, cliente: null });
  };

  const handleSelectEquipo = (eq) => {
    setEquipoId(eq.id);
    setEquipoQuery(`${eq.marca} ${eq.modelo} - ${eq.serie}`);
    setShowEquipoDropdown(false);
    setErrors({ ...errors, equipo: null });
  };

  const handleGuardarContacto = (data) => {
    const nuevo = addCliente(data);
    handleSelectCliente(nuevo);
    setShowContactoModal(false);
  };

  const handleGuardarEquipo = (data) => {
    // Si se requiere un cliente_id para el equipo, usamos el seleccionado, o vacío
    const nuevo = addEquipo({ ...data, cliente_id: clienteId });
    handleSelectEquipo(nuevo);
    setShowEquipoModal(false);
  };

  const validate = () => {
    const errs = {};
    if (!clienteId && !clienteNombre.trim()) errs.cliente = "Obligatorio";
    if (!clienteId && !clienteApellido.trim()) errs.apellidoCliente = "Obligatorio";
    if (!clienteId && !clienteTelefono.trim()) errs.telefonoCliente = "Obligatorio";
    if (!equipoId) errs.equipo = "Obligatorio";
    if (!trabajo.trim()) errs.trabajo = "Obligatorio";
    setErrors(errs);
    if (Object.keys(errs).length > 0) setActiveTab("General");
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let clienteIdFinal = clienteId;
    if (!clienteIdFinal) {
      const nuevo = addCliente({
        tipo_cliente: "Persona",
        identificacion: "",
        nombre: clienteNombre.trim(),
        apellido: clienteApellido.trim(),
        telefono: clienteTelefono.trim(),
        email: "",
        direccion: "",
        notas: "",
        correos: [],
        telefonos: [clienteTelefono.trim()]
      });
      clienteIdFinal = nuevo.id;
    }

    const nuevaOrden = addOrden({
      cliente_id: clienteIdFinal,
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
      garantia: garantia === "Sí",
      fecha_prometida: fechaPrometida,
      presupuesto,
      adelanto,
      anotaciones // Necesita ser manejado en WorkshopContext o como nota
    });

    if (onOrdenCreada) onOrdenCreada(nuevaOrden);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
        <div className="modal-box" style={{ maxWidth: "1000px", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "90vh" }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-color)" }}>Creando Orden</h2>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", padding: "0 24px", backgroundColor: "var(--bg-secondary)" }}>
            <button 
              style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", borderBottom: activeTab === "General" ? "2px solid #2563eb" : "2px solid transparent", color: activeTab === "General" ? "#2563eb" : "var(--text-color)", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", fontWeight: activeTab === "General" ? 600 : 400 }}
              onClick={() => setActiveTab("General")}
            >
              <FaClipboardList /> General
            </button>
            <button 
              style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", borderBottom: activeTab === "Diagnóstico" ? "2px solid #2563eb" : "2px solid transparent", color: activeTab === "Diagnóstico" ? "#2563eb" : "var(--text-color)", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", fontWeight: activeTab === "Diagnóstico" ? 600 : 400 }}
              onClick={() => setActiveTab("Diagnóstico")}
            >
              <FaNotesMedical /> Diagnóstico
            </button>
            <button 
              style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", borderBottom: activeTab === "Anotaciones" ? "2px solid #2563eb" : "2px solid transparent", color: activeTab === "Anotaciones" ? "#2563eb" : "var(--text-color)", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", fontWeight: activeTab === "Anotaciones" ? 600 : 400 }}
              onClick={() => setActiveTab("Anotaciones")}
            >
              <FaRegCommentDots /> Anotaciones
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
            {activeTab === "General" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Datos generales Header & Referencia Externa */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-color)", margin: 0 }}>Datos generales</h3>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>Completar la información básica de la orden.</p>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b", display: "flex", justifyContent: "flex-end" }}>Referencia externa ℹ️</label>
                    <input className="form-input" style={{ width: "200px" }} value={referenciaExterna} onChange={e => setReferenciaExterna(e.target.value)} />
                  </div>
                </div>

                {/* Cliente & Equipo */}
                <div className="form-grid-2">
                  <div ref={clienteRef} style={{ position: "relative" }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Cliente <span className="req" style={{ color: "#ef4444" }}>*</span></label>
                    <div style={{ display: "flex" }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRight: "none", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px" }}>
                        <FaSearch color="#94a3b8" />
                      </div>
                      <input 
                        className={`form-input ${errors.cliente ? "input-error" : ""}`} 
                        style={{ borderRadius: 0 }}
                        placeholder="Buscar por nombre o DNI" 
                        value={clienteQuery} onChange={e => { setClienteQuery(e.target.value); setClienteId(""); }}
                        onFocus={() => setShowClienteDropdown(true)}
                      />
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderLeft: "none", borderRight: "none", cursor: "pointer" }}>
                        <span style={{ fontSize: "10px" }}>▼</span>
                      </div>
                      <button 
                        style={{ padding: "0 16px", backgroundColor: "#2563eb", border: "1px solid #2563eb", color: "white", borderTopRightRadius: "6px", borderBottomRightRadius: "6px", cursor: "pointer" }}
                        onClick={() => setShowContactoModal(true)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {showClienteDropdown && clienteQuery && (
                      <div className="marca-dropdown" style={{ zIndex: 1001 }}>
                        {clientesFiltrados.map(c => (
                          <div key={c.id} className="marca-option" onClick={() => handleSelectCliente(c)}>
                            {c.nombre} {c.apellido || ""} ({c.identificacion})
                          </div>
                        ))}
                        {clientesFiltrados.length === 0 && <div style={{ padding: "8px" }}>No se encontraron clientes</div>}
                      </div>
                    )}
                  </div>

                  <div ref={equipoRef} style={{ position: "relative" }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Equipo <span className="req" style={{ color: "#ef4444" }}>*</span></label>
                    <div style={{ display: "flex" }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRight: "none", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px" }}>
                        <FaSearch color="#94a3b8" />
                      </div>
                      <input 
                        className={`form-input ${errors.equipo ? "input-error" : ""}`} 
                        style={{ borderRadius: 0 }}
                        placeholder="Buscar por n° serie o marca" 
                        value={equipoQuery} onChange={e => { setEquipoQuery(e.target.value); setEquipoId(""); }}
                        onFocus={() => setShowEquipoDropdown(true)}
                      />
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderLeft: "none", borderRight: "none", cursor: "pointer" }}>
                        <span style={{ fontSize: "10px" }}>▼</span>
                      </div>
                      <button 
                        style={{ padding: "0 16px", backgroundColor: "#2563eb", border: "1px solid #2563eb", color: "white", borderTopRightRadius: "6px", borderBottomRightRadius: "6px", cursor: "pointer" }}
                        onClick={() => setShowEquipoModal(true)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {showEquipoDropdown && equipoQuery && (
                      <div className="marca-dropdown" style={{ zIndex: 1001 }}>
                        {equiposFiltrados.map(e => (
                          <div key={e.id} className="marca-option" onClick={() => handleSelectEquipo(e)}>
                            {e.marca} {e.modelo} - {e.serie}
                          </div>
                        ))}
                        {equiposFiltrados.length === 0 && <div style={{ padding: "8px" }}>No se encontraron equipos</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Datos del cliente (nuevo): nombre, apellido y teléfono */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-secondary)" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Nombre <span className="req" style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      className={`form-input ${!clienteId && errors.cliente ? "input-error" : ""}`}
                      placeholder="Nombre del cliente"
                      value={clienteNombre}
                      onChange={e => { setClienteNombre(e.target.value); setClienteId(""); setErrors({ ...errors, cliente: null }); }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Apellido <span className="req" style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      className={`form-input ${!clienteId && errors.apellidoCliente ? "input-error" : ""}`}
                      placeholder="Apellido del cliente"
                      value={clienteApellido}
                      onChange={e => { setClienteApellido(e.target.value); setErrors({ ...errors, apellidoCliente: null }); }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}># Teléfono <span className="req" style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      className={`form-input ${!clienteId && errors.telefonoCliente ? "input-error" : ""}`}
                      type="tel"
                      placeholder="Ej: 8888-1234"
                      value={clienteTelefono}
                      onChange={e => { setClienteTelefono(e.target.value); setErrors({ ...errors, telefonoCliente: null }); }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1", fontSize: "12px", color: "#64748b" }}>
                    💡 Completá nombre, apellido y teléfono para crear un cliente nuevo
                    automáticamente. Si elegís uno existente del listado, sus datos se copiarán aquí.
                  </div>
                </div>

                {/* Priority, Area, Status, Responsable */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.5fr", gap: "16px" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Prioridad</label>
                    <select className="form-input" value={prioridad} onChange={e => setPrioridad(e.target.value)}>
                      <option>Baja</option>
                      <option>Normal</option>
                      <option>Alta</option>
                      <option>Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Área</label>
                    <select className="form-input" value={area} onChange={e => setArea(e.target.value)}>
                      <option>Entrada</option>
                      <option>Taller</option>
                      <option>Atención al cliente</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Estado</label>
                    <select className="form-input" value={estado} onChange={e => setEstado(e.target.value)}>
                      <option>RECEPCIÓN</option>
                      <option>REVISIÓN</option>
                      <option>ESPERANDO REPUESTOS</option>
                      <option>REPARADO</option>
                      <option>ENTREGADO</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Responsable</label>
                    <select className="form-input" value={responsable} onChange={e => setResponsable(e.target.value)}>
                      <option>SERVITOTAL 800</option>
                      <option>Técnico Principal</option>
                    </select>
                  </div>
                </div>

                {/* Trabajo & Descripcion */}
                <div className="form-grid-2">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Trabajo <span className="req" style={{ color: "#ef4444" }}>*</span></label>
                      <div style={{ display: "flex", gap: "4px", color: "#94a3b8" }}>
                        <FaMagic size={14} style={{ cursor: "pointer" }} />
                        <FaMicrophone size={14} style={{ cursor: "pointer" }} />
                      </div>
                    </div>
                    <textarea 
                      className={`form-input ${errors.trabajo ? "input-error" : ""}`} 
                      rows={3} 
                      placeholder="Trabajo a realizar" 
                      value={trabajo} onChange={e => { setTrabajo(e.target.value); setErrors({...errors, trabajo: null}); }} 
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Descripción (Estado general)</label>
                      <div style={{ display: "flex", gap: "4px", color: "#94a3b8" }}>
                        <FaMagic size={14} style={{ cursor: "pointer" }} />
                        <FaMicrophone size={14} style={{ cursor: "pointer" }} />
                      </div>
                    </div>
                    <textarea 
                      className="form-input" 
                      rows={3} 
                      value={descripcion} onChange={e => setDescripcion(e.target.value)} 
                    />
                  </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1.5fr 1.5fr", gap: "16px" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Diagnóstico</label>
                    <select className="form-input" value={diagnosticoSeleccion} onChange={e => setDiagnosticoSeleccion(e.target.value)}>
                      <option>No</option>
                      <option>Sí</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Garantía</label>
                    <select className="form-input" value={garantia} onChange={e => setGarantia(e.target.value)}>
                      <option>No</option>
                      <option>Sí</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Fecha prometida</label>
                    <div style={{ display: "flex" }}>
                      <input type="date" className="form-input" style={{ borderRight: "none", borderTopRightRadius: 0, borderBottomRightRadius: 0 }} value={fechaPrometida} onChange={e => setFechaPrometida(e.target.value)} />
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "#eff6ff", border: "1px solid var(--border-color)", borderLeft: "none", color: "#3b82f6", borderTopRightRadius: "6px", borderBottomRightRadius: "6px" }}>
                        <FaCalendarAlt />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Presupuesto</label>
                    <div style={{ display: "flex" }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRight: "none", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px", fontSize: "12px" }}>
                        ₡
                      </div>
                      <input className="form-input" type="number" style={{ borderRadius: 0 }} placeholder="0,00" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} />
                      <button style={{ padding: "0 12px", backgroundColor: "#eff6ff", border: "1px solid var(--border-color)", borderLeft: "none", color: "#3b82f6", borderTopRightRadius: "6px", borderBottomRightRadius: "6px", cursor: "pointer" }}>
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Adelanto</label>
                    <div style={{ display: "flex" }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRight: "none", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px", fontSize: "12px" }}>
                        ₡
                      </div>
                      <input className="form-input" type="number" style={{ borderRadius: 0, backgroundColor: "var(--bg-secondary)" }} placeholder="Importe" value={adelanto} onChange={e => setAdelanto(e.target.value)} />
                      <button style={{ padding: "0 12px", backgroundColor: "#eff6ff", border: "1px solid var(--border-color)", borderLeft: "none", color: "#3b82f6", borderTopRightRadius: "6px", borderBottomRightRadius: "6px", cursor: "pointer" }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "Diagnóstico" && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-color)", margin: "0 0 16px 0" }}>Diagnóstico Técnico</h3>
                <textarea 
                  className="form-input" 
                  style={{ flex: 1, minHeight: "300px", resize: "none" }} 
                  placeholder="Escriba aquí los detalles del diagnóstico..."
                  value={diagnosticoTexto}
                  onChange={e => setDiagnosticoTexto(e.target.value)}
                />
              </div>
            )}

            {activeTab === "Anotaciones" && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-color)", margin: "0 0 16px 0" }}>Anotaciones Privadas</h3>
                <textarea 
                  className="form-input" 
                  style={{ flex: 1, minHeight: "300px", resize: "none" }} 
                  placeholder="Anotaciones internas (no visibles para el cliente)..."
                  value={anotaciones}
                  onChange={e => setAnotaciones(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "var(--bg-secondary)" }}>
            <button className="btn-secondary" style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "none" }} onClick={onClose}>Cancelar</button>
            <button className="btn-primary" style={{ backgroundColor: "#2563eb" }} onClick={handleSubmit}>💾 Guardar Orden</button>
          </div>

        </div>
      </div>

      <CreandoContactoModal isOpen={showContactoModal} onClose={() => setShowContactoModal(false)} onGuardar={handleGuardarContacto} />
      <CreandoEquipoModal isOpen={showEquipoModal} onClose={() => setShowEquipoModal(false)} onGuardar={handleGuardarEquipo} />
    </>
  );
}
