import React, { useMemo, useState } from "react";
import Icono from "../components/icons.jsx";
import "./ProductosView.css";

const SEED_REPUESTOS = [
  { id: 1, categoria: "Tarjetas Main Board", nombre: "Main Board Samsung UN55NU7100", sku: "MB-SAM-55NU71", precio: 85000, stock: 3 },
  { id: 2, categoria: "Tarjetas Main Board", nombre: "Main Board LG 43LM5700PUA", sku: "MB-LG-43LM57", precio: 72500, stock: 1 },
  { id: 3, categoria: "Displays", nombre: "Panel LCD 55\" Samsung 4K", sku: "DISP-SAM-55-4K", precio: 210000, stock: 0 },
  { id: 4, categoria: "Displays", nombre: "Display LG 43\" FHD", sku: "DISP-LG-43FHD", precio: 145000, stock: 2 },
  { id: 5, categoria: "Consumibles", nombre: "Pasta Térmica Disipadora", sku: "CONS-PASTA-TER", precio: 4500, stock: 25 },
  { id: 6, categoria: "Consumibles", nombre: "Flux de Soldadura Premium", sku: "CONS-FLUX-PRE", precio: 8000, stock: 12 },
  { id: 7, categoria: "Consumibles", nombre: "Estaño 60/40 - Rollo 250g", sku: "CONS-ESTANO-250", precio: 15000, stock: 8 },
  { id: 8, categoria: "Consumibles", nombre: "Limpiador IPA 99% - 500ml", sku: "CONS-IPA-500", precio: 11000, stock: 6 },
  { id: 9, categoria: "Fuentes de Poder", nombre: "Fuente Poder TV 50W Universal", sku: "FP-TV-50W", precio: 35000, stock: 4 },
  { id: 10, categoria: "Fuentes de Poder", nombre: "Capacitor Electrolítico 1000µF/25V", sku: "CAP-1000-25V", precio: 750, stock: 100 },
];

const CATEGORIAS = ["Todos", "Tarjetas Main Board", "Displays", "Consumibles", "Fuentes de Poder"];

function estadoDe(stock) {
  if (stock === 0) return { label: "SIN STOCK", bg: "#C43D3D", color: "#fff" };
  if (stock <= 2) return { label: `ÚLTIMAS ${stock}`, bg: "#8a6100", color: "#fff" };
  return { label: "DISPONIBLE", bg: "#00873A", color: "#fff" };
}

export default function ProductosView() {
  const [productos, setProductos] = useState(SEED_REPUESTOS);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const filtrados = useMemo(() => productos.filter((p) => {
    const term = busqueda.toLowerCase();
    const matchBusqueda = p.nombre.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    const matchCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
    return matchBusqueda && matchCategoria;
  }), [productos, busqueda, categoriaActiva]);

  const handleReabastecer = (id) => {
    setProductos(productos.map(p => p.id === id ? { ...p, stock: p.stock + 10 } : p));
  };

  const activeCount = productos.length;
  const valorTotal = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const bajosStock = productos.filter(p => p.stock <= 2).length;

  return (
    <div className="page-container">
      <div className="breadcrumb-nav">
        <span>Principal</span>
        <span>/</span>
        <span>Inventario</span>
        <span>/</span>
        <span className="breadcrumb-current">Repuestos y Productos</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", color: "var(--text-heading)", fontWeight: 700, margin: 0 }}>Catálogo de Repuestos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Gestión de inventario de repuestos, consumibles y componentes.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-primary" style={{ backgroundColor: "#006194" }}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="productos-kpi-row">
        <div className="productos-kpi-card">
          <div>
            <div className="productos-kpi-label">Productos Listados</div>
            <div className="productos-kpi-value">{activeCount}</div>
            <div className="productos-kpi-sub">Total en catálogo</div>
          </div>
          <div className="productos-kpi-icon"><Icono nombre="box" /></div>
        </div>
        <div className="productos-kpi-card">
          <div>
            <div className="productos-kpi-label">Bajo Stock</div>
            <div className="productos-kpi-value" style={{ color: bajosStock > 0 ? "#8a6100" : "inherit" }}>{bajosStock}</div>
            <div className="productos-kpi-sub">Productos &lt; 3 unid.</div>
          </div>
          <div className="productos-kpi-icon"><Icono nombre="alert-triangle" /></div>
        </div>
        <div className="productos-kpi-card">
          <div>
            <div className="productos-kpi-label">Valor del Inventario</div>
            <div className="productos-kpi-value">₡{valorTotal.toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="productos-kpi-sub">Estimado actual</div>
          </div>
          <div className="productos-kpi-icon"><Icono nombre="dollar-sign" /></div>
        </div>
      </div>

      <div className="productos-toolbar">
        <div className="productos-search">
          <Icono nombre="search" size={14} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <div className="productos-tabs">
          {CATEGORIAS.map(cat => (
            <button 
              key={cat} 
              className={categoriaActiva === cat ? "active" : ""} 
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="productos-grid">
        {filtrados.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--text-dim)", background: "#fff", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        ) : (
          filtrados.map(p => {
            const estado = estadoDe(p.stock);
            return (
              <div key={p.id} className="producto-card">
                <div className="producto-card-header">
                  <span className="producto-sku">{p.sku}</span>
                  <span className="producto-badge" style={{ backgroundColor: estado.bg, color: estado.color }}>
                    {estado.label}
                  </span>
                </div>
                <div className="producto-card-body">
                  <div className="producto-cat">{p.categoria}</div>
                  <h3 className="producto-nombre">{p.nombre}</h3>
                  <div className="producto-precio">₡{p.precio.toLocaleString("es-CR", { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="producto-card-footer">
                  <button className="btn-outline">Detalles</button>
                  {p.stock === 0 ? (
                    <button className="btn-primary" style={{ backgroundColor: "#C43D3D" }} onClick={() => handleReabastecer(p.id)}>
                      Reabastecer
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ backgroundColor: "#006194" }}>
                      Solicitar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-dim)" }}>
        * Precios en colones costarricenses (CRC).
      </div>
    </div>
  );
}
