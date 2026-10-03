import React from "react";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useTranslation } from "react-i18next";

const COLORS_PIE = ["#a3e635", "#0ea5e9", "#eab308", "#22c55e", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0c1b2c",
        border: "1px solid #17324f",
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "12px",
        color: "#ffffff"
      }}>
        <strong>{label || payload[0]?.name}</strong>
        <div style={{ color: "var(--accent-cyan)", marginTop: "2px" }}>
          {payload[0]?.value} {typeof payload[0]?.value === "number" && payload[0]?.name === "Facturado" ? "" : ` ${t("stats.orders")}`}
        </div>
      </div>
    );
  }
  return null;
};

export default function EstadisticasView() {
  const { t, i18n } = useTranslation();
  const { ordenes, clientes, equipos, resetToSeedData } = useWorkshop();

  // ── Cálculos dinámicos ──────────────────────────────────────────────────────
  const totalOrdenes = ordenes.length;
  const enRecepcion  = ordenes.filter((o) => o.estado_actual === "RECEPCIÓN" || (o.etapa_categoria === "ENTRADA" && o.estado_actual !== "ENTREGADO")).length;
  const enTramite    = ordenes.filter((o) => o.estado_actual?.includes("PRESUPUESTO") || o.estado_actual === "REPARADO").length;
  const enTaller     = ordenes.filter((o) => o.etapa_categoria === "TALLER" || o.estado_actual === "TALLER").length;
  const entregadas   = ordenes.filter((o) => o.estado_actual === "ENTREGADO").length;
  const enBodega     = ordenes.filter((o) => o.etapa_categoria === "BODEGA" && !o.estado_actual?.includes("PRESUPUESTO")).length;

  const totalFacturado = ordenes.reduce((acc, o) => {
    const sub = (o.productos_servicios || []).reduce((s, it) =>
      s + (Number(it.cantidad) || 1) * (Number(it.importe) || 0), 0
    );
    return acc + sub;
  }, 0);

  // Datos para gráficas
  const pieData = [
    { name: t("stats.inReception"), value: enRecepcion },
    { name: t("stats.inProgress"), value: enTramite },
    { name: t("stats.inWorkshop"), value: enTaller },
    { name: t("stats.warehouse"), value: enBodega },
    { name: t("stats.delivered"), value: entregadas }
  ].filter((d) => d.value > 0);

  const barData = [
    { name: t("stats.inReception"), ordenes: enRecepcion },
    { name: t("stats.inProgress"), ordenes: enTramite },
    { name: t("stats.inWorkshop"), ordenes: enTaller },
    { name: t("stats.warehouse"), ordenes: enBodega },
    { name: t("stats.delivered"), ordenes: entregadas }
  ];

  // Equipos por tipo
  const tipoCounts = equipos.reduce((acc, eq) => {
    acc[eq.tipo] = (acc[eq.tipo] || 0) + 1;
    return acc;
  }, {});

  const tipoBarData = Object.entries(tipoCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="breadcrumb-nav">
        <span>{t("common.home")}</span><span>/</span>
        <span>{t("stats.serviceCenter")}</span><span>/</span>
        <span className="breadcrumb-current">{t("nav.statistics")}</span>
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px"
      }}>
        <div>
          <h1 style={{ fontSize: "22px", color: "#0f172a", fontWeight: 700, marginBottom: "4px" }}>
            {t("stats.title")}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            {t("stats.subtitle")}
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => {
            if (window.confirm(t("stats.restoreConfirm"))) resetToSeedData();
          }}
        >
          <span>{t("stats.restore")}</span>
        </button>
      </div>

      {/* KPIs superiores */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        {[
          { label: t("stats.totalOrders"), value: totalOrdenes,  icon: "wrench", color: "#0ea5e9" },
          { label: t("stats.inReception"), value: enRecepcion, icon: "clock", color: "#a3e635" },
          { label: t("stats.inProgress"), value: enTramite, icon: "refresh-cw", color: "#eab308" },
          { label: t("stats.inWorkshop"), value: enTaller, icon: "laptop", color: "#8b5cf6" },
          { label: t("stats.delivered"), value: entregadas, icon: "check-circle",color: "#22c55e" },
          { label: t("stats.clients"), value: clientes.length, icon: "users", color: "#f97316" }
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-content">
              <h4 style={{ fontSize: "11px" }}>{kpi.label}</h4>
              <div className="kpi-value" style={{ fontSize: "22px" }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Facturación Estimada */}
      <div style={{
        background: "linear-gradient(135deg, #0c3060 0%, #0c1b2c 100%)",
        border: "1px solid #17324f",
        borderRadius: "10px",
        padding: "20px 28px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
            {t("stats.estimatedBilling")}
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--accent-cyan)" }}>
            ₡ {totalFacturado.toLocaleString(i18n.language === "en" ? "en-US" : "es-CR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
            {t("stats.registeredEquipment")}
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff" }}>
            {equipos.length}
          </div>
        </div>
      </div>

      {/* Gráficas lado a lado */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {/* Bar chart: Órdenes por estado */}
        <section className="work-order-meta-card" role="group" aria-label={t("stats.operationalDistribution")}>
          <h3 style={{ fontSize: "14px", color: "#ffffff", marginBottom: "18px" }}>
            {t("stats.operationalDistribution")}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#17324f" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ordenes" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} stroke="#0f172a" strokeWidth={i % 2 ? 2 : 1} strokeDasharray={i % 2 ? "5 2" : undefined} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ul className="sr-only">{barData.map((item) => <li key={item.name}>{item.name}: {item.ordenes} {t("stats.orders")}</li>)}</ul>
        </section>

        {/* Pie chart */}
        <section className="work-order-meta-card" role="group" aria-label={t("stats.statusRatio")}>
          <h3 style={{ fontSize: "14px", color: "#ffffff", marginBottom: "18px" }}>
            {t("stats.statusRatio")}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} stroke="#0f172a" strokeWidth={2} strokeDasharray={i % 2 ? "4 2" : undefined} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: "11px", color: "#94a3b8" }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="sr-only">{pieData.map((item) => <li key={item.name}>{item.name}: {item.value} {t("stats.orders")}</li>)}</ul>
        </section>
      </div>

      {/* Bar chart: Tipos de equipo */}
      <section className="work-order-meta-card" role="group" aria-label={t("stats.equipmentByType")}>
        <h3 style={{ fontSize: "14px", color: "#ffffff", marginBottom: "18px" }}>
          {t("stats.equipmentByType")}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tipoBarData} layout="vertical" margin={{ top: 0, right: 16, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#17324f" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
        <ul className="sr-only">{tipoBarData.map((item) => <li key={item.name}>{item.name}: {item.value}</li>)}</ul>
      </section>
    </div>
  );
}
