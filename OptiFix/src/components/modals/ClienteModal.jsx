import React, { useState, useEffect } from "react";
import Icono from "../icons.jsx";

export default function ClienteModal({ isOpen, onClose, onSave, clienteToEdit }) {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: ""
  });

  useEffect(() => {
    if (clienteToEdit) {
      setFormData({
        identificacion: clienteToEdit.identificacion || "",
        nombre: clienteToEdit.nombre || "",
        email: clienteToEdit.email || "",
        telefono: clienteToEdit.telefono || "",
        direccion: clienteToEdit.direccion || "",
        notas: clienteToEdit.notas || ""
      });
    } else {
      setFormData({
        identificacion: "",
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        notas: ""
      });
    }
  }, [clienteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{clienteToEdit ? "Editar Cliente" : "Nuevo Cliente"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <Icono nombre="x" size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row-2">
              <div className="form-group">
                <label>Identificación / Cédula *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. 111120342"
                  value={formData.identificacion}
                  onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. 88386357"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nombre Completo / Razón Social *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ej. VIANNEY SABORIO HERNANDEZ"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                className="form-input"
                placeholder="Provincia, cantón o señas exactas"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Notas Internas</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Observaciones de contacto o preferencias"
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
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
