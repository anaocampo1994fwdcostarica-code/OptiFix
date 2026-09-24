import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaPlus, FaTools, FaBoxOpen, FaTag, FaFilter } from "react-icons/fa";

const REPUESTOS = [
  { id: 1, categoria: "Tarjetas Main Board", nombre: "Main Board Samsung UN55NU7100", sku: "MB-SAM-55NU71", precio: 85.00, stock: 3, estado: "Disponible" },
  { id: 2, categoria: "Tarjetas Main Board", nombre: "Main Board LG 43LM5700PUA", sku: "MB-LG-43LM57", precio: 72.50, stock: 1, estado: "Disponible" },
  { id: 3, categoria: "Displays", nombre: "Panel LCD 55\" Samsung 4K", sku: "DISP-SAM-55-4K", precio: 210.00, stock: 0, estado: "Sin Stock" },
  { id: 4, categoria: "Displays", nombre: "Display LG 43\" FHD", sku: "DISP-LG-43FHD", precio: 145.00, stock: 2, estado: "Disponible" },
  { id: 5, categoria: "Consumibles", nombre: "Pasta Térmica Disipadora", sku: "CONS-PASTA-TER", precio: 4.50, stock: 25, estado: "Disponible" },
  { id: 6, categoria: "Consumibles", nombre: "Flux de Soldadura Premium", sku: "CONS-FLUX-PRE", precio: 8.00, stock: 12, estado: "Disponible" },
  { id: 7, categoria: "Consumibles", nombre: "Estaño 60/40 - Rollo 250g", sku: "CONS-ESTANO-250", precio: 15.00, stock: 8, estado: "Disponible" },
  { id: 8, categoria: "Consumibles", nombre: "Limpiador IPA 99% - 500ml", sku: "CONS-IPA-500", precio: 11.00, stock: 6, estado: "Disponible" },
  { id: 9, categoria: "Fuentes de Poder", nombre: "Fuente Poder TV 50W Universal", sku: "FP-TV-50W", precio: 35.00, stock: 4, estado: "Disponible" },
  { id: 10, categoria: "Fuentes de Poder", nombre: "Capacitor Electrolítico 1000µF/25V", sku: "CAP-1000-25V", precio: 0.75, stock: 100, estado: "Disponible" },
];

const CATEGORIAS = ["Todos", "Tarjetas Main Board", "Displays", "Consumibles", "Fuentes de Poder"];

const estadoColor = {
  "Disponible": "#22c55e",
  "Sin Stock": "#f87171",
  "Bajo Stock": "#f59e0b"
};

export default function ProductosView() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const productosFiltrados = REPUESTOS.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
    return matchBusqueda && matchCategoria;
  });

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <span>Principal</span><span>/</span>
        <span className="breadcrumb-current">Productos</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
            📦 Catálogo de Repuestos y Productos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Inventario de componentes, tarjetas Main Board, displays y consumibles.
          </p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaPlus size={12} /> Agregar Producto
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Productos", valor: REPUESTOS.length, icon: "📦", color: "#0088cc" },
          { label: "En Stock", valor: REPUESTOS.filter(p => p.stock > 0).length, icon: "✅", color: "#22c55e" },
          { label: "Sin Stock", valor: REPUESTOS.filter(p => p.stock === 0).length, icon: "⚠️", color: "#f87171" },
          { label: "Valor Estimado", valor: "₡" + REPUESTOS.reduce((acc, p) => acc + p.precio * p.stock, 0).toFixed(2), icon: "💰", color: "#f59e0b" }
        ].map((s, i) => (
          <div key={i} className="work-order-meta-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{s.label}</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.valor}</div>
              </div>
              <span style={{ fontSize: "28px" }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={13} />
          <input
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              style={{
                padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                border: "1px solid",
                borderColor: categoriaActiva === cat ? "#0088cc" : "var(--border-color)",
                backgroundColor: categoriaActiva === cat ? "rgba(0,136,204,0.12)" : "transparent",
                color: categoriaActiva === cat ? "#0088cc" : "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="work-order-meta-card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.1)" }}>
              {["SKU", "Nombre del Producto", "Categoría", "Precio Unit.", "Stock", "Estado"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,136,204,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#0088cc" }}>{p.sku}</td>
                <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-color)" }}>{p.nombre}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: "rgba(0,136,204,0.1)", color: "#0088cc" }}>
                    {p.categoria}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text-color)", fontWeight: 600 }}>₡{p.precio.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: p.stock === 0 ? "#f87171" : p.stock < 3 ? "#f59e0b" : "var(--text-color)" }}>{p.stock} un.</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, color: estadoColor[p.estado], background: estadoColor[p.estado] + "20" }}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productosFiltrados.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            No se encontraron productos con los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
}
