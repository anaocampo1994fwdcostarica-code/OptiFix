import React, { useState } from "react";
import Icono from "../icons.jsx";
import { actualizarEstadoOrden } from "../../services/n8nBackendService.js";

const ESTADOS_DISPONIBLES = [
  { estado: "RECEPCIÓN", etapa: "ENTRADA", desc: "Equipo recién ingresado a recepción" },
  { estado: "TALLER", etapa: "TALLER", desc: "En banco de pruebas y diagnóstico técnico" },
  { estado: "BODEGA", etapa: "BODEGA", desc: "Almacenado a la espera de partes o repuestos" },
  { estado: "COMUNICANDO PRESUPUESTO", etapa: "BODEGA", desc: "Presupuesto cotizado esperando aprobación de cliente" },
  { estado: "REPARADO", etapa: "TALLER", desc: "Reparación concluida con pruebas de calidad superadas" },
  { estado: "SALIDA", etapa: "SALIDA", desc: "Equipo listo para retiro por parte del cliente" },
  { estado: "ENTREGADO", etapa: "SALIDA", desc: "Equipo entregado en mano al cliente" }
];

export default function CambiarEstadoModal({ isOpen, onClose, orden, cliente = {}, equipo = {}, onConfirmChange }) {
  const [selectedEstado, setSelectedEstado] = useState(orden?.estado_actual || "RECEPCIÓN");
  const [detalle, setDetalle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !orden) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const targetObj = ESTADOS_DISPONIBLES.find((e) => e.estado === selectedEstado);
    const etapa = targetObj ? targetObj.etapa : "TALLER";
    const comentarioTecnico = detalle || `Cambio de estado a ${selectedEstado}`;
    try {
      setLoading(true);
      const remote = await actualizarEstadoOrden({ ordenId: orden.id, estado: selectedEstado, comentarioTecnico, cliente, equipo, seguimientoUrl: `${window.location.origin}/seguimiento/${orden.token_seguimiento}` });
      if (!remote.ok && !remote.demo) throw new Error(remote.error || "No fue posible actualizar la orden en n8n.");
      onConfirmChange(orden.id, selectedEstado, etapa, comentarioTecnico);
      onClose();
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar el estado. Inténtalo nuevamente.");
    } finally { setLoading(false); }
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
            {error && <p className="login-error" role="alert">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Actualizando y enviando correo…" : "Actualizar Estado y Registrar en Bitácora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
