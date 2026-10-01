import React, { useEffect, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useExchangeRate } from "../hooks/useExchangeRate.js";
import "./CotizacionesView.css";

const nuevoItem = () => ({ descripcion: "", cantidad: 1, precio: "" });

function money(value) {
  return `₡${Number(value || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}`;
}

export default function CotizacionesView() {
  const { clientes, cotizaciones, addCotizacion } = useWorkshop();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [clienteTexto, setClienteTexto] = useState("");
  const [vigencia, setVigencia] = useState(15);
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState([nuevoItem()]);
  const exchangeRate = useExchangeRate();
  const formSubtotal = items.reduce((sum, item) => sum + Number(item.cantidad || 0) * Number(item.precio || 0), 0);
  const formIva = formSubtotal * 0.13;
  const formTotal = formSubtotal + formIva;

  const clienteSeleccionado = clientes.find((cliente) => cliente.id === selected?.cliente_id);

  function openForm() {
    setClienteId(clientes[0]?.id || "");
    setClienteTexto(clientes[0]?.nombre || "");
    setVigencia(15);
    setNotas("");
    setItems([nuevoItem()]);
    setIsFormOpen(true);
  }

  async function saveQuotation(event) {
    event.preventDefault();
    if (!clienteTexto.trim() || items.some((item) => !item.descripcion.trim())) return;
    const selectedClient = clientes.find((cliente) => cliente.id === clienteId);
    const quotation = await addCotizacion({ cliente_id: selectedClient?.id || "", cliente_nombre: clienteTexto.trim(), vigencia, notas, items });
    setSelected(quotation);
    setIsFormOpen(false);
  }

  function updateItem(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  const canCreateQuotation = user?.roles?.includes("crear_cotizacion") || user?.rol === "admin";
  const [printPending, setPrintPending] = useState(false);

  useEffect(() => {
    if (!printPending || !selected || !clienteSeleccionado) return;
    const frame = requestAnimationFrame(() => { window.print(); setPrintPending(false); });
    return () => cancelAnimationFrame(frame);
  }, [printPending, selected, clienteSeleccionado]);

  function printQuotation(quotation) {
    setSelected(quotation);
    setPrintPending(true);
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
        {canCreateQuotation && <button className="btn-primary" onClick={openForm}>Nueva cotización</button>}
      </header>
      <p className="quotation-exchange-rate">💱 Referencia de repuestos importados: {exchangeRate.loading ? "consultando USD/CRC…" : `US$1 = ₡${Number(exchangeRate.rate).toLocaleString("es-CR")} (${exchangeRate.source})`}</p>

      {isFormOpen && canCreateQuotation && (
        <form className="quotation-form quotation-document" onSubmit={saveQuotation}>
          <div className="quotation-form-heading">
            <div className="quotation-workshop"><strong>Taller Servicios Electrónicos CR</strong><span>Propuesta de servicio técnico</span></div>
            <div className="quotation-document-title"><h2>Nueva cotización</h2><button type="button" className="quotation-close print:hidden" onClick={() => setIsFormOpen(false)}>Cerrar</button></div>
          </div>
          <div className="quotation-form-grid">
            <label>Cliente
              <input list="quotation-clientes" value={clienteTexto} placeholder="Buscar o escribir un cliente nuevo" onChange={(event) => { const value = event.target.value; const match = clientes.find((cliente) => `${cliente.nombre} ${cliente.apellido || ""}`.trim().toLowerCase() === value.trim().toLowerCase()); setClienteTexto(value); setClienteId(match?.id || ""); }} required />
              <datalist id="quotation-clientes">{clientes.map((cliente) => <option key={cliente.id} value={`${cliente.nombre} ${cliente.apellido || ""}`.trim()} />)}</datalist>
            </label>
            <label>Vigencia (días)
              <input type="number" min="1" value={vigencia} onChange={(event) => setVigencia(event.target.value)} />
            </label>
          </div>
          <div className="quotation-items-heading"><h3>Conceptos</h3><button type="button" className="quotation-link print:hidden" onClick={() => setItems([...items, nuevoItem()])}>+ Agregar línea</button></div>
          <div className="quotation-items">
            <div className="quotation-table-head"><span>Descripción del Servicio/Repuesto</span><span>Cant.</span><span>Precio Unitario</span><span>IVA (13%)</span><span>Subtotal</span><span className="print:hidden">Acción</span></div>
            {items.map((item, index) => (
              <div className="quotation-item-row" key={index}>
                <input placeholder="Descripción del trabajo o repuesto" value={item.descripcion} onChange={(event) => updateItem(index, "descripcion", event.target.value)} required />
                <input type="number" min="1" aria-label="Cantidad" value={item.cantidad} onChange={(event) => updateItem(index, "cantidad", event.target.value)} />
                <input type="number" min="0" step="0.01" aria-label="Precio" placeholder="Precio" value={item.precio} onChange={(event) => updateItem(index, "precio", event.target.value)} />
                <span>{money(Number(item.cantidad) * Number(item.precio) * 0.13)}</span>
                <span>{money(Number(item.cantidad) * Number(item.precio) * 1.13)}</span>
                <button type="button" disabled={items.length === 1} className="quotation-remove print:hidden" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} title="Eliminar línea" aria-label="Eliminar línea">🗑</button>
              </div>
            ))}
          </div>
          <div className="quotation-currency-note"><div><span>Subtotal</span><b>{money(formSubtotal)}</b></div><div><span>IVA (13%)</span><b>{money(formIva)}</b></div><div className="quotation-grand-total"><span>Total a Pagar</span><strong>{money(formTotal)}</strong></div></div>
          <label>Notas para el cliente<textarea rows="3" value={notas} onChange={(event) => setNotas(event.target.value)} placeholder="Condiciones, tiempos de entrega o información adicional" /></label>
          <div className="quotation-form-actions print:hidden"><button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button><button type="button" className="btn-secondary" onClick={() => window.print()}>🖨️ Imprimir</button><button type="button" className="btn-secondary" onClick={() => window.print()}>📄 Descargar PDF</button><button className="btn-primary" type="submit">Guardar cotización</button></div>
        </form>
      )}

    </div>
  );
}

