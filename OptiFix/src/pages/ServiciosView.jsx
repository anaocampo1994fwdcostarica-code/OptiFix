import React, { useMemo, useState } from "react";
import Icono from "../components/icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import "./ServiciosView.css";
import { useTranslation } from "react-i18next";

const SEED_SERVICIOS = [
  { id: 1, categoria: "Diagnóstico", nombre: "Diagnóstico Preliminar - TV/Monitor", codigo: "SRV-DIAG-TV", precio: 15.00, duracion: "30 min", tipo: "MO" },
  { id: 2, categoria: "Diagnóstico", nombre: "Diagnóstico Preliminar - Laptop/PC", codigo: "SRV-DIAG-PC", precio: 12.00, duracion: "45 min", tipo: "MO" },
  { id: 3, categoria: "Diagnóstico", nombre: "Diagnóstico Avanzado con Osciloscopio", codigo: "SRV-DIAG-OSC", precio: 25.00, duracion: "60 min", tipo: "MO" },
  { id: 4, categoria: "Reparación", nombre: "Reparación de Fuente de Poder", codigo: "SRV-REP-FP", precio: 35.00, duracion: "90 min", tipo: "MO" },
  { id: 5, categoria: "Reparación", nombre: "Reballing / Microsoldadura SMD", codigo: "SRV-REP-MB", precio: 55.00, duracion: "120 min", tipo: "MO" },
  { id: 6, categoria: "Mantenimiento", nombre: "Mantenimiento Térmico y Limpieza Ultrasónica", codigo: "SRV-MNT-CL", precio: 18.00, duracion: "40 min", tipo: "MO" },
  { id: 7, categoria: "Reparación", nombre: "Sustitución de Display / Pantalla", codigo: "SRV-REP-DISP", precio: 30.00, duracion: "60 min", tipo: "MO" },
  { id: 8, categoria: "Reparación", nombre: "Cambio de Conector de Carga", codigo: "SRV-REP-CARG", precio: 20.00, duracion: "45 min", tipo: "MO" },
  { id: 9, categoria: "Mantenimiento", nombre: "Mantenimiento Preventivo General", codigo: "SRV-MANT-GEN", precio: 18.00, duracion: "45 min", tipo: "MO" },
  { id: 10, categoria: "Mantenimiento", nombre: "Actualización Firmware / Software", codigo: "SRV-MANT-FW", precio: 10.00, duracion: "30 min", tipo: "MO" },
  { id: 11, categoria: "Instalación", nombre: "Instalación de Pantalla en Pared", codigo: "SRV-INST-PAR", precio: 25.00, duracion: "60 min", tipo: "MO" },
  { id: 12, categoria: "Reparación", nombre: "Reparación Placa Main Board", codigo: "SRV-REP-MB2", precio: 45.00, duracion: "120 min", tipo: "MO" },
];

const CATEGORIAS_SRV = ["Todos", "Diagnóstico", "Reparación", "Mantenimiento", "Instalación"];
const PAGE_SIZE = 6;

const vacio = () => ({ nombre: "", codigo: "", categoria: "Diagnóstico", duracion: "", precio: "", tipo: "MO" });

function estiloCategoria(categoria) {
  if (categoria === "Mantenimiento") return { background: "rgba(0, 135, 58, .12)", color: "#146c43" };
  return { background: "rgba(0, 97, 148, .1)", color: "#006194" };
}

