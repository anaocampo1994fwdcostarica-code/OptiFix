import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import Icono from "../components/icons.jsx";
import { getEstadoBadge } from "../utils/estadoColors.js";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "../hooks/useExchangeRate.js";
import "./DashboardView.css";

const money = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

function formatDate() {
  return new Intl.DateTimeFormat("es-CR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date()).replace(/^./, (letter) => letter.toUpperCase());
}

export default function DashboardView() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { ordenes, clientes, equipos, cotizaciones } = useWorkshop();
  const [filter, setFilter] = useState("Todas");
  const exchangeRate = useExchangeRate();

  const stats = useMemo(() => {
    const active = ordenes.filter((o) => o.estado_actual !== "ENTREGADO");
    const recepcion = active.filter((o) => getEstadoBadge(o).label === "Recepción");
    const banco = active.filter((o) => getEstadoBadge(o).label === "En trámite");
    const listo = ordenes.filter((o) => getEstadoBadge(o).label === "Entregado");
    const total = active.reduce((sum, o) => sum + (o.productos_servicios || []).reduce((s, item) => s + (Number(item.cantidad) || 1) * (Number(item.importe) || 0), 0), 0);
    return { active, recepcion, banco, listo, total };
  }, [ordenes]);

  const visibleOrders = stats.active.filter((o) => filter === "Todas" || (filter === "Recepción" ? getEstadoBadge(o).label === "Recepción" : getEstadoBadge(o).label === "Entregado")).slice(0, 5);
  const pendingQuotes = cotizaciones.filter((quote) => quote.estado === "PENDIENTE").length;
  const agenda = stats.active.slice(0, 4);

  const moneyForLanguage = new Intl.NumberFormat(i18n.language === "en" ? "en-US" : "es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });
  const today = new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "es-CR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return <div className="dashboard page-container">
    <section className="dashboard-hero">
      <div>
        <div className="dashboard-status"><span /> {t("dashboard.operational")} <time>{today}</time></div>
        <h1>{t("page.dashboard")}</h1>
        <p>{t("dashboard.monitoring")}</p>
      </div>
    </section>

    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between dashboard-exchange-rate" role="status">
      <div><p className="text-xs text-slate-400 font-medium uppercase">Tipo de cambio referencial</p><p className="text-lg font-bold text-slate-800">{exchangeRate.loading ? "Cargando…" : exchangeRate.rate ? `1 USD ≈ ₡${Number(exchangeRate.rate).toFixed(2)}` : "No disponible"}</p><small>{exchangeRate.source}</small></div>
      <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">💱</span>
    </div>

    <section className="dashboard-kpis">
      <Kpi icon="wrench" tone="blue" label={t("dashboard.ordersInWorkshop")} value={stats.active.length} detail={`${stats.recepcion.length} ${t("dashboard.inReception")} · ${stats.banco.length} ${t("dashboard.inBench")}`} />
      <Kpi icon="barchart" tone="green" label={t("dashboard.estimatedBilling")} value={moneyForLanguage.format(stats.total)} detail={t("dashboard.openOrderProducts")} />
      <Kpi icon="calendar-check" tone="purple" label={t("dashboard.technicalAgenda")} value={agenda.length} detail={t("dashboard.pendingFollowups")} />
      <Kpi icon="box" tone="orange" label={t("dashboard.pendingQuotes")} value={pendingQuotes} detail={t("dashboard.customerConfirmation")} />
    </section>

    <section className="dashboard-grid">
      <article className="dashboard-card orders-card">
        <div className="card-heading"><div><h2>Órdenes de trabajo activas</h2><p>Seguimiento en tiempo real por puesto de reparación</p></div><div className="dashboard-tabs">{[["Todas", stats.active.length], ["Recepción", stats.recepcion.length], ["Listas", stats.listo.length]].map(([name, count]) => <button key={name} className={filter === name ? "active" : ""} onClick={() => setFilter(name)}>{name} ({count})</button>)}</div></div>
        <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>OT / Fecha</th><th>Equipo y falla</th><th>Cliente</th><th>Estado</th><th /></tr></thead><tbody>{visibleOrders.map((order) => {
          const equipment = equipos.find((item) => item.id === order.equipo_id); const client = clientes.find((item) => item.id === order.cliente_id); const badge = getEstadoBadge(order);
          return <tr key={order.id} onClick={() => navigate(`/ordenes/${order.numero}`)}><td><strong>#{order.numero}</strong><small>{order.fecha_ingreso}</small></td><td><b>{equipment ? `${equipment.marca} ${equipment.modelo}` : "Equipo sin registro"}</b><small>{order.trabajo_solicitado}</small></td><td><b>{client?.nombre || "Cliente sin registro"}</b><small>{client?.telefono || "Sin teléfono"}</small></td><td><span className="order-status" style={{ backgroundColor: badge.bg }}>{badge.label}</span></td><td><Icono nombre="arrow-right" size={16} /></td></tr>;
        })}</tbody></table></div>
        <Link className="dashboard-link" to="/ordenes">Ver todas las órdenes de trabajo en cola →</Link>
      </article>

      <aside className="dashboard-side">
        <article className="dashboard-card agenda-card"><div className="card-heading"><div><h2><Icono nombre="calendar" size={17} /> Agenda técnica</h2><p>Prioridades actuales del taller</p></div><span className="count-pill">{agenda.length}</span></div><div className="agenda-list">{agenda.map((order, index) => { const client = clientes.find((item) => item.id === order.cliente_id); return <button key={order.id} onClick={() => navigate(`/ordenes/${order.numero}`)}><time>{String(9 + index * 2).padStart(2, "0")}:30</time><span><b>{client?.nombre || "Cliente"}</b><small>OT #{order.numero} · {order.trabajo_solicitado}</small></span><i /></button>; })}</div><Link to="/agenda" className="agenda-action">Abrir agenda completa</Link></article>
      </aside>
    </section>

    <section className="quick-links">
      <QuickLink to="/clientes" icon="users" title="Clientes y fichas" text={`${clientes.length} registros con historial de servicio`} />
      <QuickLink to="/equipos" icon="laptop" title="Equipos registrados" text={`${equipos.length} equipos trazables por serie`} />
      <QuickLink to="/cotizaciones" icon="clipboard" title="Cotizaciones" text={`${pendingQuotes} presupuestos en espera de aprobación`} />
    </section>
  </div>;
}

function Kpi({ icon, tone, label, value, detail }) { return <article className="kpi-new"><div><p>{label}</p><strong>{value}</strong></div><span className={`kpi-symbol ${tone}`}><Icono nombre={icon} size={21} /></span><small>{detail}</small></article>; }
function QuickLink({ to, icon, title, text }) { return <Link to={to} className="quick-link"><span><Icono nombre={icon} size={21} /></span><div><b>{title}</b><small>{text}</small></div><Icono nombre="arrow-right" size={16} /></Link>; }