function QuotationPreview({ quotation, cliente, onPrint, onDownload }) {
  const total = quotation.items.reduce((sum, item) => sum + Number(item.cantidad) * Number(item.precio), 0);
  return <article className="quotation-preview">
    <div className="quotation-preview-actions print:hidden"><button className="btn-secondary" onClick={onPrint}>🖨️ Imprimir</button><button className="btn-primary" onClick={onDownload}>📄 Descargar PDF</button></div>
    <div className="printable-quotation">
      <div className="printable-header"><div><strong>Taller Servicios Electrónicos CR</strong><span>Servicio técnico especializado</span></div><div><b>COTIZACIÓN #{String(quotation.numero).padStart(4, "0")}</b><span>Fecha: {quotation.fecha}</span></div></div>
      <div className="printable-client"><b>Cliente</b><span>{cliente?.nombre || "Sin nombre"}</span><span>{cliente?.identificacion || ""}</span><span>{cliente?.email || cliente?.telefono || ""}</span></div>
      <table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>{quotation.items.map((item, index) => <tr key={index}><td>{item.descripcion}</td><td>{item.cantidad}</td><td>{money(item.precio)}</td><td>{money(Number(item.cantidad) * Number(item.precio))}</td></tr>)}</tbody></table>
      <div className="printable-total"><span>Total estimado</span><strong>{money(total)}</strong></div>
      <p className="printable-notes">{quotation.notas || "Esta cotización tiene una vigencia de " + quotation.vigencia + " días."}</p>
    </div>
  </article>;
}
