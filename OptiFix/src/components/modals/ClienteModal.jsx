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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-scale-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {clienteToEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete la información de contacto del cliente.
            </p>
          </div>
          <button 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors" 
            onClick={onClose}
          >
            <Icono nombre="x" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Identificación / Cédula *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                  placeholder="Ej. 111120342"
                  value={formData.identificacion}
                  onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                  placeholder="Ej. 88386357"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Completo / Razón Social *</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                placeholder="Ej. VIANNEY SABORIO HERNANDEZ"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
              <input
                type="text"
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                placeholder="Provincia, cantón o señas exactas"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas Internas</label>
              <textarea
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm resize-none"
                rows="3"
                placeholder="Observaciones de contacto o preferencias"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>

          </div>
          
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="inline-flex items-center gap-2 bg-optifix-600 hover:bg-optifix-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-optifix-500/20"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
