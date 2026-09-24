import React, { useState } from "react";
import Icono from "../icons.jsx";

const ESTADOS_DISPONIBLES = [
  { estado: "RECEPCIÓN", etapa: "ENTRADA", desc: "Equipo recién ingresado a recepción" },
  { estado: "TALLER", etapa: "TALLER", desc: "En banco de pruebas y diagnóstico técnico" },
  { estado: "BODEGA", etapa: "BODEGA", desc: "Almacenado a la espera de partes o repuestos" },
  { estado: "COMUNICANDO PRESUPUESTO", etapa: "BODEGA", desc: "Presupuesto cotizado esperando aprobación de cliente" },
  { estado: "REPARADO", etapa: "TALLER", desc: "Reparación concluida con pruebas de calidad superadas" },
  { estado: "SALIDA", etapa: "SALIDA", desc: "Equipo listo para retiro por parte del cliente" },
  { estado: "ENTREGADO", etapa: "SALIDA", desc: "Equipo entregado en mano al cliente" }
];

export default function CambiarEstadoModal({ isOpen, onClose, orden, onConfirmChange }) {
  const [selectedEstado, setSelectedEstado] = useState(orden?.estado_actual || "RECEPCIÓN");
  const [detalle, setDetalle] = useState("");

  if (!isOpen || !orden) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetObj = ESTADOS_DISPONIBLES.find((e) => e.estado === selectedEstado);
    const etapa = targetObj ? targetObj.etapa : "TALLER";
    onConfirmChange(orden.id, selectedEstado, etapa, detalle || `Cambio de estado a ${selectedEstado}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cambiar Estado — Orden Nº {orden.numero}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <Icono nombre="x" size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Estado Actual</label>
              <div style={{ color: "var(--accent-cyan)", fontWeight: 700, fontSize: "14px" }}>
                {orden.estado_actual}
              </div>
            </div>

            <div className="form-group">
              <label>Nuevo Estado de la Orden *</label>
              <select
                className="form-select"
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                {ESTADOS_DISPONIBLES.map((st) => (
                  <option key={st.estado} value={st.estado}>
                    {st.estado} — ({st.desc})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Detalle para la Línea de Tiempo</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Indique el motivo del cambio o notas del procedimiento (ej. Se reemplazó placa y se notificó al cliente)."
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Actualizar Estado y Registrar en Bitácora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
