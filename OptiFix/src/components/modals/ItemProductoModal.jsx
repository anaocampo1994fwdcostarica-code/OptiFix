import React, { useState } from "react";
import Icono from "../icons.jsx";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";

export default function ItemProductoModal({ isOpen, onClose, onAdd }) {
  const dialogRef = useFocusTrap(isOpen, onClose);
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [importe, setImporte] = useState(0);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = Number(cantidad), unitPrice = Number(importe);
    if (!descripcion.trim()) return setError("Ingrese la descripción del producto o servicio.");
    if (!Number.isFinite(quantity) || quantity <= 0) return setError("La cantidad debe ser mayor que cero.");
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return setError("El importe debe ser igual o mayor que cero.");
    onAdd({
      descripcion: descripcion.toUpperCase(),
      cantidad: quantity,
      importe: unitPrice
    });
    setDescripcion("");
    setCantidad(1);
    setImporte(0);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="item-product-title" className="modal-content item-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="item-product-title">Agregar Producto / Servicio a la Orden</h3>
          <button type="button" aria-label="Cerrar formulario de producto o servicio" className="modal-close-btn" onClick={onClose}>
            <Icono nombre="x" size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Descripción del Producto o Servicio *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ej. MO, MAIN BOARD, CAMBIO DE PANEL, REVISIÓN"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  className="form-input"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Importe Unitario (₡ Colones) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  className="form-input"
                  placeholder="0.00"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
              Total estimado para este renglón: <strong style={{ color: "var(--accent-cyan)" }}>
                ₡ {((Number(cantidad) || 0) * (Number(importe) || 0)).toLocaleString("es-CR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
            {error && <p className="modal-form-error" role="alert"><Icono nombre="alert-triangle" size={15} />{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Agregar a la Orden
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
