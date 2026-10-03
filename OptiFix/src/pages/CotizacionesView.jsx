import React, { useEffect, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useExchangeRate } from "../hooks/useExchangeRate.js";
import "./CotizacionesView.css";
import { useTranslation } from "react-i18next";

const nuevoItem = () => ({ descripcion: "", cantidad: 1, precio: "" });

function money(value, locale = "es-CR") {
  return `₡${Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CotizacionesView() {
  const { t, i18n } = useTranslation();
  const { clientes, cotizaciones, addCotizacion } = useWorkshop();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [clienteTexto, setClienteTexto] = useState("");
  const [clientListOpen, setClientListOpen] = useState(false);
  const [vigencia, setVigencia] = useState(15);
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState([nuevoItem()]);
  const exchangeRate = useExchangeRate();
  const formSubtotal = items.reduce((sum, item) => sum + Number(item.cantidad || 0) * Number(item.precio || 0), 0);
  const formIva = formSubtotal * 0.13;
  const formTotal = formSubtotal + formIva;
  const locale = i18n.language === "en" ? "en-US" : "es-CR";
  const filteredClients = clientes.filter((cliente) => {
    const query = clienteTexto.trim().toLowerCase();
    if (!query) return true;
    return `${cliente.nombre} ${cliente.apellido || ""} ${cliente.telefono || ""} ${cliente.identificacion || ""}`.toLowerCase().includes(query);
  }).slice(0, 7);

  const clienteSeleccionado = clientes.find((cliente) => cliente.id === selected?.cliente_id);

  function openForm() {
    setClienteId("");
    setClienteTexto("");
    setClientListOpen(false);
    setVigencia(15);
    setNotas("");
    setItems([nuevoItem()]);
    setIsFormOpen(true);
  }

  async function saveQuotation(event) {
    event.preventDefault();
    if (!clienteTexto.trim() || items.some((item) => !item.descripcion.trim())) return;
    const selectedClient = clientes.find((cliente) => cliente.id === clienteId);
    const fiscalItems = items.map((item) => {
      const subtotal = Number(item.cantidad || 0) * Number(item.precio || 0);
      return { ...item, subtotal, iva: subtotal * 0.13, total: subtotal * 1.13 };
    });
    const quotation = await addCotizacion({ cliente_id: selectedClient?.id || "", cliente_nombre: clienteTexto.trim(), vigencia, notas, items: fiscalItems, subtotal: formSubtotal, iva: formIva, total: formTotal });
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
        <span>{t("common.home")}</span><span>/</span><span className="breadcrumb-current">{t("quotes.title")}</span>
      </div>

      <header className="quotations-header">
        <div>
          <h1>{t("quotes.title")}</h1>
          <p>{t("quotes.subtitle")}</p>
        </div>
        {canCreateQuotation && <button className="btn-primary" onClick={openForm}>{t("quotes.new")}</button>}
      </header>
      <p className="quotation-exchange-rate">💱 {t("quotes.exchange")}: {exchangeRate.loading ? t("quotes.checking") : `US$1 = ₡${Number(exchangeRate.rate).toLocaleString(i18n.language === "en" ? "en-US" : "es-CR")} (${exchangeRate.source})`}</p>

      {isFormOpen && canCreateQuotation && (
        <form className="quotation-form quotation-document" onSubmit={saveQuotation}>
          <div className="quotation-form-heading">
            <div className="quotation-workshop"><strong>Taller Servicios Electrónicos CR</strong><span>{t("quotes.proposal")}</span></div>
            <div className="quotation-document-title"><h2>{t("quotes.new")}</h2><button type="button" className="quotation-close print:hidden" onClick={() => setIsFormOpen(false)}>{t("common.close")}</button></div>
          </div>
          <div className="quotation-form-grid">
            <label className="quotation-client-combobox">{t("common.client")}
              <input role="combobox" aria-autocomplete="list" aria-expanded={clientListOpen} aria-controls="quotation-client-options" value={clienteTexto} placeholder={t("quotes.clientPlaceholder")} onFocus={() => setClientListOpen(true)} onBlur={() => window.setTimeout(() => setClientListOpen(false), 120)} onChange={(event) => { setClienteTexto(event.target.value); setClienteId(""); setClientListOpen(true); }} required />
              {clientListOpen && <div id="quotation-client-options" role="listbox" className="quotation-client-options">
                {filteredClients.map((cliente) => { const fullName = `${cliente.nombre} ${cliente.apellido || ""}`.trim(); return <button type="button" role="option" aria-selected={clienteId === cliente.id} key={cliente.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { setClienteTexto(fullName); setClienteId(cliente.id); setClientListOpen(false); }}><span><b>{fullName}</b><small>{cliente.telefono || cliente.identificacion || t("quotes.existingClient")}</small></span><em>{t("quotes.existingClient")}</em></button>; })}
                {!filteredClients.length && <p>{clienteTexto.trim() ? t("quotes.newClientHint") : t("quotes.noClientMatches")}</p>}
              </div>}
              {clienteTexto.trim() && !clienteId && <small className="quotation-new-client-hint">{t("quotes.newClientHint")}</small>}
            </label>
            <label>{t("quotes.validity")}
              <input type="number" min="1" value={vigencia} onChange={(event) => setVigencia(event.target.value)} />
            </label>
          </div>
          <div className="quotation-items-heading"><h3>{t("quotes.items")}</h3><button type="button" className="quotation-link print:hidden" onClick={() => setItems([...items, nuevoItem()])}>{t("quotes.addLine")}</button></div>
          <div className="quotation-items">
            <div className="quotation-table-head"><span>{t("quotes.description")}</span><span>{t("quotes.quantity")}</span><span>{t("quotes.unitPrice")}</span><span>{t("quotes.tax")}</span><span>{t("quotes.subtotal")}</span><span className="print:hidden">{t("quotes.action")}</span></div>
            {items.map((item, index) => (
              <div className="quotation-item-row" key={index}>
                <input placeholder={t("quotes.itemPlaceholder")} value={item.descripcion} onChange={(event) => updateItem(index, "descripcion", event.target.value)} required />
                <input type="number" min="1" aria-label={t("quotes.quantity")} value={item.cantidad} onChange={(event) => updateItem(index, "cantidad", event.target.value)} />
                <input type="number" min="0" step="0.01" aria-label={t("quotes.price")} placeholder={t("quotes.price")} value={item.precio} onChange={(event) => updateItem(index, "precio", event.target.value)} />
                <span>{money(Number(item.cantidad) * Number(item.precio) * 0.13, locale)}</span>
                <span>{money(Number(item.cantidad) * Number(item.precio), locale)}</span>
                <button type="button" disabled={items.length === 1} className="quotation-remove print:hidden" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} title={t("quotes.deleteLine")} aria-label={t("quotes.deleteLine")}>🗑</button>
              </div>
            ))}
          </div>
          <div className="quotation-currency-note"><div><span>{t("quotes.subtotal")}</span><b>{money(formSubtotal, locale)}</b></div><div><span>{t("quotes.tax")}</span><b>{money(formIva, locale)}</b></div><div className="quotation-grand-total"><span>{t("quotes.total")}</span><strong>{money(formTotal, locale)}</strong></div></div>
          <label>{t("quotes.notes")}<textarea rows="3" value={notas} onChange={(event) => setNotas(event.target.value)} placeholder={t("quotes.notesPlaceholder")} /></label>
          <div className="quotation-form-actions print:hidden"><button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>{t("common.cancel")}</button><button type="button" className="btn-secondary" onClick={() => window.print()}>{t("quotes.print")}</button><button type="button" className="btn-secondary" onClick={() => window.print()}>{t("quotes.pdf")}</button><button className="btn-primary" type="submit">{t("quotes.save")}</button></div>
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
