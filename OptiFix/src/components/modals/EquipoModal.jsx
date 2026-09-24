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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-scale-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {equipoToEdit ? "Editar Equipo" : "Registrar Nuevo Equipo"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingrese los detalles y condición física del equipo.
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
          <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Cliente Propietario *</label>
              <select
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm bg-white"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Artículo *</label>
                <select
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marca *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                  placeholder="Ej. Sony, Oster, Panasonic"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Modelo *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm"
                  placeholder="Ej. XBR-55X930D"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Número de Serie *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm font-mono"
                  placeholder="Ej. 5027152"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado Físico al Ingreso</label>
                <input
                  type="text"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm uppercase placeholder:normal-case"
                  placeholder="Ej. Sucio, rayado, buen estado"
                  value={formData.estado_fisico}
                  onChange={(e) => setFormData({ ...formData, estado_fisico: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Accesorios Entregados</label>
                <input
                  type="text"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm uppercase placeholder:normal-case"
                  placeholder="Ej. Control, cable de poder"
                  value={formData.accesorios}
                  onChange={(e) => setFormData({ ...formData, accesorios: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas Técnicas Iniciales</label>
              <textarea
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-optifix-500 focus:ring-optifix-500 sm:text-sm resize-none"
                rows="3"
                placeholder="Detalle visual o condición especial del equipo"
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
              Guardar Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
