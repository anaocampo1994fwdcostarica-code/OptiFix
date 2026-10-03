import React, { useMemo, useState } from "react";
import Icono from "../components/icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import "./ProductosView.css";
import { useTranslation } from "react-i18next";

const emptyProduct = () => ({ categoria: "Consumibles", nombre: "", sku: "", precio: 0, stock: 0 });

function estadoDe(stock, t) {
  if (stock === 0) return { label: t("products.outOfStock"), icon: "!", bg: "#991b1b", color: "#fff", border: "#450a0a" };
  if (stock <= 2) return { label: t("products.lastUnits", { count: stock }), icon: "!", bg: "#854d0e", color: "#fff", border: "#422006" };
  return { label: t("products.available"), icon: "✓", bg: "#166534", color: "#fff", border: "#052e16" };
}

export default function ProductosView() {
  const { t, i18n } = useTranslation();
  const { productos, addProducto, updateProducto, deleteProducto } = useWorkshop();
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const filtrados = useMemo(() => productos.filter((producto) => `${producto.nombre} ${producto.sku}`.toLowerCase().includes(busqueda.toLowerCase())), [productos, busqueda]);

  async function saveProduct(event) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.sku.trim()) return;
    try {
      if (form.id) await updateProducto(form.id, form); else await addProducto(form);
      setForm(null); setError("");
    } catch (requestError) { setError(requestError.message || t("products.saveError")); }
  }
  async function removeProduct(producto) {
    if (!window.confirm(t("products.deleteConfirm", { name: producto.nombre }))) return;
    try { await deleteProducto(producto.id); } catch (requestError) { setError(requestError.message || t("products.deleteError")); }
  }

  return <div className="page-container">
    <div className="breadcrumb-nav"><span>{t("common.home")}</span><span>/</span><span>{t("products.inventory")}</span><span>/</span><span className="breadcrumb-current">{t("products.partsProducts")}</span></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}><div><h1 style={{ fontSize: "22px", color: "var(--text-heading)", fontWeight: 700, margin: 0 }}>{t("products.title")}</h1><p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{t("products.subtitle")}</p></div><button className="btn-primary" onClick={() => { setForm(emptyProduct()); setError(""); }}>+ {t("products.new")}</button></div>
    {form && <form className="table-card" onSubmit={saveProduct} style={{ padding: 20, marginBottom: 20 }}><h3>{form.id ? t("products.edit") : t("products.new")}</h3><div className="servicios-form-grid"><label>{t("common.name")}<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label><label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></label><label>{t("products.category")}<input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></label><label>{t("products.price")}<input type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label><label>{t("products.stock")}<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label></div><div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}><button type="button" className="btn-secondary" onClick={() => setForm(null)}>{t("common.cancel")}</button><button className="btn-primary" type="submit">{t("common.save")}</button></div></form>}
    {error && <p className="user-message" role="alert">{error}</p>}
    <div className="productos-toolbar"><div className="productos-search"><Icono nombre="search" size={14} /><input placeholder={t("products.search")} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div></div>
    <div className="productos-grid">{filtrados.map((producto) => { const estado = estadoDe(Number(producto.stock), t); return <article key={producto.id} className="producto-card"><div className="producto-card-header"><span className="producto-sku">{producto.sku}</span><span className="producto-badge" style={{ backgroundColor: estado.bg, color: estado.color, border: `2px solid ${estado.border}` }}><span aria-hidden="true">{estado.icon} </span>{estado.label}</span></div><div className="producto-card-body"><div className="producto-cat">{producto.categoria}</div><h3 className="producto-nombre">{producto.nombre}</h3><div className="producto-precio">₡{Number(producto.precio).toLocaleString(i18n.language === "en" ? "en-US" : "es-CR", { minimumFractionDigits: 2 })}</div><small>{t("products.stock")}: {producto.stock}</small></div><div className="producto-card-footer"><button className="btn-outline" onClick={() => setForm({ ...producto })}>{t("common.edit")}</button><button className="btn-outline" onClick={() => removeProduct(producto)}>{t("common.delete")}</button></div></article>; })}{filtrados.length === 0 && <p className="productos-empty">{t("products.empty")}</p>}</div>
  </div>;
}
