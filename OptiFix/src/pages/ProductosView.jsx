import React, { useMemo, useState } from "react";
import Icono from "../components/icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import "./ProductosView.css";

const emptyProduct = () => ({ categoria: "Consumibles", nombre: "", sku: "", precio: 0, stock: 0 });

function estadoDe(stock) {
  if (stock === 0) return { label: "SIN STOCK", bg: "#C43D3D", color: "#fff" };
  if (stock <= 2) return { label: `ÚLTIMAS ${stock}`, bg: "#8a6100", color: "#fff" };
  return { label: "DISPONIBLE", bg: "#00873A", color: "#fff" };
}

export default function ProductosView() {
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
    } catch (requestError) { setError(requestError.message || "No se pudo guardar el producto."); }
  }
  async function removeProduct(producto) {
    if (!window.confirm(`¿Eliminar ${producto.nombre}?`)) return;
    try { await deleteProducto(producto.id); } catch (requestError) { setError(requestError.message || "No se pudo eliminar el producto."); }
  }

  return <div className="page-container">
    <div className="breadcrumb-nav"><span>Principal</span><span>/</span><span>Inventario</span><span>/</span><span className="breadcrumb-current">Repuestos y Productos</span></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}><div><h1 style={{ fontSize: "22px", color: "var(--text-heading)", fontWeight: 700, margin: 0 }}>Catálogo de Repuestos</h1><p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Gestión persistente de inventario y componentes.</p></div><button className="btn-primary" onClick={() => { setForm(emptyProduct()); setError(""); }}>+ Nuevo Producto</button></div>
    {form && <form className="table-card" onSubmit={saveProduct} style={{ padding: 20, marginBottom: 20 }}><h3>{form.id ? "Editar producto" : "Nuevo producto"}</h3><div className="servicios-form-grid"><label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label><label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></label><label>Categoría<input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></label><label>Precio (₡)<input type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label><label>Stock<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label></div><div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}><button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancelar</button><button className="btn-primary" type="submit">Guardar</button></div></form>}
    {error && <p className="user-message" role="alert">{error}</p>}
    <div className="productos-toolbar"><div className="productos-search"><Icono nombre="search" size={14} /><input placeholder="Buscar por nombre o SKU..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div></div>
    <div className="productos-grid">{filtrados.map((producto) => { const estado = estadoDe(Number(producto.stock)); return <div key={producto.id} className="producto-card"><div className="producto-card-header"><span className="producto-sku">{producto.sku}</span><span className="producto-badge" style={{ backgroundColor: estado.bg, color: estado.color }}>{estado.label}</span></div><div className="producto-card-body"><div className="producto-cat">{producto.categoria}</div><h3 className="producto-nombre">{producto.nombre}</h3><div className="producto-precio">₡{Number(producto.precio).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</div><small>Stock: {producto.stock}</small></div><div className="producto-card-footer"><button className="btn-outline" onClick={() => setForm({ ...producto })}>Editar</button><button className="btn-outline" onClick={() => removeProduct(producto)}>Eliminar</button></div></div>; })}</div>
  </div>;
}