export default function ServiciosView() {
  const { t, i18n } = useTranslation();
  const categoryLabel = (category) => ({ "Todos": t("common.all"), "Diagnóstico": t("services.diagnosis"), "Reparación": t("services.repair"), "Mantenimiento": t("services.maintenance"), "Instalación": t("services.installation") }[category] || category);
  const { servicios, addServicio, updateServicio, deleteServicio } = useWorkshop();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [page, setPage] = useState(1);
  const [formAbierto, setFormAbierto] = useState(false);
  const [formData, setFormData] = useState(vacio());

  const filtrados = useMemo(() => {
    return servicios.filter(s => {
      const matchB = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || s.codigo.toLowerCase().includes(busqueda.toLowerCase());
      const matchC = categoriaActiva === "Todos" || s.categoria === categoriaActiva;
      return matchB && matchC;
    });
  }, [servicios, busqueda, categoriaActiva]);

  const paginados = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtrados.length / PAGE_SIZE) || 1;

  const handleEdit = (srv) => {
    setFormData(srv);
    setFormAbierto(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("services.deleteConfirm"))) {
      await deleteServicio(id);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.codigo) return;
    if (formData.id) {
      await updateServicio(formData.id, formData);
    } else {
      await addServicio(formData);
    }
    setFormAbierto(false);
    setFormData(vacio());
  };

  const activeCount = servicios.length;
  const totalValue = servicios.reduce((acc, s) => acc + s.precio, 0);

  return (
    <div className="page-container">
      <div className="breadcrumb-nav">
        <span>{t("common.home")}</span>
        <span>/</span>
        <span>{t("common.administration")}</span>
        <span>/</span>
        <span className="breadcrumb-current">{t("services.catalog")}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", color: "var(--text-heading)", fontWeight: 700, margin: 0, background: "transparent" }}>{t("services.title")}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            {t("services.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-primary" style={{ backgroundColor: "#006194" }} onClick={() => { setFormData(vacio()); setFormAbierto(true); }}>
            + {t("services.new")}
          </button>
        </div>
      </div>

      <div className="servicios-kpi-row">
        <div className="servicios-kpi-card">
          <div>
            <div className="servicios-kpi-label">{t("services.active")}</div>
            <div className="servicios-kpi-value">{activeCount}</div>
          </div>
          <div className="servicios-kpi-icon"><Icono nombre="clipboard" /></div>
        </div>
        <div className="servicios-kpi-card">
          <div>
            <div className="servicios-kpi-label">{t("services.categories")}</div>
            <div className="servicios-kpi-value">{CATEGORIAS_SRV.length - 1}</div>
          </div>
          <div className="servicios-kpi-icon"><Icono nombre="tag" /></div>
        </div>
        <div className="servicios-kpi-card">
          <div>
            <div className="servicios-kpi-label">{t("services.average")}</div>
            <div className="servicios-kpi-value">₡{(totalValue / (activeCount || 1)).toLocaleString(i18n.language === "en" ? "en-US" : "es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="servicios-kpi-icon"><Icono nombre="dollar-sign" /></div>
        </div>
      </div>

      {formAbierto && (
        <div className="table-card" style={{ marginBottom: "20px", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", color: "var(--text-heading)", fontSize: "16px" }}>{formData.id ? t("services.edit") : t("services.new")}</h3>
          <div className="servicios-form-grid">
            <label>{t("common.code")} <input value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} placeholder="SRV-..." /></label>
            <label>{t("common.name")} <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} /></label>
            <label>{t("common.category")}
              <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                {CATEGORIAS_SRV.slice(1).map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
              </select>
            </label>
            <label>{t("common.duration")} <input value={formData.duracion} onChange={e => setFormData({...formData, duracion: e.target.value})} placeholder={t("services.exampleDuration")} /></label>
            <label>{t("services.price")} <input type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: Number(e.target.value)})} /></label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button className="btn-secondary" onClick={() => { setFormAbierto(false); setFormData(vacio()); }}>{t("common.cancel")}</button>
            <button className="btn-primary" style={{ backgroundColor: "#006194" }} onClick={handleSave}>{t("common.save")}</button>
          </div>
        </div>
      )}

      <div className="servicios-toolbar">
        <div className="servicios-search">
          <Icono nombre="search" size={14} />
          <input
            type="text"
            placeholder={t("services.search")}
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="servicios-tabs">
          {CATEGORIAS_SRV.map(cat => (
            <button 
              key={cat} 
              className={categoriaActiva === cat ? "active" : ""} 
              onClick={() => { setCategoriaActiva(cat); setPage(1); }}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <table className="gestioo-table">
          <thead>
            <tr>
              <th>{t("common.code")}</th>
              <th>{t("services.serviceName")}</th>
              <th>{t("common.category")}</th>
              <th>{t("common.duration")}</th>
              <th style={{ textAlign: "right" }}>{t("services.rate")}</th>
              <th style={{ textAlign: "center" }}>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
                  {t("services.empty")}
                </td>
              </tr>
            ) : (
              paginados.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: "12px" }}>{s.codigo}</td>
                  <td style={{ color: "var(--text-heading)", fontWeight: 500 }}>{s.nombre}</td>
                  <td>
                    <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, ...estiloCategoria(s.categoria) }}>
                      {categoryLabel(s.categoria)}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{s.duracion}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-heading)" }}>
                    ₡{s.precio.toLocaleString(i18n.language === "en" ? "en-US" : "es-CR", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button className="btn-outline-icon" onClick={() => handleEdit(s)} title={t("common.edit")}><Icono nombre="edit" size={14}/></button>
                      <button className="btn-outline-icon" onClick={() => handleDelete(s.id)} title={t("common.delete")}><Icono nombre="trash" size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-muted)" }}>
            <span>{t("services.showing", { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtrados.length), total: filtrados.length })}</span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "#fff", cursor: "pointer" }}>{t("common.previous")}</button>
              <div style={{ background: "#006194", color: "#fff", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontWeight: 700 }}>{page}</div>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "#fff", cursor: "pointer" }}>{t("common.next")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
