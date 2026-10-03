import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaTimes } from "react-icons/fa";
import { useWorkshop } from "../../context/WorkshopContext.jsx";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";

export default function CreandoEquipoModal({ isOpen, onClose, onGuardar }) {
  const dialogRef = useFocusTrap(isOpen, onClose);
  const { marcas, addMarca } = useWorkshop();

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [tipo, setTipo] = useState("Genérico");
  const [serie, setSerie] = useState("");
  const [hasSerie, setHasSerie] = useState(true);
  const [observaciones, setObservaciones] = useState("");

  const [marcaQuery, setMarcaQuery] = useState("");
  const [marcaSugerencias, setMarcaSugerencias] = useState([]);
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const marcaRef = useRef(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    function handler(e) {
      if (marcaRef.current && !marcaRef.current.contains(e.target)) {
        setShowMarcaDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isOpen) return null;

  const handleMarcaInput = (val) => {
    setMarcaQuery(val);
    setMarca(val);
    if (val.trim().length < 1) {
      setMarcaSugerencias([]);
      setShowMarcaDropdown(false);
      return;
    }
    const filtradas = marcas.filter((m) =>
      m.toLowerCase().includes(val.toLowerCase())
    );
    setMarcaSugerencias(filtradas);
    setShowMarcaDropdown(true);
  };

  const selectMarca = (nombre) => {
    setMarcaQuery(nombre);
    setMarca(nombre);
    setShowMarcaDropdown(false);
    setErrors({ ...errors, marca: null });
  };

  const crearNuevaMarca = () => {
    const nombre = marcaQuery.trim();
    if (!nombre) return;
    addMarca(nombre);
    selectMarca(nombre);
  };

  const validate = () => {
    const errs = {};
    if (!marca.trim()) errs.marca = "Obligatorio";
    if (!modelo.trim()) errs.modelo = "Obligatorio";
    if (!tipo.trim()) errs.tipo = "Obligatorio";
    if (hasSerie && !serie.trim()) errs.serie = "Obligatorio";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onGuardar({
      marca,
      modelo,
      tipo,
      serie: hasSerie ? serie : "S/N",
      notas: observaciones,
      falla_reportada: "",
      estado_fisico: "BUEN ESTADO",
      accesorios: "NINGUNO"
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="create-equipment-title" className="modal-box" style={{ maxWidth: "650px", padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="create-equipment-title" style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-color)" }}>Creando Equipo</h2>
          <button type="button" aria-label="Cerrar creación de equipo" className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "24px", display: "flex", gap: "24px" }}>
          {/* Columna Izquierda (Foto) */}
          <div style={{ width: "150px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "140px", height: "140px", backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", borderRadius: "8px",
              display: "flex", justifyContent: "center", alignItems: "center",
              color: "#94a3b8"
            }}>
              <FaCamera size={48} />
            </div>
            <button type="button" aria-label="Agregar fotografía del equipo" className="btn-outline-icon" style={{ padding: "6px 16px", borderRadius: "6px" }}>✎</button>
          </div>

          {/* Columna Derecha (Formulario) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-grid-2">
              <div ref={marcaRef} style={{ position: "relative" }}>
                <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>
                  Marca <span className="req" style={{ color: "#ef4444" }}>*</span>
                </label>
                <input 
                  className={`form-input ${errors.marca ? "input-error" : ""}`} 
                  placeholder="Buscar Marca" 
                  value={marcaQuery} onChange={e => handleMarcaInput(e.target.value)} 
                  onFocus={() => { if (marcaQuery) setShowMarcaDropdown(true); }}
                />
                {showMarcaDropdown && (
                  <div className="marca-dropdown">
                    {marcaSugerencias.map((m) => (
                      <div key={m} className="marca-option" onClick={() => selectMarca(m)}>{m}</div>
                    ))}
                    {!marcaSugerencias.some((m) => m.toLowerCase() === marcaQuery.toLowerCase()) && marcaQuery.trim() && (
                      <div className="marca-option marca-option-create" onClick={crearNuevaMarca}>
                        ➕ Crear marca "{marcaQuery.trim()}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>
                  Modelo <span className="req" style={{ color: "#ef4444" }}>*</span>
                </label>
                <input 
                  className={`form-input ${errors.modelo ? "input-error" : ""}`} 
                  placeholder={!marca ? "Seleccionar antes Marca" : "Modelo"} 
                  disabled={!marca}
                  style={!marca ? { backgroundColor: "var(--bg-secondary)", cursor: "not-allowed" } : {}}
                  value={modelo} onChange={e => { setModelo(e.target.value); setErrors({...errors, modelo: null}); }} 
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>
                  Tipo <span className="req" style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input 
                    className={`form-input ${errors.tipo ? "input-error" : ""}`} 
                    value={tipo} onChange={e => { setTipo(e.target.value); setErrors({...errors, tipo: null}); }} 
                  />
                  {tipo && (
                    <button type="button" aria-label="Limpiar tipo de equipo"
                      onClick={() => setTipo("")}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>
                  N° Serie <span className="req" style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
                  <div style={{ padding: "0 12px", display: "flex", alignItems: "center", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRight: "none", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px" }}>
                    <div 
                      onClick={() => setHasSerie(!hasSerie)}
                      style={{
                        width: "36px", height: "20px", borderRadius: "20px",
                        backgroundColor: hasSerie ? "#10b981" : "#cbd5e1",
                        position: "relative", cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{
                        width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white",
                        position: "absolute", top: "2px", left: hasSerie ? "18px" : "2px", transition: "all 0.2s"
                      }} />
                    </div>
                  </div>
                  <input 
                    className={`form-input ${errors.serie ? "input-error" : ""}`} 
                    disabled={!hasSerie}
                    style={{ borderRadius: 0, borderLeft: "1px solid var(--border-color)", ...( !hasSerie ? { backgroundColor: "var(--bg-secondary)", cursor: "not-allowed" } : {} ) }}
                    value={hasSerie ? serie : "S/N"} onChange={e => { setSerie(e.target.value); setErrors({...errors, serie: null}); }} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: "12px", color: "#64748b" }}>Observaciones</label>
              <textarea className="form-input" rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "var(--bg-secondary)" }}>
          <button className="btn-secondary" style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "none" }} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{ backgroundColor: "#2563eb" }} onClick={handleSubmit}>💾 Guardar</button>
        </div>
      </section>
    </div>
  );
}
