import React, { useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";

const SERVICIOS = [
  { id: 1, categoria: "Diagnóstico", nombre: "Diagnóstico Preliminar - TV/Monitor", codigo: "SRV-DIAG-TV", precio: 15.00, duracion: "30 min", tipo: "MO" },
  { id: 2, categoria: "Diagnóstico", nombre: "Diagnóstico Preliminar - Laptop/PC", codigo: "SRV-DIAG-PC", precio: 12.00, duracion: "45 min", tipo: "MO" },
  { id: 3, categoria: "Diagnóstico", nombre: "Diagnóstico Avanzado con Osciloscopio", codigo: "SRV-DIAG-OSC", precio: 25.00, duracion: "60 min", tipo: "MO" },
  { id: 4, categoria: "Reparación", nombre: "Reparación de Fuente de Poder", codigo: "SRV-REP-FP", precio: 35.00, duracion: "90 min", tipo: "MO" },
  { id: 5, categoria: "Reparación", nombre: "Reballing / Reflow GPU/BGA", codigo: "SRV-REP-BGA", precio: 55.00, duracion: "120 min", tipo: "MO" },
  { id: 6, categoria: "Reparación", nombre: "Sustitución de Display / Pantalla", codigo: "SRV-REP-DISP", precio: 30.00, duracion: "60 min", tipo: "MO" },
  { id: 7, categoria: "Reparación", nombre: "Reparación Placa Main Board", codigo: "SRV-REP-MB", precio: 45.00, duracion: "120 min", tipo: "MO" },
  { id: 8, categoria: "Reparación", nombre: "Cambio de Conector de Carga", codigo: "SRV-REP-CARG", precio: 20.00, duracion: "45 min", tipo: "MO" },
  { id: 9, categoria: "Mantenimiento", nombre: "Mantenimiento Preventivo General", codigo: "SRV-MANT-GEN", precio: 18.00, duracion: "45 min", tipo: "MO" },
  { id: 10, categoria: "Mantenimiento", nombre: "Limpieza Interna + Pasta Térmica", codigo: "SRV-MANT-LIMP", precio: 22.00, duracion: "60 min", tipo: "MO" },
  { id: 11, categoria: "Mantenimiento", nombre: "Actualización Firmware / Software", codigo: "SRV-MANT-FW", precio: 10.00, duracion: "30 min", tipo: "MO" },
  { id: 12, categoria: "Instalación", nombre: "Instalación de Pantalla en Pared", codigo: "SRV-INST-PAR", precio: 25.00, duracion: "60 min", tipo: "MO" },
];

const CATEGORIAS_SRV = ["Todos", "Diagnóstico", "Reparación", "Mantenimiento", "Instalación"];

export default function ServiciosView() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const serviciosFiltrados = SERVICIOS.filter(s => {
    const matchBusqueda = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || s.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaActiva === "Todos" || s.categoria === categoriaActiva;
    return matchBusqueda && matchCategoria;
  });

  const totalServicios = SERVICIOS.length;
  const precioPromedio = (SERVICIOS.reduce((a, s) => a + s.precio, 0) / totalServicios).toFixed(2);

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <span>Principal</span><span>/</span>
        <span className="breadcrumb-current">Servicios</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
            🔧 Catálogo de Servicios Técnicos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Tarifas de mano de obra (MO), diagnóstico preliminar y mantenimientos preventivos.
          </p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaPlus size={12} /> Agregar Servicio
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Servicios", valor: totalServicios, icon: "🔧", color: "#0088cc" },
          { label: "Diagnósticos", valor: SERVICIOS.filter(s => s.categoria === "Diagnóstico").length, icon: "🔍", color: "#8b5cf6" },
          { label: "Reparaciones", valor: SERVICIOS.filter(s => s.categoria === "Reparación").length, icon: "🛠️", color: "#f59e0b" },
          { label: "Precio Promedio", valor: "₡" + precioPromedio, icon: "💵", color: "#22c55e" }
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

      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={13} />
          <input
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIAS_SRV.map(cat => (
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
              {["Código", "Servicio", "Categoría", "Tipo", "Duración Est.", "Tarifa MO"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,136,204,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#0088cc" }}>{s.codigo}</td>
                <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-color)" }}>{s.nombre}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                    {s.categoria}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: "rgba(0,136,204,0.1)", color: "#0088cc" }}>
                    {s.tipo}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "13px" }}>⏱ {s.duracion}</td>
                <td style={{ padding: "12px 16px", color: "#22c55e", fontWeight: 700 }}>₡{s.precio.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {serviciosFiltrados.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            No se encontraron servicios con los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
}
