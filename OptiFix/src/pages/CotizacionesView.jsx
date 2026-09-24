import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import "./CotizacionesView.css";

const nuevoItem = () => ({ descripcion: "", cantidad: 1, precio: "" });

function money(value) {
  return `₡${Number(value || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}`;
}

export default function CotizacionesView() {
  const { clientes, cotizaciones, addCotizacion } = useWorkshop();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [vigencia, setVigencia] = useState(15);
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState([nuevoItem()]);

  const clienteSeleccionado = clientes.find((cliente) => cliente.id === selected?.cliente_id);

  function openForm() {
    setClienteId(clientes[0]?.id || "");
    setVigencia(15);
    setNotas("");
    setItems([nuevoItem()]);
    setIsFormOpen(true);
  }

  function saveQuotation(event) {
    event.preventDefault();
    if (!clienteId || items.some((item) => !item.descripcion.trim())) return;
    const quotation = addCotizacion({ cliente_id: clienteId, vigencia, notas, items });
    setSelected(quotation);
    setIsFormOpen(false);
  }

  function updateItem(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  function printQuotation(quotation) {
    setSelected(quotation);
    window.setTimeout(() => window.print(), 0);
  }

  return (
    <div className="page-container quotations-page">
      <div className="breadcrumb-nav">
        <span>Principal</span><span>/</span><span className="breadcrumb-current">Cotizaciones y Presupuestos</span>
      </div>

      <header className="quotations-header">
        <div>
          <h1>Cotizaciones y Presupuestos</h1>
          <p>Prepara propuestas para tus clientes y genera una copia lista para imprimir o guardar como PDF.</p>
        </div>
        <button className="btn-primary" onClick={openForm}>Nueva cotización</button>
      </header>

      {isFormOpen && (
        <form className="quotation-form" onSubmit={saveQuotation}>
          <div className="quotation-form-heading">
            <div><h2>Nueva cotización</h2><p>Completa los datos de la propuesta.</p></div>
            <button type="button" className="quotation-close" onClick={() => setIsFormOpen(false)}>Cerrar</button>
          </div>
          <div className="quotation-form-grid">
            <label>Cliente
              <select value={clienteId} onChange={(event) => setClienteId(event.target.value)} required>
                <option value="">Selecciona un cliente</option>
                {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido || ""}</option>)}
              </select>
            </label>
            <label>Vigencia (días)
              <input type="number" min="1" value={vigencia} onChange={(event) => setVigencia(event.target.value)} />
            </label>
          </div>
          <div className="quotation-items-heading"><h3>Conceptos</h3><button type="button" className="quotation-link" onClick={() => setItems([...items, nuevoItem()])}>Agregar concepto</button></div>
          <div className="quotation-items">
            {items.map((item, index) => (
              <div className="quotation-item-row" key={index}>
                <input placeholder="Descripción del trabajo o repuesto" value={item.descripcion} onChange={(event) => updateItem(index, "descripcion", event.target.value)} required />
                <input type="number" min="1" aria-label="Cantidad" value={item.cantidad} onChange={(event) => updateItem(index, "cantidad", event.target.value)} />
                <input type="number" min="0" step="0.01" aria-label="Precio" placeholder="Precio" value={item.precio} onChange={(event) => updateItem(index, "precio", event.target.value)} />
                <span>{money(Number(item.cantidad) * Number(item.precio))}</span>
                {items.length > 1 && <button type="button" className="quotation-remove" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>Quitar</button>}
              </div>
            ))}
          </div>
          <label>Notas para el cliente<textarea rows="3" value={notas} onChange={(event) => setNotas(event.target.value)} placeholder="Condiciones, tiempos de entrega o información adicional" /></label>
          <div className="quotation-form-actions"><button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button><button className="btn-primary" type="submit">Guardar cotización</button></div>
        </form>
      )}

      <section className="quotations-layout">
        <div className="quotation-list">
          <h2>Cotizaciones guardadas</h2>
          {cotizaciones.length === 0 && <div className="quotation-empty">Todavía no hay cotizaciones. Crea la primera para un cliente.</div>}
          {cotizaciones.map((quotation) => {
            const cliente = clientes.find((item) => item.id === quotation.cliente_id);
            const total = quotation.items.reduce((sum, item) => sum + Number(item.cantidad) * Number(item.precio), 0);
            return <button className={`quotation-list-row ${selected?.id === quotation.id ? "active" : ""}`} key={quotation.id} onClick={() => setSelected(quotation)}>
              <span><strong>Cotización #{String(quotation.numero).padStart(4, "0")}</strong><small>{cliente?.nombre || "Cliente sin nombre"}</small></span><span><strong>{money(total)}</strong><small>{quotation.fecha}</small></span>
            </button>;
          })}
        </div>

        {selected ? <QuotationPreview quotation={selected} cliente={clienteSeleccionado} onPrint={() => printQuotation(selected)} /> : <div className="quotation-preview quotation-preview-empty">Selecciona una cotización para revisar, imprimir o guardar en PDF.</div>}
      </section>
    </div>
  );
}

function QuotationPreview({ quotation, cliente, onPrint }) {
  const total = quotation.items.reduce((sum, item) => sum + Number(item.cantidad) * Number(item.precio), 0);
  return <article className="quotation-preview">
    <div className="quotation-preview-actions"><button className="btn-primary" onClick={onPrint}>Imprimir / Guardar PDF</button></div>
    <div className="printable-quotation">
      <div className="printable-header"><div><strong>OptiFix</strong><span>Gestión inteligente de taller</span></div><div><b>COTIZACIÓN #{String(quotation.numero).padStart(4, "0")}</b><span>Fecha: {quotation.fecha}</span></div></div>
      <div className="printable-client"><b>Cliente</b><span>{cliente?.nombre || "Sin nombre"}</span><span>{cliente?.identificacion || ""}</span><span>{cliente?.email || cliente?.telefono || ""}</span></div>
      <table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>{quotation.items.map((item, index) => <tr key={index}><td>{item.descripcion}</td><td>{item.cantidad}</td><td>{money(item.precio)}</td><td>{money(Number(item.cantidad) * Number(item.precio))}</td></tr>)}</tbody></table>
      <div className="printable-total"><span>Total estimado</span><strong>{money(total)}</strong></div>
      <p className="printable-notes">{quotation.notas || "Esta cotización tiene una vigencia de " + quotation.vigencia + " días."}</p>
    </div>
  </article>;
}
