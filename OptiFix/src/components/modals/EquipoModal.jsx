import React, { useState, useEffect } from "react";
import Icono from "../icons.jsx";

export default function EquipoModal({ isOpen, onClose, onSave, equipoToEdit, clientes = [] }) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    tipo: "Pantalla",
    marca: "",
    modelo: "",
    serie: "",
    estado_fisico: "BUEN ESTADO",
    accesorios: "NINGUNO",
    notas: ""
  });

  useEffect(() => {
    if (equipoToEdit) {
      setFormData({
        cliente_id: equipoToEdit.cliente_id || (clientes[0]?.id || ""),
        tipo: equipoToEdit.tipo || "Pantalla",
        marca: equipoToEdit.marca || "",
        modelo: equipoToEdit.modelo || "",
        serie: equipoToEdit.serie || "",
        estado_fisico: equipoToEdit.estado_fisico || "BUEN ESTADO",
        accesorios: equipoToEdit.accesorios || "NINGUNO",
        notas: equipoToEdit.notas || ""
      });
    } else {
      setFormData({
        cliente_id: clientes[0]?.id || "",
        tipo: "Pantalla",
        marca: "",
        modelo: "",
        serie: "",
        estado_fisico: "BUEN ESTADO",
        accesorios: "NINGUNO",
        notas: ""
      });
    }
  }, [equipoToEdit, isOpen, clientes]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.marca.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{equipoToEdit ? "Editar Equipo" : "Registrar Nuevo Equipo"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <Icono nombre="x" size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Cliente Propietario *</label>
              <select
                className="form-select"
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                required
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.identificacion})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Tipo de Artículo *</label>
                <select
                  className="form-select"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="Pantalla">Pantalla / Televisor</option>
                  <option value="Microondas">Microondas / Olla</option>
                  <option value="Audio">Audio / Sonido</option>
                  <option value="Laptop">Laptop / Computadora</option>
                  <option value="Videocámara">Videocámara</option>
                  <option value="Consola">Consola de Videojuegos</option>
                  <option value="Otro">Otro Electrodoméstico</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marca *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  required
                  className="form-input"
                  placeholder="Ej. Sony, Oster, Panasonic"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Modelo *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. XBR-55X930D, OGJ41101"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Número de Serie *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. 5027152"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value.replace(/\D/g, "") })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Estado Físico al Ingreso</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. SUCIO, RAYADO, OXIDADO"
                  value={formData.estado_fisico}
                  onChange={(e) => setFormData({ ...formData, estado_fisico: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Accesorios Entregados</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. PLATO, ARO, CONTROL, CABLE"
                  value={formData.accesorios}
                  onChange={(e) => setFormData({ ...formData, accesorios: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notas Técnicas Iniciales</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Detalle visual o condición especial del equipo"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
