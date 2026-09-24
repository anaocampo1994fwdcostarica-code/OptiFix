import React, { useState } from "react";
import { FaTrash, FaPlus, FaInfoCircle, FaCamera } from "react-icons/fa";
import "./CreandoContactoModal.css";

export default function CreandoContactoModal({ isOpen, onClose, onGuardar }) {
  const [tipoCliente, setTipoCliente] = useState("Persona");
  const [ci, setCi] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");

  const [correos, setCorreos] = useState([{ id: Date.now(), valor: "" }]);
  const [telefonos, setTelefonos] = useState([{ id: Date.now() + 1, valor: "", isDefault: true }]);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleAddCorreo = () => {
    if (correos.length < 4) {
      setCorreos([...correos, { id: Date.now(), valor: "" }]);
    }
  };

  const handleRemoveCorreo = (id) => {
    setCorreos(correos.filter(c => c.id !== id));
  };

  const handleChangeCorreo = (id, valor) => {
    setCorreos(correos.map(c => c.id === id ? { ...c, valor } : c));
  };

  const handleAddTelefono = () => {
    if (telefonos.length < 4) {
      setTelefonos([...telefonos, { id: Date.now(), valor: "", isDefault: false }]);
    }
  };

  const handleRemoveTelefono = (id) => {
    setTelefonos(telefonos.filter(t => t.id !== id));
  };

  const handleChangeTelefono = (id, valor) => {
    setTelefonos(telefonos.map(t => t.id === id ? { ...t, valor } : t));
  };

  const handleSetDefaultTelefono = (id) => {
    setTelefonos(telefonos.map(t => ({ ...t, isDefault: t.id === id })));
  };

  const validate = () => {
    const errs = {};
    if (!ci.trim()) errs.ci = "Obligatorio";
    if (!nombre.trim()) errs.nombre = "Obligatorio";
    if (!apellido.trim()) errs.apellido = "Obligatorio";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const emailList = correos.map(c => c.valor).filter(v => v.trim());
    const phoneList = telefonos.map(t => t.valor).filter(v => v.trim());
    const defaultPhone = telefonos.find(t => t.isDefault)?.valor || phoneList[0] || "";
    const primaryEmail = emailList[0] || "";

    onGuardar({
      tipo_cliente: tipoCliente,
      identificacion: ci,
      nombre,
      apellido,
      direccion,
      notas,
      email: primaryEmail,
      telefono: defaultPhone,
      correos: emailList,
      telefonos: phoneList
    });
  };

  const hasDefaultPhone = telefonos.some(t => t.isDefault && t.valor.trim() !== "");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box contact-modal" style={{ maxWidth: "800px", padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-color)" }}>Creando Contacto</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="contact-modal-body" style={{ padding: "24px", display: "flex", gap: "24px" }}>
          {/* Columna Izquierda (Foto) */}
          <div className="contact-photo-column" style={{ width: "150px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div className="contact-photo-placeholder" style={{ 
              width: "140px", height: "140px", backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", borderRadius: "8px",
              display: "flex", justifyContent: "center", alignItems: "center",
              color: "#94a3b8"
            }}>
              <FaCamera size={48} />
            </div>
            <button className="btn-outline-icon" style={{ padding: "6px 16px", borderRadius: "6px" }}>✎</button>
          </div>

          {/* Columna Derecha (Formulario) */}
          <div className="contact-form-column" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-grid-2">
              <div className="floating-group">
                <label>Tipo de Cliente</label>
                <select value={tipoCliente} onChange={e => setTipoCliente(e.target.value)}>
                  <option>Persona</option>
                  <option>Empresa</option>
                </select>
              </div>
              <div className="floating-group">
                <label>CI <span className="req">*</span></label>
                <input 
                  className={errors.ci ? "input-error" : ""} 
                  placeholder="CI" 
                  value={ci} onChange={e => { setCi(e.target.value); setErrors({...errors, ci: null}); }} 
                />
              </div>

              <div className="floating-group">
                <label>Nombre <span className="req">*</span></label>
                <input 
                  className={errors.nombre ? "input-error" : ""} 
                  value={nombre} onChange={e => { setNombre(e.target.value); setErrors({...errors, nombre: null}); }} 
                />
              </div>
              <div className="floating-group">
                <label>Apellido <span className="req">*</span></label>
                <input 
                  className={errors.apellido ? "input-error" : ""} 
                  value={apellido} onChange={e => { setApellido(e.target.value); setErrors({...errors, apellido: null}); }} 
                />
              </div>
            </div>

            <div className="floating-group">
              <label>Dirección</label>
              <input value={direccion} onChange={e => setDireccion(e.target.value)} />
            </div>

            <div className="floating-group">
              <label>Nota/observación</label>
              <textarea rows={3} value={notas} onChange={e => setNotas(e.target.value)} />
            </div>

            {!hasDefaultPhone && (
              <div style={{ backgroundColor: "#ea580c", color: "white", padding: "12px", borderRadius: "6px", textAlign: "center", fontWeight: 500, fontSize: "14px" }}>
                No tiene teléfono predeterminado para envío de SMS y Whatsapp.
              </div>
            )}

            <div className="contact-lists" style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
              {/* Correos */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--text-color)", fontSize: "13px" }}>
                    CORREOS <FaInfoCircle color="#94a3b8" />
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", backgroundColor: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      {correos.length}/4
                    </span>
                    <button className="btn-outline-icon" style={{ padding: "4px" }} onClick={handleAddCorreo} disabled={correos.length >= 4}>
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {correos.map(c => (
                    <div key={c.id} style={{ display: "flex", gap: "0" }}>
                      <input 
                        className="form-input" 
                        placeholder="Correo electrónico" 
                        value={c.valor} onChange={e => handleChangeCorreo(c.id, e.target.value)} 
                        style={{ borderRight: "none", borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <button 
                        style={{ padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-color)", borderLeft: "1px solid var(--border-color)", borderTopRightRadius: "6px", borderBottomRightRadius: "6px", cursor: "pointer" }}
                        onClick={() => handleRemoveCorreo(c.id)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teléfonos */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--text-color)", fontSize: "13px" }}>
                    TELÉFONOS <FaInfoCircle color="#94a3b8" />
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", backgroundColor: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      {telefonos.length}/4
                    </span>
                    <button className="btn-outline-icon" style={{ padding: "4px" }} onClick={handleAddTelefono} disabled={telefonos.length >= 4}>
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {telefonos.map(t => (
                    <div key={t.id} style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
                      <div style={{ padding: "0 12px", display: "flex", alignItems: "center", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRight: "none", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px" }}>
                        <input type="radio" checked={t.isDefault} onChange={() => handleSetDefaultTelefono(t.id)} />
                      </div>
                      <input 
                        className="form-input" 
                        placeholder="Teléfono" 
                        value={t.valor} onChange={e => handleChangeTelefono(t.id, e.target.value)} 
                        style={{ borderRadius: 0, borderLeft: "1px solid var(--border-color)" }}
                      />
                      <button 
                        style={{ padding: "0 12px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-color)", borderLeft: "none", borderTopRightRadius: "6px", borderBottomRightRadius: "6px", cursor: "pointer" }}
                        onClick={() => handleRemoveTelefono(t.id)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="contact-modal-footer" style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "white" }}>
          <button className="btn-secondary" style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{ backgroundColor: "#1773c3", color: "white", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, border: "none", display: "flex", alignItems: "center", gap: "6px" }} onClick={handleSubmit}>
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
